import type { PoemRecord } from "@/lib/verseforge";
import { Badge } from "@/components/ui/badge";

export function PoemView({ poem }: { poem: PoemRecord }) {
  const stanzas = poem.poem_text
    .split(/\n\s*\n/)
    .map((s) => s.split("\n").filter((l) => l.trim().length > 0))
    .filter((s) => s.length > 0);

  return (
    <article className="rounded-2xl border border-border bg-card p-6 sm:p-10">
      <header className="text-center">
        <h2 className="font-display text-3xl text-gradient-forge sm:text-4xl">{poem.title}</h2>
        <div className="mt-4 flex flex-wrap justify-center gap-2">
          <Badge variant="outline" className="border-gold/40 text-gold">
            {poem.language}
          </Badge>
          <Badge variant="outline" className="border-teal/40 text-teal">
            {poem.form}
          </Badge>
          <Badge variant="outline" className="border-border text-muted-foreground">
            {poem.mood}
          </Badge>
        </div>
      </header>

      <div className="mt-8 space-y-8 text-center">
        {stanzas.map((stanza, si) => (
          <div key={si}>
            <div
              className="font-poem text-lg text-foreground sm:text-xl"
              style={{ lineHeight: 1.9, letterSpacing: "0.015em" }}
            >
              {stanza.map((line, li) => (
                <p key={li}>{line}</p>
              ))}
            </div>
            {si < stanzas.length - 1 && (
              <div className="mx-auto mt-8 flex items-center justify-center gap-3">
                <span className="h-px w-16 bg-border" />
                <span className="text-xs text-gold">✦</span>
                <span className="h-px w-16 bg-border" />
              </div>
            )}
          </div>
        ))}
      </div>

      {poem.signature_image && (
        <p className="font-poem mt-10 border-t border-border pt-6 text-center text-base italic text-muted-foreground">
          {poem.signature_image}
        </p>
      )}
    </article>
  );
}
