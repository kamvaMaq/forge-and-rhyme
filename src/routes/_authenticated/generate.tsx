import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Flame, Mail, RefreshCw, Share2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Embers } from "@/components/Embers";
import { PoemView } from "@/components/PoemView";
import { PoemAudioPlayer } from "@/components/PoemAudioPlayer";
import { FORMS, LANGUAGES, MOODS, type PoemRecord } from "@/lib/verseforge";
import { emailPoem, generatePoem } from "@/lib/poems.functions";
import { isPremium, useProfile } from "@/hooks/useAuth";

export const Route = createFileRoute("/_authenticated/generate")({
  head: () => ({
    meta: [
      { title: "Forge a poem — VerseForge poetry generator" },
      {
        name: "description",
        content:
          "Choose a theme, language, form and mood, then forge an original poem in any of South Africa's 11 official languages.",
      },
      { property: "og:title", content: "Forge a poem — VerseForge" },
      {
        property: "og:description",
        content: "AI poetry in 11 South African languages, with voice recitation.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: GeneratePage,
});

function GeneratePage() {
  const { data: profile } = useProfile();
  const queryClient = useQueryClient();
  const generate = useServerFn(generatePoem);
  const sendEmail = useServerFn(emailPoem);

  const [theme, setTheme] = useState("");
  const [language, setLanguage] = useState(profile?.preferred_language ?? "English");
  const [form, setForm] = useState<string>("Free Verse");
  const [mood, setMood] = useState<string>("Hopeful");
  const [poem, setPoem] = useState<PoemRecord | null>(null);
  const [limitOpen, setLimitOpen] = useState(false);

  const mutation = useMutation({
    mutationFn: async () => generate({ data: { theme, language, form, mood } }),
    onSuccess: (result) => {
      if (result.limitReached) {
        setLimitOpen(true);
        return;
      }
      setPoem(result.poem as PoemRecord);
      queryClient.invalidateQueries({ queryKey: ["poems"] });
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      toast.success("Your poem is forged 🔥");
    },
    onError: (error: Error) => toast.error(error.message || "Something went wrong."),
  });

  const emailMutation = useMutation({
    mutationFn: async (poemId: string) => sendEmail({ data: { poem_id: poemId } }),
    onSuccess: (result) => {
      if (result.sent) {
        toast.success(`📬 Poem sent to ${result.email}!`);
        queryClient.invalidateQueries({ queryKey: ["poems"] });
      } else {
        toast.info("Email delivery isn't switched on yet — connect a sender domain to enable it.");
      }
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const share = async () => {
    if (!poem) return;
    const text = `${poem.title}\n\n${poem.poem_text}\n\n${poem.social_caption ?? ""}`;
    if (navigator.share) {
      await navigator.share({ title: poem.title, text }).catch(() => undefined);
      return;
    }
    await navigator.clipboard.writeText(text);
    toast.success("Poem copied to your clipboard.");
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (theme.trim().length < 2) {
      toast.error("Give your poem a theme first.");
      return;
    }
    mutation.mutate();
  };

  return (
    <div className="mx-auto w-full max-w-3xl space-y-8">
      <header>
        <h1 className="font-display text-3xl text-foreground sm:text-4xl">Forge a poem</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {isPremium(profile)
            ? "Premium: unlimited poems, priority forging."
            : "Free tier: one poem per day, resetting at midnight (SAST)."}
        </p>
      </header>

      <form
        onSubmit={submit}
        className="relative overflow-hidden rounded-2xl border border-border bg-card p-6"
      >
        <div className="grid gap-5">
          <div className="grid gap-2">
            <Label htmlFor="theme">Theme</Label>
            <Input
              id="theme"
              value={theme}
              maxLength={200}
              onChange={(e) => setTheme(e.target.value)}
              placeholder="A grandmother's hands, drought in the Karoo, first love…"
              className="min-h-11"
            />
          </div>

          <div className="grid gap-5 sm:grid-cols-3">
            <div className="grid gap-2">
              <Label>Language</Label>
              <Select value={language} onValueChange={setLanguage}>
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

            <div className="grid gap-2">
              <Label>Form</Label>
              <Select value={form} onValueChange={setForm}>
                <SelectTrigger className="min-h-11">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {FORMS.map((f) => (
                    <SelectItem key={f} value={f}>
                      {f}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label>Mood</Label>
              <Select value={mood} onValueChange={setMood}>
                <SelectTrigger className="min-h-11">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {MOODS.map((m) => (
                    <SelectItem key={m} value={m}>
                      {m}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button
            type="submit"
            size="lg"
            disabled={mutation.isPending}
            className={`min-h-12 ${mutation.isPending ? "animate-forge-pulse" : ""}`}
          >
            <Flame className="mr-2 size-4" />
            {mutation.isPending ? "Forging your poem…" : "Generate poem"}
          </Button>
        </div>
        <Embers active={mutation.isPending} />
      </form>

      {poem && (
        <div className="space-y-6">
          <PoemView poem={poem} />
          <PoemAudioPlayer text={poem.poem_text} language={poem.language} />
          <div className="flex flex-wrap gap-2">
            <Button
              variant="secondary"
              className="min-h-11"
              onClick={() => emailMutation.mutate(poem.id)}
              disabled={emailMutation.isPending}
            >
              <Mail className="mr-2 size-4" /> Send to my email
            </Button>
            <Button variant="secondary" className="min-h-11" onClick={share}>
              <Share2 className="mr-2 size-4" /> Share
            </Button>
            <Button
              variant="outline"
              className="min-h-11"
              onClick={() => mutation.mutate()}
              disabled={mutation.isPending}
            >
              <RefreshCw className="mr-2 size-4" /> Regenerate
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            Saved automatically to your workspace.
          </p>
        </div>
      )}

      <Dialog open={limitOpen} onOpenChange={setLimitOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-display text-2xl">
              You've forged your poem for today 🔥
            </DialogTitle>
            <DialogDescription>
              Come back tomorrow — or unlock unlimited poems for R50/month.
            </DialogDescription>
          </DialogHeader>
          <Button asChild size="lg" className="min-h-12">
            <Link to="/subscribe">Unlock unlimited poems</Link>
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  );
}
