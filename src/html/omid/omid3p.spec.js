const OmidVerification = require('html/omid/omid3p.html');

describe('omid3p', () => {
    let omid3p;
    let postMessageSpy;

    beforeAll(() => {
        omid3p = OmidVerification.substring(34, OmidVerification.length - 30);
    });

    describe('omid3p api', () => {

        beforeEach(() => {
            eval(omid3p);
            window.postMessage = jest.fn();
        });

        it('isSupported should return true', () => {
            expect(window.omid3p.isSupported()).toEqual(true);
        });

        it('customNative should be true', () => {
            expect(window.omid3p.customNative).toEqual(true);
        });

        it('adding an event listener should pass adjusted event string', () => {
            window.omid3p.addEventListener('impression', () => jest.fn());
            expect(window.postMessage).toBeCalled();
            expect(window.postMessage).toBeCalledWith({
                data: {
                    eventName: 'omidImpression',
                    uuid: '1',
                    vendorKey: '',
                    iframeId: '{{ IFRAME_ID_ }}'
                },
                event: 'onEventRegistered',
                type: 'omid'
            }, '*');
        });
    });

    describe('postback', () => {
        beforeEach(() => {
            eval(omid3p);
            window.postMessage = jest.fn();
        });

        it ('should postmessage to typescript with omid event', () => {
            window.omid3p.postback('onEventProcessed', { eventType: 'loadError' });
            expect(window.postMessage).toBeCalledWith({
                type: 'omid',
                event: 'onEventProcessed',
                data: {
                    eventType: 'loadError'
                }
            }, '*');
        });
    });

    describe('session finish', () => {
        beforeEach(() => {
            eval(omid3p);
        });

        it('should call session finish with missing data', () => {
            const sessionEvent = {
                adSessionId: '1',
                timestamp: 1,
                type: 'sessionFinish',
                data: {}
            };

            const messageEvent = {
                data: sessionEvent
            };

            const observer = jest.fn();
            window.omid3p.registerSessionObserver(observer, 'beforekey');
            window.omid3p.get('handleSessionEvents')(messageEvent);
            expect(observer).toHaveBeenCalledWith({
                adSessionId: '1',
                timestamp: 1,
                type: 'sessionFinish'
            });
        });
    });

    describe('session start', () => {
        beforeEach(() => {
            eval(omid3p);
            postMessageSpy = jest.fn();
            window.postMessage = postMessageSpy;
        });

        it('should store session start data without observer', () => {
            const sessionEvent = {
                adSessionId: '1',
                timestamp: 1,
                type: 'sessionStart',
                data: {
                    context: {},
                    vendorkey: 'default_key'
                }
            }

            const messageEvent = {
                data: sessionEvent
            }
            window.omid3p.get('handleSessionStart')(messageEvent);
            expect(window.postMessage).not.toHaveBeenCalled();
        });

        it('should call session start for registered observer', () => {
            const sessionEvent = {
                adSessionId: '1',
                timestamp: 1,
                type: 'sessionStart',
                data: {
                    context: {},
                    vendorkey: 'default_key'
                }
            }

            const messageEvent = {
                data: sessionEvent
            }
            const observer = jest.fn();
            window.omid3p.registerSessionObserver(observer, 'beforekey');
            window.omid3p.get('handleSessionStart')(messageEvent);

            expect(window.postMessage).toHaveBeenCalledTimes(2);

            expect(observer).toHaveBeenCalledWith({
                adSessionId: '1',
                timestamp: 1,
                type: 'sessionStart',
                data: {
                    context: {}
                }
            });

            expect(window.postMessage).lastCalledWith({
                event: 'onEventProcessed',
                type: 'omid',
                data: {
                    eventType: 'sessionStart',
                    vendorKey: 'default_key'
                }
            }, '*');
        });

        it('should call session start for registered observer even without vendor key from verification', () => {
            const sessionEvent = {
                adSessionId: '1',
                timestamp: 1,
                type: 'sessionStart',
                data: {
                    context: {},
                    vendorkey: 'default_key'
                }
            }

            const messageEvent = {
                data: sessionEvent
            }
            const observer = jest.fn();
            window.omid3p.registerSessionObserver(observer);
            window.omid3p.get('handleSessionStart')(messageEvent);

            expect(window.postMessage).toHaveBeenCalledTimes(2);

            expect(observer).toHaveBeenCalledWith({
                adSessionId: '1',
                timestamp: 1,
                type: 'sessionStart',
                data: {
                    context: {}
                }
            });

            expect(window.postMessage).lastCalledWith({
                event: 'onEventProcessed',
                type: 'omid',
                data: {
                    eventType: 'sessionStart',
                    vendorKey: 'default_key'
                }
            }, '*');
        });
    });
});
