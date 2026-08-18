import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { LANGUAGES } from "@/lib/verseforge";
import { isPremium, useProfile, useSession } from "@/hooks/useAuth";

export const Route = createFileRoute("/_authenticated/profile")({
  head: () => ({
    meta: [
      { title: "Your profile & settings — VerseForge" },
      {
        name: "description",
        content:
          "Manage your VerseForge account: subscription status, default poem language, email preferences and account deletion.",
      },
      { property: "og:title", content: "Your VerseForge profile" },
      { property: "og:description", content: "Subscription, language and account settings." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ProfilePage,
});

function ProfilePage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useSession();
  const { data: profile } = useProfile();
  const [language, setLanguage] = useState("English");
  const [emailOptIn, setEmailOptIn] = useState(true);

  useEffect(() => {
    if (profile?.preferred_language) setLanguage(profile.preferred_language);
  }, [profile?.preferred_language]);

  const saveLanguage = useMutation({
    mutationFn: async (next: string) => {
      const { error } = await supabase
        .from("profiles")
        .update({ preferred_language: next })
        .eq("id", user!.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      toast.success("Default language saved.");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const deleteAccount = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("profiles").delete().eq("id", user!.id);
      if (error) throw error;
      await supabase.auth.signOut();
    },
    onSuccess: () => {
      toast.success("Your data has been deleted.");
      navigate({ to: "/" });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const premium = isPremium(profile);

  return (
    <div className="mx-auto w-full max-w-xl space-y-8">
      <header className="flex items-center gap-4">
        <Avatar className="size-16 border border-border">
          <AvatarImage src={profile?.avatar_url ?? undefined} alt="" />
          <AvatarFallback className="bg-secondary">
            {(profile?.display_name ?? "VF").slice(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div>
          <h1 className="font-display text-2xl text-foreground">
            {profile?.display_name ?? "Poet"}
          </h1>
          <p className="text-sm text-muted-foreground">{profile?.email}</p>
        </div>
      </header>

      <section className="rounded-2xl border border-border bg-card p-6">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-xl">Subscription</h2>
          <Badge className={premium ? "bg-gold text-gold-foreground" : "bg-secondary"}>
            {premium ? "Premium" : "Free"}
          </Badge>
        </div>
        <p className="mt-3 text-sm text-muted-foreground">
          {premium
            ? `Unlimited poems until ${new Date(profile!.subscription_expires_at!).toLocaleDateString("en-ZA")}.`
            : "One poem per day. Redeem a voucher for unlimited forging."}
        </p>
        <Button
          className="mt-4 min-h-11"
          variant={premium ? "secondary" : "default"}
          onClick={() => navigate({ to: "/subscribe" })}
        >
          {premium ? "Extend premium" : "Go premium — R50/month"}
        </Button>
      </section>

      <section className="space-y-4 rounded-2xl border border-border bg-card p-6">
        <h2 className="font-display text-xl">Preferences</h2>
        <div className="grid gap-2">
          <Label>Default poem language</Label>
          <Select
            value={language}
            onValueChange={(next) => {
              setLanguage(next);
              saveLanguage.mutate(next);
            }}
          >
            <SelectTrigger className="min-h-11">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {LANGUAGES.map((l) => (
                <SelectItem key={l.name} value={l.name}>
                  {l.native}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center justify-between rounded-xl border border-border p-4">
          <div>
            <p className="text-sm text-foreground">Email me my poems</p>
            <p className="text-xs text-muted-foreground">
              Send new poems to {profile?.email ?? "your Google address"}.
            </p>
          </div>
          <Switch checked={emailOptIn} onCheckedChange={setEmailOptIn} />
        </div>
      </section>

      <section className="rounded-2xl border border-destructive/40 bg-card p-6">
        <h2 className="font-display text-xl text-destructive">Danger zone</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Deleting your account removes your profile, poems and voucher history permanently.
        </p>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive" className="mt-4 min-h-11">
              Delete account
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete your VerseForge account?</AlertDialogTitle>
              <AlertDialogDescription>
                This permanently removes every poem you've forged. This cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={() => deleteAccount.mutate()}>
                Delete everything
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </section>
    </div>
  );
}
