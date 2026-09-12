import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, AlertCircle, CheckCircle2, Save } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { portalApi } from "@/lib/portalApi";
import { cn } from "@/lib/utils";

const CONTACT_METHODS = [
  { value: "email", label: "Email" },
  { value: "phone", label: "Phone" },
  { value: "sms", label: "Text message" },
];

export default function ProfilePage() {
  const { user, refreshUser } = useAuth();
  const [firstName, setFirstName] = useState(user?.first_name || "");
  const [lastName, setLastName] = useState(user?.last_name || "");
  const [contactPhoneNumber, setContactPhoneNumber] = useState(user?.contact_phone_number || "");
  const [contactMethod, setContactMethod] = useState(user?.contact_method || "email");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);

  const handleSave = async (e) => {
    e.preventDefault();
    setError("");
    setSaved(false);
    setSaving(true);
    try {
      await portalApi.updateMe({
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        contact_phone_number: contactPhoneNumber.trim(),
        contact_method: contactMethod,
      });
      await refreshUser();
      setSaved(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-2xl" data-testid="profile-page">
      <div>
        <h1 className="text-2xl font-semibold text-foreground tracking-tight">Profile & settings</h1>
        <p className="text-sm text-muted-foreground mt-1">Update the information tied to your beta account.</p>
      </div>

      <Card className="shadow-elevated border-border/60">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Your details</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSave} className="space-y-4" noValidate>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="first-name">First name</Label>
                <Input id="first-name" data-testid="input-first-name" value={firstName} onChange={(e) => setFirstName(e.target.value)} className="h-11" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="last-name">Last name</Label>
                <Input id="last-name" data-testid="input-last-name" value={lastName} onChange={(e) => setLastName(e.target.value)} className="h-11" />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="email">Email address</Label>
              <Input id="email" value={user?.email || ""} disabled className="h-11 bg-muted" data-testid="input-email-readonly" />
              <p className="text-xs text-muted-foreground">Contact support to change the email tied to your account.</p>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="contact-phone-number">Account contact phone number</Label>
              <Input id="contact-phone-number" data-testid="input-contact-phone-number" type="tel" value={contactPhoneNumber} onChange={(e) => setContactPhoneNumber(e.target.value)} className="h-11" />
              <p className="text-xs text-muted-foreground">Protected telephone numbers are managed separately in Protected Line setup.</p>
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

            {error && (
              <div data-testid="status-error" className="flex items-start gap-2 p-3 rounded-lg bg-destructive/5 border border-destructive/20">
                <AlertCircle className="w-4 h-4 text-destructive mt-0.5 flex-shrink-0" />
                <p className="text-sm text-destructive">{error}</p>
              </div>
            )}
            {saved && (
              <div data-testid="status-saved" className="flex items-start gap-2 p-3 rounded-lg bg-success-muted border border-success/20">
                <CheckCircle2 className="w-4 h-4 text-success mt-0.5 flex-shrink-0" />
                <p className="text-sm text-success">Your details were saved.</p>
              </div>
            )}

            <Button type="submit" variant="cta" size="lg" disabled={saving} data-testid="button-save-profile">
              {saving ? (<><Loader2 className="w-4 h-4 animate-spin" />Saving...</>) : (<><Save className="w-4 h-4 mr-2" />Save changes</>)}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
