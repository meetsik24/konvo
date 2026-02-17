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
    { main: "Bulk SMS", accent: "for Tanzania" },
    { main: "WhatsApp Business", accent: "made simple" },
    { main: "AI Chatbots", accent: "that convert" },
    { main: "Voice & OTP", accent: "secure & fast" }
  ];

  const mockups = [
    {
      title: "SMS Campaigns",
      campaigns: [
        { type: "BULK SMS", name: "Holiday Sale", sent: "5,247", delivered: "4,891", rate: "98.5%" },
        { type: "PROMOTIONS", name: "Flash Deal", sent: "3,124", delivered: "2,987", rate: "95.6%" },
        { type: "ALERTS", name: "Stock Alert", sent: "1,856", delivered: "1,851", rate: "99.7%" }
      ]
    },
    {
      title: "WhatsApp Automation",
      campaigns: [
        { type: "AUTO-REPLY", name: "Customer Support", sent: "4,321", delivered: "4,298", rate: "99.5%" },
        { type: "CAMPAIGNS", name: "Product Launch", sent: "2,567", delivered: "2,489", rate: "97.0%" },
        { type: "FOLLOW-UP", name: "Lead Nurture", sent: "1,234", delivered: "1,221", rate: "98.9%" }
      ]
    }
  ];

  useEffect(() => {
    const textInterval = setInterval(() => {
      setActiveText((prev) => (prev + 1) % rotatingTexts.length);
    }, 3000);

    const mockupInterval = setInterval(() => {
      setActiveMockup((prev) => (prev + 1) % mockups.length);
    }, 5000);

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
    "Vodacom", "Airtel", "Tigo", "Halotel", "CRDB", "NMB", "Azam"
  ];

  const trustReasons = [
    {
      title: "Local Expertise",
      description: "Get reliable, human support from teams based in Tanzania. We provide onboarding, training, and ongoing assistance in both English and Swahili."
    },
    {
      title: "Optimized for Tanzania",
      description: "Our systems are optimized for Tanzanian mobile networks, enabling fast message delivery and consistent performance nationwide."
    },
    {
      title: "High Reliability",
      description: "Our platform achieves up to 99.9% delivery success, ensuring your alerts, reminders, and campaigns reach customers reliably and on time."
    }
  ];

  const solutions = [
    {
      title: "Bulk SMS",
      description: "Send targeted messages to your customers across Tanzania. 14-17 TZS per SMS. Perfect for promotions, reminders, and alerts."
    },
    {
      title: "WhatsApp Business",
      description: "Connect directly with your customers through WhatsApp. Automate replies, send offers, and manage leads efficiently."
    },
    {
      title: "Voice & OTP",
      description: "Secure authentication via SMS OTP, WhatsApp OTP, and voice calls. Multi-channel fallback ensures delivery."
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
      quote: "Briq's Bulk SMS lets us reach farmers about planting dates and deliveries in minutes. Messages are clear and responses come faster.",
      author: "Elias Leasa",
      role: "Sales Manager",
      company: "Agricom Tanzania"
    },
    {
      quote: "For events, Briq's SMS keeps attendees informed about confirmations and schedule changes. Engagement is higher and check-in moves faster.",
      author: "Simon Mawole",
      role: "Technology Consultant",
      company: "Sahara Ventures"
    },
    {
      quote: "Our logistics team sends dispatch updates and ETAs instantly. Fewer missed calls, smoother handoffs, and deliveries arrive on time.",
      author: "Thomson Maguru",
      role: "Digital Manager",
      company: "Bravo Logistics"
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
              <div className="mb-6 overflow-hidden h-[200px] md:h-[240px]">
                <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-white leading-tight">
                  <span className="block transition-all duration-500" style={{
                    transform: `translateY(-${activeText * 100}%)`,
                  }}>
                    {rotatingTexts.map((text, i) => (
                      <span key={i} className="block h-[200px] md:h-[240px]">
                        {text.main}
                        <br />
                        <span className="text-[#fddf0d]">{text.accent}</span>
                      </span>
                    ))}
                  </span>
                </h1>
              </div>
              
              <p className="text-lg md:text-xl text-gray-300 mb-8 max-w-xl">
                Reach your customers instantly. Grow faster.
              </p>
              
              <div className="flex gap-4 flex-wrap mb-12">
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

              {/* Stats */}
              <div className="grid grid-cols-2 gap-4 max-w-lg">
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
                        <div className="w-10 h-10 rounded-full bg-[#fddf0d] flex items-center justify-center text-[#00333e] font-bold">
                          B
                        </div>
                        <div>
                          <div className="text-white font-semibold text-sm">{mockups[activeMockup].title}</div>
                          <div className="text-gray-400 text-xs">Live Dashboard</div>
                        </div>
                      </div>
                    </div>

                    {/* Message preview with transitions */}
                    <div className="p-4 space-y-3 h-80 overflow-hidden">
                      {mockups[activeMockup].campaigns.map((campaign, i) => (
                        <div 
                          key={`${activeMockup}-${i}`}
                          className="bg-white/5 rounded-lg p-3 border border-gray-700 hover:border-[#fddf0d] transition-all cursor-pointer hover:scale-105 animate-fadeIn"
                          style={{ animationDelay: `${i * 100}ms` }}
                        >
                          <div className="text-[#fddf0d] text-xs font-semibold mb-1">{campaign.type}</div>
                          <div className="text-white text-sm mb-2">{campaign.name}</div>
                          <div className="text-gray-400 text-xs mb-2">{campaign.sent} sent · {campaign.delivered} delivered</div>
                          <div className="bg-[#fddf0d]/20 rounded p-2">
                            <div className="text-xs text-gray-300">{campaign.rate} delivery rate</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Floating stats - animated */}
                <div className="absolute -left-8 top-1/4 bg-white/10 backdrop-blur-sm border border-gray-600 rounded-lg p-3 shadow-xl hover:scale-110 transition-transform cursor-pointer animate-float-slow">
                  <div className="text-2xl font-bold text-[#fddf0d]">10K+</div>
                  <div className="text-xs text-gray-300">Messages/day</div>
                </div>

                <div className="absolute -right-8 bottom-1/4 bg-white/10 backdrop-blur-sm border border-gray-600 rounded-lg p-3 shadow-xl hover:scale-110 transition-transform cursor-pointer animate-float-medium">
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
            Trusted by Tanzania's <span className="text-gray-400 font-medium">leading businesses</span>
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
            Why trust us
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
        <div className="container mx-auto max-w-5xl">
          <h2 className="text-3xl md:text-4xl font-bold text-white text-center mb-4">
            What we offer
          </h2>
          <p className="text-gray-300 text-center mb-12 text-lg">
            Messaging made simple
          </p>
          <div className="grid md:grid-cols-3 gap-8">
            {solutions.map((solution, i) => (
              <div key={i} className="bg-white/5 p-8 rounded-lg border border-gray-600 hover:border-[#fddf0d] hover:bg-white/10 transition-all duration-300 hover:scale-105 cursor-pointer group" style={{ animationDelay: `${i * 150}ms` }}>
                <h3 className="text-xl font-bold text-white mb-3 group-hover:text-[#fddf0d] transition-colors">{solution.title}</h3>
                <p className="text-gray-300 group-hover:text-gray-200 transition-colors">{solution.description}</p>
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
