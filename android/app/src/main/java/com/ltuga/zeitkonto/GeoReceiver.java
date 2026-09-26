package com.ltuga.zeitkonto;
import android.content.*;
import com.google.android.gms.location.*;
public final class GeoReceiver extends BroadcastReceiver {
    @Override public void onReceive(Context c,Intent intent) {
        String action=intent.getAction();
        if(Intent.ACTION_BOOT_COMPLETED.equals(action)||Intent.ACTION_MY_PACKAGE_REPLACED.equals(action)){
            PendingResult result=goAsync();GeoRuntime.register(c.getApplicationContext(),true,result::finish);return;
        }
        if(GeoRuntime.EVENT.equals(action)){
            GeofencingEvent event=GeofencingEvent.fromIntent(intent);
            if(event==null||event.hasError()){GeoRuntime.uncertain(c);return;}
            if(event.getGeofenceTransition()==Geofence.GEOFENCE_TRANSITION_ENTER ||
               event.getGeofenceTransition()==Geofence.GEOFENCE_TRANSITION_EXIT) GeoRuntime.transition(c,event.getGeofenceTransition()==Geofence.GEOFENCE_TRANSITION_ENTER?1:-1);
        } else if(!GeoRuntime.CHECK.equals(action))return;
        PendingResult result=goAsync();GeoRuntime.check(c.getApplicationContext(),result::finish);
    }
}
