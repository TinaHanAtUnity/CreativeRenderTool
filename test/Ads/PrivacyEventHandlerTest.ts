import { Orientation } from 'Ads/AdUnits/Containers/AdUnitContainer';
import { ViewController } from 'Ads/AdUnits/Containers/ViewController';
import { PrivacyEventHandler } from 'Ads/EventHandlers/PrivacyEventHandler';
import { GDPREventSource, GdprManager } from 'Ads/Managers/GdprManager';
import { OperativeEventManager } from 'Ads/Managers/OperativeEventManager';
import { ThirdPartyEventManager } from 'Ads/Managers/ThirdPartyEventManager';
import { AdsConfiguration } from 'Ads/Models/AdsConfiguration';
import { Video } from 'Ads/Models/Assets/Video';
import { Placement } from 'Ads/Models/Placement';
import { ProgrammaticTrackingService } from 'Ads/Utilities/ProgrammaticTrackingService';
import { Overlay } from 'Ads/Views/Overlay';
import { Platform } from 'Core/Constants/Platform';
import { FocusManager } from 'Core/Managers/FocusManager';
import { ClientInfo } from 'Core/Models/ClientInfo';
import { CoreConfiguration } from 'Core/Models/CoreConfiguration';
import { DeviceInfo } from 'Core/Models/DeviceInfo';
import { IntentApi } from 'Core/Native/Android/Intent';

import { NativeBridge } from 'Core/Native/Bridge/NativeBridge';
import { UrlSchemeApi } from 'Core/Native/iOS/UrlScheme';
import { SdkApi } from 'Core/Native/Sdk';
import { RequestManager } from 'Core/Managers/RequestManager';
import 'mocha';
import { IPerformanceAdUnitParameters, PerformanceAdUnit } from 'Performance/AdUnits/PerformanceAdUnit';
import { PerformanceCampaign } from 'Performance/Models/PerformanceCampaign';
import { PerformanceEndScreen } from 'Performance/Views/PerformanceEndScreen';
import * as sinon from 'sinon';
import { Privacy } from 'Ads/Views/Privacy';
import { Backend } from '../../src/ts/Backend/Backend';
import { ICoreApi } from '../../src/ts/Core/ICore';
import { IAdsApi } from '../../src/ts/Ads/IAds';
import { TestFixtures } from '../TestHelpers/TestFixtures';

describe('PrivacyEventHandlerTest', () => {

    let platform: Platform;
    let backend: Backend;
    let nativeBridge: NativeBridge;
    let core: ICoreApi;
    let ads: IAdsApi;
    let adUnit: PerformanceAdUnit;
    let adUnitParameters: IPerformanceAdUnitParameters;

    let privacyEventHandler: PrivacyEventHandler;

    beforeEach(() => {
        platform = Platform.ANDROID;
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

        it('should open url iOS', () => {
            (<sinon.SinonStub>nativeBridge.getPlatform).returns(Platform.IOS);
            privacyEventHandler.onPrivacy('http://example.com');

            sinon.assert.calledWith(<sinon.SinonSpy>core.iOS!.UrlScheme.open, 'http://example.com');

        });

        it('should open url Android', () => {
            (<sinon.SinonStub>nativeBridge.getPlatform).returns(Platform.ANDROID);
            privacyEventHandler.onPrivacy(url);

            sinon.assert.calledWith(<sinon.SinonSpy>core.Android!.Intent.launch, {
                'action': 'android.intent.action.VIEW',
                'uri': url
            });

        });
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
