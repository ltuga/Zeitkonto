import type {Language} from '@/lib/i18n';
import {publisher} from '@/lib/publisher';
const labels={
 pt:{developer:'Desenvolvedor',contact:'Suporte e privacidade'},
 de:{developer:'Entwickler',contact:'Support und Datenschutz'},
 en:{developer:'Developer',contact:'Support and privacy'},
 tr:{developer:'Geliştirici',contact:'Destek ve gizlilik'},
};
export function SupportContact({lang}:{lang:Language}){
 const t=labels[lang];
 return <div style={{marginTop:16,overflowWrap:'anywhere'}}><p>{t.developer}: <strong>{publisher.name}</strong></p><p>{t.contact}: <a href={'mailto:'+publisher.email}>{publisher.email}</a></p></div>;
}
