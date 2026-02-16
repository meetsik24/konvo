import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  MessageSquare,
  MessageCircle,
  Phone,
  Lock,
  Users,
  CheckCircle,
  ArrowRight,
  Zap,
  Globe,
  BarChart3,
  Shield,
  Clock,
} from "lucide-react";
import Navbar from "../components/Navbar";
import { Footer } from "../components/Footer";

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

function Features() {
  const products = [
    {
      id: "sms",
      icon: MessageSquare,
      title: "Bulk SMS",
      tagline: "High-throughput messaging",
      metric: "50M+ monthly",
      description:
        "Enterprise-grade SMS infrastructure with direct carrier connections across Tanzania. Send marketing campaigns, transactional alerts, and notifications at scale.",
      features: [
        "Direct connections to all TZ networks",
        "99.9% delivery rate SLA",
        "Scheduled and instant delivery",
        "Unicode and long message support",
        "Delivery reports and analytics",
        "Custom sender IDs",
      ],
      useCases: ["Marketing campaigns", "Appointment reminders", "Transaction alerts", "Two-factor authentication"],
    },
    {
      id: "whatsapp",
      icon: MessageCircle,
      title: "WhatsApp Business API",
      tagline: "Official Meta partner",
      metric: "2s avg delivery",
      description:
        "Connect with customers on their preferred messaging platform. Send rich media, automate conversations, and manage customer interactions at scale.",
      features: [
        "Official Meta Business Partner",
        "Template message management",
        "Rich media support (images, documents, buttons)",
        "Automated responses and chatbots",
        "Session message handling",
        "Webhook integrations",
      ],
      useCases: ["Customer support", "Order notifications", "Interactive catalogs", "Appointment booking"],
    },
    {
      id: "otp",
      icon: Lock,
      title: "OTP Verification",
      tagline: "Bank-grade security",
      metric: "99.5% success",
      description:
        "Multi-channel one-time password delivery for secure user verification. Protect accounts and transactions with reliable OTP delivery via SMS, WhatsApp, or Voice.",
      features: [
        "Multi-channel delivery (SMS, WhatsApp, Voice)",
        "Swahili voice support",
        "Automatic fallback routing",
        "Configurable expiry times",
        "Rate limiting and fraud prevention",
        "99.5% successful verification rate",
      ],
      useCases: ["Account registration", "Transaction verification", "Password reset", "Login authentication"],
    },
    {
      id: "chatbots",
      icon: Users,
      title: "AI Chatbots",
      tagline: "24/7 automation",
      metric: "100% uptime",
      description:
        "Intelligent conversational agents that handle customer queries, qualify leads, and provide instant support around the clock.",
      features: [
        "Natural language understanding",
        "Multi-language support (English, Swahili)",
        "CRM and helpdesk integrations",
        "Lead qualification workflows",
        "Human handoff capabilities",
        "Conversation analytics",
      ],
      useCases: ["Customer service automation", "Lead generation", "FAQ handling", "Appointment scheduling"],
    },
    {
      id: "voice",
      icon: Phone,
      title: "Voice Services",
      tagline: "Programmable calls",
      metric: "<200ms latency",
      description:
        "Make and receive voice calls programmatically. Build IVR systems, voice notifications, and click-to-call functionality.",
      features: [
        "Outbound voice calls",
        "Interactive Voice Response (IVR)",
        "Voice recording",
        "Text-to-speech in Swahili",
        "Call forwarding and routing",
        "Real-time call analytics",
      ],
      useCases: ["Voice OTP", "Automated reminders", "Survey and feedback", "Customer verification"],
    },
  ];

  const capabilities = [
    { icon: Zap, title: "High Performance", desc: "Process 5,000+ messages per second with sub-second latency" },
    { icon: Globe, title: "Pan-African Coverage", desc: "Direct routes to networks across East Africa" },
    { icon: Shield, title: "Enterprise Security", desc: "SOC 2 compliant with end-to-end encryption" },
    { icon: BarChart3, title: "Real-time Analytics", desc: "Comprehensive dashboards and reporting" },
    { icon: Clock, title: "99.9% Uptime", desc: "Redundant infrastructure with enterprise SLAs" },
    { icon: Users, title: "Dedicated Support", desc: "Local technical team available 24/7" },
  ];

  return (
    <div className="bg-[#0a0a0f] text-white">
      <Navbar />

      {/* Hero */}
      <section className="pt-32 pb-20 relative overflow-hidden">
        {/* Grid background */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:64px_64px]"></div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl"></div>

        <div className="container mx-auto px-6 lg:px-8 relative z-10">
          <div className="max-w-3xl">
            <motion.div initial="hidden" animate="visible" variants={fadeIn}>
              <p className="text-emerald-400 font-semibold text-sm tracking-wide uppercase mb-4">
                Products
              </p>
              <h1 className="text-4xl lg:text-5xl font-bold leading-tight mb-6">
                Communication APIs for
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400"> every use case</span>
              </h1>
              <p className="text-xl text-gray-400 leading-relaxed">
                From bulk messaging to intelligent chatbots, our platform provides the tools 
                you need to connect with customers across Tanzania.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Products */}
      {products.map((product, index) => (
        <section
          key={product.id}
          id={product.id}
          className={`py-24 ${index % 2 === 0 ? "bg-[#0a0a0f]" : "bg-[#111118]"}`}
        >
          <div className="container mx-auto px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-16 items-start">
              <motion.div
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeIn}
              >
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 rounded-xl flex items-center justify-center">
                    <product.icon className="w-6 h-6 text-emerald-400" />
                  </div>
                  <span className="text-emerald-400 text-sm font-mono">{product.metric}</span>
                </div>
                <p className="text-gray-500 font-medium text-sm uppercase tracking-wide mb-2">
                  {product.tagline}
                </p>
                <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">
                  {product.title}
                </h2>
                <p className="text-lg text-gray-400 mb-8">
                  {product.description}
                </p>
                <Link
                  to="/contact"
                  className="inline-flex items-center bg-gradient-to-r from-emerald-500 to-cyan-500 text-black px-6 py-3 rounded-lg font-semibold hover:opacity-90 transition-opacity"
                >
                  Get Started
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </motion.div>

              <motion.div
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeIn}
              >
                <div className="bg-[#111118] rounded-2xl border border-gray-800 p-8">
                  <h3 className="font-semibold text-white mb-6">Key Features</h3>
                  <ul className="space-y-4 mb-8">
                    {product.features.map((feature, i) => (
                      <li key={i} className="flex items-start">
                        <CheckCircle className="w-5 h-5 text-emerald-400 mr-3 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-300">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <h3 className="font-semibold text-white mb-4">Common Use Cases</h3>
                  <div className="flex flex-wrap gap-2">
                    {product.useCases.map((useCase, i) => (
                      <span
                        key={i}
                        className="bg-gray-800 text-gray-300 text-sm px-3 py-1 rounded-full border border-gray-700"
                      >
                        {useCase}
                      </span>
                    ))}
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>
      ))}

      {/* Platform Capabilities */}
      <section className="py-24 bg-gradient-to-br from-emerald-500/10 to-cyan-500/10 border-y border-emerald-500/20">
        <div className="container mx-auto px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">
              Enterprise-grade platform
            </h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              Built for reliability, security, and scale. Our infrastructure handles 
              millions of messages daily.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {capabilities.map((cap, i) => (
              <motion.div
                key={i}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeIn}
                className="text-center"
              >
                <div className="w-14 h-14 bg-[#111118] border border-gray-800 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <cap.icon className="w-7 h-7 text-emerald-400" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">{cap.title}</h3>
                <p className="text-gray-500 text-sm">{cap.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 bg-[#0a0a0f]">
        <div className="container mx-auto px-6 lg:px-8 text-center">
          <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">
            Ready to get started?
          </h2>
          <p className="text-lg text-gray-400 mb-10 max-w-xl mx-auto">
            Create a free account and explore our APIs. No credit card required.
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
              to="/pricing"
              className="border border-gray-700 text-gray-300 hover:border-gray-500 hover:text-white px-8 py-4 rounded-lg font-semibold transition-all"
            >
              View Pricing
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

export default Features;
