import os
import json
from google import genai
from google.genai import types
from config import GOOGLE_AI_API_KEY

# Initialize the Gemini client lazily or handle missing keys
client = None
if GOOGLE_AI_API_KEY:
    try:
        client = genai.Client(api_key=GOOGLE_AI_API_KEY)
    except Exception as e:
        print(f"Failed to initialize Gemini client: {e}")
else:
    print("WARNING: GOOGLE_AI_API_KEY is not set. AI design generation will fail.")

SYSTEM_PROMPT = """
You are an expert software architect and UI designer agent embedded in a collaborative canvas.
Your job is to translate the user's request into a set of precise operations that will mutate the canvas state.

The canvas uses a node and edge graph (React Flow).
Nodes have the following structure:
{
  "type": "UpdateObject",
  "id": "node_id", // Generate a unique short string for new nodes
  "data": {
    "type": "custom", // Always "custom" for shapes
    "position": {"x": 100, "y": 100},
    "data": {
      "shape": "rectangle", // "rectangle", "ellipse", "diamond", "hexagon", "cylinder", "database"
      "label": "My Node",
      "backgroundColor": "bg-bg-elevated", // Use standard tailwind tokens
      "textColor": "text-text-primary"
    }
  }
}

You must return a JSON array of operations. The operations will be sent directly to the Liveblocks REST API.
Valid operation types for the array:
- UpdateObject: Creates or updates a node or edge.
- DeleteObject: Removes a node or edge by ID.

Ensure your response is valid, parseable JSON containing ONLY the array of operations.
Do NOT wrap the response in markdown blocks like ```json.
"""

import glob

def load_skills() -> str:
    """
    Dynamically loads all .md files from the worker/skills directory
    and concatenates them into a single context string.
    """
    skills_context = ""
    skills_dir = os.path.join(os.path.dirname(__file__), "skills")
    
    # Ensure the directory exists
    if not os.path.exists(skills_dir):
        return ""
        
    # Find all markdown files in the skills directory
    md_files = glob.glob(os.path.join(skills_dir, "*.md"))
    
    if not md_files:
        return ""
        
    skills_context += "Here are your Architecture Skills & Patterns to use as reference:\n\n"
    for file_path in md_files:
        try:
            with open(file_path, "r", encoding="utf-8") as f:
                skill_name = os.path.basename(file_path)
                skills_context += f"--- START SKILL: {skill_name} ---\n"
                skills_context += f.read() + "\n"
                skills_context += f"--- END SKILL: {skill_name} ---\n\n"
        except Exception as e:
            print(f"Warning: Could not load skill file {file_path}: {e}")
            
    return skills_context

async def generate_design_operations(prompt: str, current_storage: dict) -> list[dict]:
    """
    Calls Gemini to interpret the user prompt and generate a set of canvas mutations.
    """
    # Load all architectural skills dynamically
    skills_context = load_skills()

    # Create the model payload
    context_message = f"{skills_context}Current canvas storage state (if any):\n{json.dumps(current_storage, indent=2)}\n\nUser Request: {prompt}"

    try:
        response = client.models.generate_content(
            model='gemini-2.5-flash',
            contents=[
                types.Content(role="user", parts=[types.Part.from_text(context_message)])
            ],
            config=types.GenerateContentConfig(
                system_instruction=SYSTEM_PROMPT,
                temperature=0.2,
                response_mime_type="application/json"
            )
        )
        
        # Parse the JSON response
        result_text = response.text
        if result_text:
            operations = json.loads(result_text)
            if isinstance(operations, list):
                return operations
            elif isinstance(operations, dict) and "operations" in operations:
                return operations["operations"]
        
        return []
    except Exception as e:
        print(f"Error generating design with Gemini: {e}")
        raise e
