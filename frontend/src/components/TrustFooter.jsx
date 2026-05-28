import React from "react";
import { Separator } from "@/components/ui/separator";
import { Shield, Info } from "lucide-react";

export const TrustFooter = () => {
  return (
    <footer className="py-12 sm:py-16">
      <div className="max-w-3xl mx-auto px-5 sm:px-8">
        <Separator className="mb-10" />

        <div className="flex flex-col items-center text-center gap-4">
          {/* Footer logo/brand */}
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-primary" />
            <span className="text-sm font-semibold text-foreground">
              NoMoreScamCalls
            </span>
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
