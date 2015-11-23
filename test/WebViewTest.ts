/// <reference path="../typings/tsd.d.ts" />
/// <reference path="../src/ts/WebViewBridge.d.ts" />

import * as sinon from 'sinon';
import { assert } from 'chai';
import 'mocha';

import WebView from '../src/ts/WebView';
import WebViewBridge from '../test/WebViewBridge';
import { NativeBridge } from '../src/ts/NativeBridge';

describe('WebViewTest', () => {

    before(() => {
        /* tslint:disable:no-string-literal */
        if(typeof global !== 'undefined') {
            global['window'] = global;
            window['webviewbridge'] = new WebViewBridge();
        }
    });

    it('should init', function(done: MochaDone): void {
        this.slow(10000);

        class FakeWebViewBridge implements IWebViewBridge {

            private _counter: number = 0;

            public handleInvocation(className: string, methodName: string, parameters?: string, callback?: string): void {
                window['webviewbridge'].handleInvocation(className, methodName, parameters, callback);
                if(className === 'com.unity3d.unityads.api.Listener' && methodName === 'sendReadyEvent') {
                    ++this._counter;
                    if(this._counter === 2) {
                        done();
                    }
                }
            }

            public handleBatchInvocation(id: string, calls: string): void {
                window['webviewbridge'].handleBatchInvocation(id, calls);
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
