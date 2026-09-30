/**
 * "Hi!" flips to a hello in the visitor's own language, read from the browser's language list
 * (navigator.languages, which follows the OS/browser language settings). Websites can't see
 * installed keyboard layouts, so this is the closest honest signal.
 * Visitors whose languages are all English (or not listed here) get Chaewon's own: 안녕!
 */
export type Hello = { text: string; lang: string; name: string };

const HELLOS: Record<string, Omit<Hello, "lang">> = {
  ko: { text: "안녕!", name: "Korean" },
  es: { text: "¡Hola!", name: "Spanish" },
  fr: { text: "Salut !", name: "French" },
  de: { text: "Hallo!", name: "German" },
  it: { text: "Ciao!", name: "Italian" },
  pt: { text: "Olá!", name: "Portuguese" },
  ja: { text: "やあ!", name: "Japanese" },
  zh: { text: "你好!", name: "Chinese" },
  hi: { text: "नमस्ते!", name: "Hindi" },
  ru: { text: "Привет!", name: "Russian" },
  uk: { text: "Привіт!", name: "Ukrainian" },
  vi: { text: "Xin chào!", name: "Vietnamese" },
  th: { text: "สวัสดี!", name: "Thai" },
  id: { text: "Halo!", name: "Indonesian" },
  ms: { text: "Hai!", name: "Malay" },
  tl: { text: "Kumusta!", name: "Filipino" },
  fil: { text: "Kumusta!", name: "Filipino" },
  tr: { text: "Merhaba!", name: "Turkish" },
  nl: { text: "Hoi!", name: "Dutch" },
  sv: { text: "Hej!", name: "Swedish" },
  da: { text: "Hej!", name: "Danish" },
  nb: { text: "Hei!", name: "Norwegian" },
  no: { text: "Hei!", name: "Norwegian" },
  fi: { text: "Hei!", name: "Finnish" },
  pl: { text: "Cześć!", name: "Polish" },
  cs: { text: "Ahoj!", name: "Czech" },
  hu: { text: "Szia!", name: "Hungarian" },
  ro: { text: "Salut!", name: "Romanian" },
  el: { text: "Γεια!", name: "Greek" },
  he: { text: "שלום!", name: "Hebrew" },
  ar: { text: "مرحبا!", name: "Arabic" },
};

export const DEFAULT_HELLO: Hello = { ...HELLOS.ko, lang: "ko" };

export function pickHello(languages: readonly string[] | undefined): Hello {
  for (const tag of languages || []) {
    const base = tag.toLowerCase().split("-")[0];
    if (base === "en") continue; // "Hi!" is already English
    const h = HELLOS[base];
    if (h) return { ...h, lang: base };
  }
  return DEFAULT_HELLO;
}
