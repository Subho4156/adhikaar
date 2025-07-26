"use client";

import {
  MessageSquare,
  Shield,
  BookOpen,
  Video,
  ArrowRight,
  FileSearch ,
} from "lucide-react";

const ServicesSection = () => {
  const services = [
    {
      icon: <MessageSquare className="w-8 h-8" />,
      title: "AI Legal Chatbot",
      description:
        "Get instant answers to your legal questions with our advanced AI assistant trained on Indian law.",
      features: [
        "24/7 Availability",
        "Multi-language Support",
        "Case Law References",
      ],
      href: "/chatbot",
    },
    {
      icon: <Shield className="w-8 h-8" />,
      title: "V-KYC Portal",
      description:
        "Secure video-based Know Your Customer verification for lawyers and clients with digital document validation.",
      features: [
        "Video Verification",
        "Document Upload",
        "Real-time Validation",
      ],
      href: "/profile",
    },
    {
      icon: <BookOpen className="w-8 h-8" />,
      title: "Legal Library",
      description:
        "Comprehensive database of Indian Constitution, IPC, CrPC, and landmark judgments with AI-powered search.",
      features: ["50,000+ Documents", "Smart Search", "AI Summaries"],
      href: "/library",
    },
    {
      icon: <FileSearch className="w-8 h-8" />,
      title: "Document Processor",
      description:
        "Securely upload and manage documents with smart validation and easy sharing.",
      features: ["Verified Lawyers", "Secure Calls", "Easy Scheduling"],
      href: "/document-processor",
    },
  ];

  return (
    <section className="py-12">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-10">
          <div className="inline-flex items-center space-x-2 bg-transparent border text-primary rounded-none px-4 py-2 text-sm mb-8">
            <span>Comprehensive Legal Solutions</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            Everything You Need for Legal Success
          </h2>
          <p className="text-md text-muted-foreground max-w-3xl mx-auto">
            From AI-powered research to secure consultations, our platform
            provides all the tools you need to navigate India's legal landscape
            efficiently.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-2 gap-6">
          {services.map((service) => (
            <div
              key={service.title}
              className="group relative border rounded-none p-8"
            >
              <div className={`inline-flex p-2 text-primary mb-4 duration-300`}>
                {service.icon}
              </div>

              <h3 className="text-xl font-bold mb-4">{service.title}</h3>
              <p className="text-muted-foreground text-sm mb-6 leading-relaxed">
                {service.description}
              </p>

              <a
                href={service.href}
                className="inline-flex text-sm items-center space-x-2 text-muted-foreground hover:text-primary "
              >
                <span>Learn More</span>
                <ArrowRight className="w-4 h-4" />
              </a>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ServicesSection;
