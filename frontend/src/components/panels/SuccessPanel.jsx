import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { ShieldCheck, CheckCircle2 } from "lucide-react";
import { StatusActions } from "@/components/panels/StatusActions";

const CHECKLIST = [
  { id: "account-created", label: "Beta account created" },
  { id: "number-provided", label: "Assigned forwarding number provided" },
  { id: "forwarding-confirmed", label: "Call forwarding confirmed" },
  { id: "test-completed", label: "First test call completed" },
  { id: "protection-active", label: "Protection active" },
];

export const SuccessPanel = ({
  statusLoading, statusError, onCheckStatus,
}) => {
  return (
    <Card className="shadow-elevated border-success/30 animate-fade-in-up" data-testid="status-success">
      <CardContent className="p-6 sm:p-8">
        <div className="flex flex-col items-center text-center">
          <div className="flex items-center justify-center w-16 h-16 rounded-full bg-success-muted mb-5 animate-scale-in">
            <ShieldCheck className="w-8 h-8 text-success" />
          </div>
          <h3 className="text-xl sm:text-2xl font-semibold text-foreground mb-2">
            Your phone is now protected.
          </h3>
          <p className="text-sm text-muted-foreground mb-6 max-w-sm">
            Your setup is complete. The first test call confirmed that your protected number is forwarding through the system correctly.
          </p>

          <div className="w-full max-w-xs space-y-3 mb-6">
            {CHECKLIST.map((item, i) => (
              <div key={item.id} className="flex items-center gap-3 p-3 rounded-lg bg-success-muted animate-fade-in" style={{ animationDelay: `${i * 120}ms` }}>
                <CheckCircle2 className="w-5 h-5 text-success flex-shrink-0" />
                <span className="text-sm font-medium text-foreground">{item.label}</span>
              </div>
            ))}
          </div>

          <StatusActions statusLoading={statusLoading} statusError={statusError} onCheckStatus={onCheckStatus} />

          <p className="text-xs text-muted-foreground mt-4 max-w-sm">
            We'll contact you with any updates or next steps.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
