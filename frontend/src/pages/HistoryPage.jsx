import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function HistoryPage() {
  const { token } = useContext(AuthContext);
  const [history, setHistory] = useState([]);
  const navigate = useNavigate();

  const fetchHistory = async () => {
    try {
      const response = await axios.get('http://localhost:8000/api/history', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setHistory(response.data);
    } catch (error) {
      console.error('Failed to fetch history', error);
    }
  };

  useEffect(() => {
    if (token) fetchHistory();
  }, [token]);

  const handleLoad = async (resultId) => {
    if (!resultId) {
      alert("No result data available for this history record.");
      return;
    }
    try {
      const response = await axios.get(`http://localhost:8000/api/history/${resultId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      localStorage.setItem('latest_allocation_result', JSON.stringify(response.data));
      navigate('/analysis');
    } catch (error) {
      console.error('Failed to load result', error);
      alert('Error loading result.');
    }
  };

  const handleDelete = async (historyId) => {
    if (!window.confirm("Are you sure you want to delete this simulation history?")) return;
    try {
      await axios.delete(`http://localhost:8000/api/history/${historyId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchHistory();
    } catch (error) {
      console.error('Failed to delete history', error);
    }
  };

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Simulation History</h1>
      
      <div className="glass-card p-6">
        {history.length > 0 ? (
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-white/10">
                <th className="pb-4 font-medium text-color-text-secondary">Date</th>
                <th className="pb-4 font-medium text-color-text-secondary">Dataset</th>
                <th className="pb-4 font-medium text-color-text-secondary">Coverage</th>
                <th className="pb-4 font-medium text-color-text-secondary">Transport Cost</th>
                <th className="pb-4 font-medium text-color-text-secondary text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {history.map(record => (
                <tr key={record.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                  <td className="py-4 text-sm">{new Date(record.created_at).toLocaleString()}</td>
                  <td className="py-4 font-semibold">{record.dataset_name}</td>
                  <td className="py-4">
                    <span className="bg-green-500/20 text-green-400 px-3 py-1 rounded-full text-sm font-medium">
                      {record.coverage_percentage}%
                    </span>
                  </td>
                  <td className="py-4 text-orange-300">{record.total_cost}</td>
                  <td className="py-4 flex justify-end gap-3">
                    <button 
                      onClick={() => handleLoad(record.result_id)}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm font-medium transition-colors"
                    >
                      Open Analysis
                    </button>
                    <button 
                      onClick={() => navigate(`/datasets/${record.dataset_id}`)}
                      className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded text-sm font-medium transition-colors"
                    >
                      Re-run
                    </button>
                    <button 
                      onClick={() => handleDelete(record.id)}
                      className="px-4 py-2 bg-red-500/20 hover:bg-red-500/40 text-red-400 rounded text-sm font-medium transition-colors"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="text-center py-8 text-gray-400">
            <p>No simulation history found. Go to Datasets and run an allocation.</p>
          </div>
        )}
      </div>
    </div>
  );
}
