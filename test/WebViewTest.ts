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
            window['addEventListener'] = (event: string, handler: any, capture: boolean) => {
                console.log(event, handler, capture); // fix this TODO
            };
            window['webviewbridge'] = new WebViewBridge();
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
        window['nativebridge'] = new NativeBridge(fakeWebViewBridge);

        let webView: WebView = new WebView(window['nativebridge']);
        webView.initialize();
    });
});
