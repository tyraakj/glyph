import asyncio
import json
import time
from upstash_redis.asyncio import Redis
from config import UPSTASH_REDIS_REST_URL, UPSTASH_REDIS_REST_TOKEN
from liveblocks_client import liveblocks
from agent import generate_design_operations, generate_spec

redis = Redis(url=UPSTASH_REDIS_REST_URL, token=UPSTASH_REDIS_REST_TOKEN)
QUEUE_NAME = "design:queue"
SPEC_QUEUE_NAME = "spec:queue"

async def update_status(run_id: str, status: str, message: str):
    """Update the status of a job in Redis so the Next.js SSE endpoint can push it to the user."""
    key = f"design:status:{run_id}"
    payload = {
        "status": status,
        "message": message,
        "timestamp": int(time.time() * 1000)
    }
    # Keep status for 1 hour to prevent memory leaks
    await redis.setex(key, 3600, json.dumps(payload))
    print(f"[{run_id}] Status -> {status}: {message}")

async def process_job(job_data: dict):
    run_id = job_data.get("runId")
    prompt = job_data.get("prompt")
    room_id = job_data.get("roomId")
    api_key = job_data.get("apiKey")
    chat_history = job_data.get("chatHistory", [])
    
    if not all([run_id, prompt, room_id]):
        print(f"Invalid job payload: {job_data}")
        return

    try:
        # 1. Mark as processing
        await update_status(run_id, "processing", "AI is analyzing your design request...")
        
        # 2. Fetch current canvas state to give Gemini context (optional but highly recommended)
        # Using a simple empty dict if storage doesn't exist
        current_state = await liveblocks.get_storage(room_id)
        
        # 3. Call Gemini to generate the UI mutations
        await update_status(run_id, "generating", "Generating layout components...")
        result = await generate_design_operations(prompt, current_state, api_key=api_key, chat_history=chat_history)
        operations = result.get("operations", [])
        ai_message = result.get("message", "I've completed the design updates on the canvas! Check out the changes.")
        
        # 4. Apply to Liveblocks (even if operations is empty, we still broadcast the message)
        await update_status(run_id, "applying", "Applying design to canvas...")
        
        # We broadcast the design as an event instead of raw CRDT mutation to keep things stable
        # The frontend will listen to 'ai-design-update' and add the nodes to the React Flow instance
        await liveblocks.broadcast_event(room_id, {
            "type": "ai-design-update",
            "operations": operations
        })
        
        # 5. Mark complete
        await update_status(run_id, "complete", ai_message)
        
    except Exception as e:
        error_str = str(e)
        print(f"Error processing job {run_id}: {error_str}")
        
        # Format user-friendly error messages
        if "429" in error_str or "RESOURCE_EXHAUSTED" in error_str or "Quota exceeded" in error_str:
            user_msg = "I've hit my usage limits for now! Please wait a few minutes before trying again."
        elif "400" in error_str:
            user_msg = "I couldn't quite understand that request. Could you try rephrasing?"
        elif "503" in error_str or "500" in error_str:
            user_msg = "The AI service is temporarily unavailable. Please try again later."
        else:
            user_msg = "An unexpected error occurred while trying to process your request."
            
        await update_status(run_id, "error", user_msg)

async def update_spec_status(run_id: str, status: str, message: str, spec_content: str = None):
    """Update the status of a spec job in Redis."""
    key = f"spec:status:{run_id}"
    payload = {
        "status": status,
        "message": message,
        "timestamp": int(time.time() * 1000)
    }
    if spec_content:
        payload["specContent"] = spec_content
        
    await redis.setex(key, 3600, json.dumps(payload))
    print(f"[SPEC {run_id}] Status -> {status}: {message}")

async def process_spec_job(job_data: dict):
    run_id = job_data.get("runId")
    room_id = job_data.get("roomId")
    chat_history = job_data.get("chatHistory", [])
    nodes = job_data.get("nodes", [])
    edges = job_data.get("edges", [])
    api_key = job_data.get("apiKey")
    
    if not run_id or not room_id:
        print(f"Invalid spec job payload: {job_data}")
        return

    try:
        await update_spec_status(run_id, "processing", "Analyzing your canvas and chat history...")
        
        await update_spec_status(run_id, "generating", "Drafting your PRD...")
        spec_content = await generate_spec(chat_history, nodes, edges, api_key=api_key)
        
        # Save the spec via the internal Next.js API
        await update_spec_status(run_id, "saving", "Saving specification to cloud storage...")
        import httpx
        from config import NEXT_PUBLIC_APP_URL, LIVEBLOCKS_SECRET_KEY
        
        # Extract projectId from roomId (e.g. project1-1234 -> project1)
        project_id = room_id.split('-')[0]
        filename = f"spec-{run_id}.md"
        
        try:
            async with httpx.AsyncClient() as client:
                resp = await client.post(
                    f"{NEXT_PUBLIC_APP_URL}/api/internal/specs",
                    headers={"Authorization": f"Bearer {LIVEBLOCKS_SECRET_KEY}"},
                    json={
                        "projectId": project_id,
                        "content": spec_content,
                        "filename": filename
                    }
                )
                if resp.status_code != 200:
                    print(f"Failed to save spec to internal API: {resp.status_code} - {resp.text}")
                    # We still complete the run so the UI gets the content, even if saving failed
        except Exception as save_err:
            print(f"Error calling internal API: {save_err}")

        await update_spec_status(run_id, "complete", "Spec generation complete!", spec_content=spec_content)
        
    except Exception as e:
        error_str = str(e)
        print(f"Error processing spec job {run_id}: {error_str}")
        
        if "429" in error_str or "RESOURCE_EXHAUSTED" in error_str or "Quota exceeded" in error_str:
            user_msg = "I've hit my usage limits for now! Please wait a few minutes before trying again."
        elif "503" in error_str or "500" in error_str:
            user_msg = "The AI service is temporarily unavailable. Please try again later."
        else:
            user_msg = "An unexpected error occurred while trying to process your request."
            
        await update_spec_status(run_id, "error", user_msg)

async def update_critique_status(run_id: str, status: str, message: str, findings: list = None, summary: str = None):
    """Update the status of a critique job in Redis."""
    key = f"critique:status:{run_id}"
    payload = {
        "status": status,
        "message": message,
        "timestamp": int(time.time() * 1000)
    }
    if findings is not None:
        payload["findings"] = findings
    if summary is not None:
        payload["summary"] = summary
        
    await redis.setex(key, 3600, json.dumps(payload))
    print(f"[CRITIQUE {run_id}] Status -> {status}: {message}")

async def process_critique_job(job_data: dict):
    run_id = job_data.get("runId")
    room_id = job_data.get("roomId")
    nodes = job_data.get("nodes", [])
    edges = job_data.get("edges", [])
    api_key = job_data.get("apiKey")
    
    if not run_id or not room_id:
        print(f"Invalid critique job payload: {job_data}")
        return

    try:
        from agent import generate_critique
        
        await update_critique_status(run_id, "processing", "Analyzing architecture for best practices...")
        
        await update_critique_status(run_id, "generating", "Identifying issues and improvements...")
        critique_result = await generate_critique(nodes, edges, api_key=api_key)
        
        await update_critique_status(run_id, "complete", "Critique complete!", findings=critique_result.get("findings", []), summary=critique_result.get("summary", ""))
        
    except Exception as e:
        error_str = str(e)
        print(f"Error processing critique job {run_id}: {error_str}")
        
        if "429" in error_str or "RESOURCE_EXHAUSTED" in error_str or "Quota exceeded" in error_str:
            user_msg = "I've hit my usage limits for now! Please wait a few minutes before trying again."
        elif "503" in error_str or "500" in error_str:
            user_msg = "The AI service is temporarily unavailable. Please try again later."
        else:
            user_msg = "An unexpected error occurred while trying to process your request."
            
        await update_critique_status(run_id, "error", user_msg)

async def worker_loop():
    """Continuously poll the Upstash Redis queue for new jobs."""
    CRITIQUE_QUEUE_NAME = "critique:queue"
    print(f"Worker started. Listening on queues: {QUEUE_NAME}, {SPEC_QUEUE_NAME}, {CRITIQUE_QUEUE_NAME}")
    while True:
        try:
            # Poll design queue
            job_json = await redis.rpop(QUEUE_NAME)
            if job_json:
                job_data = json.loads(job_json) if isinstance(job_json, str) else job_json
                print(f"Picked up design job: {job_data.get('runId')}")
                await process_job(job_data)
                continue
                
            # Poll spec queue
            spec_json = await redis.rpop(SPEC_QUEUE_NAME)
            if spec_json:
                spec_data = json.loads(spec_json) if isinstance(spec_json, str) else spec_json
                print(f"Picked up spec job: {spec_data.get('runId')}")
                await process_spec_job(spec_data)
                continue
                
            # Poll critique queue
            critique_json = await redis.rpop(CRITIQUE_QUEUE_NAME)
            if critique_json:
                critique_data = json.loads(critique_json) if isinstance(critique_json, str) else critique_json
                print(f"Picked up critique job: {critique_data.get('runId')}")
                await process_critique_job(critique_data)
                continue

            # No jobs, sleep to prevent spamming the REST API
            await asyncio.sleep(2.0)
        except Exception as e:
            print(f"Worker loop error: {e}")
            await asyncio.sleep(5.0)
