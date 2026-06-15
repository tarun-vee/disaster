import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import LandingPage from './pages/LandingPage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import Dashboard from './pages/Dashboard'
import HistoryPage from './pages/HistoryPage'
import MapPage from './pages/MapPage'
import AnalysisPage from './pages/AnalysisPage'

import ProtectedRoute from './components/ProtectedRoute'
import DatasetsPage from './pages/DatasetsPage'
import DatasetDetailsPage from './pages/DatasetDetailsPage'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        
        {/* Protected Routes */}
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/datasets" element={<ProtectedRoute><DatasetsPage /></ProtectedRoute>} />
        <Route path="/datasets/:id" element={<ProtectedRoute><DatasetDetailsPage /></ProtectedRoute>} />
        <Route path="/history" element={<ProtectedRoute><HistoryPage /></ProtectedRoute>} />
        <Route path="/map" element={<ProtectedRoute><MapPage /></ProtectedRoute>} />
        <Route path="/analysis" element={<ProtectedRoute><AnalysisPage /></ProtectedRoute>} />
      </Routes>
    </Router>
  )
}

export default App
