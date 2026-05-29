import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { PhoneCall } from "lucide-react";
import { STATUS_LABELS } from "@/lib/api";
import { StatusActions } from "@/components/panels/StatusActions";

export const TestCallStartedPanel = ({
  statusLabel, statusLoading, statusError, onCheckStatus,
}) => {
  return (
    <Card className="shadow-elevated border-primary/30 animate-fade-in-up" data-testid="status-test-call">
      <CardContent className="p-6 sm:p-8">
        <div className="flex flex-col items-center text-center">
          <div className="flex items-center justify-center w-16 h-16 rounded-full bg-primary-glow mb-5 animate-pulse-gentle">
            <PhoneCall className="w-8 h-8 text-primary" />
          </div>
          <h3 className="text-xl sm:text-2xl font-semibold text-foreground mb-2">
            First test call started.
          </h3>
          <p className="text-sm text-muted-foreground mb-6 max-w-sm">
            Answer the call and listen for the confirmation message. This call is used to confirm that your protected number is forwarding through the system correctly.
          </p>

          {statusLabel && STATUS_LABELS[statusLabel] && (
            <div className="mb-4 px-3 py-1.5 rounded-full bg-accent text-accent-foreground text-xs font-medium">
              Status: {STATUS_LABELS[statusLabel]}
            </div>
          )}

          <StatusActions statusLoading={statusLoading} statusError={statusError} onCheckStatus={onCheckStatus} />
        </div>
      </CardContent>
    </Card>
  );
};
