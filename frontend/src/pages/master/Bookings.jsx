import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MasterLayout } from './Dashboard';
import { bookingsAPI, authAPI } from '@/lib/api';
import { Calendar, Search, Briefcase, CheckCircle, Clock, XCircle } from 'lucide-react';

const Bookings = () => {
  const navigate = useNavigate();
  const [filter, setFilter] = useState('all');
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const master = authAPI.getMaster();
  const masterId = master?.id;

  useEffect(() => {
    if (masterId) loadBookings();
  }, [masterId]);

  const loadBookings = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await bookingsAPI.getByMaster(masterId);
      setBookings(response.data || []);
    } catch (err) {
      setBookings([]);
      setError('Unable to load bookings.');
    } finally {
      setLoading(false);
    }
  };

  const filters = ['all', 'confirmed', 'pending', 'completed', 'no-show'];

  const filteredBookings = filter === 'all'
    ? bookings.filter(b => !search || JSON.stringify(b).toLowerCase().includes(search.toLowerCase()))
    : bookings.filter(b => b.status === filter && (!search || JSON.stringify(b).toLowerCase().includes(search.toLowerCase())));

  const statusPill = (status) => {
    const styles = {
      confirmed: 'bg-green-50 text-green-700 border-green-200',
      pending: 'bg-yellow-50 text-yellow-700 border-yellow-200',
      completed: 'bg-blue-50 text-blue-700 border-blue-200',
      'no-show': 'bg-red-50 text-red-700 border-red-200',
      rescheduled: 'bg-gray-50 text-gray-700 border-gray-200',
    };
    return styles[status] || styles.pending;
  };

  const summaryStats = [
    { label: 'Total Bookings', value: bookings.length, icon: Briefcase, color: 'purple' },
    { label: 'Confirmed', value: bookings.filter(b => b.status === 'confirmed').length, icon: CheckCircle, color: 'lime' },
    { label: 'Completed', value: bookings.filter(b => b.status === 'completed').length, icon: Clock, color: 'purple' },
    { label: 'No-Shows', value: bookings.filter(b => b.status === 'no-show').length, icon: XCircle, color: 'lime' },
  ];

  return (
    <MasterLayout active="bookings" title="Appointments">
      {/* Filters + Search */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
        <div className="flex flex-wrap items-center gap-2">
          {filters.map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition ${
                filter === status
                  ? 'bg-slotta-purple text-white'
                  : 'bg-white text-slotta-ink-soft border border-slotta-purple/10 hover:border-slotta-purple/30'
              }`}
            >
              {status.charAt(0).toUpperCase() + status.slice(1).replace('-', ' ')}
            </button>
          ))}
        </div>
        <div className="relative w-full md:w-64">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slotta-ink-soft/40" />
          <input
            type="text"
            placeholder="Search bookings..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-full border border-slotta-purple/10 bg-white text-sm text-slotta-ink placeholder:text-slotta-ink-soft/40 focus:outline-none focus:ring-2 focus:ring-slotta-purple/20"
          />
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 p-4 bg-yellow-50 border border-yellow-200 rounded-xl text-yellow-700 text-sm mb-6">
          {error}
        </div>
      )}

      {/* Bookings List */}
      <div className="slotta-card rounded-2xl overflow-hidden mb-8">
        {loading ? (
          <div className="text-center py-12 text-slotta-ink-soft">Loading bookings...</div>
        ) : filteredBookings.length === 0 ? (
          <div className="text-center py-12 text-slotta-ink-soft">No bookings found</div>
        ) : (
          <div className="divide-y divide-slotta-purple/8">
            {filteredBookings.map((booking) => {
              const bookingDate = new Date(booking.booking_date);
              return (
                <div
                  key={booking.id}
                  className="p-5 hover:bg-slotta-purple-50/30 transition cursor-pointer flex items-center justify-between"
                  onClick={() => navigate(`/master/bookings/${booking.id}`)}
                >
                  <div className="flex items-center gap-4 flex-1">
                    <div className="w-11 h-11 rounded-full bg-slotta-purple-50 border border-slotta-purple/10 flex items-center justify-center font-semibold text-slotta-purple text-sm">
                      {booking.client_id ? booking.client_id.substring(0, 2).toUpperCase() : '?'}
                    </div>
                    <div>
                      <div className="font-semibold text-slotta-ink">Client #{booking.client_id || 'Unknown'}</div>
                      <div className="text-sm text-slotta-ink-soft">Service #{booking.service_id || 'Unknown'}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <div className="flex items-center gap-2 text-slotta-ink-soft mb-0.5">
                        <Calendar className="w-3.5 h-3.5" />
                        <span className="text-sm">{bookingDate.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}</span>
                        <span className="font-semibold text-slotta-ink">{bookingDate.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                      <div className="text-sm text-slotta-ink-soft">€{booking.service_price || 0} · SLØ €{booking.slotta_amount || 0}</div>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium border ${statusPill(booking.status)}`}>
                      {booking.status}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {summaryStats.map((stat, idx) => {
          const Icon = stat.icon;
          const isPurple = stat.color === 'purple';
          return (
            <div key={idx} className="slotta-card rounded-2xl p-5">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${
                isPurple ? 'bg-slotta-purple-50 border border-slotta-purple/10' : 'bg-slotta-lime-50 border border-slotta-lime/20'
              }`}>
                <Icon className={`w-5 h-5 ${isPurple ? 'text-slotta-purple' : 'text-slotta-lime-dark'}`} strokeWidth={1.5} />
              </div>
              <div className="text-2xl font-bold text-slotta-ink">{stat.value}</div>
              <div className="text-sm text-slotta-ink-soft">{stat.label}</div>
            </div>
          );
        })}
      </div>
    </MasterLayout>
  );
};

export default Bookings;
