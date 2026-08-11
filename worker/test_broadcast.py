import asyncio
import httpx
import os
import sys

# Load env from parent
from pathlib import Path
from dotenv import load_dotenv
load_dotenv(Path(__file__).parent / ".." / ".env")

LB_SECRET = os.getenv("LIVEBLOCKS_SECRET_KEY", "")
BASE_URL = "https://api.liveblocks.io/v2"

headers = {
    "Authorization": f"Bearer {LB_SECRET}",
    "Content-Type": "application/json"
}

async def main():
    async with httpx.AsyncClient() as client:
        # 1. Get rooms
        r = await client.get(f"{BASE_URL}/rooms?limit=5", headers=headers)
        print(f"Rooms status: {r.status_code}")
        data = r.json()
        rooms = data.get("data", [])
        room_ids = [room.get("id") for room in rooms]
        print(f"Rooms: {room_ids}")
        
        if not room_ids:
            print("No rooms found!")
            return
        
        room_id = room_ids[0]
        print(f"\nUsing room: {room_id}")
        
        # 2. Try to broadcast
        event_payload = {
            "data": {
                "type": "ai-design-update",
                "operations": [
                    {
                        "type": "UpdateObject",
                        "id": "test_node_1",
                        "data": {
                            "type": "custom",
                            "position": {"x": 200, "y": 200},
                            "data": {"shape": "rectangle", "label": "TEST NODE"}
                        }
                    }
                ]
            }
        }
        
        r2 = await client.post(
            f"{BASE_URL}/rooms/{room_id}/broadcast_event",
            headers=headers,
            json=event_payload
        )
        print(f"\nBroadcast status: {r2.status_code}")
        print(f"Response: {r2.text}")

asyncio.run(main())
