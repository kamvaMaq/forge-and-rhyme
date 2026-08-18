import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const generateSchema = z.object({
  theme: z.string().trim().min(2).max(200),
  language: z.string().trim().min(2).max(40),
  form: z.string().trim().min(3).max(40),
  mood: z.string().trim().min(3).max(40),
});

const voucherSchema = z.object({
  voucher_type: z.enum(["ott", "1foryou", "kazang"]),
  voucher_code: z.string().trim().min(4).max(40),
});

export const generatePoem = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => generateSchema.parse(data))
  .handler(async ({ data, context }) => {
    const { callPoetryEngine, saToday } = await import("./verseforge.server");
    const { supabase, userId } = context;

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select(
        "subscription_status, subscription_expires_at, poems_generated_today, last_poem_date",
      )
      .eq("id", userId)
      .maybeSingle();
    if (profileError) throw new Error(profileError.message);

    const today = saToday();
    const isPremium =
      profile?.subscription_status === "premium" &&
      !!profile?.subscription_expires_at &&
      new Date(profile.subscription_expires_at).getTime() > Date.now();

    const usedToday = profile?.last_poem_date === today ? (profile?.poems_generated_today ?? 0) : 0;

    if (!isPremium && usedToday >= 1) {
      return { limitReached: true as const, poem: null };
    }

    const generated = await callPoetryEngine(data);
    const poemText = generated.poem_lines.join("\n");

    const { data: inserted, error: insertError } = await supabase
      .from("poems")
      .insert({
        user_id: userId,
        title: generated.title,
        language: generated.language,
        form: generated.form,
        mood: generated.mood,
        theme: generated.theme,
        poem_text: poemText,
        signature_image: generated.signature_image,
        social_caption: generated.social_caption,
        illustration_prompt: generated.illustration_prompt,
      })
      .select("*")
      .single();
    if (insertError) throw new Error(insertError.message);

    await supabase
      .from("profiles")
      .update({ poems_generated_today: usedToday + 1, last_poem_date: today })
      .eq("id", userId);

    return { limitReached: false as const, poem: inserted };
  });

export const redeemVoucher = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => voucherSchema.parse(data))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

    const { error: logError } = await supabase.from("voucher_redemptions").insert({
      user_id: userId,
      voucher_type: data.voucher_type,
      voucher_code: data.voucher_code,
      status: "success",
      activated_at: new Date().toISOString(),
      expires_at: expiresAt,
    });
    if (logError) throw new Error(logError.message);

    const { error: updateError } = await supabase
      .from("profiles")
      .update({ subscription_status: "premium", subscription_expires_at: expiresAt })
      .eq("id", userId);
    if (updateError) throw new Error(updateError.message);

    return { success: true as const, expires_at: expiresAt };
  });

export const emailPoem = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => z.object({ poem_id: z.string().uuid() }).parse(data))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;

    const { data: poem, error } = await supabase
      .from("poems")
      .select("*")
      .eq("id", data.poem_id)
      .eq("user_id", userId)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!poem) throw new Error("Poem not found.");

    const { data: profile } = await supabase
      .from("profiles")
      .select("email")
      .eq("id", userId)
      .maybeSingle();
    const address = profile?.email ?? null;

    // Managed email delivery activates once a sender domain is verified for the
    // project. Until then we report back instead of failing silently.
    return { sent: false as const, reason: "email_not_configured" as const, email: address };
  });

