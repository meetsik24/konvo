import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "../components/ui/button";
import { Typewriter } from "react-simple-typewriter";
import simuImage from "../../../assets/simu2.png";
import dashboard from "../../../assets/SMS.png";
import simuImage2 from "../../../assets/Simu.png";

// Home component
function Home() {
  const navigate = useNavigate();

  // Image slideshow logic for Hero
  const images = [simuImage, simuImage2, dashboard];
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, 3000); // Change image every 3 seconds

    return () => clearInterval(interval); // Cleanup on unmount
  }, [images.length]);

  return (
    <div className="bg-[#1a3c47] text-white font-sans">
      {/* Hero */}
      <section
        className="h-[70vh] bg-[#00333e] text-white flex items-center relative overflow-hidden font-exo"
      >
        {/* Animated Texture Background */}
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 tech-circuit-bg animate-circuit-move" />
          <div className="absolute inset-0 particle-bg animate-particle-move" />
        </div>

        <div className="container mx-auto px-4 flex flex-col md:flex-row items-center justify-center relative z-10 gap-6">
          {/* Left Side: Text Content */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="w-full md:w-1/2 flex flex-col justify-center text-center md:text-left"
          >
            <h1
              className="text-4xl sm:text-5xl md:text-6xl font-bold mb-4 leading-tight"
              style={{ fontFamily: "Exo, sans-serif" }}
            >
              Connect with{" "}
              <span className="text-[#fddf0d] [text-shadow:_0_0_10px_rgba(253,223,13,0.3)]">
                Briq
              </span>
              <br />
              <span className="text-white">
                <Typewriter
                  words={["Instant Messaging", "Seamless APIs", "Engage Customers"]}
                  loop={Infinity}
                  cursor
                  cursorStyle="|"
                  typeSpeed={70}
                  deleteSpeed={50}
                  delaySpeed={1000}
                />
              </span>
            </h1>
            <p
              className="text-base sm:text-lg text-[#6f888c] mb-6 max-w-md mx-auto md:mx-0 leading-relaxed"
              style={{ fontFamily: "Exo, sans-serif" }}
            >
              Reach your audience with tailored messages in Tanzania.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center md:justify-start">
              <Button
                onClick={() => navigate("/register")}
                className="bg-[#fddf0d] hover:bg-[#e5c90c] text-[#00333e] px-6 py-2 rounded-lg text-base sm:text-lg transition-all duration-300 hover:scale-105 [box-shadow:_0_0_15px_rgba(253,223,13,0.5)]"
                style={{ fontFamily: "Exo, sans-serif" }}
              >
                Sign Up
              </Button>
              <Button
                variant="outline"
                onClick={() => navigate("/documentation")}
                className="text-white border-[#6f888c] hover:bg-[#6f888c]/20 px-6 py-2 rounded-lg text-base sm:text-lg transition-all duration-300 hover:scale-105"
                style={{ fontFamily: "Exo, sans-serif" }}
              >
                Access the Developer Documentation
              </Button>
            </div>
          </motion.div>

          {/* Right Side: Alternating Images with Motion */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.5, ease: "easeOut" }}
            className="w-full md:w-1/2 flex justify-center items-center"
          >
            <div className="relative w-full h-[400px] sm:h-[500px] md:h-[700px]">
              {images.map((image, index) => (
                <img
                  key={index}
                  src={image}
                  alt={`Hero Image ${index + 1}`}
                  className={`w-full h-full object-contain rounded-lg absolute top-0 left-0 transition-opacity duration-1000 ${
                    index === currentImageIndex ? "opacity-100" : "opacity-0"
                  }`}
                />
              ))}
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}

export default Home;