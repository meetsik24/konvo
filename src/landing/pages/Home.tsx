import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  MessageSquare,
  Shield,
  ArrowRight,
  MessageCircle,
  CheckCircle2,
  Globe2,
  Zap,
  Users,
  ChevronDown,
  Lock,
  BarChart3,
  TrendingUp,
  Activity,
} from "lucide-react";
import { useState } from "react";

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};

function Home() {
  const navigate = useNavigate();
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const solutions = [
    {
      icon: MessageSquare,
      title: "Bulk SMS",
      description: "High-throughput messaging with 99.9% delivery SLA. Real-time analytics and intelligent routing.",
      metric: "50M+ / month",
    },
    {
      icon: MessageCircle,
      title: "WhatsApp API",
      description: "Official Meta partner. Rich messaging, automated flows, and enterprise-grade security.",
      metric: "2s avg delivery",
    },
    {
      icon: Lock,
      title: "OTP Services",
      description: "Multi-channel verification with fraud detection. Bank-grade authentication infrastructure.",
      metric: "99.5% success",
    },
    {
      icon: Users,
      title: "AI Chatbots",
      description: "Intelligent automation for customer service. NLP-powered conversations at scale.",
      metric: "24/7 uptime",
    },
  ];

  const metrics = [
    { value: "50M+", label: "Messages Monthly", icon: Activity },
    { value: "99.9%", label: "Platform Uptime", icon: TrendingUp },
    { value: "500+", label: "Enterprise Clients", icon: Users },
    { value: "<500ms", label: "API Latency", icon: Zap },
  ];

  const trustBadges = [
    "SOC 2 Type II",
    "ISO 27001",
    "TCRA Licensed",
    "PCI DSS",
  ];

  const faqs = [
    {
      q: "What security certifications do you have?",
      a: "We maintain SOC 2 Type II compliance, ISO 27001 certification, and PCI DSS standards. Our infrastructure undergoes regular third-party security audits.",
    },
    {
      q: "How do you ensure message delivery?",
      a: "We have direct carrier connections across Tanzania with intelligent failover routing. Our delivery SLA is 99.9% with real-time delivery receipts.",
    },
    {
      q: "What are your integration options?",
      a: "We offer REST APIs, webhooks, SDKs for major languages (Python, Node.js, PHP, Java), and direct integrations with popular platforms.",
    },
    {
      q: "Do you offer dedicated infrastructure?",
      a: "Yes. Enterprise clients can opt for dedicated infrastructure with custom SLAs, priority support, and guaranteed throughput capacity.",
    },
  ];

  return (
    <div className="bg-[#0a0a0f] text-white">
      {/* Hero */}
      <section className="relative min-h-screen flex items-center pt-20 overflow-hidden">
        {/* Grid background */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:64px_64px]"></div>
        
        {/* Gradient orbs */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl"></div>

        <div className="container mx-auto px-6 lg:px-8 relative z-10">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-emerald-400 text-sm mb-8">
                <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></span>
                Trusted by 500+ enterprises
              </div>
              
              <h1 className="text-5xl lg:text-6xl xl:text-7xl font-bold leading-tight mb-8">
                Enterprise
                <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">
                  Communication
                </span>
                <br />
                Infrastructure
              </h1>
              
              <p className="text-xl text-gray-400 leading-relaxed mb-10 max-w-lg">
                Mission-critical messaging APIs for banks, telecoms, and enterprises. 
                SOC 2 compliant. 99.9% uptime SLA.
              </p>

              <div className="flex flex-wrap gap-4 mb-12">
                <button
                  onClick={() => navigate("/register")}
                  className="group bg-gradient-to-r from-emerald-500 to-cyan-500 text-black font-semibold px-8 py-4 rounded-lg hover:opacity-90 transition-all flex items-center gap-2"
                >
                  Start Building
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
                <button
                  onClick={() => navigate("/contact")}
                  className="border border-gray-700 text-gray-300 hover:border-gray-500 hover:text-white font-semibold px-8 py-4 rounded-lg transition-all"
                >
                  Contact Sales
                </button>
              </div>

              {/* Trust badges */}
              <div className="flex flex-wrap gap-3">
                {trustBadges.map((badge, i) => (
                  <span key={i} className="px-3 py-1 bg-gray-800/50 border border-gray-700 rounded text-xs text-gray-400">
                    {badge}
                  </span>
                ))}
              </div>
            </motion.div>

            {/* Dashboard mockup */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="hidden lg:block"
            >
              <div className="relative">
                {/* Main dashboard */}
                <div className="bg-[#111118] border border-gray-800 rounded-2xl p-6 shadow-2xl">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded-full bg-red-500"></div>
                      <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                      <div className="w-3 h-3 rounded-full bg-green-500"></div>
                    </div>
                    <span className="text-gray-500 text-sm">Live Dashboard</span>
                  </div>
                  
                  {/* Stats grid */}
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="bg-[#0a0a0f] rounded-xl p-4 border border-gray-800">
                      <div className="text-gray-500 text-xs mb-1">Messages Today</div>
                      <div className="text-2xl font-bold text-white">847,291</div>
                      <div className="text-emerald-400 text-xs flex items-center gap-1 mt-1">
                        <TrendingUp className="w-3 h-3" />
                        +12.5%
                      </div>
                    </div>
                    <div className="bg-[#0a0a0f] rounded-xl p-4 border border-gray-800">
                      <div className="text-gray-500 text-xs mb-1">Delivery Rate</div>
                      <div className="text-2xl font-bold text-white">99.87%</div>
                      <div className="text-emerald-400 text-xs flex items-center gap-1 mt-1">
                        <Activity className="w-3 h-3" />
                        Healthy
                      </div>
                    </div>
                  </div>

                  {/* Chart mockup */}
                  <div className="bg-[#0a0a0f] rounded-xl p-4 border border-gray-800">
                    <div className="flex justify-between items-center mb-4">
                      <span className="text-sm text-gray-400">Throughput (msg/s)</span>
                      <span className="text-emerald-400 text-sm">Live</span>
                    </div>
                    <div className="flex items-end gap-1 h-20">
                      {[40, 65, 45, 80, 55, 70, 90, 75, 85, 60, 95, 70].map((h, i) => (
                        <div
                          key={i}
                          className="flex-1 bg-gradient-to-t from-emerald-500/50 to-cyan-500/50 rounded-t"
                          style={{ height: `${h}%` }}
                        ></div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Floating notification */}
                <div className="absolute -bottom-4 -left-8 bg-[#111118] border border-gray-800 rounded-xl px-4 py-3 shadow-xl">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-emerald-500/20 rounded-full flex items-center justify-center">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    </div>
                    <div>
                      <div className="text-sm font-medium">Batch Delivered</div>
                      <div className="text-xs text-gray-500">50,000 SMS • 2.3s</div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Metrics bar */}
      <section className="py-16 bg-[#111118] border-y border-gray-800">
        <div className="container mx-auto px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {metrics.map((metric, i) => (
              <motion.div
                key={i}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeIn}
                transition={{ delay: i * 0.1 }}
                className="text-center"
              >
                <metric.icon className="w-6 h-6 text-emerald-400 mx-auto mb-3" />
                <div className="text-3xl lg:text-4xl font-bold text-white mb-1">{metric.value}</div>
                <div className="text-gray-500 text-sm">{metric.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Solutions */}
      <section className="py-24 bg-[#0a0a0f]">
        <div className="container mx-auto px-6 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeIn}
            className="max-w-xl mb-16"
          >
            <p className="text-emerald-400 font-medium text-sm uppercase tracking-wider mb-4">Products</p>
            <h2 className="text-4xl lg:text-5xl font-bold mb-4">
              Built for
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400"> scale</span>
            </h2>
            <p className="text-gray-400 text-lg">
              Enterprise-grade APIs designed for high-throughput, mission-critical communications.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-6">
            {solutions.map((solution, i) => (
              <motion.div
                key={i}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeIn}
                transition={{ delay: i * 0.1 }}
                className="group bg-[#111118] border border-gray-800 rounded-2xl p-8 hover:border-emerald-500/30 transition-all"
              >
                <div className="flex items-start justify-between mb-6">
                  <div className="w-12 h-12 bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 rounded-xl flex items-center justify-center">
                    <solution.icon className="w-6 h-6 text-emerald-400" />
                  </div>
                  <span className="text-emerald-400 text-sm font-mono">{solution.metric}</span>
                </div>
                <h3 className="text-xl font-bold text-white mb-3">{solution.title}</h3>
                <p className="text-gray-400 leading-relaxed">{solution.description}</p>
              </motion.div>
            ))}
          </div>

          <div className="mt-12 text-center">
            <Link
              to="/features"
              className="inline-flex items-center text-emerald-400 font-medium hover:text-emerald-300 transition-colors"
            >
              Explore all products
              <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
          </div>
        </div>
      </section>

      {/* Code section */}
      <section className="py-24 bg-[#111118]">
        <div className="container mx-auto px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeIn}
            >
              <p className="text-emerald-400 font-medium text-sm uppercase tracking-wider mb-4">Developer First</p>
              <h2 className="text-4xl font-bold mb-6">
                Ship faster with our APIs
              </h2>
              <p className="text-gray-400 text-lg mb-8">
                Clean, well-documented APIs with SDKs for every major platform. 
                Integrate in hours, not weeks.
              </p>
              <ul className="space-y-4 mb-8">
                {[
                  "RESTful APIs with comprehensive documentation",
                  "SDKs for Python, Node.js, PHP, Java, Go",
                  "Sandbox environment with test credentials",
                  "Webhook support for real-time events",
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-gray-300">
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
              <Link
                to="/docs"
                className="inline-flex items-center bg-gray-800 hover:bg-gray-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
              >
                View Documentation
                <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </motion.div>

            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeIn}
            >
              <div className="bg-[#0a0a0f] border border-gray-800 rounded-2xl overflow-hidden">
                <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-800">
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  <span className="text-gray-500 text-sm ml-2">send_sms.py</span>
                </div>
                <pre className="p-6 text-sm overflow-x-auto font-mono">
                  <code>
                    <span className="text-purple-400">import</span> <span className="text-cyan-400">briq</span>{"\n\n"}
                    <span className="text-gray-500"># Initialize client</span>{"\n"}
                    <span className="text-white">client</span> <span className="text-pink-400">=</span> <span className="text-cyan-400">briq</span>.<span className="text-yellow-400">Client</span>({"\n"}
                    {"    "}<span className="text-white">api_key</span><span className="text-pink-400">=</span><span className="text-emerald-400">"sk_live_..."</span>{"\n"}
                    ){"\n\n"}
                    <span className="text-gray-500"># Send SMS</span>{"\n"}
                    <span className="text-white">response</span> <span className="text-pink-400">=</span> <span className="text-white">client</span>.<span className="text-yellow-400">sms</span>.<span className="text-yellow-400">send</span>({"\n"}
                    {"    "}<span className="text-white">to</span><span className="text-pink-400">=</span><span className="text-emerald-400">"+255712345678"</span>,{"\n"}
                    {"    "}<span className="text-white">message</span><span className="text-pink-400">=</span><span className="text-emerald-400">"Your OTP is 4829"</span>,{"\n"}
                    {"    "}<span className="text-white">sender_id</span><span className="text-pink-400">=</span><span className="text-emerald-400">"BRIQ"</span>{"\n"}
                    ){"\n\n"}
                    <span className="text-purple-400">print</span>(<span className="text-emerald-400">f"Sent: </span><span className="text-pink-400">{"{"}</span><span className="text-white">response</span>.<span className="text-white">message_id</span><span className="text-pink-400">{"}"}</span><span className="text-emerald-400">"</span>)
                  </code>
                </pre>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Trust section */}
      <section className="py-24 bg-[#0a0a0f]">
        <div className="container mx-auto px-6 lg:px-8">
          <div className="bg-gradient-to-br from-emerald-500/10 to-cyan-500/10 border border-emerald-500/20 rounded-3xl p-12 lg:p-16">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-4xl font-bold mb-6">
                  Trusted by financial institutions across Africa
                </h2>
                <p className="text-gray-400 text-lg mb-8">
                  Banks, fintech companies, and enterprises rely on Briq for secure, 
                  compliant messaging infrastructure.
                </p>
                <div className="grid grid-cols-2 gap-6">
                  <div className="flex items-start gap-3">
                    <Shield className="w-5 h-5 text-emerald-400 mt-1" />
                    <div>
                      <div className="font-medium text-white">Bank-grade security</div>
                      <div className="text-sm text-gray-500">End-to-end encryption</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Globe2 className="w-5 h-5 text-emerald-400 mt-1" />
                    <div>
                      <div className="font-medium text-white">Direct routes</div>
                      <div className="text-sm text-gray-500">All TZ carriers</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <BarChart3 className="w-5 h-5 text-emerald-400 mt-1" />
                    <div>
                      <div className="font-medium text-white">Real-time analytics</div>
                      <div className="text-sm text-gray-500">Full visibility</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Activity className="w-5 h-5 text-emerald-400 mt-1" />
                    <div>
                      <div className="font-medium text-white">99.9% uptime</div>
                      <div className="text-sm text-gray-500">Enterprise SLA</div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-[#111118] border border-gray-800 rounded-xl p-6">
                <p className="text-lg text-gray-300 mb-6">
                  "Briq processes our OTP delivery for millions of transactions monthly. 
                  The reliability and compliance standards are exactly what we require 
                  for financial services."
                </p>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-emerald-500/30 to-cyan-500/30 rounded-full"></div>
                  <div>
                    <div className="font-medium text-white">Daniel Msemwa</div>
                    <div className="text-sm text-gray-500">CTO, Leading Fintech</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-24 bg-[#111118]">
        <div className="container mx-auto px-6 lg:px-8 max-w-3xl">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeIn}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold mb-4">Frequently asked questions</h2>
            <p className="text-gray-400">Everything you need to know about our platform.</p>
          </motion.div>

          <div className="space-y-4">
            {faqs.map((faq, i) => (
              <motion.div
                key={i}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeIn}
                className="border border-gray-800 rounded-xl overflow-hidden"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between p-6 text-left"
                >
                  <span className="font-medium text-white">{faq.q}</span>
                  <ChevronDown
                    className={`w-5 h-5 text-gray-500 transition-transform ${
                      openFaq === i ? "rotate-180" : ""
                    }`}
                  />
                </button>
                {openFaq === i && (
                  <div className="px-6 pb-6 text-gray-400">
                    {faq.a}
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 bg-[#0a0a0f]">
        <div className="container mx-auto px-6 lg:px-8 text-center">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeIn}
          >
            <h2 className="text-4xl lg:text-5xl font-bold mb-6">
              Ready to build?
            </h2>
            <p className="text-gray-400 text-lg mb-10 max-w-xl mx-auto">
              Create a free account and start integrating our APIs in minutes. 
              No credit card required.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <button
                onClick={() => navigate("/register")}
                className="group bg-gradient-to-r from-emerald-500 to-cyan-500 text-black font-semibold px-8 py-4 rounded-lg hover:opacity-90 transition-all flex items-center gap-2"
              >
                Start Free Trial
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
              <button
                onClick={() => navigate("/pricing")}
                className="border border-gray-700 text-gray-300 hover:border-gray-500 hover:text-white font-semibold px-8 py-4 rounded-lg transition-all"
              >
                View Pricing
              </button>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}

export default Home;
