/// <reference path="../typings/tsd.d.ts" />

import * as sinon from 'sinon';
import { assert } from 'chai';
import * as mocha from 'mocha';

import WebView from '../src/ts/WebView';
import WebViewBridge from '../test/WebViewBridge';
import { NativeBridge } from '../src/ts/NativeBridge';
import Zone from '../src/ts/Models/Zone';

describe('WebViewTest', () => {

    before(() => {
        /* tslint:disable:no-string-literal */
        global['window'] = global;
        window['nativebridge'] = new NativeBridge();
    });

    it('should init', function(done: MochaDone) {

        let counter: number = 0;

        class FakeWebViewBridge extends WebViewBridge {

            protected sendReadyEvent(zoneId: string): any[] {
                ++counter;
                if(counter >= 2) {
                    done();
                }
                return super.sendReadyEvent(zoneId);
            }

        }

        window['webviewbridge'] = new FakeWebViewBridge();

        let webView: WebView = new WebView(window['nativebridge']);
        webView.initialize();
    });
});
