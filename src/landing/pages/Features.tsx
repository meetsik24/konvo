import { useNavigate } from "react-router-dom";
import { useLayoutEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SectionDark } from "../components/sections";
import { Button } from "../components/ui/button";
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
        const endPadding = 260;
        const distance = Math.max(0, totalWidth - visibleWidth + endPadding);

        const horizontalTween = gsap.to(track, {
          x: -distance,
          ease: "none",
          scrollTrigger: {
            trigger: section,
            start: "top top",
            end: () => `+=${distance}`,
            scrub: 1,
            pin: true,
            anticipatePin: 1,
          },
        });

        gsap.utils.toArray<HTMLElement>(".service-card").forEach((card) => {
          gsap.fromTo(
            card,
            { opacity: 0.4, y: 40, scale: 0.95 },
            {
              opacity: 1,
              y: 0,
              scale: 1,
              scrollTrigger: {
                trigger: card,
                containerAnimation: horizontalTween,
                start: "left center",
                end: "right center",
                scrub: true,
              },
            }
          );
        });

        return () => {
          horizontalTween.scrollTrigger?.kill();
          horizontalTween.kill();
        };
      });

      return () => mm.kill();
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <div className="bg-white min-h-screen">
      <div ref={sectionRef}>
        {/* Hero + Services - Dark Theme */}
        <SectionDark>
          <div className="mb-16 text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Check this out
            </h2>
            <p className="text-xl text-gray-300">
              Messages, payments, and events made simple
            </p>
          </div>

          {/* Pinned Scroll - Dark Premium */}
          <div
            ref={containerRef}
            className="relative overflow-x-auto lg:overflow-visible pb-8"
          >
            <div
              ref={trackRef}
              className="flex gap-8 w-max pl-6 pr-56"
            >
              {features.map((feature) => (
                <div
                  key={feature.id}
                  className="service-card flex-shrink-0 w-[340px] md:w-[380px]"
                >
                  <div className="relative h-full rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-8 shadow-[0_20px_60px_rgba(0,0,0,0.35)] transition-all duration-500 hover:-translate-y-2 hover:border-[#fddf0d]/60">
                    <div className="absolute -top-10 -right-8 h-32 w-32 rounded-full bg-[#fddf0d]/10 blur-3xl"></div>
                    <div className="absolute -bottom-12 left-6 h-24 w-24 rounded-full bg-[#00f5d4]/10 blur-3xl"></div>

                    <div className="relative z-10">
                      <div className="mb-6">
                        <h3 className="text-2xl font-bold text-white mb-2">
                          {feature.title}
                        </h3>
                        <p className="text-[#fddf0d] font-semibold text-sm tracking-wide">
                          {feature.tagline}
                        </p>
                      </div>

                      <p className="text-gray-300 text-sm mb-8 leading-relaxed">
                        {feature.description}
                      </p>

                      <div className="space-y-3 mb-10">
                        {feature.capabilities.slice(0, 3).map((capability, j) => (
                          <div key={j} className="flex items-start gap-3 text-gray-200 text-sm">
                            <span className="text-[#fddf0d] font-bold mt-0.5">✓</span>
                            <span>{capability}</span>
                          </div>
                        ))}
                      </div>

                      <div className="flex items-center justify-between pt-6 border-t border-white/10">
                        <span className="text-gray-300 font-semibold text-xs">
                          {feature.price}
                        </span>
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => navigate("/register")}
                        >
                          Get started
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </SectionDark>
      </div>

    </div>
  );
}

export default Features;
