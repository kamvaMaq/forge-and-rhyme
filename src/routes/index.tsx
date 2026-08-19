import { createFileRoute, Link } from "@tanstack/react-router";
import { Flame, Languages, Mail, Mic, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { InkBackdrop } from "@/components/Embers";
import { LANGUAGES } from "@/lib/verseforge";
import { useSession } from "@/hooks/useAuth";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "VerseForge — AI poetry in all 11 South African languages" },
      {
        name: "description",
        content:
          "Forge original poems in isiZulu, isiXhosa, Afrikaans, Sesotho and more. Hear them read aloud, save them to your workspace, and pay by voucher — no bank details.",
      },
      { property: "og:title", content: "VerseForge — Words forged in every tongue" },
      {
        property: "og:description",
        content:
          "South Africa's multilingual AI poetry engine: 11 languages, voice recitation and voucher-based premium.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Landing,
});

const FEATURES = [
  { icon: Languages, title: "11 Languages", copy: "Every official South African tongue." },
  { icon: Sparkles, title: "AI-Powered", copy: "Sonnets, odes, elegies and free verse." },
  { icon: Mic, title: "Voice Recitation", copy: "Hear your poem read aloud." },
  { icon: Mail, title: "Email Delivery", copy: "Your poem, straight to your inbox." },
];

function Landing() {
  const { session } = useSession();
  const destination = session ? "/generate" : "/auth";

  return (
    <div className="min-h-screen bg-background">
      <header className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-4 text-center">
        <InkBackdrop />

        <div aria-hidden className="pointer-events-none absolute inset-0">
          {LANGUAGES.map((l, i) => (
            <span
              key={l.name}
              className="animate-float-soft absolute font-poem text-sm text-muted-foreground/40"
              style={{
                left: `${(i * 8.5 + 5) % 88}%`,
                top: `${12 + ((i * 17) % 70)}%`,
                animationDelay: `${(i % 6) * 0.7}s`,
              }}
            >
              {l.native}
            </span>
          ))}
        </div>

        <div className="relative max-w-2xl">
          <span className="inline-flex items-center gap-2 rounded-full border border-gold/40 px-4 py-1 text-xs text-gold">
            <Flame className="size-3" /> South Africa's poetry engine
          </span>
          <h1 className="mt-6 font-display text-5xl leading-tight text-gradient-forge sm:text-7xl">
            Words forged in every tongue
          </h1>
          <p className="mt-6 text-base text-muted-foreground sm:text-lg">
            VerseForge writes original, fully-formed poems in all eleven official South African
            languages — then reads them to you and sends them to your inbox.
          </p>
          <div className="mt-10 flex flex-wrap justify-center gap-3">
            <Button asChild size="lg" className="min-h-12 px-8">
              <Link to={destination}>Start creating</Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="min-h-12 px-8">
              <Link to="/subscribe">See premium</Link>
            </Button>
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-5xl px-4 py-20">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map(({ icon: Icon, title, copy }) => (
            <div key={title} className="rounded-2xl border border-border bg-card p-6">
              <Icon className="size-5 text-teal" />
              <h2 className="mt-4 font-display text-xl text-foreground">{title}</h2>
              <p className="mt-2 text-sm text-muted-foreground">{copy}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-4 pb-24 text-center">
        <h2 className="font-display text-3xl text-foreground">Pay with a voucher, not a card</h2>
        <p className="mt-3 text-sm text-muted-foreground">
          Unlimited poems for R50/month. Pay safely with vouchers — your bank details are never
          involved.
        </p>
        <div className="mt-8 grid gap-3 sm:grid-cols-3">
          {["OTT Voucher", "1ForYou Voucher", "Kazang Voucher"].map((v) => (
            <div
              key={v}
              className="rounded-xl border border-border bg-card px-4 py-5 font-display text-lg text-gold"
            >
              {v}
            </div>
          ))}
        </div>
        <p className="mt-6 text-xs text-muted-foreground">
          🔒 Secure · 🇿🇦 South African · No bank details needed
        </p>
      </section>

      <footer className="border-t border-border px-4 py-8 text-center text-xs text-muted-foreground">
        VerseForge · Words forged in every tongue
      </footer>
    </div>
  );
}
