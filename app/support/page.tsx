'use client';
import Link from 'next/link';
import {SupportContact} from '@/components/zeitkonto/support-contact';
import {useAppLanguage} from '@/lib/use-app-language';
const texts={
 pt:{title:'Zeitkonto — apoio e privacidade',help:'Para questões sobre a app, os teus dados ou pedidos de eliminação, utiliza o contacto abaixo. Não envies palavras-passe, tokens ou documentos médicos por email.',remove:'Eliminar conta',back:'Voltar à app'},
 de:{title:'Zeitkonto — Support und Datenschutz',help:'Bei Fragen zur App, deinen Daten oder Löschanfragen nutze den Kontakt unten. Sende keine Passwörter, Tokens oder medizinischen Dokumente per E-Mail.',remove:'Konto löschen',back:'Zur App'},
 en:{title:'Zeitkonto — support and privacy',help:'For questions about the app, your data or deletion requests, use the contact below. Do not email passwords, tokens or medical documents.',remove:'Delete account',back:'Back to app'},
 tr:{title:'Zeitkonto — destek ve gizlilik',help:'Uygulama, verilerin veya silme talepleriyle ilgili sorular için aşağıdaki iletişim adresini kullan. E-postayla şifre, token veya tıbbi belge gönderme.',remove:'Hesabı sil',back:'Uygulamaya dön'},
};
export default function SupportPage(){const {lang}=useAppLanguage(),t=texts[lang];return <main className="auth-page"><section className="panel" style={{maxWidth:640,margin:'2rem auto',padding:24}}><h1>{t.title}</h1><p>{t.help}</p><SupportContact lang={lang}/><p><Link href="/delete-account">{t.remove}</Link></p><Link href="/">{t.back}</Link></section></main>;}
