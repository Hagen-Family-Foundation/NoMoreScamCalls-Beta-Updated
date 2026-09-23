import React, { useCallback, useEffect, useState } from "react";
import { AlertCircle, ChevronDown, ChevronUp, Loader2, RefreshCw } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { portalApi } from "@/lib/portalApi";
import { cn } from "@/lib/utils";

function formatDateTime(value) {
  if (!value) return "—";
  try { return new Date(value).toLocaleString(); } catch { return String(value); }
}

function formatValue(value) {
  if (value === null || value === undefined || value === "") return "—";
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
}

function statusLabel(status) {
  return {
    connected: "Connected",
    diverted: "Diverted",
    abandoned: "Caller ended",
    incomplete: "Incomplete",
    in_progress: "In progress",
  }[status] || status;
}

function StatusBadge({ status }) {
  return (
    <Badge
      variant="outline"
      className={cn(
        "text-[10px]",
        status === "connected" && "border-success/30 text-success bg-success-muted",
        status === "diverted" && "border-primary/30 text-primary bg-primary-glow",
        (status === "abandoned" || status === "incomplete") && "border-destructive/30 text-destructive bg-destructive/5"
      )}
    >
      {statusLabel(status)}
    </Badge>
  );
}

function SummaryCard({ label, value }) {
  return (
    <Card className="border-border/60">
      <CardContent className="p-4">
        <div className="text-xs uppercase tracking-wide text-muted-foreground">{label}</div>
        <div className="mt-2 text-2xl font-semibold text-foreground">{value ?? 0}</div>
      </CardContent>
    </Card>
  );
}

function EventTimeline({ detail, loading, error }) {
  if (loading) {
    return <div className="flex items-center gap-2 text-sm text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin" /> Loading event record...</div>;
  }
  if (error) return <p className="text-sm text-destructive">{error}</p>;
  if (!detail?.events?.length) return <p className="text-sm text-muted-foreground">No event record is available.</p>;

  return (
    <ol className="space-y-2" data-testid="call-event-timeline">
      {detail.events.map((event) => (
        <li key={event.id} className="grid gap-1 rounded-md border border-border/50 bg-background/50 p-3 md:grid-cols-[170px_1fr]">
          <div className="text-xs text-muted-foreground">{formatDateTime(event.occurredAt)}</div>
          <div className="min-w-0">
            <div className="text-xs font-medium text-foreground">{event.eventType}</div>
            {event.transcript && <div className="mt-1 text-sm text-foreground">“{event.transcript}”</div>}
            <div className="mt-1 text-xs text-muted-foreground">
              {[event.plannedAction, event.plannedCommand, event.hangupSource, event.hangupCause].filter(Boolean).join(" · ")}
            </div>
          </div>
        </li>
      ))}
    </ol>
  );
}

function CallResultCard({ call }) {
  const [expanded, setExpanded] = useState(false);
  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const toggle = async () => {
    const next = !expanded;
    setExpanded(next);
    if (!next || detail || loading) return;
    setLoading(true);
    setError("");
    try {
      setDetail(await portalApi.adminCallResult(call.callSessionId));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="border-border/60" data-testid={`call-result-${call.callSessionId}`}>
      <CardContent className="p-4 space-y-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <StatusBadge status={call.status} />
              <span className="text-sm font-medium text-foreground">{formatDateTime(call.startedAt)}</span>
            </div>
            <div className="mt-1 text-xs text-muted-foreground">System Number: <span className="font-mono text-foreground">{call.systemNumber || "—"}</span></div>
          </div>
          <div className="text-right">
            <div className="text-xs text-muted-foreground">Final standing</div>
            <div className="text-xl font-semibold text-foreground">{call.finalStanding ?? "—"}</div>
          </div>
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          <div className="rounded-md border border-border/50 p-3">
            <div className="text-xs font-medium text-muted-foreground">First response</div>
            <div className="mt-1 text-sm text-foreground">{call.prompt1Transcript || "No final transcript recorded"}</div>
            {call.prompt1Evaluation && <div className="mt-2 text-xs text-muted-foreground break-words">Evaluation: {formatValue(call.prompt1Evaluation)}</div>}
          </div>
          <div className="rounded-md border border-border/50 p-3">
            <div className="text-xs font-medium text-muted-foreground">Second response</div>
            <div className="mt-1 text-sm text-foreground">{call.prompt2Transcript || "No second response recorded"}</div>
            {call.prompt2Evaluation && <div className="mt-2 text-xs text-muted-foreground break-words">Evaluation: {formatValue(call.prompt2Evaluation)}</div>}
          </div>
        </div>

        <div className="flex flex-wrap gap-x-5 gap-y-1 text-xs text-muted-foreground">
          <span>Final transcripts: {call.finalTranscriptEvents}</span>
          <span>Evidence: {call.evidencePreserved ? "Preserved" : "Missing"}</span>
          <span>Recording: {call.recordingCompleted === true ? "Completed" : call.recordingCompleted === false ? "Not completed" : "Not confirmed"}</span>
          {(call.hangupSource || call.hangupCause) && <span>End: {[call.hangupSource, call.hangupCause].filter(Boolean).join(" · ")}</span>}
        </div>

        <Button variant="outline" size="sm" onClick={toggle} data-testid={`button-call-details-${call.callSessionId}`}>
          {expanded ? <ChevronUp className="mr-1.5 h-4 w-4" /> : <ChevronDown className="mr-1.5 h-4 w-4" />}
          {expanded ? "Hide event record" : "View event record"}
        </Button>

        {expanded && <div className="border-t border-border/50 pt-4"><EventTimeline detail={detail} loading={loading} error={error} /></div>}
      </CardContent>
    </Card>
  );
}

export default function AdminCallResultsPage() {
  const [result, setResult] = useState({ calls: [], summary: {} });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const response = await portalApi.adminCallResults(100);
      setResult({ calls: response?.calls || [], summary: response?.summary || {} });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  return (
    <div className="space-y-6" data-testid="admin-call-results">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">Call results</h1>
          <p className="mt-1 text-sm text-muted-foreground">Screening responses, final standing, evidence state, and the provider event record.</p>
        </div>
        <Button variant="outline" size="sm" onClick={load} disabled={loading}>
          {loading ? <Loader2 className="mr-1.5 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-1.5 h-4 w-4" />}
          Refresh
        </Button>
      </div>

      {error && <div className="flex items-start gap-2 rounded-lg border border-destructive/20 bg-destructive/5 p-3"><AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-destructive" /><p className="text-sm text-destructive">{error}</p></div>}

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-6">
        <SummaryCard label="Total" value={result.summary.total} />
        <SummaryCard label="Connected" value={result.summary.connected} />
        <SummaryCard label="Diverted" value={result.summary.diverted} />
        <SummaryCard label="Caller ended" value={result.summary.abandoned} />
        <SummaryCard label="Incomplete" value={result.summary.incomplete} />
        <SummaryCard label="Missing evidence" value={result.summary.missingEvidence} />
      </div>

      {loading && result.calls.length === 0 ? (
        <Card className="border-border/60"><CardContent className="flex items-center gap-2 p-6 text-sm text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin" /> Loading call results...</CardContent></Card>
      ) : result.calls.length === 0 ? (
        <Card className="border-border/60"><CardContent className="p-6 text-sm text-muted-foreground">No screened calls have been recorded yet.</CardContent></Card>
      ) : (
        <div className="space-y-4">{result.calls.map((call) => <CallResultCard key={call.callSessionId} call={call} />)}</div>
      )}
    </div>
  );
}
