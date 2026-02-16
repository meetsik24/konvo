import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import { Footer } from "../components/Footer";

function Privacy() {
  return (
    <div className="bg-white">
      <Navbar />

      <section className="pt-32 pb-20">
        <div className="container mx-auto px-6 lg:px-8">
          <div className="max-w-3xl mx-auto">
            <p className="text-sm text-gray-500 mb-4">Last updated: January 2026</p>
            <h1 className="text-4xl font-bold text-gray-900 mb-8">
              Privacy Policy
            </h1>

            <div className="prose prose-gray max-w-none">
              <p className="text-lg text-gray-600 mb-8">
                At Briq, we take your privacy seriously. This policy explains how 
                we collect, use, and protect your information.
              </p>

              <h2 className="text-xl font-bold text-gray-900 mt-12 mb-4">
                1. Information We Collect
              </h2>
              <p className="text-gray-600 mb-4">We collect information that you provide directly:</p>
              <ul className="list-disc pl-6 text-gray-600 mb-6 space-y-2">
                <li>Account information (name, email, phone number, company)</li>
                <li>Payment and billing information</li>
                <li>Message content and recipient data you upload</li>
                <li>API usage logs and analytics data</li>
                <li>Support communications</li>
              </ul>

              <h2 className="text-xl font-bold text-gray-900 mt-12 mb-4">
                2. How We Use Information
              </h2>
              <p className="text-gray-600 mb-4">We use collected information to:</p>
              <ul className="list-disc pl-6 text-gray-600 mb-6 space-y-2">
                <li>Provide and improve our services</li>
                <li>Process transactions and send billing information</li>
                <li>Send service updates and technical notices</li>
                <li>Respond to support requests</li>
                <li>Detect and prevent fraud or abuse</li>
                <li>Comply with legal obligations</li>
              </ul>

              <h2 className="text-xl font-bold text-gray-900 mt-12 mb-4">
                3. Data Retention
              </h2>
              <p className="text-gray-600 mb-6">
                We retain your data for as long as your account is active or as needed 
                to provide services. Message logs are retained for 90 days by default. 
                You may request deletion of your data at any time.
              </p>

              <h2 className="text-xl font-bold text-gray-900 mt-12 mb-4">
                4. Data Security
              </h2>
              <p className="text-gray-600 mb-6">
                We implement industry-standard security measures including encryption 
                in transit and at rest, access controls, and regular security audits. 
                Our infrastructure is hosted in secure, SOC 2 compliant data centers.
              </p>

              <h2 className="text-xl font-bold text-gray-900 mt-12 mb-4">
                5. Data Sharing
              </h2>
              <p className="text-gray-600 mb-4">We may share your information with:</p>
              <ul className="list-disc pl-6 text-gray-600 mb-6 space-y-2">
                <li>Service providers who assist in delivering our services</li>
                <li>Mobile network operators for message delivery</li>
                <li>Law enforcement when required by law</li>
              </ul>
              <p className="text-gray-600 mb-6">
                We do not sell your personal information to third parties.
              </p>

              <h2 className="text-xl font-bold text-gray-900 mt-12 mb-4">
                6. Your Rights
              </h2>
              <p className="text-gray-600 mb-4">You have the right to:</p>
              <ul className="list-disc pl-6 text-gray-600 mb-6 space-y-2">
                <li>Access your personal data</li>
                <li>Correct inaccurate data</li>
                <li>Request deletion of your data</li>
                <li>Export your data</li>
                <li>Opt out of marketing communications</li>
              </ul>

              <h2 className="text-xl font-bold text-gray-900 mt-12 mb-4">
                7. Cookies
              </h2>
              <p className="text-gray-600 mb-6">
                We use cookies and similar technologies to maintain sessions, 
                remember preferences, and analyze usage. You can control cookie 
                settings through your browser.
              </p>

              <h2 className="text-xl font-bold text-gray-900 mt-12 mb-4">
                8. Changes to This Policy
              </h2>
              <p className="text-gray-600 mb-6">
                We may update this policy from time to time. We will notify you of 
                material changes via email or through our platform.
              </p>

              <h2 className="text-xl font-bold text-gray-900 mt-12 mb-4">
                9. Contact Us
              </h2>
              <p className="text-gray-600 mb-6">
                For privacy inquiries, contact us at{" "}
                <a href="mailto:privacy@briq.tz" className="text-[#00333e] hover:underline">
                  privacy@briq.tz
                </a>
              </p>
            </div>

            <div className="mt-12 pt-8 border-t border-gray-200">
              <Link
                to="/"
                className="text-[#00333e] font-medium hover:underline"
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
