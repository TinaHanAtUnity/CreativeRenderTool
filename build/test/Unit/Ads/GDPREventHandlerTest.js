import { Orientation } from 'Ads/AdUnits/Containers/AdUnitContainer';
import { ViewController } from 'Ads/AdUnits/Containers/ViewController';
import { OverlayEventHandler } from 'Ads/EventHandlers/OverlayEventHandler';
import { GDPREventAction, GDPREventSource, LegalFramework, UserPrivacyManager } from 'Ads/Managers/UserPrivacyManager';
import { OperativeEventManager } from 'Ads/Managers/OperativeEventManager';
import { ThirdPartyEventManager } from 'Ads/Managers/ThirdPartyEventManager';
import { Video } from 'Ads/Models/Assets/Video';
import { Placement } from 'Ads/Models/Placement';
import { VideoOverlay } from 'Ads/Views/VideoOverlay';
import { Privacy } from 'Ads/Views/Privacy';
import { Platform } from 'Core/Constants/Platform';
import { FocusManager } from 'Core/Managers/FocusManager';
import { ClientInfo } from 'Core/Models/ClientInfo';
import { DeviceInfo } from 'Core/Models/DeviceInfo';
import 'mocha';
import { PerformanceAdUnit } from 'Performance/AdUnits/PerformanceAdUnit';
import { PerformanceCampaign } from 'Performance/Models/PerformanceCampaign';
import { PerformanceEndScreen } from 'Performance/Views/PerformanceEndScreen';
import * as sinon from 'sinon';
import { TestFixtures } from 'TestHelpers/TestFixtures';
import { RequestManager } from 'Core/Managers/RequestManager';
import { PrivacySDK } from 'Privacy/PrivacySDK';
import { GamePrivacy, PrivacyMethod, UserPrivacy } from 'Privacy/Privacy';
describe('GDPREventHandlerTest', () => {
    const sandbox = sinon.createSandbox();
    let platform;
    let backend;
    let nativeBridge;
    let core;
    let ads;
    let store;
    let adUnit;
    let adUnitParameters;
    let deviceInfo;
    let clientInfo;
    let gdprEventHandler;
    beforeEach(() => {
        platform = Platform.ANDROID;
        backend = TestFixtures.getBackend(platform);
        nativeBridge = TestFixtures.getNativeBridge(platform, backend);
        core = TestFixtures.getCoreApi(nativeBridge);
        ads = TestFixtures.getAdsApi(nativeBridge);
        store = TestFixtures.getStoreApi(nativeBridge);
        deviceInfo = TestFixtures.getAndroidDeviceInfo(core);
        sandbox.stub(deviceInfo, 'getLimitAdTracking').returns(false);
        clientInfo = TestFixtures.getClientInfo(Platform.ANDROID);
        adUnitParameters = {
            platform,
            core,
            ads,
            store,
            forceOrientation: Orientation.LANDSCAPE,
            focusManager: sinon.createStubInstance(FocusManager),
            container: sinon.createStubInstance(ViewController),
            deviceInfo: sinon.createStubInstance(DeviceInfo),
            clientInfo: sinon.createStubInstance(ClientInfo),
            thirdPartyEventManager: sinon.createStubInstance(ThirdPartyEventManager),
            operativeEventManager: sinon.createStubInstance(OperativeEventManager),
            placement: sinon.createStubInstance(Placement),
            campaign: sinon.createStubInstance(PerformanceCampaign),
            coreConfig: TestFixtures.getCoreConfiguration(),
            adsConfig: TestFixtures.getAdsConfiguration(),
            request: sinon.createStubInstance(RequestManager),
            options: {},
            endScreen: sinon.createStubInstance(PerformanceEndScreen),
            overlay: sinon.createStubInstance(VideoOverlay),
            video: sinon.createStubInstance(Video),
            privacy: sinon.createStubInstance(Privacy),
            privacyManager: sinon.createStubInstance(UserPrivacyManager),
            privacySDK: sinon.createStubInstance(PrivacySDK)
        };
        adUnit = sinon.createStubInstance(PerformanceAdUnit);
        gdprEventHandler = new OverlayEventHandler(adUnit, adUnitParameters);
    });
    describe('When calling onGDPRPopupSkipped on legalFramework GDPR', () => {
        beforeEach(() => {
            adUnitParameters.privacySDK.getLegalFramework.returns(LegalFramework.GDPR);
            adUnitParameters.privacySDK.getGamePrivacy.returns(new GamePrivacy({ method: PrivacyMethod.LEGITIMATE_INTEREST }));
        });
        it('should send GDPR skip event', () => {
            gdprEventHandler.onGDPRPopupSkipped();
            sinon.assert.calledWith(adUnitParameters.privacyManager.updateUserPrivacy, UserPrivacy.PERM_SKIPPED_LEGITIMATE_INTEREST_GDPR, GDPREventSource.USER_INDIRECT, GDPREventAction.SKIPPED_BANNER);
        });
    });
    describe('When calling onGDPRPopupSkipped on legalFramework CCPA', () => {
        beforeEach(() => {
            adUnitParameters.privacySDK.getLegalFramework.returns(LegalFramework.CCPA);
            adUnitParameters.privacySDK.getGamePrivacy.returns(new GamePrivacy({ method: PrivacyMethod.LEGITIMATE_INTEREST }));
        });
        it('should send GDPR skip event', () => {
            gdprEventHandler.onGDPRPopupSkipped();
            sinon.assert.calledWith(adUnitParameters.privacyManager.updateUserPrivacy, UserPrivacy.PERM_SKIPPED_LEGITIMATE_INTEREST, GDPREventSource.USER_INDIRECT, GDPREventAction.SKIPPED_BANNER);
        });
    });
    describe('GDPR skip event should not be sent if user privacy is already recorded', () => {
        beforeEach(() => {
            adUnitParameters.privacySDK.isOptOutRecorded.returns(true);
        });
        it('GDPR skip event should not be sent', () => {
            gdprEventHandler.onGDPRPopupSkipped();
            sinon.assert.notCalled(adUnitParameters.privacyManager.updateUserPrivacy);
        });
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiR0RQUkV2ZW50SGFuZGxlclRlc3QuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi90ZXN0L1VuaXQvQWRzL0dEUFJFdmVudEhhbmRsZXJUZXN0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBRSxXQUFXLEVBQUUsTUFBTSx3Q0FBd0MsQ0FBQztBQUNyRSxPQUFPLEVBQUUsY0FBYyxFQUFFLE1BQU0sdUNBQXVDLENBQUM7QUFDdkUsT0FBTyxFQUFFLG1CQUFtQixFQUFFLE1BQU0sdUNBQXVDLENBQUM7QUFFNUUsT0FBTyxFQUFFLGVBQWUsRUFBRSxlQUFlLEVBQUUsY0FBYyxFQUFFLGtCQUFrQixFQUFFLE1BQU0saUNBQWlDLENBQUM7QUFDdkgsT0FBTyxFQUFFLHFCQUFxQixFQUFFLE1BQU0sb0NBQW9DLENBQUM7QUFDM0UsT0FBTyxFQUFFLHNCQUFzQixFQUFFLE1BQU0scUNBQXFDLENBQUM7QUFDN0UsT0FBTyxFQUFFLEtBQUssRUFBRSxNQUFNLHlCQUF5QixDQUFDO0FBQ2hELE9BQU8sRUFBRSxTQUFTLEVBQUUsTUFBTSxzQkFBc0IsQ0FBQztBQUNqRCxPQUFPLEVBQUUsWUFBWSxFQUFFLE1BQU0sd0JBQXdCLENBQUM7QUFDdEQsT0FBTyxFQUFFLE9BQU8sRUFBRSxNQUFNLG1CQUFtQixDQUFDO0FBRTVDLE9BQU8sRUFBRSxRQUFRLEVBQUUsTUFBTSx5QkFBeUIsQ0FBQztBQUVuRCxPQUFPLEVBQUUsWUFBWSxFQUFFLE1BQU0sNEJBQTRCLENBQUM7QUFDMUQsT0FBTyxFQUFFLFVBQVUsRUFBRSxNQUFNLHdCQUF3QixDQUFDO0FBQ3BELE9BQU8sRUFBRSxVQUFVLEVBQUUsTUFBTSx3QkFBd0IsQ0FBQztBQUdwRCxPQUFPLE9BQU8sQ0FBQztBQUNmLE9BQU8sRUFBZ0MsaUJBQWlCLEVBQUUsTUFBTSx1Q0FBdUMsQ0FBQztBQUN4RyxPQUFPLEVBQUUsbUJBQW1CLEVBQUUsTUFBTSx3Q0FBd0MsQ0FBQztB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