# System Architecture Design Skills

This document provides guidelines and patterns for generating system architecture diagrams. Use these patterns when the user requests a specific type of architecture.

## 1. Backend-For-Frontend (BFF) Pattern
**Use Case:** When a user requests a BFF, mobile API, or front-end specific backend.
**Components:**
- **Client (Mobile/Web):** Shape `rectangle`, label "Frontend Client"
- **BFF (Next.js/Node):** Shape `hexagon`, label "BFF Layer"
- **Downstream Services:** Multiple `rectangle` or `cylinder` nodes representing microservices or databases.
**Layout:** Linear flow. Client -> BFF -> Services.

## 2. Event-Driven Architecture (Pub/Sub)
**Use Case:** When a user requests async processing, queues, Kafka, RabbitMQ, Redis, or Pub/Sub.
**Components:**
- **Producers:** Shape `rectangle`, label "Event Producer (e.g., API)"
- **Message Broker:** Shape `diamond` or `cylinder`, label "Message Queue / Event Bus"
- **Consumers:** Shape `hexagon` or `rectangle`, label "Worker / Consumer"
**Layout:** Centralized broker. Producers point to Broker. Broker points to Consumers.

## 3. Microservices Architecture
**Use Case:** When a user requests a scalable, distributed backend.
**Components:**
- **API Gateway:** Shape `hexagon`, label "API Gateway"
- **Services:** Multiple `rectangle` nodes (e.g., Auth Service, User Service, Payment Service).
- **Databases:** Shape `database` or `cylinder`, one for each service.
**Layout:** API Gateway routes to individual services. Each service connects to its own database.

## 4. Serverless AI Worker Pattern (Our Architecture)
**Use Case:** When a user requests an AI generation pipeline, or serverless queues.
**Components:**
- **Next.js API:** Shape `rectangle`, label "Next.js Route (Dispatcher)"
- **Upstash Redis:** Shape `database`, label "Upstash Redis Queue"
- **FastAPI Worker:** Shape `hexagon`, label "Python AI Worker"
- **Gemini LLM:** Shape `diamond`, label "Google Gemini"
**Layout:** Next.js -> Redis -> FastAPI -> Gemini. FastAPI also points back to Next.js via Server-Sent Events.

## General Visual Rules
- **Databases/Storage:** Always use `database` or `cylinder` shapes.
- **Decision/Logic/Brokers:** Always use `diamond` or `hexagon` shapes.
- **Standard Services:** Always use `rectangle` shapes.
- Try to space nodes out evenly by incrementing the `x` and `y` coordinates by at least 250px between connected nodes.
