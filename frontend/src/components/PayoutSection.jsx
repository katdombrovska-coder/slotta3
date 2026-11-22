import { motion } from 'framer-motion';
import { DollarSign, Calendar, Shield, TrendingUp, Info } from 'lucide-react';

const PayoutSection = () => {
  const payoutDetails = [
    {
      icon: DollarSign,
      label: 'Payout Fee',
      value: '€0.25',
      description: 'per transaction',
    },
    {
      icon: TrendingUp,
      label: 'Minimum Payout',
      value: '€30',
      description: 'threshold',
    },
    {
      icon: Calendar,
      label: 'Schedule',
      value: 'Flexible',
      description: 'Daily, weekly, or monthly',
    },
    {
      icon: Shield,
      label: 'Security',
      value: 'Bank-level',
      description: 'Encrypted & secure',
    },
  ];

  return (
    <section id="payouts" className="py-32 md:py-40">
      <div className="container-apple">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="max-w-5xl mx-auto space-y-12"
        >
          <div className="text-center space-y-6">
            <h2 className="text-4xl md:text-6xl font-bold tracking-tight text-slotta-ink">Transparent Payouts</h2>
            <p className="text-base md:text-lg text-slotta-ink-soft max-w-2xl mx-auto">
              Get paid quickly with clear, upfront pricing
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {payoutDetails.map((detail, index) => {
              const Icon = detail.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="slotta-card feature-card rounded-3xl p-6"
                >
                  <div className="section-icon w-12 h-12 mb-4">
                    <Icon className="w-6 h-6 text-slotta-purple" strokeWidth={1.5} />
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm text-slotta-ink-soft uppercase tracking-wider">{detail.label}</p>
                    <p className="text-2xl font-bold text-slotta-ink">{detail.value}</p>
                    <p className="text-xs text-slotta-ink-soft">{detail.description}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            viewport={{ once: true }}
            className="slotta-card rounded-3xl p-6"
          >
            <div className="flex items-start gap-4">
              <div className="section-icon w-10 h-10">
                <Info className="w-5 h-5 text-slotta-purple" strokeWidth={1.5} />
              </div>
              <p className="text-sm text-slotta-ink-soft leading-relaxed">
                <span className="text-slotta-ink font-semibold">Why €30 minimum?</span> This threshold ensures efficient processing and reduces transaction costs. Your compensation accumulates automatically, and you can withdraw once you reach the minimum. Most service providers hit this within their first few bookings.
              </p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            viewport={{ once: true }}
            className="text-center pt-8"
          >
            <p className="text-slotta-ink-soft">
              Powered by <span className="text-slotta-ink font-semibold">Stripe</span> • Payments processed securely
            </p>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default PayoutSection;
