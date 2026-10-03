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
    private Button signIn, signUp, sync, signOut, lock, addWork, addAbsence, balances, history;
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
        signIn=new Button(this); signIn.setText(R.string.sign_in); signIn.setOnClickListener(v->doSignIn()); login.addView(signIn);
        signUp=new Button(this); signUp.setText("Criar nova conta"); signUp.setOnClickListener(v->doSignUp()); login.addView(signUp); root.addView(login);

        sync=new Button(this); sync.setText(R.string.sync); sync.setOnClickListener(v->doSync()); root.addView(sync);
        addWork=new Button(this); addWork.setText("＋ Registar trabalho"); addWork.setOnClickListener(v->workDialog()); root.addView(addWork);
        addAbsence=new Button(this); addAbsence.setText("＋ Férias / doença / descanso"); addAbsence.setOnClickListener(v->absenceDialog()); root.addView(addAbsence);
        balances=new Button(this); balances.setText("Saldos"); balances.setOnClickListener(v->loadBalances()); root.addView(balances);
        history=new Button(this); history.setText("Histórico / calendário"); history.setOnClickListener(v->loadHistory()); root.addView(history);
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
        signOut.setVisibility(signed?View.VISIBLE:View.GONE); addWork.setVisibility(signed?View.VISIBLE:View.GONE); addAbsence.setVisibility(signed?View.VISIBLE:View.GONE); balances.setVisibility(signed?View.VISIBLE:View.GONE); history.setVisibility(signed?View.VISIBLE:View.GONE);
        status.setText(signed?R.string.signed_in:R.string.signed_out);
        if (!signed) summary.setText("");
    }

    private void busy(boolean value) {
        signIn.setEnabled(!value); signUp.setEnabled(!value); sync.setEnabled(!value); signOut.setEnabled(!value);
        if (value) status.setText(R.string.syncing);
    }

    private void doSignIn() {
        final String e=email.getText().toString(), p=password.getText().toString();
        busy(true);
        new Thread(()->{
            try { repo.signIn(e,p); runOnUiThread(()->{ password.setText(""); refreshUi(); doSync(); }); }
            catch(Exception ex){ runOnUiThread(()->{ busy(false); status.setText(ex.getMessage()==null?getString(R.string.login_error):ex.getMessage()); }); }
        }).start();
    }

    private void doSignUp() {
        final String e=email.getText().toString(), p=password.getText().toString();
        busy(true);
        new Thread(()->{
            try {
                JSONObject result=repo.signUp(e,p);
                runOnUiThread(()->{ busy(false); password.setText(""); new AlertDialog.Builder(this).setTitle("Conta criada").setMessage(result.has("access_token")?"Conta criada e sessão iniciada.":"Conta criada. Confirma o email recebido antes de entrares.").setPositiveButton(android.R.string.ok,(d,w)->refreshUi()).show(); });
            } catch(Exception ex) { runOnUiThread(()->{ busy(false); status.setText(ex.getMessage()==null?"Não foi possível criar a conta.":ex.getMessage()); }); }
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

    private void absenceDialog() {
        String[] kinds={"Férias","Descanso","Doença com baixa","Doença sem baixa"};
        new AlertDialog.Builder(this).setTitle("Tipo de ausência").setItems(kinds,(d,which)->absenceDate(which)).show();
    }
    private void absenceDate(int which) {
        EditText date=new EditText(this);date.setText(java.time.LocalDate.now().toString());date.setHint("AAAA-MM-DD");
        new AlertDialog.Builder(this).setTitle("Data").setView(date).setNegativeButton(android.R.string.cancel,null)
            .setPositiveButton("Continuar",(d,w)->{if(which==0)holidayMode(date.getText().toString());else saveAbsence(date.getText().toString(),which,"full",0);}).show();
    }
    private void holidayMode(String date){
        String[] modes={"Dia completo","Meio dia","Horas"};
        new AlertDialog.Builder(this).setTitle("Duração das férias").setItems(modes,(d,w)->{
            if(w==0)saveAbsence(date,0,"full",0);
            else if(w==1)saveAbsence(date,0,"half",0);
            else holidayHours(date);
        }).show();
    }
    private void holidayHours(String date){
        EditText hours=new EditText(this);hours.setHint("Horas (1–8)");hours.setInputType(InputType.TYPE_CLASS_NUMBER);
        new AlertDialog.Builder(this).setTitle("Horas de férias").setView(hours).setNegativeButton(android.R.string.cancel,null)
            .setPositiveButton("Guardar",(d,w)->{try{int h=Integer.parseInt(hours.getText().toString());if(h<1||h>8)throw new Exception();saveAbsence(date,0,"hours",h*60);}catch(Exception e){Toast.makeText(this,"Indica entre 1 e 8 horas.",Toast.LENGTH_SHORT).show();}}).show();
    }
    private void saveAbsence(String date,int which,String mode,int minutes) {
        String kind=which==0?"holiday":which==1?"rest":which==2?"sick_note":"sick_no_note";
        busy(true);new Thread(()->{try{repo.saveAbsence(date,kind,mode,minutes);runOnUiThread(()->{Toast.makeText(this,"Ausência guardada",Toast.LENGTH_SHORT).show();doSync();});}
        catch(Exception ex){runOnUiThread(()->{busy(false);status.setText("Não foi possível guardar.");});}}).start();
    }
    private void loadBalances() {
        busy(true);new Thread(()->{try{JSONObject b=repo.balances();runOnUiThread(()->{busy(false);showBalances(b);});}
        catch(Exception ex){runOnUiThread(()->{busy(false);status.setText(R.string.sync_error);});}}).start();
    }
    private void showBalances(JSONObject b) {
        JSONObject t=b.optJSONObject("time"),v=b.optJSONObject("vacation");StringBuilder s=new StringBuilder();
        if(t!=null){int m=t.optInt("current_minutes",0);s.append("Saldo de horas: ").append(m/60).append("h ").append(Math.abs(m%60)).append("min");}
        if(v!=null){if(s.length()>0)s.append("\n");s.append("Férias ").append(v.optInt("year")).append(": ").append(v.optString("available_days","—")).append(" dias disponíveis");}
        new AlertDialog.Builder(this).setTitle("Saldos").setMessage(s.length()==0?"Sem dados":s.toString()).setPositiveButton(android.R.string.ok,null).show();
    }

    private void loadHistory(){
        busy(true);new Thread(()->{try{JSONObject data=repo.load();runOnUiThread(()->{busy(false);showHistory(data);});}
        catch(Exception ex){runOnUiThread(()->{busy(false);status.setText(R.string.sync_error);});}}).start();
    }
    private void showHistory(JSONObject data){
        org.json.JSONArray rows=data.optJSONArray("rows");java.util.ArrayList<JSONObject> items=new java.util.ArrayList<>();
        if(rows!=null)for(int i=0;i<rows.length();i++){JSONObject r=rows.optJSONObject(i);if(r==null||!"entry".equals(r.optString("entity"))||!r.isNull("deleted_at"))continue;JSONObject v=r.optJSONObject("value");if(v!=null)items.add(v);}
        items.sort((a,b)->b.optString("date").compareTo(a.optString("date")));
        String[] labels=new String[Math.min(items.size(),60)];
        for(int i=0;i<labels.length;i++){JSONObject v=items.get(i);String k=v.optString("kind");String detail="work".equals(k)?v.optString("start")+"–"+v.optString("end"):"holiday".equals(k)?"Férias":"rest".equals(k)?"Descanso":"Doença";labels[i]=v.optString("date")+"   "+detail;}
        new AlertDialog.Builder(this).setTitle("Histórico").setItems(labels,(d,w)->entryActions(items.get(w))).setNegativeButton(android.R.string.cancel,null).show();
    }
    private void entryActions(JSONObject item){
        String[] actions={"Editar","Eliminar"};
        new AlertDialog.Builder(this).setTitle(item.optString("date")).setItems(actions,(d,w)->{if(w==0)editEntry(item);else confirmDelete(item.optString("id"));}).show();
    }
    private void editEntry(JSONObject item){
        if("work".equals(item.optString("kind"))){
            LinearLayout box=new LinearLayout(this);box.setOrientation(LinearLayout.VERTICAL);box.setPadding(dp(20),0,dp(20),0);
            EditText date=new EditText(this);date.setText(item.optString("date"));box.addView(date);
            EditText start=new EditText(this);start.setText(item.optString("start"));box.addView(start);
            EditText end=new EditText(this);end.setText(item.optString("end"));box.addView(end);
            EditText pause=new EditText(this);pause.setInputType(InputType.TYPE_CLASS_NUMBER);pause.setText(String.valueOf(item.optInt("pause")));box.addView(pause);
            new AlertDialog.Builder(this).setTitle("Editar trabalho").setView(box).setNegativeButton(android.R.string.cancel,null)
                .setPositiveButton("Guardar",(d,w)->{busy(true);new Thread(()->{try{repo.saveWork(item.optString("id"),date.getText().toString(),start.getText().toString(),end.getText().toString(),Integer.parseInt(pause.getText().toString()));runOnUiThread(this::doSync);}catch(Exception ex){runOnUiThread(()->{busy(false);status.setText("Não foi possível editar.");});}}).start();}).show();
        } else Toast.makeText(this,"Edição de ausências será feita no calendário.",Toast.LENGTH_SHORT).show();
    }
    private void confirmDelete(String id){
        new AlertDialog.Builder(this).setTitle("Eliminar registo?").setMessage("O registo deixa de contar nos saldos após sincronizar.").setNegativeButton(android.R.string.cancel,null)
            .setPositiveButton("Eliminar",(d,w)->{busy(true);new Thread(()->{try{repo.deleteEntry(id);runOnUiThread(this::doSync);}catch(Exception ex){runOnUiThread(()->{busy(false);status.setText("Não foi possível eliminar.");});}}).start();}).show();
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
