import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronDown } from "lucide-react";
import { useRotatingText, useParallax } from "../hooks";
import {
  rotatingTexts,
  stats,
} from "../constants";
import smsMockup from "../../../assets/SMS.png";
import handPhoneMockup from "../../../assets/simu2.png";
import twinPhonesMockup from "../../../assets/Simu.png";

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
      <section className="min-h-screen flex items-center px-4 sm:px-6 pt-24 pb-12 relative">
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
                <span className="text-[#fddf0d] text-sm font-semibold tracking-wide">BUSINESS COMMUNICATION PLATFORM</span>
              </div>

              <div className="relative overflow-hidden" style={{ minHeight: '160px' }}>
                {rotatingTexts.map((text, i) => (
                  <div
                    key={i}
                    className={`absolute inset-0 transition-all duration-700 ease-in-out ${i === activeText
                      ? 'opacity-100 translate-y-0'
                      : i === (activeText - 1 + rotatingTexts.length) % rotatingTexts.length
                        ? 'opacity-0 -translate-y-8'
                        : 'opacity-0 translate-y-8'
                      }`}
                  >
                    <div className="text-xs md:text-sm text-[#fddf0d] font-bold mb-3 tracking-widest">{text.tag}</div>
                    <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-gray-100 leading-tight mb-2">
                      {text.main}
                    </h1>
                    <p className="text-base md:text-xl text-gray-400 font-medium">
                      {text.accent}
                    </p>
                  </div>
                ))}
              </div>

              <p className="text-sm sm:text-base md:text-lg text-gray-300 max-w-xl leading-relaxed">
                Production-ready APIs for Banks, Fintechs & High-growth Startups across Tanzania
              </p>

              <div className="flex gap-3 sm:gap-4 flex-wrap pt-2">
                <button
                  onClick={() => navigate("/register")}
                  className="bg-[#fddf0d] text-[#00333e] px-6 sm:px-8 py-3 sm:py-4 rounded-lg text-base sm:text-lg font-semibold hover:bg-[#fce96a] transition-all hover:scale-105 hover:shadow-2xl shadow-lg"
                >
                  Sign Up
                </button>
                <a
                  href="https://docs.briq.tz"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-white/10 text-gray-300 px-6 sm:px-8 py-3 sm:py-4 rounded-lg text-base sm:text-lg font-semibold hover:bg-white/20 transition-all hover:scale-105 border border-gray-600 backdrop-blur-sm"
                >
                  Developer Docs
                </a>
              </div>

              {/* Integrated service tags and stats */}
              <div className="pt-8 border-t border-gray-700/30">
                <div className="flex flex-wrap gap-3 mb-5">
                  {["SMS API", "WhatsApp API", "Voice OTP", "AI Chatbots", "Payments"].map((service, i) => (
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
                      <div className="text-xl sm:text-2xl font-bold text-[#fddf0d] group-hover:scale-110 transition-transform">{stat.value}</div>
                      <div className="text-xs text-gray-400">{stat.label}</div>
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

              <div className="relative w-[580px] h-[480px]">
                {/* SMS & Dashboard Composite */}
                {activeMockup === 0 && (
                  <div className="absolute inset-0 flex items-center justify-center transform hover:scale-105 transition-all duration-700 ease-out animate-in fade-in slide-in-from-right-12 duration-1000">
                    <div className="absolute -inset-4 bg-[#fddf0d]/10 blur-2xl rounded-full opacity-50"></div>
                    <img
                      src={smsMockup}
                      alt="SMS & Dashboard"
                      className="relative z-10 w-full h-full object-contain drop-shadow-[0_35px_35px_rgba(0,0,0,0.5)]"
                    />
                  </div>
                )}

                {/* Hand Holding Phone */}
                {activeMockup === 1 && (
                  <div className="absolute inset-0 flex items-center justify-center transform hover:scale-105 transition-all duration-700 ease-out animate-in fade-in slide-in-from-right-12 duration-1000">
                    <div className="absolute -inset-4 bg-blue-500/10 blur-2xl rounded-full opacity-50"></div>
                    <img
                      src={handPhoneMockup}
                      alt="Business Messaging"
                      className="relative z-10 w-full h-full object-contain drop-shadow-[0_35px_35px_rgba(0,0,0,0.5)]"
                    />
                  </div>
                )}

                {/* Two Phones Mockup */}
                {activeMockup === 2 && (
                  <div className="absolute inset-0 flex items-center justify-center transform hover:scale-105 transition-all duration-700 ease-out animate-in fade-in slide-in-from-right-12 duration-1000">
                    <div className="absolute -inset-4 bg-[#fddf0d]/10 blur-2xl rounded-full opacity-50"></div>
                    <img
                      src={twinPhonesMockup}
                      alt="Mobile App Interface"
                      className="relative z-10 w-full h-full object-contain drop-shadow-[0_35px_35px_rgba(0,0,0,0.5)]"
                    />
                  </div>
                )}

                {/* Floating stats - better positioning to avoid horizontal scroll */}
                <div className="absolute left-0 top-1/4 bg-gradient-to-br from-[#003d4a]/95 to-[#00333e]/95 backdrop-blur-md border border-[#fddf0d]/40 rounded-xl p-4 shadow-2xl hover:scale-110 transition-all cursor-pointer animate-float-slow hover:border-[#fddf0d]/60 hidden lg:block">
                  <div className="text-3xl font-bold text-[#fddf0d]">50K+</div>
                  <div className="text-xs text-gray-300 font-medium">Daily SMS</div>
                </div>

                <div className="absolute right-0 top-1/2 bg-gradient-to-br from-[#003d4a]/95 to-[#00333e]/95 backdrop-blur-md border border-[#fddf0d]/40 rounded-xl p-4 shadow-2xl hover:scale-110 transition-all cursor-pointer animate-float-medium hover:border-[#fddf0d]/60 hidden lg:block">
                  <div className="text-3xl font-bold text-[#fddf0d]">24/7</div>
                  <div className="text-xs text-gray-300 font-medium">Support</div>
                </div>

                <div className="absolute left-0 bottom-1/4 bg-gradient-to-br from-[#003d4a]/95 to-[#00333e]/95 backdrop-blur-md border border-[#fddf0d]/40 rounded-xl p-4 shadow-2xl hover:scale-110 transition-all cursor-pointer hover:border-[#fddf0d]/60 hidden lg:block" style={{ animation: 'floatSlow 5s ease-in-out infinite' }}>
                  <div className="text-3xl font-bold text-[#fddf0d]">99.9%</div>
                  <div className="text-xs text-gray-300 font-medium">Uptime SLA</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce cursor-pointer z-10">
          <div className="flex flex-col items-center gap-2 text-gray-300 hover:text-[#fddf0d] transition-colors">
            <span className="text-xs font-medium tracking-wider">SCROLL</span>
            <ChevronDown className="w-5 h-5" />
          </div>
        </div>
      </section>





    </div>
  );
}

export default Home;
