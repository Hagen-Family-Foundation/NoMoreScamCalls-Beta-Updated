import React, { useEffect, useState } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, AlertCircle, ArrowRight } from "lucide-react";
import { AuthShell } from "@/components/portal/AuthShell";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";

const CONTACT_METHODS = [
  { value: "email", label: "Email" },
  { value: "phone", label: "Phone" },
  { value: "sms", label: "Text message" },
];

const CARRIERS = ["Verizon", "AT&T", "T-Mobile", "US Cellular", "Google Fi", "Xfinity Mobile", "Spectrum Mobile", "Other"];

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export default function RegisterPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { register } = useAuth();
  const code = location.state?.code || "";

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [carrier, setCarrier] = useState("");
  const [contactMethod, setContactMethod] = useState("email");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState("");

  useEffect(() => {
    if (!code) navigate("/portal/join", { replace: true });
  }, [code, navigate]);

  if (!code) return <Navigate to="/portal/join" replace />;

  const validate = () => {
    const e = {};
    if (!firstName.trim()) e.firstName = "First name is required.";
    if (!lastName.trim()) e.lastName = "Last name is required.";
    if (!email.trim()) e.email = "Email is required.";
    else if (!isValidEmail(email)) e.email = "Enter a valid email.";
    if (!phone.trim()) e.phone = "Phone number is required.";
    if (!carrier.trim()) e.carrier = "Carrier is required.";
    if (!password) e.password = "Choose a password.";
    else if (password.length < 8) e.password = "Password must be at least 8 characters.";
    if (password !== confirmPassword) e.confirmPassword = "Passwords do not match.";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    setSubmitError("");
    if (!validate()) return;
    setLoading(true);
    try {
      await register({
        code,
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        email: email.trim(),
        phone: phone.trim(),
        carrier: carrier.trim(),
        contact_method: contactMethod,
        password,
      });
      navigate("/portal/agreement", { replace: true });
    } catch (err) {
      setSubmitError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      title="Create your beta account"
      subtitle={<>Invitation code:{" "}<span className="font-mono text-foreground">{code}</span></>}
      footer={
        <>Already registered?{" "}
          <Link to="/portal/login" className="text-primary hover:underline" data-testid="link-to-login">Sign in</Link>
        </>
      }
    >
      <Card className="shadow-elevated border-border/60">
        <CardContent className="p-6 sm:p-8">
          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            <div className="grid grid-cols-2 gap-3">
              <FormField id="first-name" label="First name" value={firstName} onChange={setFirstName} error={errors.firstName} testId="input-first-name" />
              <FormField id="last-name" label="Last name" value={lastName} onChange={setLastName} error={errors.lastName} testId="input-last-name" />
            </div>
            <FormField id="email" type="email" label="Email address" value={email} onChange={setEmail} error={errors.email} testId="input-email" autoComplete="email" />
            <FormField id="phone" type="tel" label="Telephone number being protected" value={phone} onChange={setPhone} error={errors.phone} testId="input-phone" autoComplete="tel" />

            <div className="space-y-1.5">
              <Label htmlFor="carrier">Mobile carrier</Label>
              <select
                id="carrier"
                data-testid="input-carrier"
                value={carrier}
                onChange={(e) => setCarrier(e.target.value)}
                className={cn(
                  "h-11 w-full rounded-md border bg-background px-3 text-sm",
                  errors.carrier ? "border-destructive" : "border-input"
                )}
              >
                <option value="">Select your carrier</option>
                {CARRIERS.map((c) => (<option key={c} value={c}>{c}</option>))}
              </select>
              {errors.carrier && <FieldError message={errors.carrier} />}
            </div>

            <div className="space-y-1.5">
              <Label>Preferred contact method</Label>
              <div className="flex gap-2">
                {CONTACT_METHODS.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    data-testid={`radio-contact-${opt.value}`}
                    onClick={() => setContactMethod(opt.value)}
                    className={cn(
                      "flex-1 h-10 rounded-md border text-sm transition-colors",
                      contactMethod === opt.value
                        ? "border-primary bg-primary/5 text-foreground font-medium"
                        : "border-input text-muted-foreground hover:text-foreground"
                    )}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            <FormField id="password" type="password" label="Password" value={password} onChange={setPassword} error={errors.password} testId="input-password" autoComplete="new-password" />
            <FormField id="confirm-password" type="password" label="Confirm password" value={confirmPassword} onChange={setConfirmPassword} error={errors.confirmPassword} testId="input-confirm-password" autoComplete="new-password" />

            {submitError && (
              <div data-testid="status-error" className="flex items-start gap-2 p-3 rounded-lg bg-destructive/5 border border-destructive/20">
                <AlertCircle className="w-4 h-4 text-destructive mt-0.5 flex-shrink-0" />
                <p className="text-sm text-destructive">{submitError}</p>
              </div>
            )}

            <Button type="submit" variant="cta" size="lg" className="w-full" disabled={loading} data-testid="button-register">
              {loading ? (<><Loader2 className="w-4 h-4 animate-spin" />Creating account...</>) : (<>Create account<ArrowRight className="w-4 h-4 ml-1" /></>)}
            </Button>
          </form>
        </CardContent>
      </Card>
    </AuthShell>
  );
}

function FormField({ id, label, value, onChange, error, testId, type = "text", autoComplete }) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id}>{label}</Label>
      <Input
        id={id}
        data-testid={testId}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={cn("h-11", error && "border-destructive focus-visible:ring-destructive")}
        autoComplete={autoComplete}
      />
      {error && <FieldError message={error} />}
    </div>
  );
}

function FieldError({ message }) {
  return (
    <p className="text-xs text-destructive flex items-center gap-1">
      <AlertCircle className="w-3 h-3" />{message}
    </p>
  );
}
