import { zh } from './zh';
import { en } from './en';
import type { Translations } from './zh';

export type Lang = 'zh' | 'en';

const dictionaries: Record<Lang, Translations> = { zh, en };

export function getTranslations(lang: Lang): Translations {
  return dictionaries[lang] ?? dictionaries.zh;
}

export function getLangFromUrl(url: URL): Lang {
  if (url.pathname.startsWith('/en')) return 'en';
  return 'zh';
}

export { zh, en };
export type { Translations };
