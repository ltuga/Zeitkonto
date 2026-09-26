import type { Metadata,Viewport } from 'next';
import './globals.css';
import './dashboard.css';
import './interface.css';
import './timesheet.css';
import './calendar-colors.css';
export const metadata:Metadata={title:'Zeitkonto · Arbeitszeit & Urlaub',description:'Arbeitszeiten, Urlaub und Freizeitausgleich im Blick.',manifest:'/manifest.webmanifest',icons:{icon:'/favicon.svg',apple:'/icons/apple-touch-icon.png'},appleWebApp:{capable:true,title:'Zeitkonto',statusBarStyle:'default'}};
export const viewport:Viewport={width:'device-width',initialScale:1,themeColor:'#f8fbff'};
export default function Layout({children}:{children:React.ReactNode}){return <html lang="pt" suppressHydrationWarning><head><meta name="zeitkonto-public-shell" content="v1"/><script src="/theme.js"/></head><body>{children}</body></html>}
