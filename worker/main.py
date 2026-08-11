from fastapi import FastAPI
from contextlib import asynccontextmanager
import asyncio
from worker import worker_loop

# Store the background task so we can cancel it on shutdown if needed
background_tasks = set()

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Start the background worker loop
    print("Starting up FastAPI application...")
    loop = asyncio.get_event_loop()
    task = loop.create_task(worker_loop())
    background_tasks.add(task)
    task.add_done_callback(background_tasks.discard)
    
    yield
    
    # Shutdown: Cancel the worker loop
    print("Shutting down FastAPI application...")
    for task in background_tasks:
        task.cancel()

app = FastAPI(lifespan=lifespan)

@app.get("/health")
async def health_check():
    """Simple health check endpoint for monitoring."""
    return {"status": "ok", "service": "design-agent-worker"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
