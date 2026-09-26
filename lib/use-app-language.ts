'use client';
import {useEffect,useState} from 'react';
import type {Language} from './i18n';
import {isLanguage,LANGUAGE_KEY,resolveLanguage,type LanguagePreference} from './language';
export function useAppLanguage(){
 const [lang,setLang]=useState<Language>('pt'),[preference,setPreference]=useState<LanguagePreference>('auto');
 useEffect(()=>{function sync(){let saved:string|null=null;try{saved=localStorage.getItem(LANGUAGE_KEY)}catch{}setPreference(isLanguage(saved)?saved:'auto');setLang(resolveLanguage(saved,navigator.languages?.length?navigator.languages:[navigator.language]))}sync();window.addEventListener('languagechange',sync);window.addEventListener('storage',sync);window.addEventListener('zeitkonto-language',sync);return()=>{window.removeEventListener('languagechange',sync);window.removeEventListener('storage',sync);window.removeEventListener('zeitkonto-language',sync)}},[]);
 function changeLanguage(value:string){if(value!=='auto'&&!isLanguage(value))return;setPreference(value);setLang(resolveLanguage(value,navigator.languages?.length?navigator.languages:[navigator.language]));try{localStorage.setItem(LANGUAGE_KEY,value);window.dispatchEvent(new Event('zeitkonto-language'))}catch{}}
 return {lang,preference,changeLanguage};
}
