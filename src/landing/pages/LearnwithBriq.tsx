import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Play, BookOpen, FileText, Code, ArrowRight, ExternalLink } from "lucide-react";
import YouTube from "react-youtube";
import Navbar from "../components/Navbar";
import { Footer } from "../components/Footer";

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

function LearnWithBriq() {
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const videoRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<any>(null);

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

  const onReady = (event: any) => {
    playerRef.current = event.target;
    if (isVideoPlaying) {
      event.target.playVideo();
    }
  };

  const resources = [
    {
      icon: FileText,
      title: "Documentation",
      description: "Comprehensive guides for all Briq products",
      href: "https://docs.briq.tz",
      external: true,
    },
    {
      icon: Code,
      title: "API Reference",
      description: "Complete API documentation with examples",
      href: "https://docs.briq.tz/api",
      external: true,
    },
    {
      icon: BookOpen,
      title: "Tutorials",
      description: "Step-by-step integration guides",
      href: "https://docs.briq.tz/tutorials",
      external: true,
    },
  ];

  const tutorials = [
    {
      title: "Getting Started with Bulk SMS",
      duration: "5 min",
      category: "Beginner",
    },
    {
      title: "WhatsApp Business API Setup",
      duration: "8 min",
      category: "Integration",
    },
    {
      title: "OTP Verification Implementation",
      duration: "12 min",
      category: "Developer",
    },
    {
      title: "Managing Campaigns",
      duration: "6 min",
      category: "Beginner",
    },
    {
      title: "Webhook Configuration",
      duration: "10 min",
      category: "Developer",
    },
    {
      title: "Analytics Dashboard Overview",
      duration: "4 min",
      category: "Beginner",
    },
  ];

  return (
    <div className="bg-white">
      <Navbar />

      {/* Hero */}
      <section className="pt-32 pb-16 bg-white border-b border-gray-100">
        <div className="container mx-auto px-6 lg:px-8">
          <div className="max-w-3xl">
            <motion.div initial="hidden" animate="visible" variants={fadeIn}>
              <p className="text-[#00333e] font-semibold text-sm tracking-wide uppercase mb-4">
                Resources
              </p>
              <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 leading-tight mb-6">
                Learn to build with Briq
              </h1>
              <p className="text-xl text-gray-600 leading-relaxed">
                Documentation, tutorials, and guides to help you integrate 
                our communication APIs quickly and effectively.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Resources Cards */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-6">
            {resources.map((resource, i) => (
              <motion.a
                key={i}
                href={resource.href}
                target="_blank"
                rel="noopener noreferrer"
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeIn}
                className="bg-white border border-gray-200 rounded-lg p-6 hover:border-[#00333e] hover:shadow-sm transition-all group"
              >
                <resource.icon className="w-8 h-8 text-[#00333e] mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2 flex items-center">
                  {resource.title}
                  {resource.external && (
                    <ExternalLink className="w-4 h-4 ml-2 opacity-0 group-hover:opacity-100 transition-opacity" />
                  )}
                </h3>
                <p className="text-gray-600 text-sm">{resource.description}</p>
              </motion.a>
            ))}
          </div>
        </div>
      </section>

      {/* Video Section */}
      <section className="py-20 bg-white" ref={videoRef}>
        <div className="container mx-auto px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeIn}
            >
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Watch: Getting Started with Briq
              </h2>
              <p className="text-gray-600 mb-6">
                A quick overview of the Briq platform, from account setup to 
                sending your first message. Perfect for new users.
              </p>
              <ul className="space-y-3 mb-8 text-sm text-gray-700">
                <li className="flex items-center">
                  <span className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center text-xs font-medium mr-3">1</span>
                  Account setup and configuration
                </li>
                <li className="flex items-center">
                  <span className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center text-xs font-medium mr-3">2</span>
                  Navigating the dashboard
                </li>
                <li className="flex items-center">
                  <span className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center text-xs font-medium mr-3">3</span>
                  Sending your first SMS
                </li>
                <li className="flex items-center">
                  <span className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center text-xs font-medium mr-3">4</span>
                  Understanding analytics
                </li>
              </ul>
              <a
                href="https://www.youtube.com/@karibubriq/videos"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center text-[#00333e] font-semibold hover:underline"
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
              <div className="bg-gray-900 rounded-lg overflow-hidden aspect-video">
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
                    className="w-full h-full flex items-center justify-center cursor-pointer"
                    onClick={() => setIsVideoPlaying(true)}
                  >
                    <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center hover:scale-110 transition-transform">
                      <Play className="w-6 h-6 text-gray-900 ml-1" />
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Tutorial List */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-6 lg:px-8">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">
              Video Tutorials
            </h2>
            <div className="bg-white border border-gray-200 rounded-lg divide-y divide-gray-100">
              {tutorials.map((tutorial, i) => (
                <a
                  key={i}
                  href="https://www.youtube.com/@karibubriq/videos"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-gray-100 rounded flex items-center justify-center mr-4">
                      <Play className="w-4 h-4 text-gray-600" />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">{tutorial.title}</h3>
                      <p className="text-sm text-gray-500">{tutorial.duration}</p>
                    </div>
                  </div>
                  <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded">
                    {tutorial.category}
                  </span>
                </a>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-white border-t border-gray-100">
        <div className="container mx-auto px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Ready to start building?
          </h2>
          <p className="text-gray-600 mb-8 max-w-xl mx-auto">
            Create a free account and explore our APIs with the sandbox environment.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              to="/register"
              className="bg-[#00333e] text-white px-8 py-4 rounded font-semibold hover:bg-[#004d5c] transition-colors"
            >
              Get Started Free
            </Link>
            <a
              href="https://docs.briq.tz"
              target="_blank"
              rel="noopener noreferrer"
              className="border-2 border-gray-300 text-gray-700 px-8 py-4 rounded font-semibold hover:border-gray-400 transition-colors"
            >
              Read Documentation
            </a>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

export default LearnWithBriq;
