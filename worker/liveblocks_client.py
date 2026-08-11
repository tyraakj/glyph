import httpx
from typing import Dict, Any, List
from config import LIVEBLOCKS_SECRET_KEY

BASE_URL = "https://api.liveblocks.io/v2"

class LiveblocksClient:
    def __init__(self):
        self.headers = {
            "Authorization": f"Bearer {LIVEBLOCKS_SECRET_KEY}",
            "Content-Type": "application/json"
        }
        self.timeout = httpx.Timeout(10.0)

    async def get_storage(self, room_id: str) -> Dict[str, Any]:
        """Fetch the current storage document from Liveblocks"""
        async with httpx.AsyncClient(timeout=self.timeout) as client:
            response = await client.get(
                f"{BASE_URL}/rooms/{room_id}/storage",
                headers=self.headers
            )
            # If room doesn't exist or storage is empty, it might 404
            if response.status_code == 404:
                return {}
            response.raise_for_status()
            return response.json()

    async def broadcast_event(self, room_id: str, event_data: Dict[str, Any]) -> None:
        """
        Broadcast a custom room event to all connected clients.
        Since mutating complex LiveMap CRDTs via REST can be brittle,
        an alternative pattern is broadcasting the generated design
        and letting the React frontend apply it natively.
        """
        async with httpx.AsyncClient(timeout=self.timeout) as client:
            response = await client.post(
                f"{BASE_URL}/rooms/{room_id}/broadcast_event",
                headers=self.headers,
                json={
                    "name": "ai-design-update",
                    "data": event_data
                }
            )
            response.raise_for_status()
            
    async def mutate_storage(self, room_id: str, operations: List[Dict[str, Any]]) -> None:
        """
        Directly mutate the Liveblocks storage CRDTs.
        operations must follow the Liveblocks REST mutation schema.
        """
        async with httpx.AsyncClient(timeout=self.timeout) as client:
            response = await client.post(
                f"{BASE_URL}/rooms/{room_id}/storage",
                headers=self.headers,
                json=operations
            )
            response.raise_for_status()

# Singleton instance
liveblocks = LiveblocksClient()
