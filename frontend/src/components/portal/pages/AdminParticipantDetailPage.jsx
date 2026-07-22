import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Loader2, ArrowLeft, AlertCircle, Save, CheckCircle2 } from "lucide-react";
import { portalApi } from "@/lib/portalApi";
import { cn } from "@/lib/utils";

const STATUSES = [
  { value: "active", label: "Active" },
  { value: "suspended", label: "Suspended" },
  { value: "closed", label: "Closed" },
];

function fmt(v) {
  if (!v) return "—";
  try { return new Date(v).toLocaleString(); } catch { return String(v); }
}

export default function AdminParticipantDetailPage() {
  const { id } = useParams();
  const [participant, setParticipant] = useState(null);
  const [calls, setCalls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [status, setStatus] = useState("");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      setError("");
      try {
        const [p, c] = await Promise.all([
          portalApi.adminParticipant(id),
          portalApi.adminParticipantCalls(id).catch(() => []),
        ]);
        if (!mounted) return;
        setParticipant(p);
        setStatus(p?.account_status || "");
        setNotes(p?.admin_notes || "");
        setCalls(Array.isArray(c) ? c : (c?.calls || []));
      } catch (err) {
        if (mounted) setError(err.message);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [id]);

  const saveAccount = async () => {
    setSaved(false);
    setError("");
    setSaving(true);
    try {
      const updated = await portalApi.adminUpdateParticipant(id, {
        account_status: status,
        admin_notes: notes,
      });
      if (updated) setParticipant(updated);
      setSaved(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Loader2 className="w-4 h-4 animate-spin" /> Loading participant...
      </div>
    );
  }

  return (
    <div className="space-y-6" data-testid="admin-participant-detail">
      <div className="flex items-center justify-between gap-3">
        <div>
          <Link to="/portal/admin/participants" className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1" data-testid="link-back-to-participants">
            <ArrowLeft className="w-3 h-3" /> Back to participants
          </Link>
          <h1 className="text-2xl font-semibold text-foreground tracking-tight mt-1">
            {[participant?.first_name, participant?.last_name].filter(Boolean).join(" ") || "Participant"}
          </h1>
          <p className="text-sm text-muted-foreground">{participant?.email}</p>
        </div>
      </div>

      {error && (
        <div data-testid="status-error" className="flex items-start gap-2 p-3 rounded-lg bg-destructive/5 border border-destructive/20">
          <AlertCircle className="w-4 h-4 text-destructive mt-0.5 flex-shrink-0" />
          <p className="text-sm text-destructive">{error}</p>
        </div>
      )}

      <Card className="border-border/60">
        <CardHeader className="pb-3"><CardTitle className="text-base">Account information</CardTitle></CardHeader>
        <CardContent>
          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 text-sm">
            <Row label="Protected phone">{participant?.phone || "—"}</Row>
            <Row label="Screening number">{participant?.screening_number || "Not yet assigned"}</Row>
            <Row label="Carrier">{participant?.carrier || "—"}</Row>
            <Row label="Preferred contact">{participant?.contact_method || "—"}</Row>
            <Row label="Invitation code"><span className="font-mono">{participant?.invite_code || participant?.code || "—"}</span></Row>
            <Row label="Account created">{fmt(participant?.created_at)}</Row>
            <Row label="Setup status">{participant?.setup_status || "—"}</Row>
            <Row label="Activated">{fmt(participant?.activated_at)}</Row>
            <Row label="Agreement">
              {participant?.agreement_accepted ? (
                <>Accepted on {fmt(participant?.agreement_accepted_at)} ({participant?.agreement_version || "—"})</>
              ) : (
                <span className="text-warning">Not accepted</span>
              )}
            </Row>
            <Row label="Last call">{fmt(participant?.last_call_at)}</Row>
          </dl>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Stat label="Total calls" value={participant?.total_calls ?? 0} />
        <Stat label="Successful" value={participant?.successful_calls ?? 0} />
        <Stat label="Diverted" value={participant?.diverted_calls ?? 0} />
      </div>

      <Card className="border-border/60">
        <CardHeader className="pb-3"><CardTitle className="text-base">Administrative actions</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div>
            <div className="text-xs text-muted-foreground uppercase tracking-wide mb-2">Account status</div>
            <div className="flex gap-2 flex-wrap">
              {STATUSES.map((s) => (
                <button
                  key={s.value}
                  type="button"
                  data-testid={`button-set-status-${s.value}`}
                  onClick={() => setStatus(s.value)}
                  className={cn(
                    "px-3 h-9 rounded-md border text-sm",
                    status === s.value ? "border-primary bg-primary/5 text-foreground font-medium" : "border-input text-muted-foreground hover:text-foreground"
                  )}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <div className="text-xs text-muted-foreground uppercase tracking-wide mb-2">Administrative notes <span className="text-muted-foreground/70">(internal only)</span></div>
            <Textarea
              data-testid="input-admin-notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={4}
              placeholder="Internal notes about this account"
            />
          </div>

          {saved && (
            <div data-testid="status-saved" className="flex items-start gap-2 p-3 rounded-lg bg-success-muted border border-success/20">
              <CheckCircle2 className="w-4 h-4 text-success mt-0.5 flex-shrink-0" />
              <p className="text-sm text-success">Changes saved.</p>
            </div>
          )}

          <Button variant="cta" onClick={saveAccount} disabled={saving} data-testid="button-save-account">
            {saving ? <><Loader2 className="w-4 h-4 animate-spin" />Saving...</> : <><Save className="w-4 h-4 mr-2" />Save changes</>}
          </Button>
        </CardContent>
      </Card>

      <Card className="border-border/60">
        <CardHeader className="pb-3"><CardTitle className="text-base">Call activity</CardTitle></CardHeader>
        <CardContent>
          {calls.length === 0 ? (
            <p className="text-sm text-muted-foreground">No call activity recorded yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm" data-testid="table-participant-calls">
                <thead className="bg-secondary/40 text-xs uppercase text-muted-foreground">
                  <tr>
                    <th className="text-left px-4 py-2.5">Call ID</th>
                    <th className="text-left px-4 py-2.5">Date &amp; time</th>
                    <th className="text-left px-4 py-2.5">Outcome</th>
                    <th className="text-left px-4 py-2.5">Final standing</th>
                    <th className="text-left px-4 py-2.5">Processing</th>
                    <th className="text-left px-4 py-2.5">Evidence receipt</th>
                    <th className="text-left px-4 py-2.5">Error</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {calls.map((c) => (
                    <tr key={c.id || c.call_id}>
                      <td className="px-4 py-2.5 font-mono text-xs">{c.id || c.call_id}</td>
                      <td className="px-4 py-2.5 text-muted-foreground">{fmt(c.occurred_at || c.date)}</td>
                      <td className="px-4 py-2.5">
                        <Badge variant="outline" className={cn(
                          "text-[10px]",
                          (c.outcome || c.status) === "successful" && "border-success/30 text-success bg-success-muted",
                          (c.outcome || c.status) === "diverted" && "border-warning/30 text-warning bg-warning/10"
                        )}>
                          {c.outcome || c.status || "—"}
                        </Badge>
                      </td>
                      <td className="px-4 py-2.5 text-muted-foreground">{c.final_standing || "—"}</td>
                      <td className="px-4 py-2.5 text-muted-foreground">{c.processing_status || "—"}</td>
                      <td className="px-4 py-2.5 text-muted-foreground">{c.evidence_receipt || "—"}</td>
                      <td className="px-4 py-2.5 text-muted-foreground">{c.error_status || "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function Row({ label, children }) {
  return (
    <div>
      <dt className="text-xs text-muted-foreground uppercase tracking-wide">{label}</dt>
      <dd className="text-foreground mt-0.5">{children}</dd>
    </div>
  );
}

function Stat({ label, value }) {
  return (
    <Card className="border-border/60">
      <CardContent className="p-4">
        <div className="text-xs text-muted-foreground uppercase tracking-wide">{label}</div>
        <div className="text-2xl font-semibold text-foreground mt-2">{value}</div>
      </CardContent>
    </Card>
  );
}
