import { Link, useNavigate } from "@tanstack/react-router";
import { Flame, Library, LogOut, Sparkles, Ticket, User } from "lucide-react";
import type { ReactNode } from "react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { isPremium, useProfile } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

const NAV = [
  { to: "/generate", label: "Generate", icon: Sparkles },
  { to: "/workspace", label: "Workspace", icon: Library },
  { to: "/subscribe", label: "Subscribe", icon: Ticket },
  { to: "/profile", label: "Profile", icon: User },
] as const;

export function AppShell({ children }: { children: ReactNode }) {
  const { data: profile } = useProfile();
  const navigate = useNavigate();
  const premium = isPremium(profile);

  const signOut = async () => {
    await supabase.auth.signOut();
    navigate({ to: "/" });
  };

  return (
    <div className="flex min-h-screen bg-background">
      <aside className="hidden w-60 shrink-0 flex-col border-r border-sidebar-border bg-sidebar p-4 md:flex">
        <Link to="/" className="flex items-center gap-2 px-2 py-3">
          <Flame className="size-5 text-gold" />
          <span className="font-display text-xl text-gradient-forge">VerseForge</span>
        </Link>
        <nav className="mt-6 flex flex-1 flex-col gap-1">
          {NAV.map(({ to, label, icon: Icon }) => (
            <Link
              key={to}
              to={to}
              activeProps={{ className: "bg-sidebar-accent text-teal" }}
              className="flex min-h-11 items-center gap-3 rounded-lg px-3 text-sm text-sidebar-foreground transition-colors hover:bg-sidebar-accent"
            >
              <Icon className="size-4" />
              {label}
            </Link>
          ))}
        </nav>
        <Button variant="ghost" className="justify-start" onClick={signOut}>
          <LogOut className="mr-2 size-4" /> Sign out
        </Button>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center justify-between border-b border-border px-4 py-3">
          <Link to="/" className="font-display text-lg text-gradient-forge md:hidden">
            VerseForge
          </Link>
          <span className="hidden text-sm text-muted-foreground md:inline">
            Words forged in every tongue
          </span>
          <div className="flex items-center gap-3">
            {premium && (
              <Badge className="bg-gold text-gold-foreground">Premium</Badge>
            )}
            <Link to="/profile" className="flex items-center gap-2">
              <span className="hidden text-sm text-muted-foreground sm:inline">
                {profile?.display_name ?? "Poet"}
              </span>
              <Avatar className="size-9 border border-border">
                <AvatarImage src={profile?.avatar_url ?? undefined} alt="" />
                <AvatarFallback className="bg-secondary text-xs">
                  {(profile?.display_name ?? "VF").slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
            </Link>
          </div>
        </header>

        <main className="flex-1 px-4 pb-24 pt-6 md:px-8 md:pb-10">{children}</main>

        <nav className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-4 border-t border-border bg-sidebar md:hidden">
          {NAV.map(({ to, label, icon: Icon }) => (
            <Link
              key={to}
              to={to}
              activeProps={{ className: "text-teal" }}
              className="flex min-h-14 flex-col items-center justify-center gap-1 text-xs text-muted-foreground"
            >
              <Icon className="size-5" />
              {label}
            </Link>
          ))}
        </nav>
      </div>
    </div>
  );
}
