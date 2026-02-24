import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronDown } from "lucide-react";
import { useRotatingText, useParallax } from "../hooks";
import {
  rotatingTexts,
  stats,
  logos
} from "../constants";

function Home() {
  const navigate = useNavigate();
  const { activeIndex: activeText } = useRotatingText(Array.from({ length: 4 }, (_, i) => i));
  const { activeIndex: activeMockup } = useRotatingText(Array.from({ length: 3 }, (_, i) => i));
  const parallax = useParallax();

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

  return (
    <div className="bg-white min-h-screen overflow-hidden">
      {/* Hero */}
      <section className="min-h-screen flex items-center px-6 pt-20 relative">
        {/* Dark background with grid pattern */}
        <div className="absolute inset-0 z-0">
          {/* Dark gradient background */}
          <div className="absolute inset-0 bg-gradient-to-br from-[#00333e] via-[#001f26] to-[#00333e] opacity-100" />
          
          {/* Grid background pattern */}
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:64px_64px]"></div>
          
          {/* Subtle top-bottom fade overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-[#00333e] via-transparent to-[#00333e] opacity-60"></div>
          
          {/* Subtle accent glow - much more muted */}
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#00333e]/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#00333e]/10 rounded-full blur-3xl"></div>
        </div>

        <div className="container mx-auto max-w-7xl relative z-10">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left: Text Content */}
            <div className="space-y-6">
              <div className="inline-block px-4 py-2 bg-[#fddf0d]/15 border border-[#fddf0d]/30 rounded-full backdrop-blur-sm">
                <span className="text-[#fddf0d] text-sm font-semibold tracking-wide">ENTERPRISE COMMUNICATION PLATFORM</span>
              </div>
              
              <div className="relative overflow-hidden" style={{ height: '220px' }}>
                {rotatingTexts.map((text, i) => (
                  <div
                    key={i}
                    className={`absolute inset-0 transition-all duration-700 ease-in-out ${
                      i === activeText 
                        ? 'opacity-100 translate-y-0' 
                        : i === (activeText - 1 + rotatingTexts.length) % rotatingTexts.length
                        ? 'opacity-0 -translate-y-8'
                        : 'opacity-0 translate-y-8'
                    }`}
                  >
                    <div className="text-xs md:text-sm text-[#fddf0d] font-bold mb-3 tracking-widest">{text.tag}</div>
                    <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-100 leading-tight mb-2">
                      {text.main}
                    </h1>
                    <p className="text-lg md:text-xl text-gray-400 font-medium">
                      {text.accent}
                    </p>
                  </div>
                ))}
              </div>
              
              <p className="text-base md:text-lg text-gray-500 max-w-xl leading-relaxed">
                Production-ready APIs for Banks, Fintechs & High-growth Startups across Tanzania
              </p>
              
              <div className="flex gap-4 flex-wrap pt-2">
                <button
                  onClick={() => navigate("/register")}
                  className="bg-[#fddf0d] text-[#00333e] px-8 py-4 rounded-lg text-lg font-semibold hover:bg-[#fce96a] transition-all hover:scale-105 hover:shadow-2xl shadow-lg"
                >
                  Get API Keys
                </button>
                <button
                  onClick={() => navigate("/contact")}
                  className="bg-white/10 text-gray-300 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-white/20 transition-all hover:scale-105 border border-gray-600 backdrop-blur-sm"
                >
                  Book Demo
                </button>
              </div>

              {/* Integrated service tags and stats */}
              <div className="pt-8 border-t border-gray-700/30">
                <div className="flex flex-wrap gap-3 mb-5">
                  {["SMS API", "WhatsApp API", "Voice OTP", "AI Chatbots"].map((service, i) => (
                    <div 
                      key={i} 
                      className="px-3 py-1.5 bg-white/5 border border-gray-600/50 rounded-md text-xs text-gray-400 hover:border-[#fddf0d] hover:text-[#fddf0d] transition-all cursor-pointer hover:scale-105 backdrop-blur-sm"
                      style={{ animationDelay: `${i * 100}ms` }}
                    >
                      {service}
                    </div>
                  ))}
                </div>

                {/* Inline stats */}
                <div className="grid grid-cols-2 gap-x-8 gap-y-3">
                  {stats.map((stat, i) => (
                    <div key={i} className="flex items-baseline gap-2 group cursor-pointer">
                      <div className="text-2xl font-bold text-[#fddf0d] group-hover:scale-110 transition-transform">{stat.value}</div>
                      <div className="text-xs text-gray-600">{stat.label}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right: Mockup */}
            <div className="relative hidden lg:block"
              style={{
                transform: `translate(${parallax.x * -0.5}px, ${parallax.y * -0.5}px)`,
                transition: 'transform 0.3s ease-out'
              }}
            >
              {/* Subtle glow effect behind mockup */}
              <div className="absolute inset-0 bg-[#fddf0d]/5 blur-3xl rounded-full scale-110"></div>
              
              <div className="relative">
                {/* SMS Mobile Interface */}
                {activeMockup === 0 && (
                  <div className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 rounded-3xl p-3 shadow-2xl max-w-sm mx-auto border border-gray-700/50 hover:scale-105 transition-transform duration-500 backdrop-blur-sm animate-in fade-in duration-500">
                    <div className="bg-black rounded-2xl overflow-hidden shadow-inner">
                      {/* Phone Status Bar */}
                      <div className="bg-black px-4 py-2 flex justify-between items-center text-white text-xs">
                        <span>9:41</span>
                        <div className="flex gap-1">
                          <div className="w-4 h-2 border border-white rounded-sm"></div>
                          <div className="w-4 h-3 border border-white rounded-sm flex items-center p-0.5"><div className="h-full flex-1 bg-white"></div></div>
                        </div>
                      </div>
                      
                      {/* Chat List Header */}
                      <div className="bg-black px-4 py-3 border-b border-gray-800">
                        <h2 className="text-white font-semibold text-sm">Messages</h2>
                      </div>
                      
                      {/* SMS Messages */}
                      <div className="bg-black h-96 overflow-y-auto">
                        <div className="p-4 space-y-4">
                          {/* Incoming SMS */}
                          <div className="flex gap-2">
                            <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">B</div>
                            <div className="flex-1">
                              <div className="text-white text-sm font-medium">Briq Bank</div>
                              <div className="bg-blue-600/20 text-blue-200 rounded-2xl px-4 py-2 mt-1 text-sm inline-block">Your transaction of 50,000 TZS has been confirmed</div>
                              <div className="text-gray-600 text-xs mt-1">9:35 AM</div>
                            </div>
                          </div>
                          
                          {/* Incoming SMS */}
                          <div className="flex gap-2">
                            <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">C</div>
                            <div className="flex-1">
                              <div className="text-white text-sm font-medium">Sokoni Store</div>
                              <div className="bg-blue-600/20 text-blue-200 rounded-2xl px-4 py-2 mt-1 text-sm inline-block">Your order is ready for pickup! Order #12834</div>
                              <div className="text-gray-600 text-xs mt-1">9:28 AM</div>
                            </div>
                          </div>
                          
                          {/* Incoming SMS */}
                          <div className="flex gap-2">
                            <div className="w-8 h-8 rounded-full bg-purple-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">O</div>
                            <div className="flex-1">
                              <div className="text-white text-sm font-medium">OneFinance</div>
                              <div className="bg-blue-600/20 text-blue-200 rounded-2xl px-4 py-2 mt-1 text-sm inline-block">Your OTP code is: 432156. Valid for 5 mins</div>
                              <div className="text-gray-600 text-xs mt-1">9:15 AM</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* WhatsApp Interface */}
                {activeMockup === 1 && (
                  <div className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 rounded-3xl p-3 shadow-2xl max-w-sm mx-auto border border-gray-700/50 hover:scale-105 transition-transform duration-500 backdrop-blur-sm animate-in fade-in duration-500">
                    <div className="bg-gradient-to-b from-[#0a1d1f] to-[#000000] rounded-2xl overflow-hidden shadow-inner">
                      {/* WhatsApp Header */}
                      <div className="bg-[#128c7e] px-4 py-3 flex justify-between items-center">
                        <h2 className="text-white font-semibold text-sm">Sokoni E-commerce</h2>
                        <div className="flex gap-2">
                          <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center text-white text-xs">🔍</div>
                          <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center text-white text-xs">⋮</div>
                        </div>
                      </div>
                      
                      {/* Chat Messages */}
                      <div className="bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px)] h-96 overflow-y-auto p-4 space-y-3">
                        {/* Incoming */}
                        <div className="flex gap-2 justify-start">
                          <div className="bg-[#1f4a48] rounded-3xl rounded-bl-none px-4 py-2 max-w-xs">
                            <div className="text-[#e1ffbd] text-sm">Hi! Your order 🎉</div>
                            <div className="text-gray-400 text-xs mt-1">9:42</div>
                          </div>
                        </div>
                        
                        {/* Outgoing */}
                        <div className="flex gap-2 justify-end">
                          <div className="bg-[#056162] rounded-3xl rounded-br-none px-4 py-2 max-w-xs">
                            <div className="text-white text-sm">Your order has shipped! 📦 Track it here: briq.tz/track/124839</div>
                            <div className="text-gray-300 text-xs mt-1">10:05</div>
                          </div>
                        </div>
                        
                        {/* Incoming */}
                        <div className="flex gap-2 justify-start">
                          <div className="bg-[#1f4a48] rounded-3xl rounded-bl-none px-4 py-2 max-w-xs">
                            <div className="text-[#e1ffbd] text-sm">Perfect! Thank you</div>
                            <div className="text-gray-400 text-xs mt-1">10:07</div>
                          </div>
                        </div>
                        
                        {/* Outgoing */}
                        <div className="flex gap-2 justify-end">
                          <div className="bg-[#056162] rounded-3xl rounded-br-none px-4 py-2 max-w-xs">
                            <div className="text-white text-sm">You've earned 500 points! Redeem at checkout 🎁</div>
                            <div className="text-gray-300 text-xs mt-1">10:08</div>
                          </div>
                        </div>
                      </div>
                      
                      {/* Input Bar */}
                      <div className="bg-[#0a0a0a] px-4 py-3 border-t border-gray-800 flex gap-2">
                        <input 
                          type="text" 
                          placeholder="Type a message..." 
                          className="flex-1 bg-[#1f4a48] text-white rounded-full px-4 py-2 text-sm outline-none placeholder-gray-500"
                        />
                        <div className="text-[#056162] font-bold text-xl">➤</div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Dashboard Analytics */}
                {activeMockup === 2 && (
                  <div className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 rounded-3xl p-3 shadow-2xl max-w-lg mx-auto border border-gray-700/50 hover:scale-105 transition-transform duration-500 backdrop-blur-sm animate-in fade-in duration-500">
                    <div className="bg-gradient-to-b from-[#00333e] to-[#002831] rounded-2xl overflow-hidden shadow-inner">
                      {/* Header */}
                      <div className="bg-gradient-to-r from-[#003d4a] to-[#00333e] px-6 py-4 border-b border-gray-700/50">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="text-white font-semibold">Campaign Analytics</h3>
                            <p className="text-gray-400 text-xs mt-1">Last 30 days</p>
                          </div>
                          <div className="text-[#fddf0d] font-bold text-2xl">↗ 24%</div>
                        </div>
                      </div>
                      
                      {/* Dashboard Content */}
                      <div className="p-6 space-y-6">
                        {/* Key Metrics */}
                        <div className="grid grid-cols-2 gap-4">
                          <div className="bg-white/5 rounded-lg p-4 border border-gray-700/50">
                            <div className="text-gray-400 text-xs mb-2">Total Sent</div>
                            <div className="text-2xl font-bold text-white">267.5K</div>
                            <div className="text-[#fddf0d] text-xs mt-2">↑ 12% from last period</div>
                          </div>
                          <div className="bg-white/5 rounded-lg p-4 border border-gray-700/50">
                            <div className="text-gray-400 text-xs mb-2">Delivered</div>
                            <div className="text-2xl font-bold text-white">265.2K</div>
                            <div className="text-green-400 text-xs mt-2">99.1% rate</div>
                          </div>
                        </div>
                        
                        {/* Chart */}
                        <div className="bg-white/5 rounded-lg p-4 border border-gray-700/50">
                          <div className="text-gray-400 text-xs mb-4">Messages Sent</div>
                          <div className="space-y-2">
                            <div className="flex items-end gap-1 h-20">
                              <div className="flex-1 bg-[#fddf0d]/30 rounded-t h-1/3 border-t border-[#fddf0d]/50"></div>
                              <div className="flex-1 bg-[#fddf0d]/40 rounded-t h-1/2 border-t border-[#fddf0d]/50"></div>
                              <div className="flex-1 bg-[#fddf0d]/50 rounded-t h-2/3 border-t border-[#fddf0d]/50"></div>
                              <div className="flex-1 bg-[#fddf0d]/60 rounded-t h-5/6 border-t border-[#fddf0d]/50"></div>
                              <div className="flex-1 bg-[#fddf0d]/70 rounded-t h-full border-t border-[#fddf0d]/50"></div>
                              <div className="flex-1 bg-[#fddf0d]/65 rounded-t h-4/5 border-t border-[#fddf0d]/50"></div>
                            </div>
                          </div>
                        </div>
                        
                        {/* Campaign List */}
                        <div className="bg-white/5 rounded-lg p-4 border border-gray-700/50">
                          <div className="text-gray-400 text-xs mb-4">Top Campaigns</div>
                          <div className="space-y-3">
                            <div className="flex justify-between items-center">
                              <span className="text-white text-sm">Bank OTP Alerts</span>
                              <span className="text-[#fddf0d] font-semibold text-sm">98.9%</span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-white text-sm">E-commerce Updates</span>
                              <span className="text-green-400 font-semibold text-sm">97.2%</span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-white text-sm">Marketing SMS</span>
                              <span className="text-blue-400 font-semibold text-sm">92.1%</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Floating stats - more prominent with better contrast */}
                <div className="absolute -left-12 top-1/4 bg-gradient-to-br from-[#003d4a]/95 to-[#00333e]/95 backdrop-blur-md border border-[#fddf0d]/40 rounded-xl p-4 shadow-2xl hover:scale-110 transition-all cursor-pointer animate-float-slow hover:border-[#fddf0d]/60">
                  <div className="text-3xl font-bold text-[#fddf0d]">50K+</div>
                  <div className="text-xs text-gray-300 font-medium">Daily SMS</div>
                </div>

                <div className="absolute -right-12 top-1/2 bg-gradient-to-br from-[#003d4a]/95 to-[#00333e]/95 backdrop-blur-md border border-[#fddf0d]/40 rounded-xl p-4 shadow-2xl hover:scale-110 transition-all cursor-pointer animate-float-medium hover:border-[#fddf0d]/60">
                  <div className="text-3xl font-bold text-[#fddf0d]">24/7</div>
                  <div className="text-xs text-gray-300 font-medium">Support</div>
                </div>

                <div className="absolute -left-12 bottom-1/4 bg-gradient-to-br from-[#003d4a]/95 to-[#00333e]/95 backdrop-blur-md border border-[#fddf0d]/40 rounded-xl p-4 shadow-2xl hover:scale-110 transition-all cursor-pointer hover:border-[#fddf0d]/60" style={{ animation: 'floatSlow 5s ease-in-out infinite' }}>
                  <div className="text-3xl font-bold text-[#fddf0d]">99.9%</div>
                  <div className="text-xs text-gray-300 font-medium">Uptime SLA</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce cursor-pointer z-10">
          <div className="flex flex-col items-center gap-2 text-gray-500 hover:text-[#fddf0d] transition-colors">
            <span className="text-xs font-medium tracking-wider">SCROLL</span>
            <ChevronDown className="w-5 h-5" />
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


      
    </div>
  );
}

export default Home;
