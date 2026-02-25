import { useNavigate } from "react-router-dom";

function Pricing() {
  const navigate = useNavigate();

  const pricingPlans = [
    {
      service: "SMS",
      price: "TZS 12",
      unit: "per message",
      features: ["Bulk messaging", "Delivery reports", "Sender ID support", "API access"],
      popular: false,
    },
    {
      service: "WhatsApp",
      price: "TZS 20",
      unit: "per message",
      features: ["Rich media support", "Two-way messaging", "Read receipts", "Template messages"],
      popular: true,
    },
    {
      service: "Chatbot",
      price: "TZS 100",
      unit: "per conversation",
      features: ["AI-powered responses", "24/7 availability", "Multi-language", "Custom workflows"],
      popular: false,
    },
    {
      service: "Payments",
      price: "2.5%",
      unit: "per transaction",
      features: ["Mobile money", "Instant settlement", "Fraud protection", "Transaction history"],
      popular: false,
    },
  ];

  return (
    <div className="bg-white">
      {/* Pricing Cards - Dark card style */}
      <div className="px-4 sm:px-6 lg:px-8 py-4">
        <section className="pt-24 pb-16 px-8 bg-gradient-to-br from-[#00333e] via-[#001f26] to-[#00333e] relative rounded-3xl overflow-hidden shadow-2xl">
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:64px_64px]" />

          <div className="container mx-auto max-w-6xl relative z-10">
            <div className="text-center mb-16">
              <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
                Simple, transparent pricing
              </h1>
              <p className="text-xl text-gray-300 mb-8">
                Pay only for what you use. No hidden fees.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
              {pricingPlans.map((plan, i) => (
                <div
                  key={i}
                  className={`flex flex-col bg-white/5 border rounded-xl p-6 backdrop-blur-xl transition-all hover:-translate-y-1 ${plan.popular
                    ? "border-[#fddf0d]/60 ring-1 ring-[#fddf0d]/30 bg-white/10"
                    : "border-white/10 hover:border-[#fddf0d]/60 hover:bg-white/10"
                    }`}
                >
                  {plan.popular && (
                    <div className="text-xs font-bold text-[#00333e] bg-[#fddf0d] rounded-full px-3 py-0.5 inline-block mb-3 self-start">
                      Most Popular
                    </div>
                  )}
                  <div className="text-sm text-[#fddf0d] font-semibold mb-3">{plan.service}</div>
                  <div className="text-3xl font-bold text-white mb-1">{plan.price}</div>
                  <div className="text-sm text-gray-400 mb-5">{plan.unit}</div>

                  <ul className="space-y-2 flex-1 mb-6">
                    {plan.features.map((feature, j) => (
                      <li key={j} className="flex items-start gap-2 text-gray-300 text-sm">
                        <span className="text-[#fddf0d] mt-0.5 flex-shrink-0">✓</span>
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>

                  {/* CTA button pinned to bottom of each card */}
                  <button
                    onClick={() => navigate("/register")}
                    className="w-full mt-auto bg-[#fddf0d] text-[#00333e] py-2.5 rounded-lg font-semibold text-sm hover:bg-[#fce96a] transition-colors"
                  >
                    Get started
                  </button>
                </div>
              ))}
            </div>

          </div>
        </section>
      </div>
    </div>
  );
}

export default Pricing;
