import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { bookingsAPI, analyticsAPI, authAPI, stripeAPI } from '@/lib/api';
import {
  LayoutDashboard, Calendar, Briefcase, Users, Wallet,
  Settings, TrendingUp, Shield, AlertCircle, LogOut, Plus
} from 'lucide-react';

const Sidebar = ({ active, subscriptionActive }) => {
  const navigate = useNavigate();
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, path: '/master/dashboard' },
    { id: 'bookings', label: 'Appointments', icon: Briefcase, path: '/master/bookings' },
    { id: 'calendar', label: 'Calendar', icon: Calendar, path: '/master/calendar', premium: true },
    { id: 'services', label: 'Services', icon: Shield, path: '/master/services', premium: true },
    { id: 'clients', label: 'Clients', icon: Users, path: '/master/clients' },
    { id: 'wallet', label: 'My Wallet', icon: Wallet, path: '/master/wallet' },
    { id: 'analytics', label: 'Analytics', icon: TrendingUp, path: '/master/analytics', premium: true },
    { id: 'settings', label: 'Settings', icon: Settings, path: '/master/settings' },
  ];

  return (
    <div className="w-64 bg-slotta-purple min-h-screen p-5 flex flex-col rounded-tr-3xl rounded-br-3xl">
      {/* Logo */}
      <div className="flex items-center gap-2 mb-10 px-2">
        <span className="w-9 h-9 rounded-full bg-white/15 flex items-center justify-center">
          <span className="text-white text-lg font-bold leading-none">Ø</span>
        </span>
        <span className="text-xl font-bold text-white tracking-tight">SLØTTA</span>
      </div>

      {/* Nav */}
      <nav className="space-y-1 flex-1">
        {menuItems.map((item) => {
          const isLocked = item.premium && !subscriptionActive;
          const isActive = active === item.id;
          return (
            <button
              key={item.id}
              onClick={() => navigate(item.path)}
              disabled={isLocked}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition text-sm font-medium ${
                isActive
                  ? 'bg-slotta-lime text-slotta-ink shadow-sm'
                  : 'text-white/70 hover:text-white hover:bg-white/10'
              } ${isLocked ? 'opacity-40 cursor-not-allowed hover:bg-transparent' : ''}`}
              data-testid={`nav-${item.id}`}
            >
              <item.icon className="w-5 h-5" strokeWidth={1.5} />
              <span>{item.label}</span>
              {isLocked && (
                <span className="ml-auto text-xs bg-white/15 text-white/80 px-2 py-0.5 rounded-full">Pro</span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Reserve a Slot CTA */}
      <button
        onClick={() => navigate('/master/calendar')}
        className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-slotta-lime text-slotta-ink font-semibold text-sm hover:bg-slotta-lime-dark transition mb-3"
      >
        <Plus className="w-4 h-4" strokeWidth={2} />
        Reserve a Slot
      </button>

      {/* Logout */}
      <button
        onClick={() => authAPI.logout()}
        className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-white/60 hover:text-white hover:bg-white/10 transition text-sm font-medium"
        data-testid="logout-btn"
      >
        <LogOut className="w-5 h-5" strokeWidth={1.5} />
        <span>Logout</span>
      </button>
    </div>
  );
};

const MasterLayout = ({ children, active, title }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const master = authAPI.getMaster();
  const [subscriptionActive, setSubscriptionActive] = useState(false);
  const [subscriptionLoading, setSubscriptionLoading] = useState(false);
  const [subscriptionError, setSubscriptionError] = useState('');
  const [walletBalance, setWalletBalance] = useState(0);

  const premiumPages = new Set(['calendar', 'services', 'analytics']);
  const isPremiumPage = premiumPages.has(active);

  useEffect(() => {
    const loadStatus = async () => {
      try {
        setSubscriptionLoading(true);
        setSubscriptionError('');
        const response = await stripeAPI.subscriptionStatus();
        setSubscriptionActive(!!response.data?.active);
      } catch (err) {
        setSubscriptionError('Unable to verify subscription status.');
      } finally {
        setSubscriptionLoading(false);
      }
    };
    if (master?.id) {
      loadStatus();
    }
  }, [master?.id, location.pathname]);

  const handleSubscribe = async () => {
    try {
      const response = await stripeAPI.createCheckoutSession();
      const url = response.data?.url;
      if (url) window.location.href = url;
    } catch (err) {
      alert('Unable to start checkout. Please try again.');
    }
  };

  return (
    <div className="flex min-h-screen bg-slotta-cream">
      <Sidebar active={active} subscriptionActive={subscriptionActive} />

      <div className="flex-1 flex flex-col">
        {/* Top Bar */}
        <header className="bg-white border-b border-slotta-purple/8 px-8 py-4 flex items-center justify-between">
          <h1 className="text-xl font-bold text-slotta-ink" data-testid="page-title">{title}</h1>

          <div className="flex items-center gap-4">
            {/* Balance pill */}
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-slotta-purple-50 border border-slotta-purple/10">
              <span className="w-5 h-5 rounded-full bg-slotta-purple flex items-center justify-center">
                <span className="text-white text-xs font-bold leading-none">Ø</span>
              </span>
              <span className="text-sm font-semibold text-slotta-ink">{walletBalance} SLØ</span>
            </div>

            {/* User profile */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-slotta-purple flex items-center justify-center text-white font-semibold text-sm">
                {master?.name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U'}
              </div>
              <div className="hidden sm:block">
                <div className="text-sm font-semibold text-slotta-ink">{master?.name || 'User'}</div>
                <div className="text-xs text-slotta-ink-soft">{master?.specialty || 'Professional'}</div>
              </div>
            </div>
          </div>
        </header>

        {/* Main content */}
        <main className="flex-1 p-8">
          {subscriptionError && (
            <div className="flex items-center gap-2 p-4 bg-yellow-50 border border-yellow-200 rounded-xl text-yellow-700 mb-6">
              <AlertCircle className="w-5 h-5" />
              <span>{subscriptionError}</span>
            </div>
          )}
          {isPremiumPage && !subscriptionActive && !subscriptionLoading ? (
            <div className="slotta-card rounded-3xl max-w-2xl p-8 text-center">
              <h2 className="text-2xl font-bold text-slotta-ink mb-3">Upgrade Required</h2>
              <p className="text-slotta-ink-soft mb-6">
                This feature is part of the Pro plan. Subscribe to unlock calendar sync, analytics, and advanced service controls.
              </p>
              <button
                onClick={handleSubscribe}
                className="px-6 py-3 rounded-full font-medium text-white slotta-button"
              >
                Subscribe for €12/month
              </button>
            </div>
          ) : (
            children
          )}
        </main>
      </div>
    </div>
  );
};

const Dashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [subscriptionActive, setSubscriptionActive] = useState(false);
  const [subscriptionLoading, setSubscriptionLoading] = useState(false);
  const [subscriptionError, setSubscriptionError] = useState('');
  const master = authAPI.getMaster();
  const masterId = master?.id;

  const [stats, setStats] = useState({
    todayBookings: 0,
    timeProtected: 0,
    noShowsAvoided: 0,
    walletBalance: 0
  });
  const [todayBookings, setTodayBookings] = useState([]);

  useEffect(() => {
    if (masterId) {
      loadDashboardData();
      loadSubscriptionStatus();
    }
  }, [masterId]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError('');
      const bookingsResponse = await bookingsAPI.getByMaster(masterId);
      const allBookings = bookingsResponse.data || [];
      const today = new Date().toISOString().split('T')[0];
      const todayOnly = allBookings.filter(b =>
        b.booking_date && b.booking_date.startsWith(today)
      );
      const analyticsResponse = await analyticsAPI.getMasterAnalytics(masterId);
      const analytics = analyticsResponse.data;
      setStats({
        todayBookings: todayOnly.length,
        timeProtected: analytics.time_protected_eur || 0,
        noShowsAvoided: analytics.no_shows || 0,
        walletBalance: analytics.wallet_balance || 0
      });
      setTodayBookings(todayOnly);
    } catch (error) {
      console.error('Failed to load dashboard:', error);
      setError('Unable to load dashboard data. Please refresh.');
      setStats({ todayBookings: 0, timeProtected: 0, noShowsAvoided: 0, walletBalance: 0 });
      setTodayBookings([]);
    } finally {
      setLoading(false);
    }
  };

  const loadSubscriptionStatus = async () => {
    try {
      setSubscriptionLoading(true);
      setSubscriptionError('');
      const response = await stripeAPI.subscriptionStatus();
      setSubscriptionActive(!!response.data?.active);
    } catch (err) {
      setSubscriptionError('Unable to verify subscription status.');
      setSubscriptionActive(false);
    } finally {
      setSubscriptionLoading(false);
    }
  };

  const handleSubscribe = async () => {
    try {
      const response = await stripeAPI.createCheckoutSession();
      const url = response.data?.url;
      if (url) window.location.href = url;
    } catch (err) {
      alert('Unable to start checkout. Please try again.');
    }
  };

  const handleManageBilling = async () => {
    try {
      const response = await stripeAPI.createPortalSession();
      const url = response.data?.url;
      if (url) window.location.href = url;
    } catch (err) {
      alert('Unable to open billing portal. Please try again.');
    }
  };

  const statusColors = {
    confirmed: 'success',
    pending: 'warning',
    'high-risk': 'danger',
    completed: 'info'
  };

  const statCards = [
    { label: "Today's Bookings", value: stats.todayBookings, icon: Briefcase, color: 'purple' },
    { label: 'Time Protected', value: `€${stats.timeProtected}`, icon: Shield, color: 'lime' },
    { label: 'No-Shows Avoided', value: stats.noShowsAvoided, icon: TrendingUp, color: 'purple' },
    { label: 'Wallet Balance', value: `€${stats.walletBalance}`, icon: Wallet, color: 'lime' },
  ];

  return (
    <MasterLayout active="dashboard" title="Dashboard">
      {error && (
        <div className="flex items-center gap-2 p-4 bg-yellow-50 border border-yellow-200 rounded-xl text-yellow-700 mb-6">
          <AlertCircle className="w-5 h-5" />
          <span>{error}</span>
        </div>
      )}

      {/* Subscription banner */}
      {!subscriptionActive && !subscriptionLoading && (
        <div className="slotta-card rounded-2xl p-5 mb-8 flex items-center justify-between gap-4">
          <div>
            <div className="text-sm text-slotta-ink-soft">Subscription</div>
            <div className="text-lg font-semibold text-slotta-ink">Inactive</div>
            <div className="text-sm text-slotta-ink-soft mt-1">Upgrade to unlock full access to SLØTTA features.</div>
          </div>
          <button
            onClick={handleSubscribe}
            className="px-5 py-2.5 rounded-full font-medium text-sm text-white slotta-button flex-shrink-0"
            data-testid="subscribe-btn"
          >
            Subscribe for €12/month
          </button>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map((stat, index) => {
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
              <div className="text-3xl font-bold text-slotta-ink mb-1" data-testid={`stat-${index}`}>
                {loading ? '...' : stat.value}
              </div>
              <div className="text-sm text-slotta-ink-soft">{stat.label}</div>
            </div>
          );
        })}
      </div>

      {/* Today's Bookings */}
      <div className="slotta-card rounded-2xl mb-8 overflow-hidden">
        <div className="p-6 border-b border-slotta-purple/8 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-slotta-ink">Today's Bookings</h3>
          <button
            onClick={() => navigate('/master/bookings')}
            className="text-sm font-medium text-slotta-purple hover:underline"
          >
            View All
          </button>
        </div>
        <div className="p-6">
          {loading ? (
            <div className="text-center py-8 text-slotta-ink-soft">Loading bookings...</div>
          ) : todayBookings.length === 0 ? (
            <div className="text-center py-8 text-slotta-ink-soft">No bookings today</div>
          ) : (
            <div className="space-y-3">
              {todayBookings.map((booking) => (
                <div
                  key={booking.id}
                  className="flex items-center justify-between p-4 rounded-xl border border-slotta-purple/8 hover:bg-slotta-purple-50/30 transition cursor-pointer"
                  onClick={() => navigate(`/master/bookings/${booking.id}`)}
                  data-testid={`booking-${booking.id}`}
                >
                  <div className="flex items-center gap-4 flex-1">
                    <div className="w-10 h-10 rounded-full bg-slotta-purple-50 flex items-center justify-center font-semibold text-slotta-purple text-sm">
                      {booking.client_id ? booking.client_id.substring(0, 2).toUpperCase() : '?'}
                    </div>
                    <div>
                      <div className="font-semibold text-slotta-ink">Client #{booking.client_id}</div>
                      <div className="text-sm text-slotta-ink-soft">Service #{booking.service_id}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <div className="font-semibold text-slotta-ink">
                        {new Date(booking.booking_date).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
                      </div>
                      <div className="text-sm text-slotta-ink-soft">€{booking.slotta_amount || 0} protected</div>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      booking.status === 'confirmed' ? 'bg-green-50 text-green-700' :
                      booking.status === 'pending' ? 'bg-yellow-50 text-yellow-700' :
                      booking.status === 'completed' ? 'bg-slotta-purple-50 text-slotta-purple' :
                      'bg-gray-50 text-slotta-ink-soft'
                    }`}>
                      {booking.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid md:grid-cols-3 gap-6">
        {[
          { icon: Calendar, title: 'Manage Calendar', desc: 'Block time, set availability', path: '/master/calendar' },
          { icon: Shield, title: 'Adjust SLØTTA', desc: 'Update service protection', path: '/master/services' },
          { icon: TrendingUp, title: 'View Analytics', desc: 'See your protection stats', path: '/master/analytics' },
        ].map((action, index) => (
          <div
            key={index}
            className={`slotta-card rounded-2xl p-6 cursor-pointer ${!subscriptionActive ? 'opacity-60 pointer-events-none' : ''}`}
            onClick={() => navigate(action.path)}
          >
            <action.icon className="w-8 h-8 text-slotta-purple mb-3" strokeWidth={1.5} />
            <h3 className="font-semibold text-slotta-ink mb-1">{action.title}</h3>
            <p className="text-sm text-slotta-ink-soft">{action.desc}</p>
          </div>
        ))}
      </div>
    </MasterLayout>
  );
};

export default Dashboard;
export { MasterLayout };
