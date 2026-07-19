import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, AlertCircle, ArrowRight, Mail, Lock } from "lucide-react";
import { AuthShell } from "@/components/portal/AuthShell";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!email.trim() || !password) {
      setError("Enter your email and password.");
      return;
    }
    setLoading(true);
    try {
      const me = await login({ email: email.trim(), password });
      const to = location.state?.from?.pathname || (me.role === "admin" || me.role === "administrator" ? "/portal/admin" : "/portal/dashboard");
      navigate(me.agreement_accepted ? to : "/portal/agreement", { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      title="Sign in"
      subtitle="Welcome back to the NoMoreScamCalls beta."
      footer={
        <>Have an invitation code?{" "}
          <Link to="/portal/join" className="text-primary hover:underline" data-testid="link-to-invite">Create an account</Link>
        </>
      }
    >
      <Card className="shadow-elevated border-border/60">
        <CardContent className="p-6 sm:p-8">
          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            <div className="space-y-1.5">
              <Label htmlFor="email" className="flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-muted-foreground" />
                Email address
              </Label>
              <Input
                id="email"
                data-testid="input-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={cn("h-11", error && "border-destructive focus-visible:ring-destructive")}
                autoComplete="email"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="password" className="flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-muted-foreground" />
                Password
              </Label>
              <Input
                id="password"
                data-testid="input-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={cn("h-11", error && "border-destructive focus-visible:ring-destructive")}
                autoComplete="current-password"
              />
            </div>

            {error && (
              <div data-testid="status-error" className="flex items-start gap-2 p-3 rounded-lg bg-destructive/5 border border-destructive/20">
                <AlertCircle className="w-4 h-4 text-destructive mt-0.5 flex-shrink-0" />
                <p className="text-sm text-destructive">{error}</p>
              </div>
            )}

            <Button type="submit" variant="cta" size="lg" className="w-full" disabled={loading} data-testid="button-login">
              {loading ? (<><Loader2 className="w-4 h-4 animate-spin" />Signing in...</>) : (<>Sign in<ArrowRight className="w-4 h-4 ml-1" /></>)}
            </Button>
          </form>
        </CardContent>
      </Card>
    </AuthShell>
  );
}
