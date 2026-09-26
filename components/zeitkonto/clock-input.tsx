'use client';
import {useEffect,useId,useRef,useState} from 'react';
import type {Language} from '@/lib/i18n';
import {parseClockInput} from '@/lib/clock-input';
const hints:Record<Language,string>={pt:'6 → 06:00 · 630 ou 6:30 → 06:30',de:'6 → 06:00 · 630 oder 6:30 → 06:30',en:'6 → 06:00 · 630 or 6:30 → 06:30',tr:'6 → 06:00 · 630 veya 6:30 → 06:30'};
export function ClockInput({value,onChange,lang}:{value:string;onChange:(value:string)=>void;lang:Language}){
 const hintId=useId(),focused=useRef(false),input=useRef<HTMLInputElement>(null);
 const [text,setText]=useState(value);
 useEffect(()=>{if(!focused.current){setText(value);input.current?.setCustomValidity('')}},[value]);
 const validate=(element:HTMLInputElement)=>{const parsed=parseClockInput(element.value);element.setCustomValidity(parsed===null?'00:00 – 23:59':'');return parsed};
 return <><input ref={input} className="clock-keyboard-input" type="text" inputMode="numeric" enterKeyHint="next" autoComplete="off" autoCorrect="off" spellCheck={false} required placeholder="6:30" aria-describedby={hintId} value={text}
 onFocus={e=>{focused.current=true;e.currentTarget.select()}}
 onChange={e=>{setText(e.target.value);const parsed=validate(e.currentTarget);if(parsed!==null)onChange(parsed)}}
 onBlur={e=>{focused.current=false;const parsed=validate(e.currentTarget);if(parsed!==null){setText(parsed);onChange(parsed)}}}/><small id={hintId} className="clock-keyboard-hint">{hints[lang]}</small></>;
}
