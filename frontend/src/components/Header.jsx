import React from "react";
import { Shield } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export const Header = () => {
  return (
    <header className="sticky top-0 z-50 bg-background/90 backdrop-blur-md border-b border-border/50">
      <div className="max-w-3xl mx-auto px-5 sm:px-8 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Shield className="w-5 h-5 text-primary" />
          <span className="text-sm font-semibold text-foreground tracking-tight">
            NoMoreScamCalls
          </span>
        </div>
        <Badge variant="beta" className="text-[10px]">
          Beta
        </Badge>
      </div>
    </header>
  );
};
