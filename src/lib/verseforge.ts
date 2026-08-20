export const LANGUAGES = [
  { name: "English", native: "English", locale: "en-ZA" },
  { name: "Zulu", native: "isiZulu", locale: "zu-ZA" },
  { name: "Xhosa", native: "isiXhosa", locale: "xh-ZA" },
  { name: "Afrikaans", native: "Afrikaans", locale: "af-ZA" },
  { name: "Sotho", native: "Sesotho", locale: "st-ZA" },
  { name: "Tswana", native: "Setswana", locale: "tn-ZA" },
  { name: "Pedi", native: "Sepedi", locale: "en-ZA" },
  { name: "Tsonga", native: "Xitsonga", locale: "en-ZA" },
  { name: "Venda", native: "Tshivenda", locale: "en-ZA" },
  { name: "Swati", native: "siSwati", locale: "en-ZA" },
  { name: "Ndebele", native: "isiNdebele", locale: "en-ZA" },
] as const;

export const FORMS = [
  "Sonnet",
  "Haiku",
  "Limerick",
  "Free Verse",
  "Villanelle",
  "Ode",
  "Elegy",
] as const;

export const MOODS = [
  "Melancholic",
  "Hopeful",
  "Ironic",
  "Romantic",
  "Surreal",
  "Dark",
  "Triumphant",
] as const;

export function localeForLanguage(language: string): string {
  return LANGUAGES.find((l) => l.name === language)?.locale ?? "en-ZA";
}

export function hasNativeVoiceSupport(language: string): boolean {
  return ["English", "Afrikaans", "Zulu", "Xhosa", "Sotho", "Tswana"].includes(language);
}

export type PoemRecord = {
  id: string;
  title: string;
  language: string;
  form: string;
  mood: string;
  theme: string;
  poem_text: string;
  signature_image: string | null;
  social_caption: string | null;
  illustration_prompt: string | null;
  emailed_at: string | null;
  created_at: string;
};

/** Today's date in South African time (UTC+2) as YYYY-MM-DD. */
export function saToday(): string {
  return new Date().toLocaleDateString("en-CA", { timeZone: "Africa/Johannesburg" });
}
