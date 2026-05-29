import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { ShieldCheck, CheckCircle2 } from "lucide-react";
import { STATUS_LABELS } from "@/lib/api";
import { StatusActions } from "@/components/panels/StatusActions";

const CHECKLIST = [
  { id: "account-created", label: "Beta account created" },
  { id: "number-provided", label: "Assigned forwarding number provided" },
  { id: "forwarding-on", label: "Call forwarding marked as turned on" },
  { id: "test-pending", label: "First test call pending" },
];

export const TestCallPendingPanel = ({
  statusLabel, statusLoading, statusError, onCheckStatus,
}) => {
  return (
    <Card className="shadow-elevated border-success/30 animate-fade-in-up" data-testid="status-test-call">
      <CardContent className="p-6 sm:p-8">
        <div className="flex flex-col items-center text-center">
          <div className="flex items-center justify-center w-16 h-16 rounded-full bg-success-muted mb-5 animate-scale-in">
            <ShieldCheck className="w-8 h-8 text-success" />
          </div>
          <h3 className="text-xl sm:text-2xl font-semibold text-foreground mb-2">
            Ready for your first test call.
          </h3>
          <p className="text-sm text-muted-foreground mb-6 max-w-sm">
            Your setup has been received. We'll use the first test call to confirm that your protected number is forwarding through the system correctly.
          </p>

          {statusLabel && STATUS_LABELS[statusLabel] && (
            <div className="mb-4 px-3 py-1.5 rounded-full bg-accent text-accent-foreground text-xs font-medium">
              Status: {STATUS_LABELS[statusLabel]}
            </div>
          )}

          <div className="w-full max-w-xs space-y-3 mb-6">
            {CHECKLIST.map((item, i) => (
              <div key={item.id} className="flex items-center gap-3 p-3 rounded-lg bg-success-muted animate-fade-in" style={{ animationDelay: `${i * 150}ms` }}>
                <CheckCircle2 className="w-5 h-5 text-success flex-shrink-0" />
                <span className="text-sm font-medium text-foreground">{item.label}</span>
              </div>
            ))}
          </div>

          <StatusActions statusLoading={statusLoading} statusError={statusError} onCheckStatus={onCheckStatus} />

          <p className="text-xs text-muted-foreground mt-4 max-w-sm">
            We'll contact you with beta testing instructions and next steps.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
