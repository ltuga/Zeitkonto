import test from 'node:test';
import assert from 'node:assert/strict';
import {loadTs} from './load-ts.mjs';
const {createBackNavigation}=await loadTs('lib/back-navigation.ts');
function setup(path='/') {
 const browser=new EventTarget();
 let entries=[{state:null,url:'https://example.test/previous'},{state:null,url:'https://example.test'+path}],cursor=1,time=0,tab='today',notice=false,overlay=false,closed=0;
 browser.location=new URL(entries[cursor].url);
 browser.document=Object.assign(new EventTarget(),{hidden:false});
 browser.crypto={randomUUID:()=> 'session-1'};
 browser.performance={now:()=>time};
 browser.scrollTo=()=>{};browser.setTimeout=()=>1;browser.clearTimeout=()=>{};
 browser.history={
  replaceState(state,_,url){entries[cursor]={state,url:url?String(url):entries[cursor].url};browser.location.href=entries[cursor].url},
  pushState(state,_,url){entries.splice(++cursor);entries.push({state,url:String(url)});browser.location.href=String(url)},
  go(delta){const next=cursor+delta;if(next<0||next>=entries.length)return;cursor=next;browser.location.href=entries[cursor].url;const event=new Event('popstate');event.state=entries[cursor].state;browser.dispatchEvent(event)},
  back(){this.go(-1)},
 };
 const controller=createBackNavigation(browser,{onTab:value=>tab=value,onExitNotice:value=>notice=value,closeOverlay:()=>{if(!overlay)return false;overlay=false;closed++;return true}});
 return {browser,controller,get tab(){return tab},get notice(){return notice},get closed(){return closed},get count(){return entries.length},overlay:()=>overlay=true,tick:ms=>time+=ms};
}
test('native Back follows visited tabs, then reports root for native double exit',()=>{
 const s=setup();s.controller.navigate('calendar');s.controller.navigate('balances');
 assert.equal(s.controller.back(),'handled');assert.equal(s.tab,'calendar');
 assert.equal(s.controller.back(),'handled');assert.equal(s.tab,'today');
 assert.equal(s.controller.back(),'root');
});
test('same-tab clicks do not duplicate history and Home returns to root',()=>{
 const s=setup();s.controller.navigate('calendar');const count=s.count;
 s.controller.navigate('calendar');assert.equal(s.count,count);
 s.controller.navigate('settings');s.controller.navigate('today');
 assert.equal(s.tab,'today');assert.equal(s.controller.back(),'root');
});
test('native and browser Back close overlays before navigating away',()=>{
 for(const native of [true,false]){
  const s=setup();s.controller.navigate('calendar');s.overlay();
  if(native)s.controller.back();else s.browser.history.back();
  assert.equal(s.closed,1);assert.equal(s.tab,'calendar');
  s.controller.back();assert.equal(s.tab,'today');
 }
});
test('root overlay closes without showing exit prompt',()=>{
 const s=setup();s.overlay();s.browser.history.back();
 assert.equal(s.closed,1);assert.equal(s.notice,false);assert.equal(s.controller.back(),'root');
});
test('browser first Back warns; second within two seconds leaves app history',()=>{
 const s=setup();s.browser.history.back();assert.equal(s.notice,true);
 s.tick(1900);s.browser.history.back();
 assert.equal(s.browser.location.pathname,'/previous');assert.equal(s.notice,false);
});
test('expired or backgrounded exit confirmation requires a new pair',()=>{
 for(const background of [false,true]){
  const s=setup();s.browser.history.back();
  if(background){s.browser.document.hidden=true;s.browser.document.dispatchEvent(new Event('visibilitychange'));}else s.tick(2001);
  s.browser.history.back();assert.equal(s.browser.location.pathname,'/');assert.equal(s.notice,true);
 }
});
test('calendar deep link goes Back to Home; disposal removes session callbacks',()=>{
 const s=setup('/?view=calendar');assert.equal(s.tab,'calendar');
 s.controller.back();assert.equal(s.tab,'today');
 s.controller.dispose();s.browser.history.back();assert.equal(s.notice,false);
});
