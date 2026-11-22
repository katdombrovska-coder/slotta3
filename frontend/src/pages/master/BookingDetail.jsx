import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MasterLayout } from './Dashboard';
import { messagesAPI, bookingsAPI, servicesAPI, clientsAPI, authAPI } from '@/lib/api';
import { 
  Clock, Calendar, Shield, User, Phone, Mail,
  AlertTriangle, CheckCircle, XCircle, MessageCircle, Loader2,
  ArrowLeft, Euro, FileText, Send
} from 'lucide-react';

const BookingDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [messageText, setMessageText] = useState('');
  const [loading, setLoading] = useState(true);
  const [sendingMessage, setSendingMessage] = useState(false);
  const [booking, setBooking] = useState(null);
  const [service, setService] = useState(null);
  const [client, setClient] = useState(null);
  
  const master = authAPI.getMaster();
  const masterId = master?.id;

  useEffect(() => {
    if (id) {
      loadBookingDetails();
    }
  }, [id]);

  const loadBookingDetails = async () => {
    try {
      setLoading(true);
      const bookingRes = await bookingsAPI.getById(id);
      const bookingData = bookingRes.data;
      setBooking(bookingData);
      
      try {
        const serviceRes = await servicesAPI.getById(bookingData.service_id);
        setService(serviceRes.data);
      } catch (e) { console.error('Failed to load service:', e); }
      
      try {
        const clientRes = await clientsAPI.getById(bookingData.client_id);
        setClient(clientRes.data);
      } catch (e) { console.error('Failed to load client:', e); }
      
    } catch (error) {
      console.error('Failed to load booking:', error);
      alert('Failed to load booking details');
      navigate('/master/bookings');
    } finally {
      setLoading(false);
    }
  };

  const statusStyles = {
    confirmed: { bg: 'bg-slotta-lime-50', text: 'text-slotta-lime-dark', label: 'Confirmed' },
    pending: { bg: 'bg-yellow-50', text: 'text-yellow-700', label: 'Pending' },
    completed: { bg: 'bg-slotta-purple-50', text: 'text-slotta-purple', label: 'Completed' },
    cancelled: { bg: 'bg-gray-50', text: 'text-slotta-ink-soft', label: 'Cancelled' },
    'no-show': { bg: 'bg-red-50', text: 'text-red-600', label: 'No-Show' },
  };

  const reliabilityStyles = {
    reliable: { bg: 'bg-slotta-lime-50', text: 'text-slotta-lime-dark', label: 'Reliable' },
    new: { bg: 'bg-yellow-50', text: 'text-yellow-700', label: 'New' },
    'needs-protection': { bg: 'bg-red-50', text: 'text-red-600', label: 'Needs Protection' },
  };

  const handleComplete = async () => {
    try {
      await bookingsAPI.complete(id);
      alert('Booking marked as completed!');
      navigate('/master/bookings');
    } catch (error) {
      console.error('Failed to complete booking:', error);
      alert('Failed to update booking');
    }
  };

  const handleSendMessage = async () => {
    if (!messageText.trim()) {
      alert('Please enter a message');
      return;
    }
    try {
      setSendingMessage(true);
      await messagesAPI.sendToClient({
        master_id: masterId,
        client_id: booking.client_id,
        booking_id: id,
        message: messageText
      });
      alert('Message sent successfully!');
      setShowMessageModal(false);
      setMessageText('');
    } catch (error) {
      console.error('Failed to send message:', error);
      alert('Failed to send message. Please try again.');
    } finally {
      setSendingMessage(false);
    }
  };

  const handleNoShow = async () => {
    if (window.confirm('Mark this booking as no-show? The SLØ hold will be captured.')) {
      try {
        const response = await bookingsAPI.noShow(id);
        alert(`No-show processed! Master compensation: €${response.data.master_compensation}\nClient wallet credit: €${response.data.client_wallet_credit}`);
        navigate('/master/bookings');
      } catch (error) {
        console.error('Failed to mark no-show:', error);
        alert('Failed to process no-show');
      }
    }
  };

  if (loading) {
    return (
      <MasterLayout active="bookings" title="Booking Details">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 text-slotta-purple animate-spin" strokeWidth={1.5} />
        </div>
      </MasterLayout>
    );
  }

  if (!booking) {
    return (
      <MasterLayout active="bookings" title="Booking Details">
        <div className="text-center py-12 text-slotta-ink-soft">Booking not found</div>
      </MasterLayout>
    );
  }

  const bookingDate = booking.booking_date ? new Date(booking.booking_date) : new Date();
  const status = statusStyles[booking.status] || statusStyles.pending;

  return (
    <MasterLayout active="bookings" title="Booking Details">
      <div className="max-w-5xl">
        <button 
          onClick={() => navigate('/master/bookings')} 
          className="flex items-center gap-2 text-slotta-ink-soft hover:text-slotta-purple transition mb-6 text-sm font-medium"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Bookings
        </button>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Main Details */}
          <div className="md:col-span-2 space-y-6">
            {/* Booking Info Card */}
            <div className="slotta-card rounded-2xl overflow-hidden">
              <div className="p-6 border-b border-slotta-purple/8 flex items-center justify-between">
                <h3 className="text-lg font-semibold text-slotta-ink">Booking Information</h3>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${status.bg} ${status.text}`}>
                  {status.label}
                </span>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm text-slotta-ink-soft mb-1">Service</div>
                    <div className="font-semibold text-slotta-ink">{service?.name || 'Service'}</div>
                  </div>
                  <div>
                    <div className="text-sm text-slotta-ink-soft mb-1">Duration</div>
                    <div className="font-semibold text-slotta-ink">{booking.duration_minutes || service?.duration_minutes || 60} minutes</div>
                  </div>
                  <div>
                    <div className="text-sm text-slotta-ink-soft mb-1">Date & Time</div>
                    <div className="font-semibold text-slotta-ink flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-slotta-purple" strokeWidth={1.5} />
                      <span>{bookingDate.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</span>
                    </div>
                    <div className="font-semibold text-slotta-ink flex items-center gap-2 mt-1">
                      <Clock className="w-4 h-4 text-slotta-purple" strokeWidth={1.5} />
                      <span>{bookingDate.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-slotta-ink-soft mb-1">Booked On</div>
                    <div className="font-semibold text-slotta-ink">
                      {booking.created_at ? new Date(booking.created_at).toLocaleDateString('en-GB') : 'N/A'}
                    </div>
                  </div>
                </div>

                <div className="border-t border-slotta-purple/8 mt-5 pt-4">
                  <div className="text-sm text-slotta-ink-soft mb-1">Notes</div>
                  <p className="text-slotta-ink text-sm">{booking.notes || 'No notes added'}</p>
                </div>
              </div>
            </div>

            {/* Client Info Card */}
            <div className="slotta-card rounded-2xl overflow-hidden">
              <div className="p-6 border-b border-slotta-purple/8">
                <h3 className="text-lg font-semibold text-slotta-ink">Client Information</h3>
              </div>
              <div className="p-6">
                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 bg-slotta-purple rounded-full flex items-center justify-center text-white text-xl font-bold flex-shrink-0">
                    {client?.name?.split(' ').map(n => n[0]).join('').toUpperCase() || '?'}
                  </div>
                  <div className="flex-1">
                    <h4 className="text-xl font-semibold text-slotta-ink mb-2">{client?.name || 'Client'}</h4>
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2 text-slotta-ink-soft text-sm">
                        <Mail className="w-4 h-4 text-slotta-purple" strokeWidth={1.5} />
                        <span>{client?.email || 'No email'}</span>
                      </div>
                      {client?.phone && (
                        <div className="flex items-center gap-2 text-slotta-ink-soft text-sm">
                          <Phone className="w-4 h-4 text-slotta-purple" strokeWidth={1.5} />
                          <span>{client.phone}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    {client?.reliability && (
                      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${reliabilityStyles[client.reliability]?.bg || 'bg-gray-50'} ${reliabilityStyles[client.reliability]?.text || 'text-slotta-ink-soft'}`}>
                        {client.reliability === 'reliable' && <CheckCircle className="w-3 h-3" />}
                        {client.reliability === 'needs-protection' && <AlertTriangle className="w-3 h-3" />}
                        {reliabilityStyles[client.reliability]?.label || client.reliability}
                      </span>
                    )}
                    <div className="text-sm text-slotta-ink-soft mt-2">
                      {client?.total_bookings || 0} bookings • {client?.no_shows || 0} no-shows
                    </div>
                  </div>
                </div>
                
                <div className="mt-5 pt-4 border-t border-slotta-purple/8">
                  <button 
                    onClick={() => setShowMessageModal(true)}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-full border border-slotta-purple/15 text-slotta-ink text-sm font-medium hover:border-slotta-purple/40 hover:bg-slotta-purple-50 transition"
                    data-testid="message-client-btn"
                  >
                    <MessageCircle className="w-4 h-4 text-slotta-purple" strokeWidth={1.5} />
                    Message Client
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Pricing Card */}
            <div className="slotta-card rounded-2xl overflow-hidden">
              <div className="p-6 border-b border-slotta-purple/8">
                <h3 className="text-lg font-semibold text-slotta-ink">Pricing & Protection</h3>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-slotta-ink-soft text-sm">Service Price</span>
                    <span className="text-2xl font-bold text-slotta-ink">€{booking.service_price || service?.price || 0}</span>
                  </div>
                  <div className="flex items-center justify-between border-t border-slotta-purple/8 pt-4">
                    <div className="flex items-center gap-2 text-slotta-purple">
                      <Shield className="w-5 h-5" strokeWidth={1.5} />
                      <span className="font-medium text-sm">SLØ Amount</span>
                    </div>
                    <span className="text-2xl font-bold text-slotta-purple">€{booking.slotta_amount || 0}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm text-slotta-ink-soft">
                    <span>Risk Score</span>
                    <span className="font-medium">{booking.risk_score || 0}%</span>
                  </div>
                  {booking.stripe_payment_intent_id && (
                    <div className="flex items-center gap-2 text-slotta-lime-dark text-sm">
                      <CheckCircle className="w-4 h-4" strokeWidth={2} />
                      <span>Payment Authorized</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Reschedule Policy */}
            <div className="slotta-card rounded-2xl overflow-hidden">
              <div className="p-6 border-b border-slotta-purple/8">
                <h3 className="text-lg font-semibold text-slotta-ink">Reschedule Policy</h3>
              </div>
              <div className="p-6">
                <div className="space-y-3 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-slotta-ink-soft">Free Reschedule Until</span>
                    <span className="font-semibold text-slotta-ink">
                      {booking.reschedule_deadline 
                        ? new Date(booking.reschedule_deadline).toLocaleDateString('en-GB', {
                            day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
                          })
                        : 'N/A'}
                    </span>
                  </div>
                  {booking.reschedule_deadline && new Date() > new Date(booking.reschedule_deadline) && (
                    <div className="flex items-center gap-2 text-yellow-600 text-sm">
                      <AlertTriangle className="w-4 h-4" />
                      <span>Reschedule deadline passed</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Actions */}
            {(booking.status === 'confirmed' || booking.status === 'pending') && (
              <div className="slotta-card rounded-2xl overflow-hidden">
                <div className="p-6 border-b border-slotta-purple/8">
                  <h3 className="text-lg font-semibold text-slotta-ink">Actions</h3>
                </div>
                <div className="p-6 space-y-3">
                  <button 
                    onClick={handleComplete}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-full bg-slotta-lime text-slotta-ink font-semibold text-sm hover:bg-slotta-lime-dark transition"
                    data-testid="complete-booking-btn"
                  >
                    <CheckCircle className="w-4 h-4" strokeWidth={2} />
                    Mark as Completed
                  </button>
                  <button 
                    onClick={handleNoShow}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-full border border-red-200 text-red-600 text-sm font-medium hover:bg-red-50 transition"
                    data-testid="no-show-btn"
                  >
                    <XCircle className="w-4 h-4" strokeWidth={2} />
                    Mark as No-Show
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Message Modal */}
      {showMessageModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm" onClick={() => setShowMessageModal(false)}>
          <div className="slotta-card rounded-3xl max-w-lg w-full p-8" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-slotta-purple rounded-xl flex items-center justify-center">
                <MessageCircle className="w-5 h-5 text-white" strokeWidth={1.5} />
              </div>
              <h3 className="text-lg font-semibold text-slotta-ink">Message {client?.name || 'Client'}</h3>
            </div>
            <div className="space-y-4">
              <textarea
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                rows={4}
                placeholder="Type your message here..."
                className="w-full px-4 py-3 rounded-xl border border-slotta-purple/15 bg-white text-slotta-ink placeholder:text-slotta-ink-soft/40 focus:outline-none focus:ring-2 focus:ring-slotta-purple/30 focus:border-slotta-purple/30 transition resize-none"
                data-testid="message-textarea"
              />
              <div className="flex gap-3">
                <button 
                  onClick={() => setShowMessageModal(false)} 
                  className="flex-1 py-3 rounded-full border border-slotta-purple/15 text-slotta-ink font-medium text-sm hover:bg-slotta-purple-50 transition"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleSendMessage} 
                  className="flex-1 flex items-center justify-center gap-2 py-3 rounded-full bg-slotta-purple text-white font-medium text-sm hover:bg-slotta-purple-dark transition disabled:opacity-50"
                  disabled={sendingMessage}
                  data-testid="send-message-btn"
                >
                  {sendingMessage ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      Send Message
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </MasterLayout>
  );
};

export default BookingDetail;
