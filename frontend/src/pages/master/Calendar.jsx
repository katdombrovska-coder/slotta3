import React, { useState, useEffect } from 'react';
import { MasterLayout } from './Dashboard';
import { ChevronLeft, ChevronRight, Plus, X } from 'lucide-react';
import { calendarAPI, bookingsAPI, authAPI } from '@/lib/api';

const Calendar = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [showBlockModal, setShowBlockModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [bookings, setBookings] = useState([]);
  const [blocks, setBlocks] = useState([]);
  const master = authAPI.getMaster();
  const masterId = master?.id;

  const [blockForm, setBlockForm] = useState({
    date: '',
    start_time: '09:00',
    end_time: '17:00',
    reason: ''
  });

  useEffect(() => {
    if (masterId) loadCalendarData();
  }, [masterId, currentDate]);

  const loadCalendarData = async () => {
    try {
      const [bookingsRes, blocksRes] = await Promise.all([
        bookingsAPI.getByMaster(masterId),
        calendarAPI.getBlocksByMaster(masterId)
      ]);
      setBookings(bookingsRes.data || []);
      setBlocks(blocksRes.data || []);
    } catch (err) {
      console.error('Failed to load calendar:', err);
    }
  };

  const hours = Array.from({ length: 13 }, (_, i) => i + 8);

  const getWeekDays = () => {
    const days = [];
    const start = new Date(currentDate);
    start.setDate(start.getDate() - start.getDay() + 1);
    for (let i = 0; i < 7; i++) {
      const day = new Date(start);
      day.setDate(start.getDate() + i);
      days.push(day);
    }
    return days;
  };

  const weekDays = getWeekDays();

  const handleBlockTime = async () => {
    try {
      setLoading(true);
      const startDateTime = new Date(`${blockForm.date}T${blockForm.start_time}:00`);
      const endDateTime = new Date(`${blockForm.date}T${blockForm.end_time}:00`);
      await calendarAPI.createBlock({
        master_id: masterId,
        start_datetime: startDateTime.toISOString(),
        end_datetime: endDateTime.toISOString(),
        reason: blockForm.reason
      });
      setShowBlockModal(false);
      setBlockForm({ date: '', start_time: '09:00', end_time: '17:00', reason: '' });
      loadCalendarData();
    } catch (err) {
      alert('Failed to block time.');
    } finally {
      setLoading(false);
    }
  };

  const inputClass = "w-full px-4 py-2.5 rounded-xl border border-slotta-purple/15 bg-white text-slotta-ink placeholder:text-slotta-ink-soft/40 focus:outline-none focus:ring-2 focus:ring-slotta-purple/30 focus:border-slotta-purple/30 transition";

  return (
    <MasterLayout active="calendar" title="Calendar">
      {/* Calendar Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1">
            <button onClick={() => { const d = new Date(currentDate); d.setDate(d.getDate() - 7); setCurrentDate(d); }} className="w-9 h-9 rounded-full bg-white border border-slotta-purple/10 flex items-center justify-center hover:border-slotta-purple/30 transition">
              <ChevronLeft className="w-4 h-4 text-slotta-ink" />
            </button>
            <button onClick={() => setCurrentDate(new Date())} className="px-4 py-2 rounded-full bg-white border border-slotta-purple/10 text-sm font-medium text-slotta-ink hover:border-slotta-purple/30 transition">
              Today
            </button>
            <button onClick={() => { const d = new Date(currentDate); d.setDate(d.getDate() + 7); setCurrentDate(d); }} className="w-9 h-9 rounded-full bg-white border border-slotta-purple/10 flex items-center justify-center hover:border-slotta-purple/30 transition">
              <ChevronRight className="w-4 h-4 text-slotta-ink" />
            </button>
          </div>
          <h2 className="text-lg font-semibold text-slotta-ink">
            {currentDate.toLocaleString('en-GB', { month: 'long', year: 'numeric' })}
          </h2>
        </div>
        <button
          onClick={() => setShowBlockModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-slotta-lime text-slotta-ink font-semibold text-sm hover:bg-slotta-lime-dark transition"
        >
          <Plus className="w-4 h-4" strokeWidth={2} />
          Block Time
        </button>
      </div>

      {/* Calendar Grid */}
      <div className="slotta-card rounded-2xl overflow-hidden mb-6">
        <div className="overflow-x-auto">
          {/* Day headers */}
          <div className="grid grid-cols-8 border-b border-slotta-purple/8">
            <div className="p-3 border-r border-slotta-purple/8 text-xs text-slotta-ink-soft font-medium">Time</div>
            {weekDays.map((day, idx) => {
              const isToday = day.toDateString() === new Date().toDateString();
              return (
                <div key={idx} className={`p-3 border-r border-slotta-purple/8 text-center ${isToday ? 'bg-slotta-purple-50' : ''}`}>
                  <div className="text-xs text-slotta-ink-soft">{day.toLocaleDateString('en-GB', { weekday: 'short' })}</div>
                  <div className={`text-lg font-bold ${isToday ? 'text-slotta-purple' : 'text-slotta-ink'}`}>{day.getDate()}</div>
                </div>
              );
            })}
          </div>

          {/* Time slots */}
          {hours.map((hour) => (
            <div key={hour} className="grid grid-cols-8 border-b border-slotta-purple/8">
              <div className="p-3 border-r border-slotta-purple/8 text-xs text-slotta-ink-soft">{hour}:00</div>
              {weekDays.map((day, dayIdx) => {
                const dateStr = day.toISOString().split('T')[0];
                const dayBookings = bookings.filter(b => b.date === dateStr);
                const hourBookings = dayBookings.filter(b => parseInt(b.start?.split(':')[0]) === hour);
                const isBlocked = blocks.some(block => {
                  const blockDate = block.start_datetime?.split('T')[0];
                  if (blockDate !== dateStr) return false;
                  const blockStart = parseInt(block.start_datetime?.split('T')[1]?.split(':')[0] || 0);
                  const blockEnd = parseInt(block.end_datetime?.split('T')[1]?.split(':')[0] || 0);
                  return hour >= blockStart && hour < blockEnd;
                });
                const blockInfo = blocks.find(block => {
                  const blockDate = block.start_datetime?.split('T')[0];
                  if (blockDate !== dateStr) return false;
                  return parseInt(block.start_datetime?.split('T')[1]?.split(':')[0] || 0) === hour;
                });

                return (
                  <div key={dayIdx} className={`border-r border-slotta-purple/8 p-2 min-h-[72px] ${isBlocked ? 'bg-slotta-purple-50/50' : 'hover:bg-slotta-purple-50/20'}`}>
                    {blockInfo && (
                      <div className="bg-slotta-purple/10 border-l-4 border-slotta-purple rounded-lg p-2 mb-1 text-xs">
                        <div className="font-semibold text-slotta-purple">Blocked</div>
                        <div className="text-slotta-ink-soft">{blockInfo.reason || 'Unavailable'}</div>
                      </div>
                    )}
                    {hourBookings.map((booking) => (
                      <div key={booking.id} className="bg-slotta-lime/20 border-l-4 border-slotta-lime rounded-lg p-2 mb-1 text-xs">
                        <div className="font-semibold text-slotta-ink">{booking.start}</div>
                        <div className="text-slotta-ink-soft">{booking.client}</div>
                      </div>
                    ))}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {(() => {
          const now = new Date();
          const weekStart = new Date(now);
          weekStart.setDate(now.getDate() - now.getDay() + 1);
          weekStart.setHours(0, 0, 0, 0);
          const weekEnd = new Date(weekStart);
          weekEnd.setDate(weekStart.getDate() + 7);

          const weekBookings = bookings.filter(b => {
            const d = new Date(b.booking_date);
            return d >= weekStart && d < weekEnd && (b.status === 'confirmed' || b.status === 'pending');
          }).length;

          const blockedHours = blocks.reduce((total, block) => {
            const start = new Date(block.start_datetime);
            const end = new Date(block.end_datetime);
            return total + (end - start) / (1000 * 60 * 60);
          }, 0);

          const totalSlots = 8 * 6 * 2;
          const usedSlots = weekBookings + Math.round(blockedHours * 2);
          const utilization = totalSlots > 0 ? Math.round((usedSlots / totalSlots) * 100) : 0;

          const stats = [
            { label: 'This Week', value: `${weekBookings} booking${weekBookings !== 1 ? 's' : ''}`, color: 'purple' },
            { label: 'Available Slots', value: Math.max(0, totalSlots - usedSlots), color: 'lime' },
            { label: 'Blocked Time', value: `${Math.round(blockedHours)}h`, color: 'purple' },
            { label: 'Utilization', value: `${utilization}%`, color: 'lime' },
          ];

          return stats.map((stat, idx) => (
            <div key={idx} className="slotta-card rounded-2xl p-5">
              <div className={`text-2xl font-bold mb-1 ${stat.color === 'purple' ? 'text-slotta-purple' : 'text-slotta-lime-dark'}`}>{stat.value}</div>
              <div className="text-sm text-slotta-ink-soft">{stat.label}</div>
            </div>
          ));
        })()}
      </div>

      {/* Block Time Modal */}
      {showBlockModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={() => setShowBlockModal(false)}>
          <div className="slotta-card rounded-3xl p-8 max-w-md w-full mx-4" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-slotta-ink">Block Time</h3>
              <button onClick={() => setShowBlockModal(false)} className="w-8 h-8 rounded-full hover:bg-slotta-purple-50 flex items-center justify-center">
                <X className="w-4 h-4 text-slotta-ink-soft" />
              </button>
            </div>
            <p className="text-sm text-slotta-ink-soft mb-5">Block time on your calendar to prevent bookings during specific periods.</p>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-slotta-ink block mb-1.5">Date</label>
                <input type="date" value={blockForm.date} onChange={e => setBlockForm({ ...blockForm, date: e.target.value })} className={inputClass} required />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium text-slotta-ink block mb-1.5">Start</label>
                  <input type="time" value={blockForm.start_time} onChange={e => setBlockForm({ ...blockForm, start_time: e.target.value })} className={inputClass} required />
                </div>
                <div>
                  <label className="text-sm font-medium text-slotta-ink block mb-1.5">End</label>
                  <input type="time" value={blockForm.end_time} onChange={e => setBlockForm({ ...blockForm, end_time: e.target.value })} className={inputClass} required />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-slotta-ink block mb-1.5">Reason (optional)</label>
                <input type="text" placeholder="e.g., Lunch break" value={blockForm.reason} onChange={e => setBlockForm({ ...blockForm, reason: e.target.value })} className={inputClass} />
              </div>
              <div className="flex gap-3 pt-2">
                <button onClick={() => setShowBlockModal(false)} className="flex-1 py-3 rounded-full border border-slotta-purple/15 text-slotta-ink font-medium text-sm hover:bg-slotta-purple-50 transition">Cancel</button>
                <button onClick={handleBlockTime} disabled={loading || !blockForm.date} className="flex-1 py-3 rounded-full bg-slotta-purple text-white font-medium text-sm hover:bg-slotta-purple-dark transition disabled:opacity-50">
                  {loading ? 'Blocking...' : 'Block Time'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </MasterLayout>
  );
};

export default Calendar;
