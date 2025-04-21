import { useState, useEffect, useRef } from "react";
import { BookOpen, Play, X } from "lucide-react";
import bg from "../../../assets/bg.png";
import thumbnailBlog1 from "../../../assets/thumb1.jpg";
import thumbnailBlog2 from "../../../assets/thumb2.jpeg";
import thumbnailBlog3 from "../../../assets/thumb3.jpeg";
import kifurushiFlyer from "../../../assets/Furushi Kibompa Flyer A4.pdf";

function LearnWithBriq() {
  const [isBlogOpen, setIsBlogOpen] = useState(null); // Track which blog post is open
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(true); // Simulate loading state for blog posts
  const videoSectionRef = useRef(null);

  const openBlog = (blogId) => setIsBlogOpen(blogId);
  const closeBlog = () => setIsBlogOpen(null);

  const playVideo = () => {
    setIsVideoPlaying(true);
  };

  // Simulate loading delay for blog posts (replace with actual data fetching logic if needed)
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2000); // 2-second delay to simulate loading
    return () => clearTimeout(timer);
  }, []);

  // Auto-play video and load iframe when the section comes into view
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setIsVideoPlaying(true);
          observer.disconnect(); // Stop observing after loading/playing
        }
      },
      { threshold: 0.5 } // Trigger when 50% of the section is visible
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

  // Skeleton Component for Blog Post Cards
  const BlogPostSkeleton = () => (
    <div className="bg-white p-6 rounded-lg shadow-lg animate-pulse">
      {/* Image Placeholder */}
      <div
        className="w-full bg-gray-200 rounded-lg mb-4"
        style={{ aspectRatio: "4/5" }}
      ></div>
      {/* Title Placeholder */}
      <div className="flex items-center gap-2 mb-4">
        <div className="w-6 h-6 bg-gray-200 rounded-full"></div>
        <div className="h-6 bg-gray-200 rounded w-3/4"></div>
      </div>
      {/* Description Placeholder */}
      <div className="space-y-2 mb-4">
        <div className="h-4 bg-gray-200 rounded w-full"></div>
        <div className="h-4 bg-gray-200 rounded w-5/6"></div>
      </div>
      {/* Button Placeholder */}
      <div className="h-10 bg-gray-200 rounded-lg w-full"></div>
    </div>
  );

  // Blog Post 2: KARIBU APIs
  const blogPost2Content = `
    <div class="flex flex-col md:flex-row h-full">
      <div class="md:w-1/2 p-6 flex-shrink-0">
        <img src="${thumbnailBlog2}" alt="Blog Image 2" class="w-full h-auto rounded-lg shadow-md" style="aspect-ratio: 4/5;" loading="lazy" />
      </div>
      <div class="md:w-1/2 p-6 bg-gray-50 overflow-y-auto">
        <h2 class="text-3xl font-bold mb-4 text-[#00333e] transition-all duration-300">Unlock Seamless Communication with KARIBU APIs</h2>
        <p class="text-gray-600 text-sm mb-4 italic">Empowering Developers to Integrate SMS, OTP, and Transactions</p>
        <p class="text-gray-700 mb-4 leading-relaxed">
          The KARIBU APIs by Briq are a game-changer for developers looking to integrate robust communication features into their systems. Whether you're sending SMS, OTPs, or transactional messages, KARIBU APIs make it simple and efficient to connect with your users directly from your application.
        </p>
        <h3 class="text-xl font-semibold mb-3 text-[#00333e]">Why KARIBU APIs?</h3>
        <p class="text-gray-700 mb-4 leading-relaxed">
          With KARIBU APIs, developers can manage workspaces, campaigns, and messages seamlessly. The API supports instant messaging, campaign scheduling, and detailed message logging, all through a straightforward integration process. It’s designed to be developer-friendly, allowing you to focus on building great features while we handle the communication infrastructure.
        </p>
        <h3 class="text-xl font-semibold mb-3 text-[#00333e]">Key Features</h3>
        <ul class="text-gray-700 mb-4 leading-relaxed list-disc list-inside">
          <li><strong>Send SMS, OTP, and Transactional Messages:</strong> Use endpoints like <code>/v1/message/send-instant</code> and <code>/v1/message/send-campaign</code> to send messages instantly or schedule campaigns.</li>
          <li><strong>Workspace Management:</strong> Create and manage workspaces with endpoints like <code>/v1/workspace/create/</code> and <code>/v1/workspace/all/</code>.</li>
          <li><strong>Campaign Tools:</strong> Organize your outreach with campaign creation and updates via <code>/v1/campaign/create/</code> and <code>/v1/campaign/update/{campaign_id}</code>.</li>
          <li><strong>Message Tracking:</strong> Access logs and history with <code>/v1/message/logs</code> and <code>/v1/message/history</code>.</li>
        </ul>
        <h3 class="text-xl font-semibold mb-3 text-[#00333e]">Getting Started</h3>
        <p class="text-gray-700 mb-4 leading-relaxed">
          To start using KARIBU APIs, generate your API key from the dashboard under the API KEY SECTION. Include the key in your request headers as follows:
        </p>
        <pre class="bg-gray-100 p-4 rounded-md text-sm mb-4 font-mono text-gray-800">
X-API-Key: "your_api_key"
        </pre>
        <p class="text-gray-700 mb-4 leading-relaxed">
          The base URL for all requests is <code>https://karibu.briq.tz/</code>, and all endpoints are versioned under <code>/v1/</code>. Here’s an example of creating a workspace:
        </p>
        <pre class="bg-gray-100 p-4 rounded-md text-sm mb-4 font-mono text-gray-800">
POST /v1/workspace/create/
Request Payload:
{
  "name": "Workspace Name",
  "description": "Optional description"
}
Response:
{
  "success": true,
  "workspace_id": "workspace-uuid",
  "name": "Workspace Name",
  "description": "Optional description"
}
        </pre>
        <a href="https://briq.tz/documentation/home" target="_blank" rel="noopener noreferrer">
          <button class="bg-[#00333e] text-white px-6 py-2 rounded-lg mt-4 hover:bg-[#00333e]/80 transition-all duration-300 transform hover:scale-105">
            Explore API Docs
          </button>
        </a>
      </div>
    </div>
  `;

  // Blog Post 3: Kifurushi Kibompa Campaign
  const blogPost3Content = `
    <div class="flex flex-col md:flex-row h-full">
      <div class="md:w-1/2 p-6 flex-shrink-0">
        <img src="${thumbnailBlog3}" alt="Blog Image 3" class="w-full h-auto rounded-lg shadow-md" style="aspect-ratio: 4/5;" loading="lazy" />
      </div>
      <div class="md:w-1/2 p-6 bg-gray-50 overflow-y-auto">
        <h2 class="text-3xl font-bold mb-4 text-[#00333e] transition-all duration-300">Engage Millions with Bulk SMS Campaigns</h2>
        <p class="text-gray-600 text-sm mb-4 italic">Unlock Powerful Bulk SMS Solutions with Briq</p>
        <p class="text-gray-700 mb-4 leading-relaxed">
          Our Bulk SMS campaigns empower you to reach thousands of customers in seconds. With a variety of messaging plans, you can engage your audience effectively, even in areas with limited internet access, while enjoying free Sender IDs, an easy-to-use dashboard, 24/7 support, and instant reporting.
        </p>
        <h3 class="text-xl font-semibold mb-3 text-[#00333e]">Messaging Plans</h3>
        <p class="text-gray-700 mb-4 leading-relaxed">
          Choose a plan that suits your business needs:
        </p>
        <table class="w-full text-left border-collapse mb-4">
          <thead>
            <tr class="bg-gray-200">
              <th class="p-2 text-[#00333e] font-semibold">Plan</th>
              <th class="p-2 text-[#00333e] font-semibold">Messages (Max)</th>
              <th class="p-2 text-[#00333e] font-semibold">Price (TZS)</th>
            </tr>
          </thead>
          <tbody>
            <tr class="border-b">
              <td class="p-2">Starter</td>
              <td class="p-2">5,000</td>
              <td class="p-2">99,999</td>
            </tr>
            <tr class="border-b">
              <td class="p-2">Basic</td>
              <td class="p-2">20,000</td>
              <td class="p-2">399,999</td>
            </tr>
            <tr class="border-b">
              <td class="p-2">Standard</td>
              <td class="p-2">50,000</td>
              <td class="p-2">719,999</td>
            </tr>
            <tr class="border-b">
              <td class="p-2">Premium</td>
              <td class="p-2">100,000</td>
              <td class="p-2">1,399,999</td>
            </tr>
            <tr>
              <td class="p-2">Enterprise</td>
              <td class="p-2">500,000</td>
              <td class="p-2">5,999,999</td>
            </tr>
          </tbody>
        </table>
        <h3 class="text-xl font-semibold mb-3 text-[#00333e]">Why Choose Bulk SMS?</h3>
        <ul class="text-gray-700 mb-4 leading-relaxed list-disc list-inside">
          <li><strong>Easy-to-Use System:</strong> Manage your campaigns effortlessly with our intuitive platform.</li>
          <li><strong>Affordable Pricing:</strong> Plans designed to be budget-friendly for your business.</li>
          <li><strong>Professional Support:</strong> Get expert assistance at every step, 24/7.</li>
        </ul>
        <p class="text-gray-700 mb-4 leading-relaxed">
          Ready to get started? Download the full Bulk SMS flyer for more details.
        </p>
        <a href="${kifurushiFlyer}" download>
          <button class="bg-[#00333e] text-white px-6 py-2 rounded-lg mt-4 hover:bg-[#00333e]/80 transition-all duration-300 transform hover:scale-105">
            Download Flyer
          </button>
        </a>
        <p class="text-gray-700 mt-4 leading-relaxed">
          Contact us at <a href="mailto:sms@briq.tz" class="text-[#00333e] hover:underline transition-all duration-300 hover:text-[#00333e]/80">sms@briq.tz</a> or <a href="tel:+255760487336" class="text-[#00333e] hover:underline transition-all duration-300 hover:text-[#00333e]/80">+255760487336</a> for more information. Visit <a href="https://www.briq.tz" class="text-[#00333e] hover:underline transition-all duration-300 hover:text-[#00333e]/80">www.briq.tz</a> to explore our services.
        </p>
      </div>
    </div>
  `;

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
        <div ref={videoSectionRef} className="flex flex-col md:flex-row items-center gap-8 mb-24 bg-gradient-to-r from-[#00333e] to-[#002a34] text-white p-8 rounded-lg">
          <div className="md:w-1/2">
            <span className="inline-block px-4 py-1 bg-white text-[#00333e] rounded-full text-sm font-medium mb-4">
              🎥 Master Briq with Video Tutorials!
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
            <a href="https://www.youtube.com/@karibubriq/videos" target="_blank" rel="noopener noreferrer">
              <button className="bg-transparent border border-white text-white hover:bg-[#00333e] hover:text-white hover:border-[#00333e] px-6 py-2 rounded-lg">
                Visit Our Channel
              </button>
            </a>
          </div>
          <div className="md:w-1/2 bg-[#fddf0d] p-8 rounded-lg">
            <div className="relative">
              {isVideoPlaying ? (
                <iframe
                  className="w-full"
                  style={{ height: "315px" }}
                  src="https://www.youtube.com/embed/t1zaDwbPmyo?si=_pAq-V5QRMhgvwHJ&autoplay=1"
                  title="YouTube video player"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  referrerPolicy="strict-origin-when-cross-origin"
                  allowFullScreen
                ></iframe>
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

        {/* Blog Posts Section */}
        <div className="mb-24">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900">
              Explore Our{" "}
              <span className="text-[#00333e] bg-white px-2 py-1 rounded shadow-md">
                Blog Posts
              </span>
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Dive into our detailed guides to master Briq’s tools for SMS, APIs, USSD, and more.
            </p>
          </div>

          {/* Blog Posts Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {isLoading ? (
              <>
                <BlogPostSkeleton />
                <BlogPostSkeleton />
                <BlogPostSkeleton />
              </>
            ) : (
              <>
                {/* Substack Blog Post */}
                <a
                  href="https://sikjunior.substack.com/p/why-communication-is-your-most-underrated"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block bg-white p-6 rounded-lg shadow-lg [filter:_drop-shadow(0_0_15px_rgba(0,51,62,0.2))]"
                >
                  <img
                    src={thumbnailBlog1}
                    alt="Substack Blog Thumbnail"
                    className="w-full h-auto rounded-lg mb-4"
                    style={{ aspectRatio: "4/5" }}
                    loading="lazy"
                  />
                  <div className="flex items-center gap-2 mb-4">
                    <BookOpen className="w-6 h-6 text-[#00333e]" />
                    <h3 className="text-xl font-bold text-gray-900">Why Communication Is Your Most Underrated Business Tool</h3>
                  </div>
                  <div
                    className="substack-post-embed"
                    dangerouslySetInnerHTML={{
                      __html: `
                        <p lang="en" class="text-gray-900 text-justify">Why Communication Is Your Most Underrated Business Tool by Sikjunior Mrimi</p>
                        <p class="text-gray-600 text-justify">Exploring how tools like SMS, IVR, and WhatsApp can transform customer engagement and retention.</p>
                        <button class="bg-[#00333e] text-white px-6 py-2 rounded-lg mt-4 hover:bg-[#00333e]/80 transition-all duration-300 transform hover:scale-105 w-full">Read on Substack</button>
                      `,
                    }}
                  />
                  <script async src="https://substack.com/embedjs/embed.js" charSet="utf-8"></script>
                </a>

                {/* Blog Post 2 (KARIBU APIs) */}
                <div className="bg-white p-6 rounded-lg shadow-lg [filter:_drop-shadow(0_0_15px_rgba(0,51,62,0.2))]">
                  <img
                    src={thumbnailBlog2}
                    alt="Blog Thumbnail 2"
                    className="w-full h-auto rounded-lg mb-4"
                    style={{ aspectRatio: "4/5" }}
                    loading="lazy"
                  />
                  <div className="flex items-center gap-2 mb-4">
                    <BookOpen className="w-6 h-6 text-[#00333e]" />
                    <h3 className="text-xl font-bold text-gray-900">Unlock Seamless Communication with KARIBU APIs</h3>
                  </div>
                  <p className="text-gray-600 mb-4 text-justify">
                    Learn how developers can integrate SMS, OTP, and transactional messaging using KARIBU APIs.
                  </p>
                  <button
                    onClick={() => openBlog("blog2")}
                    className="bg-[#00333e] text-white px-6 py-2 rounded-lg mt-4 hover:bg-[#00333e]/80 transition-all duration-300 transform hover:scale-105 w-full"
                  >
                    Read the Blog Post
                  </button>
                </div>

                {/* Blog Post 3 (Kifurushi Kibompa Campaign) */}
                <div className="bg-white p-6 rounded-lg shadow-lg [filter:_drop-shadow(0_0_15px_rgba(0,51,62,0.2))]">
                  <img
                    src={thumbnailBlog3}
                    alt="Blog Thumbnail 3"
                    className="w-full h-auto rounded-lg mb-4"
                    style={{ aspectRatio: "4/5" }}
                    loading="lazy"
                  />
                  <div className="flex items-center gap-2 mb-4">
                    <BookOpen className="w-6 h-6 text-[#00333e]" />
                    <h3 className="text-xl font-bold text-gray-900">Engage Millions with Bulk SMS Campaigns</h3>
                  </div>
                  <p className="text-gray-600 mb-4 text-justify">
                    Discover how to reach thousands of customers with our Bulk SMS campaigns.
                  </p>
                  <button
                    onClick={() => openBlog("blog3")}
                    className="bg-[#00333e] text-white px-6 py-2 rounded-lg mt-4 hover:bg-[#00333e]/80 transition-all duration-300 transform hover:scale-105 w-full"
                  >
                    Read the Blog Post
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Blog Post Popup Modal */}
        {isBlogOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 animate-fadeIn">
            <div className="relative bg-white rounded-lg w-full max-w-4xl max-h-[80vh] flex flex-col md:flex-row shadow-2xl">
              <button
                onClick={closeBlog}
                className="absolute top-4 right-4 text-gray-600 hover:text-[#00333e] z-10 transition-all duration-300 transform hover:scale-110"
              >
                <X className="w-6 h-6" />
              </button>
              <div
                className="prose prose-sm"
                dangerouslySetInnerHTML={{
                  __html: isBlogOpen === "blog2" ? blogPost2Content : blogPost3Content,
                }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Custom Animation Styles */}
     
    </section>
  );
}

export default LearnWithBriq;