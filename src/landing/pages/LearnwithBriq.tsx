import { useState, useEffect, useRef } from "react";
import { Play, BookOpen, Video, Users, ArrowRight, CheckCircle } from "lucide-react";
import { motion } from "framer-motion";
import YouTube from "react-youtube";
import Navbar from "../components/Navbar";
import { Footer } from "../components/Footer";

const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

function LearnWithBriq() {
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const videoSectionRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<any>(null);

  const playVideo = () => {
    setIsVideoPlaying(true);
  };

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setIsVideoPlaying(true);
          observer.disconnect();
        }
      },
      { threshold: 0.5 }
    );

    if (videoSectionRef.current) {
      observer.observe(videoSectionRef.current);
    }

    return () => {
      if (videoSectionRef.current) {
        observer.unobserve(videoSectionRef.current);
      }
    };
  }, []);

  const opts = {
    height: "315",
    width: "100%",
    playerVars: {
      autoplay: isVideoPlaying ? 1 : 0,
      mute: 1,
    },
  };

  const onReady = (event: any) => {
    playerRef.current = event.target;
    if (isVideoPlaying) {
      event.target.playVideo();
      event.target.mute();
    }
  };

  const tutorials = [
    { title: "Getting Started with Bulk SMS", duration: "5 min", level: "Beginner" },
    { title: "Setting Up WhatsApp Business API", duration: "8 min", level: "Intermediate" },
    { title: "OTP Integration Guide", duration: "12 min", level: "Developer" },
    { title: "Creating Marketing Campaigns", duration: "10 min", level: "Beginner" },
    { title: "API Authentication & Webhooks", duration: "15 min", level: "Developer" },
    { title: "Contact Management Best Practices", duration: "7 min", level: "Beginner" },
  ];

  const resources = [
    { icon: BookOpen, title: "Documentation", desc: "Comprehensive API docs and guides", link: "/docs" },
    { icon: Video, title: "Video Tutorials", desc: "Step-by-step visual walkthroughs", link: "https://www.youtube.com/@karibubriq/videos" },
    { icon: Users, title: "Community", desc: "Connect with other Briq developers", link: "/contact" },
  ];

  return (
    <div className="bg-white font-sans">
      <Navbar />

      {/* Hero Section */}
      <section className="relative pt-28 pb-16 bg-gradient-to-br from-[#00333e] via-[#004d5c] to-[#00333e] overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-10 w-72 h-72 bg-[#fddf0d] rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-[#fddf0d] rounded-full blur-3xl"></div>
        </div>

        <div className="container mx-auto px-4 relative">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-3xl mx-auto"
          >
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Learn with<span className="text-[#fddf0d]"> Briq</span>
            </h1>
            <p className="text-gray-300 text-lg md:text-xl mb-8">
              Master our platform with video tutorials, documentation, and hands-on guides.
            </p>
            <a
              href="https://www.youtube.com/@karibubriq/videos"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center bg-[#fddf0d] hover:bg-[#e5c90c] text-[#00333e] font-bold px-8 py-4 text-lg rounded-lg shadow-lg hover:shadow-xl transition-all"
            >
              Watch Tutorials
              <Play className="w-5 h-5 ml-2" />
            </a>
          </motion.div>
        </div>

        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 63" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
            <path d="M1063.35 49.95C1253.44 48.12 1440 22.05 1440 22.05V63H0V0C0 0 181.399 51.3 409.05 51.3C682.705 51.3 841.261 52.088 1063.35 49.95Z" fill="#F8FAF5" />
          </svg>
        </div>
      </section>

      {/* Featured Video Section */}
      <section className="py-20 bg-[#F8FAF5]" ref={videoSectionRef}>
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp}>
              <span className="inline-block px-4 py-2 bg-[#00333e] text-white rounded-full text-sm font-medium mb-4">
                Featured Tutorial
              </span>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Getting Started with Briq
              </h2>
              <p className="text-gray-600 text-lg mb-6">
                Learn the basics of the Briq platform in this comprehensive walkthrough.
              </p>
              <ul className="space-y-3 mb-8">
                {["Account setup & configuration", "Sending your first SMS", "Managing contacts", "Understanding analytics"].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-gray-700">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    {item}
                  </li>
                ))}
              </ul>
              <a
                href="https://www.youtube.com/@karibubriq/videos"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center text-[#00333e] font-semibold hover:text-[#004d5c] transition-colors"
              >
                View all tutorials
                <ArrowRight className="w-5 h-5 ml-2" />
              </a>
            </motion.div>

            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp} className="relative">
              <div className="bg-[#00333e] rounded-2xl p-4 shadow-2xl">
                {isVideoPlaying ? (
                  <YouTube
                    videoId="t1zaDwbPmyo"
                    opts={opts}
                    onReady={onReady}
                    className="rounded-lg overflow-hidden"
                    containerClassName="w-full aspect-video"
                  />
                ) : (
                  <div
                    className="w-full aspect-video bg-gray-800 rounded-lg relative cursor-pointer flex items-center justify-center"
                    onClick={playVideo}
                  >
                    <div className="w-20 h-20 bg-[#fddf0d] rounded-full flex items-center justify-center hover:scale-110 transition-transform">
                      <Play className="w-8 h-8 text-[#00333e] ml-1" />
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Wave divider */}
      <div className="bg-[#F8FAF5]">
        <svg viewBox="0 0 1440 63" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
          <path d="M1063.35 49.95C1253.44 48.12 1440 22.05 1440 22.05V63H0V0C0 0 181.399 51.3 409.05 51.3C682.705 51.3 841.261 52.088 1063.35 49.95Z" fill="white" />
        </svg>
      </div>

      {/* Tutorial List */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp} className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Popular Tutorials</h2>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              Explore our most-watched tutorials covering everything from basics to advanced features.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tutorials.map((tutorial, i) => (
              <motion.a
                key={i}
                href="https://www.youtube.com/@karibubriq/videos"
                target="_blank"
                rel="noopener noreferrer"
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeInUp}
                transition={{ delay: i * 0.1 }}
                className="bg-gray-50 hover:bg-gray-100 rounded-xl p-6 border border-gray-100 transition-colors group"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 bg-[#00333e] rounded-lg flex items-center justify-center group-hover:bg-[#004d5c] transition-colors">
                    <Play className="w-5 h-5 text-white" />
                  </div>
                  <span className={`text-xs font-medium px-2 py-1 rounded ${
                    tutorial.level === "Beginner" ? "bg-green-100 text-green-700" :
                    tutorial.level === "Intermediate" ? "bg-yellow-100 text-yellow-700" :
                    "bg-purple-100 text-purple-700"
                  }`}>
                    {tutorial.level}
                  </span>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">{tutorial.title}</h3>
                <p className="text-sm text-gray-500">{tutorial.duration}</p>
              </motion.a>
            ))}
          </div>
        </div>
      </section>

      {/* Resources Section */}
      <section className="py-20 bg-[#00333e]">
        <div className="container mx-auto px-4">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp} className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">More Resources</h2>
            <p className="text-gray-300 text-lg max-w-2xl mx-auto">
              Enhance your learning with additional resources and community support.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {resources.map((resource, i) => (
              <motion.a
                key={i}
                href={resource.link}
                target={resource.link.startsWith("http") ? "_blank" : undefined}
                rel={resource.link.startsWith("http") ? "noopener noreferrer" : undefined}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeInUp}
                transition={{ delay: i * 0.1 }}
                className="bg-white/10 backdrop-blur rounded-xl p-8 border border-white/20 hover:bg-white/20 transition-colors text-center"
              >
                <div className="w-16 h-16 bg-[#fddf0d]/20 rounded-full flex items-center justify-center mx-auto mb-6">
                  <resource.icon className="w-8 h-8 text-[#fddf0d]" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">{resource.title}</h3>
                <p className="text-gray-400">{resource.desc}</p>
              </motion.a>
            ))}
          </div>
        </div>
      </section>

      {/* Wave divider */}
      <div className="bg-[#00333e]">
        <svg viewBox="0 0 1440 63" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
          <path d="M1063.35 49.95C1253.44 48.12 1440 22.05 1440 22.05V63H0V0C0 0 181.399 51.3 409.05 51.3C682.705 51.3 841.261 52.088 1063.35 49.95Z" fill="white" />
        </svg>
      </div>

      {/* CTA */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4 text-center">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp}>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Ready to Get Started?</h2>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto mb-8">
              Put your learning into practice. Sign up for a free trial and start building today.
            </p>
            <a
              href="/register"
              className="inline-flex items-center bg-[#00333e] hover:bg-[#004d5c] text-white font-bold px-8 py-4 text-lg rounded-lg transition-colors"
            >
              Start Free Trial
              <ArrowRight className="w-5 h-5 ml-2" />
            </a>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

export default LearnWithBriq;
