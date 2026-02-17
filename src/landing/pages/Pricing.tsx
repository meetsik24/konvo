import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Check, ChevronDown } from "lucide-react";

function Pricing() {
  const navigate = useNavigate();
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const smsRates = [
    { network: "Vodacom", rate: "14 TZS" },
    { network: "Airtel", rate: "15 TZS" },
    { network: "Tigo", rate: "16 TZS" },
    { network: "Halotel", rate: "17 TZS" },
  ];

  const plans = [
    {
      name: "Starter",
      price: "Pay as you go",
      description: "Perfect for testing and small campaigns",
      features: [
        "No monthly fee",
        "14-17 TZS per SMS",
        "Basic analytics",
        "Email support",
        "API access",
        "CSV import"
      ],
      cta: "Get started",
      popular: false
    },
    {
      name: "Business",
      price: "Custom",
      description: "For growing businesses with regular campaigns",
      features: [
        "Volume discounts",
        "12-15 TZS per SMS",
        "Advanced analytics",
        "Priority support",
        "Dedicated account manager",
        "Custom integrations",
        "Webhooks",
        "White-label options"
      ],
      cta: "Contact sales",
      popular: true
    },
    {
      name: "Enterprise",
      price: "Custom",
      description: "Full-scale communication platform",
      features: [
        "Best available rates",
        "10-13 TZS per SMS",
        "Custom SLA",
        "24/7 phone support",
        "Dedicated infrastructure",
        "Custom development",
        "Compliance assistance",
        "Training & onboarding"
      ],
      cta: "Contact sales",
      popular: false
    }
  ];

  const faqs = [
    {
      q: "How does pay-as-you-go work?",
      a: "Top up your account with any amount (minimum 10,000 TZS). You only pay for messages sent. No monthly fees, no expiration."
    },
    {
      q: "Do you offer volume discounts?",
      a: "Yes. The more you send, the less you pay. Contact sales for custom pricing if you send over 100,000 messages per month."
    },
    {
      q: "What's included in the API access?",
      a: "REST API, SDKs (PHP, Python, Node.js, Java), webhooks, and comprehensive documentation. Unlimited API calls."
    },
    {
      q: "Can I switch plans later?",
      a: "Absolutely. Upgrade or downgrade anytime. No contracts, no cancellation fees."
    },
    {
      q: "What payment methods do you accept?",
      a: "M-Pesa, Airtel Money, Tigo Pesa, bank transfer, and major credit cards. Invoicing available for corporate accounts."
    }
  ];

  return (
    <div className="min-h-screen bg-[#001f29]">
      {/* Hero */}
      <section className="pt-32 pb-20 px-6">
        <div className="container mx-auto max-w-4xl text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
            Simple, transparent pricing
          </h1>
          <p className="text-xl text-gray-400">
            Pay only for what you use. No hidden fees. Cancel anytime.
          </p>
        </div>
      </section>

      {/* SMS Rates */}
      <section className="pb-20 px-6">
        <div className="container mx-auto max-w-4xl">
          <h2 className="text-3xl font-bold text-white text-center mb-8">
            Tanzania SMS rates
          </h2>
          <div className="bg-white/5 border border-white/10 rounded-lg overflow-hidden">
            <div className="bg-[#0ea5e9] p-4">
              <div className="grid grid-cols-2 font-bold text-white">
                <div>Network</div>
                <div className="text-right">Rate per SMS</div>
              </div>
            </div>
            {smsRates.map((rate, i) => (
              <div key={i} className="p-4 border-b border-white/10 last:border-0">
                <div className="grid grid-cols-2 text-gray-300">
                  <div>{rate.network}</div>
                  <div className="text-right font-medium text-white">{rate.rate}</div>
                </div>
              </div>
            ))}
          </div>
          <p className="text-gray-400 text-sm text-center mt-4">
            Rates for standard 160-character SMS. Unicode messages count as 70 characters.
          </p>
        </div>
      </section>

      {/* Plans */}
      <section className="pb-20 px-6">
        <div className="container mx-auto max-w-6xl">
          <div className="grid md:grid-cols-3 gap-8">
            {plans.map((plan, i) => (
              <div 
                key={i} 
                className={`p-8 rounded-lg border ${
                  plan.popular 
                    ? 'bg-[#0ea5e9]/10 border-[#0ea5e9]' 
                    : 'bg-white/5 border-white/10'
                }`}
              >
                {plan.popular && (
                  <div className="text-[#0ea5e9] text-sm font-bold uppercase tracking-wider mb-4">
                    Most popular
                  </div>
                )}
                <h3 className="text-2xl font-bold text-white mb-2">{plan.name}</h3>
                <div className="text-3xl font-bold text-white mb-2">{plan.price}</div>
                <p className="text-gray-400 mb-8">{plan.description}</p>
                
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, j) => (
                    <li key={j} className="flex items-start gap-2 text-gray-300">
                      <Check className="w-5 h-5 text-[#0ea5e9] flex-shrink-0 mt-0.5" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() => plan.cta === "Get started" ? navigate("/register") : navigate("/contact")}
                  className={`w-full py-3 rounded-lg font-medium transition-colors ${
                    plan.popular
                      ? 'bg-[#0ea5e9] text-white hover:bg-[#0284c7]'
                      : 'bg-white/10 text-white hover:bg-white/20'
                  }`}
                >
                  {plan.cta}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Additional services */}
      <section className="py-20 px-6 bg-[#002a38]">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-3xl font-bold text-white text-center mb-12">
            Additional services
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="p-6 bg-white/5 rounded-lg border border-white/10">
              <h3 className="text-xl font-bold text-white mb-2">WhatsApp Business</h3>
              <p className="text-gray-400 mb-4">Bulk messaging and automation</p>
              <p className="text-2xl font-bold text-[#0ea5e9]">Contact sales</p>
            </div>
            <div className="p-6 bg-white/5 rounded-lg border border-white/10">
              <h3 className="text-xl font-bold text-white mb-2">Voice & OTP</h3>
              <p className="text-gray-400 mb-4">Per verification pricing</p>
              <p className="text-2xl font-bold text-[#0ea5e9]">From 50 TZS</p>
            </div>
            <div className="p-6 bg-white/5 rounded-lg border border-white/10">
              <h3 className="text-xl font-bold text-white mb-2">AI Chatbots</h3>
              <p className="text-gray-400 mb-4">Monthly subscription</p>
              <p className="text-2xl font-bold text-[#0ea5e9]">From $49/mo</p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 px-6">
        <div className="container mx-auto max-w-3xl">
          <h2 className="text-3xl font-bold text-white text-center mb-12">
            Pricing questions
          </h2>
          <div className="space-y-4">
            {faqs.map((faq, i) => (
              <div key={i} className="bg-white/5 rounded-lg border border-white/10 overflow-hidden">
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full px-6 py-5 flex items-center justify-between text-left hover:bg-white/5 transition-colors"
                >
                  <span className="font-medium text-white pr-8">{faq.q}</span>
                  <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform flex-shrink-0 ${openFaq === i ? 'rotate-180' : ''}`} />
                </button>
                {openFaq === i && (
                  <div className="px-6 pb-5 text-gray-400">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-4xl font-bold text-white mb-6">
            Need a custom plan?
          </h2>
          <p className="text-xl text-gray-400 mb-10">
            Talk to our sales team about enterprise pricing and custom solutions.
          </p>
          <button
            onClick={() => navigate("/contact")}
            className="bg-[#0ea5e9] text-white px-10 py-4 rounded-lg text-lg font-medium hover:bg-[#0284c7] transition-colors"
          >
            Contact sales
          </button>
        </div>
      </section>
    </div>
  );
}

export default Pricing;
