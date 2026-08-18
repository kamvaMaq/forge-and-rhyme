import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { PoemView } from "@/components/PoemView";
import { PoemAudioPlayer } from "@/components/PoemAudioPlayer";
import { supabase } from "@/integrations/supabase/client";
import { FORMS, LANGUAGES, MOODS, type PoemRecord } from "@/lib/verseforge";
import { isPremium, useProfile, useSession } from "@/hooks/useAuth";

export const Route = createFileRoute("/_authenticated/workspace")({
  head: () => ({
    meta: [
      { title: "My workspace — every poem you've forged | VerseForge" },
      {
        name: "description",
        content:
          "Browse, filter and replay every poem you've generated on VerseForge, by language, form and mood.",
      },
      { property: "og:title", content: "My VerseForge workspace" },
      { property: "og:description", content: "Your personal multilingual poetry gallery." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: WorkspacePage,
});

const ALL = "all";

function WorkspacePage() {
  const { user } = useSession();
  const { data: profile } = useProfile();
  const premium = isPremium(profile);
  const [language, setLanguage] = useState(ALL);
  const [mood, setMood] = useState(ALL);
  const [form, setForm] = useState(ALL);
  const [active, setActive] = useState<PoemRecord | null>(null);

  const { data: poems = [], isLoading } = useQuery({
    queryKey: ["poems", user?.id],
    enabled: !!user?.id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("poems")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as PoemRecord[];
    },
  });

  const visible = useMemo(() => {
    const filtered = poems.filter(
      (p) =>
        (language === ALL || p.language === language) &&
        (mood === ALL || p.mood === mood) &&
        (form === ALL || p.form === form),
    );
    return premium ? filtered : filtered.slice(0, 10);
  }, [poems, language, mood, form, premium]);

  return (
    <div className="mx-auto w-full max-w-5xl space-y-8">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl text-foreground sm:text-4xl">My workspace</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {poems.length} poem{poems.length === 1 ? "" : "s"} forged
          </p>
        </div>
        {premium ? (
          <Badge className="bg-gold text-gold-foreground">Premium</Badge>
        ) : (
          <Button asChild variant="secondary" className="min-h-11">
            <Link to="/subscribe">Unlock unlimited history</Link>
          </Button>
        )}
      </header>

      <div className="grid gap-3 sm:grid-cols-3">
        <Select value={language} onValueChange={setLanguage}>
          <SelectTrigger className="min-h-11">
            <SelectValue placeholder="Language" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>All languages</SelectItem>
            {LANGUAGES.map((l) => (
              <SelectItem key={l.name} value={l.name}>
                {l.native}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={mood} onValueChange={setMood}>
          <SelectTrigger className="min-h-11">
            <SelectValue placeholder="Mood" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>All moods</SelectItem>
            {MOODS.map((m) => (
              <SelectItem key={m} value={m}>
                {m}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={form} onValueChange={setForm}>
          <SelectTrigger className="min-h-11">
            <SelectValue placeholder="Form" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>All forms</SelectItem>
            {FORMS.map((f) => (
              <SelectItem key={f} value={f}>
                {f}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <p className="text-sm text-muted-foreground">Loading your poems…</p>
      ) : visible.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border p-12 text-center">
          <p className="text-muted-foreground">No poems here yet.</p>
          <Button asChild className="mt-4 min-h-11">
            <Link to="/generate">Forge your first poem</Link>
          </Button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {visible.map((poem) => (
            <button
              key={poem.id}
              onClick={() => setActive(poem)}
              className="rounded-2xl border border-border bg-card p-5 text-left transition-colors hover:border-teal/50"
            >
              <h2 className="font-display text-xl text-foreground">{poem.title}</h2>
              <p className="font-poem mt-2 line-clamp-3 text-sm text-muted-foreground">
                {poem.poem_text}
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                <Badge variant="outline" className="border-gold/40 text-gold">
                  {poem.language}
                </Badge>
                <Badge variant="outline" className="border-teal/40 text-teal">
                  {poem.mood}
                </Badge>
                <span className="text-xs text-muted-foreground">
                  {new Date(poem.created_at).toLocaleDateString("en-ZA")}
                </span>
              </div>
            </button>
          ))}
        </div>
      )}

      {!premium && poems.length > 10 && (
        <p className="text-sm text-muted-foreground">
          Free accounts show your 10 most recent poems.{" "}
          <Link to="/subscribe" className="text-teal underline">
            Go premium
          </Link>{" "}
          for your full archive.
        </p>
      )}

      <Dialog open={!!active} onOpenChange={(open) => !open && setActive(null)}>
        <DialogContent className="max-h-[85vh] max-w-2xl overflow-y-auto">
          {active && (
            <div className="space-y-6">
              <PoemView poem={active} />
              <PoemAudioPlayer text={active.poem_text} language={active.language} />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
