import { Core } from 'Core/__mocks__/Core';
import {
    IDataRequestResponse,
    PrivacyDataRequestHelper
} from 'Privacy/PrivacyDataRequestHelper';
import { Platform } from 'Core/Constants/Platform';
import { ICore } from 'Core/ICore';
import { RequestManagerMock, RequestManager } from 'Core/Managers/__mocks__/RequestManager';

describe ('PrivacyDataRequestHelper tests', () => {

    let core: ICore;
    let requestManager: RequestManagerMock;

    beforeEach(() => {
        core = new Core();
        core.NativeBridge.getPlatform = jest.fn().mockReturnValue(Platform.IOS);
        core.DeviceInfo.getAdvertisingIdentifier = jest.fn().mockReturnValue('1111-1111');
        core.ClientInfo.getGameId = jest.fn().mockReturnValue('14850');
        core.ClientInfo.getApplicationName = jest.fn().mockReturnValue('com.test.bundle');
        core.Config.getUnityProjectId = jest.fn().mockReturnValue('test-project-id');
        core.DeviceInfo.getLanguage = jest.fn().mockReturnValue('en');
        core.Config.getCountry = jest.fn().mockReturnValue('FI');
        core.Config.getSubdivision = jest.fn().mockReturnValue('SD');
        core.Config.getToken = jest.fn().mockReturnValue('test-token');

        requestManager = new RequestManager();
        core.RequestManager = requestManager;

        PrivacyDataRequestHelper.init(core);

    });

    describe ('when sending captcha init requests', () => {
        let response: IDataRequestResponse;

        describe('checking arguments', () => {
            beforeEach(async () => {
                response = await PrivacyDataRequestHelper.sendInitRequest('test@test.com');
            });

            it('should have called RequestManager.post once', () => {
                expect(core.RequestManager.post).toHaveBeenCalledTimes(1);
            });

            it('should have called RequestManager.post with right arguments', () => {
                const url = 'https://us-central1-unity-ads-debot-prd.cloudfunctions.net/debot/init';
                const testData = '{\"idfa\":\"1111-1111\",\"gameID\":\"14850\",\"bundleID\":\"com.test.bundle\",\"projectID\":\"test-project-id\",\"platform\":\"ios\",\"language\":\"en\",\"country\":\"FI\",\"subdivision\":\"SD\",\"token\":\"test-token\",\"email\":\"test@test.com\"}';
                expect(core.RequestManager.post).toHaveBeenCalledWith(url, testData);
            });
        });
    });

    describe ('when sending captcha verify requests', () => {
        let response: IDataRequestResponse;

        describe('checking arguments', () => {
            beforeEach(async () => {
                response = await PrivacyDataRequestHelper.sendVerifyRequest('test@test.com', 'test.png');
            });

            it('should have called RequestManager.post once', () => {
                expect(core.RequestManager.post).toHaveBeenCalledTimes(1);
            });

            it('should have called RequestManager.post with right arguments', () => {
                const url = 'https://us-central1-unity-ads-debot-prd.cloudfunctions.net/debot/verify';
                const testData = '{\"idfa\":\"1111-1111\",\"gameID\":\"14850\",\"bundleID\":\"com.test.bundle\",\"projectID\":\"test-project-id\",\"platform\":\"ios\",\"language\":\"en\",\"country\":\"FI\",\"subdivision\":\"SD\",\"token\":\"test-token\",\"email\":\"test@test.com\",\"answer\":\"test.png\"}';
                expect(core.RequestManager.post).toHaveBeenCalledWith(url, testData);
            });
        });
    });
});
