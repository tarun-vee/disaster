# Methodology

ReliefNet aims to solve the complex logistical challenge of distributing limited relief resources to disaster-struck regions efficiently and equitably. The methodology revolves around a data-driven, algorithm-backed pipeline.

## 1. Data Ingestion & Enrichment
The process begins when a user uploads a JSON dataset containing a central warehouse (supply) and multiple affected regions (demand), along with severity metrics.

**Geocoding Pipeline:**
- If the dataset provides raw location names (e.g., "Tokyo", "Shinjuku") instead of exact coordinates, the backend intercepts this data.
- It queries an external Geocoding API to resolve these text strings into absolute `latitude` and `longitude` coordinates.
- To prevent API rate-limiting blocks from free providers like Nominatim, the system introduces a polite `sleep(1)` delay between requests.

## 2. Distance Computation & Graph Construction
Resource allocation heavily depends on travel distance.
- The system models the disaster scenario as a mathematical Graph. 
- The Warehouse and Regions act as **Nodes**.
- The physical routes act as **Edges**, where the "weight" of the edge is the distance between the coordinates.
- The backend utilizes **Dijkstra's Algorithm** to compute the shortest path/distance from the central warehouse node to every single region node in the graph.

## 3. Priority-Based Allocation Algorithm
Once distances and demands are established, the system must decide *who gets what*. ReliefNet uses a custom greedy algorithm backed by a **Min-Heap (Priority Queue)**.

The priority queue strictly enforces the following rules for allocation:
1. **Primary Metric (Severity):** Regions with a higher severity rating are serviced first. (Severity is negated and pushed to the Min-Heap to prioritize larger numbers).
2. **Secondary Metric (Distance):** If two regions share the same severity, the algorithm breaks the tie by prioritizing the region closest to the warehouse, minimizing transportation time and cost.

**Fulfillment Logic:**
- The algorithm pops the highest-priority region from the queue.
- If the warehouse has enough resources, the region's demand is "Fulfilled" entirely.
- If the warehouse has fewer resources than demanded, the region receives whatever is left ("Partial" fulfillment), and the warehouse is depleted.
- Any subsequent regions in the queue are marked as "Out Of Stock".

## 4. Reporting & Visualization
The computed results—including distance traveled, exact amount allocated, and remaining stock—are aggregated into an `AllocationResult` and saved to the database.
The frontend retrieves this payload and renders:
- **Statistical Dashboards**: Providing immediate insights into total cost, coverage percentage, and resource depletion.
- **Geospatial Maps**: Plotting markers and polylines on a Leaflet map, visualizing the exact supply chain routes taken to deliver the relief materials.
