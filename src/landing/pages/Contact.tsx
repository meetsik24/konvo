import { useState } from "react";

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

  return (
    <div className="bg-[#00333e] min-h-screen">
      {/* Hero */}
      <section className="pt-32 pb-20 px-6">
        <div className="container mx-auto max-w-4xl text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
            Get in touch
          </h1>
          <p className="text-xl text-gray-300">
            Have questions? Our team is here to help you get started.
          </p>
        </div>
      </section>

      {/* Contact info */}
      <section className="pb-20 px-6">
        <div className="container mx-auto max-w-4xl">
          <div className="grid md:grid-cols-2 gap-6 mb-16">
            {contactInfo.map((info, i) => (
              <div key={i} className="bg-white/5 p-6 rounded-lg border border-gray-600">
                <div className="text-sm text-gray-400 mb-2">{info.title}</div>
                {info.link ? (
                  <a 
                    href={info.link}
                    className="text-lg font-semibold text-white hover:text-[#fddf0d] transition-colors"
                  >
                    {info.value}
                  </a>
                ) : (
                  <div className="text-lg font-semibold text-white">{info.value}</div>
                )}
              </div>
            ))}
          </div>

          {/* Form */}
          <div className="bg-white/5 rounded-lg border border-gray-600 p-8">
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
                    className="w-full px-4 py-3 bg-[#00333e] border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#fddf0d] transition-colors"
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
                    className="w-full px-4 py-3 bg-[#00333e] border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#fddf0d] transition-colors"
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
                    className="w-full px-4 py-3 bg-[#00333e] border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#fddf0d] transition-colors"
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
                    className="w-full px-4 py-3 bg-[#00333e] border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#fddf0d] transition-colors"
                    placeholder="Your company"
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
                  className="w-full px-4 py-3 bg-[#00333e] border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#fddf0d] transition-colors resize-none"
                  placeholder="Tell us about your needs..."
                />
              </div>

              <button
                type="submit"
                className="w-full bg-[#fddf0d] text-[#00333e] px-8 py-4 rounded-lg font-semibold hover:bg-[#fce96a] transition-colors"
              >
                Send message
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* Support hours */}
      <section className="py-20 px-6 bg-[#003d4a]">
        <div className="container mx-auto max-w-4xl">
          <div className="grid md:grid-cols-2 gap-12 text-center md:text-left">
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
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-3xl font-bold text-white mb-6">
            Ready to start?
          </h2>
          <p className="text-xl text-gray-300 mb-10">
            Sign up and start sending messages in minutes
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <button
              onClick={() => window.location.href = "/register"}
              className="bg-[#fddf0d] text-[#00333e] px-8 py-4 rounded-lg text-lg font-semibold hover:bg-[#fce96a] transition-colors"
            >
              Create free account
            </button>
            <button
              onClick={() => window.open("https://docs.briq.tz", "_blank")}
              className="bg-white/10 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-white/20 transition-colors border border-gray-600"
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
