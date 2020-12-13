import { Orientation } from 'Ads/AdUnits/Containers/AdUnitContainer';
import { ViewController } from 'Ads/AdUnits/Containers/ViewController';
import { PrivacyEventHandler } from 'Ads/EventHandlers/PrivacyEventHandler';
import { GDPREventAction, GDPREventSource, LegalFramework, UserPrivacyManager } from 'Ads/Managers/UserPrivacyManager';
import { OperativeEventManager } from 'Ads/Managers/OperativeEventManager';
import { ThirdPartyEventManager } from 'Ads/Managers/ThirdPartyEventManager';
import { AdsConfiguration } from 'Ads/Models/AdsConfiguration';
import { Video } from 'Ads/Models/Assets/Video';
import { Placement } from 'Ads/Models/Placement';
import { VideoOverlay } from 'Ads/Views/VideoOverlay';
import { Privacy } from 'Ads/Views/Privacy';
import { Platform } from 'Core/Constants/Platform';
import { FocusManager } from 'Core/Managers/FocusManager';
import { ClientInfo } from 'Core/Models/ClientInfo';
import { CoreConfiguration } from 'Core/Models/CoreConfiguration';
import { DeviceInfo } from 'Core/Models/DeviceInfo';
import 'mocha';
import { PerformanceCampaign } from 'Performance/Models/PerformanceCampaign';
import { PerformanceEndScreen } from 'Performance/Views/PerformanceEndScreen';
import * as sinon from 'sinon';
import { TestFixtures } from 'TestHelpers/TestFixtures';
import { RequestManager } from 'Core/Managers/RequestManager';
import { PrivacySDK } from 'Privacy/PrivacySDK';
import { GamePrivacy, PrivacyMethod, UserPrivacy } from 'Privacy/Privacy';
[Platform.ANDROID, Platform.IOS].forEach(platform => {
    describe('PrivacyEventHandlerTest', () => {
        let backend;
        let nativeBridge;
        let core;
        let ads;
        let store;
        let adUnitParameters;
        let privacyEventHandler;
        beforeEach(() => {
            backend = TestFixtures.getBackend(platform);
            nativeBridge = TestFixtures.getNativeBridge(platform, backend);
            core = TestFixtures.getCoreApi(nativeBridge);
            ads = TestFixtures.getAdsApi(nativeBridge);
            store = TestFixtures.getStoreApi(nativeBridge);
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
                coreConfig: sinon.createStubInstance(CoreConfiguration),
                adsConfig: sinon.createStubInstance(AdsConfiguration),
                request: sinon.createStubInstance(RequestManager),
                options: {},
                endScreen: sinon.createStubInstance(PerformanceEndScreen),
                overlay: sinon.createStubInstance(VideoOverlay),
                video: sinon.createStubInstance(Video),
                privacy: sinon.createStubInstance(Privacy),
                privacyManager: sinon.createStubInstance(UserPrivacyManager),
                privacySDK: sinon.createStubInstance(PrivacySDK)
            };
            privacyEventHandler = new PrivacyEventHandler(adUnitParameters);
        });
        describe('on onPrivacy', () => {
            const url = 'http://example.com';
            if (platform === Platform.IOS) {
                it('should open url iOS', () => {
                    const spy = sinon.spy(core.iOS.UrlScheme, 'open');
                    privacyEventHandler.onPrivacy('http://example.com');
                    spy.calledWith(core.iOS.UrlScheme.open, 'http://example.com');
                });
            }
            if (platform === Platform.ANDROID) {
                it('should open url Android', () => {
                    const spy = sinon.spy(core.Android.Intent, 'launch');
                    privacyEventHandler.onPrivacy(url);
                    spy.calledWith(core.Android.Intent.launch, {
                        'action': 'android.intent.action.VIEW',
                        'uri': url
                    });
                });
            }
        });
        describe('on onGDPROptOut on legalFramework GDPR', () => {
            beforeEach(() => {
                adUnitParameters.privacySDK.getGamePrivacy.returns(new GamePrivacy({ method: PrivacyMethod.LEGITIMATE_INTEREST }));
                adUnitParameters.privacySDK.getLegalFramework.returns(LegalFramework.GDPR);
            });
            it('should send operative event with action BANNER_PERMISSIONS', () => {
                adUnitParameters.privacySDK.isOptOutEnabled.returns(false);
                privacyEventHandler.onGDPROptOut(true);
                sinon.assert.calledWith(adUnitParameters.privacyManager.updateUserPrivacy, UserPrivacy.PERM_ALL_FALSE, GDPREventSource.USER, GDPREventAction.BANNER_PERMISSIONS);
            });
            it('should send operative event with action BANNER_PERMISSIONS', () => {
                adUnitParameters.privacySDK.isOptOutEnabled.returns(true);
                adUnitParameters.privacySDK.isOptOutRecorded.returns(true);
                privacyEventHandler.onGDPROptOut(false);
                sinon.assert.calledWith(adUnitParameters.privacyManager.updateUserPrivacy, UserPrivacy.PERM_OPTIN_LEGITIMATE_INTEREST_GDPR, GDPREventSource.USER, GDPREventAction.BANNER_PERMISSIONS);
            });
            it('should send operative event with action BANNER_PERMISSIONS', () => {
                adUnitParameters.privacySDK.isOptOutEnabled.returns(true);
                adUnitParameters.privacySDK.isOptOutRecorded.returns(false);
                privacyEventHandler.onGDPROptOut(false);
                sinon.assert.calledWith(adUnitParameters.privacyManager.updateUserPrivacy, UserPrivacy.PERM_OPTIN_LEGITIMATE_INTEREST_GDPR, GDPREventSource.USER, GDPREventAction.BANNER_PERMISSIONS);
            });
        });
        describe('on onGDPROptOut on legalFramework CCPA', () => {
            beforeEach(() => {
                adUnitParameters.privacySDK.getGamePrivacy.returns(new GamePrivacy({ method: PrivacyMethod.LEGITIMATE_INTEREST }));
                adUnitParameters.privacySDK.getLegalFramework.returns(LegalFramework.CCPA);
            });
            it('should send operative event with action BANNER_PERMISSIONS', () => {
                adUnitParameters.privacySDK.isOptOutEnabled.returns(false);
                privacyEventHandler.onGDPROptOut(true);
                sinon.assert.calledWith(adUnitParameters.privacyManager.updateUserPrivacy, UserPrivacy.PERM_ALL_FALSE, GDPREventSource.USER, GDPREventAction.BANNER_PERMISSIONS);
            });
            it('should send operative event with action BANNER_PERMISSIONS', () => {
                adUnitParameters.privacySDK.isOptOutEnabled.returns(true);
                adUnitParameters.privacySDK.isOptOutRecorded.returns(true);
                privacyEventHandler.onGDPROptOut(false);
                sinon.assert.calledWith(adUnitParameters.privacyManager.updateUserPrivacy, UserPrivacy.PERM_OPTIN_LEGITIMATE_INTEREST, GDPREventSource.USER, GDPREventAction.BANNER_PERMISSIONS);
            });
            it('should send operative event with action BANNER_PERMISSIONS', () => {
                adUnitParameters.privacySDK.isOptOutEnabled.returns(true);
                adUnitParameters.privacySDK.isOptOutRecorded.returns(false);
                privacyEventHandler.onGDPROptOut(false);
                sinon.assert.calledWith(adUnitParameters.privacyManager.updateUserPrivacy, UserPrivacy.PERM_OPTIN_LEGITIMATE_INTEREST, GDPREventSource.USER, GDPREventAction.BANNER_PERMISSIONS);
            });
        });
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUHJpdmFjeUV2ZW50SGFuZGxlclRlc3QuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi90ZXN0L1VuaXQvQWRzL1ByaXZhY3lFdmVudEhhbmRsZXJUZXN0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBRSxXQUFXLEVBQUUsTUFBTSx3Q0FBd0MsQ0FBQztBQUNyRSxPQUFPLEVBQUUsY0FBYyxFQUFFLE1BQU0sdUNBQXVDLENBQUM7QUFDdkUsT0FBTyxFQUFFLG1CQUFtQixFQUFFLE1BQU0sdUNBQXVDLENBQUM7QUFFNUUsT0FBTyxFQUFFLGVBQWUsRUFBRSxlQUFlLEVBQUUsY0FBYyxFQUFFLGtCQUFrQixFQUFFLE1BQU0saUNBQWlDLENBQUM7QUFDdkgsT0FBTyxFQUFFLHFCQUFxQixFQUFFLE1BQU0sb0NBQW9DLENBQUM7QUFDM0UsT0FBTyxFQUFFLHNCQUFzQixFQUFFLE1BQU0scUNBQXFDLENBQUM7QUFDN0UsT0FBTyxFQUFFLGdCQUFnQixFQUFFLE1BQU0sNkJBQTZCLENBQUM7QUFDL0QsT0FBTyxFQUFFLEtBQUssRUFBRSxNQUFNLHlCQUF5QixDQUFDO0FBQ2hELE9BQU8sRUFBRSxTQUFTLEVBQUUsTUFBTSxzQkFBc0IsQ0FBQztBQUNqRCxPQUFPLEVBQUUsWUFBWSxFQUFFLE1BQU0sd0JBQXdCLENBQUM7QUFDdEQsT0FBTyxFQUFFLE9BQU8sRUFBRSxNQUFNLG1CQUFtQixDQUFDO0FBRTVDLE9BQU8sRUFBRSxRQUFRLEVBQUUsTUFBTSx5QkFBeUIsQ0FBQztBQUVuRCxPQUFPLEVBQUUsWUFBWSxFQUFFLE1BQU0sNEJBQTRCLENBQUM7QUFDMUQsT0FBTyxFQUFFLFVBQVUsRUFBRSxNQUFNLHdCQUF3QixDQUFDO0FBQ3BELE9BQU8sRUFBRSxpQkFBaUIsRUFBRSxNQUFNLCtCQUErQixDQUFDO0FBQ2xFLE9BQU8sRUFBRSxVQUFVLEVBQUUsTUFBTSx3QkFBd0IsQ0FBQztBQUdwRCxPQUFPLE9BQU8s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