import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, AlertCircle, ArrowRight, Ticket } from "lucide-react";
import { AuthShell } from "@/components/portal/AuthShell";
import { portalApi } from "@/lib/portalApi";
import { cn } from "@/lib/utils";

export default function InviteCodePage() {
  const navigate = useNavigate();
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    const trimmed = code.trim().toUpperCase();
    if (!trimmed) {
      setError("Please enter your invitation code.");
      return;
    }
    setLoading(true);
    try {
      const result = await portalApi.validateInviteCode(trimmed);
      if (result?.valid === false) {
        setError(result.message || "This invitation code is not valid.");
        return;
      }
      navigate("/portal/register", { state: { code: trimmed } });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      title="Enter your invitation code"
      subtitle="A NoMoreScamCalls beta invitation code is required to create an account."
      footer={
        <>Already have an account?{" "}
          <Link to="/portal/login" className="text-primary hover:underline" data-testid="link-to-login">Sign in</Link>
        </>
      }
    >
      <Card className="shadow-elevated border-border/60">
        <CardContent className="p-6 sm:p-8">
          <form onSubmit={handleSubmit} className="space-y-5" noValidate>
            <div className="space-y-1.5">
              <Label htmlFor="invite-code" className="flex items-center gap-1.5">
                <Ticket className="w-3.5 h-3.5 text-muted-foreground" />
                Invitation code
              </Label>
              <Input
                id="invite-code"
                data-testid="input-invite-code"
                type="text"
                placeholder="NMSC-XXXX-XXXX"
                value={code}
                onChange={(e) => { setCode(e.target.value); if (error) setError(""); }}
                className={cn("h-11 font-mono tracking-wider", error && "border-destructive focus-visible:ring-destructive")}
                autoComplete="off"
                autoCapitalize="characters"
              />
              <p className="text-xs text-muted-foreground">Your code was sent to you by NoMoreScamCalls.</p>
            </div>

            {error && (
              <div data-testid="status-error" className="flex items-start gap-2 p-3 rounded-lg bg-destructive/5 border border-destructive/20">
                <AlertCircle className="w-4 h-4 text-destructive mt-0.5 flex-shrink-0" />
                <p className="text-sm text-destructive">{error}</p>
              </div>
            )}

            <Button type="submit" variant="cta" size="lg" className="w-full" disabled={loading} data-testid="button-validate-code">
              {loading ? (
                <><Loader2 className="w-4 h-4 animate-spin" />Checking...</>
              ) : (
                <>Continue<ArrowRight className="w-4 h-4 ml-1" /></>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </AuthShell>
  );
}
