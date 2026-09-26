'use client';
import {useCallback, useEffect, useRef, useState} from 'react';
import {useSidebar} from '@/components/ui/sidebar';
import {isAppTab, type AppTab} from '@/lib/app-navigation';
import {createBackNavigation} from '@/lib/back-navigation';
import type {Language} from '@/lib/i18n';

declare global {
  interface Window { __zeitkontoBack?: () => 'handled' | 'root'; }
}

const exitMessages: Record<Language,string> = {
  pt:'Toca novamente em Voltar para sair.', de:'Zum Beenden erneut Zurück drücken.',
  en:'Press Back again to exit.', tr:'Çıkmak için tekrar Geri tuşuna basın.',
};

// Escape respects each Radix layer's own close/busy guards and closes only the top layer.
function dismissOverlay() {
  const layers = document.querySelectorAll<HTMLElement>(
    '[data-state="open"][role="dialog"], [data-state="open"][role="alertdialog"], [data-state="open"][role="listbox"], [data-state="open"][role="menu"]');
  if (!layers.length) return false;
  const top = layers[layers.length - 1];
  if (top.getAttribute('role') === 'alertdialog') {
    top.querySelector<HTMLButtonElement>('[data-slot="alert-dialog-cancel"]')?.click();
  } else {
    (document.activeElement || top).dispatchEvent(new KeyboardEvent('keydown', {
      key:'Escape', code:'Escape', bubbles:true, cancelable:true,
    }));
  }
  return true;
}

export function useAppNavigation() {
  const [tab, updateTab] = useState<AppTab>('today');
  const navigateRef = useRef<(next:AppTab)=>void>(()=>{});
  const setTab = useCallback((next:string)=>{if(isAppTab(next))navigateRef.current(next)},[]);
  return {tab, setTab, navigateRef, updateTab};
}

export function BackNavigation({navigation, lang}:{navigation:ReturnType<typeof useAppNavigation>;lang:Language}) {
  const {open, isMobile, setOpen, openMobile, setOpenMobile} = useSidebar();
  const [exitNotice,setExitNotice] = useState(false);
  const sidebar = useRef<()=>boolean>(()=>false);
  useEffect(()=>{
    sidebar.current=()=>{
      if (openMobile) {setOpenMobile(false);return true;}
      if (!isMobile && open) {setOpen(false);return true;}
      return false;
    };
  },[open,isMobile,setOpen,openMobile,setOpenMobile]);
  const {navigateRef, updateTab} = navigation;
  useEffect(()=>{
    const controller=createBackNavigation(window, {
      onTab:updateTab,
      onExitNotice:setExitNotice,
      closeOverlay:()=>dismissOverlay() || sidebar.current(),
    });
    navigateRef.current=controller.navigate;
    window.__zeitkontoBack=controller.back;
    return()=>{
      if(window.__zeitkontoBack===controller.back)delete window.__zeitkontoBack;
      navigateRef.current=()=>{};
      controller.dispose();
    };
  },[navigateRef,updateTab]);
  return exitNotice ? <div role="status" style={{position:'fixed',bottom:'calc(110px + env(safe-area-inset-bottom))',left:'50%',transform:'translateX(-50%)',zIndex:1000,background:'#102b52',color:'white',padding:'12px 20px',borderRadius:24,maxWidth:'90vw',width:'max-content',boxShadow:'0 4px 20px #0003'}}>{exitMessages[lang]}</div> : null;
}
