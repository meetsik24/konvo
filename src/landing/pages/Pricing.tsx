import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import * as anime from "animejs";
import { Typewriter } from "react-simple-typewriter";

function Pricing() {
  const headerRef = useRef(null);
  const pricingContentRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const target = entry.target;

            if (target === headerRef.current) {
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
                delay: 200,
              });
            }

            if (target === pricingContentRef.current) {
              anime({
                targets: pricingContentRef.current.querySelector("h2"),
                opacity: [0, 1],
                scale: [0.95, 1],
                duration: 500,
                easing: "easeOutQuad",
                delay: 300,
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
      { threshold: 0.3 }
    );

    if (headerRef.current) observer.observe(headerRef.current);
    if (pricingContentRef.current) observer.observe(pricingContentRef.current);

    return () => {
      if (headerRef.current) observer.unobserve(headerRef.current);
      if (pricingContentRef.current) observer.unobserve(pricingContentRef.current);
    };
  }, []);

  return (
    <section className="py-24 text-white relative overflow-hidden font-exo bg-white">
      {/* Animated Tech Background Patterns */}
      <div className="absolute inset-0 z-0 opacity-50">
        <div className="absolute inset-0 tech-circuit-bg animate-circuit-move bg-cover bg-center" />
        <div className="absolute inset-0 particle-bg animate-particle-move bg-cover bg-center" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="bg-gradient-to-r from-[#00333e] to-[#002a34] rounded-2xl py-16 px-8 md:px-12 shadow-2xl">
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

          {/* Pricing Content */}
          <div ref={pricingContentRef} className="text-center max-w-3xl mx-auto">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 tracking-tight leading-tight min-h-[4rem] md:min-h-[6rem]">
              <Typewriter
                words={["SMS as Low as 12 TZS per SMS", "WhatsApp Messaging via Briq", "Reliable OTP Services"]}
                loop={0}
                cursor
                cursorStyle="|"
                typeSpeed={50}
                deleteSpeed={30}
                delaySpeed={2000}
              />
            </h2>

            <a href="/register">
              <motion.button
                whileHover={{
                  scale: 1.05,
                  boxShadow: "0 0 20px rgba(253, 223, 13, 0.5)",
                }}
                whileTap={{ scale: 0.95 }}
                className="bg-[#fddf0d] hover:bg-[#e5c90c] text-[#00333e] px-8 py-3 rounded-lg text-lg font-bold [box-shadow:_0_0_15px_rgba(253, 223, 13, 0.5)] transition-all duration-300"
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