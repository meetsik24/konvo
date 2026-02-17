import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Play, BookOpen, FileText, Code, ArrowRight, ExternalLink, Calendar, Clock, MessageCircle, Users } from "lucide-react";
import YouTube, { YouTubeEvent } from "react-youtube";

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
      videoId: "t1zaDwbPmyo",
      duration: "5 min",
      category: "Beginner",
      description: "Learn the basics of sending SMS campaigns",
    },
    {
      title: "WhatsApp Business API Setup",
      videoId: "t1zaDwbPmyo",
      duration: "8 min",
      category: "Integration",
      description: "Connect your WhatsApp Business account",
    },
    {
      title: "OTP Verification Implementation",
      videoId: "t1zaDwbPmyo",
      duration: "12 min",
      category: "Developer",
      description: "Secure your app with OTP verification",
    },
    {
      title: "Managing Campaigns",
      videoId: "t1zaDwbPmyo",
      duration: "6 min",
      category: "Beginner",
      description: "Create and manage messaging campaigns",
    },
    {
      title: "Webhook Configuration",
      videoId: "t1zaDwbPmyo",
      duration: "10 min",
      category: "Developer",
      description: "Set up webhooks for real-time events",
    },
    {
      title: "Analytics Dashboard Overview",
      videoId: "t1zaDwbPmyo",
      duration: "4 min",
      category: "Beginner",
      description: "Understand your messaging metrics",
    },
  ];

  const qaSessions = [
    {
      title: "Weekly Developer Q&A",
      day: "Every Wednesday",
      time: "3:00 PM EAT",
      description: "Live Q&A session for developers integrating Briq APIs",
      type: "live",
    },
    {
      title: "Getting Started Office Hours",
      day: "Every Monday",
      time: "10:00 AM EAT",
      description: "Perfect for new users - ask anything about the platform",
      type: "live",
    },
    {
      title: "Advanced Integration Session",
      day: "First Friday of Month",
      time: "2:00 PM EAT",
      description: "Deep dive sessions on complex use cases and best practices",
      type: "monthly",
    },
  ];

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
                className="bg-[#0a0a0f] border border-gray-800 rounded-2xl p-6 hover:border-[#fddf0d]/30 transition-all group"
              >
                <div className="w-12 h-12 bg-gradient-to-br from-[#00333e]/30 to-[#fddf0d]/20 rounded-xl flex items-center justify-center mb-4">
                  <resource.icon className="w-6 h-6 text-[#fddf0d]" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2 flex items-center">
                  {resource.title}
                  {resource.external && (
                    <ExternalLink className="w-4 h-4 ml-2 opacity-0 group-hover:opacity-100 transition-opacity text-gray-500" />
                  )}
                </h3>
                <p className="text-gray-400 text-sm">{resource.description}</p>
              </motion.a>
            ))}
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

      {/* Video Tutorials Grid */}
      <section className="py-20 bg-[#111118]">
        <div className="container mx-auto px-6 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeIn}
            className="text-center mb-12"
          >
            <p className="text-[#fddf0d] font-semibold text-sm tracking-wide uppercase mb-4">
              Video Tutorials
            </p>
            <h2 className="text-3xl font-bold text-white mb-4">
              Step-by-Step Guides
            </h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              Watch comprehensive tutorials covering every aspect of the Briq platform
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tutorials.map((tutorial, i) => (
              <motion.a
                key={i}
                href={`https://www.youtube.com/watch?v=${tutorial.videoId}`}
                target="_blank"
                rel="noopener noreferrer"
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeIn}
                className="bg-[#0a0a0f] border border-gray-800 rounded-2xl overflow-hidden hover:border-[#fddf0d]/30 transition-all group"
              >
                <div className="aspect-video bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center relative">
                  <div className="w-12 h-12 bg-[#fddf0d] rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Play className="w-4 h-4 text-black ml-0.5" />
                  </div>
                  <div className="absolute bottom-3 right-3 bg-black/80 text-white text-xs px-2 py-1 rounded flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {tutorial.duration}
                  </div>
                  <div className="absolute top-3 left-3">
                    <span className="text-xs font-medium text-gray-300 bg-gray-800/80 px-2 py-1 rounded">
                      {tutorial.category}
                    </span>
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-white mb-1 group-hover:text-[#fddf0d] transition-colors text-sm">
                    {tutorial.title}
                  </h3>
                  <p className="text-xs text-gray-400">{tutorial.description}</p>
                </div>
              </motion.a>
            ))}
          </div>

          <div className="text-center mt-10">
            <a
              href="https://www.youtube.com/@karibubriq/videos"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center text-[#fddf0d] font-semibold hover:text-[#fddf0d]/80 transition-colors"
            >
              View all tutorials on YouTube
              <ArrowRight className="w-4 h-4 ml-2" />
            </a>
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
            <p className="text-[#fddf0d] font-semibold text-sm tracking-wide uppercase mb-4">
              Live Q&A
            </p>
            <h2 className="text-3xl font-bold text-white mb-4">
              Ask Questions, Get Answers
            </h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              Join our live sessions to get your questions answered by the Briq team
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {qaSessions.map((session, i) => (
              <motion.div
                key={i}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeIn}
                className="bg-[#0a0a0f] border border-gray-800 rounded-2xl p-6 hover:border-[#fddf0d]/30 transition-all"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-[#00333e]/30 to-[#fddf0d]/20 rounded-xl flex items-center justify-center">
                    <MessageCircle className="w-6 h-6 text-[#fddf0d]" />
                  </div>
                  {session.type === "live" && (
                    <span className="flex items-center gap-1 text-xs font-medium text-emerald-400 bg-emerald-400/10 px-2 py-1 rounded">
                      <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse"></span>
                      Weekly
                    </span>
                  )}
                  {session.type === "monthly" && (
                    <span className="text-xs font-medium text-[#fddf0d] bg-[#fddf0d]/10 px-2 py-1 rounded">
                      Monthly
                    </span>
                  )}
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">
                  {session.title}
                </h3>
                <p className="text-sm text-gray-400 mb-4">
                  {session.description}
                </p>
                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {session.day}
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {session.time}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="text-center mt-10">
            <a
              href="https://www.youtube.com/@karibubriq"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center bg-[#fddf0d]/10 text-[#fddf0d] px-6 py-3 rounded-lg font-semibold hover:bg-[#fddf0d]/20 transition-colors"
            >
              <Users className="w-5 h-5 mr-2" />
              Subscribe for Session Reminders
            </a>
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
