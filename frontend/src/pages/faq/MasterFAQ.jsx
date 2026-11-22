import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, ChevronDown, Shield, CreditCard, Calendar, Users, Bell, ArrowLeft } from 'lucide-react';

const MasterFAQ = () => {
  const navigate = useNavigate();
  const [openIdx, setOpenIdx] = useState(null);

  const faqs = [
    {
      icon: Shield,
      q: 'What is SLØ and how does it protect my time?',
      a: 'SLØ is a no-show protection hold placed on the client\'s card when they book. The amount is calculated based on service duration, price, and client reliability. If the client shows up, the hold is released immediately. If they no-show, you get compensated.',
    },
    {
      icon: CreditCard,
      q: 'How do payouts work?',
      a: 'Payouts are processed through Stripe Connect. Your SLØ earnings accumulate in your wallet and are paid out weekly (every Saturday) to your linked bank account. Minimum payout is €50. You can also request instant payouts above this threshold.',
    },
    {
      icon: Calendar,
      q: 'Can I sync SLØTTA with Google Calendar?',
      a: 'Yes! Go to Settings > Google Calendar Sync to enable two-way sync. Bookings made through SLØTTA will appear in your Google Calendar, and events in Google Calendar can block time slots in SLØTTA.',
    },
    {
      icon: Users,
      q: 'How does client reliability scoring work?',
      a: 'Every client starts as "New" with a standard SLØ rate. After each booking, their score updates: showing up on time increases reliability and lowers future SLØ amounts. No-shows or late cancellations increase the SLØ rate for future bookings.',
    },
    {
      icon: Bell,
      q: 'How do Telegram notifications work?',
      a: 'Connect your Telegram account in Settings > Telegram Notifications. You\'ll receive instant alerts for new bookings, cancellations, no-shows, and payouts. You can customize which notifications you receive for each event type.',
    },
    {
      icon: Shield,
      q: 'What happens if a client disputes a no-show charge?',
      a: 'SLØTTA handles disputes through Stripe\'s standard chargeback process. We provide evidence of the booking, confirmation emails, and no-show records. Most disputes are resolved in the merchant\'s favor when proper documentation exists.',
    },
    {
      icon: CreditCard,
      q: 'What are the fees?',
      a: 'SLØTTA charges 2.9% + €0.30 per transaction (standard Stripe processing). There are no monthly fees on the free plan. The Pro plan is €12/month and includes calendar sync, analytics, and unlimited services.',
    },
    {
      icon: Calendar,
      q: 'Can I set different SLØ amounts for different services?',
      a: 'Yes! Each service has its own SLØ calculation based on duration and price. You can also manually adjust the base SLØ for any service in the Services page. The system will still apply reliability adjustments on top.',
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
          <div className="inline-flex items-center justify-center w-16 h-16 bg-slotta-purple-50 rounded-full mb-4">
            <Shield className="w-8 h-8 text-slotta-purple" strokeWidth={1.5} />
          </div>
          <h1 className="text-4xl font-bold text-slotta-ink mb-3">For Professionals</h1>
          <p className="text-slotta-ink-soft text-lg">Everything you need to know about using SLØTTA</p>
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
                  <div className="px-5 pb-5 pl-19">
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
          <h3 className="text-lg font-semibold text-slotta-ink mb-2">Still have questions?</h3>
          <p className="text-slotta-ink-soft text-sm mb-4">Our team is here to help you get the most out of SLØTTA.</p>
          <button onClick={() => navigate('/')} className="px-6 py-2.5 rounded-full bg-slotta-purple text-white font-medium text-sm hover:bg-slotta-purple-dark transition">Contact Support</button>
        </div>
      </div>
    </div>
  );
};

export default MasterFAQ;
