import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { UserPlus, PhoneIncoming, PhoneForwarded, ShieldCheck } from "lucide-react";

const STEPS = [
  {
    id: "enter-info",
    icon: UserPlus,
    title: "Enter your beta info",
    description: "Tell us who you are and which phone number you want protected.",
  },
  {
    id: "receive-number",
    icon: PhoneIncoming,
    title: "Receive your assigned forwarding number",
    description:
      "After your beta account is created, you will then receive a system number that you will use to setup call forwarding.",
  },
  {
    id: "turn-on-forwarding",
    icon: PhoneForwarded,
    title: "Turn on call forwarding",
    description:
      "Use your carrier\u2019s call-forwarding feature to forward your protected phone number to the assigned number shown on this page.",
  },
  {
    id: "ready-test-call",
    icon: ShieldCheck,
    title: "Ready for your first test call",
    description:
      "After forwarding is turned on, click \u201CI have turned on call forwarding.\u201D We\u2019ll place a first test call to confirm the system is connected correctly.",
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
          {STEPS.map((step, index) => (
            <Card
              key={step.id}
              className="shadow-card border-border/60 hover:shadow-elevated transition-base group"
            >
              <CardContent className="flex items-start gap-4 p-5 sm:p-6">
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
