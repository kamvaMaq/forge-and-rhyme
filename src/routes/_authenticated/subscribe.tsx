import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { redeemVoucher } from "@/lib/poems.functions";
import { isPremium, useProfile } from "@/hooks/useAuth";

const VOUCHERS = [
  { id: "ott", label: "OTT Voucher", blurb: "Buy at any major retailer" },
  { id: "1foryou", label: "1ForYou Voucher", blurb: "Instant digital voucher" },
  { id: "kazang", label: "Kazang Voucher", blurb: "Available at spaza & kiosks" },
] as const;

export const Route = createFileRoute("/_authenticated/subscribe")({
  head: () => ({
    meta: [
      { title: "Go premium with a voucher — R50/month | VerseForge" },
      {
        name: "description",
        content:
          "Unlock unlimited poems on VerseForge for R50 a month using OTT, 1ForYou or Kazang vouchers. No bank details needed.",
      },
      { property: "og:title", content: "VerseForge Premium — R50/month by voucher" },
      {
        property: "og:description",
        content: "Pay safely with South African vouchers. No bank details involved.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: SubscribePage,
});

function SubscribePage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data: profile } = useProfile();
  const redeem = useServerFn(redeemVoucher);
  const [type, setType] = useState<string>("ott");
  const [code, setCode] = useState("");
  const [unlocked, setUnlocked] = useState(false);

  const mutation = useMutation({
    mutationFn: async () =>
      redeem({
        data: { voucher_type: type as "ott" | "1foryou" | "kazang", voucher_code: code.trim() },
      }),
    onSuccess: () => {
      setUnlocked(true);
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      toast.success("🎉 Premium unlocked for 30 days!");
      setTimeout(() => navigate({ to: "/generate" }), 2200);
    },
    onError: (error: Error) => toast.error(error.message || "That voucher could not be redeemed."),
  });

  const premium = isPremium(profile);

  return (
    <div className="mx-auto w-full max-w-xl space-y-8">
      <header>
        <h1 className="font-display text-3xl text-foreground sm:text-4xl">VerseForge Premium</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          R50/month · unlimited poems · priority forging · unlimited history · gold badge
        </p>
      </header>

      {unlocked && (
        <div className="glow-forge animate-forge-pulse rounded-2xl border border-gold/60 bg-card p-6 text-center">
          <p className="font-display text-2xl text-gradient-forge">🎉 Premium Unlocked!</p>
          <p className="mt-2 text-sm text-muted-foreground">Taking you back to the forge…</p>
        </div>
      )}

      {premium && !unlocked && (
        <div className="rounded-2xl border border-gold/50 bg-card p-5 text-sm text-muted-foreground">
          You're premium until{" "}
          <span className="text-gold">
            {new Date(profile!.subscription_expires_at!).toLocaleDateString("en-ZA")}
          </span>
          . Redeeming another voucher extends you by 30 days.
        </div>
      )}

      <form
        className="space-y-6 rounded-2xl border border-border bg-card p-6"
        onSubmit={(e) => {
          e.preventDefault();
          if (code.trim().length < 4) {
            toast.error("Enter your voucher PIN.");
            return;
          }
          mutation.mutate();
        }}
      >
        <div className="space-y-3">
          <Label>Voucher type</Label>
          <RadioGroup value={type} onValueChange={setType} className="grid gap-3">
            {VOUCHERS.map((v) => (
              <label
                key={v.id}
                className={`flex min-h-14 cursor-pointer items-center gap-3 rounded-xl border p-4 transition-colors ${
                  type === v.id ? "border-teal bg-secondary" : "border-border"
                }`}
              >
                <RadioGroupItem value={v.id} id={v.id} />
                <span>
                  <span className="block text-sm font-medium text-foreground">{v.label}</span>
                  <span className="block text-xs text-muted-foreground">{v.blurb}</span>
                </span>
              </label>
            ))}
          </RadioGroup>
        </div>

        <div className="grid gap-2">
          <Label htmlFor="code">Voucher PIN / code</Label>
          <Input
            id="code"
            value={code}
            maxLength={40}
            inputMode="numeric"
            onChange={(e) => setCode(e.target.value)}
            placeholder="Enter your voucher code"
            className="min-h-11 tracking-widest"
          />
        </div>

        <Button type="submit" size="lg" className="min-h-12 w-full" disabled={mutation.isPending}>
          {mutation.isPending ? "Redeeming…" : "Redeem voucher"}
        </Button>
      </form>

      <div className="rounded-2xl border border-border bg-card p-5 text-center">
        <p className="text-sm text-foreground">
          Pay safely with vouchers — your bank details are never involved.
        </p>
        <p className="mt-3 text-xs text-muted-foreground">
          🔒 Secure · 🇿🇦 South African · No bank details needed
        </p>
      </div>
    </div>
  );
}
