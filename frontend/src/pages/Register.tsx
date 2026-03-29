import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { UserPlus } from 'lucide-react';
import api from '../api/axios';

const Register: React.FC = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await api.post('/auth/register', { username, email, password });
      // After registration, usually redirect to login (or auto login)
      navigate('/login');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to register. Email may exist.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0f172a] p-4">
      <div className="w-full max-w-md bg-[#1e293b] rounded-2xl p-8 border border-white/10 shadow-2xl backdrop-blur-sm">
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 bg-secondary/20 rounded-full flex items-center justify-center mb-4 border border-secondary/50">
            <UserPlus className="text-secondary-light" size={32} />
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-secondary-light to-primary-light bg-clip-text text-transparent">
            Join Uninsta
          </h1>
          <p className="text-textMuted mt-2 text-sm">Create an account to start sharing</p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/50 text-red-400 p-3 rounded-xl mb-6 text-sm text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-textMuted mb-2">Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full bg-[#0f172a]/50 text-white rounded-xl px-4 py-3 border border-white/10 focus:border-secondary-light focus:ring-1 focus:ring-secondary-light outline-none transition-all"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-textMuted mb-2">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-[#0f172a]/50 text-white rounded-xl px-4 py-3 border border-white/10 focus:border-secondary-light focus:ring-1 focus:ring-secondary-light outline-none transition-all"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-textMuted mb-2">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-[#0f172a]/50 text-white rounded-xl px-4 py-3 border border-white/10 focus:border-secondary-light focus:ring-1 focus:ring-secondary-light outline-none transition-all"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-secondary to-primary hover:from-secondary-light hover:to-primary-light text-white font-medium py-3 rounded-xl transition-all shadow-lg shadow-secondary/25 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Creating...' : 'Create Account'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-textMuted">
          Already have an account?{' '}
          <Link to="/login" className="text-secondary-light hover:text-white transition-colors">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
