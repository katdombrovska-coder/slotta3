import React, { useState, useEffect } from 'react';
import { MasterLayout } from './Dashboard';
import { walletAPI, authAPI, stripeAPI } from '@/lib/api';
import { Wallet as WalletIcon, TrendingUp, ArrowDownCircle, ArrowUpCircle, Download, ExternalLink, Loader2, DollarSign } from 'lucide-react';

const Wallet = () => {
  const [loading, setLoading] = useState(true);
  const [stripeLoading, setStripeLoading] = useState(false);
  const [walletData, setWalletData] = useState({
    wallet_balance: 0,
    pending_payouts: 0,
    lifetime_earnings: 0,
    transactions: []
  });
  const master = authAPI.getMaster();
  const masterId = master?.id;

  useEffect(() => {
    if (masterId) loadWalletData();
  }, [masterId]);

  const loadWalletData = async () => {
    try {
      setLoading(true);
      const response = await walletAPI.getWallet(masterId);
      setWalletData(response.data);
    } catch (err) {
      console.error('Failed to load wallet:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenStripeDashboard = async () => {
    try {
      setStripeLoading(true);
      const response = await stripeAPI.getDashboardLink(masterId);
      if (response.data.url) {
        window.open(response.data.url, '_blank');
      } else {
        alert('Please complete Stripe onboarding first in Settings.');
      }
    } catch (err) {
      alert('Unable to open Stripe dashboard. Please complete onboarding in Settings first.');
    } finally {
      setStripeLoading(false);
    }
  };

  const { wallet_balance, pending_payouts, lifetime_earnings, transactions } = walletData;

  return (
    <MasterLayout active="wallet" title="Wallet & Payouts">
      {/* Balance Cards */}
      <div className="grid md:grid-cols-3 gap-6 mb-8">
        {/* Main balance - purple gradient */}
        <div className="slotta-card rounded-3xl p-6 bg-gradient-to-br from-slotta-purple to-slotta-purple-dark text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16" />
          <div className="relative">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-white/15 flex items-center justify-center">
                <WalletIcon className="w-6 h-6 text-white" strokeWidth={1.5} />
              </div>
              <span className="px-3 py-1 rounded-full bg-white/15 text-xs font-medium">Available</span>
            </div>
            <div className="text-4xl font-bold mb-1" data-testid="wallet-balance">
              €{loading ? '...' : wallet_balance}
            </div>
            <div className="text-white/70 text-sm">Current Balance</div>
            <button className="w-full mt-4 py-2.5 rounded-full bg-slotta-lime text-slotta-ink font-semibold text-sm hover:bg-slotta-lime-dark transition">
              Request Payout
            </button>
          </div>
        </div>

        {/* Pending */}
        <div className="slotta-card rounded-3xl p-6">
          <div className="w-12 h-12 rounded-xl bg-slotta-lime-50 border border-slotta-lime/20 flex items-center justify-center mb-4">
            <TrendingUp className="w-6 h-6 text-slotta-lime-dark" strokeWidth={1.5} />
          </div>
          <div className="text-4xl font-bold text-slotta-ink mb-1">€{loading ? '...' : pending_payouts}</div>
          <div className="text-sm text-slotta-ink-soft">Pending Payouts</div>
          <div className="text-xs text-slotta-ink-soft mt-2">From ongoing bookings</div>
        </div>

        {/* Lifetime */}
        <div className="slotta-card rounded-3xl p-6">
          <div className="w-12 h-12 rounded-xl bg-slotta-purple-50 border border-slotta-purple/10 flex items-center justify-center mb-4">
            <ArrowUpCircle className="w-6 h-6 text-slotta-purple" strokeWidth={1.5} />
          </div>
          <div className="text-4xl font-bold text-slotta-ink mb-1">€{loading ? '...' : lifetime_earnings}</div>
          <div className="text-sm text-slotta-ink-soft">Lifetime Earnings</div>
          <div className="text-xs text-slotta-ink-soft mt-2">Total from SLØ</div>
        </div>
      </div>

      {/* Upcoming Payouts */}
      <div className="slotta-card rounded-2xl p-6 mb-8">
        <h3 className="text-lg font-semibold text-slotta-ink mb-4">Upcoming Automatic Payouts</h3>
        {pending_payouts > 0 ? (
          <div className="flex items-center justify-between p-4 bg-slotta-purple-50 rounded-xl">
            <div>
              <div className="font-semibold text-slotta-ink">Next Payout</div>
              <div className="text-sm text-slotta-ink-soft">Processing when bookings complete</div>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-slotta-purple">€{pending_payouts}</div>
              <div className="text-sm text-slotta-ink-soft">Estimated</div>
            </div>
          </div>
        ) : (
          <div className="text-center py-6 text-slotta-ink-soft">No pending payouts</div>
        )}
      </div>

      {/* Transaction History */}
      <div className="slotta-card rounded-2xl overflow-hidden mb-8">
        <div className="p-5 border-b border-slotta-purple/8 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-slotta-ink">Transaction History</h3>
          <button className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-slotta-purple/10 text-sm text-slotta-ink-soft hover:border-slotta-purple/30 transition">
            <Download className="w-3.5 h-3.5" />
            Export CSV
          </button>
        </div>
        <div className="p-5">
          {loading ? (
            <div className="text-center py-8 text-slotta-ink-soft">Loading transactions...</div>
          ) : transactions.length === 0 ? (
            <div className="text-center py-8 text-slotta-ink-soft">No transactions yet</div>
          ) : (
            <div className="space-y-3">
              {transactions.map((transaction, idx) => (
                <div key={transaction.id || idx} className="flex items-center justify-between p-4 rounded-xl border border-slotta-purple/8 hover:bg-slotta-purple-50/30 transition">
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      transaction.type === 'payout' ? 'bg-red-50' : 'bg-slotta-lime-50'
                    }`}>
                      {transaction.type === 'payout' ? (
                        <ArrowDownCircle className="w-5 h-5 text-red-600" />
                      ) : (
                        <ArrowUpCircle className="w-5 h-5 text-slotta-lime-dark" />
                      )}
                    </div>
                    <div>
                      <div className="font-semibold text-slotta-ink">
                        {transaction.type === 'payout' ? 'Payout' : 'SLØ Credit'}
                      </div>
                      <div className="text-sm text-slotta-ink-soft">{transaction.description || transaction.type}</div>
                      <div className="text-xs text-slotta-ink-soft">
                        {transaction.created_at ? new Date(transaction.created_at).toLocaleDateString('en-GB') : ''}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`text-lg font-bold ${transaction.type === 'payout' ? 'text-red-600' : 'text-slotta-lime-dark'}`}>
                      {transaction.type === 'payout' ? '-' : '+'}€{transaction.amount}
                    </div>
                    <span className="inline-block px-2 py-0.5 rounded-full text-xs bg-slotta-lime-50 text-slotta-lime-dark">completed</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Payout Settings */}
      <div className="slotta-card rounded-2xl p-6">
        <h3 className="text-lg font-semibold text-slotta-ink mb-5">Payout Settings</h3>
        <div className="space-y-3">
          {[
            { label: 'Payout Method', value: 'Bank Transfer (Stripe Connect)' },
            { label: 'Payout Schedule', value: 'Weekly (Every Saturday)' },
            { label: 'Minimum Payout', value: '€50 (can request instantly above this)' },
          ].map((setting, idx) => (
            <div key={idx} className="flex items-center justify-between p-4 rounded-xl border border-slotta-purple/8">
              <div>
                <div className="font-semibold text-slotta-ink">{setting.label}</div>
                <div className="text-sm text-slotta-ink-soft">{setting.value}</div>
              </div>
              <button onClick={handleOpenStripeDashboard} disabled={stripeLoading} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-slotta-purple/10 text-sm text-slotta-ink-soft hover:border-slotta-purple/30 transition">
                {stripeLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <ExternalLink className="w-3.5 h-3.5" />}
                Manage
              </button>
            </div>
          ))}
          <div className="p-4 bg-slotta-purple-50 rounded-xl mt-3">
            <p className="text-sm text-slotta-purple">
              <strong>Note:</strong> Bank details, payout schedule, and other payment settings are managed in your Stripe Express Dashboard for security.
            </p>
          </div>
        </div>
      </div>
    </MasterLayout>
  );
};

export default Wallet;
