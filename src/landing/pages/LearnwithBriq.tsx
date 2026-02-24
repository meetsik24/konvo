import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Play, ArrowRight, ExternalLink, FileText, Code, BookOpen } from "lucide-react";
import YouTube, { YouTubeEvent } from "react-youtube";
import { FAQAccordion } from "../components/ui/FAQAccordion";
import { learnResources, homePageFaqs } from "../constants";

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

interface YouTubePlayer {
  playVideo: () => void;
  pauseVideo: () => void;
}

function LearnWithBriq() {
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const videoRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<YouTubePlayer | null>(null);

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

    if (videoRef.current) {
      observer.observe(videoRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const opts = {
    height: "100%",
    width: "100%",
    playerVars: {
      autoplay: isVideoPlaying ? 1 : 0,
      mute: 1,
    },
  };

  const onReady = (event: YouTubeEvent) => {
    playerRef.current = event.target;
    if (isVideoPlaying) {
      event.target.playVideo();
    }
  };

  // Map icon names to icon components for resources
  const iconMap: Record<string, React.FC<React.SVGProps<SVGSVGElement>>> = {
    FileText,
    Code,
    BookOpen,
  };

  const getResourceIcon = (iconName: string) => {
    return iconMap[iconName] || FileText;
  };

  return (
    <div className="bg-[#0a0a0f] text-white">

      {/* Hero */}
      <section className="pt-32 pb-16 relative overflow-hidden border-b border-gray-800">
        {/* Grid background */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:64px_64px]"></div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#00333e]/20 rounded-full blur-3xl"></div>

        <div className="container mx-auto px-6 lg:px-8 relative z-10">
          <div className="max-w-3xl">
            <motion.div initial="hidden" animate="visible" variants={fadeIn}>
              <p className="text-[#fddf0d] font-semibold text-sm tracking-wide uppercase mb-4">
                Resources
              </p>
              <h1 className="text-4xl lg:text-5xl font-bold leading-tight mb-6">
                Learn to build with
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#fddf0d] to-[#00333e]"> Briq</span>
              </h1>
              <p className="text-xl text-gray-400 leading-relaxed">
                Documentation, tutorials, and guides to help you integrate 
                our communication APIs quickly and effectively.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Resources Cards */}
      <section className="py-16 bg-[#111118]">
        <div className="container mx-auto px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-6">
            {learnResources.map((resource, i) => {
              const IconComponent = getResourceIcon(resource.icon);
              return (
              <motion.a
                key={i}
                href={resource.href}
                target="_blank"
                rel="noopener noreferrer"
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeIn}
                className="bg-[#0a0a0f] border border-gray-800 rounded-2xl p-6 hover:border-[#fddf0d]/30 transition-all group"
              >
                <div className="w-12 h-12 bg-gradient-to-br from-[#00333e]/30 to-[#fddf0d]/20 rounded-xl flex items-center justify-center mb-4">
                  <IconComponent className="w-6 h-6 text-[#fddf0d]" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2 flex items-center">
                  {resource.title}
                  {resource.external && (
                    <ExternalLink className="w-4 h-4 ml-2 opacity-0 group-hover:opacity-100 transition-opacity text-gray-500" />
                  )}
                </h3>
                <p className="text-gray-400 text-sm">{resource.description}</p>
              </motion.a>
            );
            })}
          </div>
        </div>
      </section>

      {/* Video Section */}
      <section className="py-20 bg-[#0a0a0f]" ref={videoRef}>
        <div className="container mx-auto px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeIn}
            >
              <h2 className="text-3xl font-bold text-white mb-4">
                Watch: Getting Started with Briq
              </h2>
              <p className="text-gray-400 mb-6">
                A quick overview of the Briq platform, from account setup to 
                sending your first message. Perfect for new users.
              </p>
              <ul className="space-y-3 mb-8 text-sm text-gray-300">
                <li className="flex items-center">
                  <span className="w-6 h-6 bg-[#00333e]/30 text-[#fddf0d] rounded-full flex items-center justify-center text-xs font-medium mr-3">1</span>
                  Account setup and configuration
                </li>
                <li className="flex items-center">
                  <span className="w-6 h-6 bg-[#00333e]/30 text-[#fddf0d] rounded-full flex items-center justify-center text-xs font-medium mr-3">2</span>
                  Navigating the dashboard
                </li>
                <li className="flex items-center">
                  <span className="w-6 h-6 bg-[#00333e]/30 text-[#fddf0d] rounded-full flex items-center justify-center text-xs font-medium mr-3">3</span>
                  Sending your first SMS
                </li>
                <li className="flex items-center">
                  <span className="w-6 h-6 bg-[#00333e]/30 text-[#fddf0d] rounded-full flex items-center justify-center text-xs font-medium mr-3">4</span>
                  Understanding analytics
                </li>
              </ul>
              <a
                href="https://www.youtube.com/@karibubriq/videos"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center text-[#fddf0d] font-semibold hover:text-[#fddf0d]/80 transition-colors"
              >
                View all tutorials on YouTube
                <ArrowRight className="w-4 h-4 ml-2" />
              </a>
            </motion.div>

            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeIn}
            >
              <div className="bg-[#111118] border border-gray-800 rounded-2xl overflow-hidden aspect-video">
                {isVideoPlaying ? (
                  <YouTube
                    videoId="t1zaDwbPmyo"
                    opts={opts}
                    onReady={onReady}
                    className="w-full h-full"
                    iframeClassName="w-full h-full"
                  />
                ) : (
                  <div
                    className="w-full h-full flex items-center justify-center cursor-pointer bg-gradient-to-br from-gray-800 to-gray-900"
                    onClick={() => setIsVideoPlaying(true)}
                  >
                    <div className="w-16 h-16 bg-[#fddf0d] rounded-full flex items-center justify-center hover:scale-110 transition-transform">
                      <Play className="w-6 h-6 text-black ml-1" />
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Q&A Sessions */}
      <section className="py-20 bg-[#111118]">
        <div className="container mx-auto px-6 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeIn}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold text-white mb-4">
              Common questions
            </h2>
          </motion.div>
          <div className="max-w-3xl mx-auto">
            <FAQAccordion items={homePageFaqs} variant="dark" />
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gradient-to-br from-[#00333e]/20 to-[#fddf0d]/10 border-t border-[#00333e]/30">
        <div className="container mx-auto px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to start building?
          </h2>
          <p className="text-gray-400 mb-8 max-w-xl mx-auto">
            Create a free account and explore our APIs with the sandbox environment.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              to="/register"
              className="bg-[#fddf0d] text-black px-8 py-4 rounded-lg font-semibold hover:opacity-90 transition-opacity flex items-center gap-2"
            >
              Get Started Free
              <ArrowRight className="w-5 h-5" />
            </Link>
            <a
              href="https://docs.briq.tz"
              target="_blank"
              rel="noopener noreferrer"
              className="border border-gray-700 text-gray-300 hover:border-gray-500 hover:text-white px-8 py-4 rounded-lg font-semibold transition-all"
            >
              Read Documentation
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}

export default LearnWithBriq;
