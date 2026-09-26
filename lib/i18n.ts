export type Language = "pt" | "de" | "en" | "tr";
export const locales={pt:"pt-PT",de:"de-DE",en:"en-GB",tr:"tr-TR"};
export const messages:Record<string,Record<string,string>> = {
  "O teu banco de horas": {
    "de": "Dein Zeitkonto",
    "en": "Your time account",
    "tr": "Zaman hesabın"
  },
  "TEMPO PARA O QUE IMPORTA": {
    "de": "ZEIT FÜR DAS WESENTLICHE",
    "en": "TIME FOR WHAT MATTERS",
    "tr": "ÖNEMLİ ŞEYLERE ZAMAN"
  },
  "O teu tempo, em dia.": {
    "de": "Deine Zeit im Blick.",
    "en": "Your time, up to date.",
    "tr": "Zamanın kontrol altında."
  },
  "Trabalho, férias e descanso. Tudo contado.": {
    "de": "Arbeit, Urlaub und Freizeitausgleich. Alles erfasst.",
    "en": "Work, holidays and time off. All accounted for.",
    "tr": "İş, yıllık izin ve dinlenme. Hepsi kayıt altında."
  },
  "Novo registo": {
    "de": "Neuer Eintrag",
    "en": "New entry",
    "tr": "Yeni kayıt"
  },
  "Tentar novamente": {
    "de": "Erneut versuchen",
    "en": "Try again",
    "tr": "Tekrar dene"
  },
  "Banco de horas": {
    "de": "Zeitkonto",
    "en": "Time account",
    "tr": "Zaman hesabı"
  },
  "ACUMULADO": {
    "de": "GESAMT",
    "en": "TOTAL",
    "tr": "TOPLAM"
  },
  "A carregar…": {
    "de": "Wird geladen…",
    "en": "Loading…",
    "tr": "Yükleniyor…"
  },
  "dias de descanso disponíveis": {
    "de": "freie Tage verfügbar",
    "en": "days off available",
    "tr": "gün izin kullanılabilir"
  },
  "Férias registadas": {
    "de": "Erfasste Urlaubstage",
    "en": "Recorded holiday days",
    "tr": "Kayıtlı yıllık izin"
  },
  "dias": {
    "de": "Tage",
    "en": "days",
    "tr": "gün"
  },
  "Em": {
    "de": "Im Jahr",
    "en": "In",
    "tr": "Yıl:"
  },
  "Turno normal": {
    "de": "Regelschicht",
    "en": "Normal shift",
    "tr": "Normal vardiya"
  },
  "/ dia": {
    "de": "/ Tag",
    "en": "/ day",
    "tr": "/ gün"
  },
  "Inclui 30 min de pausa": {
    "de": "Inkl. 30 Min. Pause",
    "en": "Includes a 30 min break",
    "tr": "30 dk mola dahil"
  },
  "Hoje": {
    "de": "Heute",
    "en": "Today",
    "tr": "Bugün"
  },
  "Registos": {
    "de": "Einträge",
    "en": "Entries",
    "tr": "Kayıtlar"
  },
  "Definições": {
    "de": "Einstellungen",
    "en": "Settings",
    "tr": "Ayarlar"
  },
  "Registar o turno": {
    "de": "Schicht erfassen",
    "en": "Track your shift",
    "tr": "Vardiyayı kaydet"
  },
  "Em pausa": {
    "de": "In der Pause",
    "en": "On break",
    "tr": "Molada"
  },
  "A trabalhar": {
    "de": "Bei der Arbeit",
    "en": "Working",
    "tr": "Çalışıyor"
  },
  "Por iniciar": {
    "de": "Noch nicht begonnen",
    "en": "Not started",
    "tr": "Başlamadı"
  },
  "Pronto para começar mais um dia": {
    "de": "Bereit für einen neuen Tag",
    "en": "Ready for another day",
    "tr": "Yeni bir güne hazır"
  },
  "Registar entrada": {
    "de": "Einstempeln",
    "en": "Clock in",
    "tr": "Giriş kaydet"
  },
  "Retomar": {
    "de": "Fortsetzen",
    "en": "Resume",
    "tr": "Devam et"
  },
  "Pausa": {
    "de": "Pause",
    "en": "Break",
    "tr": "Mola"
  },
  "Saída": {
    "de": "Arbeitsende",
    "en": "Clock out",
    "tr": "Çıkış"
  },
  "Adicionar horas manualmente": {
    "de": "Zeiten manuell hinzufügen",
    "en": "Add hours manually",
    "tr": "Saatleri elle ekle"
  },
  "Cancelar turno em curso": {
    "de": "Laufende Schicht verwerfen",
    "en": "Cancel current shift",
    "tr": "Devam eden vardiyayı iptal et"
  },
  "Planeia uma pausa": {
    "de": "Plane deine freie Zeit",
    "en": "Plan some time off",
    "tr": "Dinlenmeni planla"
  },
  "Dá espaço ao teu descanso.": {
    "de": "Nimm dir Zeit zum Erholen.",
    "en": "Make room for rest.",
    "tr": "Dinlenmeye zaman ayır."
  },
  "Marcar férias": {
    "de": "Urlaub eintragen",
    "en": "Record a holiday",
    "tr": "Yıllık izin kaydet"
  },
  "Sem alterar o banco de horas": {
    "de": "Ohne Änderung des Zeitkontos",
    "en": "Without changing your time balance",
    "tr": "Zaman bakiyesini değiştirmeden"
  },
  "Usar horas acumuladas": {
    "de": "Zeitguthaben nutzen",
    "en": "Use accumulated hours",
    "tr": "Biriken saatleri kullan"
  },
  "Como são contadas as horas?": {
    "de": "Wie werden die Stunden berechnet?",
    "en": "How are hours calculated?",
    "tr": "Saatler nasıl hesaplanır?"
  },
  "8h de presença = dia completo. Até 30 min de pausa estão incluídos; apenas a pausa adicional é descontada. Um turno de 9h com 30 min de pausa acumula +1h.": {
    "de": "8 Std. Anwesenheit = ein voller Tag. Bis zu 30 Min. Pause sind enthalten; nur zusätzliche Pausenzeit wird abgezogen. Eine 9-Stunden-Schicht mit 30 Min. Pause ergibt +1 Std.",
    "en": "8 hours of attendance = a full day. Up to 30 minutes of break are included; only additional break time is deducted. A 9-hour shift with a 30-minute break earns +1 hour.",
    "tr": "8 saat iş yerinde bulunmak = tam gün. 30 dakikaya kadar mola dahildir; yalnızca ek mola süresi düşülür. 30 dakika molalı 9 saatlik vardiya +1 saat kazandırır."
  },
  "Os teus registos": {
    "de": "Deine Einträge",
    "en": "Your entries",
    "tr": "Kayıtların"
  },
  "Mês": {
    "de": "Monat",
    "en": "Month",
    "tr": "Ay"
  },
  "Saldo do mês:": {
    "de": "Monatssaldo:",
    "en": "Monthly balance:",
    "tr": "Aylık bakiye:"
  },
  "dias registados": {
    "de": "erfasste Tage",
    "en": "recorded days",
    "tr": "kayıtlı gün"
  },
  "Ainda não há registos neste mês": {
    "de": "Noch keine Einträge in diesem Monat",
    "en": "No entries this month yet",
    "tr": "Bu ay henüz kayıt yok"
  },
  "Adiciona um turno, férias ou um dia de descanso.": {
    "de": "Trage eine Schicht, Urlaub oder Freizeitausgleich ein.",
    "en": "Add a shift, holiday or day off.",
    "tr": "Vardiya, yıllık izin veya dinlenme günü ekle."
  },
  "Adicionar registo": {
    "de": "Eintrag hinzufügen",
    "en": "Add entry",
    "tr": "Kayıt ekle"
  },
  "Férias": {
    "de": "Urlaub",
    "en": "Holiday",
    "tr": "Yıllık izin"
  },
  "Descanso compensatório": {
    "de": "Freizeitausgleich",
    "en": "Compensatory time off",
    "tr": "Fazla mesai karşılığı izin"
  },
  "Editar registo": {
    "de": "Eintrag bearbeiten",
    "en": "Edit entry",
    "tr": "Kaydı düzenle"
  },
  "Eliminar registo": {
    "de": "Eintrag löschen",
    "en": "Delete entry",
    "tr": "Kaydı sil"
  },
  "O saldo inicial soma-se às horas dos registos.": {
    "de": "Der Anfangssaldo wird zu den erfassten Stunden addiert.",
    "en": "The opening balance is added to your recorded hours.",
    "tr": "Başlangıç bakiyesi kayıtlı saatlerine eklenir."
  },
  "Saldo inicial (horas, pode ser negativo)": {
    "de": "Anfangssaldo (Stunden, auch negativ)",
    "en": "Opening balance (hours, may be negative)",
    "tr": "Başlangıç bakiyesi (saat, negatif olabilir)"
  },
  "Horas a descontar por dia de descanso": {
    "de": "Abzug pro freiem Tag (Stunden)",
    "en": "Hours deducted per day off",
    "tr": "İzin günü başına düşülecek saat"
  },
  "A alteração do custo aplica-se aos próximos registos ou aos que editares. Os dias já guardados mantêm o desconto original.": {
    "de": "Die Änderung gilt für neue oder bearbeitete Einträge. Bereits gespeicherte Tage behalten ihren ursprünglichen Abzug.",
    "en": "Changes apply to new entries or entries you edit. Saved days retain their original deduction.",
    "tr": "Değişiklik yeni veya düzenlediğin kayıtlara uygulanır. Önceden kaydedilen günlerin kesintisi aynı kalır."
  },
  "Guardar definições": {
    "de": "Einstellungen speichern",
    "en": "Save settings",
    "tr": "Ayarları kaydet"
  },
  "Registos guardados na tua conta · Horas no fuso do dispositivo": {
    "de": "Einträge in deinem Konto gespeichert · Zeitzone des Geräts",
    "en": "Entries saved to your account · Device time zone",
    "tr": "Kayıtlar hesabında saklanır · Cihazın saat dilimi"
  },
  "Regista um dia e atualiza o teu banco de horas.": {
    "de": "Erfasse einen Tag und aktualisiere dein Zeitkonto.",
    "en": "Record a day and update your time account.",
    "tr": "Bir gün kaydet ve zaman hesabını güncelle."
  },
  "Tipo de registo": {
    "de": "Art des Eintrags",
    "en": "Entry type",
    "tr": "Kayıt türü"
  },
  "Turno de trabalho": {
    "de": "Arbeitsschicht",
    "en": "Work shift",
    "tr": "Çalışma vardiyası"
  },
  "Descanso com horas acumuladas": {
    "de": "Freizeitausgleich aus Zeitguthaben",
    "en": "Time off using accumulated hours",
    "tr": "Biriken saatlerden izin"
  },
  "Data": {
    "de": "Datum",
    "en": "Date",
    "tr": "Tarih"
  },
  "Data de entrada": {
    "de": "Datum des Schichtbeginns",
    "en": "Clock-in date",
    "tr": "Giriş tarihi"
  },
  "Entrada": {
    "de": "Schichtbeginn",
    "en": "Clock in",
    "tr": "Giriş"
  },
  "Pausa total (minutos)": {
    "de": "Gesamte Pause (Minuten)",
    "en": "Total break (minutes)",
    "tr": "Toplam mola (dakika)"
  },
  "Se a saída for anterior à entrada, conta como o dia seguinte. Os primeiros 30 min de pausa estão incluídos nas 8h.": {
    "de": "Liegt das Ende vor dem Beginn, zählt es als Folgetag. Die ersten 30 Min. Pause sind in den 8 Std. enthalten.",
    "en": "If the end time is earlier than the start, it counts as the next day. The first 30 minutes of break are included in the 8 hours.",
    "tr": "Çıkış saati girişten önceyse ertesi gün sayılır. Molanın ilk 30 dakikası 8 saate dahildir."
  },
  "Este dia de férias não altera o saldo de horas.": {
    "de": "Dieser Urlaubstag verändert den Zeitsaldo nicht.",
    "en": "This holiday does not change your time balance.",
    "tr": "Bu yıllık izin günü saat bakiyesini değiştirmez."
  },
  "Nota (opcional)": {
    "de": "Notiz (optional)",
    "en": "Note (optional)",
    "tr": "Not (isteğe bağlı)"
  },
  "Acrescenta uma observação…": {
    "de": "Anmerkung hinzufügen…",
    "en": "Add a note…",
    "tr": "Bir not ekle…"
  },
  "A guardar…": {
    "de": "Wird gespeichert…",
    "en": "Saving…",
    "tr": "Kaydediliyor…"
  },
  "Guardar registo": {
    "de": "Eintrag speichern",
    "en": "Save entry",
    "tr": "Kaydı kaydet"
  },
  "Cancelar este turno?": {
    "de": "Diese Schicht verwerfen?",
    "en": "Cancel this shift?",
    "tr": "Bu vardiya iptal edilsin mi?"
  },
  "Eliminar este registo?": {
    "de": "Diesen Eintrag löschen?",
    "en": "Delete this entry?",
    "tr": "Bu kayıt silinsin mi?"
  },
  "O saldo será recalculado. Esta ação não pode ser anulada.": {
    "de": "Der Saldo wird neu berechnet. Diese Aktion kann nicht rückgängig gemacht werden.",
    "en": "Your balance will be recalculated. This action cannot be undone.",
    "tr": "Bakiye yeniden hesaplanacak. Bu işlem geri alınamaz."
  },
  "Voltar": {
    "de": "Zurück",
    "en": "Go back",
    "tr": "Geri dön"
  },
  "Confirmar": {
    "de": "Bestätigen",
    "en": "Confirm",
    "tr": "Onayla"
  },
  "Idioma": {
    "de": "Sprache",
    "en": "Language",
    "tr": "Dil"
  },
  "Guardado com sucesso.": {
    "de": "Erfolgreich gespeichert.",
    "en": "Saved successfully.",
    "tr": "Başarıyla kaydedildi."
  },
  "Já existe um registo neste dia. Edita-o no histórico.": {
    "de": "Für diesen Tag gibt es bereits einen Eintrag. Bearbeite ihn unter Einträge.",
    "en": "An entry already exists for this day. Edit it in your history.",
    "tr": "Bu gün için zaten bir kayıt var. Kayıtlar bölümünden düzenle."
  },
  "Não tens horas suficientes para este dia de descanso.": {
    "de": "Dein Zeitguthaben reicht für diesen freien Tag nicht aus.",
    "en": "You do not have enough hours for this day off.",
    "tr": "Bu izin günü için yeterli saatin yok."
  },
  "O turno ultrapassou 24 horas. Cancela-o e adiciona as horas manualmente.": {
    "de": "Die Schicht dauert länger als 24 Stunden. Verwirf sie und trage die Zeiten manuell ein.",
    "en": "This shift exceeds 24 hours. Cancel it and add the hours manually.",
    "tr": "Vardiya 24 saati aştı. İptal edip saatleri elle ekle."
  },
  "Já existe um registo para a data de entrada. Edita-o ou elimina-o antes de terminar.": {
    "de": "Für das Startdatum gibt es bereits einen Eintrag. Bearbeite oder lösche ihn vor dem Ausstempeln.",
    "en": "An entry already exists for the start date. Edit or delete it before clocking out.",
    "tr": "Giriş tarihi için zaten kayıt var. Çıkış yapmadan önce düzenle veya sil."
  },
  "Indica horas válidas.": {
    "de": "Gib gültige Uhrzeiten ein.",
    "en": "Enter valid times.",
    "tr": "Geçerli saatler gir."
  },
  "Verifica a entrada, a saída e a pausa.": {
    "de": "Prüfe Beginn, Ende und Pause.",
    "en": "Check the start, end and break times.",
    "tr": "Giriş, çıkış ve molayı kontrol et."
  },
  "Inicia sessão para aceder aos registos.": {
    "de": "Melde dich an, um deine Einträge zu sehen.",
    "en": "Sign in to access your entries.",
    "tr": "Kayıtlarına erişmek için oturum aç."
  },
  "Não foi possível carregar os registos. Tenta novamente.": {
    "de": "Einträge konnten nicht geladen werden. Versuche es erneut.",
    "en": "Could not load entries. Please try again.",
    "tr": "Kayıtlar yüklenemedi. Tekrar dene."
  },
  "Inicia sessão para guardar.": {
    "de": "Melde dich zum Speichern an.",
    "en": "Sign in to save.",
    "tr": "Kaydetmek için oturum aç."
  },
  "Os dados mudaram noutro dispositivo. Recarrega a página antes de guardar.": {
    "de": "Die Daten wurden auf einem anderen Gerät geändert. Lade die Seite vor dem Speichern neu.",
    "en": "Data changed on another device. Reload the page before saving.",
    "tr": "Veriler başka bir cihazda değişti. Kaydetmeden önce sayfayı yenile."
  },
  "Não foi possível guardar. Mantivemos os campos para tentares novamente.": {
    "de": "Speichern fehlgeschlagen. Deine Eingaben bleiben für einen erneuten Versuch erhalten.",
    "en": "Could not save. Your input has been kept so you can try again.",
    "tr": "Kaydedilemedi. Tekrar deneyebilmen için girdilerin korundu."
  },
  "Tempo sem pausas · pausa: {time}": {
    "de": "Zeit ohne Pausen · Pause: {time}",
    "en": "Time excluding breaks · break: {time}",
    "tr": "Mola hariç süre · mola: {time}"
  },
  "{hours}h por dia de descanso": {
    "de": "{hours} Std. pro freiem Tag",
    "en": "{hours}h per day off",
    "tr": "İzin günü başına {hours} saat"
  },
  " (+1 dia)": {
    "de": " (+1 Tag)",
    "en": " (+1 day)",
    "tr": " (+1 gün)"
  },
  "min pausa": {
    "de": "Min. Pause",
    "en": "min break",
    "tr": "dk mola"
  },
  "Este dia desconta {hours}h. Saldo atual: {balance}. Dias futuros ficam reservados no saldo imediatamente.": {
    "de": "Dieser Tag zieht {hours} Std. ab. Aktueller Saldo: {balance}. Zukünftige freie Tage werden sofort vom Saldo reserviert.",
    "en": "This day deducts {hours}h. Current balance: {balance}. Future days off are reserved from your balance immediately.",
    "tr": "Bu gün {hours} saat düşer. Mevcut bakiye: {balance}. Gelecekteki izin günleri bakiyeden hemen ayrılır."
  }
};
export function translate(lang:Language,key:string,values:Record<string,string|number>={}){let value=lang==="pt"?key:messages[key]?.[lang]??key;return value.replace(/\{(\w+)\}/g,(_,name)=>String(values[name]??"{"+name+"}"));}
export function formatMinutes(lang:Language,minutes:number){const m=Math.round(minutes),a=Math.abs(m);const units={pt:["h","m"],de:[" Std."," Min."],en:["h","m"],tr:[" sa"," dk"]}[lang];return `${m<0?"−":""}${Math.floor(a/60)}${units[0]} ${String(a%60).padStart(2,"0")}${units[1]}`;}

Object.assign(messages,{
  "Calendário": {
    "de": "Kalender",
    "en": "Calendar",
    "tr": "Takvim"
  },
  "Calendário de férias": {
    "de": "Urlaubskalender",
    "en": "Leave calendar",
    "tr": "İzin takvimi"
  },
  "Seleciona um dia para consultar ou marcar um período.": {
    "de": "Wähle einen Tag zum Anzeigen oder Eintragen eines Zeitraums.",
    "en": "Select a day to view details or book a period.",
    "tr": "Ayrıntıları görmek veya bir dönem kaydetmek için gün seç."
  },
  "Marcar período": {
    "de": "Zeitraum eintragen",
    "en": "Book a period",
    "tr": "Dönem kaydet"
  },
  "País dos feriados": {
    "de": "Feiertagsland",
    "en": "Holiday country",
    "tr": "Resmî tatil ülkesi"
  },
  "Região / Bundesland": {
    "de": "Region / Bundesland",
    "en": "Region / state",
    "tr": "Bölge / eyalet"
  },
  "Apenas feriados nacionais": {
    "de": "Nur landesweite Feiertage",
    "en": "National holidays only",
    "tr": "Yalnızca ulusal tatiller"
  },
  "Feriado": {
    "de": "Feiertag",
    "en": "Public holiday",
    "tr": "Resmî tatil"
  },
  "A carregar feriados…": {
    "de": "Feiertage werden geladen…",
    "en": "Loading public holidays…",
    "tr": "Resmî tatiller yükleniyor…"
  },
  "Não foi possível carregar os feriados.": {
    "de": "Feiertage konnten nicht geladen werden.",
    "en": "Could not load public holidays.",
    "tr": "Resmî tatiller yüklenemedi."
  },
  "Sem registos neste dia.": {
    "de": "Keine Einträge für diesen Tag.",
    "en": "No entries for this day.",
    "tr": "Bu gün için kayıt yok."
  },
  "Feriados neste mês": {
    "de": "Feiertage in diesem Monat",
    "en": "Public holidays this month",
    "tr": "Bu ayın resmî tatilleri"
  },
  "Sem feriados neste mês.": {
    "de": "Keine Feiertage in diesem Monat.",
    "en": "No public holidays this month.",
    "tr": "Bu ay resmî tatil yok."
  },
  "Fonte dos feriados": {
    "de": "Quelle der Feiertage",
    "en": "Holiday source",
    "tr": "Tatil kaynağı"
  },
  "Feriados municipais e exceções locais podem não estar incluídos. Os feriados não alteram o saldo automaticamente.": {
    "de": "Kommunale Feiertage und örtliche Ausnahmen sind möglicherweise nicht enthalten. Feiertage ändern den Saldo nicht automatisch.",
    "en": "Municipal holidays and local exceptions may not be included. Public holidays do not change your balance automatically.",
    "tr": "Yerel tatiller ve istisnalar dahil olmayabilir. Resmî tatiller bakiyeyi otomatik olarak değiştirmez."
  },
  "Confirma os dias e o desconto antes de guardar.": {
    "de": "Prüfe die Tage und den Abzug vor dem Speichern.",
    "en": "Check the days and deduction before saving.",
    "tr": "Kaydetmeden önce günleri ve kesintiyi kontrol et."
  },
  "De": {
    "de": "Von",
    "en": "From",
    "tr": "Başlangıç"
  },
  "Até": {
    "de": "Bis",
    "en": "To",
    "tr": "Bitiş"
  },
  "Excluir sábados e domingos": {
    "de": "Samstage und Sonntage ausschließen",
    "en": "Exclude Saturdays and Sundays",
    "tr": "Cumartesi ve pazar günlerini hariç tut"
  },
  "Excluir feriados": {
    "de": "Feiertage ausschließen",
    "en": "Exclude public holidays",
    "tr": "Resmî tatilleri hariç tut"
  },
  "Altera o país e a região no calendário.": {
    "de": "Land und Region kannst du im Kalender ändern.",
    "en": "Change the country and region in the calendar.",
    "tr": "Ülkeyi ve bölgeyi takvimden değiştirebilirsin."
  },
  "Escolhe um período válido, até 366 dias.": {
    "de": "Wähle einen gültigen Zeitraum von höchstens 366 Tagen.",
    "en": "Choose a valid period of up to 366 days.",
    "tr": "En fazla 366 günlük geçerli bir dönem seç."
  },
  "dias a marcar": {
    "de": "Tage einzutragen",
    "en": "days to book",
    "tr": "gün kaydedilecek"
  },
  "Excluídos": {
    "de": "Ausgeschlossen",
    "en": "Excluded",
    "tr": "Hariç tutulanlar"
  },
  "dias de fim de semana": {
    "de": "Wochenendtage",
    "en": "weekend days",
    "tr": "hafta sonu günü"
  },
  "feriados": {
    "de": "Feiertage",
    "en": "public holidays",
    "tr": "resmî tatil"
  },
  "dias já registados": {
    "de": "bereits erfasste Tage",
    "en": "days already recorded",
    "tr": "önceden kayıtlı gün"
  },
  "Desconto": {
    "de": "Abzug",
    "en": "Deduction",
    "tr": "Kesinti"
  },
  "Saldo após marcação": {
    "de": "Saldo nach Eintragung",
    "en": "Balance after booking",
    "tr": "Kayıt sonrası bakiye"
  },
  "Não tens horas suficientes para este período.": {
    "de": "Dein Zeitguthaben reicht für diesen Zeitraum nicht aus.",
    "en": "You do not have enough hours for this period.",
    "tr": "Bu dönem için yeterli saatin yok."
  },
  "Este período de férias não altera o saldo de horas.": {
    "de": "Dieser Urlaub verändert den Zeitsaldo nicht.",
    "en": "This holiday period does not change your time balance.",
    "tr": "Bu yıllık izin dönemi saat bakiyesini değiştirmez."
  },
  "Ver dias incluídos": {
    "de": "Enthaltene Tage anzeigen",
    "en": "View included days",
    "tr": "Dahil edilen günleri gör"
  },
  "Os dias futuros descontam do saldo imediatamente. Os registos existentes são mantidos.": {
    "de": "Zukünftiger Freizeitausgleich wird sofort abgezogen. Bestehende Einträge bleiben erhalten.",
    "en": "Future compensatory days off are deducted immediately. Existing entries are kept.",
    "tr": "Gelecekteki telafi izinleri bakiyeden hemen düşülür. Mevcut kayıtlar korunur."
  },
  "Não foi possível guardar o período. Tenta novamente.": {
    "de": "Der Zeitraum konnte nicht gespeichert werden. Versuche es erneut.",
    "en": "Could not save the period. Please try again.",
    "tr": "Dönem kaydedilemedi. Tekrar dene."
  },
  "Guardar período": {
    "de": "Zeitraum speichern",
    "en": "Save period",
    "tr": "Dönemi kaydet"
  },
  "Conta e acesso": {
    "de": "Konto und Zugang",
    "en": "Account and access",
    "tr": "Hesap ve erişim"
  },
  "Acesso protegido pela tua conta ChatGPT. Um login independente por email ainda não está configurado.": {
    "de": "Zugang über dein ChatGPT-Konto. Eine eigenständige E-Mail-Anmeldung ist noch nicht eingerichtet.",
    "en": "Access is protected by your ChatGPT account. Independent email sign-in is not yet configured.",
    "tr": "Erişim ChatGPT hesabınla korunur. Bağımsız e-posta girişi henüz yapılandırılmadı."
  },
  "Terminar sessão": {
    "de": "Abmelden",
    "en": "Sign out",
    "tr": "Çıkış yap"
  },
  "Instalar no telemóvel": {
    "de": "Auf dem Smartphone installieren",
    "en": "Install on your phone",
    "tr": "Telefona yükle"
  },
  "A aplicação está instalada neste dispositivo.": {
    "de": "Die App ist auf diesem Gerät installiert.",
    "en": "The app is installed on this device.",
    "tr": "Uygulama bu cihazda yüklü."
  },
  "Instalar Zeitkonto": {
    "de": "Zeitkonto installieren",
    "en": "Install Zeitkonto",
    "tr": "Zeitkonto yükle"
  },
  "No Safari, abre Partilhar e escolhe Adicionar ao ecrã principal.": {
    "de": "Öffne in Safari das Teilen-Menü und wähle Zum Home-Bildschirm.",
    "en": "In Safari, open Share and choose Add to Home Screen.",
    "tr": "Safari'de Paylaş menüsünü aç ve Ana Ekrana Ekle'yi seç."
  },
  "No menu do navegador, procura Instalar aplicação ou Adicionar ao ecrã principal.": {
    "de": "Wähle im Browsermenü App installieren oder Zum Startbildschirm hinzufügen.",
    "en": "In your browser menu, look for Install app or Add to Home screen.",
    "tr": "Tarayıcı menüsünde Uygulamayı yükle veya Ana ekrana ekle seçeneğini bul."
  },
  "Usa o menu do navegador para instalar a aplicação.": {
    "de": "Verwende das Browsermenü, um die App zu installieren.",
    "en": "Use your browser menu to install the app.",
    "tr": "Uygulamayı yüklemek için tarayıcı menüsünü kullan."
  },
  "Instalação pelo navegador. Ainda não está disponível na Google Play nem na App Store. Precisas de internet para consultar e guardar registos.": {
    "de": "Installation über den Browser. Noch nicht bei Google Play oder im App Store verfügbar. Zum Anzeigen und Speichern von Einträgen ist Internet erforderlich.",
    "en": "Install through your browser. Not yet available on Google Play or the App Store. Internet is required to view and save entries.",
    "tr": "Tarayıcıdan yüklenir. Henüz Google Play veya App Store'da yoktur. Kayıtları görmek ve kaydetmek için internet gerekir."
  }
});

const shiftMessages:Record<string,[string,string,string]>={
'Automático (telemóvel)':['Automatisch (Gerätesprache)','Automatic (device language)','Otomatik (cihaz dili)'],
'Pausas à parte das 8h':['Pausen zusätzlich zu 8 Std.','Breaks in addition to 8h','8 saate ek molalar'],
'Regime de pausas':['Pausenregelung','Break policy','Mola düzeni'],
'8h com 30 min de pausa incluídos':['8 Std. inklusive 30 Min. Pause','8h including a 30-minute break','30 dk mola dahil 8 saat'],
'8h de trabalho + pausas à parte':['8 Std. Arbeit + zusätzliche Pausen','8h work + additional breaks','8 saat çalışma + ek molalar'],
'Pausa habitual total (minutos)':['Übliche Pausen insgesamt (Minuten)','Usual total break (minutes)','Normal toplam mola (dakika)'],
'Exemplo: 15 + 30 minutos = 45. Este valor preenche novos registos manuais; no cronómetro, usa Pausa e Retomar para cada intervalo.':['Beispiel: 15 + 30 Minuten = 45. Dieser Wert wird für neue manuelle Einträge verwendet. Bei der Zeiterfassung für jede Pause „Pause“ und „Fortsetzen“ nutzen.','Example: 15 + 30 minutes = 45. This prefills new manual entries. When using the timer, use Pause and Resume for each break.','Örnek: 15 + 30 dakika = 45. Yeni manuel kayıtlara bu süre eklenir. Sayaçta her mola için Mola ve Devam düğmelerini kullan.'],
'O novo regime aplica-se aos próximos turnos. Os registos anteriores e o turno em curso mantêm o regime original.':['Die neue Regelung gilt für zukünftige Schichten. Bestehende Einträge und die laufende Schicht behalten ihre ursprüngliche Regelung.','The new policy applies to future shifts. Existing records and the current shift keep their original policy.','Yeni düzen gelecek vardiyalar için geçerlidir. Önceki kayıtlar ve devam eden vardiya eski düzeni korur.'],
'8h de trabalho efetivo. As pausas são descontadas: 06h00–14h45 com 45 min de pausa = 8h, sem horas extras.':['8 Std. tatsächliche Arbeit. Pausen werden abgezogen: 06:00–14:45 mit 45 Min. Pause = 8 Std., keine Überstunden.','8h of actual work. Breaks are deducted: 06:00–14:45 with a 45-minute break = 8h, no overtime.','8 saat fiili çalışma. Molalar düşülür: 06:00–14:45 arası 45 dk mola ile 8 saat, fazla mesai yok.'],
'Se a saída for anterior à entrada, conta como o dia seguinte. Todas as pausas são descontadas das horas de presença.':['Liegt das Ende vor dem Beginn, zählt es als Folgetag. Alle Pausen werden von der Anwesenheitszeit abgezogen.','If the end is before the start, it counts as the next day. All breaks are deducted from time on site.','Çıkış girişten önceyse ertesi gün sayılır. Tüm molalar işyerinde geçirilen süreden düşülür.']
};
for(const [key,[de,en,tr]] of Object.entries(shiftMessages))messages[key]={de,en,tr};

const sicknessMessages:Record<string,[string,string,string]>={
'Registar doença':['Krankheit eintragen','Record sickness','Hastalık kaydet'],
'Com ou sem atestado médico':['Mit oder ohne ärztliche Bescheinigung','With or without a medical certificate','Doktor raporlu veya raporsuz'],
'Doença com atestado':['Krank mit Attest','Sick with medical certificate','Raporlu hastalık'],
'Doença sem atestado':['Krank ohne Attest','Sick without medical certificate','Raporsuz hastalık'],
'A doença não altera o saldo de horas nem desconta dias de férias.':['Krankheit verändert weder den Stundensaldo noch die Urlaubstage.','Sickness does not change your time balance or deduct holiday days.','Hastalık saat bakiyesini değiştirmez veya yıllık izinden düşülmez.'],
'Calendário de ausências':['Abwesenheitskalender','Absence calendar','İzin ve devamsızlık takvimi'],
'Confirma o tipo de ausência e os dias antes de guardar.':['Prüfe vor dem Speichern die Abwesenheitsart und die Tage.','Check the absence type and dates before saving.','Kaydetmeden önce devamsızlık türünü ve günleri kontrol et.'],
'Os dias já registados são mantidos. Para alterar um dia existente, edita-o no calendário.':['Bereits erfasste Tage bleiben erhalten. Bearbeite einen bestehenden Tag im Kalender, um ihn zu ändern.','Existing records are kept. To change an existing day, edit it in the calendar.','Kayıtlı günler korunur. Mevcut bir günü değiştirmek için takvimde düzenle.']
};
for(const [key,[de,en,tr]] of Object.entries(sicknessMessages))messages[key]={de,en,tr};

const navigationMessages:Record<string,[string,string,string]>={
'Página principal':['Startseite','Home','Ana sayfa'],
'Menu principal':['Hauptmenü','Main menu','Ana menü'],
'Abrir menu':['Menü öffnen','Open menu','Menüyü aç'],
'Fechar menu':['Menü schließen','Close menu','Menüyü kapat'],
'Marcar ausências':['Abwesenheit eintragen','Record absence','İzin veya devamsızlık kaydet'],
'Imprimir / Guardar PDF':['Drucken / Als PDF speichern','Print / Save PDF','Yazdır / PDF olarak kaydet'],
'Na janela de impressão, escolhe a impressora ou Guardar como PDF.':['Im Druckfenster einen Drucker oder „Als PDF speichern“ auswählen.','In the print dialog, choose a printer or Save as PDF.','Yazdırma penceresinde yazıcıyı veya PDF olarak kaydet seçeneğini seç.'],
'Exporta o mês apresentado, com férias, doença, descanso e turnos.':['Exportiert den angezeigten Monat mit Urlaub, Krankheit, Freizeitausgleich und Schichten.','Export the displayed month with holidays, sickness, time off and shifts.','Görüntülenen ayı yıllık izin, hastalık, dinlenme ve vardiyalarla dışa aktar.'],
'Permite abrir uma nova janela e tenta novamente.':['Erlaube das Öffnen eines neuen Fensters und versuche es erneut.','Allow a new window to open and try again.','Yeni pencere açılmasına izin ver ve tekrar dene.'],
'Registo pessoal':['Persönliche Aufzeichnung','Personal record','Kişisel kayıt'],
'Calendário baseado nos registos guardados na app.':['Kalender auf Grundlage der in der App gespeicherten Einträge.','Calendar based on records saved in the app.','Uygulamada kaydedilen verilere dayalı takvim.']
};
for(const [key,[de,en,tr]] of Object.entries(navigationMessages))messages[key]={de,en,tr};

const annualMessages:Record<string,[string,string,string]>={
'Calendário anual':['Jahreskalender','Annual calendar','Yıllık takvim'],
'Ano':['Jahr','Year','Yıl'],
'Período de impressão':['Druckzeitraum','Print period','Yazdırma dönemi'],
'Ano completo':['Ganzes Jahr','Full year','Tüm yıl'],
'Mês apresentado':['Angezeigter Monat','Displayed month','Görüntülenen ay'],
'Exporta os 12 meses e todos os registos do ano.':['Exportiert alle 12 Monate und sämtliche Einträge des Jahres.','Export all 12 months and every record for the year.','12 ayı ve yılın tüm kayıtlarını dışa aktar.'],
'Direito a férias por ano':['Jährlicher Urlaubsanspruch','Annual holiday allowance','Yıllık izin hakkı'],
'Indica o total disponível nesse ano, incluindo dias transitados, se aplicável.':['Gib den Gesamtanspruch für dieses Jahr einschließlich übertragener Tage an, falls zutreffend.','Enter the total allowance for that year, including carried-over days if applicable.','Varsa devreden günler dahil o yılın toplam izin hakkını gir.'],
'Total de dias de férias':['Urlaubstage insgesamt','Total holiday allowance','Toplam yıllık izin günü'],
'Férias disponíveis':['Verfügbare Urlaubstage','Holiday days available','Kalan yıllık izin'],
'Por definir':['Noch nicht festgelegt','Not set','Belirlenmedi'],
'Saldo de horas atual':['Aktueller Stundensaldo','Current time balance','Güncel saat bakiyesi'],
'Define o total anual de férias nas Definições para calcular os dias disponíveis.':['Lege den jährlichen Urlaubsanspruch in den Einstellungen fest, um die verfügbaren Tage zu berechnen.','Set your annual holiday allowance in Settings to calculate available days.','Kalan günleri hesaplamak için Ayarlar bölümünde yıllık izin hakkını belirle.'],
'As férias disponíveis já descontam todos os dias de férias registados no ano, incluindo os futuros.':['Bei den verfügbaren Urlaubstagen sind alle erfassten Urlaubstage des Jahres einschließlich zukünftiger Tage bereits abgezogen.','Available holiday days already deduct all holiday days recorded for the year, including future bookings.','Kalan izinden gelecekteki günler dahil o yıl kaydedilmiş tüm yıllık izin günleri düşülmüştür.'],
'O saldo de horas é o saldo atual de todos os registos, incluindo descansos futuros já reservados.':['Der Stundensaldo umfasst alle Einträge, einschließlich bereits reserviertem zukünftigen Freizeitausgleich.','The time balance covers all records, including future time off already reserved.','Saat bakiyesi, önceden ayrılmış gelecek dinlenme günleri dahil tüm kayıtları kapsar.']
};
for(const [key,[de,en,tr]] of Object.entries(annualMessages))messages[key]={de,en,tr};

const datedBalanceMessages:Record<string,[string,string,string]>={
'Usadas até hoje':['Bis heute genommen','Used through today','Bugüne kadar kullanılan'],
'Saldo por usar':['Noch nicht genommen','Not yet used','Henüz kullanılmamış'],
'Marcadas para o futuro':['Für später geplant','Booked for future dates','Gelecek için planlanan'],
'Livres para marcar':['Noch frei planbar','Free to book','Planlanabilir kalan'],
'Férias livres para marcar':['Frei planbare Urlaubstage','Holiday days free to book','Planlanabilir yıllık izin'],
'Usadas em descanso até hoje':['Bis heute für Freizeitausgleich genutzt','Used for time off through today','Bugüne kadar dinlenme için kullanılan'],
'Horas reservadas':['Reservierte Stunden','Reserved hours','Ayrılmış saatler'],
'Horas livres para marcar':['Frei verfügbare Stunden','Hours free to book','Planlanabilir saatler'],
'Horas livres após marcação':['Freie Stunden nach Buchung','Free hours after booking','Planlama sonrası kalan saatler'],
'Os dias contam como usados a partir da data marcada, no fuso horário do dispositivo. As reservas passam a usadas sem novo desconto.':['Tage zählen ab dem gebuchten Datum in der Gerätezeitzone als genutzt. Reservierungen werden ohne erneuten Abzug zu genutzten Tagen.','Days count as used from the booked date in the device time zone. Reservations become used without a second deduction.','Günler, cihazın saat diliminde planlanan tarihten itibaren kullanılmış sayılır. Ayrılan günler ikinci kez düşülmeden kullanılmışa geçer.'],
'Horas de trabalho futuras só entram no saldo quando a data chegar.':['Zukünftige Arbeitsstunden fließen erst am jeweiligen Datum in den Saldo ein.','Future work hours enter the balance only when their date arrives.','Gelecekteki çalışma saatleri bakiyeye yalnızca tarihleri geldiğinde eklenir.'],
'Os dias futuros reservam horas; o saldo atual só diminui na data marcada. Os registos existentes são mantidos.':['Zukünftige Tage reservieren Stunden; der aktuelle Saldo sinkt erst am gebuchten Datum. Bestehende Einträge bleiben erhalten.','Future days reserve hours; the current balance decreases only on the booked date. Existing records are kept.','Gelecek günler için saat ayrılır; güncel bakiye yalnızca planlanan tarihte azalır. Mevcut kayıtlar korunur.'],
'O saldo atual considera apenas datas até hoje. As horas reservadas para o futuro são apresentadas à parte.':['Der aktuelle Saldo berücksichtigt nur Daten bis heute. Für die Zukunft reservierte Stunden werden separat angezeigt.','The current balance includes dates through today only. Hours reserved for the future are shown separately.','Güncel bakiye yalnızca bugüne kadar olan tarihleri kapsar. Gelecek için ayrılan saatler ayrıca gösterilir.'],
'Este dia desconta {hours}. Horas livres: {balance}. Os dias futuros reservam horas; o saldo atual só diminui na data marcada.':['Dieser Tag benötigt {hours}. Frei verfügbar: {balance}. Zukünftige Tage reservieren Stunden; der aktuelle Saldo sinkt erst am gebuchten Datum.','This day requires {hours}. Available balance: {balance}. Future days reserve hours; the current balance decreases only on the booked date.','Bu gün {hours} gerektirir. Kullanılabilir bakiye: {balance}. Gelecek günler için saat ayrılır; güncel bakiye planlanan tarihte azalır.']
};
for(const [key,[de,en,tr]] of Object.entries(datedBalanceMessages))messages[key]={de,en,tr};

const accountResetMessages:Record<string,[string,string,string]>={
'Férias e horas':['Urlaub und Stunden','Holidays and hours','İzin ve saatler'],
'Configurar férias e saldo inicial':['Urlaub und Anfangssaldo einstellen','Set holiday allowance and initial balance','İzin hakkını ve başlangıç bakiyesini ayarla'],
'Nome da empresa':['Firmenname','Company name','Şirket adı'],
'Recomeçar do zero':['Neu beginnen','Start over','Sıfırdan başla'],
'Repor a app a zero':['App-Daten zurücksetzen','Reset app data','Uygulama verilerini sıfırla'],
'Repor a app a zero?':['App-Daten zurücksetzen?','Reset app data?','Uygulama verileri sıfırlansın mı?'],
'Apagar e recomeçar':['Löschen und neu beginnen','Delete and start over','Sil ve yeniden başla'],
'Apaga os registos, as reservas, os saldos e as definições desta conta. O login mantém-se.':['Löscht Einträge, Reservierungen, Salden und Einstellungen dieses Kontos. Der Zugang bleibt bestehen.','Delete this account’s records, reservations, balances and settings. Your login is retained.','Bu hesabın kayıtlarını, rezervasyonlarını, bakiyelerini ve ayarlarını siler. Giriş hesabın korunur.'],
'Serão apagados todos os turnos, férias, doenças, descansos, saldos, direitos anuais a férias e o nome da empresa. A tua conta de acesso mantém-se. Esta ação não pode ser anulada.':['Alle Schichten, Urlaubs- und Krankheitstage, Freizeitausgleiche, Salden, jährlichen Urlaubsansprüche und der Firmenname werden gelöscht. Dein Zugangskonto bleibt bestehen. Diese Aktion kann nicht rückgängig gemacht werden.','All shifts, holidays, sickness records, time off, balances, annual holiday allowances and the company name will be deleted. Your login account is retained. This cannot be undone.','Tüm vardiyalar, izinler, hastalıklar, dinlenme günleri, bakiyeler, yıllık izin hakları ve şirket adı silinir. Giriş hesabın korunur. Bu işlem geri alınamaz.']
};
for(const [key,[de,en,tr]] of Object.entries(accountResetMessages))messages[key]={de,en,tr};
