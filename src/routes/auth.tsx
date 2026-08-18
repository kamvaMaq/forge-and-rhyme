import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Flame } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { InkBackdrop } from "@/components/Embers";
import { lovable } from "@/integrations/lovable/index";
import { useSession } from "@/hooks/useAuth";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Sign in to VerseForge — AI poetry in 11 SA languages" },
      {
        name: "description",
        content:
          "Sign in with Google to forge original poems in all 11 official South African languages, hear them read aloud and save them to your workspace.",
      },
      { property: "og:title", content: "Sign in to VerseForge" },
      {
        property: "og:description",
        content: "Google sign-in for South Africa's multilingual AI poetry engine.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const { session, loading } = useSession();
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!loading && session) navigate({ to: "/generate" });
  }, [loading, session, navigate]);

  const signIn = async () => {
    setBusy(true);
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin,
    });
    if (result.error) {
      setBusy(false);
      toast.error("Could not sign in. Please try again.");
      return;
    }
    if (result.redirected) return;
    navigate({ to: "/generate" });
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-4">
      <InkBackdrop />
      <div className="relative w-full max-w-sm rounded-2xl border border-border bg-card p-8 text-center">
        <Flame className="mx-auto size-8 text-gold" />
        <h1 className="mt-4 font-display text-3xl text-gradient-forge">VerseForge</h1>
        <p className="mt-2 text-sm text-muted-foreground">Words forged in every tongue</p>
        <Button className="mt-8 w-full min-h-12" size="lg" onClick={signIn} disabled={busy}>
          {busy ? "Opening Google…" : "Sign in with Google"}
        </Button>
        <p className="mt-4 text-xs text-muted-foreground">
          One free poem every day. Unlimited for R50/month with a voucher.
        </p>
      </div>
    </div>
  );
}
