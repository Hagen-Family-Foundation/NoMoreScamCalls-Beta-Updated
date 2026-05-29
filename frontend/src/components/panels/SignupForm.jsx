import React from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, AlertCircle, Phone, Mail, User, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

export const SignupForm = ({
  fullName, setFullName,
  email, setEmail,
  protectedPhone, setProtectedPhone,
  fieldErrors, setFieldErrors,
  error, loading,
  onSubmit,
}) => {
  return (
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
        <form onSubmit={onSubmit} className="space-y-5" noValidate>
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
  );
};
