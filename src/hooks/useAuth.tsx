import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";

import { supabase } from "@/integrations/supabase/client";

export type Profile = {
  id: string;
  display_name: string | null;
  email: string | null;
  avatar_url: string | null;
  subscription_status: string;
  subscription_expires_at: string | null;
  poems_generated_today: number;
  last_poem_date: string | null;
  preferred_language: string;
  created_at: string;
};

export function useSession() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    supabase.auth.getSession().then(({ data }) => {
      if (!active) return;
      setSession(data.session);
      setLoading(false);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_event, next) => {
      setSession(next);
      setLoading(false);
    });
    return () => {
      active = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  return { session, user: session?.user ?? null, loading };
}

export function useProfile() {
  const { user } = useSession();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["profile", user?.id],
    enabled: !!user?.id,
    queryFn: async (): Promise<Profile | null> => {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user!.id)
        .maybeSingle();
      if (error) throw error;
      return data as Profile | null;
    },
  });

  return {
    ...query,
    refreshProfile: () => queryClient.invalidateQueries({ queryKey: ["profile", user?.id] }),
  };
}

export function isPremium(profile: Profile | null | undefined): boolean {
  if (!profile) return false;
  return (
    profile.subscription_status === "premium" &&
    !!profile.subscription_expires_at &&
    new Date(profile.subscription_expires_at).getTime() > Date.now()
  );
}
