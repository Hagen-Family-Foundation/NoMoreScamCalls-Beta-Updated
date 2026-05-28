import React, { useState, useCallback } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { StepProgress } from "@/components/StepProgress";
import { createBetaAccount } from "@/lib/api";
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
} from "lucide-react";
import { cn } from "@/lib/utils";

// Validation helpers
function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export const BetaOnboarding = React.forwardRef(function BetaOnboarding(props, ref) {
  // App state — 1=info, 2=receive number, 3=turn on forwarding, 4=ready
  const [step, setStep] = useState(1);
  const [subscriberId, setSubscriberId] = useState(null);
  const [subscriberToken, setSubscriberToken] = useState(null);
  const [systemNumber, setSystemNumber] = useState(null);
  const [sessionLost, setSessionLost] = useState(false);

  // Form fields
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [protectedPhone, setProtectedPhone] = useState("");

  // UI state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  // Validation errors
  const [fieldErrors, setFieldErrors] = useState({});

  // Validate step 1 form
  const validateForm = useCallback(() => {
    const errors = {};
    if (!fullName.trim()) errors.fullName = "Full name is required.";
    if (!email.trim()) errors.email = "Email is required.";
    else if (!isValidEmail(email)) errors.email = "Please enter a valid email address.";
    if (!protectedPhone.trim()) errors.protectedPhone = "Protected phone number is required.";
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  }, [fullName, email, protectedPhone]);

  // Step 1: Create beta account → moves to Step 2
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

  // Step 2 → Step 3: User acknowledges the number, moves to forwarding instructions
  const handleContinueToForwarding = () => {
    setStep(3);
  };

  // Step 3 → Step 4: User confirms they turned on forwarding
  const handleForwardingConfirmed = () => {
    setStep(4);
  };

  // Copy number to clipboard
  const handleCopyNumber = async () => {
    const number = systemNumber || "Number pending";
    try {
      await navigator.clipboard.writeText(number);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      const textarea = document.createElement("textarea");
      textarea.value = number;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Reset everything
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
  };

  // Session lost state
  if (sessionLost) {
    return (
      <section ref={ref} className="py-12 sm:py-16">
        <div className="max-w-lg mx-auto px-5 sm:px-8">
          <Card className="shadow-elevated border-border/60">
            <CardContent className="p-6 sm:p-8 text-center">
              <AlertCircle className="w-10 h-10 text-warning mx-auto mb-4" />
              <h3 className="text-base font-semibold text-foreground mb-2">
                Session expired
              </h3>
              <p className="text-sm text-muted-foreground mb-6">
                Your beta session expired. Please restart setup or contact the beta coordinator.
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

  return (
    <section ref={ref} id="beta-setup" className="py-12 sm:py-16">
      <div className="max-w-lg mx-auto px-5 sm:px-8">
        {/* Step Progress */}
        <StepProgress currentStep={step} />

        {/* ======================== */}
        {/* Step 1: Enter Beta Info  */}
        {/* ======================== */}
        {step === 1 && (
          <Card className="shadow-elevated border-border/60 animate-fade-in-up">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg sm:text-xl font-semibold text-foreground">
                Beta setup
              </CardTitle>
              <CardDescription className="text-sm text-muted-foreground">
                Enter the phone number you want protected during the beta.
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
                    className={cn(
                      "h-11",
                      fieldErrors.fullName && "border-destructive focus-visible:ring-destructive"
                    )}
                    autoComplete="name"
                  />
                  {fieldErrors.fullName && (
                    <p className="text-xs text-destructive flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {fieldErrors.fullName}
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
                    className={cn(
                      "h-11",
                      fieldErrors.email && "border-destructive focus-visible:ring-destructive"
                    )}
                    autoComplete="email"
                  />
                  {fieldErrors.email && (
                    <p className="text-xs text-destructive flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {fieldErrors.email}
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
                    className={cn(
                      "h-11",
                      fieldErrors.protectedPhone && "border-destructive focus-visible:ring-destructive"
                    )}
                    autoComplete="tel"
                  />
                  <p className="text-xs text-muted-foreground">
                    The number you want protected from scam calls.
                  </p>
                  {fieldErrors.protectedPhone && (
                    <p className="text-xs text-destructive flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {fieldErrors.protectedPhone}
                    </p>
                  )}
                </div>

                {/* Error message */}
                {error && (
                  <div
                    data-testid="status-onboarding"
                    className="flex items-start gap-2 p-3 rounded-lg bg-destructive/5 border border-destructive/20"
                  >
                    <AlertCircle className="w-4 h-4 text-destructive mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-destructive">{error}</p>
                  </div>
                )}

                {/* Submit */}
                <Button
                  type="submit"
                  variant="cta"
                  size="lg"
                  className="w-full"
                  disabled={loading}
                  data-testid="button-create-beta-account"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Creating account...
                    </>
                  ) : (
                    <>
                      Create beta account
                      <ArrowRight className="w-4 h-4 ml-1" />
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        )}

        {/* =========================================== */}
        {/* Step 2: Receive Your ScamStop Number        */}
        {/* =========================================== */}
        {step === 2 && (
          <Card className="shadow-elevated border-border/60 animate-fade-in-up">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg sm:text-xl font-semibold text-foreground">
                Your ScamStop forwarding number
              </CardTitle>
              <CardDescription className="text-sm text-muted-foreground">
                Your beta account has been created. Below is the ScamStop/Telnyx number assigned to you. You'll use this number in the next step when setting up call forwarding with your phone carrier.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Account created confirmation */}
                <div className="flex items-start gap-2.5 p-3 rounded-lg bg-success-muted">
                  <CheckCircle2 className="w-4 h-4 text-success mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-success font-medium">
                    Beta account created successfully.
                  </p>
                </div>

                {/* Assigned ScamStop number — prominent display */}
                <div className="rounded-lg border border-primary/20 bg-primary-glow/30 p-5">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-3">
                    Your assigned ScamStop number
                  </p>
                  {systemNumber ? (
                    <div className="flex items-center gap-3">
                      <span className="text-2xl sm:text-3xl font-semibold text-foreground tracking-wide font-mono">
                        {systemNumber}
                      </span>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={handleCopyNumber}
                        className="h-9 w-9 text-muted-foreground hover:text-foreground"
                        aria-label="Copy number"
                        data-testid="button-copy-number"
                      >
                        {copied ? (
                          <Check className="w-4 h-4 text-success" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      Your ScamStop number will be assigned shortly. Check your email or contact the beta coordinator.
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground mt-3">
                    This is the destination number you will forward your calls to.
                  </p>
                </div>

                {/* Explanation */}
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Save or copy this number. In the next step, you'll set up your phone carrier's call-forwarding feature to forward calls from your protected number{" "}
                  <span className="font-medium text-foreground">({protectedPhone})</span> to this ScamStop number.
                </p>

                {/* Continue to forwarding setup */}
                <Button
                  variant="cta"
                  size="lg"
                  className="w-full"
                  onClick={handleContinueToForwarding}
                  data-testid="button-continue-to-forwarding"
                >
                  Continue to forwarding setup
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* =========================================== */}
        {/* Step 3: Turn On Call Forwarding             */}
        {/* =========================================== */}
        {step === 3 && (
          <Card className="shadow-elevated border-border/60 animate-fade-in-up">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg sm:text-xl font-semibold text-foreground">
                Turn on call forwarding
              </CardTitle>
              <CardDescription className="text-sm text-muted-foreground">
                Use your carrier's call-forwarding feature to forward your protected number to the assigned ScamStop number below.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* ScamStop number reminder */}
                <div className="rounded-lg border border-border bg-secondary/40 p-4">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
                    Forward calls to this number
                  </p>
                  {systemNumber ? (
                    <div className="flex items-center gap-3">
                      <span className="text-xl sm:text-2xl font-semibold text-foreground tracking-wide font-mono">
                        {systemNumber}
                      </span>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={handleCopyNumber}
                        className="h-8 w-8 text-muted-foreground hover:text-foreground"
                        aria-label="Copy number"
                      >
                        {copied ? (
                          <Check className="w-4 h-4 text-success" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      Number pending — check your email or contact the beta coordinator.
                    </p>
                  )}
                </div>

                {/* Forwarding instructions */}
                <div className="space-y-3">
                  <h4 className="text-sm font-medium text-foreground">
                    How to set up forwarding
                  </h4>
                  <div className="space-y-2.5">
                    <div className="flex items-start gap-3">
                      <span className="flex-shrink-0 flex items-center justify-center w-6 h-6 rounded-full bg-accent text-accent-foreground text-xs font-medium">
                        1
                      </span>
                      <p className="text-sm text-muted-foreground leading-relaxed pt-0.5">
                        Open the <span className="font-medium text-foreground">Phone</span> app on your device or contact your carrier.
                      </p>
                    </div>
                    <div className="flex items-start gap-3">
                      <span className="flex-shrink-0 flex items-center justify-center w-6 h-6 rounded-full bg-accent text-accent-foreground text-xs font-medium">
                        2
                      </span>
                      <p className="text-sm text-muted-foreground leading-relaxed pt-0.5">
                        Set up <span className="font-medium text-foreground">call forwarding</span> on your protected number{" "}
                        <span className="font-medium text-foreground">({protectedPhone})</span>.
                      </p>
                    </div>
                    <div className="flex items-start gap-3">
                      <span className="flex-shrink-0 flex items-center justify-center w-6 h-6 rounded-full bg-accent text-accent-foreground text-xs font-medium">
                        3
                      </span>
                      <p className="text-sm text-muted-foreground leading-relaxed pt-0.5">
                        Set the forwarding destination to the <span className="font-medium text-foreground">ScamStop number</span> shown above.
                      </p>
                    </div>
                  </div>

                  <div className="rounded-lg border border-border/60 bg-accent/30 p-3 mt-2">
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      <span className="font-medium text-foreground">Tip:</span> On most phones you can enable call forwarding in{" "}
                      <span className="font-medium text-foreground">Settings &rarr; Phone &rarr; Call Forwarding</span>, or by dialing{" "}
                      <span className="font-mono font-medium text-foreground">*72</span> followed by the ScamStop number. Contact your carrier if you need help.
                    </p>
                  </div>
                </div>

                {/* Confirm forwarding button */}
                <Button
                  variant="cta"
                  size="lg"
                  className="w-full"
                  onClick={handleForwardingConfirmed}
                  data-testid="button-confirm-forwarding"
                >
                  <PhoneForwarded className="w-4 h-4 mr-2" />
                  I have turned on call forwarding
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* ========================= */}
        {/* Step 4: Ready / Success    */}
        {/* ========================= */}
        {step === 4 && (
          <Card
            className="shadow-elevated border-success/30 animate-fade-in-up"
            data-testid="status-success"
          >
            <CardContent className="p-6 sm:p-8">
              <div className="flex flex-col items-center text-center">
                {/* Success icon */}
                <div className="flex items-center justify-center w-16 h-16 rounded-full bg-success-muted mb-5 animate-scale-in">
                  <ShieldCheck className="w-8 h-8 text-success" />
                </div>

                <h3 className="text-xl sm:text-2xl font-semibold text-foreground mb-2">
                  Ready for first test call.
                </h3>
                <p className="text-sm text-muted-foreground mb-8 max-w-sm">
                  Your beta setup request has been received. We will place a test call to your protected number to confirm ScamStop is connected and screening calls correctly.
                </p>

                {/* Checklist */}
                <div className="w-full max-w-xs space-y-3 mb-8">
                  {[
                    "Beta account created",
                    "ScamStop number assigned",
                    "Call forwarding configured",
                    "Ready for first test call",
                  ].map((item, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-3 p-3 rounded-lg bg-success-muted animate-fade-in"
                      style={{ animationDelay: `${i * 150}ms` }}
                    >
                      <CheckCircle2 className="w-5 h-5 text-success flex-shrink-0" />
                      <span className="text-sm font-medium text-foreground">{item}</span>
                    </div>
                  ))}
                </div>

                <Button
                  variant="cta"
                  size="lg"
                  onClick={handleRestart}
                  className="w-full max-w-xs"
                >
                  Done for now
                </Button>

                <p className="text-xs text-muted-foreground mt-4 max-w-sm">
                  We'll contact you with beta testing instructions and next steps, including your first test call.
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </section>
  );
});
