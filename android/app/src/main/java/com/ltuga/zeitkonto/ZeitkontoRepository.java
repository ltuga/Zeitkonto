package com.ltuga.zeitkonto;

import android.content.Context;

import org.json.JSONArray;
import org.json.JSONObject;

import java.time.LocalDate;

/** Native repository for the standalone Android client. */
public final class ZeitkontoRepository {
    private final SupabaseGateway supabase;

    public ZeitkontoRepository(Context context) { supabase = new SupabaseGateway(context); }

    public boolean isSignedIn() { return supabase.hasSession(); }

    public JSONObject signIn(String email, String password) throws Exception {
        if (email == null || email.trim().isEmpty() || password == null || password.isEmpty())
            throw new IllegalArgumentException("Email and password are required");
        return supabase.signIn(email.trim(), password);
    }

    public JSONObject load() throws Exception {
        return supabase.sync(new JSONArray(), LocalDate.now().toString());
    }

    public JSONObject push(JSONArray changes) throws Exception {
        if (changes == null) changes = new JSONArray();
        return supabase.sync(changes, LocalDate.now().toString());
    }

    public void signOut() { supabase.signOut(); }
}
