import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Play, ArrowRight, ExternalLink, FileText, Code, BookOpen } from "lucide-react";
import YouTube, { YouTubeEvent } from "react-youtube";
import { FAQAccordion } from "../components/ui/FAQAccordion";
import { SectionDark, SectionWhite } from "../components/sections";
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
    <div className="bg-white min-h-screen">
      {/* Hero - White */}
      <section className="pt-28 pb-10 px-6 bg-white">
        <div className="container mx-auto max-w-4xl text-center">
          <p className="text-[#fddf0d] font-semibold text-sm tracking-wide uppercase mb-4">
            Resources
          </p>
          <h1 className="text-5xl md:text-6xl font-bold text-[#00333e] mb-6">
            Learn to build with Briq
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Documentation, tutorials, and guides to help you integrate our communication APIs quickly and effectively.
          </p>
        </div>
      </section>

      {/* Resources Cards - White BG */}
      <SectionWhite className="py-8">
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
                className="bg-white border border-gray-200 rounded-lg p-6 hover:border-[#fddf0d] transition-colors group"
              >
                <div className="w-12 h-12 bg-[#00333e] rounded-lg flex items-center justify-center mb-4">
                  <IconComponent className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-[#00333e] mb-2 flex items-center">
                  {resource.title}
                  {resource.external && (
                    <ExternalLink className="w-4 h-4 ml-2 opacity-0 group-hover:opacity-100 transition-opacity text-gray-400" />
                  )}
                </h3>
                <p className="text-gray-600 text-sm">{resource.description}</p>
              </motion.a>
            );
          })}
        </div>
      </SectionWhite>

      {/* Video Section */}
      <div ref={videoRef}>
        <SectionDark>
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
              <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden aspect-video backdrop-blur-xl">
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
                    className="w-full h-full flex items-center justify-center cursor-pointer bg-gradient-to-br from-white/10 to-white/5"
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
        </SectionDark>
      </div>

      {/* Q&A Sessions - White BG */}
      <SectionWhite className="py-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-[#00333e] mb-4">
            Frequently asked questions
          </h2>
        </div>
        <div className="max-w-3xl mx-auto">
          <FAQAccordion items={homePageFaqs} variant="light" />
        </div>
      </SectionWhite>

      {/* CTA */}
      <SectionDark>
        <div className="text-center">
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
      </SectionDark>
    </div>
  );
}

export default LearnWithBriq;
