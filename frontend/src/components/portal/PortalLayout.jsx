import React from "react";
import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import { Shield, LogOut, LayoutDashboard, MessageSquare, UserCog, Users, Inbox, BarChart3, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";

const participantNav = [
  { to: "/portal/setup", label: "Protected Line setup", icon: Phone },
  { to: "/portal/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/portal/feedback", label: "Report issue", icon: MessageSquare },
  { to: "/portal/profile", label: "Profile", icon: UserCog },
];

const adminNav = [
  { to: "/portal/admin", label: "Overview", icon: BarChart3, end: true },
  { to: "/portal/admin/participants", label: "Participants", icon: Users },
  { to: "/portal/admin/feedback", label: "Feedback", icon: Inbox },
];

export function PortalLayout({ mode = "participant" }) {
  const { user, isAdmin, logout } = useAuth();
  const navigate = useNavigate();
  const nav = mode === "admin" ? adminNav : participantNav;

  const handleLogout = async () => {
    await logout();
    navigate("/portal/login", { replace: true });
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="sticky top-0 z-40 bg-background/95 backdrop-blur-md border-b border-border/50">
        <div className="max-w-6xl mx-auto px-5 sm:px-8 py-3.5 flex items-center justify-between gap-4">
          <Link to="/portal/dashboard" className="flex items-center gap-2" data-testid="portal-brand">
            <Shield className="w-5 h-5 text-primary" />
            <span className="text-sm font-semibold text-foreground tracking-tight">
              NoMoreScamCalls
            </span>
            <Badge variant="beta" className="text-[10px] ml-1">
              {mode === "admin" ? "Admin" : "Beta"}
            </Badge>
          </Link>

          <div className="flex items-center gap-2">
            {user && isAdmin && mode === "participant" && (
              <Link to="/portal/admin" className="text-xs text-muted-foreground hover:text-foreground" data-testid="link-switch-admin">
                Switch to admin
              </Link>
            )}
            {user && isAdmin && mode === "admin" && (
              <Link to="/portal/dashboard" className="text-xs text-muted-foreground hover:text-foreground" data-testid="link-switch-participant">
                Switch to participant
              </Link>
            )}
            {user && (
              <span className="hidden sm:inline text-xs text-muted-foreground">
                {user.email}
              </span>
            )}
            <Button variant="ghost" size="sm" onClick={handleLogout} data-testid="button-logout">
              <LogOut className="w-4 h-4 mr-1.5" />
              Sign out
            </Button>
          </div>
        </div>
      </header>

      <div className="flex-1 max-w-6xl w-full mx-auto px-5 sm:px-8 py-8 grid gap-8 md:grid-cols-[220px_1fr]">
        <aside className="md:sticky md:top-20 self-start">
          <nav className="flex md:flex-col gap-1 overflow-x-auto md:overflow-visible">
            {nav.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  data-testid={`nav-${item.to.split("/").pop()}`}
                  className={({ isActive }) =>
                    cn(
                      "flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors whitespace-nowrap",
                      isActive
                        ? "bg-accent text-accent-foreground font-medium"
                        : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
                    )
                  }
                >
                  <Icon className="w-4 h-4" />
                  {item.label}
                </NavLink>
              );
            })}
          </nav>
        </aside>

        <main className="min-w-0">
          <Outlet />
        </main>
      </div>

      <footer className="border-t border-border/50 py-6">
        <div className="max-w-6xl mx-auto px-5 sm:px-8 flex items-center justify-between text-xs text-muted-foreground">
          <span>NoMoreScamCalls Beta Portal</span>
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
