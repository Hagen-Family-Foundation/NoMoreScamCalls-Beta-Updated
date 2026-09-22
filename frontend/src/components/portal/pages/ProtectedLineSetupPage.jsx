import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { AlertCircle, CheckCircle2, Loader2, Phone, ShieldCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { portalApi } from "@/lib/portalApi";

export function ForwardingInstructions({ provisioning }) {
  if (!provisioning?.forwardingInstructions) return null;
  const { protectedPhoneNumber, systemNumber, screeningNumber, instructions } =
    provisioning.forwardingInstructions;

  return (
    <div className="space-y-4" data-testid="forwarding-instructions">
      <div className="grid gap-3 sm:grid-cols-2">
        <SetupFact label="Protected line" value={protectedPhoneNumber} />
        <SetupFact label="NMSC system number" value={systemNumber ?? screeningNumber} mono />
      </div>
      <div className="rounded-lg border border-primary/20 bg-primary-glow p-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-primary">
          Call-forwarding instructions
        </p>
        <p className="mt-2 text-sm leading-relaxed text-foreground">
          {instructions}
        </p>
      </div>
      <p className="text-xs text-muted-foreground">
        These instructions remain available here even when text-message delivery is unavailable.
      </p>
    </div>
  );
}

export function ApplicationHandoff({ handoff }) {
  if (!handoff) return null;
  if (handoff.compatibility === "unsupported") {
    return (
      <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-4" data-testid="application-unsupported">
        <p className="font-medium text-destructive">This Phone Model is not currently supported.</p>
        <p className="mt-1 text-sm text-muted-foreground">No System Number was assigned. Contact NMSC before continuing.</p>
      </div>
    );
  }
  if (handoff.status === "distribution_unavailable") {
    return (
      <div className="rounded-lg border border-warning/30 bg-warning/10 p-4" data-testid="application-distribution-unavailable">
        <p className="font-medium text-foreground">Application installation is not available yet.</p>
        <p className="mt-1 text-sm text-muted-foreground">Your setup is saved. NMSC will provide the correct {handoff.platform === "ios" ? "iPhone" : "Android"} installation link when distribution is configured.</p>
      </div>
    );
  }
  return (
    <Button asChild variant="cta" size="lg" data-testid="application-install-link">
      <a href={handoff.url}>Install NMSC for {handoff.platform === "ios" ? "iPhone" : "Android"}</a>
    </Button>
  );
}

export default function ProtectedLineSetupPage() {
  const { user, refreshUser } = useAuth();
  const [protectedPhoneNumber, setProtectedPhoneNumber] = useState("");
  const [callerFacingBusinessName, setCallerFacingBusinessName] = useState("");
  const [carrier, setCarrier] = useState("");
  const [phoneModels, setPhoneModels] = useState([]);
  const [phoneModelId, setPhoneModelId] = useState("");
  const [selectedLine, setSelectedLine] = useState(null);
  const [provisioning, setProvisioning] = useState(null);
  const [applicationHandoff, setApplicationHandoff] = useState(null);
  const [activation, setActivation] = useState(null);
  const [working, setWorking] = useState(false);
  const [error, setError] = useState("");

  const existingLines = useMemo(
    () => user?.protected_lines ?? [],
    [user?.protected_lines]
  );

  useEffect(() => {
    if (!selectedLine && existingLines.length > 0) {
      const next = existingLines.find(
        (line) => line.coverageStatus !== "active"
      ) ?? existingLines[0];
      setSelectedLine(next);
    }
  }, [existingLines, selectedLine]);

  useEffect(() => {
    let active = true;
    portalApi.listPhoneModels()
      .then((models) => {
        if (active) setPhoneModels(models);
      })
      .catch((err) => {
        if (active) setError(err.message);
      });
    return () => { active = false; };
  }, []);

  const provisionLine = async (lineId) => {
    const result = await portalApi.provisionProtectedLine(lineId);
    setProvisioning(result.provisioning);
    setSelectedLine(result.provisioning.protectedLine);
    await refreshUser();
  };

  const handleCreateAndProvision = async (event) => {
    event.preventDefault();
    setError("");
    if (!protectedPhoneNumber.trim() || !callerFacingBusinessName.trim() || !carrier.trim() || !phoneModelId) {
      setError("Protected phone number, carrier, caller-facing spoken identity, and Phone Model are required.");
      return;
    }

    setWorking(true);
    try {
      const completed = await portalApi.completeBetaOnboarding({
        protectedPhoneNumber: protectedPhoneNumber.trim(),
        callerFacingBusinessName: callerFacingBusinessName.trim(),
        carrier: carrier.trim(),
        phoneModelId,
      });
      setApplicationHandoff(completed.applicationHandoff);
      if (completed.completed) {
        setSelectedLine(completed.protectedLine);
        setProvisioning(completed.provisioning);
      }
      await refreshUser();
    } catch (err) {
      setError(err.message);
      await refreshUser();
    } finally {
      setWorking(false);
    }
  };

  const handleProvisionExisting = async () => {
    if (!selectedLine) return;
    setError("");
    setWorking(true);
    try {
      await provisionLine(selectedLine.id);
    } catch (err) {
      setError(err.message);
      await refreshUser();
    } finally {
      setWorking(false);
    }
  };

  const handleConfirmForwarding = async () => {
    const lineId = provisioning?.protectedLine?.id ?? selectedLine?.id;
    if (!lineId) return;
    setError("");
    setWorking(true);
    try {
      const result = await portalApi.confirmProtectedLineForwarding(lineId);
      setActivation(result);
      setSelectedLine(result.protectedLine);
      await refreshUser();
    } catch (err) {
      setError(err.message);
    } finally {
      setWorking(false);
    }
  };

  const lineIsActive =
    activation?.coverageActive || selectedLine?.coverageStatus === "active";
  const lineIsProvisioned =
    selectedLine?.provisioningStatus === "provisioned";

  return (
    <div className="mx-auto max-w-3xl space-y-6" data-testid="protected-line-setup-page">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          Protected Line setup
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Add the telephone line NoMoreScamCalls will protect. This is separate from your account contact number.
        </p>
      </div>

      {error && (
        <div className="flex items-start gap-2 rounded-lg border border-destructive/20 bg-destructive/5 p-3" data-testid="status-error">
          <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-destructive" />
          <p className="text-sm text-destructive">{error}</p>
        </div>
      )}

      {applicationHandoff && (
        <ApplicationHandoff handoff={applicationHandoff} />
      )}

      {lineIsActive ? (
        <Card className="border-success/30 shadow-elevated" data-testid="activation-success">
          <CardContent className="space-y-5 p-6 sm:p-8">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="mt-0.5 h-6 w-6 text-success" />
              <div>
                <h2 className="text-lg font-semibold text-foreground">Protection is active</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Forwarding is confirmed for {selectedLine?.protectedPhoneNumber}. No sibling line was changed.
                </p>
              </div>
            </div>
            {activation?.confirmationCall && (
              <p className="text-sm text-muted-foreground" data-testid="confirmation-call-status">
                {activation.confirmationCall.status === "failed"
                  ? "Your line is active. The setup confirmation call could not be placed."
                  : "Your line is active and the setup confirmation call has been initiated."}
              </p>
            )}
            <Button asChild variant="cta" size="lg">
              <Link to="/portal/dashboard">Go to Dashboard</Link>
            </Button>
          </CardContent>
        </Card>
      ) : provisioning ? (
        <Card className="shadow-elevated">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Phone className="h-4 w-4 text-primary" />
              Complete call forwarding
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <ForwardingInstructions provisioning={provisioning} />
            <Button
              variant="cta"
              size="lg"
              onClick={handleConfirmForwarding}
              disabled={working}
              data-testid="button-confirm-forwarding"
            >
              {working ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShieldCheck className="mr-2 h-4 w-4" />}
              I have completed call forwarding
            </Button>
          </CardContent>
        </Card>
      ) : selectedLine ? (
        <Card className="shadow-elevated">
          <CardHeader>
            <CardTitle className="text-base">Continue setup</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="font-mono text-sm text-foreground">{selectedLine.protectedPhoneNumber}</p>
                <p className="text-xs text-muted-foreground">{selectedLine.callerFacingBusinessName}</p>
              </div>
              <Badge variant="outline">{selectedLine.forwardingStatus?.replaceAll("_", " ")}</Badge>
            </div>
            <Button
              variant="cta"
              size="lg"
              onClick={handleProvisionExisting}
              disabled={working}
              data-testid="button-provision-line"
            >
              {working && <Loader2 className="h-4 w-4 animate-spin" />}
              {lineIsProvisioned ? "Show forwarding instructions" : "Provision this Protected Line"}
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card className="shadow-elevated">
          <CardHeader>
            <CardTitle className="text-base">Line information</CardTitle>
          </CardHeader>
          <CardContent>
            <form className="space-y-4" onSubmit={handleCreateAndProvision} noValidate>
              <SetupField
                id="protected-phone-number"
                label="Telephone number to protect"
                value={protectedPhoneNumber}
                onChange={setProtectedPhoneNumber}
                type="tel"
                testId="input-protected-phone-number"
              />
              <SetupField
                id="caller-facing-name"
                label="Name callers should hear"
                value={callerFacingBusinessName}
                onChange={setCallerFacingBusinessName}
                testId="input-caller-facing-name"
              />
              <SetupField
                id="carrier"
                label="Telephone carrier"
                value={carrier}
                onChange={setCarrier}
                testId="input-carrier"
              />
              <div className="space-y-1.5">
                <Label htmlFor="phone-model">Phone Model</Label>
                <select
                  id="phone-model"
                  value={phoneModelId}
                  onChange={(event) => setPhoneModelId(event.target.value)}
                  data-testid="select-phone-model"
                  className="h-11 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground"
                >
                  <option value="">Select your Phone Model</option>
                  {phoneModels.map((model) => (
                    <option key={model.id} value={model.id}>
                      {model.manufacturer} {model.displayName}
                    </option>
                  ))}
                </select>
              </div>
              <Button type="submit" variant="cta" size="lg" disabled={working} data-testid="button-create-protected-line">
                {working && <Loader2 className="h-4 w-4 animate-spin" />}
                Create and provision Protected Line
              </Button>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function SetupField({ id, label, value, onChange, type = "text", testId }) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id}>{label}</Label>
      <Input
        id={id}
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        data-testid={testId}
        className="h-11"
      />
    </div>
  );
}

function SetupFact({ label, value, mono = false }) {
  return (
    <div>
      <p className="text-xs uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className={`mt-1 text-sm text-foreground ${mono ? "font-mono" : ""}`}>{value}</p>
    </div>
  );
}
