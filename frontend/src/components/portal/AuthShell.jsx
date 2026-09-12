import React from "react";
import { Link } from "react-router-dom";
import { Shield } from "lucide-react";
import { Badge } from "@/components/ui/badge";

/**
 * Shared shell for pre-auth pages (register, agreement, login).
 * Matches the landing-page visual language.
 */
export function AuthShell({ title, subtitle, children, footer }) {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="border-b border-border/50">
        <div className="max-w-3xl mx-auto px-5 sm:px-8 py-3.5 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-primary" />
            <span className="text-sm font-semibold text-foreground tracking-tight">
              NoMoreScamCalls
            </span>
          </Link>
          <Badge variant="beta" className="text-[10px]">Beta portal</Badge>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center py-12 px-5">
        <div className="w-full max-w-md">
          <div className="text-center mb-6">
            <h1 className="text-2xl sm:text-3xl font-semibold text-foreground tracking-tight">
              {title}
            </h1>
            {subtitle && (
              <p className="text-sm text-muted-foreground mt-2">{subtitle}</p>
            )}
          </div>
          {children}
          {footer && (
            <div className="text-center text-xs text-muted-foreground mt-6">
              {footer}
            </div>
          )}
        </div>
      </main>

      <footer className="border-t border-border/50 py-6">
        <div className="max-w-3xl mx-auto px-5 sm:px-8 flex items-center justify-between text-xs text-muted-foreground">
          <span>NoMoreScamCalls</span>
          <a
            href="mailto:support@nomorescamcalls.com"
            className="hover:text-foreground"
            data-testid="link-support-email"
          >
            support@nomorescamcalls.com
          </a>
        </div>
      </footer>
    </div>
  );
}
