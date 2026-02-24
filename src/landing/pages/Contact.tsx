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
    value: "+255 788 344 348",
    link: "tel:+255788344348"
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Form submitted:", formData);
  };

  return (
    <div className="bg-white min-h-screen">
      {/* Hero */}
      <SectionHero
        title="Get in touch"
        subtitle="Have questions? Our team is here to help you get started."
      />

      {/* Contact Info & Form */}
      <SectionWhite maxWidth="4xl" className="py-20">
        {/* Contact Info Cards */}
        <div className="grid md:grid-cols-2 gap-6 mb-16">
          {contactInfo.map((info, i) => (
            <div key={i} className="bg-gray-50 border border-gray-300 rounded-lg p-6 hover:border-[#fddf0d] transition-colors">
              <div className="text-sm text-gray-600 mb-2">{info.title}</div>
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
        <div className="bg-gray-50 rounded-lg border border-gray-300 p-8">
          <h2 className="text-2xl font-bold text-[#00333e] mb-6">Send us a message</h2>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-[#00333e] mb-2">
                  Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-[#00333e] placeholder-gray-500 focus:outline-none focus:border-[#fddf0d] transition-colors"
                  placeholder="John Doe"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#00333e] mb-2">
                  Email *
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-[#00333e] placeholder-gray-500 focus:outline-none focus:border-[#fddf0d] transition-colors"
                  placeholder="john@company.com"
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-[#00333e] mb-2">
                  Phone
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-[#00333e] placeholder-gray-500 focus:outline-none focus:border-[#fddf0d] transition-colors"
                  placeholder="+255 XXX XXX XXX"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#00333e] mb-2">
                  Company
                </label>
                <input
                  type="text"
                  value={formData.company}
                  onChange={(e) => setFormData({...formData, company: e.target.value})}
                  className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-[#00333e] placeholder-gray-500 focus:outline-none focus:border-[#fddf0d] transition-colors"
                  placeholder="Your company"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-[#00333e] mb-2">
                Message *
              </label>
              <textarea
                required
                rows={6}
                value={formData.message}
                onChange={(e) => setFormData({...formData, message: e.target.value})}
                className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-[#00333e] placeholder-gray-500 focus:outline-none focus:border-[#fddf0d] transition-colors resize-none"
                placeholder="Tell us about your needs..."
              />
            </div>

            <Button variant="primary" size="lg" className="w-full">
              Send message
            </Button>
          </form>
        </div>
      </SectionWhite>

      {/* Support Info */}
      <SectionDark title="How we support you" maxWidth="4xl" className="py-20">
        <div className="grid md:grid-cols-2 gap-12">
          <div>
            <h3 className="text-2xl font-bold text-white mb-4">Support hours</h3>
            <div className="space-y-2 text-gray-300">
              <p>Monday - Friday: 8am - 6pm EAT</p>
              <p>Saturday: 9am - 2pm EAT</p>
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
      <SectionWhite maxWidth="3xl">
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
