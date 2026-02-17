import { useState } from "react";
import { Mail, Phone, MapPin, MessageCircle } from "lucide-react";

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

  const contactInfo = [
    {
      icon: Mail,
      title: "Email",
      value: "sms@briq.tz",
      link: "mailto:sms@briq.tz"
    },
    {
      icon: MessageCircle,
      title: "WhatsApp",
      value: "+255 788 344 348",
      link: "https://wa.me/255788344348"
    },
    {
      icon: Phone,
      title: "Phone",
      value: "+255 788 344 348",
      link: "tel:+255788344348"
    },
    {
      icon: MapPin,
      title: "Office",
      value: "Mwenge Tower, Dar es Salaam",
      link: null
    }
  ];

  return (
    <div className="min-h-screen bg-[#001f29]">
      {/* Hero */}
      <section className="pt-32 pb-20 px-6">
        <div className="container mx-auto max-w-4xl text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
            Get in touch
          </h1>
          <p className="text-xl text-gray-400">
            Have questions? We'd love to hear from you. Our team is here to help.
          </p>
        </div>
      </section>

      {/* Contact cards */}
      <section className="pb-20 px-6">
        <div className="container mx-auto max-w-4xl">
          <div className="grid md:grid-cols-2 gap-6 mb-16">
            {contactInfo.map((info, i) => {
              const Icon = info.icon;
              return (
                <div key={i} className="p-6 bg-white/5 rounded-lg border border-white/10">
                  <Icon className="w-8 h-8 text-[#0ea5e9] mb-3" />
                  <div className="text-sm text-gray-400 mb-1">{info.title}</div>
                  {info.link ? (
                    <a 
                      href={info.link}
                      className="text-lg font-medium text-white hover:text-[#0ea5e9] transition-colors"
                    >
                      {info.value}
                    </a>
                  ) : (
                    <div className="text-lg font-medium text-white">{info.value}</div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Form */}
          <div className="bg-white/5 rounded-lg border border-white/10 p-8">
            <h2 className="text-2xl font-bold text-white mb-6">Send us a message</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#0ea5e9] transition-colors"
                    placeholder="John Doe"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Email *
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#0ea5e9] transition-colors"
                    placeholder="john@company.com"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Phone
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#0ea5e9] transition-colors"
                    placeholder="+255 XXX XXX XXX"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Company
                  </label>
                  <input
                    type="text"
                    value={formData.company}
                    onChange={(e) => setFormData({...formData, company: e.target.value})}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#0ea5e9] transition-colors"
                    placeholder="Your company name"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Message *
                </label>
                <textarea
                  required
                  rows={6}
                  value={formData.message}
                  onChange={(e) => setFormData({...formData, message: e.target.value})}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#0ea5e9] transition-colors resize-none"
                  placeholder="Tell us about your project or question..."
                />
              </div>

              <button
                type="submit"
                className="w-full bg-[#0ea5e9] text-white px-8 py-4 rounded-lg font-medium hover:bg-[#0284c7] transition-colors"
              >
                Send message
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* Business hours */}
      <section className="py-20 px-6 bg-[#002a38]">
        <div className="container mx-auto max-w-4xl">
          <div className="grid md:grid-cols-2 gap-12">
            <div>
              <h3 className="text-2xl font-bold text-white mb-4">Support hours</h3>
              <div className="space-y-2 text-gray-300">
                <p>Monday - Friday: 8am - 6pm EAT</p>
                <p>Saturday: 9am - 2pm EAT</p>
                <p>Sunday: Closed</p>
              </div>
              <p className="text-gray-400 mt-4 text-sm">
                Enterprise customers with SLA receive 24/7 support
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
                During business hours. Enterprise SLA available.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Alternative contact */}
      <section className="py-20 px-6">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-3xl font-bold text-white mb-6">
            Prefer to start right away?
          </h2>
          <p className="text-xl text-gray-400 mb-10">
            Sign up for a free account and start sending messages in minutes.
          </p>
          <div className="flex gap-4 justify-center">
            <button
              onClick={() => window.location.href = "/register"}
              className="bg-[#0ea5e9] text-white px-8 py-4 rounded-lg text-lg font-medium hover:bg-[#0284c7] transition-colors"
            >
              Create free account
            </button>
            <button
              onClick={() => window.open("https://docs.briq.tz", "_blank")}
              className="bg-white/10 text-white px-8 py-4 rounded-lg text-lg font-medium hover:bg-white/20 transition-colors"
            >
              View documentation
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Contact;
