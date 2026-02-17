import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronDown } from "lucide-react";

function Home() {
  const navigate = useNavigate();
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [activeText, setActiveText] = useState(0);
  const [activeMockup, setActiveMockup] = useState(0);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  const rotatingTexts = [
    { main: "SMS", tag: "Enterprise", accent: "for Fintechs & Banks" },
    { main: "WhatsApp", tag: "Business", accent: "for E-commerce" },
    { main: "Voice & OTP", tag: "Secure", accent: "for Tech Companies" },
    { main: "AI Chatbots", tag: "Smart", accent: "for Customer Service" }
  ];

  const mockups = [
    {
      title: "SMS Campaigns",
      campaigns: [
        { type: "BANK ALERTS", name: "Transaction OTP", sent: "12,847", delivered: "12,801", rate: "99.6%" },
        { type: "FINTECH", name: "Payment Confirm", sent: "8,124", delivered: "7,987", rate: "98.3%" },
        { type: "ENTERPRISE", name: "Staff Alerts", sent: "5,856", delivered: "5,842", rate: "99.8%" }
      ]
    },
    {
      title: "WhatsApp Business",
      campaigns: [
        { type: "E-COMMERCE", name: "Order Updates", sent: "9,321", delivered: "9,198", rate: "98.7%" },
        { type: "SUPPORT", name: "Auto Responses", sent: "15,567", delivered: "15,389", rate: "98.9%" },
        { type: "MARKETING", name: "Flash Sales", sent: "6,234", delivered: "6,121", rate: "98.2%" }
      ]
    },
    {
      title: "Voice & Chatbots",
      campaigns: [
        { type: "VOICE OTP", name: "2FA Verification", sent: "4,521", delivered: "4,498", rate: "99.5%" },
        { type: "AI CHATBOT", name: "24/7 Support", sent: "18,234", delivered: "18,001", rate: "98.7%" },
        { type: "IVR", name: "Call Routing", sent: "7,456", delivered: "7,423", rate: "99.6%" }
      ]
    }
  ];

  useEffect(() => {
    const textInterval = setInterval(() => {
      setActiveText((prev) => (prev + 1) % rotatingTexts.length);
    }, 2200);

    const mockupInterval = setInterval(() => {
      setActiveMockup((prev) => (prev + 1) % mockups.length);
    }, 4400);

    return () => {
      clearInterval(textInterval);
      clearInterval(mockupInterval);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({
        x: (e.clientX / window.innerWidth - 0.5) * 20,
        y: (e.clientY / window.innerHeight - 0.5) * 20
      });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("animate-in");
          }
        });
      },
      { threshold: 0.1 }
    );

    document.querySelectorAll(".fade-in-section").forEach((el) => {
      observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  const stats = [
    { value: "99.9%", label: "Uptime Reliability" },
    { value: "5,000+", label: "Messages / Sec" },
    { value: "98.5%", label: "Delivery Rate" },
    { value: "24ms", label: "Average Latency" },
  ];

  const logos = [
    "CRDB Bank", "NMB Bank", "Equity Bank", "Azam Pay", "M-Pesa", "Airtel Money", "Tigo Pesa"
  ];

  const trustReasons = [
    {
      title: "Enterprise Security",
      description: "Bank-grade encryption and compliance. SOC 2, ISO certified infrastructure. Your data stays secure."
    },
    {
      title: "Scale with Confidence",
      description: "Built to handle millions of messages daily. 99.9% uptime SLA. Direct carrier connections across all networks."
    },
    {
      title: "Local Expert Support",
      description: "Dedicated account managers and 24/7 technical support. Tanzania-based team that understands your business."
    }
  ];

  const solutions = [
    {
      title: "Bulk SMS",
      description: "Enterprise-grade SMS for banks, fintechs, and e-commerce. Transaction alerts, OTP, marketing campaigns. 14-17 TZS per SMS."
    },
    {
      title: "WhatsApp Business API",
      description: "Official WhatsApp Business API for customer engagement. Automate order updates, support, and marketing for your business."
    },
    {
      title: "Voice & OTP",
      description: "Secure multi-channel authentication. SMS OTP, WhatsApp OTP, Voice calls. Perfect for banks and tech platforms."
    },
    {
      title: "AI Chatbots",
      description: "Smart conversational AI for 24/7 customer support. Reduce support costs while improving response times."
    }
  ];

  const steps = [
    {
      number: "01",
      title: "Sign up & verify",
      description: "Create your account in minutes. No credit card required to get started."
    },
    {
      number: "02",
      title: "Import your contacts",
      description: "Upload contacts via CSV or sync from your CRM. Segment your audience for targeted campaigns."
    },
    {
      number: "03",
      title: "Send your campaign",
      description: "Create and send messages, schedule campaigns, or set up automated workflows."
    },
    {
      number: "04",
      title: "Track performance",
      description: "Monitor delivery reports, track engagement, and optimize your messaging strategy."
    }
  ];

  const testimonials = [
    {
      quote: "Briq powers our transaction alerts and OTP authentication. 99.8% delivery rate with sub-second latency. Critical for our banking operations.",
      author: "James Mwakasege",
      role: "CTO",
      company: "TanzaPay Digital"
    },
    {
      quote: "Integrated WhatsApp Business API in 2 days. Now handling 50K+ order confirmations monthly. Customer satisfaction up 40%.",
      author: "Sarah Kimaro",
      role: "Head of Operations",
      company: "Sokoni E-commerce"
    },
    {
      quote: "Their AI chatbot reduced our support load by 60%. Handles common queries 24/7 while our team focuses on complex issues.",
      author: "Michael Hassan",
      role: "Customer Success Lead",
      company: "FinTech Solutions TZ"
    }
  ];

  const faqs = [
    {
      q: "How quickly can I start sending messages?",
      a: "You can start sending within minutes of signing up. Sender ID approval takes 24-48 hours for branded campaigns."
    },
    {
      q: "What does it cost per SMS?",
      a: "14-17 TZS per message depending on the network. No hidden fees. Pay only for what you send."
    },
    {
      q: "Which networks do you support?",
      a: "All major Tanzanian networks: Vodacom, Airtel, Tigo, Halotel, and more. Direct carrier connections ensure high delivery rates."
    },
    {
      q: "Can I integrate with my website?",
      a: "Yes. We provide REST APIs and SDKs for PHP, Python, Node.js. Full documentation and code examples available."
    },
    {
      q: "Is there a contract?",
      a: "No contracts. Pay as you go. Top up your account and start sending. Cancel anytime."
    }
  ];

  return (
    <div className="bg-[#00333e] min-h-screen overflow-hidden">
      {/* Hero */}
      <section className="min-h-screen flex items-center px-6 pt-20 relative">
        {/* Parallax background effect */}
        <div 
          className="absolute inset-0 opacity-5"
          style={{
            transform: `translate(${mousePosition.x}px, ${mousePosition.y}px)`,
            transition: 'transform 0.3s ease-out'
          }}
        >
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-[#fddf0d] rounded-full blur-3xl"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#fddf0d] rounded-full blur-3xl"></div>
        </div>

        <div className="container mx-auto max-w-7xl relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left: Text Content */}
            <div>
              <div className="inline-block mb-4 px-4 py-2 bg-[#fddf0d]/20 border border-[#fddf0d]/40 rounded-full">
                <span className="text-[#fddf0d] text-sm font-semibold">Enterprise Communication Platform</span>
              </div>
              
              <div className="mb-6 overflow-hidden h-[280px] md:h-[320px]">
                <div className="transition-all duration-700 ease-in-out" style={{
                  transform: `translateY(-${activeText * 100}%)`,
                }}>
                  {rotatingTexts.map((text, i) => (
                    <div key={i} className="h-[280px] md:h-[320px]">
                      <div className="text-sm md:text-base text-[#fddf0d] font-semibold mb-3 tracking-wider uppercase">{text.tag}</div>
                      <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-white leading-tight mb-4">
                        {text.main}
                      </h1>
                      <p className="text-2xl md:text-3xl text-gray-300">
                        <span className="text-[#fddf0d]">{text.accent}</span>
                      </p>
                    </div>
                  ))}
                </div>
              </div>
              
              <p className="text-lg md:text-xl text-gray-300 mb-8 max-w-xl">
                Complete messaging solutions for Banks, Fintechs, E-commerce, and Growing Enterprises
              </p>
              
              <div className="flex gap-4 flex-wrap mb-10">
                <button
                  onClick={() => navigate("/register")}
                  className="bg-[#fddf0d] text-[#00333e] px-8 py-4 rounded-lg text-lg font-semibold hover:bg-[#fce96a] transition-all hover:scale-105 hover:shadow-2xl shadow-lg"
                >
                  Start free trial
                </button>
                <button
                  onClick={() => navigate("/contact")}
                  className="bg-white/10 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-white/20 transition-all hover:scale-105 border border-gray-600"
                >
                  Talk to sales
                </button>
              </div>

              {/* Service tags */}
              <div className="flex flex-wrap gap-3 mb-8">
                {["SMS", "WhatsApp", "Voice", "Chatbots"].map((service, i) => (
                  <div 
                    key={i} 
                    className="px-4 py-2 bg-white/5 border border-gray-600 rounded-lg text-sm text-gray-300 hover:border-[#fddf0d] hover:text-[#fddf0d] transition-all cursor-pointer hover:scale-105"
                    style={{ animationDelay: `${i * 100}ms` }}
                  >
                    {service}
                  </div>
                ))}
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-4 max-w-lg pt-4 border-t border-gray-700">
                {stats.map((stat, i) => (
                  <div key={i} className="group cursor-pointer">
                    <div className="text-3xl md:text-4xl font-bold text-[#fddf0d] mb-1 group-hover:scale-110 transition-transform">{stat.value}</div>
                    <div className="text-xs md:text-sm text-gray-400">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: Mockup */}
            <div className="relative hidden lg:block"
              style={{
                transform: `translate(${mousePosition.x * -0.5}px, ${mousePosition.y * -0.5}px)`,
                transition: 'transform 0.3s ease-out'
              }}
            >
              <div className="relative">
                {/* Phone mockup */}
                <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-3xl p-3 shadow-2xl max-w-sm mx-auto border border-gray-700 hover:scale-105 transition-transform duration-500">
                  <div className="bg-[#00333e] rounded-2xl overflow-hidden">
                    {/* Phone header */}
                    <div className="bg-[#003d4a] px-4 py-3 border-b border-gray-700">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-[#fddf0d] flex items-center justify-center text-[#00333e] font-bold text-lg">
                          B
                        </div>
                        <div className="flex-1">
                          <div className="text-white font-semibold text-sm transition-all duration-500">
                            {mockups[activeMockup].title}
                          </div>
                          <div className="text-gray-400 text-xs">Enterprise Dashboard</div>
                        </div>
                        <div className="flex gap-1">
                          {mockups.map((_, i) => (
                            <div 
                              key={i} 
                              className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${i === activeMockup ? 'bg-[#fddf0d] w-4' : 'bg-gray-600'}`}
                            />
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Message preview with transitions */}
                    <div className="p-4 space-y-3 h-80 overflow-hidden relative">
                      {mockups[activeMockup].campaigns.map((campaign, i) => (
                        <div 
                          key={`${activeMockup}-${i}`}
                          className="bg-white/5 rounded-lg p-3 border border-gray-700 hover:border-[#fddf0d] transition-all cursor-pointer hover:scale-105 animate-fadeIn"
                          style={{ animationDelay: `${i * 150}ms` }}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <div className="text-[#fddf0d] text-xs font-semibold">{campaign.type}</div>
                            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                          </div>
                          <div className="text-white text-sm mb-2 font-medium">{campaign.name}</div>
                          <div className="text-gray-400 text-xs mb-2">
                            <span className="text-white font-semibold">{campaign.sent}</span> sent · <span className="text-green-400 font-semibold">{campaign.delivered}</span> delivered
                          </div>
                          <div className="relative bg-[#fddf0d]/20 rounded p-2 overflow-hidden">
                            <div 
                              className="absolute left-0 top-0 bottom-0 bg-[#fddf0d]/40 transition-all duration-1000"
                              style={{ width: campaign.rate }}
                            ></div>
                            <div className="relative text-xs text-gray-100 font-semibold">{campaign.rate} delivery</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Floating stats - animated */}
                <div className="absolute -left-8 top-1/4 bg-white/10 backdrop-blur-sm border border-gray-600 rounded-lg p-3 shadow-xl hover:scale-110 transition-transform cursor-pointer animate-float-slow">
                  <div className="text-2xl font-bold text-[#fddf0d]">50K+</div>
                  <div className="text-xs text-gray-300">Daily Messages</div>
                </div>

                <div className="absolute -right-8 top-1/2 bg-white/10 backdrop-blur-sm border border-gray-600 rounded-lg p-3 shadow-xl hover:scale-110 transition-transform cursor-pointer animate-float-medium">
                  <div className="text-2xl font-bold text-[#fddf0d]">24/7</div>
                  <div className="text-xs text-gray-300">Support</div>
                </div>

                <div className="absolute -left-8 bottom-1/4 bg-white/10 backdrop-blur-sm border border-gray-600 rounded-lg p-3 shadow-xl hover:scale-110 transition-transform cursor-pointer" style={{ animation: 'floatSlow 5s ease-in-out infinite' }}>
                  <div className="text-2xl font-bold text-[#fddf0d]">99.9%</div>
                  <div className="text-xs text-gray-300">Uptime</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trusted by */}
      <section className="py-16 px-6 fade-in-section opacity-0 translate-y-8 transition-all duration-700">
        <div className="container mx-auto max-w-6xl text-center">
          <p className="text-sm text-gray-500 mb-6">
            Powering communication for Tanzania's <span className="text-gray-400 font-medium">leading financial institutions & enterprises</span>
          </p>
          <div className="flex flex-wrap justify-center gap-8 items-center">
            {logos.map((logo, i) => (
              <div key={i} className="text-gray-400 font-medium text-sm hover:text-[#fddf0d] transition-all hover:scale-110 cursor-pointer" style={{ animationDelay: `${i * 100}ms` }}>{logo}</div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Trust */}
      <section className="py-20 px-6 bg-[#003d4a] fade-in-section opacity-0 translate-y-8 transition-all duration-700">
        <div className="container mx-auto max-w-5xl">
          <h2 className="text-3xl md:text-4xl font-bold text-white text-center mb-12">
            Enterprise-ready platform
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {trustReasons.map((reason, i) => (
              <div key={i} className="text-center group cursor-pointer hover:scale-105 transition-all duration-300" style={{ animationDelay: `${i * 200}ms` }}>
                <h3 className="text-xl font-bold text-white mb-3 group-hover:text-[#fddf0d] transition-colors">{reason.title}</h3>
                <p className="text-gray-300 group-hover:text-gray-200 transition-colors">{reason.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Solutions */}
      <section className="py-20 px-6 fade-in-section opacity-0 translate-y-8 transition-all duration-700">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-3xl md:text-4xl font-bold text-white text-center mb-4">
            Complete Communication Suite
          </h2>
          <p className="text-gray-300 text-center mb-12 text-lg">
            Everything your enterprise needs
          </p>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {solutions.map((solution, i) => (
              <div key={i} className="bg-white/5 p-6 rounded-lg border border-gray-600 hover:border-[#fddf0d] hover:bg-white/10 transition-all duration-300 hover:scale-105 cursor-pointer group" style={{ animationDelay: `${i * 150}ms` }}>
                <h3 className="text-lg font-bold text-white mb-3 group-hover:text-[#fddf0d] transition-colors">{solution.title}</h3>
                <p className="text-gray-300 text-sm group-hover:text-gray-200 transition-colors">{solution.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 px-6 bg-[#003d4a] fade-in-section opacity-0 translate-y-8 transition-all duration-700">
        <div className="container mx-auto max-w-5xl">
          <h2 className="text-3xl md:text-4xl font-bold text-white text-center mb-12">
            Get started in 4 steps
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step, i) => (
              <div key={i} className="group cursor-pointer hover:scale-105 transition-all duration-300" style={{ animationDelay: `${i * 100}ms` }}>
                <div className="text-[#fddf0d] text-6xl font-bold mb-4 opacity-50 group-hover:opacity-100 transition-opacity">{step.number}</div>
                <h3 className="text-lg font-bold text-white mb-2 group-hover:text-[#fddf0d] transition-colors">{step.title}</h3>
                <p className="text-gray-300 text-sm group-hover:text-gray-200 transition-colors">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 px-6 fade-in-section opacity-0 translate-y-8 transition-all duration-700">
        <div className="container mx-auto max-w-5xl">
          <h2 className="text-3xl md:text-4xl font-bold text-white text-center mb-12">
            What our clients say
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, i) => (
              <div key={i} className="bg-white/5 p-6 rounded-lg border border-gray-600 hover:border-[#fddf0d] hover:bg-white/10 transition-all duration-300 hover:scale-105 cursor-pointer group" style={{ animationDelay: `${i * 200}ms` }}>
                <p className="text-gray-300 mb-6 italic text-sm group-hover:text-gray-200 transition-colors">"{testimonial.quote}"</p>
                <div className="text-sm">
                  <div className="font-bold text-white group-hover:text-[#fddf0d] transition-colors">{testimonial.author}</div>
                  <div className="text-gray-400">{testimonial.role}</div>
                  <div className="text-[#fddf0d]">{testimonial.company}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 px-6 bg-[#003d4a] fade-in-section opacity-0 translate-y-8 transition-all duration-700">
        <div className="container mx-auto max-w-3xl">
          <h2 className="text-3xl md:text-4xl font-bold text-white text-center mb-12">
            Common questions
          </h2>
          <div className="space-y-4">
            {faqs.map((faq, i) => (
              <div key={i} className="bg-white/5 rounded-lg border border-gray-600 overflow-hidden hover:border-[#fddf0d] transition-all" style={{ animationDelay: `${i * 100}ms` }}>
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-white/10 transition-all group"
                >
                  <span className="font-semibold text-white pr-8 group-hover:text-[#fddf0d] transition-colors">{faq.q}</span>
                  <ChevronDown className={`w-5 h-5 text-gray-400 group-hover:text-[#fddf0d] transition-all flex-shrink-0 ${openFaq === i ? 'rotate-180' : ''}`} />
                </button>
                {openFaq === i && (
                  <div className="px-6 pb-4 text-gray-300 animate-fadeIn">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6 fade-in-section opacity-0 translate-y-8 transition-all duration-700">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-4xl font-bold text-white mb-6">
            Ready to scale?
          </h2>
          <p className="text-xl text-gray-300 mb-10">
            Join hundreds of Tanzanian businesses
          </p>
          <button
            onClick={() => navigate("/register")}
            className="bg-[#fddf0d] text-[#00333e] px-10 py-4 rounded-lg text-lg font-semibold hover:bg-[#fce96a] transition-all hover:scale-110 hover:shadow-2xl shadow-lg"
          >
            Start free trial
          </button>
        </div>
      </section>
    </div>
  );
}

export default Home;
