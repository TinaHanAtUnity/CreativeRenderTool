/// <reference path="../src/ts/WebViewBridge.d.ts" />

/* tslint:disable:no-string-literal */

import 'mocha';

import { WebView } from '../src/ts/WebView';
import { WebViewBridge } from '../test/WebViewBridge';
import { NativeBridge } from '../src/ts/NativeBridge';

describe('WebViewTest', () => {

    before(() => {
        if(typeof global !== 'undefined') {
            global['window'] = global;
        }
    });

    it('should init', function(done: MochaDone): void {
        this.timeout(10000);

        class FakeWebViewBridge implements IWebViewBridge {

            private _counter: number = 0;

            public handleInvocation(invocations: string): void {
                window['webviewbridge'].handleInvocation(invocations);
                if(invocations.indexOf('sendReadyEvent') !== -1) {
                    ++this._counter;
                    if(this._counter === 2) {
                        done();
                    }
                }
            }

            public handleCallback(id: string, status: string, parameters?: string): void {
                window['webviewbridge'].handleCallback(id, status, parameters);
            }

        }

        let fakeWebViewBridge: FakeWebViewBridge = new FakeWebViewBridge();
        let nativeBridge: NativeBridge = new NativeBridge(fakeWebViewBridge);
        let webViewBridge: WebViewBridge = new WebViewBridge();
        webViewBridge.setNativeBridge(nativeBridge);

        window['nativebridge'] = nativeBridge;
        window['webviewbridge'] = webViewBridge;

        let webView: WebView = new WebView(nativeBridge);
        webView.initialize();
    });
});
