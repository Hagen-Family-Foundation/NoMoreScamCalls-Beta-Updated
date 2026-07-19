import React, { useCallback, useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, AlertCircle, Plus, Copy, Check, CheckCircle2 } from "lucide-react";
import { portalApi } from "@/lib/portalApi";
import { cn } from "@/lib/utils";

function fmt(v) {
  if (!v) return "—";
  try { return new Date(v).toLocaleString(); } catch { return String(v); }
}

export default function AdminCodesPage() {
  const [codes, setCodes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [generating, setGenerating] = useState(false);
  const [newCode, setNewCode] = useState(null);
  const [copiedId, setCopiedId] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const result = await portalApi.adminInviteCodes();
      setCodes(Array.isArray(result) ? result : (result?.codes || []));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const generate = async () => {
    setError("");
    setNewCode(null);
    setGenerating(true);
    try {
      const created = await portalApi.adminCreateInviteCode();
      setNewCode(created);
      await load();
    } catch (err) {
      setError(err.message);
    } finally {
      setGenerating(false);
    }
  };

  const close = async (id) => {
    setError("");
    try {
      await portalApi.adminUpdateInviteCode(id, { status: "closed" });
      await load();
    } catch (err) {
      setError(err.message);
    }
  };

  const copyToClipboard = async (id, code) => {
    try { await navigator.clipboard.writeText(code); } catch { /* ignore */ }
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-6" data-testid="admin-codes">
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-2xl font-semibold text-foreground tracking-tight">Invitation codes</h1>
          <p className="text-sm text-muted-foreground mt-1">Generate and manage beta invitation codes.</p>
        </div>
        <Button variant="cta" onClick={generate} disabled={generating} data-testid="button-generate-code">
          {generating ? <><Loader2 className="w-4 h-4 animate-spin" />Generating...</> : <><Plus className="w-4 h-4 mr-2" />Generate invitation code</>}
        </Button>
      </div>

      {error && (
        <div data-testid="status-error" className="flex items-start gap-2 p-3 rounded-lg bg-destructive/5 border border-destructive/20">
          <AlertCircle className="w-4 h-4 text-destructive mt-0.5 flex-shrink-0" />
          <p className="text-sm text-destructive">{error}</p>
        </div>
      )}

      {newCode && (
        <div data-testid="status-new-code" className="flex items-start gap-3 p-4 rounded-lg bg-primary-glow/40 border border-primary/20">
          <CheckCircle2 className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-medium text-foreground">New invitation code created</p>
            <div className="flex items-center gap-2 mt-1">
              <span className="font-mono text-lg text-foreground" data-testid="text-new-code">{newCode.code}</span>
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => copyToClipboard("new", newCode.code)} data-testid="button-copy-new-code">
                {copiedId === "new" ? <Check className="w-4 h-4 text-success" /> : <Copy className="w-4 h-4" />}
              </Button>
            </div>
          </div>
        </div>
      )}

      <Card className="border-border/60 overflow-hidden">
        {loading ? (
          <CardContent className="p-6 flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="w-4 h-4 animate-spin" /> Loading codes...
          </CardContent>
        ) : codes.length === 0 ? (
          <CardContent className="p-6 text-sm text-muted-foreground">No invitation codes yet. Generate one to get started.</CardContent>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm" data-testid="table-codes">
              <thead className="bg-secondary/40 text-xs uppercase text-muted-foreground">
                <tr>
                  <th className="text-left px-4 py-2.5">Code</th>
                  <th className="text-left px-4 py-2.5">Status</th>
                  <th className="text-right px-4 py-2.5">Registrations</th>
                  <th className="text-left px-4 py-2.5">Created</th>
                  <th className="text-right px-4 py-2.5">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {codes.map((c) => (
                  <tr key={c.id}>
                    <td className="px-4 py-2.5">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-foreground">{c.code}</span>
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => copyToClipboard(c.id, c.code)} data-testid={`button-copy-code-${c.id}`}>
                          {copiedId === c.id ? <Check className="w-3.5 h-3.5 text-success" /> : <Copy className="w-3.5 h-3.5" />}
                        </Button>
                      </div>
                    </td>
                    <td className="px-4 py-2.5">
                      <Badge variant="outline" className={cn(
                        "text-[10px]",
                        c.status === "active" && "border-success/30 text-success bg-success-muted",
                        c.status === "closed" && "border-border text-muted-foreground bg-muted"
                      )}>
                        {c.status || "—"}
                      </Badge>
                    </td>
                    <td className="px-4 py-2.5 text-right">{c.registrations ?? c.uses ?? 0}</td>
                    <td className="px-4 py-2.5 text-muted-foreground text-xs">{fmt(c.created_at)}</td>
                    <td className="px-4 py-2.5 text-right">
                      {c.status === "active" && (
                        <Button variant="outline" size="sm" onClick={() => close(c.id)} data-testid={`button-close-code-${c.id}`}>
                          Close code
                        </Button>
                      )}
                    </td>
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
