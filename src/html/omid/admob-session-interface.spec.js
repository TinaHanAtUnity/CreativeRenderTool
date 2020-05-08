const OMIDSessionClient = require('html/omid/admob-session-interface.html');

jest.useFakeTimers();

describe('AdmobSessionInterface', () => {
    let omid_session_interface;
    let postMessageSpy;

    beforeAll(() => {
        omid_session_interface = OMIDSessionClient.substring(8, OMIDSessionClient.length - 10);
        eval(omid_session_interface);
    });

    beforeEach(() => {
        postMessageSpy = jest.fn();
        window.postMessage = postMessageSpy;
    });

    describe('reportError',() => {
        it('should not break when sessionCallback is not set', () => {
            window.omidSessionInterface.reportError('error', 'was an error');
            expect(postMessageSpy).toBeCalled();
        });
    });

    describe('set video element', () => {
        it('should be passed a string reprensentation of an element', () => {
            let element = document.createElement('video');
            window.omidSessionInterface.setVideoElement(element);
            expect(postMessageSpy).toBeCalledWith({
                'data': {
                    'videoElement': '[object HTMLVideoElement]',
                },
                'event': 'videoElement',
                'type': 'omid'
            }, '*');
        });
    });

    describe('verification injection', () => {
        afterEach(() => {
            jest.clearAllTimers();
        });

        it('should inject multiple verification resources', () => {
            const theData1 = {
                resourceUrl: 'https://team-playa-shaown.scoot.mcdoot.doot',
                vendorKey: 'team-playa-shaown',
                verificationParameters: 'scooter.mcdooter'
            };

            const theData2 = {
                resourceUrl: 'https://have-you-eva.doot',
                vendorKey: 'have-you-eva',
                verificationParameters: 'have-you-eva'
            };

            window.omidSessionInterface.injectVerificationScriptResources([theData1, theData2]);

            expect(postMessageSpy).toBeCalledWith({
                type: 'omid',
                event: 'verificationResources',
                data:
                [{
                    resourceUrl: 'https://team-playa-shaown.scoot.mcdoot.doot',
                    vendorKey: 'team-playa-shaown',
                    verificationParameters: 'scooter.mcdooter'
                },
                {
                    resourceUrl: 'https://have-you-eva.doot',
                    vendorKey: 'have-you-eva',
                    verificationParameters: 'have-you-eva'
                }]
            }, '*');
        });
    });

    describe('register ad events', () => {
        it('should call session start with correct data', () => {

            const DATE_TO_USE = new Date('2020');
            global.Date = jest.fn(() => DATE_TO_USE);

            const theData1 = {
                resourceUrl: 'https://team-playa-shaown.scoot.mcdoot.doot',
                vendorKey: 'team-playa-shaown',
                verificationParameters: 'scooter.mcdooter'
            };

            const theData2 = {
                resourceUrl: 'https://have-you-eva.doot',
                vendorKey: 'have-you-eva',
                verificationParameters: 'have-you-eva'
            };

            window.omidSessionInterface.injectVerificationScriptResources([theData1, theData2]);
            window.omidSessionInterface.registerAdEvents();

            expect(postMessageSpy).lastCalledWith({
                type: 'omid',
                event: 'sessionStart',
                data: {
                    'adSessionId': undefined,
                    'data': {
                      'context': {
                        'accessMode': 'limited',
                        'adSessionType': 'html',
                        'apiVersion': '{{ OMID_API_VERSION }}',
                        'app': {
                            'adId': undefined,
                            'appId': 'com.unity.ads',
                            'libraryVersion': '1.2.10',
                            'omidImplementor': '{{ OMID_IMPLEMENTOR }}'
                        },
                        'customReferenceIdentifier': undefined,
                        'environment': 'app',
                        'omidJsInfo': undefined,
                        'omidNativeInfo': undefined,
                        'supports': ['vlid', 'clid'],
                      },
                    },
                    'timestamp': 1577836800000,
                    'type': 'sessionStart',
                  }
            }, '*')
        });

        // register session observer is not required to be called
        it('should call session start with correct data if register session observer is called', () => {

            const DATE_TO_USE = new Date('2020');
            global.Date = jest.fn(() => DATE_TO_USE);

            const theData1 = {
                resourceUrl: 'https://team-playa-shaown.scoot.mcdoot.doot',
                vendorKey: 'team-playa-shaown',
                verificationParameters: 'scooter.mcdooter'
            };

            const theData2 = {
                resourceUrl: 'https://have-you-eva.doot',
                vendorKey: 'have-you-eva',
                verificationParameters: 'have-you-eva'
            };

            window.omidSessionInterface.setClientInfo('1.2.10', 'google', '1.1')
            window.omidSessionInterface.registerSessionObserver(() => void 0);

            window.omidSessionInterface.injectVerificationScriptResources([theData1, theData2]);
            window.omidSessionInterface.registerAdEvents();

            expect(postMessageSpy).lastCalledWith({
                type: 'omid',
                event: 'sessionStart',
                data: {
                    'adSessionId': undefined,
                    'data': {
                      'context': {
                        'accessMode': 'limited',
                        'adSessionType': 'html',
                        'apiVersion': '{{ OMID_API_VERSION }}',
                        'app': {
                            'adId': undefined,
                            'appId': 'com.unity.ads',
                            'libraryVersion': '1.2.10',
                            'omidImplementor': '{{ OMID_IMPLEMENTOR }}'
                        },
                        'customReferenceIdentifier': undefined,
                        'environment': 'app',
                        'omidJsInfo': {
                            'omidImplementor': '{{ OMID_IMPLEMENTOR }}',
                            'partnerName': 'google',
                            'partnerVersion': '1.1',
                            'serviceVersion': '1.2.10',
                            'sessionClientVersion': '1.2.10',
                        },
                        'omidNativeInfo': {
                            'partnerName': 'Unity3d',
                            'partnerVersion': undefined
                        },
                        'supports': ['vlid', 'clid'],
                      },
                    },
                    'timestamp': 1577836800000,
                    'type': 'sessionStart',
                  }
            }, '*');
        });
    });
});
