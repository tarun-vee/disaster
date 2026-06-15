import { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

export default function RegisterPage() {
  const { register } = useContext(AuthContext);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    full_name: '',
    username: '',
    email: '',
    password: '',
    confirm_password: ''
  });
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirm_password) {
      setError("Passwords do not match");
      return;
    }
    
    const { confirm_password, ...apiData } = formData;
    const result = await register(apiData);
    if (result && result.success) {
      navigate('/dashboard');
    } else {
      setError(result?.message || "Registration failed. Please try again.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="glass-card p-8 w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-center">Create Account</h2>
        {error && <p className="text-color-status-danger text-sm mb-4 text-center">{error}</p>}
        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
          <input type="text" name="full_name" placeholder="Full Name" className="glass-input" required onChange={handleChange} />
          <input type="text" name="username" placeholder="Username" className="glass-input" required onChange={handleChange} />
          <input type="email" name="email" placeholder="Email" className="glass-input" required onChange={handleChange} />
          <input type="password" name="password" placeholder="Password" className="glass-input" required onChange={handleChange} />
          <input type="password" name="confirm_password" placeholder="Confirm Password" className="glass-input" required onChange={handleChange} />
          <button type="submit" className="btn-primary mt-4">Register</button>
        </form>
        <p className="mt-4 text-center text-sm text-color-text-secondary">
          Already have an account? <Link to="/login" className="text-color-accent-blue hover:underline">Sign In</Link>
        </p>
      </div>
    </div>
  )
}
