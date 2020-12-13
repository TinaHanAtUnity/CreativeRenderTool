import * as tslib_1 from "tslib";
import { assert } from 'chai';
import { XHRequest } from 'Core/Utilities/XHRequest';
import 'mocha';
import * as sinon from 'sinon';
import { RequestError } from 'Core/Errors/RequestError';
describe('XHRequestTest', () => {
    let server;
    beforeEach(() => {
        server = sinon.fakeServer.create({
            autoRespond: true,
            autoRespondAfter: 5
        });
    });
    afterEach(() => {
        server.restore();
    });
    describe('GET', () => {
        [
            [200, {}, 'OK'],
            [299, {}, 'Status code 299']
        ].forEach((params) => it(`should give an OK response for status code ${params[0]}`, () => {
            server.respondWith('GET', 'https://api.unity3d.com/test', params);
            return XHRequest.get('https://api.unity3d.com/test').then((responseText) => {
                assert.equal(server.requests.length, 1, 'XHRequestTest should create one XMLHttpRequest instance');
                assert.equal(params[2], responseText);
            });
        }));
        [
            [199, {}, 'Status code 199'],
            [300, {}, 'Bad Request'],
            [404, {}, 'File not found'],
            [500, {}, 'Server Error'] // Common HTTP error code
        ].forEach((params) => it(`should fail from bad response for status code ${params[0]}`, () => tslib_1.__awaiter(this, void 0, void 0, function* () {
            server.respondWith('GET', 'https://api.unity3d.com/test', params);
            try {
                yield XHRequest.get('https://api.unity3d.com/test');
            }
            catch (err) {
                assert.equal(server.requests.length, 1, 'XHRequestTest should create one XMLHttpRequest instance');
                assert.isTrue(err instanceof RequestError, 'Did not fail from the file not being found');
                assert.equal(err.message, `Request failed with status code ${params[0]}`);
                return;
            }
            assert.fail('Promise was not rejected');
        })));
        it('should fail from bad response with correct headers and response', () => tslib_1.__awaiter(this, void 0, void 0, function* () {
            server.respondWith('GET', 'https://api.unity3d.com/test', [500, { 'test-header': 'test-value' }, 'Status code 500']);
            try {
                yield XHRequest.get('https://api.unity3d.com/test');
            }
            catch (err) {
                assert.equal(server.requests.length, 1, 'XHRequestTest should create one XMLHttpRequest instance');
                assert.isTrue(err instanceof RequestError, 'Did not fail from the file not being found');
                if (err instanceof RequestError) {
                    assert.deepEqual(err.nativeRequest, {});
                    assert.isDefined(err.nativeResponse);
                    assert.equal(err.nativeResponse.url, 'https://api.unity3d.com/test');
                    assert.equal(err.nativeResponse.response, 'Status code 500');
                    assert.equal(err.nativeResponse.responseCode, 500);
                    assert.deepEqual(err.nativeResponse.headers, [['test-header', 'test-value']]);
                }
                return;
            }
            assert.fail('Promise was not rejected');
        }));
        // Test skipped since is not faking XMLHttpRequest properly.
        xit('should give an OK response from the file', () => {
            server.respondWith('GET', 'file:///path/to/file.txt', [0, {}, 'File content']);
            return XHRequest.get('file:///path/to/file.txt').then((responseText) => {
                assert.equal(server.requests.length, 1, 'XHRequestTest should create one XMLHttpRequest instance');
                assert.equal('File content', responseText);
            });
        });
        it('should fail from file:// with status not 0', () => tslib_1.__awaiter(this, void 0, void 0, function* () {
            server.respondWith('GET', /\/path\/to\/file.txt$/, [300, {}, 'Text']);
            try {
                yield XHRequest.get('file:///path/to/file.txt');
            }
            catch (err) {
                assert.equal(server.requests.length, 1, 'XHRequestTest should create one XMLHttpRequest instance');
                assert.isTrue(err instanceof RequestError, 'Did not fail from the error');
                assert.equal(err.message, 'Request failed with status code 300');
                return;
            }
            assert.fail('Promise was not rejected');
        }));
        it('should fail from network error', () => tslib_1.__awaiter(this, void 0, void 0, function* () {
            const promise = XHRequest.get('https://api.unity3d.com/test');
            assert.equal(server.requests.length, 1, 'XHRequestTest should create one XMLHttpRequest instance');
            // Simulating network error
            server.requests[0].error();
            try {
                yield promise;
            }
            catch (err) {
                assert.isTrue(err instanceof RequestError, 'Did not fail from the error');
                assert.equal(err.message, 'Error ocurred while executing request: status - 0');
                return;
            }
            assert.fail('Promise was not rejected');
        }));
        it('should fail from abort', () => tslib_1.__awaiter(this, void 0, void 0, function* () {
            const promise = XHRequest.get('https://api.unity3d.com/test');
            assert.equal(server.requests.length, 1, 'XHRequestTest should create one XMLHttpRequest instance');
            // Calling abort on our XMLHttpRequest
            const xhr = server.requests[0];
            xhr.abort();
            try {
                yield promise;
            }
            catch (err) {
                assert.isTrue(err instanceof RequestError, 'Did not fail from the error');
                assert.equal(err.message, 'Request was aborted');
                return;
            }
            assert.fail('Promise was not rejected');
        }));
        it('should fail from timeout error', () => tslib_1.__awaiter(this, void 0, void 0, function* () {
            const promise = XHRequest.get('https://api.unity3d.com/test');
            const xhr = server.requests[0];
            xhr.timedOut = true; // Accessing internal sinon variable to trigger timeout. HACK!
            xhr.respond(200, {}, '');
            try {
                yield promise;
            }
            catch (err) {
                assert.isTrue(err instanceof RequestError, 'Did not fail from the error');
                assert.equal(err.message, 'Request timed out');
                return;
            }
            assert.fail('Promise was not rejected');
        }));
        it('should call open with GET', () => tslib_1.__awaiter(this, void 0, void 0, function* () {
            const openSpy = sinon.spy(XMLHttpRequest.prototype, 'open');
            server.respondWith('GET', 'https://api.unity3d.com/test', [200, {}, 'OK']);
            try {
                yield XHRequest.get('https://api.unity3d.com/test');
            }
            catch (err) {
                // ignore error
            }
            finally {
                // Restoring 'open' method even in error case
                openSpy.restore();
            }
            assert.equal(server.requests.length, 1, 'XHRequestTest should create one XMLHttpRequest instance');
            assert.isTrue(openSpy.called, 'Did not call function open'); // Checking if actually did a call
            assert.equal(openSpy.firstCall.args[0], 'GET', 'Did not call function open with GET');
        }));
        // Checking if we are calling decodeURIComponent or not.
        [
            ['https://api.unity3d.com/test', 'https://api.unity3d.com/test'],
            ['https://api.unity3d.com/test%3Fx%3Dtest', 'https://api.unity3d.com/test?x=test']
        ].forEach(([url, decodedUrl]) => it('should correctly decode url ' + decodedUrl, () => {
            server.respondWith('GET', decodedUrl, [200, {}, 'data']);
            return XHRequest.get(url).then(() => {
                assert.equal(server.requests.length, 1, 'XHRequestTest should create one XMLHttpRequest instance');
            });
        }));
    });
    describe('POST', () => {
        it('should call open with POST', () => tslib_1.__awaiter(this, void 0, void 0, function* () {
            const openSpy = sinon.spy(XMLHttpRequest.prototype, 'open');
            const sendSpy = sinon.spy(XMLHttpRequest.prototype, 'send');
            server.respondWith('POST', 'https://api.unity3d.com/test', [200, {}, 'OK']);
            try {
                yield XHRequest.post('https://api.unity3d.com/test', 'body');
            }
            catch (err) {
                // ignore error
            }
            finally {
                // Restoring 'open' method even in error case
                openSpy.restore();
                sendSpy.restore();
            }
            assert.equal(server.requests.length, 1, 'XHRequestTest should create one XMLHttpRequest instance');
            assert.isTrue(openSpy.called, 'Did not call function open'); // Checking if actually did a call
            assert.equal(openSpy.firstCall.args[0], 'POST', 'Did not call function open with POST');
            assert.equal(sendSpy.firstCall.args[0], 'body', 'Did not call function open with correct body');
        }));
    });
    describe('getDataUrl', () => {
        const url = 'https://api.unity3d.com/file.txt';
        const fileContent = 'HelloWorld!';
        let responseText;
        beforeEach(() => {
            server.respondWith('GET', url, [200, {}, fileContent]);
            return XHRequest.getDataUrl(url).then((response) => {
                responseText = response;
            });
        });
        it('should give a correct data url', () => {
            assert.equal(server.requests.length, 1, 'XHRequestTest should create one XMLHttpRequest instance');
        });
        it('should give the correct response text', () => {
            // iOS does not return with application/octet-stream - This should be confirmed if expected
            assert.isNotNull(responseText.match(/data:.*;base64,SGVsbG9Xb3JsZCE=/i), `${responseText} did not match regex`);
        });
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiWEhSZXF1ZXN0VGVzdC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3Rlc3QvVW5pdC9Db3JlL1V0aWxpdGllcy9YSFJlcXVlc3RUZXN0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQSxPQUFPLEVBQUUsTUFBTSxFQUFFLE1BQU0sTUFBTSxDQUFDO0FBQzlCLE9BQU8sRUFBRSxTQUFTLEVBQUUsTUFBTSwwQkFBMEIsQ0FBQztBQUNyRCxPQUFPLE9BQU8sQ0FBQztBQUNmLE9BQU8sS0FBSyxLQUFLLE1BQU0sT0FBTyxDQUFDO0FBQy9CLE9BQU8sRUFBRSxZQUFZLEVBQUUsTUFBTSwwQkFBMEIsQ0FBQztBQUV4RCxRQUFRLENBQUMsZUFBZSxFQUFFLEdBQUcsRUFBRTtJQUUzQixJQUFJLE1BQTZCLENBQUM7SUFFbEMsVUFBVSxDQUFDLEdBQUcsRUFBRTtRQUNaLE1BQU0sR0FBRyxLQUFLLENBQUMsVUFBVSxDQUFDLE1BQU0sQ0FBQztZQUM3QixXQUFXLEVBQUUsSUFBSTtZQUNqQixnQkFBZ0IsRUFBRSxDQUFDO1NBQ3RCLENBQUMsQ0FBQztJQUNQLENBQUMsQ0FBQyxDQUFDO0lBRUgsU0FBUyxDQUFDLEdBQUcsRUFBRTtRQUNYLE1BQU0sQ0FBQyxPQUFPLEVBQUUsQ0FBQztJQUNyQixDQUFDLENBQUMsQ0FBQztJQUVILFFBQVEsQ0FBQyxLQUFLLEVBQUUsR0FBRyxFQUFFO1FBQ2pCO1lBQ0ksQ0FBQyxHQUFHLEVBQUUsRUFBRSxFQUFFLElBQUksQ0FBQztZQUNmLENBQUMsR0FBRyxFQUFFLEVBQUUsRUFBRSxpQkFBaUIsQ0FBQztTQUMvQixDQUFDLE9BQU8sQ0FBQyxDQUFDLE1BQU0sRUFBRSxFQUFFLENBQ2pCLEVBQUUsQ0FBQyw4Q0FBOEMsTUFBTSxDQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUUsR0FBRyxFQUFFO1lBQy9ELE1BQU0sQ0FBQyxXQUFXLENBQUMsS0FBSyxFQUFFLDhCQUE4QixFQUFFLE1BQU0sQ0FB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