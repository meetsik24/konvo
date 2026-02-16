import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Calendar } from "lucide-react";
import Navbar from "../components/Navbar";
import { Footer } from "../components/Footer";

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

interface BlogPost {
  id: number;
  title: { rendered: string };
  excerpt: { rendered: string };
  date: string;
  link: string;
  _embedded?: {
    "wp:featuredmedia"?: Array<{ source_url: string }>;
  };
}

function Blog() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await fetch(
          "https://briq.tz/wp-json/wp/v2/posts?_embed&per_page=9"
        );
        const data = await response.json();
        setPosts(data);
      } catch (error) {
        console.error("Error fetching posts:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchPosts();
  }, []);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const stripHtml = (html: string) => {
    const div = document.createElement("div");
    div.innerHTML = html;
    return div.textContent || div.innerText || "";
  };

  return (
    <div className="bg-[#0a0a0f] text-white">
      <Navbar />

      {/* Hero */}
      <section className="pt-32 pb-16 relative overflow-hidden border-b border-gray-800">
        {/* Grid background */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:64px_64px]"></div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl"></div>

        <div className="container mx-auto px-6 lg:px-8 relative z-10">
          <div className="max-w-3xl">
            <motion.div initial="hidden" animate="visible" variants={fadeIn}>
              <p className="text-emerald-400 font-semibold text-sm tracking-wide uppercase mb-4">
                Blog
              </p>
              <h1 className="text-4xl lg:text-5xl font-bold leading-tight mb-6">
                Insights &
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400"> Updates</span>
              </h1>
              <p className="text-xl text-gray-400 leading-relaxed">
                News, tutorials, and insights about communication technology 
                and building better customer experiences.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Posts Grid */}
      <section className="py-20">
        <div className="container mx-auto px-6 lg:px-8">
          {loading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="animate-pulse">
                  <div className="bg-gray-800 rounded-xl h-48 mb-4"></div>
                  <div className="bg-gray-800 h-4 rounded w-1/4 mb-3"></div>
                  <div className="bg-gray-800 h-6 rounded mb-2"></div>
                  <div className="bg-gray-800 h-4 rounded w-3/4"></div>
                </div>
              ))}
            </div>
          ) : posts.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {posts.map((post, i) => (
                <motion.a
                  key={post.id}
                  href={post.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  variants={fadeIn}
                  transition={{ delay: i * 0.1 }}
                  className="group bg-[#111118] border border-gray-800 rounded-2xl overflow-hidden hover:border-emerald-500/30 transition-all"
                >
                  <div className="h-48 overflow-hidden">
                    {post._embedded?.["wp:featuredmedia"]?.[0]?.source_url ? (
                      <img
                        src={post._embedded["wp:featuredmedia"][0].source_url}
                        alt={post.title.rendered}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center">
                        <span className="text-gray-600 text-sm">No image</span>
                      </div>
                    )}
                  </div>
                  <div className="p-6">
                    <div className="flex items-center text-sm text-gray-500 mb-3">
                      <Calendar className="w-4 h-4 mr-2" />
                      {formatDate(post.date)}
                    </div>
                    <h2 className="text-lg font-semibold text-white mb-2 group-hover:text-emerald-400 transition-colors">
                      {post.title.rendered}
                    </h2>
                    <p className="text-gray-400 text-sm line-clamp-2">
                      {stripHtml(post.excerpt.rendered).substring(0, 120)}...
                    </p>
                  </div>
                </motion.a>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <p className="text-gray-500">No posts found.</p>
            </div>
          )}

          {posts.length > 0 && (
            <div className="mt-12 text-center">
              <a
                href="https://briq.tz/blog"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center text-emerald-400 font-semibold hover:text-emerald-300 transition-colors"
              >
                View all posts
                <ArrowRight className="w-4 h-4 ml-2" />
              </a>
            </div>
          )}
        </div>
      </section>

      {/* Newsletter CTA */}
      <section className="py-20 bg-[#111118]">
        <div className="container mx-auto px-6 lg:px-8 text-center">
          <h2 className="text-2xl font-bold text-white mb-4">
            Stay updated
          </h2>
          <p className="text-gray-400 mb-8 max-w-xl mx-auto">
            Get the latest news and updates delivered to your inbox.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center max-w-md mx-auto">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 px-4 py-3 bg-[#0a0a0f] border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
            />
            <button className="bg-gradient-to-r from-emerald-500 to-cyan-500 text-black px-6 py-3 rounded-xl font-semibold hover:opacity-90 transition-opacity">
              Subscribe
            </button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

export default Blog;
