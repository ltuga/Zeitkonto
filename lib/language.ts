import type {Language} from './i18n';
export type LanguagePreference=Language|'auto';
export const LANGUAGE_KEY='meu-tempo-language';
export function isLanguage(value:unknown):value is Language{return typeof value==='string'&&['pt','de','en','tr'].includes(value)}
export function resolveLanguage(saved:string|null,languages:readonly string[]):Language{
 if(isLanguage(saved))return saved;
 for(const locale of languages){const base=locale.toLowerCase().split(/[-_]/)[0];if(isLanguage(base))return base}
 return 'en';
}
