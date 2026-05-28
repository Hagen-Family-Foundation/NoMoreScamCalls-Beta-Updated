import React, { useState, useRef, useCallback } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { StepProgress } from "@/components/StepProgress";
import { createBetaAccount, sendVerificationCode, confirmVerificationCode } from "@/lib/api";
import {
  Loader2,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  Phone,
  Mail,
  User,
  ArrowRight,
  Send,
  RefreshCcw,
} from "lucide-react";
import { cn } from "@/lib/utils";

// Validation helpers
function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function isValidCode(code) {
  return /^\d{6}$/.test(code);
}

export const BetaOnboarding = React.forwardRef(function BetaOnboarding(props, ref) {
  // App state
  const [step, setStep] = useState(1); // 1=info, 2=verify, 3=ready
  const [subscriberId, setSubscriberId] = useState(null);
  const [subscriberToken, setSubscriberToken] = useState(null);
  const [sessionLost, setSessionLost] = useState(false);

  // Form fields
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [protectedPhone, setProtectedPhone] = useState("");
  const [forwardingPhone, setForwardingPhone] = useState("");
  const [verificationCode, setVerificationCode] = useState("");

  // UI state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [codeSent, setCodeSent] = useState(false);

  // Validation errors
  const [fieldErrors, setFieldErrors] = useState({});

  // OTP input refs
  const codeInputRef = useRef(null);

  // Validate step 1 form
  const validateForm = useCallback(() => {
    const errors = {};
    if (!fullName.trim()) errors.fullName = "Full name is required.";
    if (!email.trim()) errors.email = "Email is required.";
    else if (!isValidEmail(email)) errors.email = "Please enter a valid email address.";
    if (!protectedPhone.trim()) errors.protectedPhone = "Protected phone number is required.";
    if (!forwardingPhone.trim()) errors.forwardingPhone = "Forwarding phone number is required.";
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  }, [fullName, email, protectedPhone, forwardingPhone]);

  // Step 1: Create beta account
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
        forwardingPhone: forwardingPhone.trim(),
      });
      setSubscriberId(result.subscriberId);
      setSubscriberToken(result.subscriberToken);
      setStep(2);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Step 2a: Send verification code
  const handleSendCode = async () => {
    setError("");
    if (!subscriberId || !subscriberToken) {
      setSessionLost(true);
      return;
    }

    setLoading(true);
    try {
      await sendVerificationCode({ subscriberId, subscriberToken });
      setCodeSent(true);
      setTimeout(() => codeInputRef.current?.focus(), 100);
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

  // Step 2b: Confirm verification code
  const handleConfirmCode = async (e) => {
    e.preventDefault();
    setError("");

    if (!isValidCode(verificationCode)) {
      setError("Please enter a valid 6-digit verification code.");
      return;
    }

    if (!subscriberId || !subscriberToken) {
      setSessionLost(true);
      return;
    }

    setLoading(true);
    try {
      await confirmVerificationCode({
        subscriberId,
        subscriberToken,
        code: verificationCode.trim(),
      });
      setStep(3);
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

  // Reset everything
  const handleRestart = () => {
    setStep(1);
    setSubscriberId(null);
    setSubscriberToken(null);
    setSessionLost(false);
    setFullName("");
    setEmail("");
    setProtectedPhone("");
    setForwardingPhone("");
    setVerificationCode("");
    setError("");
    setCodeSent(false);
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

        {/* Step 1: Beta Info Form */}
        {step === 1 && (
          <Card className="shadow-elevated border-border/60 animate-fade-in-up">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg sm:text-xl font-semibold text-foreground">
                Beta setup
              </CardTitle>
              <CardDescription className="text-sm text-muted-foreground">
                Use the phone numbers you want to test with during the beta.
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

                {/* Forwarding phone */}
                <div className="space-y-1.5">
                  <Label htmlFor="forwarding-phone" className="flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-muted-foreground" />
                    Forwarding phone number
                  </Label>
                  <Input
                    id="forwarding-phone"
                    data-testid="input-forwarding-phone"
                    type="tel"
                    placeholder="(555) 987-6543"
                    value={forwardingPhone}
                    onChange={(e) => {
                      setForwardingPhone(e.target.value);
                      if (fieldErrors.forwardingPhone) setFieldErrors((p) => ({ ...p, forwardingPhone: "" }));
                    }}
                    className={cn(
                      "h-11",
                      fieldErrors.forwardingPhone && "border-destructive focus-visible:ring-destructive"
                    )}
                    autoComplete="tel"
                  />
                  <p className="text-xs text-muted-foreground">
                    The phone that should ring after ScamStop screens the call.
                  </p>
                  {fieldErrors.forwardingPhone && (
                    <p className="text-xs text-destructive flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {fieldErrors.forwardingPhone}
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

        {/* Step 2: Verification */}
        {step === 2 && (
          <Card className="shadow-elevated border-border/60 animate-fade-in-up">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg sm:text-xl font-semibold text-foreground">
                Verify your forwarding number
              </CardTitle>
              <CardDescription className="text-sm text-muted-foreground">
                We need to confirm the forwarding number before calls can be routed to it.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-5">
                {!codeSent ? (
                  /* Send code state */
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-accent/60">
                      <Phone className="w-5 h-5 text-accent-foreground flex-shrink-0" />
                      <div>
                        <p className="text-sm font-medium text-foreground">Forwarding number</p>
                        <p className="text-sm text-muted-foreground">{forwardingPhone}</p>
                      </div>
                    </div>

                    <p className="text-sm text-muted-foreground">
                      We'll send a 6-digit verification code to your forwarding phone number.
                    </p>

                    {/* Error */}
                    {error && (
                      <div
                        data-testid="status-verification"
                        className="flex items-start gap-2 p-3 rounded-lg bg-destructive/5 border border-destructive/20"
                      >
                        <AlertCircle className="w-4 h-4 text-destructive mt-0.5 flex-shrink-0" />
                        <p className="text-sm text-destructive">{error}</p>
                      </div>
                    )}

                    <Button
                      variant="cta"
                      size="lg"
                      className="w-full"
                      onClick={handleSendCode}
                      disabled={loading}
                      data-testid="button-send-verification-code"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Sending code...
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4 mr-1" />
                          Send verification code
                        </>
                      )}
                    </Button>
                  </div>
                ) : (
                  /* Confirm code state */
                  <form onSubmit={handleConfirmCode} className="space-y-4">
                    <div className="flex items-start gap-2 p-3 rounded-lg bg-success-muted">
                      <CheckCircle2 className="w-4 h-4 text-success mt-0.5 flex-shrink-0" />
                      <p className="text-sm text-success">
                        We sent a verification code to your forwarding phone number.
                      </p>
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="verification-code">Verification code</Label>
                      <Input
                        ref={codeInputRef}
                        id="verification-code"
                        data-testid="input-verification-code"
                        type="text"
                        inputMode="numeric"
                        maxLength={6}
                        placeholder="000000"
                        value={verificationCode}
                        onChange={(e) => {
                          const val = e.target.value.replace(/\D/g, "").slice(0, 6);
                          setVerificationCode(val);
                        }}
                        className="h-12 text-center text-lg font-medium tracking-[0.3em] font-mono"
                        autoComplete="one-time-code"
                      />
                      <p className="text-xs text-muted-foreground">Enter the 6-digit code</p>
                    </div>

                    {/* Error */}
                    {error && (
                      <div
                        data-testid="status-verification"
                        className="flex items-start gap-2 p-3 rounded-lg bg-destructive/5 border border-destructive/20"
                      >
                        <AlertCircle className="w-4 h-4 text-destructive mt-0.5 flex-shrink-0" />
                        <p className="text-sm text-destructive">{error}</p>
                      </div>
                    )}

                    <Button
                      type="submit"
                      variant="cta"
                      size="lg"
                      className="w-full"
                      disabled={loading || verificationCode.length !== 6}
                      data-testid="button-confirm-verification-code"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Verifying...
                        </>
                      ) : (
                        <>
                          Confirm code
                          <ArrowRight className="w-4 h-4 ml-1" />
                        </>
                      )}
                    </Button>

                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="w-full text-muted-foreground"
                      onClick={() => {
                        setCodeSent(false);
                        setVerificationCode("");
                        setError("");
                      }}
                      disabled={loading}
                    >
                      <RefreshCcw className="w-3.5 h-3.5 mr-1" />
                      Resend code
                    </Button>
                  </form>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 3: Success */}
        {step === 3 && (
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
                  Beta protection is ready.
                </h3>
                <p className="text-sm text-muted-foreground mb-8 max-w-sm">
                  Your beta account was created and your forwarding number was verified. You're ready for the next phase of testing.
                </p>

                {/* Checklist */}
                <div className="w-full max-w-xs space-y-3 mb-8">
                  {[
                    "Beta account created",
                    "Forwarding number verified",
                    "Protection ready for testing",
                  ].map((item, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-3 p-3 rounded-lg bg-success-muted animate-fade-in"
                      style={{ animationDelay: `${i * 150}ms` }}
                    >
                      <CheckCircle2 className="w-4.5 h-4.5 text-success flex-shrink-0" />
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

                <p className="text-xs text-muted-foreground mt-4">
                  We'll contact you with beta testing instructions and next steps.
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </section>
  );
});
