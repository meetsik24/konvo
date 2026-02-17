import { MessageSquare, Phone, Bot, Smartphone, Check } from "lucide-react";
import { useNavigate } from "react-router-dom";

function Features() {
  const navigate = useNavigate();

  const features = [
    {
      id: "sms",
      icon: MessageSquare,
      title: "Bulk SMS",
      tagline: "Reach every customer instantly",
      description: "Send thousands of messages per second. Support for all Tanzanian networks with 98.5% delivery success rate.",
      capabilities: [
        "Custom Sender IDs",
        "Unicode (Swahili) support",
        "CSV bulk import",
        "Scheduled campaigns",
        "Two-way messaging",
        "Delivery reports"
      ],
      pricing: "14-17 TZS per SMS"
    },
    {
      id: "whatsapp",
      icon: Smartphone,
      title: "WhatsApp Business",
      tagline: "Meet customers where they are",
      description: "Send bulk WhatsApp messages, automate replies, and manage customer conversations from one dashboard.",
      capabilities: [
        "Bulk messaging",
        "Rich media (images, PDFs)",
        "Auto-replies",
        "Contact management",
        "Campaign tracking",
        "Cloud API integration"
      ],
      pricing: "Contact for pricing"
    },
    {
      id: "voice",
      icon: Phone,
      title: "Voice & OTP",
      tagline: "Secure authentication made easy",
      description: "SMS OTP, WhatsApp OTP, and voice calls. Multi-channel fallback ensures every verification succeeds.",
      capabilities: [
        "SMS OTP",
        "WhatsApp OTP",
        "Voice OTP",
        "Auto fallback",
        "Custom templates",
        "2FA integration"
      ],
      pricing: "Pay per verification"
    },
    {
      id: "chatbots",
      icon: Bot,
      title: "AI Chatbots",
      tagline: "24/7 customer support on autopilot",
      description: "Intelligent chatbots that understand context, answer questions, and collect leads while you sleep.",
      capabilities: [
        "Natural language AI",
        "Multi-platform deployment",
        "Lead capture forms",
        "Analytics dashboard",
        "Human handoff",
        "Custom training"
      ],
      pricing: "From $49/month"
    }
  ];

  return (
    <div className="min-h-screen bg-[#001f29]">
      {/* Hero */}
      <section className="pt-32 pb-20 px-6">
        <div className="container mx-auto max-w-4xl text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
            Built for modern businesses
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Everything you need to communicate with customers across SMS, WhatsApp, Voice, and AI chatbots.
          </p>
        </div>
      </section>

      {/* Features */}
      <section className="pb-20 px-6">
        <div className="container mx-auto max-w-6xl space-y-32">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div 
                key={feature.id} 
                id={feature.id}
                className={`grid md:grid-cols-2 gap-12 items-center ${index % 2 === 1 ? 'md:flex-row-reverse' : ''}`}
              >
                {/* Content */}
                <div className={index % 2 === 1 ? 'md:order-2' : ''}>
                  <div className="w-12 h-12 bg-[#0ea5e9]/20 rounded-lg flex items-center justify-center mb-6">
                    <Icon className="w-6 h-6 text-[#0ea5e9]" />
                  </div>
                  <h2 className="text-4xl font-bold text-white mb-3">{feature.title}</h2>
                  <p className="text-xl text-[#0ea5e9] mb-4">{feature.tagline}</p>
                  <p className="text-gray-400 mb-8 text-lg">{feature.description}</p>
                  
                  <div className="grid grid-cols-2 gap-3 mb-8">
                    {feature.capabilities.map((capability, i) => (
                      <div key={i} className="flex items-center gap-2 text-gray-300">
                        <Check className="w-4 h-4 text-[#0ea5e9] flex-shrink-0" />
                        <span className="text-sm">{capability}</span>
                      </div>
                    ))}
                  </div>

                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => navigate("/register")}
                      className="bg-[#0ea5e9] text-white px-6 py-3 rounded-lg font-medium hover:bg-[#0284c7] transition-colors"
                    >
                      Get started
                    </button>
                    <span className="text-gray-400 text-sm">{feature.pricing}</span>
                  </div>
                </div>

                {/* Mockup */}
                <div className={`${index % 2 === 1 ? 'md:order-1' : ''}`}>
                  <div className="bg-white/5 border border-white/10 rounded-lg p-8 backdrop-blur-sm">
                    <div className="bg-[#002a38] rounded-lg p-6 border border-white/10">
                      <div className="flex items-center gap-2 mb-4">
                        <div className="w-3 h-3 rounded-full bg-red-500/50"></div>
                        <div className="w-3 h-3 rounded-full bg-yellow-500/50"></div>
                        <div className="w-3 h-3 rounded-full bg-green-500/50"></div>
                      </div>
                      <div className="space-y-3">
                        <div className="h-8 bg-white/5 rounded w-3/4"></div>
                        <div className="h-8 bg-white/5 rounded w-1/2"></div>
                        <div className="h-20 bg-white/5 rounded"></div>
                        <div className="h-8 bg-[#0ea5e9]/20 rounded w-1/3"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Platform capabilities */}
      <section className="py-20 px-6 bg-[#002a38]">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-4xl font-bold text-white text-center mb-16">
            Built for developers and businesses
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="p-6 bg-white/5 rounded-lg border border-white/10">
              <h3 className="text-xl font-bold text-white mb-3">REST API</h3>
              <p className="text-gray-400">
                Simple, well-documented API. Integrate in minutes with our SDKs for PHP, Python, Node.js, and more.
              </p>
            </div>
            <div className="p-6 bg-white/5 rounded-lg border border-white/10">
              <h3 className="text-xl font-bold text-white mb-3">Webhooks</h3>
              <p className="text-gray-400">
                Real-time delivery status, incoming messages, and event notifications sent directly to your server.
              </p>
            </div>
            <div className="p-6 bg-white/5 rounded-lg border border-white/10">
              <h3 className="text-xl font-bold text-white mb-3">Dashboard</h3>
              <p className="text-gray-400">
                Powerful web interface for campaign management, analytics, and team collaboration. No coding required.
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
          <p className="text-xl text-gray-400 mb-10">
            Join hundreds of businesses using Briq to connect with customers.
          </p>
          <button
            onClick={() => navigate("/register")}
            className="bg-[#0ea5e9] text-white px-10 py-4 rounded-lg text-lg font-medium hover:bg-[#0284c7] transition-colors"
          >
            Create free account
          </button>
        </div>
      </section>
    </div>
  );
}

export default Features;
