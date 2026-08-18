import { useEffect, useRef, useState } from "react";
import { Pause, Play, RotateCcw } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { hasNativeVoiceSupport, localeForLanguage } from "@/lib/verseforge";

const SPEEDS = [0.8, 1, 1.2];

export function PoemAudioPlayer({ text, language }: { text: string; language: string }) {
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [voiceUri, setVoiceUri] = useState<string>("default");
  const [speed, setSpeed] = useState(1);
  const [speaking, setSpeaking] = useState(false);
  const [paused, setPaused] = useState(false);
  const [supported, setSupported] = useState(true);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const locale = localeForLanguage(language);

  useEffect(() => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      setSupported(false);
      return;
    }
    const load = () => setVoices(window.speechSynthesis.getVoices());
    load();
    window.speechSynthesis.addEventListener("voiceschanged", load);
    return () => {
      window.speechSynthesis.removeEventListener("voiceschanged", load);
      window.speechSynthesis.cancel();
    };
  }, []);

  const prefix = locale.split("-")[0];
  const relevant = voices.filter((v) => v.lang.toLowerCase().startsWith(prefix!.toLowerCase()));
  const options = relevant.length > 0 ? relevant : voices;

  const speak = () => {
    if (!supported) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = locale;
    utterance.rate = speed;
    const voice = options.find((v) => v.voiceURI === voiceUri);
    if (voice) utterance.voice = voice;
    utterance.onend = () => {
      setSpeaking(false);
      setPaused(false);
    };
    utterance.onerror = () => {
      setSpeaking(false);
      setPaused(false);
    };
    utteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
    setSpeaking(true);
    setPaused(false);
  };

  const toggle = () => {
    if (!speaking) {
      speak();
      return;
    }
    if (paused) {
      window.speechSynthesis.resume();
      setPaused(false);
    } else {
      window.speechSynthesis.pause();
      setPaused(true);
    }
  };

  return (
    <section className="glow-teal rounded-2xl border border-teal/40 bg-card p-5">
      <h3 className="font-display text-lg text-teal">🎙️ Hear your poem</h3>

      {!supported ? (
        <p className="mt-2 text-sm text-muted-foreground">
          Your browser does not support voice recitation.
        </p>
      ) : (
        <>
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <Button onClick={toggle} size="lg" className="min-h-11">
              {speaking && !paused ? <Pause className="mr-2 size-4" /> : <Play className="mr-2 size-4" />}
              {speaking && !paused ? "Pause" : paused ? "Resume" : "Play"}
            </Button>
            <Button variant="secondary" size="lg" className="min-h-11" onClick={speak}>
              <RotateCcw className="mr-2 size-4" /> Restart
            </Button>
            <div className="flex gap-1 rounded-lg border border-border p-1">
              {SPEEDS.map((s) => (
                <Button
                  key={s}
                  size="sm"
                  variant={speed === s ? "default" : "ghost"}
                  className="min-h-9"
                  onClick={() => setSpeed(s)}
                >
                  {s}x
                </Button>
              ))}
            </div>
          </div>

          {options.length > 0 && (
            <div className="mt-4">
              <Select value={voiceUri} onValueChange={setVoiceUri}>
                <SelectTrigger className="min-h-11">
                  <SelectValue placeholder="Device voice" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="default">Device default voice</SelectItem>
                  {options.map((v) => (
                    <SelectItem key={v.voiceURI} value={v.voiceURI}>
                      {v.name} ({v.lang})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="mt-4 flex h-10 items-end gap-1" aria-hidden>
            {Array.from({ length: 28 }).map((_, i) => (
              <span
                key={i}
                className={`w-full origin-bottom rounded-sm bg-teal/70 ${
                  speaking && !paused ? "animate-wave" : "opacity-30"
                }`}
                style={{
                  height: `${20 + ((i * 13) % 80)}%`,
                  animationDelay: `${(i % 9) * 0.08}s`,
                }}
              />
            ))}
          </div>

          {!hasNativeVoiceSupport(language) && (
            <p className="mt-3 text-xs text-muted-foreground">
              Full voice support for {language} varies by device — English (South Africa) is used as
              a fallback.
            </p>
          )}
        </>
      )}
    </section>
  );
}
