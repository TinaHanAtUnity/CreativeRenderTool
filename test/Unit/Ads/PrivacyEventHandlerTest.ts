import { Orientation } from 'Ads/AdUnits/Containers/AdUnitContainer';
import { ViewController } from 'Ads/AdUnits/Containers/ViewController';
import { PrivacyEventHandler } from 'Ads/EventHandlers/PrivacyEventHandler';
import { IAdsApi } from 'Ads/IAds';
import { GDPREventSource, GdprManager } from 'Ads/Managers/GdprManager';
import { OperativeEventManager } from 'Ads/Managers/OperativeEventManager';
import { ThirdPartyEventManager } from 'Ads/Managers/ThirdPartyEventManager';
import { AdsConfiguration } from 'Ads/Models/AdsConfiguration';
import { Video } from 'Ads/Models/Assets/Video';
import { Placement } from 'Ads/Models/Placement';
import { ProgrammaticTrackingService } from 'Ads/Utilities/ProgrammaticTrackingService';
import { Overlay } from 'Ads/Views/Overlay';
import { Privacy } from 'Ads/Views/Privacy';
import { Backend } from 'Backend/Backend';
import { Platform } from 'Core/Constants/Platform';
import { ICoreApi } from 'Core/ICore';
import { FocusManager } from 'Core/Managers/FocusManager';
import { ClientInfo } from 'Core/Models/ClientInfo';
import { CoreConfiguration } from 'Core/Models/CoreConfiguration';
import { DeviceInfo } from 'Core/Models/DeviceInfo';

import { NativeBridge } from 'Core/Native/Bridge/NativeBridge';
import 'mocha';
import { IPerformanceAdUnitParameters, PerformanceAdUnit } from 'Performance/AdUnits/PerformanceAdUnit';
import { PerformanceCampaign } from 'Performance/Models/PerformanceCampaign';
import { PerformanceEndScreen } from 'Performance/Views/PerformanceEndScreen';
import * as sinon from 'sinon';
import { TestFixtures } from 'TestHelpers/TestFixtures';

[Platform.ANDROID, Platform.IOS].forEach(platform => {
    describe('PrivacyEventHandlerTest', () => {

        let backend: Backend;
        let nativeBridge: NativeBridge;
        let core: ICoreApi;
        let ads: IAdsApi;
        let adUnit: PerformanceAdUnit;
        let adUnitParameters: IPerformanceAdUnitParameters;

        let privacyEventHandler: PrivacyEventHandler;

        beforeEach(() => {
            backend = TestFixtures.getBackend(platform);
            nativeBridge = TestFixtures.getNativeBridge(platform, backend);
            core = TestFixtures.getCoreApi(nativeBridge);
            ads = TestFixtures.getAdsApi(nativeBridge);
            adUnitParameters = {
                platform,
                core,
                ads,
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
                request: sinon.createStubInstance(Request),
                options: {},
                endScreen: sinon.createStubInstance(PerformanceEndScreen),
                overlay: sinon.createStubInstance(Overlay),
                video: sinon.createStubInstance(Video),
                privacy: sinon.createStubInstance(Privacy),
                gdprManager: sinon.createStubInstance(GdprManager),
                programmaticTrackingService: sinon.createStubInstance(ProgrammaticTrackingService)
            };

            adUnit = sinon.createStubInstance(PerformanceAdUnit);

            privacyEventHandler = new PrivacyEventHandler(adUnitParameters);
        });

        describe('on onPrivacy', () => {
            const url = 'http://example.com';

            if(platform === Platform.IOS) {
                it('should open url iOS', () => {
                    const spy = sinon.spy(core.iOS!.UrlScheme, 'open');
                    privacyEventHandler.onPrivacy('http://example.com');
                    spy.calledWith(<sinon.SinonSpy>core.iOS!.UrlScheme.open, 'http://example.com');
                });
            }

            if(platform === Platform.ANDROID) {
                it('should open url Android', () => {
                    const spy = sinon.spy(core.Android!.Intent, 'launch');
                    privacyEventHandler.onPrivacy(url);
                    spy.calledWith(<sinon.SinonSpy>core.Android!.Intent.launch, {
                        'action': 'android.intent.action.VIEW',
                        'uri': url
                    });
                });
            }
        });

        describe('on onGDPROptOut', () => {

            it('should send operative event with action `optout`', () => {
                (<sinon.SinonStub>adUnitParameters.adsConfig.isOptOutEnabled).returns(false);

                privacyEventHandler.onGDPROptOut(true);

                sinon.assert.calledWith(<sinon.SinonSpy>adUnitParameters.gdprManager.sendGDPREvent, 'optout', GDPREventSource.USER);
            });

            it('should send operative event with action `optin`', () => {
                (<sinon.SinonStub>adUnitParameters.adsConfig.isOptOutEnabled).returns(true);
                (<sinon.SinonStub>adUnitParameters.adsConfig.isOptOutRecorded).returns(true);

                privacyEventHandler.onGDPROptOut(false);

                sinon.assert.calledWith(<sinon.SinonSpy>adUnitParameters.gdprManager.sendGDPREvent, 'optin');
            });

            it('should send operative event with action `skip`', () => {
                (<sinon.SinonStub>adUnitParameters.adsConfig.isOptOutEnabled).returns(true);
                (<sinon.SinonStub>adUnitParameters.adsConfig.isOptOutRecorded).returns(false);

                privacyEventHandler.onGDPROptOut(false);

                sinon.assert.calledWith(<sinon.SinonSpy>adUnitParameters.gdprManager.sendGDPREvent, 'skip');
            });
        });
    });
});
