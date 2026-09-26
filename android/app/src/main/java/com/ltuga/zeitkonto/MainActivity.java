package com.ltuga.zeitkonto;

import android.annotation.SuppressLint;
import android.app.Activity;
import android.app.AlertDialog;
import android.content.Intent;
import android.content.SharedPreferences;
import android.graphics.Color;
import android.hardware.biometrics.BiometricManager;
import android.hardware.biometrics.BiometricPrompt;
import android.net.Uri;
import android.net.http.SslError;
import android.os.Bundle;
import android.os.Build;
import android.os.SystemClock;
import android.os.CancellationSignal;
import android.print.PrintManager;
import android.view.Gravity;
import android.view.View;
import android.view.WindowInsets;
import android.view.WindowManager;
import android.webkit.CookieManager;
import android.webkit.PermissionRequest;
import android.webkit.SslErrorHandler;
import android.webkit.WebChromeClient;
import android.webkit.WebResourceError;
import android.webkit.WebResourceRequest;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.Button;
import android.widget.FrameLayout;
import android.widget.LinearLayout;
import android.widget.PopupMenu;
import android.widget.TextView;
import android.widget.Toast;
import android.window.OnBackInvokedCallback;
import android.window.OnBackInvokedDispatcher;

public class MainActivity extends Activity {
    private static final int AUTH = BiometricManager.Authenticators.BIOMETRIC_STRONG
        | BiometricManager.Authenticators.DEVICE_CREDENTIAL;
    private SharedPreferences preferences;
    private FrameLayout content;
    private LinearLayout cover;
    private TextView message;
    private Button retry, menuButton;
    private WebView web;
    private boolean unlocked, authenticating, resumed, failed;
    private CancellationSignal authentication;
    private final BackPressPolicy backPress = new BackPressPolicy();
    private OnBackInvokedCallback backCallback;
    private boolean checkingBack;
    private Toast exitToast;
    private String pendingWidgetUrl;

    @Override public void onCreate(Bundle state) {
        super.onCreate(state);
        readWidgetIntent(getIntent());
        if (Build.VERSION.SDK_INT >= 33) {
            backCallback = this::handleBack;
            getOnBackInvokedDispatcher().registerOnBackInvokedCallback(
                OnBackInvokedDispatcher.PRIORITY_DEFAULT, backCallback);
        }
        // Also prevents app-switcher snapshots of work/health information.
        getWindow().addFlags(WindowManager.LayoutParams.FLAG_SECURE);
        preferences = getSharedPreferences("device_security", MODE_PRIVATE);
        LinearLayout root = new LinearLayout(this);
        root.setOrientation(LinearLayout.VERTICAL);
        root.setBackgroundColor(Color.rgb(16, 43, 82));
        root.setOnApplyWindowInsetsListener((v, insets) -> {
            android.graphics.Insets bars = insets.getInsets(WindowInsets.Type.systemBars() | WindowInsets.Type.ime());
            v.setPadding(bars.left, bars.top, bars.right, bars.bottom);
            return insets;
        });
        LinearLayout toolbar = new LinearLayout(this);
        toolbar.setGravity(Gravity.CENTER_VERTICAL);
        TextView title = new TextView(this);
        title.setText(R.string.app_name);
        title.setTextSize(18); title.setTextColor(Color.WHITE);
        title.setPadding(dp(16), dp(8), dp(8), dp(8));
        toolbar.addView(title, new LinearLayout.LayoutParams(0, dp(48), 1));
        menuButton = new Button(this);
        menuButton.setText(R.string.options);
        menuButton.setOnClickListener(v -> options());
        toolbar.addView(menuButton);
        root.addView(toolbar);
        content = new FrameLayout(this);
        root.addView(content, new LinearLayout.LayoutParams(-1, 0, 1));
        cover = new LinearLayout(this);
        cover.setOrientation(LinearLayout.VERTICAL);
        cover.setGravity(Gravity.CENTER);
        cover.setPadding(dp(24), dp(24), dp(24), dp(24));
        cover.setBackgroundColor(Color.rgb(16, 43, 82));
        message = new TextView(this);
        message.setTextColor(Color.WHITE); message.setTextSize(18);
        message.setGravity(Gravity.CENTER);
        cover.addView(message);
        retry = new Button(this);
        cover.addView(retry);
        content.addView(cover, new FrameLayout.LayoutParams(-1, -1));
        setContentView(root);
        if (lockEnabled()) showLocked(); else unlockContent();
    }

    private int dp(int n) { return Math.round(n * getResources().getDisplayMetrics().density); }
    private boolean lockEnabled() { return preferences.getBoolean("lock", false); }

    private void showLocked() {
        unlocked = false;
        if (web != null) { web.setVisibility(View.INVISIBLE); web.onPause(); }
        menuButton.setEnabled(false);
        message.setText(R.string.locked);
        retry.setText(R.string.unlock);
        retry.setOnClickListener(v -> authenticate(false));
        cover.setVisibility(View.VISIBLE); cover.bringToFront();
    }

    @SuppressLint("ApplySharedPref") // Persist the security choice before acknowledging activation.
    private void authenticate(boolean enabling) {
        if (authenticating || !resumed) return;
        BiometricManager manager = getSystemService(BiometricManager.class);
        if (manager.canAuthenticate(AUTH) != BiometricManager.BIOMETRIC_SUCCESS) {
            new AlertDialog.Builder(this).setMessage(R.string.no_biometric)
                .setPositiveButton(android.R.string.ok, null).show();
            return;
        }
        authenticating = true;
        authentication = new CancellationSignal();
        new BiometricPrompt.Builder(this).setTitle(getString(R.string.app_name))
            .setSubtitle(getString(R.string.biometric_prompt)).setAllowedAuthenticators(AUTH).build()
            .authenticate(authentication, getMainExecutor(), new BiometricPrompt.AuthenticationCallback() {
                @Override public void onAuthenticationSucceeded(BiometricPrompt.AuthenticationResult result) {
                    authenticating = false;
                    if (isFinishing() || isDestroyed() || !resumed) return;
                    if (enabling) preferences.edit().putBoolean("lock", true).commit();
                    unlockContent();
                }
                @Override public void onAuthenticationError(int error, CharSequence text) {
                    authenticating = false;
                    if (isFinishing() || isDestroyed()) return;
                    if (!enabling) { showLocked(); message.setText(text); }
                }
            });
    }

    private void unlockContent() {
        unlocked = true;
        menuButton.setEnabled(true);
        if (web == null) createWebView();
        web.setVisibility(View.VISIBLE); web.onResume();
        openPendingWidget();
        if (failed) showConnectionError(); else cover.setVisibility(View.GONE);
    }

    @SuppressLint("SetJavaScriptEnabled")
    private void createWebView() {
        web = new WebView(this);
        WebView.setWebContentsDebuggingEnabled(false);
        WebSettings settings = web.getSettings();
        settings.setJavaScriptEnabled(true); // Required by the existing React application.
        settings.setDomStorageEnabled(true);
        settings.setAllowFileAccess(false); settings.setAllowContentAccess(false);
        settings.setMixedContentMode(WebSettings.MIXED_CONTENT_NEVER_ALLOW);
        settings.setSafeBrowsingEnabled(true);
        settings.setJavaScriptCanOpenWindowsAutomatically(false);
        settings.setSupportMultipleWindows(false);
        settings.setMediaPlaybackRequiresUserGesture(true);
        settings.setUserAgentString(settings.getUserAgentString() + " ZeitkontoAndroid/0.2.0");
        CookieManager.getInstance().setAcceptThirdPartyCookies(web, false);
        web.setWebChromeClient(new WebChromeClient() {
            @Override public void onPermissionRequest(PermissionRequest request) { request.deny(); }
        });
        web.setWebViewClient(new WebViewClient() {
            @Override public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest request) {
                String target = request.getUrl().toString();
                if (NavigationPolicy.trusted(target)) return false;
                // Narrow printing command: no data or arbitrary native bridge exposed to JavaScript.
                if (request.isForMainFrame() && "zeitkonto-print://calendar".equals(target)
                    && NavigationPolicy.trusted(view.getUrl()) && unlocked) {
                    confirmPrint(); return true;
                }
                if (request.isForMainFrame() && request.hasGesture()
                    && "https".equals(request.getUrl().getScheme())) openBrowser(request.getUrl());
                return true;
            }
            @Override public void onPageFinished(WebView view, String url) {
                if (!NavigationPolicy.trusted(url)) return;
                if (unlocked && !failed) cover.setVisibility(View.GONE);
                view.evaluateJavascript("window.print=function(){window.location.href='zeitkonto-print://calendar';};", null);
            }
            @Override public void onReceivedSslError(WebView view, SslErrorHandler handler, SslError error) {
                handler.cancel(); // Never offer to bypass certificate errors.
            }
            @Override public void onReceivedError(WebView view, WebResourceRequest request, WebResourceError error) {
                if (request.isForMainFrame()) { failed = true; if (unlocked) showConnectionError(); }
            }
        });
        content.addView(web, 0, new FrameLayout.LayoutParams(-1, -1));
        GeoBridge.install(this, web, () -> unlocked);
        web.loadUrl(pendingWidgetUrl != null ? pendingWidgetUrl : NavigationPolicy.HOME);
        pendingWidgetUrl = null;
    }

    private void readWidgetIntent(Intent intent) {
        if (intent != null && WidgetDestination.ACTION.equals(intent.getAction()))
            pendingWidgetUrl = WidgetDestination.url(intent.getStringExtra(WidgetDestination.EXTRA));
    }
    private void openPendingWidget() {
        if (unlocked && web != null && pendingWidgetUrl != null) {
            String target = pendingWidgetUrl;
            pendingWidgetUrl = null;
            failed = false;
            resetBack();
            web.loadUrl(target);
        }
    }
    @Override protected void onNewIntent(Intent intent) {
        super.onNewIntent(intent);
        setIntent(intent);
        readWidgetIntent(intent);
        // If locked, defer navigation until the existing biometric/PIN flow succeeds.
        openPendingWidget();
    }

    private void showConnectionError() {
        message.setText(R.string.connection_error);
        retry.setText(R.string.retry);
        retry.setOnClickListener(v -> { failed = false; cover.setVisibility(View.GONE); web.loadUrl(NavigationPolicy.HOME); });
        cover.setVisibility(View.VISIBLE); cover.bringToFront();
    }

    private void options() {
        if (!unlocked) return;
        PopupMenu menu = new PopupMenu(this, menuButton);
        menu.getMenu().add(0, 1, 0, R.string.device_lock).setCheckable(true).setChecked(lockEnabled());
        menu.getMenu().add(0, 2, 1, R.string.print);
        menu.getMenu().add(0, 3, 2, R.string.browser);
        menu.getMenu().add(0, 4, 3, R.string.about);
        menu.setOnMenuItemClickListener(item -> {
            switch (item.getItemId()) {
                case 1:
                    if (lockEnabled()) new AlertDialog.Builder(this).setMessage(R.string.disable_lock)
                        .setNegativeButton(android.R.string.cancel, null)
                        .setPositiveButton(android.R.string.ok, (d, w) -> preferences.edit().putBoolean("lock", false).commit()).show();
                    else new AlertDialog.Builder(this).setMessage(R.string.enable_lock)
                        .setNegativeButton(android.R.string.cancel, null)
                        .setPositiveButton(android.R.string.ok, (d, w) -> authenticate(true)).show();
                    break;
                case 2: confirmPrint(); break;
                case 3: openBrowser(Uri.parse(NavigationPolicy.HOME)); break;
                case 4: new AlertDialog.Builder(this).setTitle("Zeitkonto 0.2.0")
                    .setMessage(R.string.about_text).setPositiveButton(android.R.string.ok, null).show(); break;
                default: return false;
            }
            return true;
        });
        menu.show();
    }

    private void confirmPrint() {
        if (!unlocked || web == null || !NavigationPolicy.trusted(web.getUrl())) return;
        new AlertDialog.Builder(this).setMessage(R.string.print_confirm)
            .setNegativeButton(android.R.string.cancel, null)
            .setPositiveButton(android.R.string.ok, (d, w) -> {
                if (unlocked) getSystemService(PrintManager.class).print("Zeitkonto",
                    web.createPrintDocumentAdapter("Zeitkonto"), null);
            }).show();
    }

    private void openBrowser(Uri uri) {
        try { startActivity(new Intent(Intent.ACTION_VIEW, uri).addCategory(Intent.CATEGORY_BROWSABLE)); }
        catch (android.content.ActivityNotFoundException ignored) {
            new AlertDialog.Builder(this).setMessage(R.string.no_browser).setPositiveButton(android.R.string.ok, null).show();
        }
    }

    @Override protected void onResume() {
        super.onResume(); resumed = true;
        GeoRuntime.register(this, false);
        if (lockEnabled() && !unlocked) authenticate(false);
        else if (web != null) web.onResume();
    }
    @Override protected void onPause() {
        resumed = false;
        resetBack();
        if (lockEnabled() && !authenticating) showLocked();
        if (web != null) { web.onPause(); CookieManager.getInstance().flush(); }
        super.onPause();
    }
    @Override protected void onStop() {
        super.onStop();
        if (authentication != null && authenticating) { authentication.cancel(); authenticating = false; }
        if (lockEnabled()) showLocked();
    }
    @Override public void onBackPressed() {
        handleBack();
    }
    private void resetBack() {
        backPress.reset();
        if (exitToast != null) { exitToast.cancel(); exitToast = null; }
    }
    private void exitFromRoot() {
        if (backPress.shouldExit(SystemClock.elapsedRealtime())) {
            if (exitToast != null) exitToast.cancel();
            finish(); // End this Activity, never kill the process or erase the session.
        } else {
            if (exitToast != null) exitToast.cancel();
            exitToast = Toast.makeText(this, R.string.back_again_exit, Toast.LENGTH_SHORT);
            exitToast.show();
        }
    }
    private void handleBack() {
        if (checkingBack || isFinishing() || !resumed) return;
        if (!unlocked || web == null || failed || !NavigationPolicy.trusted(web.getUrl())) {
            exitFromRoot(); return;
        }
        checkingBack = true;
        // Trusted origin only; a return value, no JavaScript interface or native exit command.
        web.evaluateJavascript("(function(){try{return typeof window.__zeitkontoBack==='function'?window.__zeitkontoBack():'unavailable';}catch(e){return 'unavailable';}})()", result -> {
            checkingBack = false;
            if (isFinishing() || isDestroyed() || !resumed || !unlocked) return;
            if ("\"handled\"".equals(result)) { resetBack(); return; }
            if ("\"root\"".equals(result)) { exitFromRoot(); return; }
            if (web.canGoBack()) { resetBack(); web.goBack(); } else exitFromRoot();
        });
    }
    @Override protected void onDestroy() {
        if (Build.VERSION.SDK_INT >= 33 && backCallback != null)
            getOnBackInvokedDispatcher().unregisterOnBackInvokedCallback(backCallback);
        resetBack();
        if (authentication != null) authentication.cancel();
        if (web != null) { content.removeView(web); web.destroy(); }
        super.onDestroy();
    }
}
