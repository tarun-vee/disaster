import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { Link } from 'react-router-dom';

export default function DatasetsPage() {
  const { token } = useContext(AuthContext);
  const [datasets, setDatasets] = useState([]);
  const [newDatasetName, setNewDatasetName] = useState('');

  const fetchDatasets = async () => {
    try {
      const response = await axios.get('http://localhost:8000/api/datasets', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setDatasets(response.data);
    } catch (error) {
      console.error('Error fetching datasets', error);
    }
  };

  useEffect(() => {
    if (token) fetchDatasets();
  }, [token]);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:8000/api/datasets', { name: newDatasetName }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNewDatasetName('');
      fetchDatasets();
    } catch (error) {
      console.error('Error creating dataset', error);
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:8000/api/datasets/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchDatasets();
    } catch (error) {
      console.error('Error deleting dataset', error);
    }
  };

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">My Datasets</h1>
      
      <form onSubmit={handleCreate} className="mb-8 flex gap-4">
        <input 
          type="text" 
          value={newDatasetName} 
          onChange={(e) => setNewDatasetName(e.target.value)} 
          placeholder="New Dataset Name" 
          className="glass-input flex-1 max-w-md"
          required 
        />
        <button type="submit" className="btn-primary">Create Dataset</button>
      </form>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {datasets.map(ds => (
          <div key={ds.id} className="glass-card p-6 flex flex-col justify-between h-full">
            <div>
              <h3 className="text-xl font-semibold mb-2">{ds.name}</h3>
              <p className="text-sm text-color-text-secondary mb-4">Created: {new Date(ds.created_at).toLocaleDateString()}</p>
            </div>
            <div className="flex gap-4">
              <Link to={`/datasets/${ds.id}`} className="btn-primary flex-1 text-center">Manage</Link>
              <button onClick={() => handleDelete(ds.id)} className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded font-medium transition-colors">Delete</button>
            </div>
          </div>
        ))}
        {datasets.length === 0 && <p className="text-color-text-secondary col-span-full">No datasets found. Create one above.</p>}
      </div>
    </div>
  );
}
