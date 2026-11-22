import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, ChevronDown, AlertCircle, CreditCard, Shield, RefreshCw, ArrowLeft, Loader2 } from 'lucide-react';

const TroubleshootingFAQ = () => {
  const navigate = useNavigate();
  const [openIdx, setOpenIdx] = useState(null);

  const faqs = [
    {
      icon: CreditCard,
      q: 'My card authorization failed. What should I do?',
      a: 'First, check that your card has sufficient funds for the SLØ hold amount. If funds are available, contact your bank to authorize international or online transactions. If the issue persists, try a different card. The authorization is a hold, not a charge, so it should work with most debit and credit cards.',
    },
    {
      icon: RefreshCw,
      q: 'The booking page is loading forever. Help!',
      a: 'Try these steps: 1) Refresh the page. 2) Clear your browser cache and cookies. 3) Try an incognito/private window. 4) Disable browser extensions that might block scripts. If it still doesn\'t work, the professional\'s booking link may be temporarily unavailable.',
    },
    {
      icon: AlertCircle,
      q: 'I was charged but my booking shows as failed.',
      a: 'Don\'t worry! This usually means the authorization succeeded but the booking confirmation had a network error. Check your email for a confirmation. If you didn\'t receive one within 5 minutes, contact the professional directly or reach out to support. The authorization will automatically release within 3-5 business days if no booking was created.',
    },
    {
      icon: CreditCard,
      q: 'The SLØ hold hasn\'t been released yet.',
      a: 'Holds typically release within 1-3 business days for debit cards and 3-7 days for credit cards. If it\'s been more than 7 business days since your appointment, contact your bank first (they may need to process the release), then reach out to us if the bank can\'t help.',
    },
    {
      icon: Shield,
      q: 'I see a charge I didn\'t authorize.',
      a: 'SLØTTA only places holds that you explicitly authorize during booking. If you see an unexpected charge, it may be a partial SLØ charge from a missed appointment (you would have received a notification). If you believe the charge is incorrect, contact support immediately and we\'ll investigate.',
    },
    {
      icon: AlertCircle,
      q: 'I can\'t log in to the client portal.',
      a: 'The client portal uses your email address to look up bookings. Make sure you\'re using the same email you used when booking. If you\'ve changed email addresses, contact the professional to update your booking email. No password is needed, just your email.',
    },
    {
      icon: RefreshCw,
      q: 'My calendar sync isn\'t working.',
      a: 'Go to Settings > Google Calendar Sync and try a Full Sync. If that doesn\'t work, disconnect and reconnect your Google Calendar. Make sure you granted all requested permissions during the Google OAuth flow. Sync issues are often caused by revoked permissions or expired tokens.',
    },
    {
      icon: AlertCircle,
      q: 'I\'m getting a "subscription inactive" error.',
      a: 'This means your SLØTTA Pro subscription has lapsed or couldn\'t be verified. Go to Settings to check your subscription status. If you\'re on the free plan, some features (Calendar, Services, Analytics) will be locked. Upgrade to Pro for €12/month to unlock everything.',
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
          <div className="inline-flex items-center justify-center w-16 h-16 bg-red-50 rounded-full mb-4">
            <AlertCircle className="w-8 h-8 text-red-400" strokeWidth={1.5} />
          </div>
          <h1 className="text-4xl font-bold text-slotta-ink mb-3">Troubleshooting</h1>
          <p className="text-slotta-ink-soft text-lg">Solutions to common issues</p>
        </div>

        {/* Quick Fixes */}
        <div className="grid md:grid-cols-3 gap-4 mb-8">
          {[
            { icon: RefreshCw, title: 'Page Not Loading', desc: 'Clear cache, try incognito mode, disable extensions' },
            { icon: CreditCard, title: 'Payment Issues', desc: 'Check funds, try different card, contact bank for holds' },
            { icon: AlertCircle, title: 'Login Problems', desc: 'Use booking email, no password needed, check spam folder' },
          ].map((card, idx) => {
            const Icon = card.icon;
            return (
              <div key={idx} className="slotta-card rounded-2xl p-5">
                <div className="w-10 h-10 rounded-xl bg-slotta-purple-50 flex items-center justify-center mb-3">
                  <Icon className="w-5 h-5 text-slotta-purple" strokeWidth={1.5} />
                </div>
                <h3 className="font-semibold text-slotta-ink text-sm mb-1">{card.title}</h3>
                <p className="text-xs text-slotta-ink-soft">{card.desc}</p>
              </div>
            );
          })}
        </div>

        {/* FAQ List */}
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
          <div className="inline-flex items-center justify-center w-12 h-12 bg-slotta-purple rounded-full mb-4">
            <AlertCircle className="w-6 h-6 text-white" strokeWidth={1.5} />
          </div>
          <h3 className="text-lg font-semibold text-slotta-ink mb-2">Can\'t find your answer?</h3>
          <p className="text-slotta-ink-soft text-sm mb-4">Our support team typically responds within 24 hours.</p>
          <button onClick={() => navigate('/')} className="px-6 py-2.5 rounded-full bg-slotta-purple text-white font-medium text-sm hover:bg-slotta-purple-dark transition">Contact Support</button>
        </div>
      </div>
    </div>
  );
};

export default TroubleshootingFAQ;
