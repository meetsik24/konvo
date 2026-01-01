import React from 'react';
import { motion } from 'framer-motion';
import Navbar from '../components/Navbar';
import { Footer } from '../components/Footer';

const Privacy = () => {
  const sectionVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: 'easeOut' } },
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#1a3c47] text-white font-exo">
      {/* Navbar */}
      <Navbar />

      {/* Header Section */}
      <section className="bg-[#00333e] text-white py-24 relative overflow-hidden">
        {/* Animated Texture Background */}
        <div className="absolute inset-0 z-0 opacity-40">
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
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Privacy{' '}
              <span className="text-[#fddf0d] [text-shadow:_0_0_15px_rgba(253,223,13,0.4)]">
                Policy
              </span>
            </h1>
            <p className="text-[#6f888c] text-lg md:text-xl max-w-3xl mx-auto leading-relaxed">
              Last updated: January 2026. This policy applies to Briq, a communications platform providing SMS, WhatsApp, OTP, and related messaging services.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Content Section */}
      <section className="flex-grow py-20 bg-[#1a3c47] relative">
        {/* Subtle background glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-radial-gradient from-[#00333e]/20 to-transparent pointer-events-none" />

        <div className="container mx-auto px-4 relative z-10">
          <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 shadow-2xl p-8 md:p-12 max-w-5xl mx-auto space-y-16">

            <motion.section variants={sectionVariants} initial="hidden" whileInView="visible" viewport={{ once: true }}>
              <h2 className="text-2xl md:text-3xl font-bold text-[#fddf0d] mb-8 sticky top-[80px] bg-[#1a3c47]/80 backdrop-blur-md py-4 z-10 -mx-4 px-4 md:-mx-12 md:px-12 rounded-lg border-b border-white/5">
                1. Introduction
              </h2>
              <div className="text-gray-300 leading-relaxed text-lg space-y-4">
                <p>
                  Briq (“we”, “our”, “us”) respects user privacy and is committed to protecting personal data. This Privacy Policy explains how we collect, use, store, and protect information when clients, partners, or end-users use Briq services.
                </p>
                <p>
                  This document is prepared for <strong>Meta Business Solutions Partner approval</strong> and complies with applicable data protection principles and Meta Platform Policies.
                </p>
              </div>
            </motion.section>

            <motion.section variants={sectionVariants} initial="hidden" whileInView="visible" viewport={{ once: true }}>
              <h2 className="text-2xl md:text-3xl font-bold text-[#fddf0d] mb-8 sticky top-[80px] bg-[#1a3c47]/80 backdrop-blur-md py-4 z-10 -mx-4 px-4 md:-mx-12 md:px-12 rounded-lg border-b border-white/5">
                2. Information We Collect
              </h2>
              <p className="text-gray-300 leading-relaxed text-lg mb-6">
                We may collect the following categories of data:
              </p>
              <ul className="space-y-4">
                {[
                  { title: 'Account Information', desc: 'Business name, contact person, email address, phone number.' },
                  { title: 'Authentication Data', desc: 'API keys, access tokens (securely generated and stored).' },
                  { title: 'Messaging Data', desc: 'Sender IDs, recipient phone numbers, message content (SMS/WhatsApp), delivery reports.' },
                  { title: 'Technical Data', desc: 'IP address, device information, browser type, logs, timestamps.' },
                  { title: 'Billing Data', desc: 'Transaction records, invoices, payment references (we do not store card details).' }
                ].map((item, i) => (
                  <li key={i} className="flex gap-4">
                    <span className="text-[#fddf0d] mt-1.5">•</span>
                    <p className="text-gray-300 text-lg">
                      <strong className="text-white">{item.title}:</strong> {item.desc}
                    </p>
                  </li>
                ))}
              </ul>
            </motion.section>

            <motion.section variants={sectionVariants} initial="hidden" whileInView="visible" viewport={{ once: true }}>
              <h2 className="text-2xl md:text-3xl font-bold text-[#fddf0d] mb-8 sticky top-[80px] bg-[#1a3c47]/80 backdrop-blur-md py-4 z-10 -mx-4 px-4 md:-mx-12 md:px-12 rounded-lg border-b border-white/5">
                3. How We Use Information
              </h2>
              <p className="text-gray-300 leading-relaxed text-lg mb-6">
                Collected information is used strictly to:
              </p>
              <ul className="grid md:grid-cols-2 gap-4">
                {[
                  'Provide and operate messaging services',
                  'Deliver SMS, WhatsApp, and OTP messages',
                  'Authenticate API and portal access',
                  'Monitor delivery, prevent fraud, and ensure compliance',
                  'Generate reports, analytics, and billing statements',
                  'Communicate service updates or critical notices'
                ].map((text, i) => (
                  <li key={i} className="bg-white/5 p-4 rounded-xl border border-white/5 text-gray-300">
                    {text}
                  </li>
                ))}
              </ul>
            </motion.section>

            <motion.section variants={sectionVariants} initial="hidden" whileInView="visible" viewport={{ once: true }}>
              <h2 className="text-2xl md:text-3xl font-bold text-[#fddf0d] mb-8 sticky top-[80px] bg-[#1a3c47]/80 backdrop-blur-md py-4 z-10 -mx-4 px-4 md:-mx-12 md:px-12 rounded-lg border-b border-white/5">
                4. Legal Basis for Processing
              </h2>
              <p className="text-gray-300 leading-relaxed text-lg mb-6">
                We process data based on:
              </p>
              <ul className="space-y-3 text-gray-300 text-lg">
                <li>• Contractual necessity (service delivery)</li>
                <li>• Legitimate business interests</li>
                <li>• Legal and regulatory obligations</li>
                <li>• User or client consent where applicable</li>
              </ul>
            </motion.section>

            <motion.section variants={sectionVariants} initial="hidden" whileInView="visible" viewport={{ once: true }}>
              <h2 className="text-2xl md:text-3xl font-bold text-[#fddf0d] mb-8 sticky top-[80px] bg-[#1a3c47]/80 backdrop-blur-md py-4 z-10 -mx-4 px-4 md:-mx-12 md:px-12 rounded-lg border-b border-white/5">
                5. Data Sharing & Disclosure
              </h2>
              <div className="bg-[#fddf0d]/10 border-l-4 border-[#fddf0d] p-6 mb-8">
                <p className="text-white font-bold text-lg">
                  We do not sell personal data.
                </p>
              </div>
              <p className="text-gray-300 leading-relaxed text-lg mb-6">
                Data may be shared only with:
              </p>
              <ul className="space-y-4 text-gray-300 text-lg">
                <li>• <strong>Licensed telecom operators and WhatsApp/Meta-approved providers</strong> for message routing</li>
                <li>• <strong>Trusted infrastructure partners</strong> (hosting, security, monitoring)</li>
                <li>• <strong>Legal authorities</strong> when required by law</li>
              </ul>
              <p className="text-gray-400 italic mt-6">
                All partners are bound by confidentiality and data protection obligations.
              </p>
            </motion.section>

            <motion.section variants={sectionVariants} initial="hidden" whileInView="visible" viewport={{ once: true }}>
              <h2 className="text-2xl md:text-3xl font-bold text-[#fddf0d] mb-8 sticky top-[80px] bg-[#1a3c47]/80 backdrop-blur-md py-4 z-10 -mx-4 px-4 md:-mx-12 md:px-12 rounded-lg border-b border-white/5">
                6. Data Retention
              </h2>
              <ul className="space-y-4 text-gray-300 text-lg font-inter">
                <li className="flex gap-4">
                  <span className="text-[#fddf0d]">✓</span>
                  <p>Message logs and delivery reports are retained only as long as necessary for compliance, troubleshooting, and billing.</p>
                </li>
                <li className="flex gap-4">
                  <span className="text-[#fddf0d]">✓</span>
                  <p>Account data is retained while the account is active or as legally required.</p>
                </li>
              </ul>
            </motion.section>

            <motion.section variants={sectionVariants} initial="hidden" whileInView="visible" viewport={{ once: true }}>
              <h2 className="text-2xl md:text-3xl font-bold text-[#fddf0d] mb-8 sticky top-[80px] bg-[#1a3c47]/80 backdrop-blur-md py-4 z-10 -mx-4 px-4 md:-mx-12 md:px-12 rounded-lg border-b border-white/5">
                7. Data Security
              </h2>
              <p className="text-gray-300 leading-relaxed text-lg mb-6">
                Briq implements industry-standard safeguards including:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-300">
                {['Secure APIs and authentication', 'Encryption in transit and at rest', 'Access control and audit logging', 'Regular monitoring and system hardening'].map((s, i) => (
                  <div key={i} className="flex items-center gap-3 p-4 bg-white/5 rounded-lg border border-white/5">
                    <div className="w-2 h-2 rounded-full bg-[#fddf0d]" />
                    <span>{s}</span>
                  </div>
                ))}
              </div>
            </motion.section>

            <motion.section variants={sectionVariants} initial="hidden" whileInView="visible" viewport={{ once: true }}>
              <h2 className="text-2xl md:text-3xl font-bold text-[#fddf0d] mb-8 sticky top-[80px] bg-[#1a3c47]/80 backdrop-blur-md py-4 z-10 -mx-4 px-4 md:-mx-12 md:px-12 rounded-lg border-b border-white/5">
                8. User Rights
              </h2>
              <p className="text-gray-300 leading-relaxed text-lg mb-4">
                Depending on jurisdiction, users may request to:
              </p>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-gray-300 text-lg">
                {['Access their data', 'Correct inaccurate information', 'Request deletion (subject to laws)', 'Restrict or object to processing'].map((r, i) => (
                  <li key={i} className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#fddf0d]" />
                    {r}
                  </li>
                ))}
              </ul>
              <p className="text-gray-400 mt-6">
                Requests can be submitted via official Briq support channels.
              </p>
            </motion.section>

            <motion.section variants={sectionVariants} initial="hidden" whileInView="visible" viewport={{ once: true }}>
              <h2 className="text-2xl md:text-3xl font-bold text-[#fddf0d] mb-8 sticky top-[80px] bg-[#1a3c47]/80 backdrop-blur-md py-4 z-10 -mx-4 px-4 md:-mx-12 md:px-12 rounded-lg border-b border-white/5">
                9. Cookies & Tracking
              </h2>
              <p className="text-gray-300 leading-relaxed text-lg">
                Briq portals may use essential cookies for authentication, security, and performance. We do not use cookies for unauthorized tracking.
              </p>
            </motion.section>

            <motion.section variants={sectionVariants} initial="hidden" whileInView="visible" viewport={{ once: true }}>
              <h2 className="text-2xl md:text-3xl font-bold text-[#fddf0d] mb-8 sticky top-[80px] bg-[#1a3c47]/80 backdrop-blur-md py-4 z-10 -mx-4 px-4 md:-mx-12 md:px-12 rounded-lg border-b border-white/5">
                10. Changes to This Policy
              </h2>
              <p className="text-gray-300 leading-relaxed text-lg">
                We may update this Privacy Policy periodically. Updates will be communicated via official channels or the Briq portal.
              </p>
            </motion.section>

            <motion.section variants={sectionVariants} initial="hidden" whileInView="visible" viewport={{ once: true }}>
              <h2 className="text-2xl md:text-3xl font-bold text-[#fddf0d] mb-8 sticky top-[80px] bg-[#1a3c47]/80 backdrop-blur-md py-4 z-10 -mx-4 px-4 md:-mx-12 md:px-12 rounded-lg border-b border-white/5">
                11. Contact Information
              </h2>
              <div className="bg-white/5 p-8 rounded-2xl border border-white/5">
                <p className="text-white font-bold text-xl mb-4">Briq Solutions</p>
                <div className="flex flex-col gap-2">
                  <p className="text-gray-400">Email for privacy-related inquiries:</p>
                  <a href="mailto:support@briq.co.tz" className="text-[#fddf0d] text-xl hover:underline font-medium">
                    sms@briq.co.tz
                  </a>
                </div>
              </div>
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