import React, { useState, useEffect } from 'react';
import { MasterLayout } from './Dashboard';
import { clientsAPI, authAPI } from '@/lib/api';
import { Star, TrendingUp, AlertTriangle, CheckCircle, Users } from 'lucide-react';

const Clients = () => {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const master = authAPI.getMaster();
  const masterId = master?.id;

  useEffect(() => {
    if (masterId) loadClients();
  }, [masterId]);

  const loadClients = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await clientsAPI.getByMaster(masterId);
      setClients(response.data || []);
    } catch (err) {
      setClients([]);
      setError('Unable to load clients.');
    } finally {
      setLoading(false);
    }
  };

  const reliabilityConfig = {
    reliable: { icon: CheckCircle, label: 'Reliable', color: 'green' },
    new: { icon: Star, label: 'New Client', color: 'yellow' },
    'needs-protection': { icon: AlertTriangle, label: 'Needs Protection', color: 'red' },
  };

  const statCards = [
    { label: 'Total Clients', value: clients.length, icon: Users, color: 'purple' },
    { label: 'Reliable', value: clients.filter(c => c.reliability === 'reliable').length, icon: CheckCircle, color: 'lime' },
    { label: 'New Clients', value: clients.filter(c => c.reliability === 'new').length, icon: TrendingUp, color: 'purple' },
    { label: 'High Risk', value: clients.filter(c => c.reliability === 'needs-protection').length, icon: AlertTriangle, color: 'lime' },
  ];

  return (
    <MasterLayout active="clients" title="Client Reliability">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {statCards.map((stat, idx) => {
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

      {/* Clients List */}
      <div className="slotta-card rounded-2xl mb-8 overflow-hidden">
        <div className="p-5 border-b border-slotta-purple/8">
          <h3 className="text-lg font-semibold text-slotta-ink">All Clients</h3>
        </div>
        <div className="p-5">
          {error ? (
            <div className="text-center py-8 text-yellow-700 bg-yellow-50 border border-yellow-200 rounded-xl text-sm">{error}</div>
          ) : loading ? (
            <div className="text-center py-8 text-slotta-ink-soft">Loading clients...</div>
          ) : clients.length === 0 ? (
            <div className="text-center py-8 text-slotta-ink-soft">No clients yet. They'll appear here after their first booking.</div>
          ) : (
            <div className="space-y-3">
              {clients.map((client) => {
                const config = reliabilityConfig[client.reliability] || reliabilityConfig.new;
                const ReliabilityIcon = config.icon;
                const badgeStyles = {
                  green: 'bg-slotta-lime-50 text-slotta-lime-dark border-slotta-lime/20',
                  yellow: 'bg-yellow-50 text-yellow-700 border-yellow-200',
                  red: 'bg-red-50 text-red-700 border-red-200',
                };
                return (
                  <div key={client.id} className="flex items-center justify-between p-4 rounded-xl border border-slotta-purple/8 hover:bg-slotta-purple-50/30 transition">
                    <div className="flex items-center gap-4 flex-1">
                      <div className="w-11 h-11 rounded-full bg-slotta-purple-50 border border-slotta-purple/10 flex items-center justify-center font-semibold text-slotta-purple text-sm">
                        {client.name?.split(' ').map(n => n[0]).join('') || '?'}
                      </div>
                      <div>
                        <div className="font-semibold text-slotta-ink">{client.name}</div>
                        <div className="text-sm text-slotta-ink-soft">{client.email}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="text-center">
                        <div className="text-xl font-bold text-slotta-purple">{client.total_bookings || 0}</div>
                        <div className="text-xs text-slotta-ink-soft">Bookings</div>
                      </div>
                      <div className="text-center">
                        <div className="text-xl font-bold text-slotta-lime-dark">{client.completed_bookings || 0}</div>
                        <div className="text-xs text-slotta-ink-soft">Completed</div>
                      </div>
                      <div className="text-center">
                        <div className="text-xl font-bold text-red-600">{client.no_shows || 0}</div>
                        <div className="text-xs text-slotta-ink-soft">No-Shows</div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold text-slotta-ink">€{client.wallet_balance || 0}</div>
                        <div className="text-xs text-slotta-ink-soft">Balance</div>
                      </div>
                      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium border ${badgeStyles[config.color]}`}>
                        <ReliabilityIcon className="w-3 h-3" />
                        {config.label}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Reliability Explanation */}
      <div className="slotta-card rounded-2xl p-6">
        <h3 className="text-lg font-semibold text-slotta-ink mb-5">Reliability Tags Explained</h3>
        <div className="grid md:grid-cols-3 gap-5">
          {[
            { icon: CheckCircle, title: 'Reliable', color: 'text-slotta-lime-dark', bg: 'bg-slotta-lime-50', desc: 'Excellent booking history with 0-1 no-shows. SLØ reduced by 20%.' },
            { icon: Star, title: 'New Client', color: 'text-yellow-600', bg: 'bg-yellow-50', desc: 'First-time or early bookings. SLØ increased by 20% as protection.' },
            { icon: AlertTriangle, title: 'Needs Protection', color: 'text-red-600', bg: 'bg-red-50', desc: 'History of 2+ no-shows. SLØ increased by 30% to protect your time.' },
          ].map((item, idx) => (
            <div key={idx} className={`${item.bg} rounded-xl p-5`}>
              <div className="flex items-center gap-2 mb-3">
                <item.icon className={`w-5 h-5 ${item.color}`} />
                <h4 className="font-semibold text-slotta-ink">{item.title}</h4>
              </div>
              <p className="text-sm text-slotta-ink-soft">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </MasterLayout>
  );
};

export default Clients;
