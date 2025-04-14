import React from 'react';
import { motion } from 'framer-motion';
import Navbar from '../components/Navbar';
import { Footer } from '../components/Footer'; // Import Footer

const Privacy = () => {
  // Animation variants for sections
  const sectionVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: 'easeOut' } },
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#1a3c47] text-white font-exo">
      {/* Navbar */}
      <Navbar />

      {/* Header Section */}
      <section className="bg-[#00333e] text-white py-20 relative overflow-hidden">
        {/* Animated Texture Background */}
        <div className="absolute inset-0 z-0 opacity-30">
          <div className="absolute inset-0 tech-circuit-bg animate-circuit-move" />
          <div className="absolute inset-0 particle-bg animate-particle-move" />
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: 'easeOut' }}
            className="text-center"
          >
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Privacy{' '}
              <span className="text-[#fddf0d] [text-shadow:_0_0_10px_rgba(253,223,13,0.3)]">
                Policy
              </span>
            </h1>
            <p className="text-[#6f888c] text-base md:text-lg max-w-2xl mx-auto">
              At Briq, we are committed to protecting your privacy. This Privacy Policy explains how we collect, use, and safeguard your information when you use our services.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Content Section */}
      <section className="flex-grow py-16">
        <div className="container mx-auto px-4">
          <div className="bg-white/90 backdrop-blur-md rounded-xl shadow-lg p-10 max-w-5xl mx-auto space-y-12">
            <motion.section
              variants={sectionVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            >
              <h2 className="text-2xl font-bold text-[#00333e] mb-6 sticky top-0 bg-white/95 py-4 z-10 -mx-10 px-10 shadow-sm">
                1. Information We Collect
              </h2>
              <p className="text-gray-700 leading-relaxed">
                We may collect the following types of information when you use Briq's services:
              </p>
              <ul className="list-disc list-inside text-gray-700 mt-4 space-y-3">
                <li>
                  <strong>Personal Information:</strong> Name, email address, phone number, and payment information when you create an account or make a payment.
                </li>
                <li>
                  <strong>Usage Data:</strong> Information about how you use our services, such as the messages you send, API calls, and interaction logs.
                </li>
                <li>
                  <strong>Technical Data:</strong> IP address, browser type, device information, and operating system.
                </li>
              </ul>
            </motion.section>

            <motion.section
              variants={sectionVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            >
              <h2 className="text-2xl font-bold text-[#00333e] mb-6 sticky top-0 bg-white/95 py-4 z-10 -mx-10 px-10 shadow-sm">
                2. How We Use Your Information
              </h2>
              <p className="text-gray-700 leading-relaxed">
                We use the information we collect to:
              </p>
              <ul className="list-disc list-inside text-gray-700 mt-4 space-y-3">
                <li>Provide and improve our services, such as sending Bulk SMS or generating OTPs.</li>
                <li>Process payments and manage your account.</li>
                <li>Communicate with you, including sending service-related notifications.</li>
                <li>Analyze usage patterns to enhance user experience and develop new features.</li>
                <li>Comply with legal obligations and protect against fraudulent activities.</li>
              </ul>
            </motion.section>

            <motion.section
              variants={sectionVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            >
              <h2 className="text-2xl font-bold text-[#00333e] mb-6 sticky top-0 bg-white/95 py-4 z-10 -mx-10 px-10 shadow-sm">
                3. How We Share Your Information
              </h2>
              <p className="text-gray-700 leading-relaxed">
                We do not sell or rent your personal information. We may share your information with:
              </p>
              <ul className="list-disc list-inside text-gray-700 mt-4 space-y-3">
                <li>
                  <strong>Service Providers:</strong> Third parties that assist us in delivering our services, such as payment processors and SMS gateways.
                </li>
                <li>
                  <strong>Legal Authorities:</strong> When required by law or to protect our rights, safety, or property.
                </li>
              </ul>
            </motion.section>

            <motion.section
              variants={sectionVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            >
              <h2 className="text-2xl font-bold text-[#00333e] mb-6 sticky top-0 bg-white/95 py-4 z-10 -mx-10 px-10 shadow-sm">
                4. Data Security
              </h2>
              <p className="text-gray-700 leading-relaxed">
                We implement industry-standard security measures to protect your information, including encryption and secure API key management. However, no method of transmission over the internet is 100% secure, and we cannot guarantee absolute security.
              </p>
            </motion.section>

            <motion.section
              variants={sectionVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            >
              <h2 className="text-2xl font-bold text-[#00333e] mb-6 sticky top-0 bg-white/95 py-4 z-10 -mx-10 px-10 shadow-sm">
                5. Your Rights
              </h2>
              <p className="text-gray-700 leading-relaxed">
                You have the right to:
              </p>
              <ul className="list-disc list-inside text-gray-700 mt-4 space-y-3">
                <li>Access, update, or delete your personal information by contacting us.</li>
                <li>Opt out of marketing communications.</li>
                <li>Request information about how your data is being used.</li>
              </ul>
            </motion.section>

            <motion.section
              variants={sectionVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            >
              <h2 className="text-2xl font-bold text-[#00333e] mb-6 sticky top-0 bg-white/95 py-4 z-10 -mx-10 px-10 shadow-sm">
                6. Cookies and Tracking
              </h2>
              <p className="text-gray-700 leading-relaxed">
                We use cookies and similar technologies to improve your experience on our website, analyze usage, and deliver personalized content. You can manage your cookie preferences through your browser settings.
              </p>
            </motion.section>

            <motion.section
              variants={sectionVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            >
              <h2 className="text-2xl font-bold text-[#00333e] mb-6 sticky top-0 bg-white/95 py-4 z-10 -mx-10 px-10 shadow-sm">
                7. Third-Party Links
              </h2>
              <p className="text-gray-700 leading-relaxed">
                Our services may contain links to third-party websites. We are not responsible for the privacy practices or content of these websites. We encourage you to review their privacy policies.
              </p>
            </motion.section>

            <motion.section
              variants={sectionVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            >
              <h2 className="text-2xl font-bold text-[#00333e] mb-6 sticky top-0 bg-white/95 py-4 z-10 -mx-10 px-10 shadow-sm">
                8. Changes to This Privacy Policy
              </h2>
              <p className="text-gray-700 leading-relaxed">
                We may update this Privacy Policy from time to time. We will notify you of changes by posting the updated policy on our website. Your continued use of the services after such changes constitutes your acceptance of the new policy.
              </p>
            </motion.section>

            <motion.section
              variants={sectionVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            >
              <h2 className="text-2xl font-bold text-[#00333e] mb-6 sticky top-0 bg-white/95 py-4 z-10 -mx-10 px-10 shadow-sm">
                9. Contact Us
              </h2>
              <p className="text-gray-700 leading-relaxed">
                If you have any questions about this Privacy Policy, please contact us at{' '}
                <a href="mailto:sms@briq.tz" className="text-[#fddf0d] hover:underline">
                  sms@briq.tz
                </a>.
              </p>
            </motion.section>
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default Privacy;