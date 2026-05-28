import React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Shield, ArrowDown } from "lucide-react";

export const HeroSection = ({ onStartSetup }) => {
  return (
    <section className="relative overflow-hidden">
      {/* Subtle background decoration */}
      <div className="absolute inset-0 pointer-events-none">
        <div
          className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full opacity-[0.04]"
          style={{ background: 'radial-gradient(circle, hsl(var(--primary)) 0%, transparent 70%)' }}
        />
        <div
          className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full opacity-[0.03]"
          style={{ background: 'radial-gradient(circle, hsl(var(--success)) 0%, transparent 70%)' }}
        />
      </div>

      <div className="relative max-w-3xl mx-auto px-5 sm:px-8 pt-20 sm:pt-28 pb-16 sm:pb-24">
        <div className="flex flex-col items-start gap-6">
          {/* Beta badge */}
          <Badge variant="beta" className="animate-fade-in">
            <Shield className="w-3 h-3 mr-1.5" />
            Private Beta
          </Badge>

          {/* Headline */}
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-semibold leading-tight text-foreground animate-fade-in [animation-delay:100ms] opacity-0">
            Help us test a smarter way to stop scam calls.
          </h1>

          {/* Subheadline */}
          <p className="text-base sm:text-lg text-muted-foreground leading-relaxed max-w-2xl animate-fade-in [animation-delay:200ms] opacity-0">
            NoMoreScamCalls is opening a private beta for early testers. The setup is simple: enter your beta information, verify your forwarding number, and help us test the call protection flow before public launch.
          </p>

          {/* CTA */}
          <Button
            variant="cta"
            size="xl"
            onClick={onStartSetup}
            className="animate-fade-in [animation-delay:300ms] opacity-0 mt-2"
          >
            Start beta setup
            <ArrowDown className="w-4 h-4 ml-1" />
          </Button>

          {/* Reassurance */}
          <p className="text-sm text-muted-foreground leading-relaxed animate-fade-in [animation-delay:400ms] opacity-0">
            This beta focuses only on call protection setup. Email scanning, SMS scanning, web reputation tools, and Skeeter features are not active in this beta.
          </p>
        </div>
      </div>
    </section>
  );
};
