export const LANGUAGE_MAP: Record<string, string> = {
  English: 'en-US',
  French: 'fr-FR',
  Spanish: 'es-ES',
  Swahili: 'sw-KE',
  Yoruba: 'yo-NG',
  Amharic: 'am-ET',
  Zulu: 'zu-ZA',
  Hausa: 'ha-NG',
  Igbo: 'ig-NG',
  Kinyarwanda: 'rw-RW',
  Akan: 'ak-GH',
  Twi: 'ak-GH',
  Pidgin: 'pcm-NG',
  Chinese: 'zh-CN',
  Mandarin: 'zh-CN',
  Cantonese: 'zh-HK',
  Arabic: 'ar-SA',
  Hindi: 'hi-IN',
  Bengali: 'bn-IN',
  Tamil: 'ta-IN',
  Telugu: 'te-IN',
  Urdu: 'ur-PK',
  Punjabi: 'pa-IN',
  Gujarati: 'gu-IN',
  Marathi: 'mr-IN',
  Malayalam: 'ml-IN',
  Kannada: 'kn-IN',
  German: 'de-DE',
  Dutch: 'nl-NL',
}

export function getLanguageCode(displayName: string): string {
  if (!displayName) return 'en-US'
  const code = LANGUAGE_MAP[displayName]
  return code ?? displayName
}
