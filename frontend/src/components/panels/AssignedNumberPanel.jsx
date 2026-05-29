import React from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, ArrowRight } from "lucide-react";
import { CopyNumberButton } from "@/components/panels/CopyNumberButton";

export const AssignedNumberPanel = ({
  systemNumber,
  protectedPhone,
  copied,
  onCopyNumber,
  onContinue,
}) => {
  return (
    <Card className="shadow-elevated border-border/60 animate-fade-in-up">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg sm:text-xl font-semibold text-foreground">
          Your assigned forwarding number
        </CardTitle>
        <CardDescription className="text-sm text-muted-foreground">
          Use this number as the destination when turning on call forwarding with your phone carrier.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="flex items-start gap-2.5 p-3 rounded-lg bg-success-muted" data-testid="status-onboarding">
            <CheckCircle2 className="w-4 h-4 text-success mt-0.5 flex-shrink-0" />
            <p className="text-sm text-success font-medium">Beta account created successfully.</p>
          </div>

          <div className="rounded-lg border border-primary/20 bg-primary-glow/30 p-5" data-testid="status-assigned-number">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-3">
              Your assigned forwarding number
            </p>
            <div className="flex items-center gap-3">
              <span className="text-2xl sm:text-3xl font-semibold text-foreground tracking-wide font-mono" data-testid="text-assigned-forwarding-number">
                {systemNumber}
              </span>
              <CopyNumberButton copied={copied} onClick={onCopyNumber} />
            </div>
            <p className="text-xs text-muted-foreground mt-3">
              This is the number your protected phone should forward to during the beta.
            </p>
          </div>

          <p className="text-sm text-muted-foreground leading-relaxed">
            Save or copy this number. In the next step, you'll set up your phone carrier's call-forwarding feature to forward calls from your protected number{" "}
            <span className="font-medium text-foreground">({protectedPhone})</span> to the assigned number.
          </p>

          <Button variant="cta" size="lg" className="w-full" onClick={onContinue} data-testid="button-continue-to-forwarding">
            Continue to forwarding setup
            <ArrowRight className="w-4 h-4 ml-1" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
