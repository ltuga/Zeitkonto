package com.ltuga.zeitkonto;

import android.Manifest;
import android.annotation.SuppressLint;
import android.app.*;
import android.content.*;
import android.content.pm.PackageManager;
import android.location.Location;
import android.os.Build;
import android.os.SystemClock;
import com.google.android.gms.location.*;
import com.google.android.gms.tasks.CancellationTokenSource;
import org.json.*;
import java.util.UUID;

final class GeoRuntime {
    static final String CHECK = "com.ltuga.zeitkonto.GEO_CHECK";
    static final String EVENT = "com.ltuga.zeitkonto.GEO_EVENT";
    static final int NOTICE = 840;
    static final String CHANNEL = "work_detection";
    static boolean permissions(Context c) {
        return c.checkSelfPermission(Manifest.permission.ACCESS_FINE_LOCATION) == PackageManager.PERMISSION_GRANTED
            && c.checkSelfPermission(Manifest.permission.ACCESS_BACKGROUND_LOCATION) == PackageManager.PERMISSION_GRANTED
            && (Build.VERSION.SDK_INT < 33 || c.checkSelfPermission(Manifest.permission.POST_NOTIFICATIONS) == PackageManager.PERMISSION_GRANTED)
            && c.getSystemService(NotificationManager.class).areNotificationsEnabled()
            && c.getSystemService(android.location.LocationManager.class).isLocationEnabled()
            && (c.getSystemService(NotificationManager.class).getNotificationChannel(CHANNEL)==null ||
                c.getSystemService(NotificationManager.class).getNotificationChannel(CHANNEL).getImportance()!=NotificationManager.IMPORTANCE_NONE);
    }
    static PendingIntent alarm(Context c) {
        return PendingIntent.getBroadcast(c, 831, new Intent(c, GeoReceiver.class).setAction(CHECK), PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);
    }
    static PendingIntent geofence(Context c) {
        // Play services must populate the explicit broadcast with transition information.
        return PendingIntent.getBroadcast(c, 832, new Intent(c, GeoReceiver.class).setAction(EVENT), PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_MUTABLE);
    }
    static synchronized void stop(Context c) {
        LocationServices.getGeofencingClient(c).removeGeofences(geofence(c));
        c.getSystemService(AlarmManager.class).cancel(alarm(c));
        c.getSystemService(NotificationManager.class).cancel(NOTICE);
    }
    static void schedule(Context c, long delay) {
        c.getSystemService(AlarmManager.class).setAndAllowWhileIdle(AlarmManager.ELAPSED_REALTIME_WAKEUP,
            SystemClock.elapsedRealtime() + Math.max(60000, delay), alarm(c));
    }
    static void register(Context c, boolean reboot) { register(c,reboot,()->{}); }
    @SuppressLint("MissingPermission")
    static synchronized void register(Context c, boolean reboot, Runnable done) {
        try {
            JSONObject s = GeoStore.read(c), cfg = s.optJSONObject("config");
            if (reboot) { s.remove("candidate"); s.remove("since"); s.remove("proposal"); s.put("registered", false); GeoStore.write(c,s); }
            if (cfg == null || cfg.optString("mode","off").equals("off") || !permissions(c)) { stop(c); done.run(); return; }
            String signature = cfg.toString();
            Geofence fence = new Geofence.Builder().setRequestId("zeitkonto-work")
                .setCircularRegion(cfg.getDouble("latitude"),cfg.getDouble("longitude"),cfg.getInt("radius"))
                .setTransitionTypes(Geofence.GEOFENCE_TRANSITION_ENTER | Geofence.GEOFENCE_TRANSITION_EXIT | Geofence.GEOFENCE_TRANSITION_DWELL)
                .setLoiteringDelay(cfg.getInt("arrivalMinutes") * 60000).setNotificationResponsiveness(120000)
                .setExpirationDuration(Geofence.NEVER_EXPIRE).build();
            LocationServices.getGeofencingClient(c).addGeofences(new GeofencingRequest.Builder()
                .setInitialTrigger(GeofencingRequest.INITIAL_TRIGGER_ENTER).addGeofence(fence).build(),geofence(c))
                .addOnSuccessListener(v -> registered(c,signature,true))
                .addOnFailureListener(e -> registered(c,signature,false))
                .addOnCompleteListener(task -> done.run());
        } catch (Exception ignored) { stop(c); done.run(); }
    }
    static synchronized void registered(Context c,String signature,boolean ok) {
        try { JSONObject s=GeoStore.read(c); if(s.optJSONObject("config")!=null && s.getJSONObject("config").toString().equals(signature)) {
            s.put("registered",ok); GeoStore.write(c,s); if(ok)schedule(c,60000);
        }} catch(Exception ignored) { /* Fail closed; UI will not claim detection is active. */ }
    }
    @SuppressLint("MissingPermission")
    static void check(Context c, Runnable done) {
        if (!permissions(c)) { stop(c); done.run(); return; }
        try {
            JSONObject s=GeoStore.read(c);
            if(s.optJSONObject("config")==null || s.getJSONObject("config").optString("mode","off").equals("off")) {done.run();return;}
            String owner=s.optString("owner"), signature=s.getJSONObject("config").toString();
            CancellationTokenSource token=new CancellationTokenSource();
            LocationServices.getFusedLocationProviderClient(c).getCurrentLocation(
                new CurrentLocationRequest.Builder().setPriority(Priority.PRIORITY_BALANCED_POWER_ACCURACY)
                    .setMaxUpdateAgeMillis(30000).setDurationMillis(8000).build(),token.getToken())
                .addOnCompleteListener(task -> { try {
                    if(task.isSuccessful() && task.getResult()!=null) sample(c,owner,signature,task.getResult());
                    else retry(c);
                } finally {done.run();}});
        } catch(Exception ignored) { done.run(); }
    }
    static synchronized void retry(Context c) {
        uncertain(c);
        try { JSONObject s=GeoStore.read(c);int count=s.optInt("retries")+1;s.put("retries",count);GeoStore.write(c,s);
            if(count<=3)schedule(c,300000);
        }catch(Exception ignored){}
    }
    static synchronized void transition(Context c,int direction) {
        try {JSONObject s=GeoStore.read(c);if(s.optInt("candidate")!=direction)uncertain(c);
            s=GeoStore.read(c);s.put("retries",0);GeoStore.write(c,s);
        }catch(Exception ignored){}
    }
    static synchronized void uncertain(Context c) {
        try { JSONObject s=GeoStore.read(c);s.remove("candidate");s.remove("since");s.remove("proposal");GeoStore.write(c,s);
            c.getSystemService(NotificationManager.class).cancel(NOTICE);
        }catch(Exception ignored){}
    }
    static synchronized void sample(Context c,String owner,String signature,Location l) {
        try {
            JSONObject s=GeoStore.read(c), cfg=s.optJSONObject("config");
            if(cfg==null || !owner.equals(s.optString("owner")) || !signature.equals(cfg.toString()) || !permissions(c))return;
            if(l.isFromMockProvider() || !l.hasAccuracy() || SystemClock.elapsedRealtimeNanos()-l.getElapsedRealtimeNanos()>60000000000L) {uncertain(c);return;}
            float[] distance=new float[1];Location.distanceBetween(l.getLatitude(),l.getLongitude(),cfg.getDouble("latitude"),cfg.getDouble("longitude"),distance);
            double radius=cfg.getInt("radius"),acc=l.getAccuracy();
            if(acc>Math.min(75,radius/2) || !(distance[0]+acc<=radius || distance[0]-acc>=radius+25)){retry(c);return;}
            s.put("retries",0);
            long now=System.currentTimeMillis();
            GeoEngine e=new GeoEngine();e.candidate=s.optInt("candidate");e.since=s.optLong("since");e.lastAction=s.optLong("lastAction");
            long arrival=cfg.getInt("arrivalMinutes")*60000L;
            // Habits are confidence hints, never a hard gate. Outside them require 2 extra minutes.
            java.util.Calendar calendar=java.util.Calendar.getInstance();
            JSONArray days=cfg.getJSONArray("days");boolean usual=false;
            for(int i=0;i<days.length();i++)if(days.getInt(i)==calendar.get(java.util.Calendar.DAY_OF_WEEK)-1)usual=true;
            boolean nearShift=false;JSONArray windows=s.optJSONArray("windows");
            if(windows!=null)for(int i=0;i<windows.length();i++)if(Math.abs(now-windows.getLong(i))<=4*3600000L)nearShift=true;
            String start=cfg.optString("usualStart");
            if(!start.isEmpty()){int clock=calendar.get(java.util.Calendar.HOUR_OF_DAY)*60+calendar.get(java.util.Calendar.MINUTE);
                int target=Integer.parseInt(start.substring(0,2))*60+Integer.parseInt(start.substring(3));
                int diff=Math.abs(clock-target);usual=usual && Math.min(diff,1440-diff)<=240;}
            if(!usual && !nearShift)arrival+=120000;
            long exitDelay=cfg.getInt("exitMinutes")*60000L;
            String finish=cfg.optString("usualEnd");
            if(!finish.isEmpty()){
                int clock=calendar.get(java.util.Calendar.HOUR_OF_DAY)*60+calendar.get(java.util.Calendar.MINUTE);
                int target=Integer.parseInt(finish.substring(0,2))*60+Integer.parseInt(finish.substring(3));
                int diff=Math.abs(clock-target);if(Math.min(diff,1440-diff)>120)exitDelay+=120000;
            }
            int action=e.sample(!cfg.optString("mode","off").equals("off"),s.optJSONObject("active")!=null,
                distance[0],l.getAccuracy(),cfg.getInt("radius"),now,arrival,exitDelay);
            s.put("candidate",e.candidate).put("since",e.since);
            JSONObject proposal=s.optJSONObject("proposal");
            if(e.candidate==0 || (proposal!=null && proposal.optInt("direction")!=e.candidate)) {
                s.remove("proposal"); c.getSystemService(NotificationManager.class).cancel(NOTICE);
            }
            if(action!=0 && s.optJSONObject("proposal")==null) {
                JSONObject p=new JSONObject().put("id",UUID.randomUUID().toString()).put("direction",action).put("at",e.since)
                    .put("created",now).put("activeStart",s.optJSONObject("active")==null?0:s.getJSONObject("active").optLong("start"));
                s.put("proposal",p);GeoStore.write(c,s);
                if(cfg.getString("mode").equals("auto")) accept(c,p.getString("id"),true);
                else notify(c,s,p,false);
            } else {
                GeoStore.write(c,s);
                if(e.candidate!=0 && s.optJSONObject("proposal")==null)schedule(c,Math.max(60000,(e.candidate==1?arrival:exitDelay)-(now-e.since)));
            }
        }catch(Exception ignored){uncertain(c);}
    }
    static synchronized void accept(Context c,String id,boolean confirmed) {
        try {
            JSONObject s=GeoStore.read(c),p=s.optJSONObject("proposal"),cfg=s.optJSONObject("config");
            if(p==null||!p.optString("id").equals(id)||cfg==null||cfg.optString("mode","off").equals("off")||!permissions(c))return;
            long now=System.currentTimeMillis();JSONObject active=s.optJSONObject("active");
            if(now-p.getLong("created")>7200000 || p.optInt("direction")!=s.optInt("candidate")
                || (active==null?0:active.optLong("start"))!=p.optLong("activeStart"))confirmed=false;
            if(confirmed) {
                JSONArray queue=s.optJSONArray("events");if(queue==null)queue=new JSONArray();
                if(queue.length()>=500) {s.put("registered",false);GeoStore.write(c,s);stop(c);return;}
                String origin=cfg.getString("mode").equals("auto")?"geofence_automatico":"geofence_semiautomatico";
                JSONObject event=new JSONObject().put("id",p.getString("id")).put("at",p.getLong("at"))
                    .put("origin",origin).put("type",p.getInt("direction")==1?"entry":"exit").put("activeStart",p.optLong("activeStart"));
                if(p.getInt("direction")==1 && active==null) {
                    active=new JSONObject().put("start",p.getLong("at")).put("targetMinutes",s.optInt("dailyMinutes",480))
                        .put("includedPause",s.optInt("includedPause",30)).put("paused",0).put("pauseStart",JSONObject.NULL)
                        .put("origin",origin).put("geoId",p.getString("id"));
                    event.put("active",active);s.put("active",active);
                } else if(p.getInt("direction")==-1 && active!=null) {
                    if(p.getLong("at")<=active.getLong("start") || p.getLong("at")-active.getLong("start")>=86400000L)confirmed=false;
                    else {event.put("active",active);s.remove("active");}
                } else confirmed=false;
                if(confirmed){queue.put(event);s.put("events",queue);}
            }
            s.remove("proposal");s.remove("candidate");s.remove("since");s.put("lastAction",now);GeoStore.write(c,s);
            c.getSystemService(NotificationManager.class).cancel(NOTICE);
            if(confirmed)notify(c,s,p,true);
        }catch(Exception ignored){ /* No confirmation on persistence failure. */ }
    }
    static String text(JSONObject s,String pt,String de,String en,String tr) {
        switch(s.optString("lang","pt")){case "de":return de;case "en":return en;case "tr":return tr;default:return pt;}
    }
    static void notify(Context c,JSONObject s,JSONObject p,boolean saved) throws Exception {
        NotificationManager nm=c.getSystemService(NotificationManager.class);
        nm.createNotificationChannel(new NotificationChannel(CHANNEL,"Zeitkonto",NotificationManager.IMPORTANCE_DEFAULT));
        String time=new java.text.SimpleDateFormat("HH:mm",java.util.Locale.ROOT).format(new java.util.Date(p.getLong("at")));
        boolean entry=p.getInt("direction")==1;
        String body=saved?text(s,"Registo guardado no telemóvel às ","Auf dem Telefon gespeichert um ","Saved on this phone at ","Telefona kaydedildi: ")+time
            :(entry?text(s,"Chegaste ao trabalho. Registar entrada às ","Am Arbeitsplatz. Kommen buchen um ","You arrived at work. Clock in at ","İş yerine geldin. Giriş: ")
            :text(s,"Saíste do trabalho. Registar saída às ","Arbeitsplatz verlassen. Gehen buchen um ","You left work. Clock out at ","İş yerinden ayrıldın. Çıkış: "))+time+"?";
        Notification.Builder b=new Notification.Builder(c,CHANNEL).setSmallIcon(R.drawable.ic_geo_notification)
            .setContentTitle("Zeitkonto").setContentText(body).setStyle(new Notification.BigTextStyle().bigText(body))
            .setVisibility(Notification.VISIBILITY_PRIVATE).setAutoCancel(true)
            .setContentIntent(PendingIntent.getActivity(c,839,new Intent(c,MainActivity.class),PendingIntent.FLAG_UPDATE_CURRENT|PendingIntent.FLAG_IMMUTABLE));
        if(!saved)for(boolean yes:new boolean[]{true,false}) {
            Intent intent=new Intent(c,GeoActionReceiver.class).setAction(yes?"confirm":"ignore").putExtra("id",p.getString("id"));
            PendingIntent action=PendingIntent.getBroadcast(c,yes?841:842,intent,PendingIntent.FLAG_UPDATE_CURRENT|PendingIntent.FLAG_IMMUTABLE);
            b.addAction(new Notification.Action.Builder(null,yes?text(s,"Confirmar","Bestätigen","Confirm","Onayla"):text(s,"Ignorar","Ignorieren","Ignore","Yoksay"),action).build());
        }
        nm.notify(saved?NOTICE+1:NOTICE,b.build());
    }
}
