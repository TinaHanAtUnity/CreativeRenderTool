import * as tslib_1 from "tslib";
import { Core } from 'Core/__mocks__/Core';
import { PrivacyDataRequestHelper } from 'Privacy/PrivacyDataRequestHelper';
import { Platform } from 'Core/Constants/Platform';
import { RequestManager } from 'Core/Managers/__mocks__/RequestManager';
import { UserPrivacyManager } from 'Ads/Managers/__mocks__/UserPrivacyManager';
import { PrivacySDK } from 'Privacy/__mocks__/PrivacySDK';
import { AgeGateChoice, LegalFramework } from 'Ads/Managers/UserPrivacyManager';
describe('PrivacyDataRequestHelper tests', () => {
    let core;
    let requestManager;
    let userPrivacyManager;
    let privacySDK;
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
        core.Config.isCoppaCompliant = jest.fn().mockReturnValue(true);
        core.Config.getAbGroup = jest.fn().mockReturnValue(100);
        requestManager = new RequestManager();
        core.RequestManager = requestManager;
        userPrivacyManager = new UserPrivacyManager();
        userPrivacyManager.getLegalFramework = jest.fn().mockReturnValue(LegalFramework.CCPA);
        userPrivacyManager.getAgeGateChoice = jest.fn().mockReturnValue(AgeGateChoice.YES);
        privacySDK = new PrivacySDK();
        PrivacyDataRequestHelper.init(core, userPrivacyManager, privacySDK);
    });
    describe('when sending captcha init requests', () => {
        let response;
        describe('checking arguments', () => {
            beforeEach(() => tslib_1.__awaiter(this, void 0, void 0, function* () {
                response = yield PrivacyDataRequestHelper.sendInitRequest('test@test.com');
            }));
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
    describe('when sending captcha verify requests', () => {
        let response;
        describe('checking arguments', () => {
            beforeEach(() => tslib_1.__awaiter(this, void 0, void 0, function* () {
                response = yield PrivacyDataRequestHelper.sendVerifyRequest('test@test.com', 'test.png');
            }));
            it('should have called RequestManager.post once', () => {
                expect(core.RequestManager.post).toHaveBeenCalledTimes(1);
            });
            it('should have called RequestManager.post with right arguments', () => {
                const url = 'https://us-central1-unity-ads-debot-prd.cloudfunctions.net/debot/verify';
                const testData = '{\"idfa\":\"1111-1111\",\"gameID\":\"14850\",\"bundleID\":\"com.test.bundle\",\"projectID\":\"test-project-id\",\"platform\":\"ios\",\"language\":\"en\",\"country\":\"FI\",\"subdivision\":\"SD\",\"token\":\"test-token\",\"email\":\"test@test.com\",\"answer\":\"test.png\",\"abGroup\":100,\"legalFramework\":\"ccpa\",\"agreedOverAgeLimit\":\"yes\",\"agreedVersion\":0,\"coppa\":true,\"layout\":\"\"}';
                expect(core.RequestManager.post).toHaveBeenCalledWith(url, testData);
            });
        });
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUHJpdmFjeURhdGFSZXF1ZXN0SGVscGVyLnNwZWMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9zcmMvdHMvUHJpdmFjeS9Qcml2YWN5RGF0YVJlcXVlc3RIZWxwZXIuc3BlYy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUEsT0FBTyxFQUFFLElBQUksRUFBRSxNQUFNLHFCQUFxQixDQUFDO0FBQzNDLE9BQU8sRUFFSCx3QkFBd0IsRUFDM0IsTUFBTSxrQ0FBa0MsQ0FBQztBQUMxQyxPQUFPLEVBQUUsUUFBUSxFQUFFLE1BQU0seUJBQXlCLENBQUM7QUFFbkQsT0FBTyxFQUFzQixjQUFjLEVBQUUsTUFBTSx3Q0FBd0MsQ0FBQztBQUM1RixPQUFPLEVBQTBCLGtCQUFrQixFQUFFLE1BQU0sMkNBQTJDLENBQUM7QUFDdkcsT0FBTyxFQUFrQixVQUFVLEVBQUUsTUFBTSw4QkFBOEIsQ0FBQztBQUMxRSxPQUFPLEVBQUUsYUFBYSxFQUFFLGNBQWMsRUFBRSxNQUFNLGlDQUFpQyxDQUFDO0FBRWhGLFFBQVEsQ0FBRSxnQ0FBZ0MsRUFBRSxHQUFHLEVBQUU7SUFFN0MsSUFBSSxJQUFXLENBQUM7SUFDaEIsSUFBSSxjQUFrQyxDQUFDO0lBQ3ZDLElBQUksa0JBQTBDLENBQUM7SUFDL0MsSUFBSSxVQUEwQixDQUFDO0lBRS9CLFVBQVUsQ0FBQyxHQUFHLEVBQUU7UUFDWixJQUFJLEdBQUcsSUFBSSxJQUFJLEVBQUUsQ0FBQztRQUNsQixJQUFJLENBQUMsWUFBWSxDQUFDLFdBQVcsR0FBRyxJQUFJLENBQUMsRUFBRSxFQUFFLENBQUMsZUFBZSxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUN4RSxJQUFJLENBQUMsVUFBVSxDQUFDLHdCQUF3QixHQUFHLElBQUksQ0FBQyxFQUFFLEVBQUUsQ0FBQyxlQUFlLENBQUMsV0FBVyxDQUFDLENBQUM7UUFDbEYsSUFBSSxDQUFDLFVBQVUsQ0FBQyxTQUFTLEdBQUcsSUFBSSxD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