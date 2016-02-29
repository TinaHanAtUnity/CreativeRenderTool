import { Request } from '../../src/ts/Utilities/Request';
import { WebViewBridge } from '../WebViewBridge';
import { NativeBridge } from '../../src/ts/NativeBridge';

import 'mocha';
import { assert } from 'chai';

describe('RequestTest', () => {
    it('Request get without headers (expect success)', function(done: MochaDone): void {
        let successUrl: string = 'http://www.example.org/success';
        let successMessage: string = 'Success response';

        let testBridge: WebViewBridge = new WebViewBridge();
        let nativeBridge: NativeBridge = new NativeBridge(testBridge);
        testBridge.setNativeBridge(nativeBridge);
        let request: Request = new Request(nativeBridge);

        request.get(successUrl).then(([response]) => {
            assert.equal(successMessage, response, 'Did not receive correct response');
            done();
        }).catch(([error]) => {
            done(new Error('Get without headers failed: ' + error));
        });
    });

    it('Request get without headers (expect failure)', function(done: MochaDone): void {
        let failUrl: string = 'http://www.example.org/fail';
        let failMessage: string = 'Fail response';

        let testBridge: WebViewBridge = new WebViewBridge();
        let nativeBridge: NativeBridge = new NativeBridge(testBridge);
        testBridge.setNativeBridge(nativeBridge);
        let request: Request = new Request(nativeBridge);

        request.get(failUrl).then(([response]) => {
            done(new Error('Request should have failed but got response: ' + response));
        }).catch(([error]) => {
            assert.equal(failMessage, error, 'Did not receive correct error message');
            done();
        });
    });

    it('Request get with header', function(done: MochaDone): void {
        let headerUrl: string = 'http://www.example.org/forwardheader';
        let headerField: string = 'X-Test';
        let headerMessage: string = 'Header message';

        let testBridge: WebViewBridge = new WebViewBridge();
        let nativeBridge: NativeBridge = new NativeBridge(testBridge);
        testBridge.setNativeBridge(nativeBridge);
        let request: Request = new Request(nativeBridge);

        request.get(headerUrl, [[headerField, headerMessage]]).then(([response]) => {
            assert.equal(headerMessage, response, 'Did not get correctly forwarded header response');
            done();
        }).catch(([error]) => {
            done(new Error('Get with header forwarding failed: ' + error));
        });
    });

    it('Request post without headers (expect success)', function(done: MochaDone): void {
        let successUrl: string = 'http://www.example.org/success';
        let successMessage: string = 'Success response';

        let testBridge: WebViewBridge = new WebViewBridge();
        let nativeBridge: NativeBridge = new NativeBridge(testBridge);
        testBridge.setNativeBridge(nativeBridge);
        let request: Request = new Request(nativeBridge);

        request.post(successUrl, 'Test').then(([response]) => {
            assert.equal(successMessage, response, 'Did not receive correct response');
            done();
        }).catch(([error]) => {
            done(new Error('Post without headers failed: ' + error));
        });
    });

    it('Request post without headers (expect failure)', function(done: MochaDone): void {
        let failUrl: string = 'http://www.example.org/fail';
        let failMessage: string = 'Fail response';

        let testBridge: WebViewBridge = new WebViewBridge();
        let nativeBridge: NativeBridge = new NativeBridge(testBridge);
        testBridge.setNativeBridge(nativeBridge);
        let request: Request = new Request(nativeBridge);

        request.post(failUrl, 'Test').then(([response]) => {
            done(new Error('Request should have failed but got response: ' + response));
        }).catch(([error]) => {
            assert.equal(failMessage, error, 'Did not receive correct error message');
            done();
        });
    });

    it('Request post with header', function(done: MochaDone): void {
        let headerUrl: string = 'http://www.example.org/forwardheader';
        let headerField: string = 'X-Test';
        let headerMessage: string = 'Header message';

        let testBridge: WebViewBridge = new WebViewBridge();
        let nativeBridge: NativeBridge = new NativeBridge(testBridge);
        testBridge.setNativeBridge(nativeBridge);
        let request: Request = new Request(nativeBridge);

        request.post(headerUrl, 'Test', [[headerField, headerMessage]]).then(([response]) => {
            assert.equal(headerMessage, response, 'Did not get correctly forwarded header response');
            done();
        }).catch(([error]) => {
            done(new Error('Post with header forwarding failed: ' + error));
        });
    });

    it('Request post with forwarded body', function(done: MochaDone): void {
        let testUrl: string = 'http://www.example.org/forwardbody';
        let bodyMessage: string = 'Body message';

        let testBridge: WebViewBridge = new WebViewBridge();
        let nativeBridge: NativeBridge = new NativeBridge(testBridge);
        testBridge.setNativeBridge(nativeBridge);
        let request: Request = new Request(nativeBridge);

        request.post(testUrl, bodyMessage).then(([response]) => {
            assert.equal(bodyMessage, response, 'Did not get correctly forwarded body');
            done();
        }).catch(([error]) => {
            done(new Error('Post with body forwarding failed: ' + error));
        });
    });
});