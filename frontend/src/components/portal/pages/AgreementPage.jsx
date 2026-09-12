import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, AlertCircle, ShieldCheck, LogOut } from "lucide-react";
import { AuthShell } from "@/components/portal/AuthShell";
import { useAuth } from "@/contexts/AuthContext";
import { portalApi } from "@/lib/portalApi";

function formatEffectiveDate(value) {
  if (!value) return "";
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  }).format(new Date(value));
}

export default function AgreementPage() {
  const navigate = useNavigate();
  const { user, refreshUser, logout } = useAuth();
  const [agreement, setAgreement] = useState(null);
  const [loading, setLoading] = useState(true);
  const [accepting, setAccepting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    portalApi.currentAgreement()
      .then((currentAgreement) => {
        if (active) setAgreement(currentAgreement);
      })
      .catch((err) => {
        if (active) setError(err.message);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const handleAccept = async () => {
    if (!agreement) return;
    setError("");
    setAccepting(true);
    try {
      await portalApi.acceptAgreement(agreement.version);
      await refreshUser();
      navigate("/portal/setup", { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setAccepting(false);
    }
  };

  const handleDecline = async () => {
    await logout();
    navigate("/portal/login", { replace: true });
  };

  return (
    <AuthShell
      title={agreement?.title || "NoMoreScamCalls Beta Participation Agreement"}
      subtitle={agreement ? `Effective ${formatEffectiveDate(agreement.effectiveAt)}` : "Loading current agreement…"}
    >
      <Card className="shadow-elevated border-border/60">
        <CardContent className="p-6 sm:p-8 space-y-6">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
            <span>Agreement version: <span className="font-mono text-foreground">{agreement?.version || "—"}</span></span>
            {user?.email && <span>Signing as: <span className="text-foreground">{user.email}</span></span>}
          </div>

          <div
            className="max-h-[420px] overflow-y-auto pr-3 space-y-5 border border-border/50 rounded-lg p-5 bg-secondary/20"
            data-testid="agreement-body"
          >
            {agreement?.preamble?.map((line, i) => (
              <p key={`preamble-${i}`} className="text-sm text-foreground leading-relaxed">
                {line}
              </p>
            ))}
            {agreement?.sections?.map((s) => (
              <section key={s.id}>
                <h3 className="text-sm font-semibold text-foreground mb-1.5">{s.heading}</h3>
                <div className="space-y-1.5">
                  {s.body.map((line, i) => (
                    <p key={`${s.id}-${i}`} className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
                      {line}
                    </p>
                  ))}
                </div>
              </section>
            ))}
            <section>
              <h3 className="text-sm font-semibold text-foreground mb-1.5">{agreement?.acceptanceHeading}</h3>
              <div className="space-y-1.5">
                {agreement?.acceptance?.map((line, i) => (
                  <p key={`acceptance-${i}`} className="text-sm text-muted-foreground leading-relaxed">
                    {line}
                  </p>
                ))}
              </div>
            </section>
          </div>

          {error && (
            <div data-testid="status-error" className="flex items-start gap-2 p-3 rounded-lg bg-destructive/5 border border-destructive/20">
              <AlertCircle className="w-4 h-4 text-destructive mt-0.5 flex-shrink-0" />
              <p className="text-sm text-destructive">{error}</p>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-3">
            <Button variant="cta" size="lg" className="flex-1" onClick={handleAccept} disabled={loading || accepting || !agreement} data-testid="button-accept-agreement">
              {loading ? (
                <><Loader2 className="w-4 h-4 animate-spin" />Loading agreement...</>
              ) : accepting ? (
                <><Loader2 className="w-4 h-4 animate-spin" />Recording acceptance...</>
              ) : (
                <><ShieldCheck className="w-4 h-4 mr-2" />I Agree</>
              )}
            </Button>
            <Button variant="outline" size="lg" onClick={handleDecline} data-testid="button-decline-agreement">
              <LogOut className="w-4 h-4 mr-2" />
              Decline and sign out
            </Button>
          </div>

          <p className="text-xs text-muted-foreground text-center">
            Your acceptance, the agreement version, your participant identifier, and the date and time of acceptance will be recorded as part of your beta participation record.
          </p>
        </CardContent>
      </Card>
    </AuthShell>
  );
}
