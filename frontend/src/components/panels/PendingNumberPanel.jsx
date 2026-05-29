import React from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Loader2, RotateCw } from "lucide-react";

export const PendingNumberPanel = ({
  fullName, email, protectedPhone,
  canCheckStatus, statusLoading, statusError,
  onCheckStatus,
}) => {
  return (
    <Card className="shadow-elevated border-border/60 animate-fade-in-up">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg sm:text-xl font-semibold text-foreground">
          Your beta request was received
        </CardTitle>
        <CardDescription className="text-sm text-muted-foreground">
          Your setup was created, but your assigned forwarding number is not ready yet.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="flex items-start gap-2.5 p-3 rounded-lg bg-success-muted" data-testid="status-onboarding">
            <CheckCircle2 className="w-4 h-4 text-success mt-0.5 flex-shrink-0" />
            <p className="text-sm text-success font-medium">Beta account created successfully.</p>
          </div>

          <div className="rounded-lg border border-warning/30 bg-warning/5 p-5" data-testid="status-assigned-number">
            <p className="text-sm text-foreground font-medium mb-2">Assigned forwarding number pending</p>
            <p className="text-sm text-muted-foreground mb-4">
              The beta team will provide the assigned number before you turn on call forwarding. Keep an eye out for follow-up instructions.
            </p>
            <div className="space-y-1.5 text-xs text-muted-foreground border-t border-border/40 pt-3 mt-3">
              {fullName && <p><span className="font-medium text-foreground">Name:</span> {fullName}</p>}
              {email && <p><span className="font-medium text-foreground">Email:</span> {email}</p>}
              {protectedPhone && <p><span className="font-medium text-foreground">Protected number:</span> {protectedPhone}</p>}
            </div>
          </div>

          {canCheckStatus && (
            <Button variant="outline" size="default" onClick={onCheckStatus} disabled={statusLoading} className="w-full" data-testid="button-check-status">
              {statusLoading ? (
                <><Loader2 className="w-4 h-4 animate-spin mr-2" />Checking...</>
              ) : (
                <><RotateCw className="w-4 h-4 mr-2" />Check setup status</>
              )}
            </Button>
          )}
          {statusError && <p className="text-xs text-destructive" data-testid="status-error">{statusError}</p>}
        </div>
      </CardContent>
    </Card>
  );
};
