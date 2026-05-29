import React from "react";
import { Button } from "@/components/ui/button";
import { Loader2, RotateCw } from "lucide-react";

export const StatusActions = ({ statusLoading, statusError, onCheckStatus }) => (
  <>
    <Button variant="outline" size="default" onClick={onCheckStatus} disabled={statusLoading} className="w-full max-w-xs mb-3" data-testid="button-check-status">
      {statusLoading ? (
        <><Loader2 className="w-4 h-4 animate-spin mr-2" />Checking...</>
      ) : (
        <><RotateCw className="w-4 h-4 mr-2" />Check setup status</>
      )}
    </Button>
    {statusError && <p className="text-xs text-destructive mb-3 max-w-xs" data-testid="status-error">{statusError}</p>}
  </>
);
