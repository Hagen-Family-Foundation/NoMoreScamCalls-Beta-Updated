import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, RefreshCcw, TriangleAlert } from "lucide-react";
import { STATUS_LABELS } from "@/lib/api";
import { StatusActions } from "@/components/panels/StatusActions";

export const NeedsAttentionPanel = ({
  statusLabel, statusLoading, statusError,
  retryLoading,
  onCheckStatus, onRetryTestCall,
}) => {
  return (
    <Card className="shadow-elevated border-warning/30 animate-fade-in-up" data-testid="status-test-call">
      <CardContent className="p-6 sm:p-8">
        <div className="flex flex-col items-center text-center">
          <div className="flex items-center justify-center w-16 h-16 rounded-full bg-warning/10 mb-5 animate-scale-in">
            <TriangleAlert className="w-8 h-8 text-warning" />
          </div>
          <h3 className="text-xl sm:text-2xl font-semibold text-foreground mb-2">
            We could not confirm the connection yet.
          </h3>
          <p className="text-sm text-muted-foreground mb-6 max-w-sm">
            Please re-check your call-forwarding setup with your phone carrier. Make sure your protected number is forwarding to the assigned number shown earlier.
          </p>

          {statusLabel && STATUS_LABELS[statusLabel] && (
            <div className="mb-4 px-3 py-1.5 rounded-full bg-warning/10 text-warning text-xs font-medium">
              Status: {STATUS_LABELS[statusLabel]}
            </div>
          )}

          {statusError && <p className="text-xs text-destructive mb-3 max-w-xs" data-testid="status-error">{statusError}</p>}

          <div className="w-full max-w-xs space-y-3">
            <Button variant="cta" size="lg" className="w-full" onClick={onRetryTestCall} disabled={retryLoading} data-testid="button-retry-test-call">
              {retryLoading ? <><Loader2 className="w-4 h-4 animate-spin" />Retrying...</> : <><RefreshCcw className="w-4 h-4 mr-2" />Try again</>}
            </Button>
            <StatusActions statusLoading={statusLoading} statusError={null} onCheckStatus={onCheckStatus} />
          </div>

          <p className="text-xs text-muted-foreground mt-4 max-w-sm">
            If the issue persists, contact the beta coordinator for help.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
