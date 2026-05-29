import React from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, AlertCircle, PhoneForwarded } from "lucide-react";
import { CopyNumberButton } from "@/components/panels/CopyNumberButton";

const INSTRUCTIONS = [
  { id: "open-settings", text: "Open your phone carrier's call-forwarding settings or use your carrier's forwarding code." },
  { id: "set-forward", textFn: (phone) => <>Set your protected number <span className="font-medium text-foreground">({phone})</span> to forward calls to the assigned number shown above.</> },
  { id: "return-page", text: "Return to this page when forwarding is turned on." },
  { id: "click-confirm", text: <>Click <span className="font-medium text-foreground">"I have turned on call forwarding"</span> below.</> },
];

export const ForwardingInstructionsPanel = ({
  systemNumber, protectedPhone,
  copied, onCopyNumber,
  error, loading,
  onConfirmForwarding,
}) => {
  return (
    <Card className="shadow-elevated border-border/60 animate-fade-in-up">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg sm:text-xl font-semibold text-foreground">
          Turn on call forwarding
        </CardTitle>
        <CardDescription className="text-sm text-muted-foreground">
          Use your carrier's call-forwarding feature to forward your protected number to the assigned number below.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Number reminder */}
          <div className="rounded-lg border border-border bg-secondary/40 p-4" data-testid="status-forwarding">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
              Forward calls to this number
            </p>
            <div className="flex items-center gap-3">
              <span className="text-xl sm:text-2xl font-semibold text-foreground tracking-wide font-mono" data-testid="text-assigned-forwarding-number">
                {systemNumber}
              </span>
              <CopyNumberButton copied={copied} onClick={onCopyNumber} size="sm" />
            </div>
          </div>

          {/* Instructions */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-foreground">How to set up forwarding</h4>
            <div className="space-y-2.5">
              {INSTRUCTIONS.map((item, i) => (
                <div key={item.id} className="flex items-start gap-3">
                  <span className="flex-shrink-0 flex items-center justify-center w-6 h-6 rounded-full bg-accent text-accent-foreground text-xs font-medium">
                    {i + 1}
                  </span>
                  <p className="text-sm text-muted-foreground leading-relaxed pt-0.5">
                    {item.textFn ? item.textFn(protectedPhone) : item.text}
                  </p>
                </div>
              ))}
            </div>
            <div className="rounded-lg border border-border/60 bg-accent/30 p-3 mt-2">
              <p className="text-xs text-muted-foreground leading-relaxed">
                <span className="font-medium text-foreground">Note:</span> Call forwarding setup varies by carrier. Check your phone's settings, your carrier's app, or contact your carrier directly if you need help.
              </p>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div data-testid="status-error" className="flex items-start gap-2 p-3 rounded-lg bg-destructive/5 border border-destructive/20">
              <AlertCircle className="w-4 h-4 text-destructive mt-0.5 flex-shrink-0" />
              <p className="text-sm text-destructive">{error}</p>
            </div>
          )}

          <Button variant="cta" size="lg" className="w-full" onClick={onConfirmForwarding} disabled={loading} data-testid="button-forwarding-turned-on">
            {loading ? (
              <><Loader2 className="w-4 h-4 animate-spin" />Saving...</>
            ) : (
              <><PhoneForwarded className="w-4 h-4 mr-2" />I have turned on call forwarding</>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
