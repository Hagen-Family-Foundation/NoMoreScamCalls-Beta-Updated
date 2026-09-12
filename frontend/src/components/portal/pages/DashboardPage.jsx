import React, { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2, Phone, PhoneCall, ShieldCheck, Signal, Clock, Copy, Check, AlertCircle } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { portalApi } from "@/lib/portalApi";
import { cn } from "@/lib/utils";

function formatDateTime(value) {
  if (!value) return "—";
  try {
    return new Date(value).toLocaleString();
  } catch {
    return String(value);
  }
}

function StatusBadge({ status }) {
  const map = {
    active: { label: "Active", cls: "bg-success-muted text-success border-success/30" },
    suspended: { label: "Suspended", cls: "bg-warning/10 text-warning border-warning/30" },
    closed: { label: "Closed", cls: "bg-muted text-muted-foreground border-border" },
    setup_incomplete: { label: "Setup incomplete", cls: "bg-warning/10 text-warning border-warning/30" },
    forwarding_ready: { label: "Forwarding ready", cls: "bg-primary-glow text-primary border-primary/30" },
    test_call_pending: { label: "Test call pending", cls: "bg-primary-glow text-primary border-primary/30" },
    account_created: { label: "Account created", cls: "bg-secondary text-muted-foreground border-border" },
    agreement_accepted: { label: "Agreement accepted", cls: "bg-secondary text-muted-foreground border-border" },
  };
  const s = map[status] || { label: status || "Unknown", cls: "bg-secondary text-muted-foreground border-border" };
  return (
    <span className={cn("inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border", s.cls)} data-testid="status-badge">
      {s.label}
    </span>
  );
}

export default function DashboardPage() {
  const { user } = useAuth();
  const [summary, setSummary] = useState(null);
  const [calls, setCalls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      setError("");
      try {
        const [s, c] = await Promise.all([
          portalApi.mySummary().catch((e) => ({ __error: e.message })),
          portalApi.myCalls(20).catch((e) => ({ __error: e.message })),
        ]);
        if (!mounted) return;
        if (s?.__error && c?.__error) throw new Error(s.__error);
        setSummary(s?.__error ? null : s);
        setCalls(Array.isArray(c) ? c : (c?.calls || []));
      } catch (err) {
        if (mounted) setError(err.message);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  const copyNumber = async () => {
    const n = summary?.screening_number || user?.screening_number || "";
    if (!n) return;
    try { await navigator.clipboard.writeText(n); } catch { /* ignore */ }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const totalCalls = summary?.total_calls ?? 0;
  const successful = summary?.successful_calls ?? 0;
  const diverted = summary?.diverted_calls ?? 0;
  const lastCallAt = summary?.last_call_at;

  return (
    <div className="space-y-6" data-testid="participant-dashboard">
      <div>
        <h1 className="text-2xl font-semibold text-foreground tracking-tight">
          Welcome{user?.first_name ? `, ${user.first_name}` : ""}.
        </h1>
        <p className="text-sm text-muted-foreground mt-1">Here is a snapshot of your beta account and call activity.</p>
      </div>

      {error && (
        <div data-testid="status-error" className="flex items-start gap-2 p-3 rounded-lg bg-destructive/5 border border-destructive/20">
          <AlertCircle className="w-4 h-4 text-destructive mt-0.5 flex-shrink-0" />
          <p className="text-sm text-destructive">{error}</p>
        </div>
      )}

      {/* Account info */}
      <Card className="shadow-elevated border-border/60">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-primary" />
            Account information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <InfoRow label="Service status" value={<StatusBadge status={summary?.service_status || user?.setup_status || user?.account_status} />} />
            <InfoRow label="Account status" value={<StatusBadge status={user?.account_status} />} />
            <InfoRow label="Protected phone" value={user?.phone || "—"} icon={Phone} />
            <InfoRow
              label="Assigned screening number"
              value={
                (summary?.screening_number || user?.screening_number)
                  ? (
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-foreground" data-testid="text-screening-number">
                        {summary?.screening_number || user?.screening_number}
                      </span>
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={copyNumber} data-testid="button-copy-screening-number">
                        {copied ? <Check className="w-3.5 h-3.5 text-success" /> : <Copy className="w-3.5 h-3.5" />}
                      </Button>
                    </div>
                  )
                  : "Not yet assigned"
              }
              icon={Signal}
            />
            <InfoRow label="Carrier" value={user?.carrier || "—"} />
            <InfoRow label="Preferred contact" value={user?.contact_method || "—"} />
          </div>
          <div className="text-xs text-muted-foreground border-t border-border/50 pt-3">
            Agreement:{" "}
            {user?.agreement_accepted
              ? <>Accepted {user?.agreement_accepted_at ? `on ${formatDateTime(user.agreement_accepted_at)}` : ""} ({user?.agreement_version || "—"})</>
              : "Not accepted"}
          </div>
        </CardContent>
      </Card>

      {/* Call summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard label="Total calls handled" value={loading ? "—" : totalCalls} icon={PhoneCall} />
        <StatCard label="Successful" value={loading ? "—" : successful} icon={ShieldCheck} />
        <StatCard label="Diverted" value={loading ? "—" : diverted} icon={Signal} />
      </div>

      {/* Recent activity */}
      <Card className="shadow-elevated border-border/60">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Clock className="w-4 h-4 text-primary" />
            Recent call activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="w-4 h-4 animate-spin" /> Loading recent calls...
            </div>
          ) : calls.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No calls yet. {lastCallAt ? `Most recent activity: ${formatDateTime(lastCallAt)}.` : "Once calls start flowing through the service, they will appear here."}
            </p>
          ) : (
            <ul className="divide-y divide-border/60" data-testid="list-recent-calls">
              {calls.map((call) => (
                <li key={call.id || call.call_id} className="py-3 flex items-center justify-between gap-3">
                  <div>
                    <div className="text-sm font-medium text-foreground">
                      {formatDateTime(call.occurred_at || call.date || call.timestamp)}
                    </div>
                    <div className="text-xs text-muted-foreground font-mono">
                      {call.id || call.call_id}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge
                      variant="outline"
                      className={cn(
                        "text-[10px]",
                        (call.outcome || call.status) === "successful" && "border-success/30 text-success bg-success-muted",
                        (call.outcome || call.status) === "diverted" && "border-warning/30 text-warning bg-warning/10"
                      )}
                    >
                      {call.outcome || call.status || "unknown"}
                    </Badge>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function InfoRow({ label, value, icon: Icon }) {
  return (
    <div>
      <div className="text-xs text-muted-foreground uppercase tracking-wide flex items-center gap-1">
        {Icon && <Icon className="w-3 h-3" />}
        {label}
      </div>
      <div className="text-sm text-foreground mt-1">{value}</div>
    </div>
  );
}

function StatCard({ label, value, icon: Icon }) {
  return (
    <Card className="border-border/60">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground uppercase tracking-wide">{label}</span>
          <Icon className="w-4 h-4 text-muted-foreground" />
        </div>
        <div className="text-2xl font-semibold text-foreground mt-2" data-testid={`stat-${label.toLowerCase().replace(/\s+/g, "-")}`}>{value}</div>
      </CardContent>
    </Card>
  );
}
