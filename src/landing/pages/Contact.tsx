import { useState } from "react";
import { SectionWhite, SectionDark, SectionHero } from "../components/sections";
import { Button } from "../components/ui/button";

const contactInfo = [
  {
    title: "Email",
    value: "sms@briq.tz",
    link: "mailto:sms@briq.tz"
  },
  {
    title: "WhatsApp",
    value: "+255 788 344 348",
    link: "https://wa.me/255788344348"
  },
  {
    title: "Phone",
    value: "+255 744 123 456",
    link: "tel:+255744123456"
  },
  {
    title: "Office",
    value: "Mwenge Tower, First Floor, Dar es Salaam",
    link: null
  }
];

function Contact() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    company: "",
    message: ""
  });
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      // TODO: replace with real API call
      await new Promise((res) => setTimeout(res, 800));
      setSubmitted(true);
      setFormData({ name: "", email: "", phone: "", company: "", message: "" });
    } catch {
      setError("Something went wrong. Please try again or email us directly at sms@briq.tz.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-white min-h-screen">
      {/* Hero */}
      <SectionHero
        title="Get in touch"
        subtitle="Have questions? Our team is here to help you get started."
      />

      {/* Contact Info & Form */}
      <SectionWhite maxWidth="4xl" className="py-10">
        {/* Contact Info Cards */}
        <div className="grid md:grid-cols-2 gap-6 mb-16">
          {contactInfo.map((info, i) => (
            <div key={i} className="bg-gray-50 border border-gray-200 rounded-xl p-6 hover:border-[#fddf0d] hover:shadow-md transition-all">
              <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">{info.title}</div>
              {info.link ? (
                <a
                  href={info.link}
                  className="text-lg font-semibold text-[#00333e] hover:text-[#fddf0d] transition-colors"
                >
                  {info.value}
                </a>
              ) : (
                <div className="text-lg font-semibold text-[#00333e]">{info.value}</div>
              )}
            </div>
          ))}
        </div>

        {/* Contact Form */}
        <div className="bg-gray-50 rounded-2xl border border-gray-200 p-8">
          <h2 className="text-2xl font-bold text-[#00333e] mb-6">Send us a message</h2>

          {/* Success State */}
          {submitted ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="w-14 h-14 bg-[#fddf0d]/20 rounded-full flex items-center justify-center mb-4">
                <svg className="w-7 h-7 text-[#00333e]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-[#00333e] mb-2">Message sent!</h3>
              <p className="text-gray-500 mb-6">We'll get back to you within 4 business hours.</p>
              <button
                onClick={() => setSubmitted(false)}
                className="text-sm text-[#00333e] underline hover:text-[#fddf0d] transition-colors"
              >
                Send another message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-[#00333e] mb-2">Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-[#00333e] placeholder-gray-400 focus:outline-none focus:border-[#fddf0d] focus:ring-2 focus:ring-[#fddf0d]/20 transition-all"
                    placeholder="John Doe"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#00333e] mb-2">Email *</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-[#00333e] placeholder-gray-400 focus:outline-none focus:border-[#fddf0d] focus:ring-2 focus:ring-[#fddf0d]/20 transition-all"
                    placeholder="john@company.com"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-[#00333e] mb-2">Phone</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-[#00333e] placeholder-gray-400 focus:outline-none focus:border-[#fddf0d] focus:ring-2 focus:ring-[#fddf0d]/20 transition-all"
                    placeholder="+255 7XX XXX XXX"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#00333e] mb-2">Company</label>
                  <input
                    type="text"
                    value={formData.company}
                    onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                    className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-[#00333e] placeholder-gray-400 focus:outline-none focus:border-[#fddf0d] focus:ring-2 focus:ring-[#fddf0d]/20 transition-all"
                    placeholder="Your company"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#00333e] mb-2">Message *</label>
                <textarea
                  required
                  rows={6}
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-[#00333e] placeholder-gray-400 focus:outline-none focus:border-[#fddf0d] focus:ring-2 focus:ring-[#fddf0d]/20 transition-all resize-none"
                  placeholder="Tell us about your needs..."
                />
              </div>

              {/* Error Message */}
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-red-700 text-sm">
                  {error}
                </div>
              )}

              <Button
                variant="primary"
                size="lg"
                className="w-full"
                disabled={submitting}
              >
                {submitting ? "Sending..." : "Send message"}
              </Button>
            </form>
          )}
        </div>
      </SectionWhite>

      {/* Support Info */}
      <SectionDark title="How we support you" maxWidth="4xl" className="py-12">
        <div className="grid md:grid-cols-2 gap-12">
          <div>
            <h3 className="text-2xl font-bold text-white mb-4">Support hours</h3>
            <div className="space-y-2 text-gray-300">
              <p>Monday – Friday: 8am – 6pm EAT</p>
              <p>Saturday: 9am – 2pm EAT</p>
              <p>Sunday: Closed</p>
            </div>
            <p className="text-gray-400 mt-4 text-sm">
              Enterprise customers receive 24/7 support
            </p>
          </div>
          <div>
            <h3 className="text-2xl font-bold text-white mb-4">Response time</h3>
            <div className="space-y-2 text-gray-300">
              <p>Email: Within 4 hours</p>
              <p>WhatsApp: Within 30 minutes</p>
              <p>Phone: Immediate</p>
            </div>
            <p className="text-gray-400 mt-4 text-sm">
              During business hours
            </p>
          </div>
        </div>
      </SectionDark>

      {/* CTA */}
      <SectionWhite maxWidth="3xl" className="py-12">
        <h2 className="text-4xl font-bold text-[#00333e] mb-6 text-center">
          Ready to start?
        </h2>
        <p className="text-xl text-gray-600 mb-10 text-center">
          Sign up and start sending messages in minutes
        </p>
        <div className="flex gap-4 justify-center flex-wrap">
          <Button
            variant="primary"
            size="lg"
            onClick={() => window.location.href = "/register"}
          >
            Create free account
          </Button>
          <Button
            variant="dark"
            size="lg"
            onClick={() => window.open("https://docs.briq.tz", "_blank")}
          >
            View documentation
          </Button>
        </div>
      </SectionWhite>
    </div>
  );
}

export default Contact;
