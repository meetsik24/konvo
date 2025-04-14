import React from 'react';
import { motion } from 'framer-motion';
import Navbar from '../components/Navbar';
import { Footer } from '../components/Footer'; // Import Footer

const Terms = () => {
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
              Terms of{' '}
              <span className="text-[#fddf0d] [text-shadow:_0_0_10px_rgba(253,223,13,0.3)]">
                Service
              </span>
            </h1>
            <p className="text-[#6f888c] text-base md:text-lg max-w-2xl mx-auto">
              Please read these Terms of Service carefully before using Briq's services. By accessing or using our platform, you agree to be bound by these terms.
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
                1. Acceptance of Terms
              </h2>
              <p className="text-gray-700 leading-relaxed">
                By accessing or using Briq's services, including but not limited to Bulk SMS, OTP Authentication, USSD Shortcodes, AI-Powered AVR, WhatsApp OTP & Marketing, Flash & Push Messages, and APIs, you agree to comply with and be bound by these Terms of Service. If you do not agree, please do not use our services.
              </p>
            </motion.section>

            <motion.section
              variants={sectionVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            >
              <h2 className="text-2xl font-bold text-[#00333e] mb-6 sticky top-0 bg-white/95 py-4 z-10 -mx-10 px-10 shadow-sm">
                2. Use of Services
              </h2>
              <p className="text-gray-700 leading-relaxed">
                You agree to use Briq's services only for lawful purposes and in accordance with these Terms. You are responsible for ensuring that your use of the services complies with all applicable laws, regulations, and third-party agreements.
              </p>
              <ul className="list-disc list-inside text-gray-700 mt-4 space-y-3">
                <li>Do not use the services to send spam, fraudulent, or illegal messages.</li>
                <li>Ensure that all recipients of SMS or WhatsApp messages have provided consent to receive communications.</li>
                <li>Do not attempt to gain unauthorized access to Briq's systems or networks.</li>
              </ul>
            </motion.section>

            <motion.section
              variants={sectionVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            >
              <h2 className="text-2xl font-bold text-[#00333e] mb-6 sticky top-0 bg-white/95 py-4 z-10 -mx-10 px-10 shadow-sm">
                3. Account Responsibilities
              </h2>
              <p className="text-gray-700 leading-relaxed">
                You are responsible for maintaining the confidentiality of your account credentials, including API keys. You agree to notify Briq immediately of any unauthorized use of your account or any other breach of security.
              </p>
            </motion.section>

            <motion.section
              variants={sectionVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            >
              <h2 className="text-2xl font-bold text-[#00333e] mb-6 sticky top-0 bg-white/95 py-4 z-10 -mx-10 px-10 shadow-sm">
                4. Pricing and Payments
              </h2>
              <p className="text-gray-700 leading-relaxed">
                Briq charges for services as outlined on our website (e.g., 14-17 TZS per SMS). You agree to pay all fees associated with your use of the services. All payments are non-refundable unless otherwise stated.
              </p>
            </motion.section>

            <motion.section
              variants={sectionVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            >
              <h2 className="text-2xl font-bold text-[#00333e] mb-6 sticky top-0 bg-white/95 py-4 z-10 -mx-10 px-10 shadow-sm">
                5. Termination
              </h2>
              <p className="text-gray-700 leading-relaxed">
                Briq reserves the right to suspend or terminate your access to the services at any time for violation of these Terms or for any other reason at our discretion. Upon termination, your right to use the services will immediately cease.
              </p>
            </motion.section>

            <motion.section
              variants={sectionVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            >
              <h2 className="text-2xl font-bold text-[#00333e] mb-6 sticky top-0 bg-white/95 py-4 z-10 -mx-10 px-10 shadow-sm">
                6. Limitation of Liability
              </h2>
              <p className="text-gray-700 leading-relaxed">
                Briq will not be liable for any indirect, incidental, special, consequential, or punitive damages arising out of your use of the services, including but not limited to loss of profits, data, or business opportunities.
              </p>
            </motion.section>

            <motion.section
              variants={sectionVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            >
              <h2 className="text-2xl font-bold text-[#00333e] mb-6 sticky top-0 bg-white/95 py-4 z-10 -mx-10 px-10 shadow-sm">
                7. Governing Law
              </h2>
              <p className="text-gray-700 leading-relaxed">
                These Terms of Service are governed by and construed in accordance with the laws of Tanzania. Any disputes arising under these Terms will be resolved in the courts of Tanzania.
              </p>
            </motion.section>

            <motion.section
              variants={sectionVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            >
              <h2 className="text-2xl font-bold text-[#00333e] mb-6 sticky top-0 bg-white/95 py-4 z-10 -mx-10 px-10 shadow-sm">
                8. Changes to Terms
              </h2>
              <p className="text-gray-700 leading-relaxed">
                Briq may update these Terms of Service from time to time. We will notify you of changes by posting the updated Terms on our website. Your continued use of the services after such changes constitutes your acceptance of the new Terms.
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
                If you have any questions about these Terms of Service, please contact us at{' '}
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

export default Terms;