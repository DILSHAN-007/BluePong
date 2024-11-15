package com.szad.goodland;

import android.app.*;
import android.os.*;
import android.webkit.*;
import android.util.*;

public class MainActivity extends Activity {
  @Override
  protected void onCreate(Bundle savedInstanceState) {
	super.onCreate(savedInstanceState);
	setContentView(R.layout.main);

	WebView webView = (WebView) findViewById(R.id.webview);

	// Enable JavaScript
	webView.getSettings().setJavaScriptEnabled(true);
	webView.getSettings().setDomStorageEnabled(true);
	webView.getSettings().setAllowUniversalAccessFromFileURLs(true);
	// Handle alerts, console messages, etc.
	webView.setWebChromeClient(new WebChromeClient() {
		@Override
		public void onConsoleMessage(String message, int lineNumber, String sourceID) {
		  Log.d("WebView", message + " -- From line " + lineNumber + " of " + sourceID);
		}
	  });

	// Optionally clear cache
	webView.clearCache(true);

	// Load local HTML file
	webView.loadUrl("file:///android_asset/index.html");
  }
}
