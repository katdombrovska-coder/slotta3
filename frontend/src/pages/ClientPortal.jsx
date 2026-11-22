import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { bookingsAPI, clientsAPI } from '@/lib/api';
import { Clock, Calendar, Wallet, User, Home, X, CheckCircle, Loader2, Mail, AlertCircle, Sparkles, ArrowLeft } from 'lucide-react';

const ClientPortal = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('bookings');
  const [loading, setLoading] = useState(false);
  const [bookings, setBookings] = useState([]);
  const [clientEmail, setClientEmail] = useState('');
  const [client, setClient] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [error, setError] = useState('');
  const [loginError, setLoginError] = useState('');

  useEffect(() => {
    const storedEmail = localStorage.getItem('slotta_client_email');
    if (storedEmail) {
      setClientEmail(storedEmail);
      setIsAuthenticated(true);
      loadClientData(storedEmail);
    }
  }, []);

  const loadClientData = async (email) => {
    try {
      setLoading(true);
      setError('');
      const clientResponse = await clientsAPI.getByEmail(email);
      setClient(clientResponse.data);
      const bookingsResponse = await bookingsAPI.getByClientEmail(email);
      setBookings(bookingsResponse.data || []);
    } catch (err) {
      if (err.response?.status === 404) setError('No bookings found for this email.');
      else setError('Failed to load your bookings. Please try again.');
      setBookings([]);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = (e) => {
    e.preventDefault();
    if (!clientEmail.trim()) { setLoginError('Please enter a valid email.'); return; }
    localStorage.setItem('slotta_client_email', clientEmail);
    setIsAuthenticated(true);
    setLoginError('');
    loadClientData(clientEmail);
  };

  const handleLogout = () => {
    localStorage.removeItem('slotta_client_email');
    setIsAuthenticated(false);
    setClient(null);
    setBookings([]);
    setClientEmail('');
  };

  const handleCancelBooking = async (bookingId) => {
    if (!window.confirm('Cancel this booking? Your payment hold will be released.')) return;
    try {
      await bookingsAPI.cancel(bookingId);
      loadClientData(clientEmail);
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to cancel booking');
    }
  };

  const statusColors = {
    confirmed: 'bg-green-50 text-green-700',
    pending: 'bg-yellow-50 text-yellow-700',
    completed: 'bg-blue-50 text-blue-700',
    cancelled: 'bg-gray-100 text-gray-600',
    'no-show': 'bg-red-50 text-red-600',
  };

  const inputClass = "w-full px-4 py-2.5 rounded-xl border border-slotta-purple/15 bg-white text-slotta-ink placeholder:text-slotta-ink-soft/40 focus:outline-none focus:ring-2 focus:ring-slotta-purple/30 focus:border-slotta-purple/30 transition";

  // Login Screen
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slotta-cream relative overflow-hidden">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-slotta-purple/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-slotta-lime/5 rounded-full blur-3xl" />
        
        {/* Header */}
        <div className="bg-white border-b border-slotta-purple/8 relative z-10">
          <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 bg-slotta-purple rounded-xl flex items-center justify-center">
                <Clock className="w-5 h-5 text-white" strokeWidth={1.5} />
              </div>
              <span className="text-xl font-bold text-slotta-ink">SLØTTA</span>
            </div>
            <button onClick={() => navigate('/')} className="flex items-center gap-1.5 px-4 py-2 rounded-full border border-slotta-purple/10 text-sm text-slotta-ink-soft hover:border-slotta-purple/30 hover:text-slotta-purple transition">
              <Home className="w-3.5 h-3.5" /> Home
            </button>
          </div>
        </div>

        <div className="max-w-md mx-auto px-6 py-20 relative z-10">
          <div className="slotta-card rounded-3xl p-8">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-slotta-purple-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <User className="w-8 h-8 text-slotta-purple" strokeWidth={1.5} />
              </div>
              <h1 className="text-2xl font-bold text-slotta-ink mb-2">Client Portal</h1>
              <p className="text-slotta-ink-soft text-sm">Enter your email to view your bookings</p>
            </div>

            <form onSubmit={handleLogin}>
              <div className="mb-4">
                <label className="text-sm font-medium text-slotta-ink block mb-1.5">Email Address</label>
                <div className="relative">
                  <Mail className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-slotta-ink-soft/40" strokeWidth={1.5} />
                  <input
                    type="email"
                    value={clientEmail}
                    onChange={(e) => setClientEmail(e.target.value)}
                    className={`${inputClass} pl-10`}
                    placeholder="your@email.com"
                    required
                    data-testid="client-email-input"
                  />
                </div>
              </div>
              {loginError && (
                <div className="flex items-center gap-2 p-3 mb-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{loginError}</span>
                </div>
              )}
              <button type="submit" className="w-full py-3.5 rounded-full bg-slotta-purple text-white font-semibold text-sm hover:bg-slotta-purple-dark transition" data-testid="client-login-btn">
                View My Bookings
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  const walletBalance = client?.wallet_balance || 0;
  const creditBalance = client?.credit_balance || 0;
  const upcomingCount = bookings.filter(b => b.status === 'confirmed' || b.status === 'pending').length;
  const completedCount = bookings.filter(b => b.status === 'completed').length;

  return (
    <div className="min-h-screen bg-slotta-cream">
      {/* Header */}
      <div className="bg-white border-b border-slotta-purple/8">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 bg-slotta-purple rounded-xl flex items-center justify-center">
              <Clock className="w-5 h-5 text-white" strokeWidth={1.5} />
            </div>
            <span className="text-xl font-bold text-slotta-ink">SLØTTA</span>
          </div>
          <div className="flex items-center gap-4">
            {creditBalance > 0 && (
              <span className="px-3 py-1.5 rounded-full bg-slotta-lime-50 text-slotta-lime-dark text-xs font-medium">
                Credit: €{creditBalance}
              </span>
            )}
            <button onClick={() => navigate('/')} className="flex items-center gap-1.5 px-4 py-2 rounded-full border border-slotta-purple/10 text-sm text-slotta-ink-soft hover:border-slotta-purple/30 transition">
              <Home className="w-3.5 h-3.5" /> Home
            </button>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-slotta-purple rounded-full flex items-center justify-center text-white text-sm font-semibold">
                {client?.name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U'}
              </div>
              <span className="text-sm font-medium text-slotta-ink">{client?.name || clientEmail}</span>
            </div>
            <button onClick={handleLogout} className="px-4 py-1.5 rounded-full border border-slotta-purple/10 text-sm text-slotta-ink-soft hover:border-slotta-purple/30 transition">Logout</button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-12">
        <h1 className="text-3xl font-bold text-slotta-ink mb-8" data-testid="client-portal-title">My Account</h1>

        {creditBalance > 0 && (
          <div className="slotta-card rounded-2xl p-5 mb-8 bg-gradient-to-r from-slotta-purple-50 to-slotta-lime-50 border border-slotta-purple/10 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-slotta-purple flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" strokeWidth={1.5} />
              </div>
              <div className="text-sm text-slotta-ink">
                You have <span className="font-bold text-slotta-purple">€{creditBalance}</span> credit available. Use it on your next booking!
              </div>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-2 mb-8">
          {[
            { id: 'bookings', label: 'My Bookings', icon: Calendar },
            { id: 'wallet', label: 'Wallet', icon: Wallet },
            { id: 'profile', label: 'Profile', icon: User },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-medium transition ${
                  activeTab === tab.id
                    ? 'bg-slotta-purple text-white'
                    : 'bg-white border border-slotta-purple/10 text-slotta-ink-soft hover:border-slotta-purple/30'
                }`}
                data-testid={`tab-${tab.id}`}
              >
                <Icon className="w-4 h-4" strokeWidth={1.5} />
                {tab.label}
              </button>
            );
          })}
        </div>

        {loading && (
          <div className="text-center py-12">
            <Loader2 className="w-8 h-8 text-slotta-purple animate-spin mx-auto mb-4" strokeWidth={1.5} />
            <p className="text-slotta-ink-soft">Loading your data...</p>
          </div>
        )}

        {error && !loading && (
          <div className="flex items-center gap-2 p-4 bg-yellow-50 border border-yellow-200 rounded-xl text-yellow-700 mb-6 text-sm">
            <AlertCircle className="w-5 h-5" />
            <span>{error}</span>
          </div>
        )}

        {/* Bookings Tab */}
        {activeTab === 'bookings' && !loading && (
          <div>
            <div className="grid md:grid-cols-2 gap-4 mb-8">
              <div className="slotta-card rounded-2xl p-6">
                <div className="w-10 h-10 rounded-xl bg-slotta-purple-50 flex items-center justify-center mb-3">
                  <Calendar className="w-5 h-5 text-slotta-purple" strokeWidth={1.5} />
                </div>
                <div className="text-4xl font-bold text-slotta-purple mb-1">{upcomingCount}</div>
                <div className="text-sm text-slotta-ink-soft">Upcoming Bookings</div>
              </div>
              <div className="slotta-card rounded-2xl p-6">
                <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center mb-3">
                  <CheckCircle className="w-5 h-5 text-green-500" strokeWidth={1.5} />
                </div>
                <div className="text-4xl font-bold text-green-500 mb-1">{completedCount}</div>
                <div className="text-sm text-slotta-ink-soft">Completed Bookings</div>
              </div>
            </div>

            <div className="slotta-card rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-slotta-ink mb-4">All Bookings</h3>
              {bookings.length === 0 ? (
                <div className="text-center py-8">
                  <Calendar className="w-12 h-12 mx-auto mb-4 text-slotta-purple/20" strokeWidth={1} />
                  <p className="text-slotta-ink-soft mb-4">No bookings yet</p>
                  <button onClick={() => navigate('/')} className="px-5 py-2.5 rounded-full bg-slotta-purple text-white text-sm font-medium hover:bg-slotta-purple-dark transition">Book an Appointment</button>
                </div>
              ) : (
                <div className="space-y-3">
                  {bookings.map((booking) => (
                    <div key={booking.id} className="p-5 rounded-xl border border-slotta-purple/8 hover:bg-slotta-purple-50/20 transition" data-testid={`client-booking-${booking.id}`}>
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="text-lg font-semibold text-slotta-ink mb-1">{booking.service_name || 'Service'}</h3>
                          <p className="text-sm text-slotta-ink-soft">with {booking.master_name || 'Professional'}</p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColors[booking.status] || 'bg-gray-100 text-gray-600'}`}>
                          {booking.status}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div className="flex items-center gap-2 text-slotta-ink-soft">
                          <Calendar className="w-4 h-4" />
                          <span className="text-sm">{booking.booking_date ? new Date(booking.booking_date).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' }) : 'Date unavailable'}</span>
                        </div>
                        <div className="flex items-center gap-2 text-slotta-ink-soft">
                          <Clock className="w-4 h-4" />
                          <span className="text-sm">{booking.booking_date ? new Date(booking.booking_date).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }) : 'Time unavailable'}</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between pt-4 border-t border-slotta-purple/8">
                        <div>
                          <div className="text-sm text-slotta-ink-soft">Service Price: €{booking.service_price || 0}</div>
                          <div className="text-sm text-slotta-purple font-medium">SLØ: €{booking.slotta_amount || 0} (held, not charged)</div>
                        </div>
                        {(booking.status === 'confirmed' || booking.status === 'pending') && (
                          <button onClick={() => handleCancelBooking(booking.id)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-red-200 text-sm text-red-500 hover:bg-red-50 transition">
                            <X className="w-3.5 h-3.5" /> Cancel
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Wallet Tab */}
        {activeTab === 'wallet' && !loading && (
          <div>
            <div className="slotta-card rounded-3xl p-8 mb-8 bg-gradient-to-br from-slotta-purple to-slotta-purple-dark text-white relative overflow-hidden">
              <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -mr-20 -mt-20" />
              <div className="relative flex items-center justify-between">
                <div>
                  <div className="text-sm text-white/70 mb-2">Available Balance</div>
                  <div className="text-5xl font-bold mb-2" data-testid="wallet-balance">€{walletBalance}</div>
                  <p className="text-sm text-white/70">Use this credit for your next booking</p>
                </div>
                <Wallet className="w-16 h-16 text-white/30" strokeWidth={1} />
              </div>
            </div>

            <div className="slotta-card rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-slotta-ink mb-5">How Wallet Works</h3>
              <div className="space-y-4">
                {[
                  { title: 'Fair No-Show Policy', desc: 'If you miss an appointment, part of the SLØ goes to compensate the professional, and the rest is credited to your wallet for future use.' },
                  { title: 'Automatic Application', desc: 'Your wallet balance is automatically applied to your next booking.' },
                  { title: 'Never Expires', desc: 'Your credits don\'t expire. Use them whenever you\'re ready.' },
                ].map((item, idx) => (
                  <div key={idx} className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-green-50 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <CheckCircle className="w-4 h-4 text-green-500" strokeWidth={2} />
                    </div>
                    <div>
                      <h4 className="font-semibold text-slotta-ink mb-1 text-sm">{item.title}</h4>
                      <p className="text-sm text-slotta-ink-soft">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Profile Tab */}
        {activeTab === 'profile' && !loading && (
          <div className="slotta-card rounded-2xl p-6">
            <h3 className="text-lg font-semibold text-slotta-ink mb-5">Personal Information</h3>
            <div className="grid md:grid-cols-2 gap-4 mb-6">
              {[
                { label: 'Name', value: client?.name || '' },
                { label: 'Email', value: client?.email || clientEmail },
                { label: 'Phone', value: client?.phone || 'Not provided' },
                { label: 'Member Since', value: client?.created_at ? new Date(client.created_at).toLocaleDateString('en-GB') : 'N/A' },
              ].map((field, idx) => (
                <div key={idx}>
                  <label className="text-sm font-medium text-slotta-ink block mb-1.5">{field.label}</label>
                  <input type="text" value={field.value} readOnly className={`${inputClass} bg-slotta-purple-50/30`} />
                </div>
              ))}
            </div>

            <div className="pt-4 border-t border-slotta-purple/8">
              <h4 className="font-semibold text-slotta-ink mb-4">Booking Stats</h4>
              <div className="grid grid-cols-3 gap-4">
                {[
                  { value: client?.total_bookings || 0, label: 'Total Bookings', bg: 'bg-slotta-purple-50', text: 'text-slotta-purple' },
                  { value: client?.completed_bookings || 0, label: 'Completed', bg: 'bg-green-50', text: 'text-green-600' },
                  { value: client?.reliability || 'new', label: 'Status', bg: 'bg-yellow-50', text: 'text-yellow-600' },
                ].map((stat, idx) => (
                  <div key={idx} className={`text-center p-4 ${stat.bg} rounded-xl`}>
                    <div className={`text-2xl font-bold ${stat.text}`}>{stat.value}</div>
                    <div className="text-sm text-slotta-ink-soft mt-1">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ClientPortal;
