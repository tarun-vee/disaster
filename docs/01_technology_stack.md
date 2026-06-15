# Technology Stack

ReliefNet is a full-stack web application designed for disaster relief resource allocation. It utilizes a modern, robust, and scalable technology stack divided into a Python-based backend and a React-based frontend.

## Frontend Stack
The frontend is built as a Single Page Application (SPA) focusing on high performance, responsive design, and interactive data visualization.

- **Framework**: React 19
- **Build Tool**: Vite (chosen for its extremely fast Hot Module Replacement and optimized builds)
- **Styling**: Tailwind CSS (used for utility-first styling and rapidly building custom UI components like the "glass-card" effects)
- **Routing**: React Router DOM v7 (handles client-side navigation between dashboards, maps, and analysis pages)
- **Map Visualization**: Leaflet & React-Leaflet (used for rendering interactive maps, custom markers, and polyline routes representing supply chains)
- **HTTP Client**: Axios (used for making asynchronous requests to the RESTful backend)
- **Icons**: Lucide React (provides clean, customizable SVG icons)

## Backend Stack
The backend is a RESTful API designed for high concurrency, fast execution of complex algorithms, and strict data validation.

- **Framework**: FastAPI (chosen for its high performance, automatic interactive API documentation, and asynchronous capabilities)
- **Server**: Uvicorn (an ASGI web server implementation for Python)
- **Database**: SQLite (used as a lightweight, file-based relational database for storing users, datasets, and historical allocation records)
- **ORM**: SQLAlchemy (provides a full suite of well known enterprise-level persistence patterns)
- **Data Validation**: Pydantic (used heavily by FastAPI for payload validation and serialization)
- **Authentication**: JWT (JSON Web Tokens) with `passlib` and `python-jose` for secure, stateless user authentication and password hashing.
- **External Services**: Integrates with external geocoding APIs (like Nominatim via `requests`) to convert location strings into precise latitude and longitude coordinates.
