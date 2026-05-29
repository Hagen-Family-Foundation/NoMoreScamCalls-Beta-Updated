import React from "react";
import { Button } from "@/components/ui/button";
import { Copy, Check } from "lucide-react";
import { cn } from "@/lib/utils";

export const CopyNumberButton = ({ copied, onClick, size = "icon" }) => (
  <Button
    variant="ghost"
    size={size}
    onClick={onClick}
    className={cn(
      "text-muted-foreground hover:text-foreground",
      size === "icon" ? "h-9 w-9" : "h-8 w-8"
    )}
    aria-label="Copy number"
    data-testid="button-copy-number"
  >
    {copied ? <Check className="w-4 h-4 text-success" /> : <Copy className="w-4 h-4" />}
  </Button>
);
