import test from 'node:test';
import assert from 'node:assert/strict';
import {loadTs} from './load-ts.mjs';
const {isAppTab,navigationEntry,readNavigation}=await loadTs('lib/app-navigation.ts');
test('only existing tabs can be navigated to',()=>{
 for(const tab of ['today','calendar','balances','history','shifts','changes','settings'])assert.equal(isAppTab(tab),true);
 for(const tab of ['admin','javascript:alert(1)',null,{},0])assert.equal(isAppTab(tab),false);
});
test('history contains navigation only and cannot restore another login session',()=>{
 const entry=navigationEntry('session-1',2,'calendar');
 assert.deepEqual(Object.keys(entry).sort(),['index','tab','zeitkontoNavigation']);
 assert.deepEqual(readNavigation(entry,'session-1'),{index:2,tab:'calendar'});
 assert.equal(readNavigation(entry,'session-2'),null);
});
test('root sentinel is valid; malformed indices and tabs are ignored',()=>{
 assert.deepEqual(readNavigation(navigationEntry('s',-1,'today'),'s'),{index:-1,tab:'today'});
 for(const entry of [null,{},navigationEntry('s',-2,'today'),navigationEntry('s',1.2,'today'),navigationEntry('s','1','today'),navigationEntry('s',1,'admin')])assert.equal(readNavigation(entry,'s'),null);
});
