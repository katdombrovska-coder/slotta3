import React, { useState, useEffect } from 'react';
import { MasterLayout } from './Dashboard';
import { servicesAPI, authAPI } from '@/lib/api';
import { Plus, Edit, Trash, Shield, Clock, DollarSign, X } from 'lucide-react';

const Services = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const master = authAPI.getMaster();
  const masterId = master?.id;

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    duration_minutes: 60,
    price: '',
  });

  const loadServices = async () => {
    if (!masterId) return;
    try {
      setLoading(true);
      const response = await servicesAPI.getByMaster(masterId, false);
      setServices(response.data || []);
    } catch (err) {
      setServices([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { if (masterId) loadServices(); }, [masterId]);

  const calculateSlotta = (price, durationMinutes) => {
    let pct;
    if (durationMinutes < 60) pct = 0.275;
    else if (durationMinutes <= 180) pct = 0.325;
    else pct = 0.40;
    return Math.round(price * pct);
  };

  const handleAdd = async () => {
    try {
      setLoading(true);
      const response = await servicesAPI.create({ master_id: masterId, ...formData });
      setServices([...services, response.data]);
      setShowAddModal(false);
      resetForm();
    } catch (err) {
      alert('Failed to add service.');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = async () => {
    try {
      setLoading(true);
      const response = await servicesAPI.update(editingService.id, formData);
      setServices(services.map(s => s.id === editingService.id ? response.data : s));
      setShowEditModal(false);
      resetForm();
    } catch (err) {
      alert('Failed to update service.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this service?')) return;
    try {
      setLoading(true);
      await servicesAPI.delete(id);
      setServices(services.filter(s => s.id !== id));
    } catch (err) {
      alert('Failed to delete service.');
    } finally {
      setLoading(false);
    }
  };

  const openEditModal = (service) => {
    setEditingService(service);
    setFormData({ name: service.name, description: service.description || '', duration_minutes: service.duration_minutes, price: service.price });
    setShowEditModal(true);
  };

  const resetForm = () => {
    setFormData({ name: '', description: '', duration_minutes: 60, price: '' });
    setEditingService(null);
  };

  const formatDuration = (minutes) => {
    if (minutes < 60) return `${minutes} min`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours} hour${hours > 1 ? 's' : ''}`;
  };

  const estimatedSlotta = calculateSlotta(formData.price || 0, formData.duration_minutes);
  const inputClass = "w-full px-4 py-2.5 rounded-xl border border-slotta-purple/15 bg-white text-slotta-ink placeholder:text-slotta-ink-soft/40 focus:outline-none focus:ring-2 focus:ring-slotta-purple/30 focus:border-slotta-purple/30 transition";

  const ServiceForm = () => (
    <div className="space-y-4">
      <div>
        <label className="text-sm font-medium text-slotta-ink block mb-1.5">Service Name</label>
        <input type="text" placeholder="e.g., Balayage Hair Color" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className={inputClass} required />
      </div>
      <div>
        <label className="text-sm font-medium text-slotta-ink block mb-1.5">Description (optional)</label>
        <textarea rows="2" placeholder="Brief description" value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} className={inputClass} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-sm font-medium text-slotta-ink block mb-1.5">Duration</label>
          <select value={String(formData.duration_minutes)} onChange={e => setFormData({ ...formData, duration_minutes: parseInt(e.target.value, 10) })} className={inputClass}>
            {[30, 45, 60, 90, 120, 150, 180, 240, 300].map(d => (
              <option key={d} value={d}>{formatDuration(d)}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-sm font-medium text-slotta-ink block mb-1.5">Price (€)</label>
          <input type="number" placeholder="150" value={formData.price} onChange={e => setFormData({ ...formData, price: e.target.value === '' ? '' : parseFloat(e.target.value) })} className={inputClass} required />
        </div>
      </div>
      <div className="bg-slotta-purple-50 border border-slotta-purple/15 rounded-xl p-4">
        <div className="flex items-center justify-between mb-1">
          <span className="text-sm font-medium text-slotta-purple">Estimated SLØ Protection:</span>
          <span className="text-2xl font-bold text-slotta-purple">€{estimatedSlotta}</span>
        </div>
        <p className="text-xs text-slotta-ink-soft">Base amount. Adjusts based on client reliability and booking patterns.</p>
      </div>
      <div className="flex gap-3 pt-2">
        <button onClick={() => { setShowAddModal(false); setShowEditModal(false); resetForm(); }} className="flex-1 py-3 rounded-full border border-slotta-purple/15 text-slotta-ink font-medium text-sm hover:bg-slotta-purple-50 transition">Cancel</button>
        <button onClick={showEditModal ? handleEdit : handleAdd} disabled={loading || !formData.name || !formData.price || formData.price <= 0} className="flex-1 py-3 rounded-full bg-slotta-purple text-white font-medium text-sm hover:bg-slotta-purple-dark transition disabled:opacity-50">
          {loading ? 'Saving...' : showEditModal ? 'Save Changes' : 'Add Service'}
        </button>
      </div>
    </div>
  );

  return (
    <MasterLayout active="services" title="Services & SLØ Rules">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-semibold text-slotta-ink mb-1">Manage Your Services</h2>
          <p className="text-sm text-slotta-ink-soft">Set prices, duration, and SLØ protection for each service</p>
        </div>
        <button onClick={() => setShowAddModal(true)} className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-slotta-lime text-slotta-ink font-semibold text-sm hover:bg-slotta-lime-dark transition">
          <Plus className="w-4 h-4" strokeWidth={2} />
          Add Service
        </button>
      </div>

      {/* Services List */}
      <div className="space-y-4 mb-8">
        {services.length === 0 && !loading ? (
          <div className="slotta-card rounded-2xl p-12 text-center">
            <Shield className="w-12 h-12 text-slotta-purple/30 mx-auto mb-3" strokeWidth={1} />
            <p className="text-slotta-ink-soft">No services yet. Click "Add Service" to create your first one.</p>
          </div>
        ) : (
          services.map((service) => (
            <div key={service.id} className={`slotta-card rounded-2xl p-6 ${!service.active ? 'opacity-60' : ''}`}>
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-4">
                    <h3 className="text-lg font-semibold text-slotta-ink">{service.name}</h3>
                    {!service.active && <span className="px-2 py-0.5 rounded-full text-xs bg-gray-100 text-gray-600">Inactive</span>}
                  </div>
                  <div className="grid grid-cols-3 gap-6">
                    <div>
                      <div className="flex items-center gap-1.5 text-slotta-ink-soft mb-1">
                        <Clock className="w-3.5 h-3.5" />
                        <span className="text-xs">Duration</span>
                      </div>
                      <div className="font-semibold text-slotta-ink">{formatDuration(service.duration_minutes)}</div>
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5 text-slotta-ink-soft mb-1">
                        <DollarSign className="w-3.5 h-3.5" />
                        <span className="text-xs">Price</span>
                      </div>
                      <div className="font-semibold text-lg text-slotta-ink">€{service.price}</div>
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5 text-slotta-purple mb-1">
                        <Shield className="w-3.5 h-3.5" />
                        <span className="text-xs font-medium">SLØ</span>
                      </div>
                      <div className="font-bold text-lg text-slotta-purple">€{service.base_slotta}</div>
                      <div className="text-xs text-slotta-ink-soft">{((service.base_slotta / service.price) * 100).toFixed(0)}% of price</div>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => openEditModal(service)} className="w-9 h-9 rounded-full bg-white border border-slotta-purple/10 flex items-center justify-center hover:border-slotta-purple/30 transition">
                    <Edit className="w-4 h-4 text-slotta-ink" />
                  </button>
                  <button onClick={() => handleDelete(service.id)} className="w-9 h-9 rounded-full bg-white border border-red-200 flex items-center justify-center hover:bg-red-50 transition">
                    <Trash className="w-4 h-4 text-red-500" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* SLØ Rules */}
      <div className="slotta-card rounded-2xl p-6">
        <h3 className="text-lg font-semibold text-slotta-ink mb-5">How SLØ is Calculated</h3>
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-semibold text-slotta-ink mb-3">Base Formula</h4>
            <div className="space-y-2 text-sm">
              {[
                { label: 'Short services (< 1 hour)', value: '25-30%' },
                { label: 'Medium (1-3 hours)', value: '30-35%' },
                { label: 'Long (3+ hours)', value: '35-45%' },
              ].map((row, i) => (
                <div key={i} className="flex justify-between p-2 rounded-lg hover:bg-slotta-purple-50/30">
                  <span className="text-slotta-ink-soft">{row.label}</span>
                  <span className="font-semibold text-slotta-ink">{row.value}</span>
                </div>
              ))}
            </div>
          </div>
          <div>
            <h4 className="font-semibold text-slotta-ink mb-3">Adjustments</h4>
            <div className="space-y-2 text-sm">
              {[
                { label: 'New client', value: '+20%', color: 'bg-yellow-50 text-yellow-700' },
                { label: 'Reliable client', value: '-20%', color: 'bg-green-50 text-green-700' },
                { label: 'Peak slot demand', value: '+15%', color: 'bg-blue-50 text-blue-700' },
                { label: 'Cancellation history', value: '+30%', color: 'bg-red-50 text-red-700' },
              ].map((row, i) => (
                <div key={i} className="flex items-center justify-between p-2 rounded-lg hover:bg-slotta-purple-50/30">
                  <span className="text-slotta-ink-soft">{row.label}</span>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${row.color}`}>{row.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="mt-4 p-4 bg-slotta-purple-50 rounded-xl">
          <p className="text-sm text-slotta-purple"><strong>Note:</strong> SLØ never exceeds 70% of service price or drops below €10 for long services.</p>
        </div>
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={() => { setShowAddModal(false); resetForm(); }}>
          <div className="slotta-card rounded-3xl p-8 max-w-md w-full mx-4" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-slotta-ink">Add New Service</h3>
              <button onClick={() => { setShowAddModal(false); resetForm(); }} className="w-8 h-8 rounded-full hover:bg-slotta-purple-50 flex items-center justify-center">
                <X className="w-4 h-4 text-slotta-ink-soft" />
              </button>
            </div>
            <ServiceForm />
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={() => { setShowEditModal(false); resetForm(); }}>
          <div className="slotta-card rounded-3xl p-8 max-w-md w-full mx-4" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-slotta-ink">Edit Service</h3>
              <button onClick={() => { setShowEditModal(false); resetForm(); }} className="w-8 h-8 rounded-full hover:bg-slotta-purple-50 flex items-center justify-center">
                <X className="w-4 h-4 text-slotta-ink-soft" />
              </button>
            </div>
            <ServiceForm />
          </div>
        </div>
      )}
    </MasterLayout>
  );
};

export default Services;
