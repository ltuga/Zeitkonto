package com.ltuga.zeitkonto;

import android.content.Context;
import android.security.keystore.KeyGenParameterSpec;
import android.security.keystore.KeyProperties;
import android.util.Base64;
import java.security.KeyStore;
import javax.crypto.Cipher;
import javax.crypto.KeyGenerator;
import javax.crypto.SecretKey;
import javax.crypto.spec.GCMParameterSpec;
import org.json.JSONObject;

/** One encrypted, atomic device-local envelope. Backups are disabled by the manifest. */
final class GeoStore {
    private static SecretKey key() throws Exception {
        KeyStore ks = KeyStore.getInstance("AndroidKeyStore"); ks.load(null);
        if (!ks.containsAlias("zeitkonto_geofence")) {
            KeyGenerator g = KeyGenerator.getInstance(KeyProperties.KEY_ALGORITHM_AES, "AndroidKeyStore");
            g.init(new KeyGenParameterSpec.Builder("zeitkonto_geofence", KeyProperties.PURPOSE_ENCRYPT | KeyProperties.PURPOSE_DECRYPT)
                .setBlockModes(KeyProperties.BLOCK_MODE_GCM).setEncryptionPaddings(KeyProperties.ENCRYPTION_PADDING_NONE).build());
            g.generateKey();
        }
        return (SecretKey)ks.getKey("zeitkonto_geofence", null);
    }
    static JSONObject read(Context c) throws Exception {
        String raw = c.getSharedPreferences("geofence", 0).getString("envelope", null);
        if (raw == null) return new JSONObject();
        JSONObject e = new JSONObject(raw);
        Cipher cipher = Cipher.getInstance("AES/GCM/NoPadding");
        cipher.init(Cipher.DECRYPT_MODE, key(), new GCMParameterSpec(128, Base64.decode(e.getString("iv"), Base64.NO_WRAP)));
        return new JSONObject(new String(cipher.doFinal(Base64.decode(e.getString("data"), Base64.NO_WRAP)), java.nio.charset.StandardCharsets.UTF_8));
    }
    static void write(Context c, JSONObject state) throws Exception {
        Cipher cipher = Cipher.getInstance("AES/GCM/NoPadding"); cipher.init(Cipher.ENCRYPT_MODE, key());
        JSONObject e = new JSONObject().put("iv", Base64.encodeToString(cipher.getIV(), Base64.NO_WRAP))
            .put("data", Base64.encodeToString(cipher.doFinal(state.toString().getBytes(java.nio.charset.StandardCharsets.UTF_8)), Base64.NO_WRAP));
        if (!c.getSharedPreferences("geofence", 0).edit().putString("envelope", e.toString()).commit()) throw new Exception("Storage unavailable");
    }
}
