# VerseForge AI

VerseForge — Full Lovable App Prompt

Complete specification for an AI-powered multilingual poetry platform

MASTER PROMPT FOR LOVABLE

Paste everything below this line into Lovable's prompt field:

Build a full-stack web app called **VerseForge** — a premium AI poetry generation 
platform. Users request poems in any of South Africa's 11 official languages, 
hear them read aloud, and receive them by email. The app uses Google login, 
daily usage limits, and voucher-based monthly subscriptions.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SECTION A: VISUAL DESIGN & BRAND
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Brand identity:
- Name: VerseForge
- Tagline: "Words forged in every tongue"
- Palette:
    • Background: #0D0D1A (deep ink navy)
    • Surface cards: #1A1A2E (midnight blue)
    • Accent gold: #C9A84C (warm forge gold)
    • Accent teal: #2DD4BF (electric teal for CTAs)
    • Text primary: #F0EDE6 (warm off-white)
    • Text muted: #7B7D8C (cool grey)
- Typography:
    • Display: "Playfair Display" (poetic, editorial)
    • Body: "Inter" (clean and readable)
    • Poem rendering: "EB Garamond" (classical, literary)
- Signature element: An animated forge/flame motif that ignites 
  when a poem is being generated — ember particles float upward 
  from the generate button while the AI composes.

Layout:
- Full-screen hero with animated ink-drop background on landing page
- Clean centered card layout for the poem generator
- Sidebar navigation on desktop; bottom tab bar on mobile
- Dark mode only (the forge aesthetic demands it)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SECTION B: AUTHENTICATION — GOOGLE LOGIN
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Implement Google OAuth login using Supabase Auth:
- "Sign in with Google" button on landing page and generator page
- On first login, create a user profile in Supabase with:
    • user_id (from Google)
    • display_name
    • email
    • avatar_url
    • created_at
    • subscription_status: "free" | "premium"
    • subscription_expires_at: timestamp or null
    • poems_generated_today: integer (reset daily via cron)
    • last_poem_date: date
- Each user gets a unique personal workspace (their poem history, 
  saved poems, preferences) that persists across sessions
- Show user avatar and name in top-right nav when logged in
- "My Workspace" page shows all previously generated poems in a 
  scrollable gallery, filterable by language and mood

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SECTION C: POEM GENERATOR — AI ENGINE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

The AI poetry engine is called via the Anthropic Claude API 
(claude-sonnet-4-6). Use this EXACT system prompt for all 
poem generation API calls:

SYSTEM PROMPT (send as system role):
"""
You are VerseForge, an expert multilingual poetry engine. 
Generate original, high-quality poems based on user inputs.

RULES:
1. FORM COMPLIANCE (non-negotiable):
   - Sonnet: exactly 14 lines, ABAB CDCD EFEF GG rhyme, 10 syllables/line
   - Haiku: exactly 3 lines, 5-7-5 syllables, includes nature image
   - Limerick: exactly 5 lines, AABBA rhyme, humorous/absurd
   - Free Verse: no forced rhyme, deliberate line breaks, minimum 20 lines
   - Villanelle: 19 lines (5 tercets + 1 quatrain), two repeating refrains
   - Ode: 5–7 stanzas of 8 lines each, elevated celebratory tone
   - Elegy: 4–6 stanzas of 6 lines, mournful and reflective

2. LENGTH: All poems must be LONGER than standard — minimum 20 lines 
   for all forms except Haiku. For Sonnets, write a double sonnet (28 lines).
   For Free Verse, minimum 30 lines. Rich, immersive, fully developed.

3. LANGUAGE: Write the poem ENTIRELY in the requested language.
   Available: English, Zulu (isiZulu), Xhosa (isiXhosa), Afrikaans, 
   Sotho (Sesotho), Tswana (Setswana), Pedi (Sepedi), Tsonga (Xitsonga), 
   Venda (Tshivenda), Swati (siSwati), Ndebele (isiNdebele).
   Honour each language's natural rhythm, idiom, and oral tradition.
   For tonal languages, attend to the music of the words carefully.

4. SHOW DON'T TELL: Convert emotions into concrete sensory imagery.
   Never state emotions directly.

5. BANNED WORDS: Never use — soul, heart of hearts, tears like rain, 
   endless void, whispering wind, shadows dance, broken wings, deep inside.

6. SURPRISE RULE: Every poem must contain at least one unexpected 
   metaphor or image the reader will not predict.

7. MOOD CONSISTENCY: Maintain chosen mood across every stanza.

OUTPUT FORMAT (return valid JSON only, no markdown, no extra text):
{
  "title": "Poem title",
  "language": "Language name",
  "form": "Form name",
  "mood": "Mood name",
  "theme": "Theme",
  "poem_lines": ["line 1", "line 2", ...],
  "signature_image": "One sentence describing the most striking image",
  "social_caption": "Instagram caption under 150 chars with 3 hashtags",
  "illustration_prompt": "One paragraph image generation prompt"
}
"""

USER INPUTS to collect via form before generating:
1. THEME (text input) — required
2. LANGUAGE — dropdown of all 11 SA languages
3. FORM — dropdown: Sonnet | Haiku | Limerick | Free Verse | Villanelle | Ode | Elegy
4. MOOD — dropdown: Melancholic | Hopeful | Ironic | Romantic | Surreal | Dark | Triumphant

Display the poem beautifully rendered using EB Garamond font, 
centered on a dark card, with generous line-height (1.9), 
letter-spacing, and a decorative horizontal rule between stanzas.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SECTION D: TEXT-TO-SPEECH (POEM RECITATION)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

After a poem is generated, display an audio player below the poem:
- Use the Web Speech API (SpeechSynthesis) for recitation, which 
  is built into all modern browsers — no additional API key needed
- Set the language attribute of SpeechSynthesisUtterance to match 
  the poem's language:
    • English → en-ZA
    • Afrikaans → af-ZA
    • Zulu → zu-ZA
    • Xhosa → xh-ZA
    • Sotho → st-ZA
    • Tswana → tn-ZA
    • All others → en-ZA as fallback (note to user that full TTS 
      support varies by device)
- Audio controls: Play | Pause | Restart | Speed (0.8x / 1x / 1.2x)
- Show a subtle animated waveform visualiser while poem is being read
- Voice selection: show a dropdown of available voices on the user's 
  device filtered to relevant languages where possible
- Label the player: "🎙️ Hear your poem" with a glowing teal border

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SECTION E: EMAIL DELIVERY
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

After poem generation, show a "Send to my email" button.
Use Resend (resend.com) to send a beautifully formatted HTML email:

Email content:
- Subject: "Your VerseForge poem: [Title] 🔥"
- Header: VerseForge logo + tagline in gold on dark background
- Poem rendered in elegant typography (EB Garamond equivalent via 
  Google Fonts embed in email HTML)
- Signature image quote in italics below the poem
- Footer: "Generated by VerseForge · South Africa's poetry engine"
- Include: theme, language, form, and mood as metadata tags below poem
- Send to the email address from the user's Google account automatically
  (no need to ask — it's already stored in their profile)
- Show a toast notification: "📬 Poem sent to [email]!"

Store each sent poem in Supabase table `poems`:
  - id, user_id, title, language, form, mood, theme
  - poem_text (full poem as single string)
  - signature_image, social_caption
  - created_at, emailed_at

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SECTION F: USAGE LIMITS & SUBSCRIPTION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

FREE TIER:
- 1 poem per day per user (tracked by user_id + last_poem_date)
- If daily limit reached, show a friendly modal:
  "You've forged your poem for today 🔥
   Come back tomorrow — or unlock unlimited poems for R50/month."
- Reset happens at midnight South African time (UTC+2)

PREMIUM TIER — R50/month via voucher:
- No daily limit (unlimited poems)
- Priority generation queue
- Extended poem history (unlimited saved poems vs 10 for free)
- "Premium" gold badge on profile

VOUCHER REDEMPTION SYSTEM:
Build a voucher redemption page at /subscribe:

Supported voucher types:
  • OTT Vouchers
  • 1Foryou Vouchers  
  • Kazang Vouchers

UI flow:
1. User selects voucher type from styled radio buttons with logos
2. User enters voucher PIN/code in a styled input
3. "Redeem Voucher" button triggers validation

Backend voucher handling:
- Create a Supabase Edge Function `redeem-voucher` that:
  1. Accepts: { user_id, voucher_type, voucher_code }
  2. Logs the redemption attempt in table `voucher_redemptions`:
     { id, user_id, voucher_type, voucher_code, status, redeemed_at }
  3. For demo/MVP: treat any non-empty voucher code as valid and 
     activate premium for 30 days (real integration with OTT/1Foryou/
     Kazang APIs would be done in production via their merchant portals)
  4. Updates user's subscription_status to "premium" and 
     subscription_expires_at to now + 30 days
  5. Returns success/failure JSON

On success: show animated gold "🎉 Premium Unlocked!" banner 
and redirect to generator with premium status reflected in nav.

Important note in UI: 
"Pay safely with vouchers — your bank details are never involved."
Show trust badges: 🔒 Secure · 🇿🇦 South African · No bank details needed

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SECTION G: PAGES & NAVIGATION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Pages to build:

/ (Landing Page)
- Hero: "Words forged in every tongue" 
- Animated forge ember effect in background
- Language flags/names of all 11 SA languages floating in ambient animation
- "Start Creating" CTA → goes to /generate (prompts login if not authed)
- Brief feature highlights: 11 Languages | AI-Powered | Voice Recitation | Email Delivery
- Voucher payment trust section with OTT, 1Foryou, Kazang logos

/generate (Poem Generator — main app screen)
- Input form (theme, language, form, mood)
- Generate button with forge animation while loading
- Rendered poem card
- Audio player
- Action bar: Save | Email | Share | Regenerate

/workspace (My Poems)
- Grid of poem cards (title, language, date, mood chip)
- Filter by: language, mood, form, date
- Click poem → opens full view with audio player
- Premium badge if subscribed; upgrade prompt if free

/subscribe (Voucher Redemption)
- Voucher type selector
- Voucher code input
- Redemption flow
- Trust messaging

/profile (User Settings)
- Avatar + name from Google
- Subscription status + expiry
- Preferred language default
- Email notification preferences
- Delete account option

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SECTION H: DATABASE SCHEMA (SUPABASE)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Table: profiles
- id uuid (FK to auth.users)
- display_name text
- email text
- avatar_url text
- subscription_status text default 'free'
- subscription_expires_at timestamptz
- poems_generated_today integer default 0
- last_poem_date date
- preferred_language text default 'English'
- created_at timestamptz

Table: poems
- id uuid primary key
- user_id uuid (FK profiles)
- title text
- language text
- form text
- mood text
- theme text
- poem_text text
- signature_image text
- social_caption text
- illustration_prompt text
- emailed_at timestamptz
- created_at timestamptz

Table: voucher_redemptions
- id uuid primary key
- user_id uuid (FK profiles)
- voucher_type text (ott | 1foryou | kazang)
- voucher_code text
- status text (pending | success | failed)
- activated_at timestamptz
- expires_at timestamptz
- created_at timestamptz

RLS Policies:
- Users can only read/write their own profile row
- Users can only read/write their own poems
- Voucher redemptions are user-scoped
- Edge Functions bypass RLS using service role key

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SECTION I: TECH STACK
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

- Framework: React + Vite (Lovable default)
- Auth: Supabase Auth with Google OAuth provider
- Database: Supabase Postgres
- AI: Anthropic Claude API (claude-sonnet-4-6)
- Email: Resend API
- TTS: Web Speech API (browser-native, no cost)
- Styling: Tailwind CSS with custom dark theme tokens
- Animations: Framer Motion for ember/forge effects
- Deployment: Lovable built-in hosting

Environment variables needed:
- VITE_SUPABASE_URL
- VITE_SUPABASE_ANON_KEY
- ANTHROPIC_API_KEY (server-side only, in Edge Function)
- RESEND_API_KEY (server-side only, in Edge Function)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SECTION J: MOBILE RESPONSIVENESS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

- Full mobile-first responsive design
- Bottom navigation bar on mobile (Generate | Workspace | Subscribe | Profile)
- Poem cards stack vertically on small screens
- Audio player is sticky at bottom when poem is active on mobile
- Touch-friendly tap targets (minimum 44px)
- Form inputs use native mobile keyboards appropriately
  (text for theme, select for dropdowns)


PROMPT LIBRARY REFERENCE TABLE

# Component Purpose Where in Prompt 1 Role assignment Sets VerseForge persona for Claude API calls Section C system prompt 2 Input validation Ensures all 4 fields collected before generation Section C user inputs 3 Form rules engine Enforces structural correctness per form type Section C Rule 1 4 Language rules Ensures authentic multilingual output Section C Rule 3 5 Length override Forces longer, richer poems than default Section C Rule 2 6 Cliché ban list Prevents generic AI verse Section C Rule 5 7 Surprise rule Elevates quality with unexpected imagery Section C Rule 6 8 JSON output format Enables structured data for UI rendering + email Section C OUTPUT FORMAT 9 Auth system Google login + persistent workspace per user Section B 10 Usage limits Daily cap + premium tier logic Section F 11 Voucher system Trust-first payment via OTT/1Foryou/Kazang Section F 12 TTS engine Browser-native voice recitation Section D 13 Email delivery Poem sent to user's Google email via Resend Section E 14 Database schema Persistent poem history and user profiles Section H

ITERATION LOG

Version Change Made Problem It Fixed v1 Basic "write a poem" prompt Generic, short, clichéd output v2 Added form rules + line counts Poems ignored structure v3 Added cliché ban + surprise rule Output was correct but boring v4 Added self-check + variant modes Inconsistent formatting v5 Added 11 SA languages + length override Poems were English-only and too short v6 Added JSON output format Could not feed poem into UI/email/TTS reliably v7 Added Google Auth + Supabase workspace No persistence between sessions v8 Added daily limit + voucher payment No monetisation or trust-safe payment v9 Added Web Speech API TTS No voice recitation v10 Added Resend email delivery Poems couldn't be saved outside the browser

SERVICES TO CONFIGURE AFTER LOVABLE BUILD

Service What to do Supabase Create project, enable Google OAuth, run schema SQL Google Cloud Console Create OAuth credentials, add Supabase callback URL Anthropic Get API key, add to Supabase Edge Function secrets Resend Create account, verify sending domain, get API key OTT / 1Foryou / Kazang Apply for merchant accounts to enable live voucher validation

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://forge-and-rhyme.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/bbc829db-e4d2-41c0-aefd-815d0d5bf160).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
