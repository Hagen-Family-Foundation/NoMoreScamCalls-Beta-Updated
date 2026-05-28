import React from "react";
import { Separator } from "@/components/ui/separator";
import { Shield, Lock, Info } from "lucide-react";

const footerItems = [
  "Private beta",
  "Call protection setup only",
];

export const TrustFooter = () => {
  return (
    <footer className="py-12 sm:py-16">
      <div className="max-w-3xl mx-auto px-5 sm:px-8">
        <Separator className="mb-10" />

        <div className="flex flex-col items-center text-center">
          {/* Footer logo/brand */}
          <div className="flex items-center gap-2 mb-5">
            <Shield className="w-5 h-5 text-primary" />
            <span className="text-sm font-semibold text-foreground">
              NoMoreScamCalls
            </span>
          </div>

          {/* Trust items */}
          <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 mb-6">
            {footerItems.map((item, index) => (
              <div key={index} className="flex items-center gap-1.5">
                <Lock className="w-3 h-3 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">{item}</span>
              </div>
            ))}
          </div>

          {/* Contact */}
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Info className="w-3 h-3" />
            <span>Questions? Contact the beta coordinator.</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
