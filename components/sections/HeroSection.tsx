"use client";
import Image from "next/image";
import { Scale } from "lucide-react";
import { NumberTicker } from "@/components/magicui/number-ticker";

const HeroSection = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      <Image
        src="/background.png"
        alt="Background"
        fill
        className="absolute inset-0 object-cover opacity-18 z-0"
      />

      <div className="absolute inset-0 bg-background/10 z-10" />

      <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="inline-flex items-center space-x-2 border text-primary rounded-none px-4 py-1 text-sm mb-8">
          <Scale className="w-4 h-4" />
          <span>Introducing Adhikaar</span>
        </div>

        <h1 className="text-2xl sm:text-xl lg:text-5xl font-bold mb-4">
          <span className="block">
            Seamless Legal Support for <br /> India with AI
          </span>
        </h1>

        <p className="text-md text-muted-foreground mb-4 max-w-3xl mx-auto leading-relaxed">
          Your intelligent legal companion for document drafting, real-time
          translation, case research, and secure access to verified advocates
          across India.
        </p>

        <div className="flex items-center justify-center gap-2">
          <span className="text-sm text-muted-foreground leading-none">
            Powered by
          </span>
          <Image
            src="/gemini-logo.svg"
            alt="Gemini AI"
            width={20}
            height={20}
            className="h-10 w-10"
          />
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-7xl mt-6 mx-auto">
          {[
            { number: "500+", label: "Legal Documents" },
            { number: "50+", label: "Expert Lawyers" },
            { number: "1000+", label: "Cases Resolved" },
            { number: "24", label: "AI Support" },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="text-lg sm:text-2xl font-bold text-primary mb-2">
                <NumberTicker
                  value={parseInt(stat.number.replace(/[^\d]/g, ""))}
                />
                {stat.number.includes("+") && "+"}
              </div>
              <div className="text-muted-foreground">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
