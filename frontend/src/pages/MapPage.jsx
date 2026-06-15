import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix Leaflet's default icon path issues
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Custom Icons
const createIcon = (color) => {
  return new L.Icon({
    iconUrl: `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-${color}.png`,
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
  });
};

const icons = {
  warehouse: createIcon('blue'),
  green: createIcon('green'),
  orange: createIcon('orange'),
  red: createIcon('red')
};

const getSeverityIcon = (severity) => {
  if (severity <= 3) return icons.green;
  if (severity <= 7) return icons.orange;
  return icons.red;
};

export default function MapPage() {
  const { token } = useContext(AuthContext);
  const [allocationData, setAllocationData] = useState(null);

  useEffect(() => {
    // For the map to show data, we need the latest AllocationResult.
    // In a real app, we'd pass the dataset_id or result_id, but here we just fetch the latest history/result.
    const fetchLatestResult = async () => {
      try {
        // We'll fetch all datasets and then their latest result, or we can just create an endpoint.
        // Actually, we can fetch datasets, pick the first one, and get its allocation.
        // Let's assume the backend has an endpoint for history or we just fetched it before navigating.
        // Since we don't have a direct "get latest result" endpoint, let's fetch the datasets, find the one with Chennai Flood Scenario, and fetch its results.
        
        // Wait, the API doesn't have an endpoint to fetch AllocationResults directly yet.
        // We need to fetch from localStorage or add a quick endpoint.
        const storedResult = localStorage.getItem('latest_allocation_result');
        if (storedResult) {
          setAllocationData(JSON.parse(storedResult));
        }
      } catch (error) {
        console.error("Error loading map data", error);
      }
    };
    fetchLatestResult();
  }, [token]);

  if (!allocationData) {
    return <div className="p-8">No map data available. Run an allocation first.</div>;
  }

  const { warehouse, allocations } = allocationData;
  const mapCenter = [warehouse.latitude || 13.0827, warehouse.longitude || 80.2707];

  const totalResources = warehouse.resources;
  const allocatedResources = allocations.reduce((acc, curr) => acc + curr.allocated, 0);
  const remainingResources = totalResources - allocatedResources;
  const totalDemand = allocations.reduce((acc, curr) => acc + curr.demand, 0);
  const coveragePercentage = totalDemand > 0 ? ((allocatedResources / totalDemand) * 100).toFixed(2) : 100.00;

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Allocation Results & Map</h1>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="glass-card p-4 border-l-4 border-blue-500">
          <p className="text-xs text-color-text-secondary uppercase tracking-wider mb-1">Total Resources</p>
          <p className="text-2xl font-bold">{totalResources}</p>
        </div>
        <div className="glass-card p-4 border-l-4 border-green-500">
          <p className="text-xs text-color-text-secondary uppercase tracking-wider mb-1">Allocated</p>
          <p className="text-2xl font-bold text-green-400">{allocatedResources}</p>
        </div>
        <div className="glass-card p-4 border-l-4 border-yellow-500">
          <p className="text-xs text-color-text-secondary uppercase tracking-wider mb-1">Remaining</p>
          <p className="text-2xl font-bold text-yellow-400">{remainingResources}</p>
        </div>
        <div className="glass-card p-4 border-l-4 border-purple-500">
          <p className="text-xs text-color-text-secondary uppercase tracking-wider mb-1">Coverage</p>
          <p className="text-2xl font-bold">{coveragePercentage}%</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Map Section */}
        <div className="lg:col-span-2 glass-card p-2 rounded-xl overflow-hidden h-[600px]">
          <MapContainer center={mapCenter} zoom={10} style={{ height: '100%', width: '100%' }}>
            <TileLayer
              url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
            />
            
            {/* Warehouse Marker */}
            {warehouse.latitude && warehouse.longitude && (
              <Marker position={[warehouse.latitude, warehouse.longitude]} icon={icons.warehouse}>
                <Popup>
                  <strong>{warehouse.location_name} (Warehouse)</strong><br/>
                  Resources: {warehouse.resources}
                </Popup>
              </Marker>
            )}

            {/* Region Markers and Routes */}
            {allocations.map((r, idx) => {
              if (!r.latitude || !r.longitude) return null;
              return (
                <div key={idx}>
                  <Marker position={[r.latitude, r.longitude]} icon={getSeverityIcon(r.severity)}>
                    <Popup>
                      <strong>{r.name}</strong><br/>
                      Severity: {r.severity}<br/>
                      Demand: {r.demand}<br/>
                      Allocated: {r.allocated}<br/>
                      Status: <span style={{
                        color: r.status === 'Fulfilled' ? 'green' : (r.status === 'Partial' ? 'orange' : 'red')
                      }}>{r.status}</span>
                    </Popup>
                  </Marker>
                  
                  {/* Route Line */}
                  {warehouse.latitude && warehouse.longitude && (
                    <Polyline 
                      positions={[
                        [warehouse.latitude, warehouse.longitude],
                        [r.latitude, r.longitude]
                      ]} 
                      color="blue" 
                      weight={3} 
                      opacity={0.6}
                      dashArray="5, 10"
                    />
                  )}
                </div>
              );
            })}
          </MapContainer>
        </div>

        {/* Breakdown Section */}
        <div className="glass-card p-4 overflow-y-auto h-[600px]">
          <h2 className="text-xl font-bold mb-4">Region Breakdown</h2>
          <div className="space-y-4">
            {allocations.map((a, idx) => (
              <div key={idx} className="p-4 bg-white/5 rounded-lg border border-white/10 hover:bg-white/10 transition-colors">
                <div className="flex justify-between items-start mb-3">
                  <h3 className="font-medium text-lg">{a.name}</h3>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    a.status === 'Fulfilled' ? 'bg-green-500/20 text-green-400' :
                    a.status === 'Partial' ? 'bg-orange-500/20 text-orange-400' :
                    'bg-red-500/20 text-red-400'
                  }`}>
                    {a.status}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-y-2 gap-x-4 text-sm">
                  <div><span className="text-color-text-secondary">Severity:</span> <span className="font-medium">{a.severity}</span></div>
                  <div><span className="text-color-text-secondary">Distance:</span> <span className="font-medium">{a.distance} km</span></div>
                  <div><span className="text-color-text-secondary">Demand:</span> <span className="font-medium">{a.demand}</span></div>
                  <div><span className="text-color-text-secondary">Allocated:</span> <span className="text-green-400 font-bold">{a.allocated}</span></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
