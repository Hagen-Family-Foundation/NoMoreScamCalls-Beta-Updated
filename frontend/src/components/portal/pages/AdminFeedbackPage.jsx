import React, { useCallback, useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, AlertCircle } from "lucide-react";
import { portalApi } from "@/lib/portalApi";
import { cn } from "@/lib/utils";

const FOLLOWUP_STATUSES = [
  { value: "open", label: "Open" },
  { value: "in_review", label: "In review" },
  { value: "resolved", label: "Resolved" },
];

function fmt(v) {
  if (!v) return "—";
  try { return new Date(v).toLocaleString(); } catch { return String(v); }
}

export default function AdminFeedbackPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [savingId, setSavingId] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const result = await portalApi.adminFeedback();
      setItems(Array.isArray(result) ? result : (result?.feedback || []));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const updateStatus = async (id, follow_up_status) => {
    setError("");
    setSavingId(id);
    try {
      await portalApi.adminUpdateFeedback(id, { follow_up_status });
      setItems((prev) => prev.map((it) => it.id === id ? { ...it, follow_up_status } : it));
    } catch (err) {
      setError(err.message);
    } finally {
      setSavingId(null);
    }
  };

  return (
    <div className="space-y-6" data-testid="admin-feedback">
      <div>
        <h1 className="text-2xl font-semibold text-foreground tracking-tight">Feedback</h1>
        <p className="text-sm text-muted-foreground mt-1">Reports submitted by beta participants.</p>
      </div>

      {error && (
        <div data-testid="status-error" className="flex items-start gap-2 p-3 rounded-lg bg-destructive/5 border border-destructive/20">
          <AlertCircle className="w-4 h-4 text-destructive mt-0.5 flex-shrink-0" />
          <p className="text-sm text-destructive">{error}</p>
        </div>
      )}

      {loading ? (
        <Card className="border-border/60">
          <CardContent className="p-6 flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="w-4 h-4 animate-spin" /> Loading feedback...
          </CardContent>
        </Card>
      ) : items.length === 0 ? (
        <Card className="border-border/60">
          <CardContent className="p-6 text-sm text-muted-foreground">No feedback submitted yet.</CardContent>
        </Card>
      ) : (
        <ul className="space-y-4" data-testid="list-feedback">
          {items.map((item) => (
            <li key={item.id}>
              <Card className="border-border/60">
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-start justify-between gap-4 flex-wrap">
                    <div>
                      <div className="text-xs text-muted-foreground">
                        {fmt(item.submitted_at || item.created_at)}
                        {item.participant_name && <> · {item.participant_name}</>}
                        {item.participant_email && <> · <span className="text-foreground">{item.participant_email}</span></>}
                      </div>
                      <div className="text-sm font-medium text-foreground mt-1">
                        {item.category_label || item.category || "General observation"}
                      </div>
                    </div>
                    <Badge variant="outline" className={cn(
                      "text-[10px]",
                      item.follow_up_status === "resolved" && "border-success/30 text-success bg-success-muted",
                      item.follow_up_status === "in_review" && "border-primary/30 text-primary bg-primary-glow",
                    )}>
                      {item.follow_up_status || "open"}
                    </Badge>
                  </div>

                  {item.related_call_id && (
                    <div className="text-xs text-muted-foreground">
                      Related call: <span className="font-mono text-foreground">{item.related_call_id}</span>
                    </div>
                  )}

                  <p className="text-sm text-foreground whitespace-pre-wrap">{item.comments}</p>

                  <div className="flex gap-2 pt-2 border-t border-border/40">
                    {FOLLOWUP_STATUSES.map((s) => (
                      <Button
                        key={s.value}
                        variant={item.follow_up_status === s.value ? "cta" : "outline"}
                        size="sm"
                        onClick={() => updateStatus(item.id, s.value)}
                        disabled={savingId === item.id}
                        data-testid={`button-set-followup-${item.id}-${s.value}`}
                      >
                        {savingId === item.id && item.follow_up_status !== s.value ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : s.label}
                      </Button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
