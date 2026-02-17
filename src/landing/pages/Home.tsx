import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Check, MessageSquare, Phone, Bot, Zap, Shield, TrendingUp, ChevronDown } from "lucide-react";

function Home() {
  const navigate = useNavigate();
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const stats = [
    { value: "99.9%", label: "Uptime" },
    { value: "5K+", label: "Msgs/sec" },
    { value: "98.5%", label: "Delivery" },
    { value: "24ms", label: "Latency" },
  ];

  const companies = [
    "Vodacom", "Airtel", "Tigo", "Halotel", "CRDB", "NMB", "Azam"
  ];

  const solutions = [
    {
      icon: MessageSquare,
      title: "Bulk SMS",
      description: "Send targeted messages instantly. 14-17 TZS per SMS. Perfect for alerts, promotions, and customer engagement.",
      features: ["Instant delivery", "Sender ID support", "Unicode (Swahili)", "CSV import"]
    },
    {
      icon: Phone,
      title: "Voice & OTP",
      description: "Secure authentication and voice messaging. SMS OTP, WhatsApp OTP, and AI-powered voice responses.",
      features: ["2FA authentication", "Voice-to-text", "Multi-channel", "Fallback support"]
    },
    {
      icon: Bot,
      title: "AI Chatbots",
      description: "24/7 customer support with intelligent chatbots. Handle queries, collect leads, automate responses.",
      features: ["Natural language", "Multi-platform", "Lead capture", "Analytics"]
    },
  ];

  const steps = [
    {
      number: "01",
      title: "Sign up & verify",
      description: "Create account in 2 minutes. No credit card required."
    },
    {
      number: "02", 
      title: "Import contacts",
      description: "Upload CSV or sync from your CRM. Segment your audience."
    },
    {
      number: "03",
      title: "Launch campaign",
      description: "Send messages, schedule campaigns, or set up automations."
    },
    {
      number: "04",
      title: "Track results",
      description: "Real-time analytics. Monitor delivery, opens, and conversions."
    }
  ];

  const testimonials = [
    {
      quote: "Briq's SMS platform helped us reach farmers instantly with planting updates and price alerts. Delivery is fast and reliable.",
      author: "Elias Leasa",
      role: "Sales Manager",
      company: "Agricom Tanzania"
    },
    {
      quote: "We use Briq for event notifications and ticket confirmations. The API integration was straightforward, and support is excellent.",
      author: "Simon Mawole",
      role: "Tech Consultant",
      company: "Sahara Ventures"
    },
    {
      quote: "WhatsApp OTP integration secured our transactions. SMS fallback ensures we never miss a customer verification.",
      author: "Thomson Maguru",
      role: "Digital Manager",
      company: "Bravo Logistics"
    }
  ];

  const faqs = [
    {
      q: "How quickly can I start sending messages?",
      a: "You can start sending messages within minutes of signing up. The approval process for custom Sender IDs takes 24-48 hours."
    },
    {
      q: "What's the cost per SMS in Tanzania?",
      a: "Bulk SMS costs 14-17 TZS per message depending on volume. No hidden fees. Pay only for what you send."
    },
    {
      q: "Do you support all Tanzanian networks?",
      a: "Yes. We deliver to Vodacom, Airtel, Tigo, Halotel, and all other Tanzanian mobile networks with high success rates."
    },
    {
      q: "Can I integrate Briq with my website or app?",
      a: "Yes. We provide REST APIs, SDKs (PHP, Python, Node.js), and webhooks for seamless integration. Documentation is comprehensive."
    },
    {
      q: "Is there a minimum commitment or contract?",
      a: "No contracts. Pay as you go. Top up your account and start sending. Cancel anytime."
    },
    {
      q: "How secure is the platform?",
      a: "We use bank-grade encryption (TLS 1.3), implement 2FA, and comply with data protection regulations. Your data stays in Tanzania."
    }
  ];

  return (
    <div className="min-h-screen bg-[#001f29]">
      {/* Hero */}
      <section className="pt-32 pb-20 px-6">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center">
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
              Connect with your
              <br />
              <span className="text-[#0ea5e9]">customers instantly</span>
            </h1>
            <p className="text-xl text-gray-400 mb-10 max-w-2xl mx-auto">
              Bulk SMS, WhatsApp, Voice OTP, and AI Chatbots. Built for Tanzanian businesses.
              Fast, reliable, affordable.
            </p>
            <div className="flex gap-4 justify-center">
              <button
                onClick={() => navigate("/register")}
                className="bg-[#0ea5e9] text-white px-8 py-4 rounded-lg text-lg font-medium hover:bg-[#0284c7] transition-colors"
              >
                Start free trial
              </button>
              <button
                onClick={() => navigate("/contact")}
                className="bg-white/10 text-white px-8 py-4 rounded-lg text-lg font-medium hover:bg-white/20 transition-colors backdrop-blur-sm"
              >
                Talk to sales
              </button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-20">
            {stats.map((stat, i) => (
              <div key={i} className="text-center p-6 bg-white/5 rounded-lg backdrop-blur-sm border border-white/10">
                <div className="text-3xl font-bold text-[#0ea5e9] mb-1">{stat.value}</div>
                <div className="text-sm text-gray-400">{stat.label}</div>
              </div>
            ))}
          </div>

          {/* Trusted by */}
          <div className="mt-16 text-center">
            <p className="text-sm text-gray-500 uppercase tracking-wider mb-6">Trusted by leading Tanzanian businesses</p>
            <div className="flex flex-wrap justify-center gap-8 items-center opacity-60">
              {companies.map((company, i) => (
                <div key={i} className="text-gray-400 font-medium text-lg">{company}</div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Why Trust Us */}
      <section className="py-20 px-6 bg-[#002a38]">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-4xl font-bold text-white text-center mb-16">
            Why businesses trust Briq
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="p-8 bg-white/5 rounded-lg border border-white/10">
              <div className="w-12 h-12 bg-[#0ea5e9]/20 rounded-lg flex items-center justify-center mb-6">
                <Zap className="w-6 h-6 text-[#0ea5e9]" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Lightning fast</h3>
              <p className="text-gray-400">
                Messages delivered in seconds. Our optimized infrastructure handles 5,000+ messages per second with 24ms average latency.
              </p>
            </div>
            <div className="p-8 bg-white/5 rounded-lg border border-white/10">
              <div className="w-12 h-12 bg-[#0ea5e9]/20 rounded-lg flex items-center justify-center mb-6">
                <Shield className="w-6 h-6 text-[#0ea5e9]" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Bank-grade security</h3>
              <p className="text-gray-400">
                TLS 1.3 encryption, 2FA authentication, and local data storage. Your customer data stays in Tanzania, always protected.
              </p>
            </div>
            <div className="p-8 bg-white/5 rounded-lg border border-white/10">
              <div className="w-12 h-12 bg-[#0ea5e9]/20 rounded-lg flex items-center justify-center mb-6">
                <TrendingUp className="w-6 h-6 text-[#0ea5e9]" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">99.9% uptime</h3>
              <p className="text-gray-400">
                Reliable infrastructure with redundant systems. Direct carrier connections ensure your messages always get through.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Solutions */}
      <section className="py-20 px-6">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-4xl font-bold text-white text-center mb-4">
            Everything you need to engage customers
          </h2>
          <p className="text-gray-400 text-center mb-16 text-lg">
            One platform. Multiple channels. Unlimited possibilities.
          </p>
          <div className="grid md:grid-cols-3 gap-8">
            {solutions.map((solution, i) => {
              const Icon = solution.icon;
              return (
                <div key={i} className="p-8 bg-white/5 rounded-lg border border-white/10 hover:border-[#0ea5e9]/50 transition-colors">
                  <Icon className="w-10 h-10 text-[#0ea5e9] mb-6" />
                  <h3 className="text-2xl font-bold text-white mb-3">{solution.title}</h3>
                  <p className="text-gray-400 mb-6">{solution.description}</p>
                  <ul className="space-y-2">
                    {solution.features.map((feature, j) => (
                      <li key={j} className="flex items-center gap-2 text-sm text-gray-300">
                        <Check className="w-4 h-4 text-[#0ea5e9]" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 px-6 bg-[#002a38]">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-4xl font-bold text-white text-center mb-16">
            Get started in 4 simple steps
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step, i) => (
              <div key={i} className="relative">
                <div className="text-6xl font-bold text-white/10 mb-4">{step.number}</div>
                <h3 className="text-xl font-bold text-white mb-2">{step.title}</h3>
                <p className="text-gray-400">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 px-6">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-4xl font-bold text-white text-center mb-16">
            Trusted by businesses across Tanzania
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, i) => (
              <div key={i} className="p-8 bg-white/5 rounded-lg border border-white/10">
                <p className="text-gray-300 mb-6 italic">"{testimonial.quote}"</p>
                <div>
                  <div className="font-bold text-white">{testimonial.author}</div>
                  <div className="text-sm text-gray-400">{testimonial.role}</div>
                  <div className="text-sm text-[#0ea5e9]">{testimonial.company}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 px-6 bg-[#002a38]">
        <div className="container mx-auto max-w-3xl">
          <h2 className="text-4xl font-bold text-white text-center mb-16">
            Frequently asked questions
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
            Ready to connect with your customers?
          </h2>
          <p className="text-xl text-gray-400 mb-10">
            Start your free trial today. No credit card required.
          </p>
          <button
            onClick={() => navigate("/register")}
            className="bg-[#0ea5e9] text-white px-10 py-4 rounded-lg text-lg font-medium hover:bg-[#0284c7] transition-colors"
          >
            Get started free
          </button>
        </div>
      </section>
    </div>
  );
}

export default Home;
