import React, { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Loader2, Users, ShieldCheck, Signal, PhoneCall, AlertCircle, Activity, CheckCircle2, PauseCircle, CircleDashed } from "lucide-react";
import { portalApi } from "@/lib/portalApi";
import { cn } from "@/lib/utils";

function formatDateTime(v) {
  if (!v) return "—";
  try { return new Date(v).toLocaleString(); } catch { return String(v); }
}

export default function AdminOverviewPage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const s = await portalApi.adminStats();
        if (mounted) setStats(s);
      } catch (err) {
        if (mounted) setError(err.message);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  return (
    <div className="space-y-6" data-testid="admin-overview">
      <div>
        <h1 className="text-2xl font-semibold text-foreground tracking-tight">Administrator overview</h1>
        <p className="text-sm text-muted-foreground mt-1">System-wide view of all beta accounts and service activity.</p>
      </div>

      {error && (
        <div data-testid="status-error" className="flex items-start gap-2 p-3 rounded-lg bg-destructive/5 border border-destructive/20">
          <AlertCircle className="w-4 h-4 text-destructive mt-0.5 flex-shrink-0" />
          <p className="text-sm text-destructive">{error}</p>
        </div>
      )}

      {loading ? (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="w-4 h-4 animate-spin" /> Loading system statistics...
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <Stat label="Total accounts" value={stats?.total_accounts ?? 0} icon={Users} />
            <Stat label="Active" value={stats?.active_accounts ?? 0} icon={CheckCircle2} tone="success" />
            <Stat label="In setup" value={stats?.setup_accounts ?? 0} icon={CircleDashed} />
            <Stat label="Suspended" value={stats?.suspended_accounts ?? 0} icon={PauseCircle} tone="warning" />
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <Stat label="Total calls handled" value={stats?.total_calls ?? 0} icon={PhoneCall} />
            <Stat label="Successful calls" value={stats?.successful_calls ?? 0} icon={ShieldCheck} tone="success" />
            <Stat label="Diverted calls" value={stats?.diverted_calls ?? 0} icon={Signal} />
            <Stat label="Calls today" value={stats?.calls_today ?? 0} icon={Activity} />
          </div>

          <Card className="shadow-elevated border-border/60">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Recent system activity</CardTitle>
            </CardHeader>
            <CardContent>
              {Array.isArray(stats?.recent_activity) && stats.recent_activity.length > 0 ? (
                <ul className="divide-y divide-border/60" data-testid="list-recent-activity">
                  {stats.recent_activity.map((event) => (
                    <li key={event.id || `${event.type}-${event.at}`} className="py-3 flex items-center justify-between gap-3">
                      <div>
                        <div className="text-sm text-foreground">{event.description || event.type}</div>
                        <div className="text-xs text-muted-foreground">{formatDateTime(event.at || event.timestamp)}</div>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-muted-foreground">No recent activity yet.</p>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}

function Stat({ label, value, icon: Icon, tone }) {
  return (
    <Card className="border-border/60">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground uppercase tracking-wide">{label}</span>
          <Icon className={cn("w-4 h-4",
            tone === "success" && "text-success",
            tone === "warning" && "text-warning",
            !tone && "text-muted-foreground"
          )} />
        </div>
        <div className="text-2xl font-semibold text-foreground mt-2" data-testid={`stat-${label.toLowerCase().replace(/\s+/g, "-")}`}>{value}</div>
      </CardContent>
    </Card>
  );
}
