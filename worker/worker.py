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
        operations = await generate_design_operations(prompt, current_state)
        
        # 4. Apply to Liveblocks
        if not operations:
            await update_status(run_id, "error", "Failed to generate design operations.")
            return
            
        await update_status(run_id, "applying", "Applying design to canvas...")
        
        # We broadcast the design as an event instead of raw CRDT mutation to keep things stable
        # The frontend will listen to 'ai-design-update' and add the nodes to the React Flow instance
        await liveblocks.broadcast_event(room_id, operations)
        
        # 5. Mark complete
        await update_status(run_id, "complete", "Design generated successfully!")
        
    except Exception as e:
        print(f"Error processing job {run_id}: {e}")
        await update_status(run_id, "error", f"An error occurred: {str(e)}")


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
