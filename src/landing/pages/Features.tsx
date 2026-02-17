import { useNavigate } from "react-router-dom";

function Features() {
  const navigate = useNavigate();

  const features = [
    {
      id: "sms",
      title: "Bulk SMS",
      tagline: "Reach every customer instantly",
      description: "Send thousands of messages per second to all Tanzanian networks. Custom Sender IDs, Unicode support for Swahili, scheduled campaigns, and detailed delivery reports.",
      price: "14-17 TZS per SMS",
      capabilities: [
        "Custom Sender IDs",
        "Unicode (Swahili) support",
        "CSV bulk import",
        "Scheduled campaigns",
        "Two-way messaging",
        "Real-time delivery reports"
      ]
    },
    {
      id: "whatsapp",
      title: "WhatsApp Business",
      tagline: "Connect where your customers are",
      description: "Send bulk WhatsApp messages, automate customer replies, and manage conversations from one dashboard. Rich media support including images, documents, and location sharing.",
      price: "Contact for pricing",
      capabilities: [
        "Bulk messaging campaigns",
        "Rich media (images, PDFs)",
        "Automated responses",
        "Contact management",
        "Campaign analytics",
        "Cloud API integration"
      ]
    },
    {
      id: "voice",
      title: "Voice & OTP",
      tagline: "Secure authentication",
      description: "SMS OTP, WhatsApp OTP, and voice verification. Multi-channel fallback ensures every authentication succeeds, even when one channel fails.",
      price: "Per verification pricing",
      capabilities: [
        "SMS OTP delivery",
        "WhatsApp OTP",
        "Voice call OTP",
        "Automatic fallback",
        "Custom OTP templates",
        "2FA integration APIs"
      ]
    },
    {
      id: "chatbots",
      title: "AI Chatbots",
      tagline: "24/7 automated support",
      description: "Deploy intelligent chatbots that understand context, answer customer questions, capture leads, and hand off to humans when needed.",
      price: "From $49/month",
      capabilities: [
        "Natural language understanding",
        "Multi-platform deployment",
        "Lead capture & qualification",
        "Analytics & insights",
        "Human agent handoff",
        "Custom knowledge training"
      ]
    }
  ];

  return (
    <div className="bg-[#00333e] min-h-screen">
      {/* Hero */}
      <section className="pt-32 pb-20 px-6">
        <div className="container mx-auto max-w-4xl text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
            Everything you need to engage customers
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            One platform. Multiple channels. Complete messaging infrastructure for your business.
          </p>
        </div>
      </section>

      {/* Features */}
      <section className="pb-20 px-6">
        <div className="container mx-auto max-w-5xl space-y-24">
          {features.map((feature, index) => (
            <div 
              key={feature.id} 
              id={feature.id}
              className={`grid md:grid-cols-2 gap-12 items-start ${index % 2 === 1 ? 'bg-[#003d4a] -mx-6 px-6 md:-mx-12 md:px-12 py-12 rounded-lg' : ''}`}
            >
              <div>
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">{feature.title}</h2>
                <p className="text-xl text-[#fddf0d] mb-4">{feature.tagline}</p>
                <p className="text-gray-300 mb-8 leading-relaxed">{feature.description}</p>
                
                <div className="space-y-2 mb-8">
                  {feature.capabilities.map((capability, i) => (
                    <div key={i} className="flex items-start gap-3 text-gray-300">
                      <span className="text-[#fddf0d] mt-1">•</span>
                      <span>{capability}</span>
                    </div>
                  ))}
                </div>

                <div className="flex items-center gap-4">
                  <button
                    onClick={() => navigate("/register")}
                    className="bg-[#fddf0d] text-[#00333e] px-6 py-3 rounded-lg font-semibold hover:bg-[#fce96a] transition-colors"
                  >
                    Get started
                  </button>
                  <span className="text-gray-400">{feature.price}</span>
                </div>
              </div>

              <div className="bg-white/5 border border-gray-600 rounded-lg p-8">
                <div className="bg-[#00333e] rounded-lg p-6">
                  <div className="flex items-center gap-2 mb-6">
                    <div className="w-3 h-3 rounded-full bg-red-500/50"></div>
                    <div className="w-3 h-3 rounded-full bg-yellow-500/50"></div>
                    <div className="w-3 h-3 rounded-full bg-green-500/50"></div>
                    <span className="ml-2 text-gray-400 text-sm">{feature.title}</span>
                  </div>
                  <div className="space-y-3">
                    <div className="h-8 bg-white/5 rounded w-3/4"></div>
                    <div className="h-8 bg-white/5 rounded w-1/2"></div>
                    <div className="h-24 bg-white/5 rounded"></div>
                    <div className="h-10 bg-[#fddf0d]/20 rounded w-1/3 flex items-center justify-center">
                      <span className="text-[#fddf0d] font-semibold text-sm">Send</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Platform */}
      <section className="py-20 px-6 bg-[#003d4a]">
        <div className="container mx-auto max-w-5xl">
          <h2 className="text-3xl md:text-4xl font-bold text-white text-center mb-12">
            Built for developers and businesses
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <h3 className="text-xl font-bold text-white mb-3">REST API</h3>
              <p className="text-gray-300">
                Simple API integration with SDKs for PHP, Python, Node.js, and comprehensive documentation.
              </p>
            </div>
            <div className="text-center">
              <h3 className="text-xl font-bold text-white mb-3">Real-time Webhooks</h3>
              <p className="text-gray-300">
                Get delivery status, incoming messages, and event notifications sent to your server instantly.
              </p>
            </div>
            <div className="text-center">
              <h3 className="text-xl font-bold text-white mb-3">Dashboard</h3>
              <p className="text-gray-300">
                Manage campaigns, view analytics, and collaborate with your team. No coding required.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-4xl font-bold text-white mb-6">
            Start building today
          </h2>
          <p className="text-xl text-gray-300 mb-10">
            Join hundreds of businesses using Briq to connect with customers
          </p>
          <button
            onClick={() => navigate("/register")}
            className="bg-[#fddf0d] text-[#00333e] px-10 py-4 rounded-lg text-lg font-semibold hover:bg-[#fce96a] transition-colors"
          >
            Create free account
          </button>
        </div>
      </section>
    </div>
  );
}

export default Features;
