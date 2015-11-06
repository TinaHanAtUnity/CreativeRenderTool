/// <reference path="../typings/tsd.d.ts" />

import { assert } from 'chai';

import WebView from '../src/ts/WebView';
import WebViewBridge from '../test/WebViewBridge';
import { NativeBridge } from '../src/ts/NativeBridge';

describe('WebViewTest', () => {

    beforeEach(() => {
        /* tslint:disable:no-string-literal */
        global['window'] = global;
        window['webviewbridge'] = new WebViewBridge();
        window['nativebridge'] = new NativeBridge();
    });

    it('should init', () => {
        let webView: WebView = new WebView(window['nativebridge']);
    });
});
