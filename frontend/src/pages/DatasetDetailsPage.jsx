import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { useParams, useNavigate } from 'react-router-dom';

export default function DatasetDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token } = useContext(AuthContext);
  
  const [dataset, setDataset] = useState(null);
  
  // Warehouse form state
  const [wLoc, setWLoc] = useState('');
  const [wRes, setWRes] = useState('');
  
  // Region form state
  const [rName, setRName] = useState('');
  const [rSev, setRSev] = useState('');
  const [rDem, setRDem] = useState('');

  const fetchDataset = async () => {
    try {
      const response = await axios.get(`http://localhost:8000/api/datasets/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setDataset(response.data);
    } catch (error) {
      console.error('Error fetching dataset', error);
      navigate('/datasets');
    }
  };

  useEffect(() => {
    if (token) fetchDataset();
  }, [token, id]);

  const addWarehouse = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`http://localhost:8000/api/datasets/${id}/warehouses`, {
        location_name: wLoc,
        resources: parseInt(wRes, 10)
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setWLoc('');
      setWRes('');
      fetchDataset();
    } catch (error) {
      console.error('Error adding warehouse', error);
    }
  };

  const addRegion = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`http://localhost:8000/api/datasets/${id}/regions`, {
        name: rName,
        severity: parseInt(rSev, 10),
        demand: parseInt(rDem, 10)
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setRName('');
      setRSev('');
      setRDem('');
      fetchDataset();
    } catch (error) {
      console.error('Error adding region', error);
    }
  };

  const handleJsonUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const json = JSON.parse(event.target.result);
        await axios.post(`http://localhost:8000/api/datasets/upload`, json, {
          headers: { Authorization: `Bearer ${token}` }
        });
        // After upload, go back to datasets list to see it
        navigate('/datasets');
      } catch (error) {
        console.error('Error uploading JSON', error);
        alert('Invalid JSON format or upload failed.');
      }
    };
    reader.readAsText(file);
  };

  const [isAllocating, setIsAllocating] = useState(false);

  const runAllocation = async () => {
    setIsAllocating(true);
    try {
      const response = await axios.post(`http://localhost:8000/api/allocation/${id}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      // Store result in localStorage for MapPage
      localStorage.setItem('latest_allocation_result', JSON.stringify(response.data.data));
      navigate('/map');
    } catch (error) {
      console.error('Error running allocation', error);
      alert('Failed to run allocation. See console for details.');
    } finally {
      setIsAllocating(false);
    }
  };

  if (!dataset) return <div className="p-8">Loading...</div>;

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">{dataset.name} - Details</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        {/* Manual Warehouse Entry */}
        <div className="glass-card p-6">
          <h2 className="text-xl font-bold mb-4">Add Warehouse</h2>
          <form onSubmit={addWarehouse} className="flex flex-col gap-4">
            <input type="text" placeholder="Location Name" value={wLoc} onChange={e => setWLoc(e.target.value)} required className="glass-input" />
            <input type="number" placeholder="Resources (e.g. 8000)" value={wRes} onChange={e => setWRes(e.target.value)} required className="glass-input" />
            <button type="submit" className="btn-primary">Add Warehouse</button>
          </form>
        </div>

        {/* Manual Region Entry */}
        <div className="glass-card p-6">
          <h2 className="text-xl font-bold mb-4">Add Region</h2>
          <form onSubmit={addRegion} className="flex flex-col gap-4">
            <input type="text" placeholder="Region Name" value={rName} onChange={e => setRName(e.target.value)} required className="glass-input" />
            <input type="number" placeholder="Severity (1-10)" value={rSev} onChange={e => setRSev(e.target.value)} required className="glass-input" />
            <input type="number" placeholder="Demand (e.g. 1200)" value={rDem} onChange={e => setRDem(e.target.value)} required className="glass-input" />
            <button type="submit" className="btn-primary">Add Region</button>
          </form>
        </div>
      </div>

      <div className="glass-card p-6 mb-8 bg-blue-900/20 border-blue-500/50">
        <h2 className="text-xl font-bold mb-4">JSON Upload (Creates New Dataset)</h2>
        <input type="file" accept=".json" onChange={handleJsonUpload} className="block w-full text-sm text-color-text-primary file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        {/* Warehouse List */}
        <div className="glass-card p-6">
          <h2 className="text-xl font-bold mb-4">Warehouses ({dataset.warehouses.length})</h2>
          <ul className="space-y-2">
            {dataset.warehouses.map(w => (
              <li key={w.id} className="bg-white/5 p-3 rounded">
                <strong>{w.location_name}</strong> - {w.resources} resources
              </li>
            ))}
            {dataset.warehouses.length === 0 && <p className="text-sm text-gray-400">No warehouses added.</p>}
          </ul>
        </div>

        {/* Region List */}
        <div className="glass-card p-6">
          <h2 className="text-xl font-bold mb-4">Regions ({dataset.regions.length})</h2>
          <ul className="space-y-2">
            {dataset.regions.map(r => (
              <li key={r.id} className="bg-white/5 p-3 rounded flex justify-between">
                <span><strong>{r.name}</strong></span>
                <span className="text-sm text-gray-300">Sev: {r.severity} | Dem: {r.demand}</span>
              </li>
            ))}
            {dataset.regions.length === 0 && <p className="text-sm text-gray-400">No regions added.</p>}
          </ul>
        </div>
      </div>

      <div className="flex justify-end">
        <button className="btn-primary text-lg px-8 py-3 flex items-center justify-center gap-2" onClick={runAllocation} disabled={isAllocating || dataset.warehouses.length === 0 || dataset.regions.length === 0}>
          {isAllocating ? 'Running Optimization...' : 'Run Allocation'}
        </button>
      </div>

    </div>
  );
}
