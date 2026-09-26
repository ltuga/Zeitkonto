package com.ltuga.zeitkonto;
import android.content.*;
public final class GeoActionReceiver extends BroadcastReceiver {
    @Override public void onReceive(Context c,Intent i){
        GeoRuntime.accept(c,i.getStringExtra("id"),"confirm".equals(i.getAction()));
    }
}
