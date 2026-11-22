import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authAPI, bookingsAPI, mastersAPI, analyticsAPI } from '@/lib/api';
import {
  LayoutDashboard, Users, Briefcase, Wallet, TrendingUp,
  Shield, LogOut, Search, AlertCircle, Loader2,
  Clock, CheckCircle, XCircle, Euro, Activity
} from 'lucide-react';

const AdminPage = () => {
  const navigate = useNavigate();
  const [authed, setAuthed] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [authError, setAuthError] = useState('');
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(false);
  const [masters, setMasters] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [stats, setStats] = useState({
    totalMasters: 0,
    totalBookings: 0,
    totalRevenue: 0,
    totalProtected: 0,
    activeMasters: 0,
    noShows: 0,
  });
  const [searchQuery, setSearchQuery] = useState('');

  // Check if already authed
  useEffect(() => {
    const storedKey = localStorage.getItem('slotta_admin_key');
    if (storedKey) {
      setApiKey(storedKey);
      setAuthed(true);
      loadDashboard(storedKey);
    }
  }, []);

  const handleLogin = (e) => {
    e.preventDefault();
    if (!apiKey.trim()) {
      setAuthError('Please enter the admin API key');
      return;
    }
    localStorage.setItem('slotta_admin_key', apiKey);
    setAuthed(true);
    setAuthError('');
    loadDashboard(apiKey);
  };

  const handleLogout = () => {
    localStorage.removeItem('slotta_admin_key');
    setAuthed(false);
    setApiKey('');
    setMasters([]);
    setBookings([]);
  };

  const loadDashboard = async (key) => {
    try {
      setLoading(true);
      const headers = { 'x-admin-key': key };

      // Load masters
      try {
        const mastersRes = await mastersAPI.getAll?.() || [];
        setMasters(Array.isArray(mastersRes.data) ? mastersRes.data : []);
      } catch (e) {
        // Fallback: try direct fetch
        const res = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8001'}/api/masters`, { headers });
        if (res.ok) {
          const data = await res.json();
          setMasters(data);
        }
      }

      // Load recent bookings
      try {
        const bookingsRes = await bookingsAPI.getAll?.() || [];
        setBookings(Array.isArray(bookingsRes.data) ? bookingsRes.data : []);
      } catch (e) {
        setBookings([]);
      }

      // Calculate stats
      const totalRevenue = bookings.reduce((sum, b) => sum + (b.service_price || 0), 0);
      const totalProtected = bookings.reduce((sum, b) => sum + (b.slotta_amount || 0), 0);
      const noShows = bookings.filter(b => b.status === 'no-show').length;
      const activeMasters = masters.filter(m => m.subscription_active).length;

      setStats({
        totalMasters: masters.length,
        totalBookings: bookings.length,
        totalRevenue,
        totalProtected,
        activeMasters,
        noShows,
      });
    } catch (error) {
      console.error('Failed to load admin dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const statusColors = {
    confirmed: 'bg-slotta-lime-50 text-slotta-lime-dark',
    pending: 'bg-yellow-50 text-yellow-700',
    completed: 'bg-slotta-purple-50 text-slotta-purple',
    cancelled: 'bg-gray-100 text-gray-600',
    'no-show': 'bg-red-50 text-red-600',
  };

  const inputClass = "w-full px-4 py-2.5 rounded-xl border border-slotta-purple/15 bg-white text-slotta-ink placeholder:text-slotta-ink-soft/40 focus:outline-none focus:ring-2 focus:ring-slotta-purple/30 focus:border-slotta-purple/30 transition";

  // Login Screen
  if (!authed) {
    return (
      <div className="min-h-screen bg-slotta-cream relative overflow-hidden">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-slotta-purple/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-slotta-lime/5 rounded-full blur-3xl" />

        <div className="max-w-md mx-auto px-6 py-20 relative z-10">
          <div className="slotta-card rounded-3xl p-8">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-slotta-purple rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-white" strokeWidth={1.5} />
              </div>
              <h1 className="text-2xl font-bold text-slotta-ink mb-2">Admin Panel</h1>
              <p className="text-slotta-ink-soft text-sm">Enter your admin API key to access the dashboard</p>
            </div>

            <form onSubmit={handleLogin}>
              <div className="mb-4">
                <label className="text-sm font-medium text-slotta-ink block mb-1.5">Admin API Key</label>
                <input
                  type="password"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  className={inputClass}
                  placeholder="Enter admin key"
                  required
                />
              </div>
              {authError && (
                <div className="flex items-center gap-2 p-3 mb-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{authError}</span>
                </div>
              )}
              <button type="submit" className="w-full py-3.5 rounded-full bg-slotta-purple text-white font-semibold text-sm hover:bg-slotta-purple-dark transition">
                Access Admin Dashboard
              </button>
            </form>

            <button onClick={() => navigate('/')} className="w-full mt-4 text-sm text-slotta-ink-soft hover:text-slotta-purple transition">
              Back to Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  const sidebarItems = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'masters', label: 'Professionals', icon: Users },
    { id: 'bookings', label: 'All Bookings', icon: Briefcase },
    { id: 'revenue', label: 'Revenue', icon: Wallet },
  ];

  const filteredMasters = masters.filter(m =>
    m.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.specialty?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredBookings = bookings.filter(b =>
    b.client_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    b.service_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    b.status?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex min-h-screen bg-slotta-cream">
      {/* Sidebar */}
      <div className="w-64 bg-slotta-purple min-h-screen p-5 flex flex-col rounded-tr-3xl rounded-br-3xl">
        {/* Logo */}
        <div className="flex items-center gap-2 mb-10 px-2">
          <span className="w-9 h-9 rounded-full bg-white/15 flex items-center justify-center">
            <span className="text-white text-lg font-bold leading-none">Ø</span>
          </span>
          <div>
            <span className="text-xl font-bold text-white tracking-tight block">SLØTTA</span>
            <span className="text-xs text-white/50">Admin Panel</span>
          </div>
        </div>

        {/* Nav */}
        <nav className="space-y-1 flex-1">
          {sidebarItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition text-sm font-medium ${
                  isActive
                    ? 'bg-slotta-lime text-slotta-ink shadow-sm'
                    : 'text-white/70 hover:text-white hover:bg-white/10'
                }`}
              >
                <item.icon className="w-5 h-5" strokeWidth={1.5} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-white/60 hover:text-white hover:bg-white/10 transition text-sm font-medium"
        >
          <LogOut className="w-5 h-5" strokeWidth={1.5} />
          <span>Logout</span>
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Top Bar */}
        <header className="bg-white border-b border-slotta-purple/8 px-8 py-4 flex items-center justify-between">
          <h1 className="text-xl font-bold text-slotta-ink capitalize">{activeTab}</h1>
          <div className="flex items-center gap-4">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slotta-lime-50 text-slotta-lime-dark text-xs font-medium">
              <Shield className="w-3.5 h-3.5" strokeWidth={2} />
              Admin
            </span>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 p-8">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 text-slotta-purple animate-spin" strokeWidth={1.5} />
            </div>
          ) : (
            <>
              {/* Overview Tab */}
              {activeTab === 'overview' && (
                <div>
                  {/* Stats Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                    {[
                      { label: 'Total Professionals', value: stats.totalMasters, icon: Users, color: 'purple' },
                      { label: 'Active Subscriptions', value: stats.activeMasters, icon: Shield, color: 'lime' },
                      { label: 'Total Bookings', value: stats.totalBookings, icon: Briefcase, color: 'purple' },
                      { label: 'Revenue Processed', value: `€${stats.totalRevenue}`, icon: Euro, color: 'lime' },
                      { label: 'SLØ Protected', value: `€${stats.totalProtected}`, icon: Shield, color: 'purple' },
                      { label: 'No-Shows', value: stats.noShows, icon: XCircle, color: 'lime' },
                    ].map((stat, index) => {
                      const Icon = stat.icon;
                      const isPurple = stat.color === 'purple';
                      return (
                        <div key={index} className="slotta-card rounded-2xl p-6">
                          <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${
                            isPurple
                              ? 'bg-slotta-purple-50 border border-slotta-purple/10'
                              : 'bg-slotta-lime-50 border border-slotta-lime/20'
                          }`}>
                            <Icon className={`w-6 h-6 ${isPurple ? 'text-slotta-purple' : 'text-slotta-lime-dark'}`} strokeWidth={1.5} />
                          </div>
                          <div className="text-3xl font-bold text-slotta-ink mb-1">{stat.value}</div>
                          <div className="text-sm text-slotta-ink-soft">{stat.label}</div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Recent Bookings */}
                  <div className="slotta-card rounded-2xl overflow-hidden mb-8">
                    <div className="p-6 border-b border-slotta-purple/8 flex items-center justify-between">
                      <h3 className="text-lg font-semibold text-slotta-ink">Recent Bookings</h3>
                      <button onClick={() => setActiveTab('bookings')} className="text-sm font-medium text-slotta-purple hover:underline">
                        View All
                      </button>
                    </div>
                    <div className="p-6">
                      {filteredBookings.length === 0 ? (
                        <div className="text-center py-8 text-slotta-ink-soft">No bookings yet</div>
                      ) : (
                        <div className="space-y-3">
                          {filteredBookings.slice(0, 5).map((booking) => (
                            <div key={booking.id} className="flex items-center justify-between p-4 rounded-xl border border-slotta-purple/8 hover:bg-slotta-purple-50/20 transition">
                              <div className="flex items-center gap-4 flex-1">
                                <div className="w-10 h-10 rounded-full bg-slotta-purple-50 flex items-center justify-center font-semibold text-slotta-purple text-sm">
                                  {booking.client_name?.split(' ').map(n => n[0]).join('').toUpperCase() || '?'}
                                </div>
                                <div>
                                  <div className="font-semibold text-slotta-ink text-sm">{booking.client_name || 'Client'}</div>
                                  <div className="text-sm text-slotta-ink-soft">{booking.service_name || 'Service'}</div>
                                </div>
                              </div>
                              <div className="flex items-center gap-4">
                                <div className="text-right">
                                  <div className="text-sm font-semibold text-slotta-ink">€{booking.service_price || 0}</div>
                                  <div className="text-xs text-slotta-purple">€{booking.slotta_amount || 0} SLØ</div>
                                </div>
                                <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColors[booking.status] || 'bg-gray-100 text-gray-600'}`}>
                                  {booking.status}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Masters Tab */}
              {activeTab === 'masters' && (
                <div>
                  {/* Search */}
                  <div className="mb-6 relative">
                    <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-slotta-ink-soft/40" strokeWidth={1.5} />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className={`${inputClass} pl-10`}
                      placeholder="Search professionals by name, email, or specialty..."
                    />
                  </div>

                  {/* Masters List */}
                  <div className="slotta-card rounded-2xl overflow-hidden">
                    <div className="p-6 border-b border-slotta-purple/8">
                      <h3 className="text-lg font-semibold text-slotta-ink">All Professionals ({filteredMasters.length})</h3>
                    </div>
                    <div className="p-6">
                      {filteredMasters.length === 0 ? (
                        <div className="text-center py-8 text-slotta-ink-soft">No professionals found</div>
                      ) : (
                        <div className="space-y-3">
                          {filteredMasters.map((master) => (
                            <div key={master.id} className="flex items-center justify-between p-4 rounded-xl border border-slotta-purple/8 hover:bg-slotta-purple-50/20 transition">
                              <div className="flex items-center gap-4 flex-1">
                                <div className="w-12 h-12 rounded-full bg-slotta-purple flex items-center justify-center text-white font-semibold text-sm">
                                  {master.name?.split(' ').map(n => n[0]).join('').toUpperCase() || '?'}
                                </div>
                                <div>
                                  <div className="font-semibold text-slotta-ink">{master.name}</div>
                                  <div className="text-sm text-slotta-ink-soft">{master.email}</div>
                                  <div className="text-xs text-slotta-ink-soft mt-0.5">{master.specialty || 'Professional'}</div>
                                </div>
                              </div>
                              <div className="flex items-center gap-4">
                                <div className="text-right">
                                  <div className="text-sm font-medium text-slotta-ink">/{master.booking_slug}</div>
                                  <div className="text-xs text-slotta-ink-soft">{master.created_at ? new Date(master.created_at).toLocaleDateString('en-GB') : ''}</div>
                                </div>
                                {master.subscription_active ? (
                                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-slotta-lime-50 text-slotta-lime-dark text-xs font-medium">
                                    <CheckCircle className="w-3 h-3" strokeWidth={2} />
                                    Active
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-gray-100 text-gray-600 text-xs font-medium">
                                    Inactive
                                  </span>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Bookings Tab */}
              {activeTab === 'bookings' && (
                <div>
                  {/* Search */}
                  <div className="mb-6 relative">
                    <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-slotta-ink-soft/40" strokeWidth={1.5} />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className={`${inputClass} pl-10`}
                      placeholder="Search bookings by client, service, or status..."
                    />
                  </div>

                  {/* Bookings List */}
                  <div className="slotta-card rounded-2xl overflow-hidden">
                    <div className="p-6 border-b border-slotta-purple/8">
                      <h3 className="text-lg font-semibold text-slotta-ink">All Bookings ({filteredBookings.length})</h3>
                    </div>
                    <div className="p-6">
                      {filteredBookings.length === 0 ? (
                        <div className="text-center py-8 text-slotta-ink-soft">No bookings found</div>
                      ) : (
                        <div className="space-y-3">
                          {filteredBookings.map((booking) => (
                            <div key={booking.id} className="flex items-center justify-between p-4 rounded-xl border border-slotta-purple/8 hover:bg-slotta-purple-50/20 transition">
                              <div className="flex items-center gap-4 flex-1">
                                <div className="w-10 h-10 rounded-full bg-slotta-purple-50 flex items-center justify-center font-semibold text-slotta-purple text-sm">
                                  {booking.client_name?.split(' ').map(n => n[0]).join('').toUpperCase() || '?'}
                                </div>
                                <div>
                                  <div className="font-semibold text-slotta-ink text-sm">{booking.client_name || 'Client'}</div>
                                  <div className="text-sm text-slotta-ink-soft">{booking.service_name || 'Service'}</div>
                                  <div className="text-xs text-slotta-ink-soft mt-0.5">
                                    {booking.booking_date ? new Date(booking.booking_date).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' }) : 'Date N/A'}
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center gap-4">
                                <div className="text-right">
                                  <div className="text-sm font-semibold text-slotta-ink">€{booking.service_price || 0}</div>
                                  <div className="text-xs text-slotta-purple">€{booking.slotta_amount || 0} SLØ</div>
                                </div>
                                <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColors[booking.status] || 'bg-gray-100 text-gray-600'}`}>
                                  {booking.status}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Revenue Tab */}
              {activeTab === 'revenue' && (
                <div>
                  {/* Revenue Stats */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    {[
                      { label: 'Total Revenue', value: `€${stats.totalRevenue}`, icon: Euro, color: 'purple' },
                      { label: 'SLØ Protected', value: `€${stats.totalProtected}`, icon: Shield, color: 'lime' },
                      { label: 'Total Bookings', value: stats.totalBookings, icon: Briefcase, color: 'purple' },
                      { label: 'No-Show Rate', value: stats.totalBookings > 0 ? `${Math.round((stats.noShows / stats.totalBookings) * 100)}%` : '0%', icon: XCircle, color: 'lime' },
                    ].map((stat, index) => {
                      const Icon = stat.icon;
                      const isPurple = stat.color === 'purple';
                      return (
                        <div key={index} className="slotta-card rounded-2xl p-6">
                          <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${
                            isPurple
                              ? 'bg-slotta-purple-50 border border-slotta-purple/10'
                              : 'bg-slotta-lime-50 border border-slotta-lime/20'
                          }`}>
                            <Icon className={`w-6 h-6 ${isPurple ? 'text-slotta-purple' : 'text-slotta-lime-dark'}`} strokeWidth={1.5} />
                          </div>
                          <div className="text-3xl font-bold text-slotta-ink mb-1">{stat.value}</div>
                          <div className="text-sm text-slotta-ink-soft">{stat.label}</div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Revenue Breakdown */}
                  <div className="slotta-card rounded-2xl overflow-hidden">
                    <div className="p-6 border-b border-slotta-purple/8">
                      <h3 className="text-lg font-semibold text-slotta-ink">Revenue Breakdown</h3>
                    </div>
                    <div className="p-6">
                      <div className="space-y-4">
                        {filteredBookings.filter(b => b.service_price > 0).slice(0, 20).map((booking) => (
                          <div key={booking.id} className="flex items-center justify-between p-4 rounded-xl border border-slotta-purple/8">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-lg bg-slotta-purple-50 flex items-center justify-center">
                                <Euro className="w-4 h-4 text-slotta-purple" strokeWidth={1.5} />
                              </div>
                              <div>
                                <div className="text-sm font-semibold text-slotta-ink">{booking.client_name || 'Client'}</div>
                                <div className="text-xs text-slotta-ink-soft">{booking.service_name || 'Service'}</div>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-sm font-bold text-slotta-ink">€{booking.service_price || 0}</div>
                              <div className="text-xs text-slotta-purple">€{booking.slotta_amount || 0} SLØ</div>
                            </div>
                          </div>
                        ))}
                        {filteredBookings.filter(b => b.service_price > 0).length === 0 && (
                          <div className="text-center py-8 text-slotta-ink-soft">No revenue data yet</div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
};

export default AdminPage;
