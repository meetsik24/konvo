import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { CheckCircle, ArrowRight, Zap } from "lucide-react";
import Navbar from "../components/Navbar";
import { Footer } from "../components/Footer";

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

function Pricing() {
  const smsRates = [
    { volume: "1 - 10,000", rate: "25" },
    { volume: "10,001 - 50,000", rate: "22" },
    { volume: "50,001 - 100,000", rate: "20" },
    { volume: "100,001 - 500,000", rate: "18" },
    { volume: "500,001+", rate: "Contact us" },
  ];

  const plans = [
    {
      name: "Starter",
      description: "For small businesses getting started",
      price: "Free",
      period: "to start",
      features: [
        "Pay-as-you-go SMS",
        "Basic analytics dashboard",
        "API access",
        "Email support",
        "Up to 2 sender IDs",
      ],
      cta: "Get Started",
      href: "/register",
      highlighted: false,
    },
    {
      name: "Business",
      description: "For growing businesses",
      price: "Custom",
      period: "volume pricing",
      features: [
        "Everything in Starter",
        "WhatsApp Business API",
        "Priority support",
        "Dedicated account manager",
        "Custom sender IDs",
        "Advanced analytics",
        "Webhook integrations",
      ],
      cta: "Contact Sales",
      href: "/contact",
      highlighted: true,
    },
    {
      name: "Enterprise",
      description: "For large organizations",
      price: "Custom",
      period: "annual contract",
      features: [
        "Everything in Business",
        "Dedicated infrastructure",
        "99.9% uptime SLA",
        "24/7 phone support",
        "Custom integrations",
        "On-premise options",
        "Volume discounts",
      ],
      cta: "Contact Sales",
      href: "/contact",
      highlighted: false,
    },
  ];

  const addOns = [
    { name: "WhatsApp Business API", price: "From TZS 50/message" },
    { name: "OTP Verification", price: "From TZS 30/verification" },
    { name: "Voice Calls", price: "From TZS 100/minute" },
    { name: "AI Chatbot", price: "Custom pricing" },
  ];

  return (
    <div className="bg-[#0a0a0f] text-white">
      <Navbar />

      {/* Hero */}
      <section className="pt-32 pb-16 relative overflow-hidden">
        {/* Grid background */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:64px_64px]"></div>
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl"></div>

        <div className="container mx-auto px-6 lg:px-8 text-center relative z-10">
          <motion.div initial="hidden" animate="visible" variants={fadeIn}>
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-emerald-400 text-sm mb-6">
              <Zap className="w-4 h-4" />
              Simple, transparent pricing
            </div>
            <h1 className="text-4xl lg:text-5xl font-bold mb-4">
              Pay only for what you
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400"> use</span>
            </h1>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              No monthly minimums, no hidden fees. Volume discounts available for high-volume senders.
            </p>
          </motion.div>
        </div>
      </section>

      {/* SMS Pricing Table */}
      <section className="py-16 bg-[#111118]">
        <div className="container mx-auto px-6 lg:px-8">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl font-bold text-white mb-2 text-center">
              SMS Pricing
            </h2>
            <p className="text-gray-400 mb-8 text-center">
              Volume-based pricing per SMS. Rates in Tanzanian Shillings (TZS).
            </p>
            
            <div className="bg-[#0a0a0f] rounded-2xl border border-gray-800 overflow-hidden">
              <table className="w-full">
                <thead className="border-b border-gray-800">
                  <tr>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-gray-400">
                      Monthly Volume
                    </th>
                    <th className="text-right py-4 px-6 text-sm font-semibold text-gray-400">
                      Rate per SMS
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {smsRates.map((tier, i) => (
                    <tr key={i} className="border-b border-gray-800/50 last:border-0">
                      <td className="py-4 px-6 text-gray-300">{tier.volume}</td>
                      <td className="py-4 px-6 text-right font-mono text-emerald-400">
                        {tier.rate === "Contact us" ? (
                          <span className="text-gray-400">{tier.rate}</span>
                        ) : (
                          `TZS ${tier.rate}`
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      {/* Plans */}
      <section className="py-24 bg-[#0a0a0f]">
        <div className="container mx-auto px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-white mb-4">
              Choose your plan
            </h2>
            <p className="text-gray-400 text-lg">
              Start free and scale as you grow
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {plans.map((plan, i) => (
              <motion.div
                key={i}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeIn}
                className={`rounded-2xl p-8 ${
                  plan.highlighted
                    ? "bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 border-2 border-emerald-500/30"
                    : "bg-[#111118] border border-gray-800"
                }`}
              >
                {plan.highlighted && (
                  <span className="inline-block bg-emerald-500 text-black text-xs font-semibold px-3 py-1 rounded-full mb-4">
                    Most Popular
                  </span>
                )}
                <h3 className="text-xl font-bold text-white mb-2">
                  {plan.name}
                </h3>
                <p className="text-sm text-gray-400 mb-6">
                  {plan.description}
                </p>
                <div className="mb-6">
                  <span className="text-4xl font-bold text-white">
                    {plan.price}
                  </span>
                  <span className="text-sm text-gray-500 ml-2">
                    {plan.period}
                  </span>
                </div>
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, j) => (
                    <li key={j} className="flex items-start text-sm">
                      <CheckCircle className="w-4 h-4 text-emerald-400 mr-2 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-300">{feature}</span>
                    </li>
                  ))}
                </ul>
                <Link
                  to={plan.href}
                  className={`block text-center py-3 rounded-lg font-semibold transition-all ${
                    plan.highlighted
                      ? "bg-gradient-to-r from-emerald-500 to-cyan-500 text-black hover:opacity-90"
                      : "bg-gray-800 text-white hover:bg-gray-700"
                  }`}
                >
                  {plan.cta}
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Add-ons */}
      <section className="py-20 bg-[#111118]">
        <div className="container mx-auto px-6 lg:px-8">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl font-bold text-white mb-8 text-center">
              Additional Products
            </h2>
            <div className="bg-[#0a0a0f] rounded-2xl border border-gray-800 divide-y divide-gray-800">
              {addOns.map((addon, i) => (
                <div key={i} className="flex justify-between items-center py-4 px-6">
                  <span className="text-white font-medium">{addon.name}</span>
                  <span className="text-emerald-400 font-mono text-sm">{addon.price}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 bg-[#0a0a0f]">
        <div className="container mx-auto px-6 lg:px-8">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl font-bold text-white mb-10 text-center">
              Frequently asked questions
            </h2>
            <div className="space-y-6">
              {[
                {
                  q: "Is there a minimum purchase?",
                  a: "No. You can start with as little as you need. Pay only for the messages you send.",
                },
                {
                  q: "How do I top up my account?",
                  a: "We accept M-Pesa, Tigo Pesa, Airtel Money, bank transfers, and major credit cards.",
                },
                {
                  q: "Do credits expire?",
                  a: "No. Your credits never expire and can be used anytime.",
                },
                {
                  q: "Can I get a custom quote?",
                  a: "Yes. Contact our sales team for high-volume pricing and enterprise agreements.",
                },
              ].map((faq, i) => (
                <div key={i} className="bg-[#111118] border border-gray-800 rounded-xl p-6">
                  <h3 className="font-semibold text-white mb-2">{faq.q}</h3>
                  <p className="text-gray-400">{faq.a}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 bg-gradient-to-br from-emerald-500/10 to-cyan-500/10 border-t border-emerald-500/20">
        <div className="container mx-auto px-6 lg:px-8 text-center">
          <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">
            Ready to get started?
          </h2>
          <p className="text-gray-400 mb-10 max-w-xl mx-auto">
            Create your free account and start sending messages in minutes.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              to="/register"
              className="bg-gradient-to-r from-emerald-500 to-cyan-500 text-black px-8 py-4 rounded-lg font-semibold hover:opacity-90 transition-opacity flex items-center gap-2"
            >
              Start Free Trial
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              to="/contact"
              className="border border-gray-700 text-gray-300 hover:border-gray-500 hover:text-white px-8 py-4 rounded-lg font-semibold transition-all"
            >
              Talk to Sales
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

export default Pricing;
