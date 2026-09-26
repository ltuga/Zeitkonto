import {isAppTab, navigationEntry, readNavigation, type AppTab} from './app-navigation';

export function createBackNavigation(browser:Window, callbacks:{
  onTab:(tab:AppTab)=>void;
  onExitNotice:(visible:boolean)=>void;
  closeOverlay:()=>boolean;
}) {
  const {history,location,document}=browser;
  const session=browser.crypto.randomUUID();
  const requested=new URLSearchParams(location.search).get('view');
  let current={index:0,tab:'today' as AppTab};
  let lastExit=-Infinity, moving=false, leaving=false;
  let timer:number|undefined;
  const url=(tab:AppTab)=>{
    const next=new URL(location.href);
    if(tab==='today')next.searchParams.delete('view');else next.searchParams.set('view',tab);
    return next;
  };
  const push=()=>history.pushState(navigationEntry(session,current.index,current.tab),'',url(current.tab));
  const clearExit=()=>{lastExit=-Infinity;callbacks.onExitNotice(false);browser.clearTimeout(timer)};
  // A root sentinel lets browser Back close an overlay opened on Home.
  history.replaceState(navigationEntry(session,-1,'today'),'',url('today'));
  push();
  const navigate=(next:AppTab)=>{
    if(moving || next===current.tab)return;
    if(next==='today' && current.index>0){clearExit();moving=true;history.go(-current.index);return;}
    clearExit();current={index:current.index+1,tab:next};push();callbacks.onTab(next);
    browser.scrollTo({top:0});
  };
  const back=():'handled'|'root'=>{
    if(moving)return 'handled';
    if(callbacks.closeOverlay()){clearExit();return 'handled';}
    if(current.index>0){clearExit();moving=true;history.back();return 'handled';}
    return 'root';
  };
  const pop=(event:PopStateEvent)=>{
    if(leaving)return;
    moving=false;
    const previous=readNavigation(event.state,session);
    // These are local UI tabs, not server routes. Prevent the framework from
    // fetching/remounting the page on each Back, including when offline.
    if(previous)event.stopImmediatePropagation();
    if(callbacks.closeOverlay()){clearExit();push();return;}
    if(previous && previous.index>=0){clearExit();current=previous;callbacks.onTab(previous.tab);return;}
    // No restoration of a previous login's navigation state.
    if(!previous){clearExit();current={index:0,tab:'today'};callbacks.onTab('today');
      history.replaceState(navigationEntry(session,0,'today'),'',url('today'));return;}
    const now=browser.performance.now();
    if(now-lastExit<=2000){clearExit();leaving=true;history.back();return;}
    lastExit=now;callbacks.onExitNotice(true);push();
    timer=browser.setTimeout(()=>callbacks.onExitNotice(false),2000);
  };
  const visibility=()=>{if(document.hidden)clearExit()};
  browser.addEventListener('popstate',pop,{capture:true});
  document.addEventListener('visibilitychange',visibility);
  if(isAppTab(requested) && requested!=='today')navigate(requested);
  return {navigate,back,dispose:()=>{
    browser.removeEventListener('popstate',pop,{capture:true});
    document.removeEventListener('visibilitychange',visibility);
    browser.clearTimeout(timer);
    history.replaceState(null,'');
  }};
}
