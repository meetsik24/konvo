import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

function Privacy() {
  return (
    <div className="bg-[#001f29] text-white">
      <Navbar />

      <section className="pt-32 pb-20">
        <div className="container mx-auto px-6 lg:px-8">
          <div className="max-w-3xl mx-auto">
            <p className="text-sm text-gray-500 mb-4">Last updated: January 2026</p>
            <h1 className="text-4xl font-bold text-white mb-8">
              Privacy Policy
            </h1>

            <div className="prose prose-invert max-w-none">
              <p className="text-lg text-gray-400 mb-8">
                At Briq, we take your privacy seriously. This policy describes how we 
                collect, use, and protect your personal information.
              </p>

              <h2 className="text-xl font-bold text-white mt-12 mb-4">
                1. Information We Collect
              </h2>
              <p className="text-gray-400 mb-4">We collect information that you provide directly to us:</p>
              <ul className="list-disc pl-6 text-gray-400 mb-6 space-y-2">
                <li>Account information (name, email, phone number, company)</li>
                <li>Billing and payment information</li>
                <li>Communication content sent through our platform</li>
                <li>Usage data and analytics</li>
                <li>Technical information (IP addresses, device information)</li>
              </ul>

              <h2 className="text-xl font-bold text-white mt-12 mb-4">
                2. How We Use Your Information
              </h2>
              <p className="text-gray-400 mb-4">We use collected information to:</p>
              <ul className="list-disc pl-6 text-gray-400 mb-6 space-y-2">
                <li>Provide and maintain our services</li>
                <li>Process transactions and send related information</li>
                <li>Send technical notices and support messages</li>
                <li>Respond to your comments and questions</li>
                <li>Analyze usage to improve our services</li>
                <li>Detect, prevent, and address fraud and abuse</li>
              </ul>

              <h2 className="text-xl font-bold text-white mt-12 mb-4">
                3. Data Storage and Security
              </h2>
              <p className="text-gray-400 mb-6">
                We implement appropriate technical and organizational measures to protect 
                your personal information. Data is stored on secure servers with encryption 
                at rest and in transit. We maintain SOC 2 Type II compliance.
              </p>

              <h2 className="text-xl font-bold text-white mt-12 mb-4">
                4. Data Retention
              </h2>
              <p className="text-gray-400 mb-6">
                We retain your personal information for as long as your account is active 
                or as needed to provide services. Message content is retained for 30 days 
                for delivery and support purposes, then automatically deleted.
              </p>

              <h2 className="text-xl font-bold text-white mt-12 mb-4">
                5. Information Sharing
              </h2>
              <p className="text-gray-400 mb-4">
                We do not sell your personal information. We may share information with:
              </p>
              <ul className="list-disc pl-6 text-gray-400 mb-6 space-y-2">
                <li>Service providers who assist in our operations</li>
                <li>Telecommunications carriers for message delivery</li>
                <li>Legal authorities when required by law</li>
              </ul>

              <h2 className="text-xl font-bold text-white mt-12 mb-4">
                6. Your Rights
              </h2>
              <p className="text-gray-400 mb-4">You have the right to:</p>
              <ul className="list-disc pl-6 text-gray-400 mb-6 space-y-2">
                <li>Access your personal data</li>
                <li>Correct inaccurate data</li>
                <li>Request deletion of your data</li>
                <li>Export your data</li>
                <li>Withdraw consent where applicable</li>
              </ul>

              <h2 className="text-xl font-bold text-white mt-12 mb-4">
                7. Cookies and Tracking
              </h2>
              <p className="text-gray-400 mb-6">
                We use cookies and similar technologies to improve your experience, 
                understand usage patterns, and deliver relevant content. You can control 
                cookies through your browser settings.
              </p>

              <h2 className="text-xl font-bold text-white mt-12 mb-4">
                8. Changes to This Policy
              </h2>
              <p className="text-gray-400 mb-6">
                We may update this policy from time to time. We will notify you of 
                significant changes by email or through our platform.
              </p>

              <h2 className="text-xl font-bold text-white mt-12 mb-4">
                9. Contact Us
              </h2>
              <p className="text-gray-400 mb-6">
                For privacy-related questions, contact our Data Protection Officer at{" "}
                <a href="mailto:privacy@briq.tz" className="text-[#fddf0d] hover:underline">
                  privacy@briq.tz
                </a>
              </p>
            </div>

            <div className="mt-12 pt-8 border-t border-gray-800">
              <Link
                to="/"
                className="text-[#fddf0d] font-medium hover:text-[#fddf0d]/80 transition-colors"
              >
                ← Back to Home
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

export default Privacy;
