import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authAPI } from '@/lib/api';
import { Mail, Lock, AlertCircle, ArrowRight } from 'lucide-react';

const Login = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await authAPI.login(formData);
      const { token, master } = response.data;
      authAPI.setToken(token);
      authAPI.setMaster(master);
      navigate('/master/dashboard');
    } catch (err) {
      setError(err.response?.data?.detail || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-slotta-cream mesh-gradient">
      <div className="gradient-orb gradient-orb-1" />
      <div className="gradient-orb gradient-orb-2" />

      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-10">
          <Link to="/" className="inline-flex items-center gap-2">
            <span className="w-10 h-10 rounded-full bg-slotta-purple flex items-center justify-center">
              <span className="text-white text-lg font-bold leading-none">Ø</span>
            </span>
            <span className="text-2xl font-bold text-slotta-ink">SLØTTA</span>
          </Link>
          <p className="text-slotta-ink-soft mt-3 text-sm">Welcome back. Sign in to your account.</p>
        </div>

        <div className="slotta-card rounded-3xl p-8 md:p-10">
          <h2 className="text-2xl font-bold text-slotta-ink mb-8 text-center">Sign In</h2>

          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="space-y-2">
              <label className="text-sm font-medium text-slotta-ink">Email</label>
              <div className="relative">
                <Mail className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slotta-ink-soft/50" />
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-slotta-purple/15 bg-white text-slotta-ink placeholder:text-slotta-ink-soft/40 focus:outline-none focus:ring-2 focus:ring-slotta-purple/30 focus:border-slotta-purple/30 transition"
                  placeholder="you@example.com"
                  required
                  data-testid="login-email"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slotta-ink">Password</label>
              <div className="relative">
                <Lock className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slotta-ink-soft/50" />
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-slotta-purple/15 bg-white text-slotta-ink placeholder:text-slotta-ink-soft/40 focus:outline-none focus:ring-2 focus:ring-slotta-purple/30 focus:border-slotta-purple/30 transition"
                  placeholder="••••••••"
                  required
                  data-testid="login-password"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-full font-medium text-base text-white slotta-button flex items-center justify-center gap-2 disabled:opacity-60"
              data-testid="login-submit"
            >
              {loading ? 'Signing in...' : 'Sign In'}
              {!loading && <ArrowRight className="w-5 h-5" strokeWidth={1.5} />}
            </button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-sm text-slotta-ink-soft">
              Don't have an account?{' '}
              <Link to="/register" className="text-slotta-purple font-medium hover:underline">
                Create one
              </Link>
            </p>
          </div>
        </div>

        <p className="text-center text-xs text-slotta-ink-soft mt-6">
          By signing in, you agree to our Terms of Service and Privacy Policy.
        </p>
      </div>
    </div>
  );
};

export default Login;
