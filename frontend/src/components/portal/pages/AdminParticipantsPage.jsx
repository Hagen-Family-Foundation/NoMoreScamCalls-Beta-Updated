import React, { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2, Search, AlertCircle } from "lucide-react";
import { portalApi } from "@/lib/portalApi";
import { cn } from "@/lib/utils";

const STATUS_FILTERS = [
  { value: "", label: "All" },
  { value: "active", label: "Active" },
  { value: "setup", label: "In setup" },
  { value: "suspended", label: "Suspended" },
  { value: "closed", label: "Closed" },
];

function fmt(v) {
  if (!v) return "—";
  try { return new Date(v).toLocaleString(); } catch { return String(v); }
}

export default function AdminParticipantsPage() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [participants, setParticipants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async (opts = {}) => {
    setLoading(true);
    setError("");
    try {
      const result = await portalApi.adminParticipants({
        search: opts.search ?? search,
        status: opts.status ?? status,
      });
      setParticipants(Array.isArray(result) ? result : (result?.participants || []));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [search, status]);

  // Initial load only. Subsequent loads are triggered by "Apply".
  const [initialized, setInitialized] = useState(false);
  useEffect(() => {
    if (initialized) return;
    setInitialized(true);
    load({ search: "", status: "" });
  }, [initialized, load]);

  return (
    <div className="space-y-6" data-testid="admin-participants">
      <div>
        <h1 className="text-2xl font-semibold text-foreground tracking-tight">Participants</h1>
        <p className="text-sm text-muted-foreground mt-1">Every beta account.</p>
      </div>

      <Card className="border-border/60">
        <CardContent className="p-4 space-y-3">
          <form
            onSubmit={(e) => { e.preventDefault(); load(); }}
            className="flex flex-col sm:flex-row gap-3"
          >
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                data-testid="input-search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by name, email, or phone"
                className="h-10 pl-9"
              />
            </div>
            <div className="flex gap-1 flex-wrap">
              {STATUS_FILTERS.map((f) => (
                <button
                  key={f.value || "all"}
                  type="button"
                  data-testid={`filter-status-${f.value || "all"}`}
                  onClick={() => { setStatus(f.value); }}
                  className={cn(
                    "px-3 h-10 rounded-md border text-xs",
                    status === f.value ? "border-primary bg-primary/5 text-foreground font-medium" : "border-input text-muted-foreground hover:text-foreground"
                  )}
                >
                  {f.label}
                </button>
              ))}
            </div>
            <Button type="submit" variant="cta" className="h-10" data-testid="button-apply-filters">
              Apply
            </Button>
          </form>
        </CardContent>
      </Card>

      {error && (
        <div data-testid="status-error" className="flex items-start gap-2 p-3 rounded-lg bg-destructive/5 border border-destructive/20">
          <AlertCircle className="w-4 h-4 text-destructive mt-0.5 flex-shrink-0" />
          <p className="text-sm text-destructive">{error}</p>
        </div>
      )}

      <Card className="border-border/60 overflow-hidden">
        {loading ? (
          <CardContent className="p-6 flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="w-4 h-4 animate-spin" /> Loading participants...
          </CardContent>
        ) : participants.length === 0 ? (
          <CardContent className="p-6 text-sm text-muted-foreground">No participants match this filter yet.</CardContent>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm" data-testid="table-participants">
              <thead className="bg-secondary/40 text-xs uppercase text-muted-foreground">
                <tr>
                  <th className="text-left px-4 py-2.5">Name</th>
                  <th className="text-left px-4 py-2.5">Email</th>
                  <th className="text-left px-4 py-2.5">Protected phone</th>
                  <th className="text-left px-4 py-2.5">Screening #</th>
                  <th className="text-left px-4 py-2.5">Carrier</th>
                  <th className="text-left px-4 py-2.5">Code</th>
                  <th className="text-left px-4 py-2.5">Status</th>
                  <th className="text-left px-4 py-2.5">Setup</th>
                  <th className="text-right px-4 py-2.5">Total</th>
                  <th className="text-right px-4 py-2.5">Success</th>
                  <th className="text-right px-4 py-2.5">Diverted</th>
                  <th className="text-left px-4 py-2.5">Last call</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {participants.map((p) => (
                  <tr key={p.id} className="hover:bg-secondary/20">
                    <td className="px-4 py-2.5">
                      <Link to={`/portal/admin/participants/${p.id}`} className="text-foreground hover:underline font-medium" data-testid={`link-participant-${p.id}`}>
                        {[p.first_name, p.last_name].filter(Boolean).join(" ") || "—"}
                      </Link>
                    </td>
                    <td className="px-4 py-2.5 text-muted-foreground">{p.email || "—"}</td>
                    <td className="px-4 py-2.5 font-mono text-xs">{p.phone || "—"}</td>
                    <td className="px-4 py-2.5 font-mono text-xs">{p.screening_number || "—"}</td>
                    <td className="px-4 py-2.5 text-muted-foreground">{p.carrier || "—"}</td>
                    <td className="px-4 py-2.5 font-mono text-xs">{p.invite_code || p.code || "—"}</td>
                    <td className="px-4 py-2.5">{p.account_status || "—"}</td>
                    <td className="px-4 py-2.5">{p.setup_status || "—"}</td>
                    <td className="px-4 py-2.5 text-right">{p.total_calls ?? 0}</td>
                    <td className="px-4 py-2.5 text-right">{p.successful_calls ?? 0}</td>
                    <td className="px-4 py-2.5 text-right">{p.diverted_calls ?? 0}</td>
                    <td className="px-4 py-2.5 text-xs text-muted-foreground">{fmt(p.last_call_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
