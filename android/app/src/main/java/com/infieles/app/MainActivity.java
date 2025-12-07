package com.infieles.app;

import android.os.Bundle;
import android.webkit.CookieManager;
import android.webkit.WebSettings;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        
        // Configurar WebView para permitir cookies y almacenamiento
        // Esto es necesario para Firebase Auth en Android
        if (getBridge() != null && getBridge().getWebView() != null) {
            WebSettings webSettings = getBridge().getWebView().getSettings();
            
            // Habilitar cookies
            CookieManager cookieManager = CookieManager.getInstance();
            cookieManager.setAcceptCookie(true);
            cookieManager.setAcceptThirdPartyCookies(getBridge().getWebView(), true);
            
            // Habilitar almacenamiento local
            webSettings.setDomStorageEnabled(true);
            webSettings.setDatabaseEnabled(true);
            webSettings.setJavaScriptEnabled(true);
            
            // Habilitar cache
            webSettings.setCacheMode(WebSettings.LOAD_DEFAULT);
            webSettings.setAppCacheEnabled(true);
        }
    }
}
