'use client';
import {useEffect,useRef,useState} from 'react';
import {displayDurationInput,parseDurationInput} from '@/lib/duration-input';
export function DurationInput({minutes,onChange,min=0,max,signed=false}:{minutes:number;onChange:(minutes:number)=>void;min?:number;max?:number;signed?:boolean}){
 const [text,setText]=useState(()=>displayDurationInput(minutes));
 const focused=useRef(false),input=useRef<HTMLInputElement>(null);
 useEffect(()=>{if(!focused.current){setText(displayDurationInput(minutes));input.current?.setCustomValidity('')}},[minutes]);
 const parse=(value:string)=>parseDurationInput(value,{min,max,signed});
 const validate=(element:HTMLInputElement)=>{
  const value=parse(element.value);
  element.setCustomValidity(value!==null?'':`HH:MM (${displayDurationInput(min)} – ${max===undefined?'…':displayDurationInput(max)})`);
  return value;
 };
 return <input ref={input} type="text" required inputMode="text" autoComplete="off" spellCheck={false} placeholder="8 / 08:00" aria-description="8 = 08:00; 8:30 = 08:30" value={text}
  onFocus={e=>{focused.current=true;e.currentTarget.select()}}
  onChange={e=>{setText(e.target.value);const value=validate(e.currentTarget);if(value!==null)onChange(value)}}
  onBlur={e=>{focused.current=false;const value=validate(e.currentTarget);if(value!==null){setText(displayDurationInput(value));onChange(value)}}}/>;
}
