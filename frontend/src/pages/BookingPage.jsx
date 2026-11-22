import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { Clock, MapPin, Shield, CheckCircle, Info, Loader2, AlertCircle, ArrowLeft, ArrowRight, Calendar } from 'lucide-react';
import { mastersAPI, servicesAPI, bookingsAPI } from '@/lib/api';

const stripePublishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;
const stripePromise = stripePublishableKey ? loadStripe(stripePublishableKey) : null;

const StripeCardForm = ({ onSubmit, loading, slottaAmount, masterName }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [error, setError] = useState(null);
  const [processing, setProcessing] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!stripe || !elements) return;
    setProcessing(true);
    setError(null);
    const cardElement = elements.getElement(CardElement);
    try {
      const { error: stripeError, paymentMethod } = await stripe.createPaymentMethod({
        type: 'card',
        card: cardElement,
      });
      if (stripeError) { setError(stripeError.message); setProcessing(false); return; }
      await onSubmit(paymentMethod.id);
    } catch (err) {
      setError(err.message || 'Payment failed');
      setProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="slotta-card rounded-2xl p-6 mb-5">
        <h3 className="font-semibold text-slotta-ink mb-4">Payment Information</h3>
        <div className="p-4 border border-slotta-purple/15 rounded-xl bg-white">
          <CardElement
            options={{
              style: {
                base: { fontSize: '16px', color: '#1A1A2E', '::placeholder': { color: '#9CA3AF' } },
                invalid: { color: '#ef4444' },
              },
            }}
          />
        </div>
        {error && (
          <div className="mt-3 flex items-center gap-2 text-red-600 text-sm">
            <AlertCircle className="w-4 h-4" />
            <span>{error}</span>
          </div>
        )}
        <p className="text-xs text-slotta-ink-soft mt-3">
          Your card will be authorized for €{slottaAmount}. This is a hold, not a charge.
        </p>
      </div>
      <button
        type="submit"
        disabled={!stripe || processing || loading}
        className="w-full py-3.5 rounded-full bg-slotta-purple text-white font-semibold text-sm hover:bg-slotta-purple-dark transition disabled:opacity-50 flex items-center justify-center gap-2"
        data-testid="authorize-payment-btn"
      >
        {processing || loading ? (
          <><Loader2 className="w-4 h-4 animate-spin" /> Processing...</>
        ) : (
          `Authorize €${slottaAmount}`
        )}
      </button>
    </form>
  );
};

const BookingPage = () => {
  const { mastername } = useParams();
  const navigate = useNavigate();
  const [master, setMaster] = useState(null);
  const [services, setServices] = useState([]);
  const [selectedService, setSelectedService] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [showPayment, setShowPayment] = useState(false);
  const [bookingComplete, setBookingComplete] = useState(false);
  const [bookingDetails, setBookingDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [processingBooking, setProcessingBooking] = useState(false);
  const [formError, setFormError] = useState('');

  const [clientData, setClientData] = useState({ name: '', email: '', phone: '' });

  const generateTimeSlots = () => {
    const slots = [];
    const today = new Date();
    for (let i = 1; i <= 7; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      if (date.getDay() === 0) continue;
      const daySlots = [];
      for (let hour = 9; hour < 17; hour++) {
        daySlots.push(`${hour.toString().padStart(2, '0')}:00`);
        if (hour < 16) daySlots.push(`${hour.toString().padStart(2, '0')}:30`);
      }
      slots.push({ date: date.toISOString().split('T')[0], slots: daySlots });
    }
    return slots;
  };

  const timeSlots = generateTimeSlots();

  useEffect(() => { loadMasterData(); }, [mastername]);

  const loadMasterData = async () => {
    try {
      setLoading(true);
      setError(null);
      const masterResponse = await mastersAPI.getBySlug(mastername);
      const masterData = masterResponse.data;
      setMaster(masterData);
      const servicesResponse = await servicesAPI.getByMaster(masterData.id, true);
      setServices(servicesResponse.data || []);
    } catch (err) {
      setError('Professional not found. Please check the booking link.');
    } finally {
      setLoading(false);
    }
  };

  const handleContinueToPayment = () => {
    if (!selectedService || !selectedSlot || !clientData.name || !clientData.email) {
      setFormError('Please complete all required fields before continuing.');
      return;
    }
    setFormError('');
    setShowPayment(true);
  };

  const handlePaymentSubmit = async (paymentMethodId) => {
    try {
      setProcessingBooking(true);
      setFormError('');
      const service = services.find(s => s.id === selectedService);
      const [date, time] = selectedSlot.split(' ');
      const bookingResponse = await bookingsAPI.createWithPayment({
        master_id: master.id,
        service_id: selectedService,
        booking_date: new Date(`${date}T${time}:00`).toISOString(),
        client_name: clientData.name,
        client_email: clientData.email,
        client_phone: clientData.phone,
        payment_method_id: paymentMethodId
      });
      setBookingDetails({
        ...bookingResponse.data,
        service_name: service.name,
        master_name: master.name,
        date, time,
        slotta_amount: service.base_slotta || Math.round(service.price * 0.3)
      });
      setBookingComplete(true);
    } catch (err) {
      setFormError(err.response?.data?.detail || 'Booking failed. Please try again.');
    } finally {
      setProcessingBooking(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slotta-cream flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-slotta-purple animate-spin mx-auto mb-4" strokeWidth={1.5} />
          <p className="text-slotta-ink-soft">Loading...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slotta-cream flex items-center justify-center p-6">
        <div className="slotta-card rounded-3xl max-w-md w-full p-8 text-center">
          <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" strokeWidth={1} />
          <h2 className="text-2xl font-bold text-slotta-ink mb-3">Oops!</h2>
          <p className="text-slotta-ink-soft mb-6">{error}</p>
          <button onClick={() => navigate('/')} className="px-6 py-2.5 rounded-full bg-slotta-purple text-white font-medium text-sm hover:bg-slotta-purple-dark transition">Go Home</button>
        </div>
      </div>
    );
  }

  if (bookingComplete) {
    const service = services.find(s => s.id === selectedService);
    return (
      <div className="min-h-screen bg-slotta-cream flex items-center justify-center p-6">
        <div className="slotta-card rounded-3xl max-w-2xl w-full p-8 md:p-10 text-center">
          <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-12 h-12 text-green-500" strokeWidth={1.5} />
          </div>
          <h2 className="text-3xl font-bold text-slotta-ink mb-3" data-testid="booking-confirmed-title">Booking Confirmed!</h2>
          <p className="text-slotta-ink-soft mb-6">You're all set! A confirmation email has been sent to {clientData.email}.</p>
          <div className="bg-slotta-purple-50 rounded-2xl p-6 mb-6 text-left">
            <div className="flex justify-between mb-3">
              <span className="text-slotta-ink-soft text-sm">Service</span>
              <span className="font-semibold text-slotta-ink text-sm">{service?.name}</span>
            </div>
            <div className="flex justify-between mb-3">
              <span className="text-slotta-ink-soft text-sm">Date & Time</span>
              <span className="font-semibold text-slotta-ink text-sm">{selectedSlot}</span>
            </div>
            <div className="flex justify-between mb-3">
              <span className="text-slotta-ink-soft text-sm">With</span>
              <span className="font-semibold text-slotta-ink text-sm">{master?.name}</span>
            </div>
            <div className="flex justify-between pt-3 border-t border-slotta-purple/10">
              <span className="text-slotta-ink-soft text-sm">SLØ Amount</span>
              <span className="font-semibold text-slotta-purple text-sm">€{service?.base_slotta || Math.round(service?.price * 0.3)} (held, not charged)</span>
            </div>
          </div>
          <div className="bg-green-50 border border-green-200 rounded-2xl p-4 mb-6">
            <p className="text-sm text-green-700">
              <strong>Important:</strong> Show up on time and your card hold will be released immediately. If you need to reschedule, do so at least 24 hours before your appointment.
            </p>
          </div>
          <div className="flex gap-3">
            <button onClick={() => navigate('/')} className="flex-1 py-3 rounded-full border border-slotta-purple/15 text-slotta-ink font-medium text-sm hover:bg-slotta-purple-50 transition">Back to Home</button>
            <button onClick={() => navigate('/client/portal')} className="flex-1 py-3 rounded-full bg-slotta-purple text-white font-medium text-sm hover:bg-slotta-purple-dark transition">View My Bookings</button>
          </div>
        </div>
      </div>
    );
  }

  if (showPayment) {
    const service = services.find(s => s.id === selectedService);
    const slottaAmount = service?.base_slotta || Math.round(service?.price * 0.3);
    return (
      <div className="min-h-screen bg-slotta-cream p-6">
        <div className="max-w-2xl mx-auto pt-8">
          <button onClick={() => setShowPayment(false)} className="flex items-center gap-2 text-slotta-ink-soft hover:text-slotta-purple transition mb-6 text-sm font-medium">
            <ArrowLeft className="w-4 h-4" /> Back
          </button>
          <div className="slotta-card rounded-3xl p-8">
            <h2 className="text-2xl font-bold text-slotta-ink mb-6" data-testid="payment-title">Authorize Payment</h2>

            <div className="bg-slotta-purple-50 border border-slotta-purple/15 rounded-2xl p-6 mb-6">
              <div className="flex items-start gap-3 mb-4">
                <Shield className="w-6 h-6 text-slotta-purple flex-shrink-0 mt-0.5" strokeWidth={1.5} />
                <div>
                  <h3 className="font-semibold text-slotta-purple mb-2">How SLØ Works</h3>
                  <p className="text-sm text-slotta-purple/80 leading-relaxed">
                    We'll authorize <strong>€{slottaAmount}</strong> on your card to protect {master?.name}'s time.
                    This amount is <strong>held, not charged</strong>. If you show up, it's released immediately.
                    If you can't make it, please reschedule before the deadline to avoid charges.
                  </p>
                </div>
              </div>
            </div>

            <div className="slotta-card rounded-2xl p-6 mb-6 border border-slotta-purple/8">
              <h3 className="font-semibold text-slotta-ink mb-4">Booking Summary</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-slotta-ink-soft text-sm">Service</span>
                  <span className="font-semibold text-slotta-ink text-sm">{service?.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slotta-ink-soft text-sm">Duration</span>
                  <span className="font-semibold text-slotta-ink text-sm">{service?.duration_minutes} minutes</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slotta-ink-soft text-sm">Date & Time</span>
                  <span className="font-semibold text-slotta-ink text-sm">{selectedSlot}</span>
                </div>
                <div className="flex justify-between pt-3 border-t border-slotta-purple/8">
                  <span className="text-slotta-ink-soft text-sm">Full Price</span>
                  <span className="text-lg font-bold text-slotta-ink">€{service?.price}</span>
                </div>
                <div className="flex justify-between text-slotta-purple">
                  <span className="font-medium text-sm">SLØ Amount (Hold)</span>
                  <span className="text-lg font-bold">€{slottaAmount}</span>
                </div>
                <p className="text-xs text-slotta-ink-soft pt-2">
                  Full payment of €{service?.price} due at appointment. SLØ released when you arrive.
                </p>
              </div>
            </div>

            {stripePromise ? (
              <Elements stripe={stripePromise}>
                <StripeCardForm onSubmit={handlePaymentSubmit} loading={processingBooking} slottaAmount={slottaAmount} masterName={master?.name} />
              </Elements>
            ) : (
              <div className="p-4 border border-red-200 bg-red-50 rounded-2xl text-sm text-red-700">
                Payment is not available right now. Missing Stripe publishable key.
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  const inputClass = "w-full px-4 py-2.5 rounded-xl border border-slotta-purple/15 bg-white text-slotta-ink placeholder:text-slotta-ink-soft/40 focus:outline-none focus:ring-2 focus:ring-slotta-purple/30 focus:border-slotta-purple/30 transition";

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
          <button onClick={() => navigate('/')} className="flex items-center gap-1.5 px-4 py-2 rounded-full border border-slotta-purple/10 text-sm text-slotta-ink-soft hover:border-slotta-purple/30 hover:text-slotta-purple transition">
            <ArrowLeft className="w-3.5 h-3.5" /> Home
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-12">
        {/* Master Profile */}
        <div className="slotta-card rounded-3xl mb-8 overflow-hidden">
          <div className="md:flex">
            <div className="md:w-1/3 bg-gradient-to-br from-slotta-purple to-slotta-purple-dark flex items-center justify-center p-8">
              <div className="w-32 h-32 bg-white/15 rounded-full flex items-center justify-center text-white text-4xl font-bold backdrop-blur-sm">
                {master?.name?.split(' ').map(n => n[0]).join('') || '?'}
              </div>
            </div>
            <div className="md:w-2/3 p-8">
              <h1 className="text-3xl font-bold text-slotta-ink mb-2" data-testid="master-name">{master?.name}</h1>
              <p className="text-slotta-purple font-medium mb-4">{master?.specialty || 'Professional'}</p>
              {master?.location && (
                <div className="flex items-center gap-1.5 text-slotta-ink-soft mb-4 text-sm">
                  <MapPin className="w-4 h-4" />
                  <span>{master.location}</span>
                </div>
              )}
              <p className="text-slotta-ink-soft mb-5 leading-relaxed">{master?.bio || 'Book your appointment with confidence.'}</p>
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slotta-purple-50 text-slotta-purple text-sm font-medium">
                <Shield className="w-3.5 h-3.5" strokeWidth={2} />
                SLØ Protected
              </span>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Services + Time Slots + Client Info */}
          <div className="md:col-span-2 space-y-6">
            <h2 className="text-2xl font-bold text-slotta-ink mb-4" data-testid="services-title">Select a Service</h2>
            {services.length === 0 ? (
              <div className="slotta-card rounded-2xl p-8 text-center text-slotta-ink-soft">No services available at the moment.</div>
            ) : (
              services.map((service) => {
                const slottaAmount = service.base_slotta || Math.round(service.price * 0.3);
                return (
                  <div
                    key={service.id}
                    className={`slotta-card rounded-2xl p-6 cursor-pointer transition ${
                      selectedService === service.id ? 'ring-2 ring-slotta-purple' : 'hover:shadow-md'
                    }`}
                    onClick={() => setSelectedService(service.id)}
                    data-testid={`service-${service.id}`}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-slotta-ink mb-2">{service.name}</h3>
                        <div className="flex items-center gap-4 text-sm text-slotta-ink-soft mb-3">
                          <div className="flex items-center gap-1.5">
                            <Clock className="w-4 h-4" />
                            <span>{service.duration_minutes} min</span>
                          </div>
                          <div className="font-semibold text-lg text-slotta-ink">€{service.price}</div>
                        </div>
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slotta-purple-50 text-xs font-medium text-slotta-purple">
                          <Shield className="w-3 h-3" strokeWidth={2} />
                          SLØ: €{slottaAmount}
                        </span>
                      </div>
                      {selectedService === service.id && (
                        <CheckCircle className="w-6 h-6 text-slotta-purple" />
                      )}
                    </div>
                  </div>
                );
              })
            )}

            {/* Time Slots */}
            {selectedService && (
              <div className="mt-8">
                <h2 className="text-2xl font-bold text-slotta-ink mb-4 flex items-center gap-2" data-testid="timeslots-title">
                  <Calendar className="w-5 h-5 text-slotta-purple" strokeWidth={1.5} />
                  Select Date & Time
                </h2>
                {timeSlots.map((day, idx) => (
                  <div key={idx} className="slotta-card rounded-2xl p-5 mb-3">
                    <h3 className="font-semibold text-slotta-ink mb-3 text-sm">
                      {new Date(day.date).toLocaleDateString('en-GB', { weekday: 'long', month: 'long', day: 'numeric' })}
                    </h3>
                    <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                      {day.slots.map((slot) => {
                        const slotKey = `${day.date} ${slot}`;
                        return (
                          <button
                            key={slot}
                            onClick={() => setSelectedSlot(slotKey)}
                            className={`px-3 py-2 rounded-full border text-sm transition ${
                              selectedSlot === slotKey
                                ? 'bg-slotta-purple text-white border-slotta-purple'
                                : 'border-slotta-purple/15 text-slotta-ink hover:border-slotta-purple/40'
                            }`}
                            data-testid={`slot-${slotKey}`}
                          >
                            {slot}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Client Information */}
            {selectedSlot && (
              <div className="mt-8">
                <h2 className="text-2xl font-bold text-slotta-ink mb-4">Your Information</h2>
                <div className="slotta-card rounded-2xl p-6">
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-slotta-ink block mb-1.5">Full Name *</label>
                      <input type="text" value={clientData.name} onChange={(e) => { setClientData({ ...clientData, name: e.target.value }); if (formError) setFormError(''); }} placeholder="John Doe" className={inputClass} required data-testid="client-name" />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-slotta-ink block mb-1.5">Email *</label>
                      <input type="email" value={clientData.email} onChange={(e) => { setClientData({ ...clientData, email: e.target.value }); if (formError) setFormError(''); }} placeholder="john@example.com" className={inputClass} required data-testid="client-email" />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-slotta-ink block mb-1.5">Phone (optional)</label>
                      <input type="tel" value={clientData.phone} onChange={(e) => setClientData({ ...clientData, phone: e.target.value })} placeholder="+351 900 000 000" className={inputClass} data-testid="client-phone" />
                    </div>
                    {formError && (
                      <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
                        <AlertCircle className="w-4 h-4 flex-shrink-0" />
                        <span>{formError}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Booking Summary Sidebar */}
          <div>
            <div className="slotta-card rounded-2xl p-6 sticky top-6">
              <h3 className="font-semibold text-slotta-ink mb-4">Booking Summary</h3>
              {!selectedService ? (
                <p className="text-slotta-ink-soft text-sm">Select a service to continue</p>
              ) : (
                <div className="space-y-4">
                  <div>
                    <div className="text-sm text-slotta-ink-soft mb-1">Service</div>
                    <div className="font-semibold text-slotta-ink text-sm">{services.find(s => s.id === selectedService)?.name}</div>
                  </div>
                  {selectedSlot && (
                    <div>
                      <div className="text-sm text-slotta-ink-soft mb-1">Date & Time</div>
                      <div className="font-semibold text-slotta-ink text-sm">{selectedSlot}</div>
                    </div>
                  )}
                  <div className="border-t border-slotta-purple/8 pt-4">
                    <div className="flex justify-between mb-2">
                      <span className="text-slotta-ink-soft text-sm">Price</span>
                      <span className="font-semibold text-slotta-ink text-sm">€{services.find(s => s.id === selectedService)?.price}</span>
                    </div>
                    <div className="flex justify-between text-slotta-purple">
                      <span className="font-medium text-sm">SLØ (Hold)</span>
                      <span className="font-bold text-sm">€{services.find(s => s.id === selectedService)?.base_slotta || Math.round(services.find(s => s.id === selectedService)?.price * 0.3)}</span>
                    </div>
                  </div>
                  <div className="bg-slotta-purple-50 rounded-xl p-4">
                    <div className="flex items-start gap-2">
                      <Info className="w-4 h-4 text-slotta-purple flex-shrink-0 mt-0.5" />
                      <p className="text-xs text-slotta-purple/80">Only SLØ amount will be authorized. Released when you arrive.</p>
                    </div>
                  </div>
                  <button
                    disabled={!selectedService || !selectedSlot || !clientData.name || !clientData.email}
                    onClick={handleContinueToPayment}
                    className="w-full py-3.5 rounded-full bg-slotta-lime text-slotta-ink font-semibold text-sm hover:bg-slotta-lime-dark transition disabled:opacity-50 flex items-center justify-center gap-2"
                    data-testid="continue-booking-btn"
                  >
                    Continue to Payment <ArrowRight className="w-4 h-4" />
                  </button>
                  {formError && (
                    <div className="mt-3 flex items-center gap-2 text-red-600 text-sm">
                      <AlertCircle className="w-4 h-4" />
                      <span>{formError}</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingPage;
