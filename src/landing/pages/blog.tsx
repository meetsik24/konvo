import { useState, useEffect } from "react";
import { BookOpen } from "lucide-react";
import axios from "axios";

function BlogSection() {
  const [isLoading, setIsLoading] = useState(true); // Loading state
  interface Post {
    id: number;
    title: { rendered: string };
    excerpt: { rendered: string };
    content: { rendered: string };
    link: string;
    featured_media?: number;
    _embedded?: {
      "wp:featuredmedia"?: Array<{ source_url: string }>;
    };
  }

  const [posts, setPosts] = useState<Post[]>([]); // Store WordPress posts
  const [error, setError] = useState<string | null>(null); // Error state

  // Fetch WordPress posts
  const fetchPosts = async () => {
    try {
      const response = await axios.get(
        "https://blog.briq.tz/wp-json/wp/v2/posts?per_page=3&_embed"
      );
      setPosts(response.data);
      setIsLoading(false);
    } catch (err) {
      setError("Failed to load blog posts");
      setIsLoading(false);
    }
  };

  // Fetch posts on mount and poll every 60 seconds
  useEffect(() => {
    fetchPosts();
    const interval = setInterval(fetchPosts, 60000);
    return () => clearInterval(interval);
  }, []);

  // Generate summary (truncate excerpt or content to ~50-100 words)
  const generateSummary = (post: Post) => {
    const rawText = post.excerpt.rendered || post.content.rendered;
    const div = document.createElement("div");
    div.innerHTML = rawText;
    const text = div.textContent || div.innerText || "";
    const words = text.split(/\s+/).filter(Boolean);
    const truncated = words.slice(0, 55).join(" ");
    return truncated.length < text.length ? `${truncated}...` : truncated;
  };

  // Skeleton Component
  const BlogPostSkeleton = () => (
    <div className="bg-white p-6 rounded-lg shadow-lg animate-pulse">
      <div
        className="w-full h-48 bg-gray-200 rounded-lg mb-4 overflow-hidden"
      ></div>
      <div className="flex items-center gap-2 mb-4">
        <div className="w-6 h-6 bg-gray-200 rounded-full"></div>
        <div className="h-6 bg-gray-200 rounded w-3/4"></div>
      </div>
      <div className="space-y-2 mb-4">
        <div className="h-4 bg-gray-200 rounded w-full"></div>
        <div className="h-4 bg-gray-200 rounded w-5/6"></div>
        <div className="h-4 bg-gray-200 rounded w-4/5"></div>
      </div>
      <div className="h-10 bg-gray-200 rounded-lg w-full"></div>
    </div>
  );

  return (
    <section className="py-16 bg-white text-[#00333e]">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900">
            Latest Blog Posts
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Explore our insights on communication tools, APIs, and more.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {isLoading ? (
            <>
              <BlogPostSkeleton />
              <BlogPostSkeleton />
              <BlogPostSkeleton />
            </>
          ) : error ? (
            <div className="col-span-full text-center text-red-500">{error}</div>
          ) : posts.length === 0 ? (
            <div className="col-span-full text-center text-gray-600">
              No posts available
            </div>
          ) : (
            posts.map((post, index) => (
              <div
                key={post.id}
                className="bg-white p-6 rounded-lg shadow-lg"
              >
                <div className="w-full h-48 overflow-hidden rounded-lg mb-4">
                  <img
                    src={
                      post.featured_media &&
                      post._embedded?.["wp:featuredmedia"]?.[0]?.source_url
                        ? post._embedded["wp:featuredmedia"][0].source_url
                        : `https://via.placeholder.com/400x500?text=Blog+${index + 1}`
                    }
                    alt={post.title.rendered}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                </div>
                <div className="flex items-center gap-2 mb-4">
                  <BookOpen className="w-6 h-6 text-[#00333e]" />
                  <h3 className="text-xl font-bold text-gray-900">
                    {post.title.rendered}
                  </h3>
                </div>
                <p className="text-gray-600 mb-4 text-justify">
                  {generateSummary(post)}
                </p>
                <a
                  href={post.link}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <button className="bg-[#00333e] text-white px-6 py-2 rounded-lg mt-4 hover:bg-[#00333e]/80 transition-all duration-300 w-full">
                    Read More
                  </button>
                </a>
              </div>
            ))
          )}
        </div>
      </div>
    </section>
  );
}

export default BlogSection;