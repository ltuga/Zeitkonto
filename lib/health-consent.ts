import type {Entry} from './time';
export const PRIVACY_VERSION='2026-09-28';
export function healthConsentRequired(before:Entry[],after:Entry[]){
 const old=new Map(before.map(r=>[r.id,r]));
 return after.filter(r=>['sick_note','sick_no_note'].includes(r.kind)&&(!old.has(r.id)||JSON.stringify(old.get(r.id))!==JSON.stringify(r)));
}
export const healthConsentMessage={
 pt:'Autorizo expressamente a Zeitkonto a guardar e sincronizar os dados de doença destes registos para gerir as minhas ausências. Posso retirar este consentimento eliminando os registos ou a conta. Não é necessário indicar diagnóstico nem anexar atestado. Política: menu Privacidade. Continuar?',
 de:'Ich willige ausdrücklich ein, dass Zeitkonto die Krankheitsdaten dieser Einträge zur Verwaltung meiner Abwesenheiten speichert und synchronisiert. Ich kann dies durch Löschen der Einträge oder des Kontos widerrufen. Diagnose und Attestdatei sind nicht erforderlich. Datenschutzerklärung: Menü Datenschutz. Fortfahren?',
 en:'I explicitly consent to Zeitkonto storing and synchronizing sickness data in these entries to manage my absences. I can withdraw by deleting the entries or my account. No diagnosis or certificate file is required. Policy: Privacy menu. Continue?',
 tr:'Devamsızlıklarımı yönetmek için bu kayıtlardaki hastalık verilerinin Zeitkonto tarafından saklanmasına ve eşitlenmesine açıkça izin veriyorum. Kayıtları veya hesabımı silerek iznimi geri alabilirim. Teşhis veya rapor dosyası gerekli değildir. Politika: Gizlilik menüsü. Devam edilsin mi?',
};
