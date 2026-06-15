# System Design & Architecture

ReliefNet follows a standard **Client-Server Architecture** utilizing a RESTful API communication paradigm. The system is logically separated into distinct layers to promote maintainability and separation of concerns.

## High-Level Architecture

```text
[ Client Browser (React SPA) ]  <--->  [ REST API (FastAPI) ]  <--->  [ SQLite Database ]
      |                                      |                                |
      v                                      v                                v
(UI/UX, Maps, State)               (Auth, Routing, Algorithms)       (Users, Datasets, History)
```

## 1. Presentation Layer (Frontend)
The frontend handles the user interface and local state management.
- **Context API**: Manages global application state, specifically the user authentication state (`AuthContext`), ensuring secure access to protected routes.
- **Components**: Reusable UI elements (buttons, inputs, protected route wrappers).
- **Pages**: Top-level views (Dashboard, MapPage, AnalysisPage, LandingPage) that assemble components and trigger API calls.

## 2. Application Layer (Backend)
The backend acts as the orchestrator, receiving requests, enforcing security, running computations, and interfacing with the database.

It is structured into several modular directories:
- **`routes/`**: Defines the API endpoints (e.g., `/auth`, `/allocation`, `/datasets`). Controllers map incoming HTTP requests to specific service or algorithm functions.
- **`schemas/`**: Defines the Pydantic models. This layer acts as a strict boundary, ensuring all incoming data (payloads) and outgoing data (responses) adhere to a defined structure.
- **`models/`**: Defines the SQLAlchemy ORM models, representing the exact schema of the SQLite database tables.
- **`algorithms/`**: Contains the core business logic, decoupled from the API routes. 
  - *Dijkstra's Algorithm*: For computing shortest paths and distances between warehouses and regions.
  - *Allocation Logic*: A priority-queue-based algorithm for distributing limited resources based on calculated constraints.
- **`services/`**: Handles external integrations, such as the `geocoding` service that communicates with external APIs to fetch coordinates.

## 3. Data Layer (Database)
A relational SQLite database (`reliefnet.db`) stores persistent application state.
Key entities include:
- **Users**: Credentials and profile information.
- **Datasets**: User-uploaded disaster scenarios, holding embedded JSON data.
- **Warehouses & Regions**: Granular geographic entities extracted from datasets.
- **Allocation History & Results**: Records of past algorithm executions, allowing users to revisit previous analysis sessions.
