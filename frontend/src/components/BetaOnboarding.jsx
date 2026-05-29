import React, { useState, useCallback } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { StepProgress } from "@/components/StepProgress";
import {
  createBetaAccount,
  markSetupComplete,
  checkForwardingStatus,
  retryTestCall,
  deriveResultState,
  STATUS_LABELS,
} from "@/lib/api";
import {
  Loader2,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  Phone,
  Mail,
  User,
  ArrowRight,
  PhoneForwarded,
  Copy,
  Check,
  RefreshCcw,
  RotateCw,
  PhoneCall,
  TriangleAlert,
} from "lucide-react";
import { cn } from "@/lib/utils";

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export const BetaOnboarding = React.forwardRef(function BetaOnboarding(props, ref) {
  /*
   * Steps map to progress indicator:
   *   1 = Info (signup form)
   *   2 = Assigned number (2A: number received, 2B: pending)
   *   3 = Forwarding (instructions + confirm button)
   *   4 = Test call (4A pending, 4B started, 4C success, 4D needs attention)
   */
  const [step, setStep] = useState(1);
  const [subscriberId, setSubscriberId] = useState(null);
  const [subscriberToken, setSubscriberToken] = useState(null);
  const [systemNumber, setSystemNumber] = useState(null);
  const [sessionLost, setSessionLost] = useState(false);

  // Form
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [protectedPhone, setProtectedPhone] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});

  // UI
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  // Status from backend
  const [firstTestCallStatus, setFirstTestCallStatus] = useState(null);
  const [statusLabel, setStatusLabel] = useState(null);
  const [statusLoading, setStatusLoading] = useState(false);
  const [statusError, setStatusError] = useState("");
  const [retryLoading, setRetryLoading] = useState(false);

  // Derived result sub-state for step 4
  const resultState = deriveResultState(statusLabel, firstTestCallStatus);

  // ── Validation ──
  const validateForm = useCallback(() => {
    const errors = {};
    if (!fullName.trim()) errors.fullName = "Full name is required.";
    if (!email.trim()) errors.email = "Email is required.";
    else if (!isValidEmail(email)) errors.email = "Please enter a valid email address.";
    if (!protectedPhone.trim()) errors.protectedPhone = "Protected phone number is required.";
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  }, [fullName, email, protectedPhone]);

  // ── Step 1 → Step 2 ──
  const handleCreateAccount = async (e) => {
    e.preventDefault();
    setError("");
    if (!validateForm()) return;

    setLoading(true);
    try {
      const result = await createBetaAccount({
        fullName: fullName.trim(),
        email: email.trim(),
        protectedPhone: protectedPhone.trim(),
      });
      setSubscriberId(result.subscriberId);
      setSubscriberToken(result.subscriberToken);
      setSystemNumber(result.systemNumber);
      setStep(2);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // ── Step 2A → Step 3 ──
  const handleContinueToForwarding = () => {
    setStep(3);
  };

  // ── Step 3 → Step 4: confirm forwarding, call setup-complete ──
  const handleForwardingConfirmed = async () => {
    setError("");
    if (!subscriberId || !subscriberToken) { setSessionLost(true); return; }

    setLoading(true);
    try {
      const result = await markSetupComplete({ subscriberId, subscriberToken });
      setFirstTestCallStatus(result.firstTestCallStatus);
      setStatusLabel(result.statusString);
      setStep(4);
    } catch (err) {
      if (err.message.includes("session expired") || err.message.includes("missing_token")) {
        setSessionLost(true);
      } else {
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  // ── Check status ──
  const handleCheckStatus = async () => {
    setStatusError("");
    if (!subscriberId || !subscriberToken) { setSessionLost(true); return; }

    setStatusLoading(true);
    try {
      const result = await checkForwardingStatus({ subscriberId, subscriberToken });
      setFirstTestCallStatus(result.firstTestCallStatus);
      setStatusLabel(result.statusString);
    } catch (err) {
      if (err.message.includes("session expired")) { setSessionLost(true); }
      else { setStatusError(err.message); }
    } finally {
      setStatusLoading(false);
    }
  };

  // ── Retry test call ──
  const handleRetryTestCall = async () => {
    setStatusError("");
    if (!subscriberId || !subscriberToken) { setSessionLost(true); return; }

    setRetryLoading(true);
    try {
      const result = await retryTestCall({ subscriberId, subscriberToken });
      setFirstTestCallStatus(result.firstTestCallStatus);
      setStatusLabel(result.statusString);
    } catch (err) {
      if (err.message.includes("session expired")) { setSessionLost(true); }
      else { setStatusError(err.message); }
    } finally {
      setRetryLoading(false);
    }
  };

  // ── Copy number ──
  const handleCopyNumber = async () => {
    const number = systemNumber || "";
    try {
      await navigator.clipboard.writeText(number);
    } catch (err) {
      const t = document.createElement("textarea");
      t.value = number;
      document.body.appendChild(t);
      t.select();
      document.execCommand("copy");
      document.body.removeChild(t);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // ── Reset ──
  const handleRestart = () => {
    setStep(1);
    setSubscriberId(null);
    setSubscriberToken(null);
    setSystemNumber(null);
    setSessionLost(false);
    setFullName("");
    setEmail("");
    setProtectedPhone("");
    setError("");
    setCopied(false);
    setFieldErrors({});
    setLoading(false);
    setFirstTestCallStatus(null);
    setStatusLabel(null);
    setStatusError("");
    setStatusLoading(false);
    setRetryLoading(false);
  };

  // ── Session lost ──
  if (sessionLost) {
    return (
      <section ref={ref} className="py-12 sm:py-16">
        <div className="max-w-lg mx-auto px-5 sm:px-8">
          <Card className="shadow-elevated border-border/60">
            <CardContent className="p-6 sm:p-8 text-center">
              <AlertCircle className="w-10 h-10 text-warning mx-auto mb-4" />
              <h3 className="text-base font-semibold text-foreground mb-2">
                Session refreshed
              </h3>
              <p className="text-sm text-muted-foreground mb-6">
                Your beta setup session was refreshed. If you already signed up, please contact the beta coordinator using the same email address, or restart setup if instructed.
              </p>
              <Button variant="cta" onClick={handleRestart}>
                <RefreshCcw className="w-4 h-4 mr-2" />
                Restart setup
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>
    );
  }

  // ── Helper: copy button ──
  const CopyButton = ({ size = "icon", testId = "button-copy-number" }) => (
    <Button
      variant="ghost"
      size={size}
      onClick={handleCopyNumber}
      className={cn(
        "text-muted-foreground hover:text-foreground",
        size === "icon" ? "h-9 w-9" : "h-8 w-8"
      )}
      aria-label="Copy number"
      data-testid={testId}
    >
      {copied ? <Check className="w-4 h-4 text-success" /> : <Copy className="w-4 h-4" />}
    </Button>
  );

  return (
    <section ref={ref} id="beta-setup" className="py-12 sm:py-16">
      <div className="max-w-lg mx-auto px-5 sm:px-8">
        <StepProgress currentStep={step} />

        {/* ═══════════════════════════════════ */}
        {/* STATE 1: Signup form               */}
        {/* ═══════════════════════════════════ */}
        {step === 1 && (
          <Card className="shadow-elevated border-border/60 animate-fade-in-up">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg sm:text-xl font-semibold text-foreground">
                Beta setup
              </CardTitle>
              <CardDescription className="text-sm text-muted-foreground">
                Enter the phone number you want protected during the beta. We'll provide your assigned forwarding number after your beta account is created.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreateAccount} className="space-y-5" noValidate>
                {/* Full name */}
                <div className="space-y-1.5">
                  <Label htmlFor="full-name" className="flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-muted-foreground" />
                    Full name
                  </Label>
                  <Input
                    id="full-name"
                    data-testid="input-full-name"
                    type="text"
                    placeholder="Jane Doe"
                    value={fullName}
                    onChange={(e) => {
                      setFullName(e.target.value);
                      if (fieldErrors.fullName) setFieldErrors((p) => ({ ...p, fullName: "" }));
                    }}
                    className={cn("h-11", fieldErrors.fullName && "border-destructive focus-visible:ring-destructive")}
                    autoComplete="name"
                  />
                  {fieldErrors.fullName && (
                    <p className="text-xs text-destructive flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />{fieldErrors.fullName}
                    </p>
                  )}
                </div>

                {/* Email */}
                <div className="space-y-1.5">
                  <Label htmlFor="email" className="flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-muted-foreground" />
                    Email address
                  </Label>
                  <Input
                    id="email"
                    data-testid="input-email"
                    type="email"
                    placeholder="jane@example.com"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (fieldErrors.email) setFieldErrors((p) => ({ ...p, email: "" }));
                    }}
                    className={cn("h-11", fieldErrors.email && "border-destructive focus-visible:ring-destructive")}
                    autoComplete="email"
                  />
                  {fieldErrors.email && (
                    <p className="text-xs text-destructive flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />{fieldErrors.email}
                    </p>
                  )}
                </div>

                {/* Protected phone */}
                <div className="space-y-1.5">
                  <Label htmlFor="protected-phone" className="flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-muted-foreground" />
                    Protected phone number
                  </Label>
                  <Input
                    id="protected-phone"
                    data-testid="input-protected-phone"
                    type="tel"
                    placeholder="(555) 123-4567"
                    value={protectedPhone}
                    onChange={(e) => {
                      setProtectedPhone(e.target.value);
                      if (fieldErrors.protectedPhone) setFieldErrors((p) => ({ ...p, protectedPhone: "" }));
                    }}
                    className={cn("h-11", fieldErrors.protectedPhone && "border-destructive focus-visible:ring-destructive")}
                    autoComplete="tel"
                  />
                  <p className="text-xs text-muted-foreground">
                    The number you want protected from scam calls.
                  </p>
                  {fieldErrors.protectedPhone && (
                    <p className="text-xs text-destructive flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />{fieldErrors.protectedPhone}
                    </p>
                  )}
                </div>

                {/* Error */}
                {error && (
                  <div data-testid="status-error" className="flex items-start gap-2 p-3 rounded-lg bg-destructive/5 border border-destructive/20">
                    <AlertCircle className="w-4 h-4 text-destructive mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-destructive">{error}</p>
                  </div>
                )}

                <Button type="submit" variant="cta" size="lg" className="w-full" disabled={loading} data-testid="button-create-beta-account">
                  {loading ? (
                    <><Loader2 className="w-4 h-4 animate-spin" />Creating account...</>
                  ) : (
                    <>Create beta account<ArrowRight className="w-4 h-4 ml-1" /></>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        )}

        {/* ═══════════════════════════════════ */}
        {/* STATE 2A: Assigned number received */}
        {/* STATE 2B: Number pending           */}
        {/* ═══════════════════════════════════ */}
        {step === 2 && (
          <Card className="shadow-elevated border-border/60 animate-fade-in-up">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg sm:text-xl font-semibold text-foreground">
                {systemNumber ? "Your assigned forwarding number" : "Your beta request was received"}
              </CardTitle>
              <CardDescription className="text-sm text-muted-foreground">
                {systemNumber
                  ? "Use this number as the destination when turning on call forwarding with your phone carrier."
                  : "Your setup was created, but your assigned forwarding number is not ready yet."}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Account created */}
                <div className="flex items-start gap-2.5 p-3 rounded-lg bg-success-muted" data-testid="status-onboarding">
                  <CheckCircle2 className="w-4 h-4 text-success mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-success font-medium">Beta account created successfully.</p>
                </div>

                {systemNumber ? (
                  /* ── STATE 2A ── */
                  <>
                    <div className="rounded-lg border border-primary/20 bg-primary-glow/30 p-5" data-testid="status-assigned-number">
                      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-3">
                        Your assigned forwarding number
                      </p>
                      <div className="flex items-center gap-3">
                        <span className="text-2xl sm:text-3xl font-semibold text-foreground tracking-wide font-mono" data-testid="text-assigned-forwarding-number">
                          {systemNumber}
                        </span>
                        <CopyButton />
                      </div>
                      <p className="text-xs text-muted-foreground mt-3">
                        This is the number your protected phone should forward to during the beta.
                      </p>
                    </div>

                    <p className="text-sm text-muted-foreground leading-relaxed">
                      Save or copy this number. In the next step, you'll set up your phone carrier's call-forwarding feature to forward calls from your protected number{" "}
                      <span className="font-medium text-foreground">({protectedPhone})</span> to the assigned number.
                    </p>

                    <Button variant="cta" size="lg" className="w-full" onClick={handleContinueToForwarding} data-testid="button-continue-to-forwarding">
                      Continue to forwarding setup
                      <ArrowRight className="w-4 h-4 ml-1" />
                    </Button>
                  </>
                ) : (
                  /* ── STATE 2B ── */
                  <>
                    <div className="rounded-lg border border-warning/30 bg-warning/5 p-5" data-testid="status-assigned-number">
                      <p className="text-sm text-foreground font-medium mb-2">
                        Assigned forwarding number pending
                      </p>
                      <p className="text-sm text-muted-foreground mb-4">
                        The beta team will provide the assigned number before you turn on call forwarding. Keep an eye out for follow-up instructions.
                      </p>

                      {/* Summary */}
                      <div className="space-y-1.5 text-xs text-muted-foreground border-t border-border/40 pt-3 mt-3">
                        {fullName && <p><span className="font-medium text-foreground">Name:</span> {fullName}</p>}
                        {email && <p><span className="font-medium text-foreground">Email:</span> {email}</p>}
                        {protectedPhone && <p><span className="font-medium text-foreground">Protected number:</span> {protectedPhone}</p>}
                      </div>
                    </div>

                    {subscriberId && subscriberToken && (
                      <Button variant="outline" size="default" onClick={handleCheckStatus} disabled={statusLoading} className="w-full" data-testid="button-check-status">
                        {statusLoading ? (
                          <><Loader2 className="w-4 h-4 animate-spin mr-2" />Checking...</>
                        ) : (
                          <><RotateCw className="w-4 h-4 mr-2" />Check setup status</>
                        )}
                      </Button>
                    )}
                    {statusError && <p className="text-xs text-destructive" data-testid="status-error">{statusError}</p>}
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* ═══════════════════════════════════ */}
        {/* STATE 3: Turn on call forwarding   */}
        {/* ═══════════════════════════════════ */}
        {step === 3 && (
          <Card className="shadow-elevated border-border/60 animate-fade-in-up">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg sm:text-xl font-semibold text-foreground">
                Turn on call forwarding
              </CardTitle>
              <CardDescription className="text-sm text-muted-foreground">
                Use your carrier's call-forwarding feature to forward your protected number to the assigned number below.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Number reminder */}
                <div className="rounded-lg border border-border bg-secondary/40 p-4" data-testid="status-forwarding">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
                    Forward calls to this number
                  </p>
                  <div className="flex items-center gap-3">
                    <span className="text-xl sm:text-2xl font-semibold text-foreground tracking-wide font-mono" data-testid="text-assigned-forwarding-number">
                      {systemNumber}
                    </span>
                    <CopyButton size="sm" />
                  </div>
                </div>

                {/* Instructions */}
                <div className="space-y-3">
                  <h4 className="text-sm font-medium text-foreground">How to set up forwarding</h4>
                  <div className="space-y-2.5">
                    {[
                      "Open your phone carrier's call-forwarding settings or use your carrier's forwarding code.",
                      <>Set your protected number <span className="font-medium text-foreground">({protectedPhone})</span> to forward calls to the assigned number shown above.</>,
                      "Return to this page when forwarding is turned on.",
                      <>Click <span className="font-medium text-foreground">"I have turned on call forwarding"</span> below.</>,
                    ].map((text, i) => (
                      <div key={i} className="flex items-start gap-3">
                        <span className="flex-shrink-0 flex items-center justify-center w-6 h-6 rounded-full bg-accent text-accent-foreground text-xs font-medium">
                          {i + 1}
                        </span>
                        <p className="text-sm text-muted-foreground leading-relaxed pt-0.5">{text}</p>
                      </div>
                    ))}
                  </div>
                  <div className="rounded-lg border border-border/60 bg-accent/30 p-3 mt-2">
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      <span className="font-medium text-foreground">Note:</span> Call forwarding setup varies by carrier. Check your phone's settings, your carrier's app, or contact your carrier directly if you need help.
                    </p>
                  </div>
                </div>

                {/* Error */}
                {error && (
                  <div data-testid="status-error" className="flex items-start gap-2 p-3 rounded-lg bg-destructive/5 border border-destructive/20">
                    <AlertCircle className="w-4 h-4 text-destructive mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-destructive">{error}</p>
                  </div>
                )}

                <Button variant="cta" size="lg" className="w-full" onClick={handleForwardingConfirmed} disabled={loading} data-testid="button-forwarding-turned-on">
                  {loading ? (
                    <><Loader2 className="w-4 h-4 animate-spin" />Saving...</>
                  ) : (
                    <><PhoneForwarded className="w-4 h-4 mr-2" />I have turned on call forwarding</>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* ═══════════════════════════════════ */}
        {/* STATE 4A: Pending test call         */}
        {/* ═══════════════════════════════════ */}
        {step === 4 && resultState === "4A" && (
          <Card className="shadow-elevated border-success/30 animate-fade-in-up" data-testid="status-test-call">
            <CardContent className="p-6 sm:p-8">
              <div className="flex flex-col items-center text-center">
                <div className="flex items-center justify-center w-16 h-16 rounded-full bg-success-muted mb-5 animate-scale-in">
                  <ShieldCheck className="w-8 h-8 text-success" />
                </div>
                <h3 className="text-xl sm:text-2xl font-semibold text-foreground mb-2">
                  Ready for your first test call.
                </h3>
                <p className="text-sm text-muted-foreground mb-6 max-w-sm">
                  Your setup has been received. We'll use the first test call to confirm that your protected number is forwarding through the system correctly.
                </p>

                {statusLabel && STATUS_LABELS[statusLabel] && (
                  <div className="mb-4 px-3 py-1.5 rounded-full bg-accent text-accent-foreground text-xs font-medium">
                    Status: {STATUS_LABELS[statusLabel]}
                  </div>
                )}

                <div className="w-full max-w-xs space-y-3 mb-6">
                  {["Beta account created", "Assigned forwarding number provided", "Call forwarding marked as turned on", "First test call pending"].map((item, i) => (
                    <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-success-muted animate-fade-in" style={{ animationDelay: `${i * 150}ms` }}>
                      <CheckCircle2 className="w-5 h-5 text-success flex-shrink-0" />
                      <span className="text-sm font-medium text-foreground">{item}</span>
                    </div>
                  ))}
                </div>

                <Button variant="outline" size="default" onClick={handleCheckStatus} disabled={statusLoading} className="w-full max-w-xs mb-3" data-testid="button-check-status">
                  {statusLoading ? <><Loader2 className="w-4 h-4 animate-spin mr-2" />Checking...</> : <><RotateCw className="w-4 h-4 mr-2" />Check setup status</>}
                </Button>
                {statusError && <p className="text-xs text-destructive mb-3 max-w-xs" data-testid="status-error">{statusError}</p>}

                <p className="text-xs text-muted-foreground mt-4 max-w-sm">
                  We'll contact you with beta testing instructions and next steps.
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* ═══════════════════════════════════ */}
        {/* STATE 4B: First test call started   */}
        {/* ═══════════════════════════════════ */}
        {step === 4 && resultState === "4B" && (
          <Card className="shadow-elevated border-primary/30 animate-fade-in-up" data-testid="status-test-call">
            <CardContent className="p-6 sm:p-8">
              <div className="flex flex-col items-center text-center">
                <div className="flex items-center justify-center w-16 h-16 rounded-full bg-primary-glow mb-5 animate-pulse-gentle">
                  <PhoneCall className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-xl sm:text-2xl font-semibold text-foreground mb-2">
                  First test call started.
                </h3>
                <p className="text-sm text-muted-foreground mb-6 max-w-sm">
                  Answer the call and listen for the confirmation message. This call is used to confirm that your protected number is forwarding through the system correctly.
                </p>

                {statusLabel && STATUS_LABELS[statusLabel] && (
                  <div className="mb-4 px-3 py-1.5 rounded-full bg-accent text-accent-foreground text-xs font-medium">
                    Status: {STATUS_LABELS[statusLabel]}
                  </div>
                )}

                <Button variant="outline" size="default" onClick={handleCheckStatus} disabled={statusLoading} className="w-full max-w-xs mb-3" data-testid="button-check-status">
                  {statusLoading ? <><Loader2 className="w-4 h-4 animate-spin mr-2" />Checking...</> : <><RotateCw className="w-4 h-4 mr-2" />Check setup status</>}
                </Button>
                {statusError && <p className="text-xs text-destructive mb-3 max-w-xs" data-testid="status-error">{statusError}</p>}
              </div>
            </CardContent>
          </Card>
        )}

        {/* ═══════════════════════════════════ */}
        {/* STATE 4C: Success / service active  */}
        {/* ═══════════════════════════════════ */}
        {step === 4 && resultState === "4C" && (
          <Card className="shadow-elevated border-success/30 animate-fade-in-up" data-testid="status-success">
            <CardContent className="p-6 sm:p-8">
              <div className="flex flex-col items-center text-center">
                <div className="flex items-center justify-center w-16 h-16 rounded-full bg-success-muted mb-5 animate-scale-in">
                  <ShieldCheck className="w-8 h-8 text-success" />
                </div>
                <h3 className="text-xl sm:text-2xl font-semibold text-foreground mb-2">
                  Your phone is now protected.
                </h3>
                <p className="text-sm text-muted-foreground mb-6 max-w-sm">
                  Your setup is complete. The first test call confirmed that your protected number is forwarding through the system correctly.
                </p>

                <div className="w-full max-w-xs space-y-3 mb-6">
                  {["Beta account created", "Assigned forwarding number provided", "Call forwarding confirmed", "First test call completed", "Protection active"].map((item, i) => (
                    <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-success-muted animate-fade-in" style={{ animationDelay: `${i * 120}ms` }}>
                      <CheckCircle2 className="w-5 h-5 text-success flex-shrink-0" />
                      <span className="text-sm font-medium text-foreground">{item}</span>
                    </div>
                  ))}
                </div>

                <Button variant="outline" size="default" onClick={handleCheckStatus} disabled={statusLoading} className="w-full max-w-xs mb-3" data-testid="button-check-status">
                  {statusLoading ? <><Loader2 className="w-4 h-4 animate-spin mr-2" />Checking...</> : <><RotateCw className="w-4 h-4 mr-2" />Check setup status</>}
                </Button>
                {statusError && <p className="text-xs text-destructive mb-3 max-w-xs" data-testid="status-error">{statusError}</p>}

                <p className="text-xs text-muted-foreground mt-4 max-w-sm">
                  We'll contact you with any updates or next steps.
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* ═══════════════════════════════════ */}
        {/* STATE 4D: Needs attention           */}
        {/* ═══════════════════════════════════ */}
        {step === 4 && resultState === "4D" && (
          <Card className="shadow-elevated border-warning/30 animate-fade-in-up" data-testid="status-test-call">
            <CardContent className="p-6 sm:p-8">
              <div className="flex flex-col items-center text-center">
                <div className="flex items-center justify-center w-16 h-16 rounded-full bg-warning/10 mb-5 animate-scale-in">
                  <TriangleAlert className="w-8 h-8 text-warning" />
                </div>
                <h3 className="text-xl sm:text-2xl font-semibold text-foreground mb-2">
                  We could not confirm the connection yet.
                </h3>
                <p className="text-sm text-muted-foreground mb-6 max-w-sm">
                  Please re-check your call-forwarding setup with your phone carrier. Make sure your protected number is forwarding to the assigned number shown earlier.
                </p>

                {statusLabel && STATUS_LABELS[statusLabel] && (
                  <div className="mb-4 px-3 py-1.5 rounded-full bg-warning/10 text-warning text-xs font-medium">
                    Status: {STATUS_LABELS[statusLabel]}
                  </div>
                )}

                {statusError && <p className="text-xs text-destructive mb-3 max-w-xs" data-testid="status-error">{statusError}</p>}

                <div className="w-full max-w-xs space-y-3">
                  <Button variant="cta" size="lg" className="w-full" onClick={handleRetryTestCall} disabled={retryLoading} data-testid="button-retry-test-call">
                    {retryLoading ? <><Loader2 className="w-4 h-4 animate-spin" />Retrying...</> : <><RefreshCcw className="w-4 h-4 mr-2" />Try again</>}
                  </Button>
                  <Button variant="outline" size="default" className="w-full" onClick={handleCheckStatus} disabled={statusLoading} data-testid="button-check-status">
                    {statusLoading ? <><Loader2 className="w-4 h-4 animate-spin mr-2" />Checking...</> : <><RotateCw className="w-4 h-4 mr-2" />Check setup status</>}
                  </Button>
                </div>

                <p className="text-xs text-muted-foreground mt-4 max-w-sm">
                  If the issue persists, contact the beta coordinator for help.
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </section>
  );
});
