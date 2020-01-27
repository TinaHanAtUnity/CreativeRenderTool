const OmidVerification = require('html/omid/omid3p.html');

describe('omid3p', () => {
    let omid3p;
    let postMessageSpy;

    beforeAll(() => {
        omid3p = OmidVerification.substring(34, OmidVerification.length - 30);
        eval(omid3p);
    });

    describe('omid3p api', () => {

        beforeEach(() => {
            postMessageSpy = jest.fn();
            window.postMessage = postMessageSpy;
        });

        it('isSupported should return true', () => {
            expect(window.omid3p.isSupported()).toEqual(true);
        });

        it('adding an event listener should pass adjusted event string', () => {
            window.omid3p.addEventListener('impression', () => jest.fn());
            expect(window.postMessage).toBeCalled();
            expect(window.postMessage).toBeCalledWith({
                data: {
                    eventName: 'omidImpression',
                    uuid: '1',
                    vendorKey: ''
                }, 
                event: 'onEventRegistered',
                type: 'omid'
            }, '*');
        });
    });

    describe('session start', () => {
        beforeEach(() => {
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

        it('should call session start registered observer', () => {
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
            expect(observer).toHaveBeenCalledWith({
                adSessionId: '1',
                timestamp: 1,
                type: 'sessionStart',
                data: {
                    context: {}
                }
            });
            expect(window.postMessage).toHaveBeenCalledTimes(2);
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
