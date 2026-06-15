# System Requirements

To develop, run, and deploy the ReliefNet application, the following system requirements and dependencies must be met.

## Minimum Hardware Requirements
- **CPU**: 1.5 GHz dual-core processor or better
- **RAM**: 4 GB (8 GB recommended for development running both servers concurrently)
- **Storage**: ~500 MB of available disk space for application files, `node_modules`, Python virtual environments, and the SQLite database.

## Software Prerequisites

### Backend
- **Python**: Version 3.8 or higher.
- **Package Manager**: `pip` (standard with Python installations).
- **OS**: Cross-platform (Windows, macOS, Linux). Windows users may use Command Prompt or PowerShell.

**Core Python Dependencies** (defined in `requirements.txt`):
- `fastapi`: The core web framework.
- `uvicorn`: The ASGI server required to run FastAPI.
- `sqlalchemy`: For database ORM.
- `pydantic`: For data validation.
- `passlib[bcrypt]` & `python-jose[cryptography]`: For JWT authentication and password hashing.
- `python-multipart`: For handling form data (e.g., file uploads).
- `requests`: For making synchronous HTTP requests to external Geocoding APIs.

### Frontend
- **Node.js**: Version 18.x or higher (LTS recommended).
- **Package Manager**: `npm` (comes with Node.js) or `yarn`.

**Core Node Dependencies** (defined in `package.json`):
- `react` & `react-dom` (v19.x)
- `vite` (v8.x) for the build pipeline.
- `tailwindcss` (v4.x) for styling.
- `leaflet` & `react-leaflet` for mapping capabilities.
- `axios` for network requests.

## Network Requirements
- An active internet connection is required during runtime for the backend to communicate with external Geocoding services (e.g., Nominatim/OpenStreetMap) to resolve location names into coordinates.
- The frontend requires an internet connection to fetch map tile layers (`CartoDB` dark matter tiles).
