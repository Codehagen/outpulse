export interface Language {
  code: string;
  name: string;
  flag: string;
  native?: string;
}

export const languages: Language[] = [
  { code: "en", name: "English", flag: "🇺🇸", native: "English" },
  { code: "es", name: "Spanish", flag: "🇪🇸", native: "Español" },
  { code: "fr", name: "French", flag: "🇫🇷", native: "Français" },
  { code: "de", name: "German", flag: "🇩🇪", native: "Deutsch" },
  { code: "it", name: "Italian", flag: "🇮🇹", native: "Italiano" },
  { code: "pt", name: "Portuguese", flag: "🇵🇹", native: "Português" },
  { code: "ja", name: "Japanese", flag: "🇯🇵", native: "日本語" },
  { code: "ko", name: "Korean", flag: "🇰🇷", native: "한국어" },
  { code: "zh", name: "Chinese", flag: "🇨🇳", native: "中文" },
  { code: "ar", name: "Arabic", flag: "🇦🇪", native: "العربية" },
  { code: "ru", name: "Russian", flag: "🇷🇺", native: "Русский" },
  { code: "hi", name: "Hindi", flag: "🇮🇳", native: "हिन्दी" },
  { code: "bn", name: "Bengali", flag: "🇧🇩", native: "বাংলা" },
  { code: "nl", name: "Dutch", flag: "🇳🇱", native: "Nederlands" },
  { code: "sv", name: "Swedish", flag: "🇸🇪", native: "Svenska" },
  { code: "no", name: "Norwegian", flag: "🇳🇴", native: "Norsk" },
  { code: "da", name: "Danish", flag: "🇩🇰", native: "Dansk" },
  { code: "fi", name: "Finnish", flag: "🇫🇮", native: "Suomi" },
  { code: "pl", name: "Polish", flag: "🇵🇱", native: "Polski" },
  { code: "tr", name: "Turkish", flag: "🇹🇷", native: "Türkçe" },
];

export function getLanguageByCode(code: string): Language | undefined {
  return languages.find((lang) => lang.code === code);
}

export function getLanguageFlag(code: string): string {
  return getLanguageByCode(code)?.flag || "🌐";
}

export function getLanguageName(code: string): string {
  return getLanguageByCode(code)?.name || code;
}
