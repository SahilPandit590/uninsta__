import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { LogIn } from 'lucide-react';
import api from '../api/axios';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await api.post('/auth/login', { email, password });
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('userId', response.data._id);
      localStorage.setItem('userName', response.data.username);
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0f172a] p-4">
      <div className="w-full max-w-md bg-[#1e293b] rounded-2xl p-8 border border-white/10 shadow-2xl backdrop-blur-sm">
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mb-4 border border-primary/50">
            <LogIn className="text-primary-light" size={32} />
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary-light to-secondary-light bg-clip-text text-transparent">
            Welcome Back
          </h1>
          <p className="text-textMuted mt-2 text-sm">Sign in to Uninsta to continue</p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/50 text-red-400 p-3 rounded-xl mb-6 text-sm text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-textMuted mb-2">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-[#0f172a]/50 text-white rounded-xl px-4 py-3 border border-white/10 focus:border-primary-light focus:ring-1 focus:ring-primary-light outline-none transition-all"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-textMuted mb-2">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-[#0f172a]/50 text-white rounded-xl px-4 py-3 border border-white/10 focus:border-primary-light focus:ring-1 focus:ring-primary-light outline-none transition-all"
              required
            />
          </div>

          <div className="flex justify-end">
             <Link to="/forgot-password" className="text-sm text-primary-light hover:text-white transition-colors">
               Forgot your password?
             </Link>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-primary to-secondary hover:from-primary-light hover:to-secondary-light text-white font-medium py-3 rounded-xl transition-all shadow-lg shadow-primary/25 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-textMuted">
          Don't have an account?{' '}
          <Link to="/register" className="text-primary-light hover:text-white transition-colors">
            Create an account
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
