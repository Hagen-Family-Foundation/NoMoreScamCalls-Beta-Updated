import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, AlertCircle, CheckCircle2, Send } from "lucide-react";
import { portalApi } from "@/lib/portalApi";
import { cn } from "@/lib/utils";

const CATEGORIES = [
  { value: "call_should_have_connected", label: "A call should have connected but did not" },
  { value: "call_should_not_have_connected", label: "A call connected but should not have" },
  { value: "setup_problem", label: "Setup problem" },
  { value: "delivery_problem", label: "Delivery problem" },
  { value: "unexpected_behavior", label: "Unexpected product behavior" },
  { value: "general", label: "General observation" },
];

export default function FeedbackPage() {
  const [category, setCategory] = useState("");
  const [relatedCallId, setRelatedCallId] = useState("");
  const [comments, setComments] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setSent(false);
    if (!category) { setError("Please choose what this report is about."); return; }
    if (!comments.trim()) { setError("Please add a few words describing what you observed."); return; }
    setSending(true);
    try {
      await portalApi.submitFeedback({
        category,
        related_call_id: relatedCallId.trim() || null,
        comments: comments.trim(),
      });
      setSent(true);
      setCategory("");
      setRelatedCallId("");
      setComments("");
    } catch (err) {
      setError(err.message);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="space-y-6 max-w-2xl" data-testid="feedback-page">
      <div>
        <h1 className="text-2xl font-semibold text-foreground tracking-tight">Report an issue</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Tell us what you observed. Your reports help improve the service during beta.
        </p>
      </div>

      <Card className="shadow-elevated border-border/60">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Submit a report</CardTitle>
          <CardDescription className="text-xs">
            You can also email <a href="mailto:support@nomorescamcalls.com" className="text-primary hover:underline">support@nomorescamcalls.com</a>.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={submit} className="space-y-4" noValidate>
            <div className="space-y-1.5">
              <Label>What is this about?</Label>
              <div className="grid gap-2">
                {CATEGORIES.map((c) => (
                  <button
                    key={c.value}
                    type="button"
                    data-testid={`radio-category-${c.value}`}
                    onClick={() => setCategory(c.value)}
                    className={cn(
                      "text-left px-3 py-2.5 rounded-md border text-sm transition-colors",
                      category === c.value
                        ? "border-primary bg-primary/5 text-foreground font-medium"
                        : "border-input text-muted-foreground hover:text-foreground"
                    )}
                  >
                    {c.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="related-call">Related call ID or date/time <span className="text-muted-foreground">(optional)</span></Label>
              <Input id="related-call" data-testid="input-related-call" value={relatedCallId} onChange={(e) => setRelatedCallId(e.target.value)} className="h-11" placeholder="e.g. a call ID from your dashboard, or a rough time" />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="comments">Your comments</Label>
              <Textarea
                id="comments"
                data-testid="input-comments"
                value={comments}
                onChange={(e) => setComments(e.target.value)}
                rows={5}
                placeholder="Describe what happened, when it happened, and what you expected."
              />
            </div>

            {error && (
              <div data-testid="status-error" className="flex items-start gap-2 p-3 rounded-lg bg-destructive/5 border border-destructive/20">
                <AlertCircle className="w-4 h-4 text-destructive mt-0.5 flex-shrink-0" />
                <p className="text-sm text-destructive">{error}</p>
              </div>
            )}
            {sent && (
              <div data-testid="status-sent" className="flex items-start gap-2 p-3 rounded-lg bg-success-muted border border-success/20">
                <CheckCircle2 className="w-4 h-4 text-success mt-0.5 flex-shrink-0" />
                <p className="text-sm text-success">Thanks — your report was sent.</p>
              </div>
            )}

            <Button type="submit" variant="cta" size="lg" disabled={sending} data-testid="button-submit-feedback">
              {sending ? (<><Loader2 className="w-4 h-4 animate-spin" />Sending...</>) : (<><Send className="w-4 h-4 mr-2" />Send report</>)}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
