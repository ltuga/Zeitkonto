package com.ltuga.zeitkonto;

import android.app.Activity;
import android.app.AlertDialog;
import android.content.SharedPreferences;
import android.graphics.Color;
import android.hardware.biometrics.BiometricManager;
import android.hardware.biometrics.BiometricPrompt;
import android.os.Bundle;
import android.os.CancellationSignal;
import android.os.SystemClock;
import android.text.InputType;
import android.view.Gravity;
import android.view.View;
import android.view.WindowManager;
import android.widget.Button;
import android.widget.EditText;
import android.widget.LinearLayout;
import android.widget.TextView;
import android.widget.Toast;

import org.json.JSONObject;

public class MainActivity extends Activity {
    private static final int AUTH = BiometricManager.Authenticators.BIOMETRIC_STRONG | BiometricManager.Authenticators.DEVICE_CREDENTIAL;
    private SharedPreferences prefs;
    private ZeitkontoRepository repo;
    private LinearLayout root, login;
    private TextView status, summary;
    private EditText email, password;
    private Button signIn, sync, signOut, lock, addWork;
    private boolean unlocked = true, authenticating;
    private CancellationSignal cancellation;
    private long lastBack;

    @Override public void onCreate(Bundle state) {
        super.onCreate(state);
        getWindow().addFlags(WindowManager.LayoutParams.FLAG_SECURE);
        prefs = getSharedPreferences("device_security", MODE_PRIVATE);
        repo = new ZeitkontoRepository(this);
        buildUi();
        if (prefs.getBoolean("lock", false)) { unlocked = false; authenticate(false); }
        else refreshUi();
    }

    private TextView text(String value, float size) {
        TextView v = new TextView(this); v.setText(value); v.setTextSize(size); v.setTextColor(Color.WHITE); v.setPadding(0, dp(8), 0, dp(8)); return v;
    }
    private int dp(int n) { return Math.round(n * getResources().getDisplayMetrics().density); }

    private void buildUi() {
        root = new LinearLayout(this); root.setOrientation(LinearLayout.VERTICAL); root.setPadding(dp(24), dp(24), dp(24), dp(24)); root.setBackgroundColor(Color.rgb(16,43,82));
        TextView title=text("Zeitkonto",28); title.setGravity(Gravity.CENTER_HORIZONTAL); root.addView(title);
        status=text("",17); status.setGravity(Gravity.CENTER_HORIZONTAL); root.addView(status);
        summary=text("",15); root.addView(summary);

        login=new LinearLayout(this); login.setOrientation(LinearLayout.VERTICAL);
        email=new EditText(this); email.setHint(R.string.email); email.setInputType(InputType.TYPE_CLASS_TEXT|InputType.TYPE_TEXT_VARIATION_EMAIL_ADDRESS); email.setSingleLine(true); login.addView(email);
        password=new EditText(this); password.setHint(R.string.password); password.setInputType(InputType.TYPE_CLASS_TEXT|InputType.TYPE_TEXT_VARIATION_PASSWORD); password.setSingleLine(true); login.addView(password);
        signIn=new Button(this); signIn.setText(R.string.sign_in); signIn.setOnClickListener(v->doSignIn()); login.addView(signIn); root.addView(login);

        sync=new Button(this); sync.setText(R.string.sync); sync.setOnClickListener(v->doSync()); root.addView(sync);
        addWork=new Button(this); addWork.setText("＋ Registar trabalho"); addWork.setOnClickListener(v->workDialog()); root.addView(addWork);
        signOut=new Button(this); signOut.setText(R.string.sign_out); signOut.setOnClickListener(v->confirmSignOut()); root.addView(signOut);
        lock=new Button(this); lock.setText(R.string.device_lock); lock.setOnClickListener(v->toggleLock()); root.addView(lock);
        Button about=new Button(this); about.setText(R.string.about); about.setOnClickListener(v->new AlertDialog.Builder(this).setTitle("Zeitkonto 0.3.0").setMessage(R.string.about_text).setPositiveButton(android.R.string.ok,null).show()); root.addView(about);
        setContentView(root);
    }

    private void refreshUi() {
        if (!unlocked) { root.setVisibility(View.INVISIBLE); return; }
        root.setVisibility(View.VISIBLE);
        boolean signed=repo.isSignedIn();
        login.setVisibility(signed?View.GONE:View.VISIBLE);
        sync.setVisibility(signed?View.VISIBLE:View.GONE);
        signOut.setVisibility(signed?View.VISIBLE:View.GONE); addWork.setVisibility(signed?View.VISIBLE:View.GONE);
        status.setText(signed?R.string.signed_in:R.string.signed_out);
        if (!signed) summary.setText("");
    }

    private void busy(boolean value) {
        signIn.setEnabled(!value); sync.setEnabled(!value); signOut.setEnabled(!value);
        if (value) status.setText(R.string.syncing);
    }

    private void doSignIn() {
        final String e=email.getText().toString(), p=password.getText().toString();
        busy(true);
        new Thread(()->{
            try { repo.signIn(e,p); runOnUiThread(()->{ password.setText(""); refreshUi(); doSync(); }); }
            catch(Exception ex){ runOnUiThread(()->{ busy(false); status.setText(R.string.login_error); }); }
        }).start();
    }

    private void doSync() {
        busy(true);
        new Thread(()->{
            try {
                JSONObject data=repo.load();
                String info=describe(data);
                runOnUiThread(()->{ busy(false); status.setText(R.string.sync_ok); summary.setText(info); refreshUi(); });
            } catch(Exception ex) { runOnUiThread(()->{ busy(false); status.setText(R.string.sync_error); }); }
        }).start();
    }

    private String describe(JSONObject data) {
        org.json.JSONArray entries=repo.entries(data);
        if(entries.length()>0){
            StringBuilder recent=new StringBuilder("Registos de trabalho: ").append(entries.length());
            int shown=Math.min(5,entries.length());
            for(int j=entries.length()-1;j>=Math.max(0,entries.length()-shown);j--){JSONObject e=entries.optJSONObject(j);if(e!=null)recent.append("\n").append(e.optString("date")).append("  ").append(e.optString("start")).append("–").append(e.optString("end")).append("  pausa ").append(e.optInt("pause")).append(" min");}
            return recent.toString();
        }
        StringBuilder s=new StringBuilder();
        String[] keys={"work_entries","vacations","settings","time_balance","vacation_balance"};
        for(String k:keys) if(data.has(k)) {
            Object v=data.opt(k); int n=v instanceof org.json.JSONArray?((org.json.JSONArray)v).length():(v instanceof JSONObject?((JSONObject)v).length():1);
            if(s.length()>0)s.append("\n"); s.append(k.replace('_',' ')).append(": ").append(n);
        }
        return s.length()==0?"Supabase OK":s.toString();
    }

    private void workDialog() {
        LinearLayout box=new LinearLayout(this); box.setOrientation(LinearLayout.VERTICAL); box.setPadding(dp(20),0,dp(20),0);
        EditText date=new EditText(this); date.setHint("AAAA-MM-DD"); date.setText(java.time.LocalDate.now().toString()); box.addView(date);
        EditText start=new EditText(this); start.setHint("Entrada HH:MM"); start.setText("22:00"); box.addView(start);
        EditText end=new EditText(this); end.setHint("Saída HH:MM"); end.setText("06:00"); box.addView(end);
        EditText pause=new EditText(this); pause.setHint("Pausa (minutos)"); pause.setInputType(InputType.TYPE_CLASS_NUMBER); pause.setText("30"); box.addView(pause);
        new AlertDialog.Builder(this).setTitle("Registar trabalho").setView(box).setNegativeButton(android.R.string.cancel,null)
            .setPositiveButton("Guardar",(d,w)->saveWork(date.getText().toString(),start.getText().toString(),end.getText().toString(),pause.getText().toString())).show();
    }
    private void saveWork(String date,String start,String end,String pauseText) {
        busy(true);
        new Thread(()->{try{
            int pause=Integer.parseInt(pauseText); repo.saveWork(null,date,start,end,pause);
            runOnUiThread(()->{Toast.makeText(this,"Registo guardado",Toast.LENGTH_SHORT).show();doSync();});
        }catch(Exception ex){runOnUiThread(()->{busy(false);status.setText("Não foi possível guardar o registo.");});}}).start();
    }

    private void confirmSignOut() {
        new AlertDialog.Builder(this).setMessage(R.string.sign_out).setNegativeButton(android.R.string.cancel,null)
            .setPositiveButton(android.R.string.ok,(d,w)->{repo.signOut(); refreshUi();}).show();
    }

    private void toggleLock() {
        if(prefs.getBoolean("lock",false)) new AlertDialog.Builder(this).setMessage(R.string.disable_lock).setNegativeButton(android.R.string.cancel,null)
            .setPositiveButton(android.R.string.ok,(d,w)->prefs.edit().putBoolean("lock",false).apply()).show();
        else new AlertDialog.Builder(this).setMessage(R.string.enable_lock).setNegativeButton(android.R.string.cancel,null)
            .setPositiveButton(android.R.string.ok,(d,w)->authenticate(true)).show();
    }

    private void authenticate(boolean enabling) {
        if(authenticating)return;
        BiometricManager manager=getSystemService(BiometricManager.class);
        if(manager.canAuthenticate(AUTH)!=BiometricManager.BIOMETRIC_SUCCESS){ new AlertDialog.Builder(this).setMessage(R.string.no_biometric).setPositiveButton(android.R.string.ok,null).show(); if(!enabling){unlocked=true;refreshUi();} return; }
        authenticating=true; cancellation=new CancellationSignal();
        new BiometricPrompt.Builder(this).setTitle(getString(R.string.app_name)).setSubtitle(getString(R.string.biometric_prompt)).setAllowedAuthenticators(AUTH).build()
            .authenticate(cancellation,getMainExecutor(),new BiometricPrompt.AuthenticationCallback(){
                @Override public void onAuthenticationSucceeded(BiometricPrompt.AuthenticationResult result){authenticating=false;if(enabling)prefs.edit().putBoolean("lock",true).apply();unlocked=true;refreshUi();}
                @Override public void onAuthenticationError(int code,CharSequence msg){authenticating=false;if(!enabling){unlocked=false;root.setVisibility(View.INVISIBLE);}}
            });
    }

    @Override protected void onResume(){super.onResume(); GeoRuntime.register(this,false); if(prefs!=null&&prefs.getBoolean("lock",false)&&!unlocked)authenticate(false);}
    @Override protected void onStop(){if(cancellation!=null&&authenticating)cancellation.cancel(); if(prefs!=null&&prefs.getBoolean("lock",false)){unlocked=false;if(root!=null)root.setVisibility(View.INVISIBLE);} super.onStop();}
    @Override public void onBackPressed(){long now=SystemClock.elapsedRealtime();if(now-lastBack<1800){finish();return;}lastBack=now;Toast.makeText(this,R.string.back_again_exit,Toast.LENGTH_SHORT).show();}
}
