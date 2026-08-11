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
      "color": "#10233D", // MUST be one of the backgrounds below
      "textColor": "#52A8FF" // MUST be the matching text color below
    }
  }
}

Use ONLY the following exact background/text pairs for colors (they are optimized for our dark theme):
- Neutral: bg #1F1F1F, text #EDEDED
- Blue: bg #10233D, text #52A8FF
- Purple: bg #2E1938, text #BF7AF0
- Orange: bg #331B00, text #FF990A
- Red: bg #3C1618, text #FF6166
- Pink: bg #3A1726, text #F75F8F
- Green: bg #0F2E18, text #62C073
- Teal: bg #062822, text #0AC7B4
    }
  }
}

Edges have the following structure:
{
  "type": "UpdateObject",
  "id": "edge_id",
  "data": {
    "source": "source_node_id",
    "target": "target_node_id",
    "label": "Optional edge label"
  }
}

You must return a JSON object with two fields:
- "message": A short, conversational reply acknowledging the user's request as a helpful AI co-pilot. Keep it under 2 sentences.
- "operations": A JSON array of the operations.

Valid operation types for the operations array:
- UpdateObject: Creates or updates a node or edge.
- DeleteObject: Removes a node or edge by ID.

Ensure your response is valid, parseable JSON containing ONLY the object.
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

async def generate_design_operations(prompt: str, current_storage: dict) -> dict:
    """
    Calls Gemini to interpret the user prompt and generate a set of canvas mutations and a conversational reply.
    """
    # Load all architectural skills dynamically
    skills_context = load_skills()

    # Create the model payload
    context_message = f"{skills_context}Current canvas storage state (if any):\n{json.dumps(current_storage, indent=2)}\n\nUser Request: {prompt}"

    try:
        response = client.models.generate_content(
            model='models/gemini-3.6-flash',
            contents=[
                types.Content(role="user", parts=[types.Part.from_text(text=context_message)])
            ],
            config=types.GenerateContentConfig(
                system_instruction=SYSTEM_PROMPT,
                temperature=0.2,
                response_mime_type="application/json"
            )
        )
        
        # Parse the JSON response
        result_text = response.text
        # Safety cleanup for any markdown wrappers
        if result_text.startswith("```json"):
            result_text = result_text[7:]
        if result_text.endswith("```"):
            result_text = result_text[:-3]
            
        data = json.loads(result_text.strip())
        # Make sure it returns a dict with 'operations'
        if isinstance(data, list):
            return {"message": "Here's what I built.", "operations": data}
        return data
        
    except Exception as e:
        print(f"Error generating design from Gemini: {e}")
        return {"message": f"Error: {str(e)}", "operations": []}

SPEC_SYSTEM_PROMPT = """
You are an expert software architect.
Your job is to generate a comprehensive, well-structured Markdown technical specification based on the provided system architecture diagram (nodes and edges) and the conversation history that led to it.

The output MUST be pure Markdown. Do not wrap it in ```markdown or ``` codeblocks.
Structure the spec with the following sections:
- **Overview**: A high-level description of the system.
- **Architecture**: Describe the main components and how they interact.
- **Components**: A detailed list of all components (derived from the nodes).
- **Data Flow**: A description of data flow or relationships (derived from the edges).

Be detailed, professional, and clear. Expand on the nodes and edges to explain the system's purpose and functionality.
"""

async def generate_spec(chat_history: list, nodes: list, edges: list) -> str:
    """
    Calls Gemini to generate a Markdown technical spec from the canvas context.
    """
    context_message = (
        f"Canvas Nodes:\n{json.dumps(nodes, indent=2)}\n\n"
        f"Canvas Edges:\n{json.dumps(edges, indent=2)}\n\n"
        f"Chat History Context:\n{json.dumps(chat_history, indent=2)}\n\n"
        "Please generate the technical specification based on this context."
    )

    try:
        response = client.models.generate_content(
            model='models/gemini-3.6-flash',
            contents=[
                types.Content(role="user", parts=[types.Part.from_text(text=context_message)])
            ],
            config=types.GenerateContentConfig(
                system_instruction=SPEC_SYSTEM_PROMPT,
                temperature=0.3,
            )
        )
        
        result_text = response.text
        if result_text.startswith("```markdown"):
            result_text = result_text[11:]
        elif result_text.startswith("```"):
            result_text = result_text[3:]
        
        if result_text.endswith("```"):
            result_text = result_text[:-3]
            
        return result_text.strip()
        
    except Exception as e:
        print(f"Error generating spec from Gemini: {e}")
        raise e
