import asyncio
import json
import time
from upstash_redis.asyncio import Redis
from config import UPSTASH_REDIS_REST_URL, UPSTASH_REDIS_REST_TOKEN
from liveblocks_client import liveblocks
from agent import generate_design_operations

redis = Redis(url=UPSTASH_REDIS_REST_URL, token=UPSTASH_REDIS_REST_TOKEN)
QUEUE_NAME = "design:queue"

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
        result = await generate_design_operations(prompt, current_state)
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


async def worker_loop():
    """Continuously poll the Upstash Redis queue for new jobs."""
    print(f"Worker started. Listening on queue: {QUEUE_NAME}")
    while True:
        try:
            # Using RPOP to get the oldest job from the list
            job_json = await redis.rpop(QUEUE_NAME)
            if job_json:
                # job_json is returned as a dict by upstash-redis if it was saved as JSON
                if isinstance(job_json, str):
                    job_data = json.loads(job_json)
                else:
                    job_data = job_json
                    
                print(f"Picked up job: {job_data.get('runId')}")
                
                # In a production app, we would use asyncio.create_task to run this concurrently,
                # but for simplicity we'll await it here.
                await process_job(job_data)
            else:
                # No jobs, sleep to prevent spamming the REST API
                await asyncio.sleep(2.0)
        except Exception as e:
            print(f"Worker loop error: {e}")
            await asyncio.sleep(5.0)
