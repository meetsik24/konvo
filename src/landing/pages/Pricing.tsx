import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronDown } from "lucide-react";

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
        "Basic reporting",
        "Email support",
        "API access",
        "CSV import"
      ],
      cta: "Get started",
      highlighted: false
    },
    {
      name: "Business",
      price: "Volume discounts",
      description: "For growing businesses",
      features: [
        "No monthly fee",
        "12-15 TZS per SMS",
        "Advanced analytics",
        "Priority support",
        "Account manager",
        "Custom integrations",
        "Webhooks included",
        "White-label options"
      ],
      cta: "Contact sales",
      highlighted: true
    },
    {
      name: "Enterprise",
      price: "Custom pricing",
      description: "Full messaging platform",
      features: [
        "Custom SLA",
        "10-13 TZS per SMS",
        "Dedicated infrastructure",
        "24/7 phone support",
        "Custom development",
        "Compliance support",
        "Training included",
        "Multi-user accounts"
      ],
      cta: "Contact sales",
      highlighted: false
    }
  ];

  const faqs = [
    {
      q: "How does pay-as-you-go work?",
      a: "Top up your account with any amount (minimum 10,000 TZS). You only pay for messages sent. No monthly fees or expiration dates."
    },
    {
      q: "Are there volume discounts?",
      a: "Yes. The more you send, the less you pay per message. Contact sales for custom pricing if you send over 100,000 messages monthly."
    },
    {
      q: "What's included in API access?",
      a: "REST API, SDKs for multiple languages, webhooks, and comprehensive documentation. All plans include unlimited API calls."
    },
    {
      q: "Can I switch plans?",
      a: "Yes, anytime. No contracts or cancellation fees. Just contact support to adjust your plan."
    },
    {
      q: "What payment methods are accepted?",
      a: "M-Pesa, Airtel Money, Tigo Pesa, bank transfer, and credit cards. Invoicing available for corporate accounts."
    }
  ];

  return (
    <div className="bg-[#00333e] min-h-screen">
      {/* Hero */}
      <section className="pt-32 pb-20 px-6">
        <div className="container mx-auto max-w-4xl text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
            Simple, transparent pricing
          </h1>
          <p className="text-xl text-gray-300">
            Pay only for what you use. No hidden fees. No contracts.
          </p>
        </div>
      </section>

      {/* SMS Rates */}
      <section className="pb-20 px-6">
        <div className="container mx-auto max-w-3xl">
          <h2 className="text-3xl font-bold text-white text-center mb-8">
            SMS rates in Tanzania
          </h2>
          <div className="bg-white/5 border border-gray-600 rounded-lg overflow-hidden">
            <div className="bg-[#fddf0d] p-4">
              <div className="grid grid-cols-2 font-bold text-[#00333e]">
                <div>Network</div>
                <div className="text-right">Price per SMS</div>
              </div>
            </div>
            {smsRates.map((rate, i) => (
              <div key={i} className="p-4 border-b border-gray-600 last:border-0">
                <div className="grid grid-cols-2 text-gray-300">
                  <div>{rate.network}</div>
                  <div className="text-right font-semibold text-white">{rate.rate}</div>
                </div>
              </div>
            ))}
          </div>
          <p className="text-gray-400 text-sm text-center mt-4">
            Standard 160-character SMS. Unicode messages (Swahili) count as 70 characters.
          </p>
        </div>
      </section>

      {/* Plans */}
      <section className="pb-20 px-6">
        <div className="container mx-auto max-w-5xl">
          <div className="grid md:grid-cols-3 gap-8">
            {plans.map((plan, i) => (
              <div 
                key={i} 
                className={`p-8 rounded-lg border ${
                  plan.highlighted 
                    ? 'bg-[#fddf0d]/10 border-[#fddf0d] ring-2 ring-[#fddf0d]' 
                    : 'bg-white/5 border-gray-600'
                }`}
              >
                {plan.highlighted && (
                  <div className="text-[#fddf0d] text-sm font-bold uppercase mb-4">
                    Most popular
                  </div>
                )}
                <h3 className="text-2xl font-bold text-white mb-2">{plan.name}</h3>
                <div className="text-xl font-semibold text-white mb-2">{plan.price}</div>
                <p className="text-gray-300 mb-8">{plan.description}</p>
                
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, j) => (
                    <li key={j} className="flex items-start gap-2 text-gray-300 text-sm">
                      <span className="text-[#fddf0d] mt-1">✓</span>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() => plan.cta === "Get started" ? navigate("/register") : navigate("/contact")}
                  className={`w-full py-3 rounded-lg font-semibold transition-colors ${
                    plan.highlighted
                      ? 'bg-[#fddf0d] text-[#00333e] hover:bg-[#fce96a]'
                      : 'bg-white/10 text-white hover:bg-white/20 border border-gray-600'
                  }`}
                >
                  {plan.cta}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Other services */}
      <section className="py-20 px-6 bg-[#003d4a]">
        <div className="container mx-auto max-w-5xl">
          <h2 className="text-3xl font-bold text-white text-center mb-12">
            Additional services
          </h2>
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div>
              <h3 className="text-xl font-bold text-white mb-2">WhatsApp Business</h3>
              <p className="text-gray-300 mb-3">Bulk messaging & automation</p>
              <p className="text-2xl font-bold text-[#fddf0d]">Contact sales</p>
            </div>
            <div>
              <h3 className="text-xl font-bold text-white mb-2">Voice & OTP</h3>
              <p className="text-gray-300 mb-3">Authentication & verification</p>
              <p className="text-2xl font-bold text-[#fddf0d]">From 50 TZS</p>
            </div>
            <div>
              <h3 className="text-xl font-bold text-white mb-2">AI Chatbots</h3>
              <p className="text-gray-300 mb-3">24/7 automated support</p>
              <p className="text-2xl font-bold text-[#fddf0d]">From $49/mo</p>
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
              <div key={i} className="bg-white/5 rounded-lg border border-gray-600 overflow-hidden">
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-white/5 transition-colors"
                >
                  <span className="font-semibold text-white pr-8">{faq.q}</span>
                  <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform flex-shrink-0 ${openFaq === i ? 'rotate-180' : ''}`} />
                </button>
                {openFaq === i && (
                  <div className="px-6 pb-4 text-gray-300">
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
            Need custom pricing?
          </h2>
          <p className="text-xl text-gray-300 mb-10">
            Talk to our team about enterprise plans and volume discounts
          </p>
          <button
            onClick={() => navigate("/contact")}
            className="bg-[#fddf0d] text-[#00333e] px-10 py-4 rounded-lg text-lg font-semibold hover:bg-[#fce96a] transition-colors"
          >
            Contact sales
          </button>
        </div>
      </section>
    </div>
  );
}

export default Pricing;
