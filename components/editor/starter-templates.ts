import type { CanvasNode, CanvasEdge } from "@/types/canvas";
import { NODE_COLORS } from "@/types/canvas";

export interface CanvasTemplate {
  id: string;
  name: string;
  description: string;
  nodes: CanvasNode[];
  edges: CanvasEdge[];
}

const createNode = (id: string, label: string, shape: string, x: number, y: number, colorIdx: number = 0): CanvasNode => ({
  id,
  type: "canvasNode",
  position: { x, y },
  data: {
    label,
    shape,
    color: NODE_COLORS[colorIdx].background,
    textColor: NODE_COLORS[colorIdx].text,
  },
  style: { width: 140, height: 60 }
});

const createEdge = (source: string, target: string, sourceHandle?: string, targetHandle?: string, label?: string): CanvasEdge => {
  return {
    id: `e-${source}-${target}`,
    source,
    target,
    sourceHandle,
    targetHandle,
    type: "canvasEdge",
    data: label ? { label } : undefined,
  };
};

export const CANVAS_TEMPLATES: CanvasTemplate[] = [
  {
    id: "microservices",
    name: "Microservices Architecture",
    description: "A standard setup with an API Gateway routing to distinct backend services.",
    nodes: [
      createNode("gw", "API Gateway", "diamond", 150, 200, 1),
      createNode("auth", "Auth Service", "pill", 400, 100, 2),
      createNode("user", "User Service", "rectangle", 400, 200, 3),
      createNode("order", "Order Service", "rectangle", 400, 300, 4),
      createNode("db1", "Users DB", "cylinder", 650, 200, 5),
      createNode("db2", "Orders DB", "cylinder", 650, 300, 5),
    ],
    edges: [
      createEdge("gw", "auth", "top", "left", "verify"),
      createEdge("gw", "user", "right", "left", "/users"),
      createEdge("gw", "order", "bottom", "left", "/orders"),
      createEdge("user", "db1", "right", "left", "read/write"),
      createEdge("order", "db2", "right", "left", "read/write"),
    ]
  },
  {
    id: "cicd",
    name: "CI/CD Pipeline",
    description: "A linear deployment pipeline with build, test, and release stages.",
    nodes: [
      createNode("src", "Source Code", "rectangle", 100, 200, 0),
      createNode("build", "Build Stage", "pill", 350, 200, 1),
      createNode("test", "Test Suite", "pill", 600, 200, 6),
      createNode("deploy", "Production", "hexagon", 850, 200, 2),
    ],
    edges: [
      createEdge("src", "build", "right", "left", "push"),
      createEdge("build", "test", "right", "left", "artifact"),
      createEdge("test", "deploy", "right", "left", "approve"),
    ]
  },
  {
    id: "event-driven",
    name: "Event-Driven System",
    description: "A publisher dispatching events to multiple asynchronous consumers.",
    nodes: [
      createNode("pub", "Publisher API", "rectangle", 100, 200, 3),
      createNode("queue", "Message Queue", "cylinder", 350, 200, 7),
      createNode("sub1", "Email Worker", "pill", 650, 100, 2),
      createNode("sub2", "Analytics", "pill", 650, 200, 4),
      createNode("sub3", "Billing", "pill", 650, 300, 6),
    ],
    edges: [
      createEdge("pub", "queue", "right", "left", "publish"),
      createEdge("queue", "sub1", "top", "left", "consume"),
      createEdge("queue", "sub2", "right", "left", "consume"),
      createEdge("queue", "sub3", "bottom", "left", "consume"),
    ]
  },
  {
    id: "data-pipeline",
    name: "Data Pipeline",
    description: "A robust ETL process from raw data ingestion to analytics visualization.",
    nodes: [
      createNode("s3", "S3 Storage", "cylinder", 100, 200, 1),
      createNode("ingest", "Ingestion", "rectangle", 350, 200, 2),
      createNode("spark", "Spark Cluster", "hexagon", 600, 200, 6),
      createNode("dw", "Data Warehouse", "cylinder", 850, 200, 5),
      createNode("dash", "Analytics", "rectangle", 1100, 200, 3),
    ],
    edges: [
      createEdge("s3", "ingest", "right", "left", "poll"),
      createEdge("ingest", "spark", "right", "left", "stream"),
      createEdge("spark", "dw", "right", "left", "batch"),
      createEdge("dw", "dash", "right", "left", "query"),
    ]
  },
  {
    id: "cdn-cms",
    name: "CDN & CMS",
    description: "Global content distribution architecture for high-traffic media sites.",
    nodes: [
      createNode("creators", "Editors", "pill", 100, 150, 0),
      createNode("cms", "CMS Backend", "rectangle", 350, 150, 2),
      createNode("db", "Primary DB", "cylinder", 350, 300, 5),
      createNode("cdn1", "Edge Node (US)", "diamond", 650, 50, 7),
      createNode("cdn2", "Edge Node (EU)", "diamond", 650, 150, 7),
      createNode("cdn3", "Edge Node (AP)", "diamond", 650, 250, 7),
      createNode("users", "Global Users", "pill", 900, 150, 6),
    ],
    edges: [
      createEdge("creators", "cms", "right", "left", "publish"),
      createEdge("cms", "db", "bottom", "top", "sync"),
      createEdge("cms", "cdn1", "top", "left", "cache"),
      createEdge("cms", "cdn2", "right", "left", "cache"),
      createEdge("cms", "cdn3", "bottom", "left", "cache"),
      createEdge("cdn1", "users", "right", "top"),
      createEdge("cdn2", "users", "right", "left"),
      createEdge("cdn3", "users", "right", "bottom"),
    ]
  }
];
