package com.ltuga.zeitkonto;

import android.content.Context;
import android.content.SharedPreferences;

import org.json.JSONArray;
import org.json.JSONObject;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.io.OutputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.nio.charset.StandardCharsets;

/**
 * Minimal native Supabase gateway. Uses only the public publishable key plus the signed-in user's JWT.
 * No service-role or server secret is present in the APK.
 */
public final class SupabaseGateway {
    private static final String SESSION_PREFS = "supabase_session";
    private static final String ACCESS = "access_token";
    private static final String REFRESH = "refresh_token";
    private final Context context;

    public SupabaseGateway(Context context) { this.context = context.getApplicationContext(); }

    public boolean hasSession() { return !prefs().getString(ACCESS, "").isEmpty(); }

    public JSONObject signIn(String email, String password) throws Exception {
        JSONObject body = new JSONObject().put("email", email).put("password", password);
        JSONObject result = request("POST", "/auth/v1/token?grant_type=password", body, false);
        saveSession(result);
        return result;
    }

    public JSONObject signUp(String email, String password) throws Exception {
        JSONObject body = new JSONObject().put("email", email).put("password", password);
        return request("POST", "/auth/v1/signup", body, false);
    }

    public JSONObject refresh() throws Exception {
        String token = prefs().getString(REFRESH, "");
        if (token.isEmpty()) throw new IllegalStateException("No refresh token");
        JSONObject result = request("POST", "/auth/v1/token?grant_type=refresh_token",
            new JSONObject().put("refresh_token", token), false);
        saveSession(result);
        return result;
    }

    public JSONArray get(String path) throws Exception {
        try { return requestArray("GET", path, true); }
        catch (Unauthorized first) { refresh(); return requestArray("GET", path, true); }
    }

    public JSONObject sync(JSONArray changes, String today) throws Exception {
        JSONObject body = new JSONObject().put("p_changes", changes).put("p_today", today);
        try {
            return request("POST", "/rest/v1/rpc/zeitkonto_sync", body, true);
        } catch (Unauthorized first) {
            refresh();
            return request("POST", "/rest/v1/rpc/zeitkonto_sync", body, true);
        }
    }

    public void signOut() {
        try { request("POST", "/auth/v1/logout", new JSONObject(), true); } catch (Exception ignored) {}
        prefs().edit().clear().apply();
    }

    private void saveSession(JSONObject json) {
        String access = json.optString("access_token", "");
        String refresh = json.optString("refresh_token", "");
        if (access.isEmpty()) throw new IllegalStateException("Supabase returned no access token");
        SharedPreferences.Editor e = prefs().edit().putString(ACCESS, access);
        if (!refresh.isEmpty()) e.putString(REFRESH, refresh);
        e.apply();
    }

    private SharedPreferences prefs() { return context.getSharedPreferences(SESSION_PREFS, Context.MODE_PRIVATE); }

    private JSONArray requestArray(String method,String path,boolean authenticated)throws Exception{
        HttpURLConnection c=(HttpURLConnection)new URL(BuildConfig.SUPABASE_URL+path).openConnection();
        c.setRequestMethod(method);c.setConnectTimeout(15000);c.setReadTimeout(20000);
        c.setRequestProperty("apikey",BuildConfig.SUPABASE_PUBLISHABLE_KEY);
        if(authenticated){String token=prefs().getString(ACCESS,"");if(token.isEmpty())throw new Unauthorized();c.setRequestProperty("Authorization","Bearer "+token);}
        int status=c.getResponseCode();BufferedReader reader=new BufferedReader(new InputStreamReader(status>=200&&status<300?c.getInputStream():c.getErrorStream(),StandardCharsets.UTF_8));
        StringBuilder text=new StringBuilder();String line;while((line=reader.readLine())!=null)text.append(line);reader.close();c.disconnect();
        if(status==401)throw new Unauthorized();if(status<200||status>=300)throw new IllegalStateException("Supabase HTTP "+status);
        return new JSONArray(text.toString());
    }

    private JSONObject request(String method, String path, JSONObject body, boolean authenticated) throws Exception {
        HttpURLConnection c = (HttpURLConnection) new URL(BuildConfig.SUPABASE_URL + path).openConnection();
        c.setRequestMethod(method);
        c.setConnectTimeout(15000); c.setReadTimeout(20000);
        c.setRequestProperty("apikey", BuildConfig.SUPABASE_PUBLISHABLE_KEY);
        c.setRequestProperty("Content-Type", "application/json");
        if (authenticated) {
            String token = prefs().getString(ACCESS, "");
            if (token.isEmpty()) throw new Unauthorized();
            c.setRequestProperty("Authorization", "Bearer " + token);
        }
        c.setDoOutput(true);
        byte[] bytes = body.toString().getBytes(StandardCharsets.UTF_8);
        try (OutputStream out = c.getOutputStream()) { out.write(bytes); }
        int status = c.getResponseCode();
        BufferedReader reader = new BufferedReader(new InputStreamReader(
            status >= 200 && status < 300 ? c.getInputStream() : c.getErrorStream(), StandardCharsets.UTF_8));
        StringBuilder text = new StringBuilder(); String line;
        while ((line = reader.readLine()) != null) text.append(line);
        reader.close(); c.disconnect();
        if (status == 401) throw new Unauthorized();
        if (status < 200 || status >= 300) {
            String message = "Supabase HTTP " + status;
            try {
                JSONObject error = new JSONObject(text.toString());
                String detail = error.optString("msg", error.optString("message", error.optString("error_description", "")));
                if (!detail.isEmpty()) message = detail;
            } catch (Exception ignored) {}
            throw new IllegalStateException(message);
        }
        String raw = text.toString().trim();
        return raw.isEmpty() ? new JSONObject() : new JSONObject(raw);
    }

    private static final class Unauthorized extends Exception {}
}
