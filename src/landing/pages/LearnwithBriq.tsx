import { useState, useEffect, useRef } from "react";
import { Play } from "lucide-react";
import YouTube from "react-youtube";
import bg from "../../../assets/bg.png";

function LearnWithBriq() {
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const videoSectionRef = useRef(null);
  const playerRef = useRef(null);

  const playVideo = () => {
    setIsVideoPlaying(true);
  };

  // Auto-play video when section comes into view
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

  // YouTube player options
  const opts = {
    height: "315",
    width: "100%",
    playerVars: {
      autoplay: isVideoPlaying ? 1 : 0,
      mute: 1, // Mute by default
    },
  };

  // Handle player ready event
  const onReady = (event) => {
    playerRef.current = event.target;
    if (isVideoPlaying) {
      event.target.playVideo();
      event.target.mute(); // Ensure muted on start
    }
  };

  return (
    <section
      className="py-16 bg-white text-[#00333e] relative overflow-hidden font-exo"
      style={{
        backgroundImage: `url(${bg})`,
        backgroundSize: "80%",
        backgroundPosition: "center",
        backgroundRepeat: "repeat",
        backgroundColor: "rgba(255, 255, 255, 0.92)",
        backgroundBlendMode: "overlay",
        opacity: 0.9,
      }}
    >
      <div className="container mx-auto px-4 relative z-10">
        {/* YouTube Tutorials Section */}
        <div
          ref={videoSectionRef}
          className="flex flex-col md:flex-row items-center gap-8 mb-24 bg-gradient-to-r from-[#00333e] to-[#002a34] text-white p-8 rounded-lg"
        >
          <div className="md:w-1/2">
            <span className="inline-block px-4 py-1 bg-white text-[#00333e] rounded-full text-sm font-medium mb-4">
              Master Briq with Video Tutorials!
            </span>
            <h2 className="text-3xl md:text-xl font-bold mb-4 text-white">
              Unlock Briq Secrets with Our{" "}
              <span className="text-[#00333e] bg-[#fddf0d] px-2 py-1 rounded shadow-md">
                YouTube Tutorials!
              </span>
            </h2>
            <p className="text-gray-200 mb-6 max-w-md">
              Learn how to use Briq’s features with our step-by-step video tutorials, covering OTP, WhatsApp marketing, AVR, and more.
            </p>
            <a
              href="https://www.youtube.com/@karibubriq/videos"
              target="_blank"
              rel="noopener noreferrer"
            >
              <button className="bg-transparent border border-white text-white hover:bg-[#00333e] hover:text-white hover:border-[#00333e] px-6 py-2 rounded-lg">
                Visit Our Channel
              </button>
            </a>
          </div>
          <div className="md:w-1/2 bg-[#fddf0d] p-8 rounded-lg">
            <div className="relative">
              {isVideoPlaying ? (
                <YouTube
                  videoId="t1zaDwbPmyo"
                  opts={opts}
                  onReady={onReady}
                  className="w-full rounded-lg"
                  containerClassName="w-full"
                />
              ) : (
                <div
                  className="w-full bg-gray-300 rounded-lg relative cursor-pointer"
                  style={{ height: "315px" }}
                  onClick={playVideo}
                >
                  <Play className="absolute inset-0 m-auto w-12 h-12 text-white opacity-80 hover:opacity-100" />
                </div>
              )}
            </div>
            <a
              href="https://www.youtube.com/@karibubriq/videos"
              target="_blank"
              rel="noopener noreferrer"
            >
              <button className="bg-[#00333e] hover:bg-[#00333e]/80 text-white px-6 py-2 rounded-lg mt-6 w-full">
                Explore All Tutorials
              </button>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

export default LearnWithBriq;