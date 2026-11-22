import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authAPI } from '@/lib/api';
import { Mail, Lock, User, Link as LinkIcon, AlertCircle, CheckCircle, ArrowRight } from 'lucide-react';

const Register = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    booking_slug: '',
    specialty: ''
  });

  const generateSlug = (name) => {
    return name.toLowerCase().replace(/\s+/g, '').replace(/[^a-z0-9]/g, '');
  };

  const handleNameChange = (e) => {
    const name = e.target.value;
    setFormData({ ...formData, name, booking_slug: generateSlug(name) });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    if (formData.booking_slug.length < 3) {
      setError('Booking link must be at least 3 characters');
      return;
    }

    setLoading(true);

    try {
      const response = await authAPI.register({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        booking_slug: formData.booking_slug,
        specialty: formData.specialty || null
      });

      const { token, master } = response.data;
      authAPI.setToken(token);
      authAPI.setMaster(master);
      navigate('/master/dashboard');
    } catch (err) {
      setError(err.response?.data?.detail || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const inputClass = "w-full pl-10 pr-4 py-3 rounded-xl border border-slotta-purple/15 bg-white text-slotta-ink placeholder:text-slotta-ink-soft/40 focus:outline-none focus:ring-2 focus:ring-slotta-purple/30 focus:border-slotta-purple/30 transition";

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
          <p className="text-slotta-ink-soft mt-3 text-sm">Create your professional account</p>
        </div>

        <div className="slotta-card rounded-3xl p-8 md:p-10">
          <h2 className="text-2xl font-bold text-slotta-ink mb-8 text-center">Create Account</h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="space-y-2">
              <label className="text-sm font-medium text-slotta-ink">Full Name</label>
              <div className="relative">
                <User className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slotta-ink-soft/50" />
                <input
                  type="text"
                  value={formData.name}
                  onChange={handleNameChange}
                  className={inputClass}
                  placeholder="Sophia Brown"
                  required
                  data-testid="register-name"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slotta-ink">Email</label>
              <div className="relative">
                <Mail className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slotta-ink-soft/50" />
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className={inputClass}
                  placeholder="you@example.com"
                  required
                  data-testid="register-email"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slotta-ink">Specialty (optional)</label>
              <input
                type="text"
                value={formData.specialty}
                onChange={(e) => setFormData({ ...formData, specialty: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-slotta-purple/15 bg-white text-slotta-ink placeholder:text-slotta-ink-soft/40 focus:outline-none focus:ring-2 focus:ring-slotta-purple/30 focus:border-slotta-purple/30 transition"
                placeholder="e.g., Hair Stylist, Makeup Artist"
                data-testid="register-specialty"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slotta-ink">Your Booking Link</label>
              <div className="relative">
                <LinkIcon className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slotta-ink-soft/50 z-10" />
                <div className="flex items-center">
                  <span className="pl-10 pr-1 py-3 bg-slotta-purple-50 border border-r-0 border-slotta-purple/15 rounded-l-xl text-slotta-ink-soft text-sm">
                    slotta.app/
                  </span>
                  <input
                    type="text"
                    value={formData.booking_slug}
                    onChange={(e) => setFormData({ ...formData, booking_slug: e.target.value.toLowerCase().replace(/[^a-z0-9]/g, '') })}
                    className="flex-1 px-3 py-3 border border-slotta-purple/15 bg-white text-slotta-ink placeholder:text-slotta-ink-soft/40 rounded-r-xl focus:outline-none focus:ring-2 focus:ring-slotta-purple/30 focus:border-slotta-purple/30 transition"
                    placeholder="yourname"
                    required
                    data-testid="register-slug"
                  />
                </div>
              </div>
              <p className="text-xs text-slotta-ink-soft mt-1">This is the link your clients will use to book with you</p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slotta-ink">Password</label>
                <div className="relative">
                  <Lock className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slotta-ink-soft/50" />
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className={inputClass}
                    placeholder="••••••••"
                    required
                    minLength={6}
                    data-testid="register-password"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slotta-ink">Confirm</label>
                <div className="relative">
                  <Lock className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slotta-ink-soft/50" />
                  <input
                    type="password"
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    className={inputClass}
                    placeholder="••••••••"
                    required
                    data-testid="register-confirm-password"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-full font-medium text-base text-white slotta-button flex items-center justify-center gap-2 disabled:opacity-60 mt-2"
              data-testid="register-submit"
            >
              {loading ? 'Creating Account...' : 'Create Account'}
              {!loading && <ArrowRight className="w-5 h-5" strokeWidth={1.5} />}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-slotta-ink-soft">
              Already have an account?{' '}
              <Link to="/login" className="text-slotta-purple font-medium hover:underline">
                Sign in
              </Link>
            </p>
          </div>
        </div>

        <div className="mt-6 text-center">
          <div className="flex items-center justify-center gap-2 text-sm text-slotta-ink-soft">
            <CheckCircle className="w-4 h-4 text-slotta-lime-dark" />
            <span>Free to start. No credit card required.</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
