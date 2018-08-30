import 'mocha';
import { assert } from 'chai';
import * as sinon from 'sinon';
import { XHRequest } from 'Utilities/XHRequest';

describe('XHRequestTest', () => {

    let server: sinon.SinonFakeServer;

    beforeEach(() => {
        server = sinon.fakeServer.create({
            autoRespond: true,
            autoRespondAfter: 5
        });
    });

    afterEach(() => {
        server.restore();
    });

    [
        [200, {}, 'OK'],
        [299, {}, 'Status code 299']
    ].forEach((params) =>
        it(`should give an OK response for status code ${params[0]}`, () => {
            server.respondWith('GET', 'https://api.unity3d.com/test', params);

            return XHRequest.get('https://api.unity3d.com/test').then((responseText) => {
                assert.equal(server.requests.length, 1, 'XHRequestTest should create one XMLHttpRequest instance');
                assert.equal(params[2], responseText);
            });
        })
    );

    [
        [199, {}, 'Status code 199'], // Lower border
        [300, {}, 'Bad Request'], // Upper border
        [404, {}, 'File not found'], // Common HTTP error code
        [500, {}, 'Server Error'] // Common HTTP error code
    ].forEach((params) =>
        it(`should fail from bad response for status code ${params[0]}`, async () => {
            server.respondWith('GET', 'https://api.unity3d.com/test', params);

            try {
                await XHRequest.get('https://api.unity3d.com/test');
            } catch(err) {
                assert.equal(server.requests.length, 1, 'XHRequestTest should create one XMLHttpRequest instance');
                assert.isTrue(err instanceof Error, 'Did not fail from the file not being found');
                assert.equal(err.toString(), `Error: Request failed with status code ${params[0]}`);
                return;
            }
            assert.fail('Promise was not rejected');
        })
    );

    // Test skipped since is not faking XMLHttpRequest properly.
    xit('should give an OK response from the file', () => {
        server.respondWith('GET', 'file:///path/to/file.txt', [0, {}, 'File content']);

        return XHRequest.get('file:///path/to/file.txt').then((responseText) => {
            assert.equal(server.requests.length, 1, 'XHRequestTest should create one XMLHttpRequest instance');
            assert.equal('File content', responseText);
        });
    });

    it('should fail from file:// with status not 0', async () => {
        server.respondWith('GET', /\/path\/to\/file.txt$/, [300, {}, 'Text']);

        try {
            await XHRequest.get('file:///path/to/file.txt');
        } catch(err) {
            assert.equal(server.requests.length, 1, 'XHRequestTest should create one XMLHttpRequest instance');
            assert.isTrue(err instanceof Error, 'Did not fail from the error');
            assert.equal(err.toString(), 'Error: Request failed with status code 300');
            return;
        }

        assert.fail('Promise was not rejected');
    });

    it('should fail from network error', async () => {
        const promise = XHRequest.get('https://api.unity3d.com/test');

        assert.equal(server.requests.length, 1, 'XHRequestTest should create one XMLHttpRequest instance');

        // Simulating network error
        server.requests[0].error();

        try {
            await promise;
        } catch(err) {
            assert.isTrue(err instanceof Error, 'Did not fail from the error');
            assert.equal(err.toString(), 'Error: Error ocurred while executing request: status - 0');
            return;
        }

        assert.fail('Promise was not rejected');
    });

    it('should fail from abort', async () => {
        const promise = XHRequest.get('https://api.unity3d.com/test');

        assert.equal(server.requests.length, 1, 'XHRequestTest should create one XMLHttpRequest instance');

        // Calling abort on our XMLHttpRequest
        const xhr: any = server.requests[0];
        xhr.abort();

        try {
            await promise;
        } catch(err) {
            assert.isTrue(err instanceof Error, 'Did not fail from the error');
            assert.equal(err.toString(), 'Error: Request was aborted');
            return;
        }

        assert.fail('Promise was not rejected');
    });

    it('should fail from timeout error', async () => {
        const promise = XHRequest.get('https://api.unity3d.com/test');

        const xhr: any = server.requests[0];
        xhr.timedOut = true; // Accessing internal sinon variable to trigger timeout. HACK!
        xhr.respond(200, {}, '');

        try {
            await promise;
        } catch(err) {
            assert.isTrue(err instanceof Error, 'Did not fail from the error');
            assert.equal(err.toString(), 'Error: Request timed out');
            return;
        }

        assert.fail('Promise was not rejected');
    });

    it('should call open with GET', async () => {
        const openSpy = sinon.spy(XMLHttpRequest.prototype, 'open');
        server.respondWith('GET', 'https://api.unity3d.com/test', [200, {}, 'OK']);

        try {
            await XHRequest.get('https://api.unity3d.com/test');
        } catch(err) {
            // ignore error
        } finally {
            // Restoring 'open' method even in error case
            openSpy.restore();
        }

        assert.equal(server.requests.length, 1, 'XHRequestTest should create one XMLHttpRequest instance');
        assert.isTrue(openSpy.called, 'Did not call function open'); // Checking if actually did a call
        assert.equal(openSpy.firstCall.args[0], 'GET', 'Did not call function open with GET');
    });

    // Checking if we are calling decodeURIComponent or not.
    [
        ['https://api.unity3d.com/test', 'https://api.unity3d.com/test'],
        ['https://api.unity3d.com/test%3Fx%3Dtest', 'https://api.unity3d.com/test?x=test']
    ].forEach(([url, decodedUrl]) =>
        it('should correctly decode url ' + decodedUrl, () => {
            server.respondWith('GET', decodedUrl, [200, {}, 'data']);
            return XHRequest.get(url).then(() => {
                assert.equal(server.requests.length, 1, 'XHRequestTest should create one XMLHttpRequest instance');
            });
        })
    );
});
