export const VERSEFORGE_SYSTEM_PROMPT = `You are VerseForge, an expert multilingual poetry engine.
Generate original, high-quality poems based on user inputs.

RULES:
1. FORM COMPLIANCE (non-negotiable):
   - Sonnet: a DOUBLE sonnet, minimum 28 lines, ABAB CDCD EFEF GG rhyme per sonnet, 10 syllables/line
   - Haiku: a HAIKU SEQUENCE, minimum 5 haiku, each exactly 3 lines of 5-7-5 syllables with a nature image
   - Limerick: a LIMERICK SUITE, minimum 3 limericks, each 5 lines, AABBA rhyme, humorous/absurd
   - Free Verse: no forced rhyme, deliberate line breaks, minimum 30 lines
   - Villanelle: 19 lines (5 tercets + 1 quatrain), two repeating refrains, each line at least 12 words
   - Ode: exactly 6 stanzas of 8 lines each, elevated celebratory tone
   - Elegy: exactly 5 stanzas of 6 lines each, mournful and reflective

2. LENGTH: All poems must be LONGER than standard - minimum 20 lines for all forms except Haiku.
   For Sonnets, write a double sonnet (28 lines). For Free Verse, minimum 30 lines.
   Rich, immersive, fully developed.
   Every poem must feel complete and immersive. Never truncate. Develop the theme fully across all stanzas before closing.

3. LANGUAGE: Write the poem ENTIRELY in the requested language.
   Available: English, Zulu (isiZulu), Xhosa (isiXhosa), Afrikaans, Sotho (Sesotho),
   Tswana (Setswana), Pedi (Sepedi), Tsonga (Xitsonga), Venda (Tshivenda), Swati (siSwati),
   Ndebele (isiNdebele).
   Honour each language's natural rhythm, idiom, and oral tradition.
   For tonal languages, attend to the music of the words carefully.

4. SHOW DON'T TELL: Convert emotions into concrete sensory imagery. Never state emotions directly.

5. BANNED WORDS: Never use - soul, heart of hearts, tears like rain, endless void,
   whispering wind, shadows dance, broken wings, deep inside.

6. SURPRISE RULE: Every poem must contain at least one unexpected metaphor or image
   the reader will not predict.

7. MOOD CONSISTENCY: Maintain chosen mood across every stanza.

OUTPUT FORMAT (return valid JSON only, no markdown, no extra text):
{
  "title": "Poem title",
  "language": "Language name",
  "form": "Form name",
  "mood": "Mood name",
  "theme": "Theme",
  "poem_lines": ["line 1", "line 2", "..."],
  "signature_image": "One sentence describing the most striking image",
  "social_caption": "Instagram caption under 150 chars with 3 hashtags",
  "illustration_prompt": "One paragraph image generation prompt"
}`;

export type GeneratedPoem = {
  title: string;
  language: string;
  form: string;
  mood: string;
  theme: string;
  poem_lines: string[];
  signature_image: string;
  social_caption: string;
  illustration_prompt: string;
};

export async function callPoetryEngine(input: {
  theme: string;
  language: string;
  form: string;
  mood: string;
}): Promise<GeneratedPoem> {
  const apiKey = process.env["LOVABLE_API_KEY"];
  if (!apiKey) throw new Error("The poetry engine is not configured yet.");

  const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "google/gemini-3.7-flash",
      messages: [
        { role: "system", content: VERSEFORGE_SYSTEM_PROMPT },
        {
          role: "user",
          content: `THEME: ${input.theme}\nLANGUAGE: ${input.language}\nFORM: ${input.form}\nMOOD: ${input.mood}\n\nReturn only the JSON object.`,
        },
      ],
      response_format: { type: "json_object" },
    }),
  });

  if (!response.ok) {
    const body = await response.text();
    if (response.status === 429) {
      throw new Error("The forge is busy right now — please try again in a minute.");
    }
    if (response.status === 402) {
      throw new Error("AI credits are exhausted. Please top up to keep forging poems.");
    }
    throw new Error(`Poetry engine error (${response.status}): ${body.slice(0, 200)}`);
  }

  const data = (await response.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };
  const content = data.choices?.[0]?.message?.content ?? "";
  const cleaned = content
    .trim()
    .replace(/^```(?:json)?/i, "")
    .replace(/```$/, "")
    .trim();

  let parsed: GeneratedPoem;
  try {
    parsed = JSON.parse(cleaned) as GeneratedPoem;
  } catch {
    throw new Error("The poem came back malformed. Please try again.");
  }

  if (!Array.isArray(parsed.poem_lines) || parsed.poem_lines.length === 0) {
    throw new Error("The poem came back empty. Please try again.");
  }

  return {
    title: parsed.title || "Untitled",
    language: parsed.language || input.language,
    form: parsed.form || input.form,
    mood: parsed.mood || input.mood,
    theme: parsed.theme || input.theme,
    poem_lines: parsed.poem_lines,
    signature_image: parsed.signature_image ?? "",
    social_caption: parsed.social_caption ?? "",
    illustration_prompt: parsed.illustration_prompt ?? "",
  };
}

/** Today's date in South African time (UTC+2) as YYYY-MM-DD. */
export function saToday(): string {
  return new Date().toLocaleDateString("en-CA", { timeZone: "Africa/Johannesburg" });
}

const SENDER_EMAIL = "kmaqinana08@gmail.com";

export type PoemEmailInput = {
  to: string;
  poetTitle: string;
  poetLines: string[];
  language: string;
  form: string;
  mood: string;
  theme: string;
  signatureImage: string;
};

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/** Renders the VerseForge poem email and delivers it through SendGrid. */
export async function sendPoemEmail(input: PoemEmailInput): Promise<void> {
  const apiKey = process.env["SENDGRID_API_KEY"];
  if (!apiKey) throw new Error("Email is not configured yet.");

  const poemHTML = input.poetLines
    .map((line) => `<p style="margin:0;line-height:1.9;">${escapeHtml(line)}</p>`)
    .join("");

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <link href="https://fonts.googleapis.com/css2?family=EB+Garamond&display=swap" rel="stylesheet"/>
    </head>
    <body style="background:#0D0D1A;margin:0;padding:40px 20px;font-family:'EB Garamond',Georgia,serif;">
      <div style="max-width:600px;margin:0 auto;">
        <div style="text-align:center;padding-bottom:32px;border-bottom:1px solid #C9A84C33;">
          <h1 style="color:#C9A84C;font-size:28px;letter-spacing:4px;margin:0;">VERSEFORGE</h1>
          <p style="color:#7B7D8C;font-size:13px;letter-spacing:2px;margin:8px 0 0;">
            WORDS FORGED IN EVERY TONGUE
          </p>
        </div>
        <div style="padding:40px 0;">
          <h2 style="color:#F0EDE6;font-size:24px;text-align:center;margin:0 0 32px;">
            ${escapeHtml(input.poetTitle)}
          </h2>
          <div style="color:#F0EDE6;font-size:18px;text-align:center;line-height:1.9;">
            ${poemHTML}
          </div>
          <p style="color:#C9A84C;font-style:italic;text-align:center;margin:32px 0 0;font-size:15px;">
            "${escapeHtml(input.signatureImage)}"
          </p>
        </div>
        <div style="border-top:1px solid #C9A84C33;padding-top:24px;text-align:center;">
          <p style="color:#7B7D8C;font-size:12px;letter-spacing:1px;margin:0 0 8px;">
            ${escapeHtml(input.language)} &middot; ${escapeHtml(input.form)} &middot; ${escapeHtml(input.mood)} &middot; Theme: ${escapeHtml(input.theme)}
          </p>
          <p style="color:#7B7D8C;font-size:11px;margin:0;">
            Generated by VerseForge &middot; South Africa's Poetry Engine
          </p>
        </div>
      </div>
    </body>
    </html>
  `;

  const response = await fetch("https://api.sendgrid.com/v3/mail/send", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      personalizations: [{ to: [{ email: input.to }] }],
      from: { email: SENDER_EMAIL, name: "VerseForge" },
      subject: `Your VerseForge poem: ${input.poetTitle} \u{1F525}`,
      content: [{ type: "text/html", value: html }],
    }),
  });

  if (!response.ok) {
    const body = await response.text();
    console.error("SendGrid error", response.status, body.slice(0, 500));
    throw new Error("Email failed — please try again");
  }
}
