import NativeBridge = require('NativeBridge');
import WebView = require('WebView');

let nativeBridge = new NativeBridge();
window['nativebridge'] = nativeBridge;

let webView = new WebView(nativeBridge);
window['webview'] = webView;