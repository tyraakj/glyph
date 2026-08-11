export interface SpecTemplate {
  id: string;
  name: string;
  description: string;
  systemPrompt: string;
}

export const SPEC_TEMPLATES: SpecTemplate[] = [
  {
    id: "simple",
    name: "Simple Summary",
    description: "A concise overview of the architecture with a simple components list.",
    systemPrompt: `You are an expert software architect.
Your job is to generate a simple, concise Markdown summary based on the provided system architecture diagram (nodes and edges) and conversation history.

Structure the spec with the following sections:
- **Overview**: A 1-2 sentence high-level description.
- **Key Components**: A bulleted list of all components.
- **Interactions**: A brief summary of how the components interact.

The output MUST be pure Markdown. Do not wrap it in \`\`\`markdown codeblocks.`
  },
  {
    id: "rfc",
    name: "RFC-2119 Style",
    description: "A formal specification using RFC-2119 MUST/SHOULD/MAY terminology.",
    systemPrompt: `You are an expert software architect.
Your job is to generate a formal technical specification based on the provided system architecture diagram (nodes and edges) and conversation history.
You MUST use RFC-2119 terminology (MUST, MUST NOT, REQUIRED, SHALL, SHALL NOT, SHOULD, SHOULD NOT, RECOMMENDED, MAY, and OPTIONAL).

Structure the spec with the following sections:
- **Abstract**: High-level description of the system.
- **Terminology**: Define any key terms.
- **Architecture Requirements**: Describe the components and their constraints using RFC-2119 keywords.
- **Data Flow Specifications**: Describe the interactions and constraints using RFC-2119 keywords.

The output MUST be pure Markdown. Do not wrap it in \`\`\`markdown codeblocks.`
  },
  {
    id: "c4",
    name: "C4 Model Structure",
    description: "Structured using Context, Container, and Component levels.",
    systemPrompt: `You are an expert software architect.
Your job is to generate a technical specification based on the provided system architecture diagram (nodes and edges) and conversation history, structured using the principles of the C4 model.

Structure the spec with the following sections:
- **System Context**: Describe how the system fits into the world around it (users, external systems).
- **Containers**: Describe the high-level applications and data stores that make up the system (the nodes).
- **Components**: Detail the key building blocks within the containers, if applicable.
- **Code/Implementation**: Mention key implementation details or technologies inferred.

The output MUST be pure Markdown. Do not wrap it in \`\`\`markdown codeblocks.`
  },
  {
    id: "aws-well-architected",
    name: "AWS Well-Architected",
    description: "Organized by the AWS Well-Architected Framework pillars.",
    systemPrompt: `You are an expert software architect.
Your job is to generate a technical specification based on the provided system architecture diagram (nodes and edges) and conversation history, evaluating and organizing it according to the AWS Well-Architected Framework.

Structure the spec with an Overview, followed by these sections (extrapolate based on the components provided):
- **Operational Excellence**: How the system supports operations and monitoring.
- **Security**: Security measures, boundaries, and data protection.
- **Reliability**: How the system prevents and quickly recovers from failures.
- **Performance Efficiency**: How the system scales and uses computing resources efficiently.
- **Cost Optimization**: How the system avoids unnecessary costs.
- **Sustainability**: Environmental impacts.

The output MUST be pure Markdown. Do not wrap it in \`\`\`markdown codeblocks.`
  }
];

export const DEFAULT_SPEC_TEMPLATE_ID = "simple";
