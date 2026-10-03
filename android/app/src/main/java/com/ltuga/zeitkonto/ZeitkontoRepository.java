package com.ltuga.zeitkonto;

import android.content.Context;
import org.json.JSONArray;
import org.json.JSONObject;
import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

/** Native repository for the standalone Android client. */
public final class ZeitkontoRepository {
    private final SupabaseGateway supabase;
    public ZeitkontoRepository(Context context) { supabase = new SupabaseGateway(context); }
    public boolean isSignedIn() { return supabase.hasSession(); }
    public JSONObject signIn(String email,String password)throws Exception{
        if(email==null||email.trim().isEmpty()||password==null||password.isEmpty())throw new IllegalArgumentException();
        return supabase.signIn(email.trim(),password);
    }
    public JSONObject load()throws Exception{return supabase.sync(new JSONArray(),LocalDate.now().toString());}
    public JSONObject push(JSONArray changes)throws Exception{return supabase.sync(changes==null?new JSONArray():changes,LocalDate.now().toString());}

    public JSONObject saveWork(String id,String date,String start,String end,int pause)throws Exception{
        if(id==null||id.isEmpty())id=UUID.randomUUID().toString();
        int worked=minutesBetween(start,end)-pause;
        int target=480, delta=worked-target+Math.min(pause,30);
        JSONObject value=new JSONObject().put("id",id).put("date",date).put("kind","work")
            .put("start",start).put("end",end).put("pause",pause).put("includedPause",30)
            .put("targetMinutes",target).put("delta",delta).put("note","").put("origin","android_native");
        JSONObject change=new JSONObject().put("entity","entry").put("id",id).put("value",value)
            .put("mutation_id",UUID.randomUUID().toString()).put("updated_at",Instant.now().toString());
        return push(new JSONArray().put(change));
    }
    public JSONObject saveAbsence(String date,String kind,String mode,int minutes)throws Exception{
        String id=UUID.randomUUID().toString();
        JSONObject value=new JSONObject().put("id",id).put("date",date).put("kind",kind).put("targetMinutes",480);
        if("holiday".equals(kind)){
            value.put("holidayMode",mode);
            if("hours".equals(mode))value.put("holidayMinutes",minutes);
        }
        JSONObject change=new JSONObject().put("entity","entry").put("id",id).put("value",value)
            .put("mutation_id",UUID.randomUUID().toString()).put("updated_at",Instant.now().toString());
        return push(new JSONArray().put(change));
    }

    private int minutesBetween(String start,String end){
        String[] a=start.split(":"),b=end.split(":");
        int x=Integer.parseInt(a[0])*60+Integer.parseInt(a[1]), y=Integer.parseInt(b[0])*60+Integer.parseInt(b[1]);
        if(y<x)y+=1440; return y-x;
    }
    public JSONArray entries(JSONObject sync){
        JSONArray rows=sync.optJSONArray("rows"),out=new JSONArray(); if(rows==null)return out;
        for(int i=0;i<rows.length();i++){JSONObject r=rows.optJSONObject(i); if(r==null||!"entry".equals(r.optString("entity"))||!r.isNull("deleted_at"))continue;
            JSONObject v=r.optJSONObject("value"); if(v!=null&&"work".equals(v.optString("kind")))out.put(v);}
        return out;
    }
    public void signOut(){supabase.signOut();}
}
