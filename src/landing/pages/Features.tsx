import { MessageSquare, Lock, Phone, Volume2, Code, Bell } from "lucide-react";

import linesImage from "../../../assets/lines.png";
import smsImage from "../../../assets/SMS.png";
import phoneOne from "../../../assets/Simu.png";
import bg from "../../../assets/bg.png";

// Features component
function Features() {
  return (
    <section
      className="py-16 bg-white text-[#00333e] relative overflow-hidden font-exo"
      style={{
        backgroundImage: `url(${bg})`,
        backgroundSize: "80%", // Reduce the image size
        backgroundPosition: "center",
        backgroundRepeat: "repeat", // Change to repeat to cover the entire section
        backgroundColor: "rgba(255, 255, 255, 0.92)", // Add a semi-transparent white overlay
        backgroundBlendMode: "overlay", // Blend the image with the overlay
        opacity: 0.9, // Reduce the opacity
      }}
    >
      <div className="container mx-auto px-4 relative z-10">
        {/* Effective Messaging Section */}
        <div className="flex flex-col md:flex-row items-center gap-8 mb-24">
          <div className="md:w-1/2">
            <span className="inline-block px-4 py-1 bg-gray-100/60 backdrop-blur-md border border-gray-300/50 rounded-full text-sm font-medium mb-4">
              Effective Messaging
            </span>
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900">
              AI-Connected{" "}
              <span className="text-[#fddf0d] [text-shadow:_0_0_10px_rgba(253,223,13,0.3)]">
                Bulk SMS
              </span>{" "}
              Solutions
            </h2>
            <p className="text-gray-600 mb-6 max-w-md">
              Briq provides fast and scalable Bulk SMS, Flash, and Push Messaging
              solutions, helping SMEs and financial institutions enhance customer
              engagement with AI-driven efficiency.
            </p>
          </div>
          <div className="md:w-1/2">
            <img
              src={smsImage}
              alt="Messaging Dashboard"
              className="w-full h-100 object-cover rounded-lg [filter:_drop-shadow(0_0_15px_rgba(253,223,13,0.2))]"
            />
          </div>
        </div>

        {/* Secure Authentication Section */}
        <div className="flex flex-col md:flex-row-reverse items-center gap-8 mb-24">
          <div className="md:w-1/2">
            <span className="inline-block px-4 py-1 bg-gray-100/60 backdrop-blur-md border border-gray-300/50 rounded-full text-sm font-medium mb-4">
              Secure Authentication
            </span>
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900">
              Robust{" "}
              <span className="text-[#fddf0d] [text-shadow:_0_0_10px_rgba(253,223,13,0.3)]">
                OTP
              </span>{" "}
              Solutions
            </h2>
            <p className="text-gray-600 mb-6 max-w-md">
              Briq offers secure OTP Authentication for logins and WhatsApp OTP
              for inventory management, ensuring your business communications are
              safe and reliable.
            </p>
          </div>
          <div className="md:w-1/2">
            <img
              src={phoneOne}
              alt="Phone Mockup"
              className="w-full h-100 object-cover rounded-lg [filter:_drop-shadow(0_0_15px_rgba(253,223,13,0.2))]"
            />
          </div>
        </div>

        {/* Build with Briq API Section (Styled as a Card) */}
        <div className="flex flex-col md:flex-row items-center gap-8 mb-24 bg-[#00333e] text-white p-8 rounded-lg">
          <div className="md:w-1/2">
            <span className="inline-block px-4 py-1 bg-white text-[#00333e] rounded-full text-sm font-medium mb-4">
              Developer API
            </span>
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-white">
              Build with{" "}
              <span className="text-[#fddf0d] [text-shadow:_0_0_10px_rgba(253,223,13,0.3)]">
                Briq API
              </span>
            </h2>
            <p className="text-gray-200 mb-6 max-w-md">
              Briq offers fast, scalable APIs and no-code integrations for
              developers, enabling seamless communication solutions for your
              applications.
            </p>
            <a href="mailto:sms@briq.tz">
              <button className="bg-transparent border border-white text-white hover:bg-[#fddf0d] hover:text-black hover:border-[#fddf0d] px-6 py-2 rounded-lg">
                Contact Us
              </button>
            </a>
          </div>
          <div className="md:w-1/2 bg-gray-800 p-8 rounded-lg">
            <div className="flex items-center gap-2 mb-4">
              <Code className="w-6 h-6 text-[#fddf0d]" />
              <h3 className="text-xl font-bold">Quick Start</h3>
            </div>
            <code className="block bg-gray-900 text-gray-200 p-4 rounded-md text-sm mb-6">
              import {"{ sendSMS }"} from '@briq'; <br />
              <br />
              const message = {"{"} <br />
                recipient: '+255123456789', <br />
                content: 'Hello from Briq!', <br />
              {"}"}; <br />
              <br />
              sendSMS(message).then(response = console.log(response));
            </code>
            <a
              href="https://www.briq.tz/developer-docs"
              target="_blank"
              rel="noopener noreferrer"
            >
              <button className="bg-[#fddf0d] hover:bg-[#fddf0d]/80 text-black px-6 py-2 rounded-lg">
                Explore Developer Docs
              </button>
            </a>
          </div>
        </div>

        {/* Your Business, Amplified by Briq Section */}
        <div className="flex flex-col md:flex-row items-center gap-8 mb-24">
          <div className="md:w-1/2">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900 text-center md:text-left">
              Your Business,{" "}
              <span className="text-[#fddf0d] [text-shadow:_0_0_10px_rgba(253,223,13,0.3)]">
                Amplified
              </span>{" "}
              by Briq
            </h2>
            <p className="text-gray-600 mb-6">
              Explore all the tools Briq offers to grow your business.
            </p>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <MessageSquare className="w-6 h-6 text-[#fddf0d]" />
                <div>
                  <h3 className="text-lg font-bold">Bulk SMS</h3>
                  <p className="text-gray-600">
                    Send targeted messages instantly at 14-17 TZS per SMS.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Lock className="w-6 h-6 text-[#fddf0d]" />
                <div>
                  <h3 className="text-lg font-bold">OTP Authentication</h3>
                  <p className="text-gray-600">
                    Secure logins and inventory management with OTP via SMS and
                    WhatsApp.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Phone className="w-6 h-6 text-[#fddf0d]" />
                <div>
                  <h3 className="text-lg font-bold">USSD Shortcodes</h3>
                  <p className="text-gray-600">
                    Engage customers with USSD, perfect for areas with limited
                    internet access.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Volume2 className="w-6 h-6 text-[#fddf0d]" />
                <div>
                  <h3 className="text-lg font-bold">AI-Powered AVR</h3>
                  <p className="text-gray-600">
                    Automate customer interactions with AI-driven voice-to-text
                    solutions.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <MessageSquare className="w-6 h-6 text-[#fddf0d]" />
                <div>
                  <h3 className="text-lg font-bold">
                    WhatsApp OTP & Marketing
                  </h3>
                  <p className="text-gray-600">
                    Boost engagement with secure OTPs and personalized WhatsApp
                    campaigns.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Bell className="w-6 h-6 text-[#fddf0d]" />
                <div>
                  <h3 className="text-lg font-bold">Flash & Push Messages</h3>
                  <p className="text-gray-600">
                    Deliver instant notifications to keep your customers
                    informed.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Code className="w-6 h-6 text-[#fddf0d]" />
                <div>
                  <h3 className="text-lg font-bold">APIs</h3>
                  <p className="text-gray-600">
                    Fast, scalable APIs for seamless integration into your
                    applications.
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div className="md:w-1/3 hidden md:block md:ml-auto">
            <img
              src={linesImage}
              alt="Your Business Amplified"
              className="w-full h-auto object-cover shadow-lg"
            />
          </div>
        </div>
      </div>
    </section>
  );
}

export default Features;