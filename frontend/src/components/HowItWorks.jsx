import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { UserPlus, MessageSquare, ShieldCheck } from "lucide-react";

const steps = [
  {
    icon: UserPlus,
    title: "Enter your beta info",
    description: "Tell us who you are and which phone number you want protected.",
  },
  {
    icon: MessageSquare,
    title: "Verify your forwarding number",
    description: "We send a short code to confirm the forwarding phone belongs to you.",
  },
  {
    icon: ShieldCheck,
    title: "Start testing protection",
    description: "Once verified, your beta setup is ready for call-protection testing.",
  },
];

export const HowItWorks = () => {
  return (
    <section className="py-16 sm:py-20">
      <div className="max-w-3xl mx-auto px-5 sm:px-8">
        <h2 className="text-base sm:text-lg font-semibold text-foreground mb-10">
          How it works
        </h2>

        <div className="grid gap-4 sm:gap-5">
          {steps.map((step, index) => (
            <Card
              key={index}
              className="shadow-card border-border/60 hover:shadow-elevated transition-base group"
            >
              <CardContent className="flex items-start gap-4 p-5 sm:p-6">
                {/* Step number + icon */}
                <div className="flex-shrink-0 flex items-center justify-center w-10 h-10 rounded-lg bg-accent text-accent-foreground group-hover:bg-primary group-hover:text-primary-foreground transition-base">
                  <step.icon className="w-5 h-5" />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-medium text-muted-foreground">
                      Step {index + 1}
                    </span>
                  </div>
                  <h3 className="text-sm sm:text-base font-medium text-foreground mb-1">
                    {step.title}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};
