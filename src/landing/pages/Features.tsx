import { MessageSquare, Lock, Phone, Volume2, Code, Bell, Shield, Zap, Globe, CheckCircle, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { Footer } from "../components/Footer";

const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

// Features component
function Features() {
  const navigate = useNavigate();

  const mainFeatures = [
    {
      icon: MessageSquare,
      title: "Bulk SMS",
      description: "Send thousands of messages instantly with 99.2% delivery rate. Perfect for marketing campaigns, alerts, and notifications.",
      benefits: ["14-17 TZS per SMS", "Scheduled sending", "Delivery reports", "Custom sender IDs"],
      color: "bg-blue-500",
    },
    {
      icon: Lock,
      title: "OTP Authentication",
      description: "Secure your applications with one-time passwords delivered via SMS or WhatsApp in seconds.",
      benefits: ["99.9% uptime", "Auto-retry logic", "Multi-channel fallback", "Real-time verification"],
      color: "bg-green-500",
    },
    {
      icon: MessageSquare,
      title: "WhatsApp Business",
      description: "Engage customers on their favorite platform with rich media, templates, and two-way conversations.",
      benefits: ["Verified business profile", "Template messages", "Media support", "Chatbot integration"],
      color: "bg-emerald-500",
    },
    {
      icon: Volume2,
      title: "Voice & IVR",
      description: "Automate customer interactions with AI-powered voice calls and interactive voice response systems.",
      benefits: ["Text-to-speech", "Call recording", "IVR menus", "AI transcription"],
      color: "bg-purple-500",
    },
    {
      icon: Phone,
      title: "USSD Services",
      description: "Reach customers without internet access using USSD shortcodes for surveys, payments, and more.",
      benefits: ["Works offline", "Instant response", "Custom menus", "MNO integration"],
      color: "bg-orange-500",
    },
    {
      icon: Code,
      title: "Developer APIs",
      description: "Build powerful communication features into your apps with our RESTful APIs and SDKs.",
      benefits: ["RESTful design", "Webhooks", "SDKs available", "Sandbox testing"],
      color: "bg-indigo-500",
    },
  ];

  return (
    <div className="bg-white font-sans">
      <Navbar />

      {/* Hero Section */}
      <section className="relative pt-28 pb-16 bg-gradient-to-br from-[#00333e] via-[#004d5c] to-[#00333e] overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-10 w-72 h-72 bg-[#fddf0d] rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-[#fddf0d] rounded-full blur-3xl"></div>
        </div>

        <div className="container mx-auto px-4 relative">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-3xl mx-auto"
          >
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Everything You Need to
              <span className="block text-[#fddf0d]">Connect & Engage</span>
            </h1>
            <p className="text-gray-300 text-lg md:text-xl mb-8">
              From bulk messaging to AI-powered automation, Briq provides all the communication
              tools your business needs to thrive in Tanzania and beyond.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <button
                onClick={() => navigate("/register")}
                className="bg-[#fddf0d] hover:bg-[#e5c90c] text-[#00333e] font-bold px-8 py-4 text-lg rounded-lg shadow-lg hover:shadow-xl transition-all inline-flex items-center justify-center"
              >
                Start Free Trial
                <ArrowRight className="w-5 h-5 ml-2" />
              </button>
              <button
                onClick={() => navigate("/pricing")}
                className="bg-white/10 backdrop-blur border border-white/30 text-white hover:bg-white/20 font-semibold px-8 py-4 text-lg rounded-lg transition-all"
              >
                View Pricing
              </button>
            </div>
          </motion.div>
        </div>

        {/* Wave divider */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 63" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
            <path d="M1063.35 49.95C1253.44 48.12 1440 22.05 1440 22.05V63H0V0C0 0 181.399 51.3 409.05 51.3C682.705 51.3 841.261 52.088 1063.35 49.95Z" fill="#F8FAF5" />
          </svg>
        </div>
      </section>

      {/* Main Features Grid */}
      <section className="py-20 bg-[#F8FAF5]">
        <div className="container mx-auto px-4">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Our Communication Solutions
            </h2>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              Powerful, reliable, and easy-to-use tools designed for Tanzanian businesses of all sizes.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {mainFeatures.map((feature, i) => (
              <motion.div
                key={i}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeInUp}
                transition={{ delay: i * 0.1 }}
                className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-lg transition-shadow border border-gray-100"
              >
                <div className={`w-14 h-14 ${feature.color} rounded-xl flex items-center justify-center mb-6`}>
                  <feature.icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-gray-600 mb-6">{feature.description}</p>
                <ul className="space-y-2">
                  {feature.benefits.map((benefit, j) => (
                    <li key={j} className="flex items-center gap-2 text-sm text-gray-700">
                      <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                      {benefit}
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Wave divider */}
      <div className="bg-[#F8FAF5]">
        <svg viewBox="0 0 1440 63" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
          <path d="M1063.35 49.95C1253.44 48.12 1440 22.05 1440 22.05V63H0V0C0 0 181.399 51.3 409.05 51.3C682.705 51.3 841.261 52.088 1063.35 49.95Z" fill="#00333e" />
        </svg>
      </div>

      {/* Why Briq Section */}
      <section className="py-20 bg-[#00333e]">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeInUp}
            >
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
                Why Businesses Choose
                <span className="text-[#fddf0d]"> Briq</span>
              </h2>
              <p className="text-gray-300 text-lg mb-8">
                We're not just another messaging platform. We understand the Tanzanian market
                and have built our infrastructure to deliver results that matter.
              </p>

              <div className="space-y-6">
                {[
                  { icon: Zap, title: "Lightning Fast Delivery", desc: "Messages delivered in under 3 seconds with local infrastructure" },
                  { icon: Shield, title: "Enterprise Security", desc: "Bank-grade encryption and compliance with data protection regulations" },
                  { icon: Globe, title: "Local Support", desc: "Tanzania-based team providing support in English and Swahili" },
                ].map((item, i) => (
                  <div key={i} className="flex gap-4">
                    <div className="w-12 h-12 bg-[#fddf0d]/20 rounded-lg flex items-center justify-center flex-shrink-0">
                      <item.icon className="w-6 h-6 text-[#fddf0d]" />
                    </div>
                    <div>
                      <h3 className="text-white font-semibold text-lg">{item.title}</h3>
                      <p className="text-gray-400">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeInUp}
              className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20"
            >
              <div className="flex items-center gap-2 mb-6">
                <Code className="w-6 h-6 text-[#fddf0d]" />
                <h3 className="text-xl font-bold text-white">Quick Start</h3>
              </div>
              <pre className="bg-gray-900 text-gray-200 p-4 rounded-lg text-sm mb-6 overflow-x-auto">
                <code>{`import { BriqClient } from '@briq/sdk';

const briq = new BriqClient('your-api-key');

// Send an SMS
await briq.sms.send({
  to: '+255123456789',
  message: 'Hello from Briq!',
  senderId: 'BRIQ'
});

// Verify OTP
const verified = await briq.otp.verify({
  phone: '+255123456789',
  code: '123456'
});`}</code>
              </pre>
              <button
                onClick={() => navigate("/register")}
                className="w-full bg-[#fddf0d] hover:bg-[#e5c90c] text-[#00333e] font-bold py-3 rounded-lg transition-colors"
              >
                Get Your API Key
              </button>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Wave divider */}
      <div className="bg-[#00333e]">
        <svg viewBox="0 0 1440 63" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
          <path d="M1063.35 49.95C1253.44 48.12 1440 22.05 1440 22.05V63H0V0C0 0 181.399 51.3 409.05 51.3C682.705 51.3 841.261 52.088 1063.35 49.95Z" fill="white" />
        </svg>
      </div>

      {/* CTA Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Ready to Transform Your Communication?
            </h2>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto mb-8">
              Join hundreds of Tanzanian businesses already using Briq to reach their customers.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <button
                onClick={() => navigate("/register")}
                className="bg-[#00333e] hover:bg-[#004d5c] text-white font-bold px-8 py-4 text-lg rounded-lg transition-colors inline-flex items-center justify-center"
              >
                Start Free Trial
                <ArrowRight className="w-5 h-5 ml-2" />
              </button>
              <button
                onClick={() => navigate("/contact")}
                className="border-2 border-[#00333e] text-[#00333e] hover:bg-[#00333e] hover:text-white font-semibold px-8 py-4 text-lg rounded-lg transition-all"
              >
                Contact Sales
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

export default Features;
