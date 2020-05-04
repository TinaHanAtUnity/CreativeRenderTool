import { Orientation } from 'Ads/AdUnits/Containers/AdUnitContainer';
import { ViewController } from 'Ads/AdUnits/Containers/ViewController';
import { OverlayEventHandler } from 'Ads/EventHandlers/OverlayEventHandler';
import { IAdsApi } from 'Ads/IAds';
import { GDPREventAction, GDPREventSource, LegalFramework, UserPrivacyManager } from 'Ads/Managers/UserPrivacyManager';
import { OperativeEventManager } from 'Ads/Managers/OperativeEventManager';
import { ThirdPartyEventManager } from 'Ads/Managers/ThirdPartyEventManager';
import { Video } from 'Ads/Models/Assets/Video';
import { Placement } from 'Ads/Models/Placement';
import { VideoOverlay } from 'Ads/Views/VideoOverlay';
import { Privacy } from 'Ads/Views/Privacy';
import { Backend } from 'Backend/Backend';
import { Platform } from 'Core/Constants/Platform';
import { ICoreApi } from 'Core/ICore';
import { FocusManager } from 'Core/Managers/FocusManager';
import { ClientInfo } from 'Core/Models/ClientInfo';
import { DeviceInfo } from 'Core/Models/DeviceInfo';

import { NativeBridge } from 'Core/Native/Bridge/NativeBridge';
import 'mocha';
import { IPerformanceAdUnitParameters, PerformanceAdUnit } from 'Performance/AdUnits/PerformanceAdUnit';
import { PerformanceCampaign } from 'Performance/Models/PerformanceCampaign';
import { PerformanceEndScreen } from 'Performance/Views/PerformanceEndScreen';
import * as sinon from 'sinon';
import { TestFixtures } from 'TestHelpers/TestFixtures';
import { RequestManager } from 'Core/Managers/RequestManager';
import { IStoreApi } from 'Store/IStore';
import { PrivacySDK } from 'Privacy/PrivacySDK';
import { GamePrivacy, PrivacyMethod, UserPrivacy } from 'Privacy/Privacy';
import { AndroidDeviceInfo } from 'Core/Models/AndroidDeviceInfo';

describe('GDPREventHandlerTest', () => {
    const sandbox = sinon.createSandbox();
    let platform: Platform;
    let backend: Backend;
    let nativeBridge: NativeBridge;
    let core: ICoreApi;
    let ads: IAdsApi;
    let store: IStoreApi;
    let adUnit: PerformanceAdUnit;
    let adUnitParameters: IPerformanceAdUnitParameters;
    let deviceInfo: AndroidDeviceInfo;
    let clientInfo: ClientInfo;

    let gdprEventHandler: OverlayEventHandler<PerformanceCampaign>;

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
            (<sinon.SinonStub>adUnitParameters.privacySDK.getLegalFramework).returns(LegalFramework.GDPR);
            (<sinon.SinonStub>adUnitParameters.privacySDK.getGamePrivacy).returns(new GamePrivacy({ method: PrivacyMethod.LEGITIMATE_INTEREST }));
        });

        it('should send GDPR skip event', () => {
            gdprEventHandler.onGDPRPopupSkipped();
            sinon.assert.calledWith(<sinon.SinonSpy>adUnitParameters.privacyManager.updateUserPrivacy, UserPrivacy.PERM_SKIPPED_LEGITIMATE_INTEREST_GDPR, GDPREventSource.USER_INDIRECT, GDPREventAction.SKIPPED_BANNER);
        });
    });

    describe('When calling onGDPRPopupSkipped on legalFramework CCPA', () => {
        beforeEach(() => {
            (<sinon.SinonStub>adUnitParameters.privacySDK.getLegalFramework).returns(LegalFramework.CCPA);
            (<sinon.SinonStub>adUnitParameters.privacySDK.getGamePrivacy).returns(new GamePrivacy({ method: PrivacyMethod.LEGITIMATE_INTEREST }));
        });

        it('should send GDPR skip event', () => {
            gdprEventHandler.onGDPRPopupSkipped();
            sinon.assert.calledWith(<sinon.SinonSpy>adUnitParameters.privacyManager.updateUserPrivacy, UserPrivacy.PERM_SKIPPED_LEGITIMATE_INTEREST, GDPREventSource.USER_INDIRECT, GDPREventAction.SKIPPED_BANNER);
        });

    });

    describe('GDPR skip event should not be sent if user privacy is already recorded', () => {
        beforeEach(() => {
            (<sinon.SinonStub>adUnitParameters.privacySDK.isOptOutRecorded).returns(true);

        });

        it('GDPR skip event should not be sent', () => {
            gdprEventHandler.onGDPRPopupSkipped();
            sinon.assert.notCalled(<sinon.SinonSpy>adUnitParameters.privacyManager.updateUserPrivacy);
        });

    });
});
