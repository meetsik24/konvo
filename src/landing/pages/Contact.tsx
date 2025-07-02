import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Phone, MapPin, Send } from 'lucide-react';

export default function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form submitted:', formData);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div className="pt-16 font-sans" style={{ fontFamily: 'Exo, sans-serif' }}>
      {/* Header with Navy Gradient */}
      <section className="py-20 sm:py-32" style={{
        background: 'linear-gradient(135deg, #00333e 0%, #02141a 100%)'
      }}>
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl">
              Let's Chat!
            </h1>
            <p className="mt-6 text-lg text-gray-200 max-w-2xl mx-auto" style={{ fontFamily: 'Montserrat, sans-serif' }}>
              Have questions? We'd love to hear from you. Send us a message and we'll respond as soon as possible.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Contact Form Section */}
      <section className="py-20 bg-gray-900">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="bg-gray-800 bg-opacity-70 backdrop-blur-md rounded-3xl shadow-xl overflow-hidden">
            <div className="grid grid-cols-1 md:grid-cols-2">
              {/* Contact Information */}
              <div className="p-12 text-white" style={{
                background: 'linear-gradient(135deg, #00333e 0%, #7b6d00 100%)'
              }}>
                <h3 className="text-2xl font-semibold mb-8" style={{ fontFamily: 'Exo, sans-serif' }}>
                  Contact Information
                </h3>
                <div className="space-y-6">
                  <div className="flex items-center space-x-4">
                    <Mail className="h-6 w-6 text-yellow-400" />
                    <span style={{ fontFamily: 'Montserrat, sans-serif' }}>
                      briq@meetpay.africa
                    </span>
                  </div>
                  <div className="flex items-center space-x-4">
                    <Phone className="h-6 w-6 text-yellow-400" />
                    <span style={{ fontFamily: 'Montserrat, sans-serif' }}>
                      +255 788 344 348
                    </span>
                  </div>
                  <div className="flex items-center space-x-4">
                    <MapPin className="h-6 w-6 text-yellow-400" />
                    <span style={{ fontFamily: 'Montserrat, sans-serif' }}>
                      Dar es Salaam, Tanzania
                    </span>
                  </div>
                </div>
              </div>

              {/* Contact Form */}
              <div className="p-12">
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-2" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                      Name
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-xl bg-gray-700 text-white border-none focus:ring-2 focus:ring-yellow-400"
                      placeholder="Your name"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                      Email
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-xl bg-gray-700 text-white border-none focus:ring-2 focus:ring-yellow-400"
                      placeholder="your@email.com"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="message" className="block text-sm font-medium text-gray-300 mb-2" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                      Message
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      rows={4}
                      className="w-full px-4 py-3 rounded-xl bg-gray-700 text-white border-none focus:ring-2 focus:ring-yellow-400"
                      placeholder="How can we help you?"
                      required
                    />
                  </div>
                  <div>
                    <button
                      type="submit"
                      className="w-full btn bg-yellow-400 text-gray-900 hover:bg-yellow-500 rounded-xl py-3 flex items-center justify-center transition-colors"
                    >
                      Send Message
                      <Send className="ml-2 h-4 w-4" />
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}