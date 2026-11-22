import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, ChevronDown, Shield, CreditCard, Calendar, User, ArrowLeft, CheckCircle } from 'lucide-react';

const ClientFAQ = () => {
  const navigate = useNavigate();
  const [openIdx, setOpenIdx] = useState(null);

  const faqs = [
    {
      icon: Shield,
      q: 'What is SLØ and why do I need to pay it?',
      a: 'SLØ is a temporary hold on your card that protects the professional\'s time. When you book, we authorize a set amount based on the service. If you show up, the hold is released immediately. You only pay the service price directly to the professional.',
    },
    {
      icon: CreditCard,
      q: 'When am I actually charged?',
      a: 'Your card is only authorized (held) for the SLØ amount when you book. The actual service price is paid directly to the professional at your appointment. If you show up, the hold is released within 1-3 business days.',
    },
    {
      icon: Calendar,
      q: 'How do I cancel or reschedule?',
      a: 'You can cancel or reschedule through the Client Portal. Cancellations made at least 24 hours before the appointment release the full SLØ hold. Late cancellations may result in a partial SLØ charge.',
    },
    {
      icon: User,
      q: 'What happens if I miss my appointment?',
      a: 'If you no-show, a portion of the SLØ hold compensates the professional for their lost time. The remainder is credited to your SLØTTA wallet for future bookings. Your reliability score will also be adjusted.',
    },
    {
      icon: Shield,
      q: 'What is a reliability score?',
      a: 'Your reliability score reflects your booking history. New clients start with standard SLØ rates. Showing up on time improves your score and lowers future SLØ amounts. Missed appointments increase your SLØ rate temporarily.',
    },
    {
      icon: CreditCard,
      q: 'Is my payment information secure?',
      a: 'Yes! We use Stripe for all payment processing. Your card details never touch our servers. Stripe is PCI Level 1 certified, the highest level of payment security.',
    },
    {
      icon: Calendar,
      q: 'How far in advance can I book?',
      a: 'You can book up to 7 days in advance through the professional\'s booking link. Available time slots are shown in real-time based on the professional\'s calendar.',
    },
    {
      icon: CheckCircle,
      q: 'What if the professional cancels?',
      a: 'If a professional cancels your booking, the full SLØ hold is released immediately and you\'ll receive a notification. No charges will be applied to your card.',
    },
  ];

  return (
    <div className="min-h-screen bg-slotta-cream">
      {/* Header */}
      <div className="bg-white border-b border-slotta-purple/8">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 bg-slotta-purple rounded-xl flex items-center justify-center">
              <Clock className="w-5 h-5 text-white" strokeWidth={1.5} />
            </div>
            <span className="text-xl font-bold text-slotta-ink">SLØTTA</span>
          </div>
          <button onClick={() => navigate('/')} className="flex items-center gap-1.5 px-4 py-2 rounded-full border border-slotta-purple/10 text-sm text-slotta-ink-soft hover:border-slotta-purple/30 transition">
            <ArrowLeft className="w-3.5 h-3.5" /> Home
          </button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-slotta-lime-50 rounded-full mb-4">
            <User className="w-8 h-8 text-slotta-lime-dark" strokeWidth={1.5} />
          </div>
          <h1 className="text-4xl font-bold text-slotta-ink mb-3">For Clients</h1>
          <p className="text-slotta-ink-soft text-lg">How SLØTTA works for you</p>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, idx) => {
            const Icon = faq.icon;
            const isOpen = openIdx === idx;
            return (
              <div key={idx} className="slotta-card rounded-2xl overflow-hidden">
                <button
                  onClick={() => setOpenIdx(isOpen ? null : idx)}
                  className="w-full p-5 flex items-center justify-between text-left hover:bg-slotta-purple-50/20 transition"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-slotta-purple-50 flex items-center justify-center flex-shrink-0">
                      <Icon className="w-5 h-5 text-slotta-purple" strokeWidth={1.5} />
                    </div>
                    <span className="font-semibold text-slotta-ink text-sm md:text-base">{faq.q}</span>
                  </div>
                  <ChevronDown className={`w-5 h-5 text-slotta-ink-soft transition-transform flex-shrink-0 ml-2 ${isOpen ? 'rotate-180' : ''}`} />
                </button>
                {isOpen && (
                  <div className="px-5 pb-5">
                    <div className="ml-14">
                      <p className="text-slotta-ink-soft text-sm leading-relaxed">{faq.a}</p>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Contact */}
        <div className="slotta-card rounded-2xl p-8 mt-8 text-center bg-gradient-to-r from-slotta-purple-50 to-slotta-lime-50">
          <h3 className="text-lg font-semibold text-slotta-ink mb-2">Still need help?</h3>
          <p className="text-slotta-ink-soft text-sm mb-4">We're here to make your booking experience smooth.</p>
          <button onClick={() => navigate('/')} className="px-6 py-2.5 rounded-full bg-slotta-purple text-white font-medium text-sm hover:bg-slotta-purple-dark transition">Contact Support</button>
        </div>
      </div>
    </div>
  );
};

export default ClientFAQ;
