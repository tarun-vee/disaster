import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { Link } from 'react-router-dom';

export default function Dashboard() {
  const { token } = useContext(AuthContext);
  const [metrics, setMetrics] = useState(null);

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const response = await axios.get('http://localhost:8000/api/dashboard', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setMetrics(response.data);
      } catch (error) {
        console.error('Failed to fetch dashboard metrics', error);
      }
    };
    if (token) fetchMetrics();
  }, [token]);

  if (!metrics) return <div className="p-8">Loading dashboard...</div>;

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <Link to="/datasets" className="btn-primary">Manage Datasets</Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="glass-card p-6 border-l-4 border-blue-500">
          <p className="text-sm text-color-text-secondary uppercase tracking-wider">Total Datasets</p>
          <p className="text-3xl font-bold mt-2">{metrics.total_datasets}</p>
        </div>
        <div className="glass-card p-6 border-l-4 border-green-500">
          <p className="text-sm text-color-text-secondary uppercase tracking-wider">Total Regions</p>
          <p className="text-3xl font-bold mt-2">{metrics.total_regions}</p>
        </div>
        <div className="glass-card p-6 border-l-4 border-orange-500">
          <p className="text-sm text-color-text-secondary uppercase tracking-wider">Total Resources</p>
          <p className="text-3xl font-bold mt-2">{metrics.total_resources}</p>
        </div>
        <div className="glass-card p-6 border-l-4 border-purple-500">
          <p className="text-sm text-color-text-secondary uppercase tracking-wider">Coverage</p>
          <p className="text-3xl font-bold mt-2">{metrics.coverage_percentage}%</p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="glass-card p-6">
          <p className="text-sm text-color-text-secondary uppercase tracking-wider mb-2">Allocated Resources</p>
          <p className="text-2xl font-bold text-green-400">{metrics.total_allocated}</p>
        </div>
        <div className="glass-card p-6">
          <p className="text-sm text-color-text-secondary uppercase tracking-wider mb-2">Remaining Resources</p>
          <p className="text-2xl font-bold text-yellow-400">{metrics.total_remaining}</p>
        </div>
        <div className="glass-card p-6">
          <p className="text-sm text-color-text-secondary uppercase tracking-wider mb-2">Regions Served</p>
          <p className="text-2xl font-bold text-blue-400">{metrics.regions_served}</p>
        </div>
      </div>

      <div className="glass-card p-6">
        <h2 className="text-xl font-bold mb-4">Recent Activity</h2>
        {metrics.recent_activity.length > 0 ? (
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-white/10">
                <th className="pb-3 text-color-text-secondary font-medium">Dataset</th>
                <th className="pb-3 text-color-text-secondary font-medium">Coverage</th>
                <th className="pb-3 text-color-text-secondary font-medium">Date</th>
              </tr>
            </thead>
            <tbody>
              {metrics.recent_activity.map(activity => (
                <tr key={activity.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                  <td className="py-4">{activity.dataset_name}</td>
                  <td className="py-4">
                    <span className="bg-green-500/20 text-green-400 px-2 py-1 rounded text-sm">
                      {activity.coverage}%
                    </span>
                  </td>
                  <td className="py-4 text-sm text-gray-400">{new Date(activity.created_at).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="text-gray-400">No recent allocation activity found.</p>
        )}
      </div>
    </div>
  );
}
