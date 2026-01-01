import React from 'react';
import { motion } from 'framer-motion';
import Navbar from '../components/Navbar';
import { Footer } from '../components/Footer';

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
              Terms of{' '}
              <span className="text-[#fddf0d] [text-shadow:_0_0_15px_rgba(253,223,13,0.4)]">
                Service
              </span>
            </h1>
            <p className="text-[#6f888c] text-lg md:text-xl max-w-3xl mx-auto leading-relaxed">
              Last updated: January 2026. By accessing or using Briq services, APIs, or portals, you agree to be bound by these Terms of Service.
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
                1. Acceptance of Terms
              </h2>
              <p className="text-gray-300 leading-relaxed text-lg">
                By accessing or using Briq services, APIs, or portals, you agree to be bound by these Terms of Service. These terms apply to all visitors, users, and others who access or use the Service.
              </p>
            </motion.section>

            <motion.section variants={sectionVariants} initial="hidden" whileInView="visible" viewport={{ once: true }}>
              <h2 className="text-2xl md:text-3xl font-bold text-[#fddf0d] mb-8 sticky top-[80px] bg-[#1a3c47]/80 backdrop-blur-md py-4 z-10 -mx-4 px-4 md:-mx-12 md:px-12 rounded-lg border-b border-white/5">
                2. Description of Services
              </h2>
              <p className="text-gray-300 leading-relaxed text-lg mb-6">
                Briq provides:
              </p>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {['SMS messaging', 'WhatsApp Business messaging', 'OTP and verification services', 'Messaging APIs and dashboards'].map((service, i) => (
                  <li key={i} className="bg-white/5 p-4 rounded-xl border border-white/5 text-gray-300 flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-[#fddf0d]" />
                    {service}
                  </li>
                ))}
              </ul>
              <p className="text-gray-400 mt-6 italic">Services are offered to businesses, aggregators, and authorized partners.</p>
            </motion.section>

            <motion.section variants={sectionVariants} initial="hidden" whileInView="visible" viewport={{ once: true }}>
              <h2 className="text-2xl md:text-3xl font-bold text-[#fddf0d] mb-8 sticky top-[80px] bg-[#1a3c47]/80 backdrop-blur-md py-4 z-10 -mx-4 px-4 md:-mx-12 md:px-12 rounded-lg border-b border-white/5">
                3. Eligibility
              </h2>
              <p className="text-gray-300 leading-relaxed text-lg mb-4">
                Users must:
              </p>
              <ul className="space-y-3 text-gray-300 text-lg">
                <li>• Be a registered business or authorized entity</li>
                <li>• Have legal capacity to enter into contracts</li>
                <li>• Comply with applicable laws and Meta policies</li>
              </ul>
            </motion.section>

            <motion.section variants={sectionVariants} initial="hidden" whileInView="visible" viewport={{ once: true }}>
              <h2 className="text-2xl md:text-3xl font-bold text-[#fddf0d] mb-8 sticky top-[80px] bg-[#1a3c47]/80 backdrop-blur-md py-4 z-10 -mx-4 px-4 md:-mx-12 md:px-12 rounded-lg border-b border-white/5">
                4. Acceptable Use Policy
              </h2>
              <div className="bg-red-500/10 border-l-4 border-red-500 p-6 mb-8">
                <p className="text-white font-bold text-lg mb-2">Users must NOT:</p>
                <ul className="space-y-2 text-gray-300">
                  <li>• Send spam, unsolicited, or deceptive messages</li>
                  <li>• Send illegal, fraudulent, or abusive content</li>
                  <li>• Violate Meta WhatsApp Business policies</li>
                  <li>• Infringe intellectual property or privacy rights</li>
                  <li>• Attempt to bypass security or routing controls</li>
                </ul>
              </div>
              <p className="text-gray-400 italic">Briq reserves the right to suspend or terminate accounts violating these rules.</p>
            </motion.section>

            <motion.section variants={sectionVariants} initial="hidden" whileInView="visible" viewport={{ once: true }}>
              <h2 className="text-2xl md:text-3xl font-bold text-[#fddf0d] mb-8 sticky top-[80px] bg-[#1a3c47]/80 backdrop-blur-md py-4 z-10 -mx-4 px-4 md:-mx-12 md:px-12 rounded-lg border-b border-white/5">
                5. WhatsApp & Meta Compliance
              </h2>
              <p className="text-gray-300 leading-relaxed text-lg mb-4">
                Users acknowledge that:
              </p>
              <ul className="space-y-4 text-gray-300 text-lg">
                <li className="flex gap-4">
                  <span className="text-[#fddf0d] mt-1">•</span>
                  <p>WhatsApp messaging is subject to <strong>Meta’s WhatsApp Business Platform Policies</strong>.</p>
                </li>
                <li className="flex gap-4">
                  <span className="text-[#fddf0d] mt-1">•</span>
                  <p>Template approval and message content compliance are mandatory.</p>
                </li>
                <li className="flex gap-4">
                  <span className="text-[#fddf0d] mt-1">•</span>
                  <p>Meta may review, restrict, or disable messaging based on policy violations.</p>
                </li>
              </ul>
            </motion.section>

            <motion.section variants={sectionVariants} initial="hidden" whileInView="visible" viewport={{ once: true }}>
              <h2 className="text-2xl md:text-3xl font-bold text-[#fddf0d] mb-8 sticky top-[80px] bg-[#1a3c47]/80 backdrop-blur-md py-4 z-10 -mx-4 px-4 md:-mx-12 md:px-12 rounded-lg border-b border-white/5">
                6. Aggregators & Resellers
              </h2>
              <p className="text-gray-300 leading-relaxed text-lg mb-4">
                Aggregators connecting third-party clients:
              </p>
              <ul className="space-y-3 text-gray-300 text-lg">
                <li>• Are fully responsible for their clients’ compliance</li>
                <li>• Must perform KYC and content validation</li>
                <li>• Are liable for misuse originating from their accounts</li>
              </ul>
            </motion.section>

            <motion.section variants={sectionVariants} initial="hidden" whileInView="visible" viewport={{ once: true }}>
              <h2 className="text-2xl md:text-3xl font-bold text-[#fddf0d] mb-8 sticky top-[80px] bg-[#1a3c47]/80 backdrop-blur-md py-4 z-10 -mx-4 px-4 md:-mx-12 md:px-12 rounded-lg border-b border-white/5">
                7. Fees, Billing & Deposits
              </h2>
              <ul className="space-y-4 text-gray-300 text-lg">
                <li className="flex gap-4 items-start">
                  <div className="w-8 h-8 rounded-full bg-[#fddf0d]/20 flex items-center justify-center shrink-0">
                    <span className="text-[#fddf0d]">1</span>
                  </div>
                  <p>Services are billed based on usage or agreed pricing.</p>
                </li>
                <li className="flex gap-4 items-start">
                  <div className="w-8 h-8 rounded-full bg-[#fddf0d]/20 flex items-center justify-center shrink-0">
                    <span className="text-[#fddf0d]">2</span>
                  </div>
                  <p>Prepaid balances or security deposits may be required.</p>
                </li>
                <li className="flex gap-4 items-start">
                  <div className="w-8 h-8 rounded-full bg-[#fddf0d]/20 flex items-center justify-center shrink-0">
                    <span className="text-[#fddf0d]">3</span>
                  </div>
                  <p>Fees are non-refundable unless explicitly stated.</p>
                </li>
              </ul>
            </motion.section>

            <motion.section variants={sectionVariants} initial="hidden" whileInView="visible" viewport={{ once: true }}>
              <h2 className="text-2xl md:text-3xl font-bold text-[#fddf0d] mb-8 sticky top-[80px] bg-[#1a3c47]/80 backdrop-blur-md py-4 z-10 -mx-4 px-4 md:-mx-12 md:px-12 rounded-lg border-b border-white/5">
                8. Suspension & Termination
              </h2>
              <p className="text-gray-300 leading-relaxed text-lg mb-4">
                Briq may suspend or terminate services if:
              </p>
              <ul className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {['Policies or laws are violated', 'Payment obligations are not met', 'Security or platform integrity is threatened'].map((reason, i) => (
                  <div key={i} className="p-4 bg-white/5 rounded-xl border border-white/5 text-gray-300 text-center">
                    {reason}
                  </div>
                ))}
              </ul>
            </motion.section>

            <motion.section variants={sectionVariants} initial="hidden" whileInView="visible" viewport={{ once: true }}>
              <h2 className="text-2xl md:text-3xl font-bold text-[#fddf0d] mb-8 sticky top-[80px] bg-[#1a3c47]/80 backdrop-blur-md py-4 z-10 -mx-4 px-4 md:-mx-12 md:px-12 rounded-lg border-b border-white/5">
                9. Limitation of Liability
              </h2>
              <p className="text-gray-300 leading-relaxed text-lg mb-4">
                Briq is not liable for:
              </p>
              <ul className="space-y-3 text-gray-400 text-lg">
                <li>• Content sent by users or their clients</li>
                <li>• Telecom or Meta platform outages</li>
                <li>• Indirect, incidental, or consequential damages</li>
              </ul>
              <p className="mt-4 text-white font-medium italic">
                Total liability shall not exceed fees paid in the preceding billing period.
              </p>
            </motion.section>

            <motion.section variants={sectionVariants} initial="hidden" whileInView="visible" viewport={{ once: true }}>
              <h2 className="text-2xl md:text-3xl font-bold text-[#fddf0d] mb-8 sticky top-[80px] bg-[#1a3c47]/80 backdrop-blur-md py-4 z-10 -mx-4 px-4 md:-mx-12 md:px-12 rounded-lg border-b border-white/5">
                10. Indemnification
              </h2>
              <p className="text-gray-300 leading-relaxed text-lg">
                Users agree to indemnify Briq against claims arising from message content, regulatory violations, or misuse of services.
              </p>
            </motion.section>

            <motion.section variants={sectionVariants} initial="hidden" whileInView="visible" viewport={{ once: true }}>
              <h2 className="text-2xl md:text-3xl font-bold text-[#fddf0d] mb-8 sticky top-[80px] bg-[#1a3c47]/80 backdrop-blur-md py-4 z-10 -mx-4 px-4 md:-mx-12 md:px-12 rounded-lg border-b border-white/5">
                11. Governing Law
              </h2>
              <p className="text-gray-300 leading-relaxed text-lg">
                These Terms are governed by the laws of the <strong>United Republic of Tanzania</strong>, unless otherwise agreed in writing.
              </p>
            </motion.section>

            <motion.section variants={sectionVariants} initial="hidden" whileInView="visible" viewport={{ once: true }}>
              <h2 className="text-2xl md:text-3xl font-bold text-[#fddf0d] mb-8 sticky top-[80px] bg-[#1a3c47]/80 backdrop-blur-md py-4 z-10 -mx-4 px-4 md:-mx-12 md:px-12 rounded-lg border-b border-white/5">
                12. Modifications
              </h2>
              <p className="text-gray-300 leading-relaxed text-lg">
                Briq may modify these Terms with notice. Continued use constitutes acceptance of updated Terms.
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