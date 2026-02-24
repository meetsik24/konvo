/**
 * Landing page content & data
 * Centralized content for all landing pages
 */

// ============= HOME PAGE =============

export const rotatingTexts = [
  { main: "Enterprise SMS Solutions", tag: "ENTERPRISE", accent: "Power Tanzania's Leading Banks" },
  { main: "WhatsApp Business API", tag: "OFFICIAL", accent: "Drive E-commerce Growth" },
  { main: "Voice & SMS OTP", tag: "SECURE", accent: "Enterprise-Grade Security" },
  { main: "AI-Powered Chatbots", tag: "INTELLIGENT", accent: "Automate Customer Support" }
];

export const mockups = [
  {
    title: "SMS Campaigns",
    campaigns: [
      { type: "BANK ALERTS", name: "Transaction OTP", sent: "12,847", delivered: "12,801", rate: "99.6%" },
      { type: "FINTECH", name: "Payment Confirm", sent: "8,124", delivered: "7,987", rate: "98.3%" },
      { type: "ENTERPRISE", name: "Staff Alerts", sent: "5,856", delivered: "5,842", rate: "99.8%" }
    ]
  },
  {
    title: "WhatsApp Business",
    campaigns: [
      { type: "E-COMMERCE", name: "Order Updates", sent: "9,321", delivered: "9,198", rate: "98.7%" },
      { type: "SUPPORT", name: "Auto Responses", sent: "15,567", delivered: "15,389", rate: "98.9%" },
      { type: "MARKETING", name: "Flash Sales", sent: "6,234", delivered: "6,121", rate: "98.2%" }
    ]
  },
  {
    title: "Voice & Chatbots",
    campaigns: [
      { type: "VOICE OTP", name: "2FA Verification", sent: "4,521", delivered: "4,498", rate: "99.5%" },
      { type: "AI CHATBOT", name: "24/7 Support", sent: "18,234", delivered: "18,001", rate: "98.7%" },
      { type: "IVR", name: "Call Routing", sent: "7,456", delivered: "7,423", rate: "99.6%" }
    ]
  }
];

export const stats = [
  { value: "99.9%", label: "Uptime Reliability" },
  { value: "5,000+", label: "Messages / Sec" },
  { value: "98.5%", label: "Delivery Rate" },
  { value: "24ms", label: "Average Latency" },
];

export const logos = [
  "CRDB Bank", "NMB Bank", "Equity Bank", "Azam Pay", "M-Pesa", "Airtel Money", "Tigo Pesa"
];

export const trustReasons = [
  {
    title: "Enterprise Security",
    description: "Bank-grade encryption and compliance. SOC 2, ISO certified infrastructure. Your data stays secure."
  },
  {
    title: "Scale with Confidence",
    description: "Built to handle millions of messages daily. 99.9% uptime SLA. Direct carrier connections across all networks."
  },
  {
    title: "Local Expert Support",
    description: "Dedicated account managers and 24/7 technical support. Tanzania-based team that understands your business."
  }
];

export const solutions = [
  {
    title: "Bulk SMS",
    description: "Enterprise-grade SMS for banks, fintechs, and e-commerce. Transaction alerts, OTP, marketing campaigns. 14-17 TZS per SMS."
  },
  {
    title: "WhatsApp Business API",
    description: "Official WhatsApp Business API for customer engagement. Automate order updates, support, and marketing for your business."
  },
  {
    title: "Voice & OTP",
    description: "Secure multi-channel authentication. SMS OTP, WhatsApp OTP, Voice calls. Perfect for banks and tech platforms."
  },
  {
    title: "AI Chatbots",
    description: "Smart conversational AI for 24/7 customer support. Reduce support costs while improving response times."
  }
];

export const steps = [
  {
    number: "01",
    title: "Sign up & verify",
    description: "Create your account in minutes. No credit card required to get started."
  },
  {
    number: "02",
    title: "Import your contacts",
    description: "Upload contacts via CSV or sync from your CRM. Segment your audience for targeted campaigns."
  },
  {
    number: "03",
    title: "Send your campaign",
    description: "Create and send messages, schedule campaigns, or set up automated workflows."
  },
  {
    number: "04",
    title: "Track performance",
    description: "Monitor delivery reports, track engagement, and optimize your messaging strategy."
  }
];

export const testimonials = [
  {
    quote: "Briq powers our transaction alerts and OTP authentication. 99.8% delivery rate with sub-second latency. Critical for our banking operations.",
    author: "James Mwakasege",
    role: "CTO",
    company: "TanzaPay Digital"
  },
  {
    quote: "Integrated WhatsApp Business API in 2 days. Now handling 50K+ order confirmations monthly. Customer satisfaction up 40%.",
    author: "Sarah Kimaro",
    role: "Head of Operations",
    company: "Sokoni E-commerce"
  },
  {
    quote: "Their AI chatbot reduced our support load by 60%. Handles common queries 24/7 while our team focuses on complex issues.",
    author: "Michael Hassan",
    role: "Customer Success Lead",
    company: "FinTech Solutions TZ"
  }
];

export const homePageFaqs = [
  {
    q: "How quickly can I start sending messages?",
    a: "You can start sending within minutes of signing up. Sender ID approval takes 24-48 hours for branded campaigns."
  },
  {
    q: "What does it cost per SMS?",
    a: "14-17 TZS per message depending on the network. No hidden fees. Pay only for what you send."
  },
  {
    q: "Which networks do you support?",
    a: "All major Tanzanian networks: Vodacom, Airtel, Tigo, Halotel, and more. Direct carrier connections ensure high delivery rates."
  },
  {
    q: "Can I integrate with my website?",
    a: "Yes. We provide REST APIs and SDKs for PHP, Python, Node.js. Full documentation and code examples available."
  },
  {
    q: "Is there a contract?",
    a: "No contracts. Pay as you go. Top up your account and start sending. Cancel anytime."
  }
];

// ============= FEATURES PAGE =============

export const features = [
  {
    id: "sms",
    title: "Bulk SMS",
    tagline: "Reach every customer instantly",
    description: "Send thousands of messages per second to all Tanzanian networks. Custom Sender IDs, Unicode support for Swahili, scheduled campaigns, and detailed delivery reports.",
    price: "14-17 TZS per SMS",
    capabilities: [
      "Custom Sender IDs",
      "Unicode (Swahili) support",
      "CSV bulk import",
      "Scheduled campaigns",
      "Two-way messaging",
      "Real-time delivery reports"
    ]
  },
  {
    id: "whatsapp",
    title: "WhatsApp Business",
    tagline: "Connect where your customers are",
    description: "Send bulk WhatsApp messages, automate customer replies, and manage conversations from one dashboard. Rich media support including images, documents, and location sharing.",
    price: "Contact for pricing",
    capabilities: [
      "Bulk messaging campaigns",
      "Rich media (images, PDFs)",
      "Automated responses",
      "Contact management",
      "Campaign analytics",
      "Cloud API integration"
    ]
  },
  {
    id: "voice",
    title: "Voice & OTP",
    tagline: "Secure authentication",
    description: "SMS OTP, WhatsApp OTP, and voice verification. Multi-channel fallback ensures every authentication succeeds, even when one channel fails.",
    price: "Per verification pricing",
    capabilities: [
      "SMS OTP delivery",
      "WhatsApp OTP",
      "Voice call OTP",
      "Automatic fallback",
      "Custom OTP templates",
      "2FA integration APIs"
    ]
  },
  {
    id: "chatbots",
    title: "AI Chatbots",
    tagline: "24/7 automated support",
    description: "Deploy intelligent chatbots that understand context, answer customer questions, capture leads, and hand off to humans when needed.",
    price: "From $49/month",
    capabilities: [
      "Natural language understanding",
      "Multi-platform deployment",
      "Lead capture & qualification",
      "Analytics & insights",
      "Human agent handoff",
      "Custom knowledge training"
    ]
  },
  {
    id: "payments",
    title: "Payments",
    tagline: "Collect and reconcile instantly",
    description: "Accept payments via mobile money and bank channels with real-time status updates and automated reconciliation.",
    price: "Contact for pricing",
    capabilities: [
      "Mobile money collections",
      "Instant payment status",
      "Automated reconciliation",
      "Payment links & invoices",
      "Webhooks & callbacks",
      "Fraud monitoring"
    ]
  },
  {
    id: "events",
    title: "Event Management",
    tagline: "Engage and manage attendees",
    description: "Create events, sell tickets, and keep attendees informed through automated messaging and real-time updates.",
    price: "Contact for pricing",
    capabilities: [
      "Ticketing & check-in",
      "Bulk attendee updates",
      "RSVP & confirmations",
      "Payment integration",
      "Attendance analytics",
      "Automated reminders"
    ]
  }
];

// ============= PRICING PAGE =============

export const smsRates = [
  { network: "Vodacom", rate: "14 TZS" },
  { network: "Airtel", rate: "15 TZS" },
  { network: "Tigo", rate: "16 TZS" },
  { network: "Halotel", rate: "17 TZS" },
];

export const plans = [
  {
    name: "Starter",
    price: "Pay as you go",
    description: "Perfect for testing and small campaigns",
    features: [
      "No monthly fee",
      "14-17 TZS per SMS",
      "Basic reporting",
      "Email support",
      "API access",
      "CSV import"
    ],
    cta: "Get started",
    highlighted: false
  },
  {
    name: "Business",
    price: "Volume discounts",
    description: "For growing businesses",
    features: [
      "No monthly fee",
      "12-15 TZS per SMS",
      "Advanced analytics",
      "Priority support",
      "Account manager",
      "Custom integrations",
      "Webhooks included",
      "White-label options"
    ],
    cta: "Contact sales",
    highlighted: true
  },
  {
    name: "Enterprise",
    price: "Custom pricing",
    description: "Full messaging platform",
    features: [
      "Custom SLA",
      "10-13 TZS per SMS",
      "Dedicated infrastructure",
      "24/7 phone support",
      "Custom development",
      "Compliance support",
      "Training included",
      "Multi-user accounts"
    ],
    cta: "Contact sales",
    highlighted: false
  }
];

export const pricingPageFaqs = [
  {
    q: "How does pay-as-you-go work?",
    a: "Top up your account with any amount (minimum 10,000 TZS). You only pay for messages sent. No monthly fees or expiration dates."
  },
  {
    q: "Are there volume discounts?",
    a: "Yes. The more you send, the less you pay per message. Contact sales for custom pricing if you send over 100,000 messages monthly."
  },
  {
    q: "What's included in API access?",
    a: "REST API, SDKs for multiple languages, webhooks, and comprehensive documentation. All plans include unlimited API calls."
  },
  {
    q: "Can I switch plans?",
    a: "Yes, anytime. No contracts or cancellation fees. Just contact support to adjust your plan."
  },
  {
    q: "What payment methods are accepted?",
    a: "M-Pesa, Airtel Money, Tigo Pesa, bank transfer, and credit cards. Invoicing available for corporate accounts."
  }
];

// ============= LEARN WITH BRIQ PAGE =============

export const learnResources = [
  {
    icon: "FileText",
    title: "Documentation",
    description: "Comprehensive guides for all Briq products",
    href: "https://docs.briq.tz",
    external: true,
  },
  {
    icon: "Code",
    title: "API Reference",
    description: "Complete API documentation with examples",
    href: "https://docs.briq.tz/api",
    external: true,
  },
  {
    icon: "BookOpen",
    title: "Tutorials",
    description: "Step-by-step integration guides",
    href: "https://docs.briq.tz/tutorials",
    external: true,
  },
];

export const tutorials = [
  {
    title: "Getting Started with Bulk SMS",
    videoId: "t1zaDwbPmyo",
    duration: "5 min",
    category: "Beginner",
    description: "Learn the basics of sending SMS campaigns",
  },
  {
    title: "WhatsApp Business API Setup",
    videoId: "t1zaDwbPmyo",
    duration: "8 min",
    category: "Integration",
    description: "Connect your WhatsApp Business account",
  },
  {
    title: "OTP Verification Implementation",
    videoId: "t1zaDwbPmyo",
    duration: "12 min",
    category: "Developer",
    description: "Secure your app with OTP verification",
  },
  {
    title: "Managing Campaigns",
    videoId: "t1zaDwbPmyo",
    duration: "6 min",
    category: "Beginner",
    description: "Create and manage messaging campaigns",
  },
  {
    title: "Webhook Configuration",
    videoId: "t1zaDwbPmyo",
    duration: "10 min",
    category: "Developer",
    description: "Set up webhooks for real-time events",
  },
  {
    title: "Analytics Dashboard Overview",
    videoId: "t1zaDwbPmyo",
    duration: "4 min",
    category: "Beginner",
    description: "Understand your messaging metrics",
  },
];

export const qaSessions = [
  {
    title: "Weekly Developer Q&A",
    day: "Every Wednesday",
    time: "3:00 PM EAT",
    description: "Live Q&A session for developers integrating Briq APIs",
    type: "live",
  },
  {
    title: "Getting Started Office Hours",
    day: "Every Monday",
    time: "10:00 AM EAT",
    description: "Perfect for new users - ask anything about the platform",
    type: "live",
  },
  {
    title: "Advanced Integration Session",
    day: "First Friday of Month",
    time: "2:00 PM EAT",
    description: "Deep dive sessions on complex use cases and best practices",
    type: "monthly",
  },
];

