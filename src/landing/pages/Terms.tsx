import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

function Terms() {
  return (
    <div className="bg-[#001f29] text-white">
      <Navbar />

      <section className="pt-32 pb-20">
        <div className="container mx-auto px-6 lg:px-8">
          <div className="max-w-3xl mx-auto">
            <p className="text-sm text-gray-500 mb-4">Last updated: January 2026</p>
            <h1 className="text-4xl font-bold text-white mb-8">
              Terms of Service
            </h1>

            <div className="prose prose-invert max-w-none">
              <p className="text-lg text-gray-400 mb-8">
                By accessing or using Briq services, you agree to be bound by these 
                Terms of Service. Please read them carefully.
              </p>

              <h2 className="text-xl font-bold text-white mt-12 mb-4">
                1. Acceptance of Terms
              </h2>
              <p className="text-gray-400 mb-6">
                By creating an account or using any Briq services, APIs, or portals, 
                you agree to these Terms of Service and our Privacy Policy. If you 
                do not agree, you may not use our services.
              </p>

              <h2 className="text-xl font-bold text-white mt-12 mb-4">
                2. Description of Services
              </h2>
              <p className="text-gray-400 mb-6">
                Briq provides communication platform services including SMS messaging, 
                WhatsApp Business API, voice services, OTP verification, and AI chatbot 
                solutions. Services are provided "as is" and may be modified at any time.
              </p>

              <h2 className="text-xl font-bold text-white mt-12 mb-4">
                3. Account Responsibilities
              </h2>
              <p className="text-gray-400 mb-4">You are responsible for:</p>
              <ul className="list-disc pl-6 text-gray-400 mb-6 space-y-2">
                <li>Maintaining the confidentiality of your account credentials</li>
                <li>All activities that occur under your account</li>
                <li>Ensuring your contact information is accurate and up to date</li>
                <li>Complying with all applicable laws and regulations</li>
              </ul>

              <h2 className="text-xl font-bold text-white mt-12 mb-4">
                4. Acceptable Use
              </h2>
              <p className="text-gray-400 mb-4">You agree not to use our services to:</p>
              <ul className="list-disc pl-6 text-gray-400 mb-6 space-y-2">
                <li>Send spam, unsolicited messages, or messages without proper consent</li>
                <li>Transmit illegal, harmful, or offensive content</li>
                <li>Violate any applicable laws or regulations</li>
                <li>Infringe on the rights of others</li>
                <li>Interfere with the operation of our services</li>
              </ul>

              <h2 className="text-xl font-bold text-white mt-12 mb-4">
                5. Payment Terms
              </h2>
              <p className="text-gray-400 mb-6">
                Services are billed on a pay-as-you-go basis unless otherwise agreed. 
                You agree to pay all fees associated with your use of the services. 
                Payments are non-refundable except as required by law.
              </p>

              <h2 className="text-xl font-bold text-white mt-12 mb-4">
                6. Service Level Agreement
              </h2>
              <p className="text-gray-400 mb-6">
                Enterprise customers may be eligible for service level agreements 
                (SLAs) with uptime guarantees. Standard accounts are subject to our 
                best-effort delivery policies.
              </p>

              <h2 className="text-xl font-bold text-white mt-12 mb-4">
                7. Limitation of Liability
              </h2>
              <p className="text-gray-400 mb-6">
                To the maximum extent permitted by law, Briq shall not be liable for 
                any indirect, incidental, special, consequential, or punitive damages, 
                including loss of profits, data, or business opportunities.
              </p>

              <h2 className="text-xl font-bold text-white mt-12 mb-4">
                8. Termination
              </h2>
              <p className="text-gray-400 mb-6">
                Either party may terminate this agreement at any time. Upon termination, 
                your access to services will be discontinued, and any remaining account 
                balance may be forfeited.
              </p>

              <h2 className="text-xl font-bold text-white mt-12 mb-4">
                9. Changes to Terms
              </h2>
              <p className="text-gray-400 mb-6">
                We may modify these terms at any time. Continued use of our services 
                after changes constitutes acceptance of the modified terms.
              </p>

              <h2 className="text-xl font-bold text-white mt-12 mb-4">
                10. Contact
              </h2>
              <p className="text-gray-400 mb-6">
                Questions about these terms? Contact us at{" "}
                <a href="mailto:legal@briq.tz" className="text-[#fddf0d] hover:underline">
                  legal@briq.tz
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

export default Terms;
