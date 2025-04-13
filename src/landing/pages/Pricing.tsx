import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import * as anime from "animejs";

// Typing animation keyframes for the SMS pricing statement
const typingAnimation = `
  @keyframes typing {
    from { width: 0; }
    to { width: 100%; }
  }
  @keyframes blink {
    50% { border-color: transparent; }
  }
`;

// Pricing component
function Pricing() {
  // Refs for elements to animate with Anime.js
  const headerRef = useRef(null);
  const pricingContentRef = useRef(null);

  useEffect(() => {
    // Intersection Observer to trigger animations on scroll
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const target = entry.target;

            if (target === headerRef.current) {
              // Animate the header (title and subheading)
              anime({
                targets: headerRef.current.querySelector("h1"),
                opacity: [0, 1],
                translateY: [20, 0],
                duration: 800,
                easing: "easeOutQuad",
              });

              anime({
                targets: headerRef.current.querySelector("p"),
                opacity: [0, 1],
                translateY: [20, 0],
                duration: 800,
                easing: "easeOutQuad",
                delay: 200, // Staggered effect
              });
            }

            if (target === pricingContentRef.current) {
              // Animate the pricing content (pricing statement, subheading, button)
              anime({
                targets: pricingContentRef.current.querySelector("h2"),
                opacity: [0, 1],
                scale: [0.95, 1],
                duration: 500,
                easing: "easeOutQuad",
                delay: 300,
              });

              anime({
                targets: pricingContentRef.current.querySelector("p"),
                opacity: [0, 1],
                translateY: [20, 0],
                duration: 500,
                easing: "easeOutQuad",
                delay: 400,
              });

              anime({
                targets: pricingContentRef.current.querySelector("button"),
                opacity: [0, 1],
                translateY: [20, 0],
                duration: 500,
                easing: "easeOutQuad",
                delay: 500,
              });
            }
          }
        });
      },
      { threshold: 0.3 } // Trigger when 30% of the element is visible
    );

    // Observe the elements
    if (headerRef.current) observer.observe(headerRef.current);
    if (pricingContentRef.current) observer.observe(pricingContentRef.current);

    // Cleanup observer on unmount
    return () => {
      if (headerRef.current) observer.unobserve(headerRef.current);
      if (pricingContentRef.current) observer.unobserve(pricingContentRef.current);
    };
  }, []);

  return (
    <section
      className="py-24 text-white relative overflow-hidden font-exo bg-white"
    >
      {/* Animated Tech Background Patterns */}
      <div className="absolute inset-0 z-0 opacity-50">
        <div className="absolute inset-0 tech-circuit-bg animate-circuit-move bg-cover bg-center" />
        <div className="absolute inset-0 particle-bg animate-particle-move bg-cover bg-center" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        {/* Main Container with Gradient Background */}
        <div className="bg-gradient-to-r from-[#00333e] to-[#002a34] rounded-2xl py-16 px-8 md:px-12">
          {/* Header */}
          <div ref={headerRef} className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 tracking-tight">
              <span className="text-[#fddf0d] [text-shadow:_0_0_10px_rgba(253,223,13,0.3)]">
                Briq
              </span>{" "}
              Pricing
            </h1>
            <p className="text-[#6f888c] text-lg max-w-2xl mx-auto leading-relaxed">
              Take your business to the next level with Briq's simple, upfront pricing designed for business owners ready to connect with customers!
            </p>
          </div>

          {/* Pricing Content (No Inner Container) */}
          <div ref={pricingContentRef} className="text-center max-w-3xl mx-auto">
            <style>{typingAnimation}</style>
            <h2 className="text-4xl md:text-5xl font-bold mb-6 tracking-tight inline-block overflow-hidden whitespace-nowrap border-r-4 border-[#fddf0d] animate-[typing_2s_steps(30,end)_1s,blink_0.75s_step-end_infinite]">
              SMS as Low as{" "}
              <span className="text-[#fddf0d] [text-shadow:_0_0_10px_rgba(253,223,13,0.3)]">
                12 TZS
              </span>{" "}
              per SMS
            </h2>
           
            <a href="/signup">
              <motion.button
                whileHover={{
                  scale: 1.05,
                  boxShadow: "0 0 20px rgba(253, 223, 13, 0.5)",
                }}
                className="bg-[#fddf0d] hover:bg-[#e5c90c] text-[#00333e] px-8 py-3 rounded-lg text-lg font-bold [box-shadow:_0_0_15px_rgba(253,223,13,0.5)] transition-all duration-300"
              >
                Sign Up Now
              </motion.button>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Pricing;