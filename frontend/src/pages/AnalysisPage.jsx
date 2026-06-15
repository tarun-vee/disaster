import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

export default function AnalysisPage() {
  const [data, setData] = useState(null);

  useEffect(() => {
    const stored = localStorage.getItem('latest_allocation_result');
    if (stored) {
      setData(JSON.parse(stored));
    }
  }, []);

  if (!data) return <div className="p-8">No analysis data available. Run an allocation or load from history.</div>;

  const { warehouse, allocations } = data;
  
  const totalResources = warehouse.resources;
  const allocatedResources = allocations.reduce((acc, curr) => acc + curr.allocated, 0);
  const remainingResources = totalResources - allocatedResources;
  
  const totalDemand = allocations.reduce((acc, curr) => acc + curr.demand, 0);
  const coveragePercentage = totalDemand > 0 ? ((allocatedResources / totalDemand) * 100).toFixed(2) : 100.00;
  
  const regionsServed = allocations.filter(a => a.status === 'Fulfilled' || a.status === 'Partial').length;
  
  const totalTransportCost = allocations.reduce((acc, curr) => acc + (curr.distance * curr.allocated), 0).toFixed(2);

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Allocation Analysis</h1>
        <Link to="/map" className="btn-primary">View on Map</Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <div className="glass-card p-6 border-l-4 border-blue-500">
          <p className="text-sm text-color-text-secondary uppercase tracking-wider mb-2">Total Resources</p>
          <p className="text-3xl font-bold">{totalResources}</p>
        </div>
        <div className="glass-card p-6 border-l-4 border-green-500">
          <p className="text-sm text-color-text-secondary uppercase tracking-wider mb-2">Allocated Resources</p>
          <p className="text-3xl font-bold text-green-400">{allocatedResources}</p>
        </div>
        <div className="glass-card p-6 border-l-4 border-yellow-500">
          <p className="text-sm text-color-text-secondary uppercase tracking-wider mb-2">Remaining Resources</p>
          <p className="text-3xl font-bold text-yellow-400">{remainingResources}</p>
        </div>
        <div className="glass-card p-6 border-l-4 border-purple-500">
          <p className="text-sm text-color-text-secondary uppercase tracking-wider mb-2">Coverage Percentage</p>
          <p className="text-3xl font-bold">{coveragePercentage}%</p>
        </div>
        <div className="glass-card p-6 border-l-4 border-indigo-500">
          <p className="text-sm text-color-text-secondary uppercase tracking-wider mb-2">Regions Served</p>
          <p className="text-3xl font-bold text-indigo-400">{regionsServed} / {allocations.length}</p>
        </div>
        <div className="glass-card p-6 border-l-4 border-orange-500">
          <p className="text-sm text-color-text-secondary uppercase tracking-wider mb-2">Total Transport Cost</p>
          <p className="text-3xl font-bold text-orange-400">{totalTransportCost}</p>
        </div>
      </div>

      <div className="glass-card p-6">
        <h2 className="text-xl font-bold mb-4">Region Breakdown</h2>
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-white/10">
              <th className="pb-3 text-color-text-secondary font-medium">Region</th>
              <th className="pb-3 text-color-text-secondary font-medium">Severity</th>
              <th className="pb-3 text-color-text-secondary font-medium">Distance</th>
              <th className="pb-3 text-color-text-secondary font-medium">Demand</th>
              <th className="pb-3 text-color-text-secondary font-medium">Allocated</th>
              <th className="pb-3 text-color-text-secondary font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {allocations.map((a, idx) => (
              <tr key={idx} className="border-b border-white/5 hover:bg-white/5">
                <td className="py-3 font-medium">{a.name}</td>
                <td className="py-3">{a.severity}</td>
                <td className="py-3">{a.distance} km</td>
                <td className="py-3">{a.demand}</td>
                <td className="py-3 text-green-400">{a.allocated}</td>
                <td className="py-3">
                  <span className={`px-2 py-1 rounded text-sm font-medium ${
                    a.status === 'Fulfilled' ? 'bg-green-500/20 text-green-400' :
                    a.status === 'Partial' ? 'bg-orange-500/20 text-orange-400' :
                    'bg-red-500/20 text-red-400'
                  }`}>
                    {a.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
