package com.ltuga.zeitkonto;

import android.Manifest;
import android.annotation.SuppressLint;
import android.app.*;
import android.content.*;
import android.content.pm.PackageManager;
import android.net.Uri;
import android.os.Build;
import android.provider.Settings;
import android.webkit.WebView;
import androidx.webkit.*;
import com.google.android.gms.location.*;
import com.google.android.gms.tasks.CancellationTokenSource;
import org.json.*;
import java.util.Collections;

final class GeoBridge {
    interface Gate { boolean unlocked(); }
    static void install(Activity activity, WebView web, Gate gate) {
        if(!WebViewFeature.isFeatureSupported(WebViewFeature.WEB_MESSAGE_LISTENER))return;
        WebViewCompat.addWebMessageListener(web,"ZeitkontoLocation",Collections.singleton("https://meu-tempo-luis.ltugamatos.chatgpt.site"),
            (view,message,origin,main,reply) -> {
                if(!main || !gate.unlocked() || !NavigationPolicy.trusted(view.getUrl()))return;
                String requestId="";
                try {
                    String raw=message.getData();
                    if(raw==null||raw.length()>80000)throw new Exception();
                    JSONObject req=new JSONObject(raw);requestId=req.getString("requestId");
                    if(requestId.length()>80)throw new Exception();
                    String command=req.getString("command");
                    if(command.equals("permissions")) { permissions(activity);respond(reply,requestId,new JSONObject());return; }
                    if(command.equals("locate")) {locate(activity,web,gate,reply,requestId);return;}
                    JSONObject result=command(activity,req);
                    respond(reply,requestId,result);
                } catch(Exception e) {
                    try {reply.postMessage(new JSONObject().put("requestId",requestId).put("error","Verifica as permissões e os registos pendentes.").toString());}catch(Exception ignored){}
                }
            });
    }
    static void respond(JavaScriptReplyProxy reply,String id,JSONObject result) throws JSONException {
        if(WebViewFeature.isFeatureSupported(WebViewFeature.WEB_MESSAGE_LISTENER))
            reply.postMessage(new JSONObject().put("requestId",id).put("result",result).toString());
    }
    static synchronized JSONObject command(Context c,JSONObject req) throws Exception {
        String command=req.getString("command"),owner=req.optString("owner");
        JSONObject s=GeoStore.read(c);
        if(command.equals("suspend")){
            GeoRuntime.stop(c);s.put("registered",false);
            if(s.optJSONObject("config")!=null)s.getJSONObject("config").put("mode","off");
            s.remove("candidate");s.remove("since");s.remove("proposal");GeoStore.write(c,s);
            return new JSONObject();
        }
        if(!owner.matches("[a-zA-Z0-9-]{1,100}"))throw new Exception();
        if(command.equals("forget")){
            if(!s.optString("owner",owner).equals(owner))throw new Exception();
            GeoRuntime.stop(c);GeoStore.write(c,new JSONObject());return new JSONObject();
        }
        if(!s.optString("owner",owner).equals(owner)) {
            // Never return the previous account's data to a new account.
            GeoRuntime.stop(c);
            s.put("registered",false);
            if(s.optJSONObject("config")!=null)s.getJSONObject("config").put("mode","off");
            GeoStore.write(c,s);
            if(s.optJSONArray("events")!=null&&s.getJSONArray("events").length()>0)throw new Exception();
            s=new JSONObject();
        }
        s.put("owner",owner);
        JSONArray events=s.optJSONArray("events");if(events==null)events=new JSONArray();
        switch(command) {
            case "status": break;
            case "logout":
                if(events.length()>0)throw new Exception();
                GeoRuntime.stop(c);GeoStore.write(c,new JSONObject());return new JSONObject();
            case "ack":
                JSONArray ids=req.getJSONArray("ids"),left=new JSONArray();
                for(int i=0;i<events.length();i++){JSONObject event=events.getJSONObject(i);boolean found=false;
                    for(int j=0;j<ids.length();j++)if(ids.getString(j).equals(event.getString("id")))found=true;
                    if(!found)left.put(event);}
                s.put("events",left);break;
            case "sync":
                s.put("lang",req.optString("lang","pt"));
                int target=req.getInt("dailyMinutes"),pause=req.getInt("includedPause");
                if(target<15||target>1440||(pause!=0&&pause!=30))throw new Exception();
                s.put("dailyMinutes",target).put("includedPause",pause);
                JSONArray windows=req.optJSONArray("windows");
                if(windows!=null&&windows.length()<=1500)s.put("windows",windows);
                if(events.length()==0){
                    JSONObject active=req.optJSONObject("active"),old=s.optJSONObject("active");
                    if(active!=null){
                        long start=active.getLong("start");
                        if(start<=0||start>System.currentTimeMillis()+300000)throw new Exception();
                    }
                    if((old==null?0:old.optLong("start"))!=(active==null?0:active.optLong("start"))){
                        s.remove("candidate");s.remove("since");s.remove("proposal");
                        c.getSystemService(NotificationManager.class).cancel(GeoRuntime.NOTICE);
                    }
                    s.put("active",active);
                } break;
            case "configure":
                JSONObject cfg=req.getJSONObject("config");validate(cfg);
                s.put("config",cfg).put("registered",false);s.remove("candidate");s.remove("since");s.remove("proposal");
                GeoStore.write(c,s);GeoRuntime.stop(c);GeoRuntime.register(c,false);
                return new JSONObject().put("configured",true);
            default: throw new Exception();
        }
        GeoStore.write(c,s);
        return new JSONObject().put("config",s.optJSONObject("config")).put("events",s.optJSONArray("events")==null?new JSONArray():s.getJSONArray("events"))
            .put("active",permissions(c,s)).put("permissions",GeoRuntime.permissions(c));
    }
    private static boolean permissions(Context c,JSONObject s){
        return GeoRuntime.permissions(c)&&s.optBoolean("registered")&&s.optJSONObject("config")!=null&&!s.optJSONObject("config").optString("mode","off").equals("off");
    }
    static void validate(JSONObject cfg) throws Exception {
        String mode=cfg.getString("mode");
        if(!mode.equals("off")&&!mode.equals("semi")&&!mode.equals("auto"))throw new Exception();
        double lat=cfg.getDouble("latitude"),lon=cfg.getDouble("longitude");
        if(!Double.isFinite(lat)||!Double.isFinite(lon)||Math.abs(lat)>85||Math.abs(lon)>180)throw new Exception();
        int radius=cfg.getInt("radius"),entry=cfg.getInt("arrivalMinutes"),exit=cfg.getInt("exitMinutes");
        if(radius!=100&&radius!=150&&radius!=200&&radius!=300&&radius!=500)throw new Exception();
        if(entry<2||entry>30 ||(exit!=10&&exit!=15&&exit!=20&&exit!=30))throw new Exception();
        JSONArray days=cfg.getJSONArray("days");if(days.length()>7)throw new Exception();
        for(int i=0;i<days.length();i++)if(days.getInt(i)<0||days.getInt(i)>6)throw new Exception();
        for(String field:new String[]{"usualStart","usualEnd"}){
            String clock=cfg.optString(field);
            if(!clock.isEmpty()&&!clock.matches("([01][0-9]|2[0-3]):[0-5][0-9]"))throw new Exception();
        }
        // Reconstruct a strict allowlist: never accept arbitrary metadata or paths.
        java.util.Iterator<String> keys=cfg.keys();
        while(keys.hasNext())if(!java.util.Set.of("mode","latitude","longitude","radius","arrivalMinutes","exitMinutes","days","usualStart","usualEnd").contains(keys.next()))throw new Exception();
    }
    static void permissions(Activity a) {
        android.content.SharedPreferences prefs=a.getSharedPreferences("device_security",Context.MODE_PRIVATE);
        if(!prefs.getBoolean("location_disclosure_v1",false)){
            JSONObject locale=new JSONObject();try{locale=GeoStore.read(a);}catch(Exception ignored){}
            new AlertDialog.Builder(a).setTitle("Zeitkonto")
                .setMessage(GeoRuntime.text(locale,
                    "A Zeitkonto utiliza localização precisa, incluindo em segundo plano e com a app fechada, para detetar a chegada e saída do trabalho e propor ou criar registos. É opcional e pode ser desativado nas Definições. Não guardamos um histórico de percursos.",
                    "Zeitkonto nutzt den präzisen Standort auch im Hintergrund und bei geschlossener App, um Ankunft und Abfahrt zu erkennen und Einträge vorzuschlagen oder zu erstellen. Optional und in den Einstellungen abschaltbar. Kein Bewegungsverlauf wird gespeichert.",
                    "Zeitkonto uses precise location, including in the background and when closed, to detect arrival and departure and suggest or create work entries. This is optional and can be disabled in Settings. No route history is stored.",
                    "Zeitkonto, işe varış ve ayrılışı algılayıp kayıt önermek veya oluşturmak için arka planda ve kapalıyken kesin konumu kullanır. İsteğe bağlıdır ve Ayarlar'dan kapatılabilir. Güzergâh geçmişi saklanmaz."))
                .setNegativeButton(android.R.string.cancel,null)
                .setPositiveButton(android.R.string.ok,(d,w)->{prefs.edit().putBoolean("location_disclosure_v1",true).apply();permissions(a);}).show();
            return;
        }
        if(a.checkSelfPermission(Manifest.permission.ACCESS_FINE_LOCATION)!=PackageManager.PERMISSION_GRANTED){
            a.requestPermissions(new String[]{Manifest.permission.ACCESS_FINE_LOCATION,Manifest.permission.ACCESS_COARSE_LOCATION},861);return;
        }
        if(Build.VERSION.SDK_INT>=33 && a.checkSelfPermission(Manifest.permission.POST_NOTIFICATIONS)!=PackageManager.PERMISSION_GRANTED){
            a.requestPermissions(new String[]{Manifest.permission.POST_NOTIFICATIONS},862);return;
        }
        JSONObject locale=new JSONObject();
        try{locale=GeoStore.read(a);}catch(Exception ignored){}
        new AlertDialog.Builder(a).setTitle("Zeitkonto")
            .setMessage(GeoRuntime.text(locale,
                "Para detetar a chegada e a saída mesmo com a app fechada, permite localização precisa em “Permitir sempre” e notificações. Não é guardado um histórico dos teus percursos.",
                "Für die Erkennung bei geschlossener App präzisen Standort, „Immer zulassen“ und Benachrichtigungen erlauben. Es wird kein Bewegungsverlauf gespeichert.",
                "To detect arrival and departure with the app closed, allow precise location, “Allow all the time” and notifications. No route history is stored.",
                "Uygulama kapalıyken algılama için kesin konum, “Her zaman izin ver” ve bildirimlere izin ver. Güzergâh geçmişi saklanmaz."))
            .setNegativeButton(android.R.string.cancel,null)
            .setPositiveButton(android.R.string.ok,(d,w)->a.startActivity(new Intent(Settings.ACTION_APPLICATION_DETAILS_SETTINGS,Uri.parse("package:"+a.getPackageName())))).show();
    }
    @SuppressLint("MissingPermission")
    static void locate(Activity a,WebView web,Gate gate,JavaScriptReplyProxy reply,String id) throws Exception {
        if(a.checkSelfPermission(Manifest.permission.ACCESS_FINE_LOCATION)!=PackageManager.PERMISSION_GRANTED){permissions(a);throw new Exception();}
        LocationServices.getFusedLocationProviderClient(a).getCurrentLocation(new CurrentLocationRequest.Builder()
            .setPriority(Priority.PRIORITY_HIGH_ACCURACY).setDurationMillis(8000).setMaxUpdateAgeMillis(0).build(),new CancellationTokenSource().getToken())
            .addOnCompleteListener(task->{try{
                // Location may arrive after backgrounding, locking or navigation.
                if(a.isFinishing() || a.isDestroyed() || !gate.unlocked() || !NavigationPolicy.trusted(web.getUrl()))return;
                if(!task.isSuccessful()||task.getResult()==null||task.getResult().getAccuracy()>75) {
                    if(WebViewFeature.isFeatureSupported(WebViewFeature.WEB_MESSAGE_LISTENER))reply.postMessage(new JSONObject().put("requestId",id).put("error","Localização indisponível ou imprecisa.").toString());return;}
                respond(reply,id,new JSONObject().put("latitude",task.getResult().getLatitude()).put("longitude",task.getResult().getLongitude()));
            }catch(Exception ignored){}});
    }
}
