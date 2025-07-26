"use client";

import React from "react";

const TestimonialsSection = () => {
  const stats = [
    { value: "98%", label: "Client Satisfaction" },
    { value: "10M+", label: "Legal Queries Resolved" },
    { value: "2,500+", label: "Active Lawyers" },
    { value: "150+", label: "Cities Covered" },
  ];

  return (
    <section className="py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-20">
          <h2 className="text-3xl sm:text-4xl font-bold text-primary mb-4">
            Trusted by Legal Professionals
          </h2>
          <p className="text-md text-muted-foreground mb-12 max-w-3xl mx-auto">
            Our platform has helped thousands of lawyers and clients navigate
            the legal system more efficiently.
          </p>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-lg sm:text-2xl font-bold mb-2">
                  {stat.value}
                </div>
                <div className="text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
