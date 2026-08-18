CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name text,
  email text,
  avatar_url text,
  subscription_status text NOT NULL DEFAULT 'free',
  subscription_expires_at timestamptz,
  poems_generated_today integer NOT NULL DEFAULT 0,
  last_poem_date date,
  preferred_language text NOT NULL DEFAULT 'English',
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own profile select" ON public.profiles FOR SELECT TO authenticated USING (auth.uid() = id);
CREATE POLICY "own profile insert" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);
CREATE POLICY "own profile update" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);
CREATE POLICY "own profile delete" ON public.profiles FOR DELETE TO authenticated USING (auth.uid() = id);

CREATE TABLE public.poems (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  language text NOT NULL,
  form text NOT NULL,
  mood text NOT NULL,
  theme text NOT NULL,
  poem_text text NOT NULL,
  signature_image text,
  social_caption text,
  illustration_prompt text,
  emailed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.poems TO authenticated;
GRANT ALL ON public.poems TO service_role;
ALTER TABLE public.poems ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own poems all" ON public.poems FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE INDEX poems_user_created_idx ON public.poems (user_id, created_at DESC);

CREATE TABLE public.voucher_redemptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  voucher_type text NOT NULL,
  voucher_code text NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  activated_at timestamptz,
  expires_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.voucher_redemptions TO authenticated;
GRANT ALL ON public.voucher_redemptions TO service_role;
ALTER TABLE public.voucher_redemptions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own redemptions select" ON public.voucher_redemptions FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "own redemptions insert" ON public.voucher_redemptions FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name, email, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', NEW.raw_user_meta_data ->> 'name', split_part(NEW.email, '@', 1)),
    NEW.email,
    NEW.raw_user_meta_data ->> 'avatar_url'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();