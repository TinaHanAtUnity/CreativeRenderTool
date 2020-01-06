const OMIDSessionClient = require('html/omid/admob-session-interface.html');

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

    it('should call session start with correct data', () => {

        jest.spyOn(global, 'Date').mockImplementationOnce(() => + new Date('1'));

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
                    'accessMode': undefined,
                    'adSessionType': undefined,
                    'apiVersion': '{{ OMID_API_VERSION }}',
                    'app': undefined,
                    'customReferenceIdentifier': undefined,
                    'environment': undefined,
                    'omidJsInfo': undefined,
                    'omidNativeInfo': undefined,
                    'supports': undefined,
                  },
                },
                'timestamp': NaN,
                'type': 'sessionStart',
              }
        }, '*')
    });

    // register session observer is not required to be called
    it('should call session start with correct data if register session observer is called', () => {

        jest.spyOn(global, 'Date').mockImplementationOnce(() => + new Date('1'));

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

        window.omidSessionInterface.setClientInfo('1.0', 'google', '1.1')
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
                        'omidImplementer': '{{ OMID_IMPLEMENTOR }}'
                    },
                    'customReferenceIdentifier': undefined,
                    'environment': 'app',
                    'omidJsInfo': {
                        'omidImplementer': '{{ OMID_IMPLEMENTOR }}',
                        'partnerName': 'google',
                        'partnerVersion': '1.1',
                        'serviceVersion': '1.2.10',
                        'sessionClientVersion': '1.0',
                    },
                    'omidNativeInfo': {
                        'partnerName': 'Unity3d',
                        'partnerVersion': undefined
                    },
                    'supports': ['vlid', 'clid'],
                  },
                },
                'timestamp': NaN,
                'type': 'sessionStart',
              }
        }, '*')
    });
});
