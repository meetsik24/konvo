import { useNavigate } from "react-router-dom";
import { useLayoutEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { features } from "../constants";

function Features() {
  const navigate = useNavigate();
  const sectionRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      const section = sectionRef.current;
      const container = containerRef.current;
      const track = trackRef.current;
      if (!section || !container || !track) return;

      const mm = gsap.matchMedia();

      mm.add("(min-width: 1024px)", () => {
        const totalWidth = track.scrollWidth;
        const visibleWidth = container.clientWidth;
        const endPadding = 100;
        const distance = Math.max(0, totalWidth - visibleWidth + endPadding);

        const horizontalTween = gsap.to(track, {
          x: -distance,
          ease: "none",
          scrollTrigger: {
            trigger: section,
            start: "top top",
            end: () => `+=${distance + 500}`, // Add some breathing room for the scroll
            scrub: 1.5, // Smoother scrub
            pin: true,
            anticipatePin: 1,
            invalidateOnRefresh: true,
          },
        });

        // Entrance animation for cards
        gsap.utils.toArray<HTMLElement>(".service-card").forEach((card, i) => {
          gsap.fromTo(
            card,
            { opacity: 0, scale: 0.9, y: 30 },
            {
              opacity: 1,
              scale: 1,
              y: 0,
              duration: 0.8,
              delay: i * 0.1,
              ease: "power2.out",
              scrollTrigger: {
                trigger: section,
                start: "top 70%",
              }
            }
          );
        });

        return () => {
          horizontalTween.scrollTrigger?.kill();
        };
      });

      return () => mm.kill();
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <div className="bg-white min-h-screen">
      <div ref={sectionRef} className="relative overflow-hidden">
        {/* Hero + Services - Dark Theme */}
        <section className="relative bg-[#001f26] min-h-screen flex flex-col justify-center py-24 px-4 sm:px-6 lg:px-8">
          {/* Background Elements */}
          <div className="absolute inset-0 z-0">
            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:64px_64px]" />
            <div className="absolute top-1/4 -left-1/4 w-[600px] h-[600px] bg-[#fddf0d]/5 rounded-full blur-[120px] animate-pulse" />
            <div className="absolute bottom-1/4 -right-1/4 w-[600px] h-[600px] bg-blue-500/5 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '2s' }} />
          </div>

          <div className="container mx-auto max-w-7xl relative z-10 mb-16 px-6">
            <div className="max-w-3xl">
              <div className="inline-block px-4 py-2 bg-white/5 border border-white/10 rounded-full backdrop-blur-sm mb-6">
                <span className="text-[#fddf0d] text-sm font-semibold tracking-widest uppercase">Our Capabilities</span>
              </div>
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 tracking-tight">
                Powerful communication tools for <span className="text-[#fddf0d]">modern businesses</span>
              </h2>
              <p className="text-xl text-gray-400 leading-relaxed font-medium">
                Everything you need to engage your customers across all channels with enterprise-grade reliability.
              </p>
            </div>
          </div>

          {/* Horizontal Scroll Track */}
          <div
            ref={containerRef}
            className="relative overflow-x-auto lg:overflow-visible no-scrollbar pb-12"
          >
            <div
              ref={trackRef}
              className="flex gap-8 w-max pl-6 lg:pl-[calc((100vw-min(1280px,91.666vw))/2)] pr-[20vw]"
            >
              {features.map((feature) => (
                <div
                  key={feature.id}
                  className="service-card flex-shrink-0 w-[380px] md:w-[420px]"
                >
                  <div className="relative h-full flex flex-col group p-8 rounded-3xl bg-white/5 border border-white/10 hover:border-[#fddf0d]/50 hover:bg-white/[0.08] transition-all duration-500 backdrop-blur-md overflow-hidden">
                    {/* Hover Glow */}
                    <div className="absolute inset-0 bg-gradient-to-br from-[#fddf0d]/0 via-transparent to-[#fddf0d]/0 group-hover:from-[#fddf0d]/5 group-hover:to-transparent transition-all duration-700"></div>

                    <div className="relative z-10 h-full flex flex-col">
                      <div className="mb-8">
                        <div className="text-[#fddf0d] font-bold text-xs tracking-widest uppercase mb-4 opacity-70 group-hover:opacity-100 transition-opacity">
                          {feature.tagline}
                        </div>
                        <h3 className="text-3xl font-bold text-white mb-4 group-hover:text-[#fddf0d] transition-colors">
                          {feature.title}
                        </h3>
                        <p className="text-gray-400 text-lg leading-relaxed font-medium">
                          {feature.description}
                        </p>
                      </div>

                      <div className="space-y-4 mb-10 flex-1">
                        {feature.capabilities.slice(0, 3).map((capability, j) => (
                          <div key={j} className="flex items-center gap-3 text-gray-300">
                            <div className="w-1.5 h-1.5 rounded-full bg-[#fddf0d]" />
                            <span className="text-base font-medium">{capability}</span>
                          </div>
                        ))}
                      </div>

                      <div className="flex items-center justify-between pt-8 border-t border-white/10">
                        <div className="flex flex-col">
                          <span className="text-gray-500 text-xs font-bold uppercase tracking-widest">Pricing</span>
                          <span className="text-white font-bold text-lg mt-1 font-mono">{feature.price}</span>
                        </div>
                        <button
                          onClick={() => navigate("/register")}
                          className="bg-white/5 text-white p-4 rounded-2xl hover:bg-[#fddf0d] hover:text-[#001f26] transition-all duration-300 border border-white/10 hover:border-[#fddf0d]"
                        >
                          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
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
    </div>
  );
}

export default Features;
