import React from "react";
import { Separator } from "@/components/ui/separator";
import { Shield, Info, Mail } from "lucide-react";

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

          {/* Support email */}
          <a
            href="mailto:support@nomorescamcalls.com"
            className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
            data-testid="link-support-email"
          >
            <Mail className="w-3 h-3" />
            <span>support@nomorescamcalls.com</span>
          </a>
        </div>
      </div>
    </footer>
  );
};
