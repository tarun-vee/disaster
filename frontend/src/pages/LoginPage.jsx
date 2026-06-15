import { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

export default function LoginPage() {
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await login(formData.email, formData.password);
    if (result && result.success) {
      navigate('/dashboard');
    } else {
      setError(result?.message || "Login failed. Check your email and password.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="glass-card p-8 w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-center">Login to ReliefNet</h2>
        {error && <p className="text-color-status-danger text-sm mb-4 text-center">{error}</p>}
        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
          <input type="email" name="email" placeholder="Email" className="glass-input" required onChange={handleChange} />
          <input type="password" name="password" placeholder="Password" className="glass-input" required onChange={handleChange} />
          <button type="submit" className="btn-primary mt-4">Login</button>
        </form>
        <p className="mt-4 text-center text-sm text-color-text-secondary">
          Don't have an account? <Link to="/register" className="text-color-accent-blue hover:underline">Create Account</Link>
        </p>
      </div>
    </div>
  )
}
