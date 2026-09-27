// Run with ZEITKONTO_TEST_DOM_MODULE pointing to happy-dom's lib/index.js.
// This optional DOM regression harness does not add a production dependency.
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {mkdir,rm} from 'node:fs/promises';
import {pathToFileURL} from 'node:url';
const {Window}=await import(pathToFileURL(process.env.ZEITKONTO_TEST_DOM_MODULE));
const window=new Window();
for(const name of ['window','document','navigator','HTMLElement','HTMLButtonElement','Node','Event','MouseEvent','KeyboardEvent'])
 Object.defineProperty(globalThis,name,{value:name==='window'?window:window[name],configurable:true});
globalThis.IS_REACT_ACT_ENVIRONMENT=true;
const require=createRequire(import.meta.url);
const {build}=createRequire(require.resolve('vite'))('esbuild');
const file=new URL('../node_modules/.cache/calendar-focus-regression.mjs',import.meta.url);
await mkdir(new URL('.',file),{recursive:true});
await build({entryPoints:[process.env.ZEITKONTO_TEST_CALENDAR_SOURCE||'components/ui/calendar.tsx'],bundle:true,platform:'node',format:'esm',packages:'external',outfile:file.pathname});
try{
 const React=await import('react'),{createRoot}=await import('react-dom/client');
 const {Calendar}=await import(file);
 const host=document.createElement('div');document.body.append(host);const root=createRoot(host);
 let focusCalls=[];const focus=window.HTMLElement.prototype.focus;
 window.HTMLElement.prototype.focus=function(options){focusCalls.push({node:this,options});return focus.call(this,options)};
 const selected=new Date(2026,8,16);
 function App({tick}){const [day,setDay]=React.useState(selected);return React.createElement(Calendar,{mode:'single',month:new Date(2026,8,1),selected:day,onSelect:setDay,weekStartsOn:1,'data-tick':tick})}
 await React.act(async()=>root.render(React.createElement(App,{tick:0})));
 const day=host.querySelector('button[data-selected-single="true"]');assert.ok(day);
 await React.act(async()=>day.focus());focusCalls=[];
 for(let tick=1;tick<=5;tick++)await React.act(async()=>root.render(React.createElement(App,{tick})));
 assert.ok(host.querySelector('button[data-selected-single="true"]')===day,'clock ticks must retain the selected day DOM node');
 assert.equal(focusCalls.length,0,'clock ticks must not reclaim focus or scroll back');
 await React.act(async()=>day.dispatchEvent(new window.KeyboardEvent('keydown',{key:'ArrowRight',bubbles:true})));
 assert.ok(document.activeElement!==day,'arrow-key navigation must still move focus');
 assert.ok(focusCalls.some(call=>call.options?.preventScroll===true),'programmatic focus must preserve scroll position');
 await React.act(async()=>root.unmount());
 console.log('PASS: five parent updates preserve day identity and focus; keyboard navigation works without scroll');
}finally{await rm(file,{force:true});await window.happyDOM.close()}
