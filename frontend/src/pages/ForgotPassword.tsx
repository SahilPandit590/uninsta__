import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { KeyRound, ArrowLeft } from 'lucide-react';
import api from '../api/axios';

const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleResetRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    try {
      const response = await api.post('/auth/forgot-password', { email });
      setMessage(response.data.message || 'Request successfully sent.');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to process password reset request.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0f172a] p-4">
      <div className="w-full max-w-md bg-[#1e293b] rounded-2xl p-8 border border-white/10 shadow-2xl backdrop-blur-sm">
        <Link to="/login" className="inline-flex items-center text-textMuted hover:text-white mb-6 transition-colors text-sm">
          <ArrowLeft size={16} className="mr-2" />
          Back to Login
        </Link>
        <div className="flex flex-col items-center mb-6">
          <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mb-4 border border-primary/50">
            <KeyRound className="text-primary-light" size={32} />
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary-light to-secondary-light bg-clip-text text-transparent text-center leading-tight">
            Forgot Password
          </h1>
          <p className="text-textMuted mt-3 text-sm text-center">
            Enter your email and we'll securely generate a new temporary password for you.
          </p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/50 text-red-400 p-3 rounded-xl mb-6 text-sm text-center">
            {error}
          </div>
        )}

        {message ? (
          <div className="bg-emerald-500/10 border border-emerald-500/50 text-emerald-400 p-4 rounded-xl mb-6 text-sm text-center">
            {message}
            <div className="mt-4">
              <Link to="/login" className="px-5 py-2 bg-emerald-500/20 rounded-lg text-emerald-300 font-medium hover:bg-emerald-500/30 transition-colors">
                Return to Login
              </Link>
            </div>
          </div>
        ) : (
          <form onSubmit={handleResetRequest} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-textMuted mb-2">Registered Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@university.edu"
                className="w-full bg-[#0f172a]/50 text-white rounded-xl px-4 py-3 border border-white/10 focus:border-primary-light focus:ring-1 focus:ring-primary-light outline-none transition-all"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading || !email}
              className="w-full bg-gradient-to-r from-primary to-secondary hover:from-primary-light hover:to-secondary-light text-white font-medium py-3 rounded-xl transition-all shadow-lg shadow-primary/25 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Sending Request...' : 'Send Temporary Password'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;
