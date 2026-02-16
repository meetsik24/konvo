import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "../components/ui/button";
import {
  MessageSquare,
  Shield,
  ArrowRight,
  MessageCircle,
  CheckCircle,
  Globe,
  Zap,
  Users,
  Headphones,
  TrendingUp,
  ChevronDown,
  Code,
} from "lucide-react";
import { useState } from "react";

// Client logos - using placeholder paths, replace with actual logos
const clientLogos = [
  { name: "Vodacom", src: "/assets/clients/vodacom.png" },
  { name: "CRDB Bank", src: "/assets/clients/crdb.png" },
  { name: "NBC Bank", src: "/assets/clients/nbc.png" },
  { name: "Azam", src: "/assets/clients/azam.png" },
  { name: "Tigo", src: "/assets/clients/tigo.png" },
  { name: "NMB Bank", src: "/assets/clients/nmb.png" },
];

// Animation variants
const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.15 } },
};

function Home() {
  const navigate = useNavigate();
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const stats = [
    { icon: "✓", value: "99.9%", label: "Uptime Reliability" },
    { icon: "⚡", value: "5,000+", label: "Messages / Sec" },
    { icon: "📊", value: "98.5%", label: "Delivery Rate" },
    { icon: "🕐", value: "24ms", label: "Average Latency" },
  ];

  const trustFeatures = [
    {
      icon: Globe,
      title: "Local Expertise",
      description:
        "Get reliable, human support from teams based in Tanzania. We provide onboarding, training, and ongoing assistance in both English and Swahili.",
      image: "/assets/features/local-support.png",
    },
    {
      icon: Zap,
      title: "Optimized Infrastructure",
      description:
        "Our systems are optimised for Tanzanian mobile networks, enabling fast message delivery and consistent performance nationwide.",
      image: "/assets/features/infrastructure.png",
    },
    {
      icon: Shield,
      title: "High Reliability",
      description:
        "Our platform achieves up to 99.9% delivery success, ensuring your alerts, reminders, and campaigns reach customers reliably and on time.",
      image: "/assets/features/reliability.png",
    },
  ];

  const solutions = [
    {
      icon: MessageSquare,
      title: "Bulk SMS",
      tagline: "REACH CUSTOMERS INSTANTLY WITH BULK SMS",
      description:
        "Send targeted messages to your customers across Tanzania, increase engagement, and drive sales effortlessly. Perfect for promotions, reminders, and alerts.",
      link: "/features",
      color: "bg-blue-500",
    },
    {
      icon: MessageCircle,
      title: "WhatsApp Business",
      tagline: "CONNECT WITH CUSTOMERS ON WHATSAPP",
      description:
        "Connect directly with your customers through WhatsApp. Automate replies, bulk WhatsApp, send offers, and manage leads on time.",
      link: "/features",
      color: "bg-green-500",
    },
    {
      icon: Users,
      title: "AI Chatbots",
      tagline: "ENGAGE CUSTOMERS 24/7 WITH AI CHATBOTS",
      description:
        "Manage customer interactions with intelligent chatbots that answer queries, collect leads, and enhance support automatically—helping you save time and grow.",
      link: "/features",
      color: "bg-purple-500",
    },
  ];

  const howItWorks = [
    {
      step: "01",
      title: "Tell Us Your Goals",
      description:
        "Whether it's customer engagement, lead follow-up, or marketing automation — we start with your business needs.",
    },
    {
      step: "02",
      title: "Set Up Your Solution",
      description:
        "We customize your Bulk SMS, WhatsApp, or OTP Verification tools for your workflows and audience.",
    },
    {
      step: "03",
      title: "Automate & Scale",
      description:
        "Send messages, reply instantly, and manage clients effortlessly — all from one unified dashboard.",
    },
    {
      step: "04",
      title: "Grow with Ongoing Support",
      description:
        "Our support team ensures your system runs smoothly and keeps evolving with your business.",
    },
  ];

  const testimonials = [
    {
      quote:
        "Briq's Bulk SMS lets us reach our customers about appointments, updates, and promotions in minutes. Messages are clear, responses come faster, and our team saves hours every week.",
      name: "Sarah Mwangi",
      role: "Operations Manager",
      company: "TechCorp Tanzania",
      logo: "/assets/testimonials/techcorp.png",
      avatar: "/assets/testimonials/sarah.jpg",
    },
    {
      quote:
        "With Briq's SMS API, our logistics team sends dispatch updates, ETAs, and route changes to drivers and clients instantly. Fewer missed calls, smoother handoffs, and deliveries arrive on time.",
      name: "James Kimaro",
      role: "Head of Logistics",
      company: "SwiftDelivery",
      logo: "/assets/testimonials/swift.png",
      avatar: "/assets/testimonials/james.jpg",
    },
    {
      quote:
        "Briq's OTP verification gives our customers peace of mind. Fast delivery, Swahili voice support, and reliable multi-channel options make account security simple.",
      name: "Grace Mushi",
      role: "CTO",
      company: "FinSecure",
      logo: "/assets/testimonials/finsecure.png",
      avatar: "/assets/testimonials/grace.jpg",
    },
  ];

  const faqs = [
    {
      q: "What is Bulk SMS, and how can it benefit my business in Tanzania?",
      a: "Bulk SMS allows you to send thousands of text messages to your customers instantly. It's perfect for promotions, appointment reminders, alerts, and transactional messages. With delivery rates above 98%, it's one of the most reliable ways to reach your Tanzanian audience.",
    },
    {
      q: "How does OTP verification work?",
      a: "OTP (One-Time Password) verification sends a unique code to your customer via SMS, WhatsApp, or Voice call. The customer enters this code to verify their identity. We support Swahili voice OTP for better accessibility.",
    },
    {
      q: "Do you support WhatsApp Business API?",
      a: "Yes, we are an official WhatsApp Business Solution Provider. You can send template messages, automate responses, and engage customers through the world's most popular messaging app.",
    },
    {
      q: "How quickly can I start using Briq?",
      a: "You can create an account and start sending messages within minutes. Our API documentation is comprehensive, and our support team is available to help with integration.",
    },
    {
      q: "What payment methods do you accept?",
      a: "We accept M-Pesa, Tigo Pesa, Airtel Money, bank transfers, and major credit cards. No minimum purchase required — start with as little as 1,000 TZS.",
    },
    {
      q: "Do you provide support and training?",
      a: "Yes, our Tanzania-based team provides onboarding, training, and ongoing support in both English and Swahili. We're here to help your business succeed.",
    },
  ];

  return (
    <div className="bg-white font-sans">
      {/* Hero Section */}
      <section className="relative pt-28 pb-8 bg-gradient-to-br from-[#00333e] via-[#004d5c] to-[#00333e] overflow-hidden">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-10 w-72 h-72 bg-[#fddf0d] rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-[#fddf0d] rounded-full blur-3xl"></div>
        </div>

        <div className="container mx-auto px-4 relative">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="text-left"
            >
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
                Bulk SMS, WhatsApp & AI Chatbots
                <span className="block text-[#fddf0d]">Solutions for Tanzania</span>
              </h1>
              <p className="text-gray-300 text-lg md:text-xl mb-10 max-w-xl">
                Grow sales, save time, and engage customers effortlessly. Perfect for SMEs,
                mid-size companies, and corporations ready to scale.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 mb-12">
                <Button
                  onClick={() => navigate("/register")}
                  className="bg-[#fddf0d] hover:bg-[#e5c90c] text-[#00333e] font-bold px-8 py-4 text-lg rounded-lg shadow-lg hover:shadow-xl transition-all"
                >
                  Start Free Trial Today
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
                <Button
                  onClick={() => navigate("/contact")}
                  className="bg-white/10 backdrop-blur border border-white/30 text-white hover:bg-white/20 font-semibold px-8 py-4 text-lg rounded-lg transition-all"
                >
                  Talk To An Expert
                </Button>
              </div>

              {/* Stats Row */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {stats.map((stat, i) => (
                  <div key={i} className="text-left">
                    <div className="text-2xl md:text-3xl font-bold text-white">{stat.value}</div>
                    <div className="text-gray-400 text-sm">{stat.label}</div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Right - Dashboard Preview */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="hidden lg:block"
            >
              <div className="relative">
                <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 shadow-2xl">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-3 h-3 rounded-full bg-red-400"></div>
                    <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                    <div className="w-3 h-3 rounded-full bg-green-400"></div>
                    <span className="text-gray-400 text-sm ml-2">Briq Dashboard</span>
                  </div>
                  <div className="space-y-3">
                    <div className="bg-white/10 rounded-lg p-4">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-white font-medium">Messages Sent Today</span>
                        <span className="text-[#fddf0d] font-bold">12,847</span>
                      </div>
                      <div className="w-full bg-white/20 rounded-full h-2">
                        <div className="bg-[#fddf0d] h-2 rounded-full" style={{width: '78%'}}></div>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-white/10 rounded-lg p-3">
                        <div className="text-gray-400 text-xs">Delivery Rate</div>
                        <div className="text-white font-bold text-lg">99.2%</div>
                      </div>
                      <div className="bg-white/10 rounded-lg p-3">
                        <div className="text-gray-400 text-xs">Active Campaigns</div>
                        <div className="text-white font-bold text-lg">24</div>
                      </div>
                    </div>
                  </div>
                </div>
                {/* Floating notification */}
                <div className="absolute -bottom-4 -left-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg text-sm font-medium animate-pulse">
                  ✓ 500 SMS delivered
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Wave divider */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg
            viewBox="0 0 1440 63"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-full"
          >
            <path
              d="M1063.35 49.95C1253.44 48.12 1440 22.05 1440 22.05V63H0V0C0 0 181.399 51.3 409.05 51.3C682.705 51.3 841.261 52.088 1063.35 49.95Z"
              fill="#F8FAF5"
            />
          </svg>
        </div>
      </section>

      {/* Client Logos */}
      <section className="bg-[#F8FAF5] py-12">
        <div className="container mx-auto px-4">
          <p className="text-center text-gray-500 text-sm mb-8">
            The communication engine behind Tanzania's fastest-growing local businesses
          </p>
          <div className="flex flex-wrap justify-center items-center gap-8 md:gap-12 opacity-60">
            {clientLogos.map((client, i) => (
              <div key={i} className="h-10 flex items-center">
                <div className="bg-gray-300 rounded px-4 py-2 text-gray-600 text-sm font-medium">
                  {client.name}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Businesses Trust Us */}
      <section className="py-20 bg-[#F8FAF5]">
        <div className="container mx-auto px-4">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeInUp}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Why Businesses <span className="text-[#00333e]">Trust Us</span>
            </h2>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              We combine world-class technology with local expertise to deliver exceptional
              communication solutions.
            </p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
            className="grid md:grid-cols-3 gap-8"
          >
            {trustFeatures.map((feature, index) => (
              <motion.div
                key={index}
                variants={fadeInUp}
                className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-lg transition-shadow"
              >
                <div className="w-14 h-14 rounded-xl bg-[#00333e] flex items-center justify-center mb-6">
                  <feature.icon className="w-7 h-7 text-[#fddf0d]" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                {/* Placeholder for actual image */}
                <div className="mt-6 bg-gradient-to-br from-[#00333e]/5 to-[#00333e]/10 rounded-xl h-40 flex items-center justify-center">
                  <span className="text-gray-400 text-sm">Feature illustration</span>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Our Solutions */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeInUp}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Our <span className="text-[#00333e]">Solutions</span>
            </h2>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              Reach more customers, save time, and grow with Bulk SMS, WhatsApp,
              Workflows & AI Chatbots.
            </p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
            className="grid md:grid-cols-3 gap-8"
          >
            {solutions.map((solution, index) => (
              <motion.div
                key={index}
                variants={fadeInUp}
                className="group bg-white border-2 border-gray-100 rounded-2xl p-8 hover:border-[#00333e] hover:shadow-xl transition-all duration-300"
              >
                <div
                  className={`w-16 h-16 rounded-2xl ${solution.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}
                >
                  <solution.icon className="w-8 h-8 text-white" />
                </div>
                <p className="text-xs font-bold text-[#00333e] tracking-wider mb-2">
                  {solution.tagline}
                </p>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">{solution.title}</h3>
                <p className="text-gray-600 mb-6 leading-relaxed">{solution.description}</p>
                <Link
                  to={solution.link}
                  className="inline-flex items-center text-[#00333e] font-semibold hover:gap-3 transition-all"
                >
                  Learn More
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Product Mockup / Dashboard Preview */}
      <section className="py-20 bg-[#F8FAF5]">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                A Powerful Engine For Modern Communications
              </h2>
              <p className="text-gray-600 text-lg mb-8">
                Manage customer interactions with a workspace designed for speed and clarity.
                Send bulk messages, track delivery, and analyze engagement all in one place.
              </p>
              <ul className="space-y-4 mb-8">
                {[
                  "Real-time delivery tracking & analytics",
                  "Contact management & segmentation",
                  "Scheduled & automated messaging",
                  "Team collaboration features",
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-gray-700">
                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
              <Button
                onClick={() => navigate("/register")}
                className="bg-[#00333e] hover:bg-[#004d5c] text-white font-semibold px-8 py-4 rounded-lg"
              >
                Try It Free
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="relative"
            >
              {/* Dashboard mockup placeholder */}
              <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden">
                <div className="bg-[#00333e] px-4 py-3 flex items-center gap-2">
                  <div className="flex gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-400"></div>
                    <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                    <div className="w-3 h-3 rounded-full bg-green-400"></div>
                  </div>
                  <div className="flex-1 text-center text-white/60 text-sm">
                    dashboard.briq.tz
                  </div>
                </div>
                <div className="p-6 bg-gray-50 min-h-[300px] flex items-center justify-center">
                  <span className="text-gray-400">Dashboard Preview</span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              What Our Customers Say
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-[#F8FAF5] rounded-2xl p-8"
              >
                <div className="mb-6">
                  <div className="w-16 h-8 bg-gray-200 rounded flex items-center justify-center text-xs text-gray-500">
                    Logo
                  </div>
                </div>
                <p className="text-gray-700 mb-6 leading-relaxed italic">
                  "{testimonial.quote}"
                </p>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-[#00333e] rounded-full flex items-center justify-center text-white font-bold">
                    {testimonial.name.charAt(0)}
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">{testimonial.name}</div>
                    <div className="text-sm text-gray-500">
                      {testimonial.role} | {testimonial.company}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How Briq Helps You Grow */}
      <section className="py-20 bg-[#F8FAF5]">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <motion.div
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeInUp}
              >
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                  How Briq Helps You Grow
                </h2>
                <p className="text-gray-600 text-lg mb-12">
                  Getting started is easy — we help you connect with your customers faster
                  and smarter.
                </p>
              </motion.div>

              <div className="space-y-8">
                {howItWorks.map((item, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                    className="flex gap-6"
                  >
                    <div className="flex-shrink-0 w-14 h-14 bg-[#00333e] rounded-xl flex items-center justify-center text-[#fddf0d] font-bold text-lg">
                      {item.step}
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 text-lg mb-2">{item.title}</h3>
                      <p className="text-gray-600">{item.description}</p>
                    </div>
                  </motion.div>
                ))}
              </div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="mt-12"
              >
                <p className="text-gray-700 font-medium mb-4">
                  Ready to automate your customer communication?
                </p>
                <Button
                  onClick={() => navigate("/contact")}
                  className="bg-[#fddf0d] hover:bg-[#e5c90c] text-[#00333e] font-bold px-8 py-4 rounded-lg"
                >
                  Book A Free Demo
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </motion.div>
            </div>

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="relative"
            >
              {/* Support team image placeholder */}
              <div className="bg-gradient-to-br from-[#00333e] to-[#004d5c] rounded-2xl aspect-square flex items-center justify-center">
                <Headphones className="w-32 h-32 text-[#fddf0d]/30" />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Developer Section */}
      <section className="py-20 bg-[#00333e]">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <div className="flex items-center gap-2 mb-4">
                <Code className="w-5 h-5 text-[#fddf0d]" />
                <span className="text-[#fddf0d] font-semibold text-sm tracking-wider">
                  FOR DEVELOPERS
                </span>
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
                Build with our APIs
              </h2>
              <p className="text-gray-300 text-lg mb-8">
                Well-documented REST APIs with SDKs for popular languages.
                Get started in minutes with our sandbox environment.
              </p>

              <div className="flex flex-wrap gap-3 mb-8">
                {["Python", "Node.js", "PHP", "Java", "cURL"].map((lang) => (
                  <span
                    key={lang}
                    className="px-4 py-2 bg-white/10 rounded-full text-white text-sm"
                  >
                    {lang}
                  </span>
                ))}
              </div>

              <div className="flex flex-wrap gap-4">
                <a
                  href="https://docs.briq.tz"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button className="bg-white text-[#00333e] hover:bg-gray-100 font-semibold px-6 py-3 rounded-lg">
                    View Documentation
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </a>
                <Button
                  onClick={() => navigate("/register")}
                  className="bg-transparent border border-white/30 text-white hover:bg-white/10 px-6 py-3 rounded-lg"
                >
                  Get API Key
                </Button>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <div className="bg-[#001a20] rounded-xl p-6 font-mono text-sm border border-white/10">
                <div className="flex items-center gap-2 mb-4">
                  <span className="w-3 h-3 rounded-full bg-red-500"></span>
                  <span className="w-3 h-3 rounded-full bg-yellow-500"></span>
                  <span className="w-3 h-3 rounded-full bg-green-500"></span>
                  <span className="ml-4 text-gray-500 text-xs">send_sms.py</span>
                </div>
                <pre className="text-gray-300 overflow-x-auto text-xs leading-relaxed">
{`import requests

response = requests.post(
    "https://api.briq.tz/v1/sms",
    headers={
        "Authorization": "Bearer YOUR_API_KEY",
        "Content-Type": "application/json"
    },
    json={
        "to": "+255712345678",
        "message": "Your OTP is 123456",
        "sender_id": "BRIQ"
    }
)

print(response.json())
# {"status": "sent", "message_id": "abc123"}`}
                </pre>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="bg-gradient-to-br from-[#00333e] to-[#004d5c] rounded-3xl p-12 md:p-16 relative overflow-hidden">
            {/* Background decoration */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#fddf0d]/10 rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-[#fddf0d]/10 rounded-full blur-3xl"></div>

            <div className="relative grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                  Work Smarter, Serve Better, Grow Faster
                </h2>
                <p className="text-gray-300 text-lg mb-8">
                  You don't need a big team to look professional — you just need the right tools.
                  Get Bulk SMS, WhatsApp, OTP verification, and automation solutions that simplify
                  operations and help your business grow.
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Button
                    onClick={() => navigate("/register")}
                    className="bg-[#fddf0d] hover:bg-[#e5c90c] text-[#00333e] font-bold px-8 py-4 text-lg rounded-lg"
                  >
                    Get Started Free
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                  <Button
                    onClick={() => navigate("/contact")}
                    className="bg-white/10 border border-white/30 text-white hover:bg-white/20 font-semibold px-8 py-4 text-lg rounded-lg"
                  >
                    Talk To An Expert
                  </Button>
                </div>
              </div>

              <div className="flex justify-center">
                {/* Decorative element */}
                <div className="w-64 h-64 rounded-full bg-gradient-to-br from-[#fddf0d]/20 to-[#fddf0d]/5 flex items-center justify-center">
                  <div className="w-48 h-48 rounded-full bg-gradient-to-br from-[#fddf0d]/30 to-[#fddf0d]/10 flex items-center justify-center">
                    <TrendingUp className="w-16 h-16 text-[#fddf0d]" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
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
              Frequently Asked <span className="text-[#00333e]">Questions</span>
            </h2>
            <p className="text-gray-600 text-lg">
              Everything you need to know about messaging, automation, and getting started.
            </p>
          </motion.div>

          <div className="max-w-3xl mx-auto">
            {faqs.map((faq, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05 }}
                className="mb-4"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === index ? null : index)}
                  className="w-full bg-white rounded-xl px-6 py-5 flex items-center justify-between text-left hover:shadow-md transition-shadow"
                >
                  <span className="font-semibold text-gray-900 pr-4">{faq.q}</span>
                  <ChevronDown
                    className={`w-5 h-5 text-gray-500 flex-shrink-0 transition-transform ${
                      openFaq === index ? "rotate-180" : ""
                    }`}
                  />
                </button>
                {openFaq === index && (
                  <div className="bg-white rounded-b-xl px-6 pb-5 -mt-2 pt-2 border-t border-gray-100">
                    <p className="text-gray-600 leading-relaxed">{faq.a}</p>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

export default Home;
