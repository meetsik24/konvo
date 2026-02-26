import { useNavigate } from "react-router-dom";
import { useLayoutEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { features } from "../constants";

function Features() {
  const navigate = useNavigate();
  const sectionRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      const section = sectionRef.current;
      const grid = gridRef.current;
      if (!section || !grid) return;

      const mm = gsap.matchMedia();

      mm.add("(min-width: 768px)", () => {
        const cards = gsap.utils.toArray<HTMLElement>(".service-card");

        // Set initial hidden state
        gsap.set(cards, { opacity: 0, y: 60 });

        // Create a timeline that pins the section and reveals cards row by row
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: section,
            start: "top top",
            end: "+=2000",
            pin: true,
            scrub: 0.8,
            anticipatePin: 1,
          },
        });

        // Animate first row (cards 0-2) together
        tl.to(cards.slice(0, 3), {
          opacity: 1,
          y: 0,
          duration: 1,
          stagger: 0.05,
          ease: "power2.out",
        });

        // Small pause between rows
        tl.to({}, { duration: 0.15 });

        // Animate second row (cards 3-5) together
        tl.to(cards.slice(3, 6), {
          opacity: 1,
          y: 0,
          duration: 1,
          stagger: 0.05,
          ease: "power2.out",
        });

        // Hold for a moment after all revealed
        tl.to({}, { duration: 0.3 });

        return () => {
          tl.scrollTrigger?.kill();
          tl.kill();
        };
      });

      return () => mm.kill();
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={sectionRef} className="relative overflow-hidden">
      <section className="relative bg-[#001f26] min-h-screen py-12 sm:py-20 px-4 sm:px-6 lg:px-8">
        {/* Background Elements */}
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:64px_64px]" />
          <div className="absolute top-1/4 -left-1/4 w-[600px] h-[600px] bg-[#fddf0d]/5 rounded-full blur-[120px]" />
          <div className="absolute bottom-1/4 -right-1/4 w-[600px] h-[600px] bg-blue-500/5 rounded-full blur-[120px]" />
        </div>

        {/* Section Header */}
        <div className="container mx-auto max-w-6xl relative z-10 mb-12 px-4">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-block px-4 py-2 bg-white/5 border border-white/10 rounded-full backdrop-blur-sm mb-5">
              <span className="text-[#fddf0d] text-sm font-semibold tracking-wide uppercase">Our Capabilities</span>
            </div>
            <h2 className="text-2xl sm:text-4xl md:text-5xl font-bold text-white mb-4">
              Powerful communication tools for <span className="text-[#fddf0d]">modern businesses</span>
            </h2>
            <p className="text-base sm:text-xl text-gray-400 leading-relaxed">
              Everything you need to engage your customers across all channels with enterprise-grade reliability.
            </p>
          </div>
        </div>

        {/* 3-Column Grid */}
        <div className="container mx-auto max-w-5xl relative z-10 px-4">
          <div
            ref={gridRef}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4"
          >
            {features.map((feature) => (
              <div
                key={feature.id}
                className="service-card"
              >
                <div className="relative h-full min-h-0 sm:min-h-[380px] flex flex-col group px-5 sm:px-6 py-5 sm:py-7 rounded-2xl bg-white/[0.04] border border-white/[0.08] hover:border-[#fddf0d]/40 hover:bg-white/[0.07] transition-all duration-300 backdrop-blur-sm overflow-hidden">
                  {/* Hover Glow */}
                  <div className="absolute inset-0 bg-gradient-to-br from-[#fddf0d]/0 to-transparent group-hover:from-[#fddf0d]/[0.03] transition-all duration-500"></div>

                  <div className="relative z-10 h-full flex flex-col">
                    {/* Tagline + Title */}
                    <div className="mb-4">
                      <div className="text-[#fddf0d] font-semibold text-xs tracking-widest uppercase mb-3 opacity-60 group-hover:opacity-100 transition-opacity">
                        {feature.tagline}
                      </div>
                      <h3 className="text-xl font-bold text-white group-hover:text-[#fddf0d] transition-colors leading-tight">
                        {feature.title}
                      </h3>
                    </div>

                    {/* Description */}
                    <p className="text-gray-400 text-sm leading-relaxed mb-5">
                      {feature.description}
                    </p>

                    {/* Capabilities */}
                    <div className="space-y-2.5 mb-6 flex-1">
                      {feature.capabilities.slice(0, 3).map((capability, j) => (
                        <div key={j} className="flex items-center gap-2.5 text-gray-300">
                          <div className="w-1.5 h-1.5 rounded-full bg-[#fddf0d] flex-shrink-0" />
                          <span className="text-sm">{capability}</span>
                        </div>
                      ))}
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-end pt-5 border-t border-white/[0.08]">
                      <button
                        onClick={() => navigate("/register")}
                        className="bg-white/5 text-white p-3 rounded-xl hover:bg-[#fddf0d] hover:text-[#001f26] transition-all duration-200 border border-white/[0.08] hover:border-[#fddf0d]"
                      >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

export default Features;
