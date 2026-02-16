import { motion } from "framer-motion";
import { CheckCircle, ArrowRight, MessageSquare, MessageCircle, Phone, Shield } from "lucide-react";
import { Button } from "../components/ui/button";
import { Link } from "react-router-dom";

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

const stagger = {
  visible: { transition: { staggerChildren: 0.1 } },
};

function Pricing() {
  const plans = [
    {
      name: "SMS",
      price: "12",
      unit: "TZS / SMS",
      icon: MessageSquare,
      description: "Bulk SMS for businesses of all sizes",
      features: [
        "Bulk SMS delivery",
        "Flash SMS support",
        "Scheduled messaging",
        "Delivery reports",
        "Sender ID customization",
        "Unicode support",
      ],
    },
    {
      name: "OTP Verification",
      price: "15",
      unit: "TZS / OTP",
      icon: Shield,
      description: "Multi-channel secure verification",
      popular: true,
      features: [
        "SMS, WhatsApp & Voice OTP",
        "Swahili voice support",
        "99.9% delivery rate",
        "Auto-retry on failure",
        "Fraud detection",
        "Detailed analytics",
      ],
    },
    {
      name: "Voice",
      price: "50",
      unit: "TZS / min",
      icon: Phone,
      description: "Voice calls and IVR solutions",
      features: [
        "Swahili voice support",
        "IVR systems",
        "Voice broadcasts",
        "Call recordings",
        "Voice OTP",
        "Call analytics",
      ],
    },
    {
      name: "WhatsApp",
      price: "Custom",
      unit: "",
      icon: MessageCircle,
      description: "Official WhatsApp Business API",
      features: [
        "Official API access",
        "Template messages",
        "Rich media support",
        "Interactive buttons",
        "Session messaging",
        "Dedicated support",
      ],
    },
  ];

  const volumeDiscounts = [
    { range: "10,000 - 50,000", discount: "5%" },
    { range: "50,000 - 100,000", discount: "10%" },
    { range: "100,000 - 500,000", discount: "15%" },
    { range: "500,000+", discount: "Custom" },
  ];

  const faqs = [
    {
      q: "How do I get started?",
      a: "Sign up for a free account, add credit to your wallet, and start sending messages. No setup fees required.",
    },
    {
      q: "What payment methods do you accept?",
      a: "M-Pesa, Tigo Pesa, Airtel Money, bank transfers, and major credit cards.",
    },
    {
      q: "Is there a minimum purchase?",
      a: "No minimum. Start with as little as 1,000 TZS.",
    },
    {
      q: "How do volume discounts work?",
      a: "Discounts are applied automatically based on your monthly usage.",
    },
  ];

  return (
    <div className="bg-white">
      {/* Hero */}
      <section className="pt-32 pb-16 bg-[#00333e]">
        <div className="container mx-auto px-4 text-center">
          <motion.div initial="hidden" animate="visible" variants={fadeIn}>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Simple, transparent pricing
            </h1>
            <p className="text-gray-300 text-lg max-w-xl mx-auto mb-8">
              No hidden fees. No monthly commitments. Pay only for what you use.
            </p>
            <div className="flex items-center justify-center gap-6 text-sm text-gray-300">
              <span className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-[#fddf0d]" />
                No setup fees
              </span>
              <span className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-[#fddf0d]" />
                No contracts
              </span>
              <span className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-[#fddf0d]" />
                Volume discounts
              </span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="py-16 -mt-8">
        <div className="container mx-auto px-4">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={stagger}
            className="grid md:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {plans.map((plan, index) => (
              <motion.div
                key={index}
                variants={fadeIn}
                className={`relative rounded-lg p-6 border ${
                  plan.popular
                    ? "bg-[#00333e] text-white border-[#00333e]"
                    : "bg-white text-gray-900 border-gray-200"
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="bg-[#fddf0d] text-[#00333e] text-xs font-semibold px-3 py-1 rounded-full">
                      Popular
                    </span>
                  </div>
                )}

                <plan.icon className={`w-8 h-8 mb-4 ${plan.popular ? "text-[#fddf0d]" : "text-[#00333e]"}`} />

                <h3 className="text-lg font-semibold mb-1">{plan.name}</h3>
                <p className={`text-sm mb-4 ${plan.popular ? "text-gray-300" : "text-gray-600"}`}>
                  {plan.description}
                </p>

                <div className="flex items-baseline gap-1 mb-6">
                  <span className={`text-3xl font-bold ${plan.popular ? "text-white" : "text-[#00333e]"}`}>
                    {plan.price}
                  </span>
                  {plan.unit && (
                    <span className={`text-sm ${plan.popular ? "text-gray-300" : "text-gray-500"}`}>
                      {plan.unit}
                    </span>
                  )}
                </div>

                <ul className="space-y-2 mb-6">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm">
                      <CheckCircle className={`w-4 h-4 mt-0.5 flex-shrink-0 ${
                        plan.popular ? "text-[#fddf0d]" : "text-green-600"
                      }`} />
                      <span className={plan.popular ? "text-gray-200" : "text-gray-600"}>
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>

                <Link to="/register">
                  <button className={`w-full py-2.5 rounded-lg font-medium transition-colors ${
                    plan.popular
                      ? "bg-[#fddf0d] text-[#00333e] hover:bg-[#ffe94d]"
                      : "bg-[#00333e] text-white hover:bg-[#004d5c]"
                  }`}>
                    Get started
                  </button>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Volume Discounts */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
              Volume discounts
            </h2>
            <p className="text-gray-600">
              Send more, save more.
            </p>
          </div>

          <div className="max-w-lg mx-auto bg-white rounded-lg border border-gray-200 overflow-hidden">
            <div className="grid grid-cols-2 bg-[#00333e] text-white text-sm font-medium">
              <div className="px-6 py-3">Monthly SMS Volume</div>
              <div className="px-6 py-3">Discount</div>
            </div>
            {volumeDiscounts.map((tier, index) => (
              <div
                key={index}
                className={`grid grid-cols-2 text-sm ${index % 2 === 0 ? "bg-white" : "bg-gray-50"}`}
              >
                <div className="px-6 py-4 text-gray-900">{tier.range}</div>
                <div className="px-6 py-4 text-[#00333e] font-medium">{tier.discount}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Enterprise */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="bg-[#00333e] rounded-xl p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-8">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">
                Enterprise solutions
              </h2>
              <p className="text-gray-300 max-w-lg">
                Need custom pricing, dedicated support, or high-volume solutions? Our team is ready to help.
              </p>
            </div>
            <a href="mailto:sales@briq.tz">
              <Button className="bg-[#fddf0d] text-[#00333e] hover:bg-[#ffe94d] px-8 py-3 rounded-lg font-semibold whitespace-nowrap">
                Contact sales
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </a>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
              Frequently asked questions
            </h2>
          </div>

          <div className="max-w-2xl mx-auto space-y-4">
            {faqs.map((faq, index) => (
              <div
                key={index}
                className="bg-white rounded-lg border border-gray-200 p-5"
              >
                <h3 className="font-semibold text-gray-900 mb-2">{faq.q}</h3>
                <p className="text-gray-600 text-sm">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
            Ready to get started?
          </h2>
          <p className="text-gray-600 mb-8">
            Create a free account and start sending messages today.
          </p>
          <Link to="/register">
            <Button className="bg-[#00333e] text-white hover:bg-[#004d5c] px-8 py-3 rounded-lg font-semibold">
              Create free account
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}

export default Pricing;