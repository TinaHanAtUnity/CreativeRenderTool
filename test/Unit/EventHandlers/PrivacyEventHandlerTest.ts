import 'mocha';
import * as sinon from 'sinon';

import { NativeBridge } from 'Common/Native/NativeBridge';
import { Overlay } from 'Ads/Views/Overlay';
import { DeviceInfo } from 'Core/Models/DeviceInfo';
import { ThirdPartyEventManager } from 'Ads/Managers/ThirdPartyEventManager';
import { Request } from 'Core/Utilities/Request';
import { Platform } from 'Common/Constants/Platform';
import { Orientation } from 'Ads/AdUnits/Containers/AdUnitContainer';
import { ViewController } from 'Ads/AdUnits/Containers/ViewController';
import { Video } from 'Ads/Models/Assets/Video';
import { FocusManager } from 'Core/Managers/FocusManager';
import { ClientInfo } from 'Core/Models/ClientInfo';
import { OperativeEventManager } from 'Ads/Managers/OperativeEventManager';
import { IPerformanceAdUnitParameters, PerformanceAdUnit } from 'Ads/AdUnits/PerformanceAdUnit';
import { PerformanceEndScreen } from 'Ads/Views/PerformanceEndScreen';
import { PerformanceCampaign } from 'Ads/Models/Campaigns/PerformanceCampaign';
import { PrivacyEventHandler } from 'Ads/EventHandlers/PrivacyEventHandler';
import { Configuration } from 'Core/Models/Configuration';
import { SdkApi } from 'Common/Native/Api/Sdk';
import { UrlSchemeApi } from 'Common/Native/Api/iOS/UrlScheme';
import { IntentApi } from 'Common/Native/Api/Android/Intent';
import { GDPRPrivacy } from 'Ads/Views/GDPRPrivacy';
import { Placement } from 'Ads/Models/Placement';
import { GDPREventSource, GdprManager } from 'Ads/Managers/GdprManager';
import { ProgrammaticTrackingService } from 'Ads/Utilities/ProgrammaticTrackingService';

describe('PrivacyEventHandlerTest', () => {

    let nativeBridge: NativeBridge;
    let adUnit: PerformanceAdUnit;
    let adUnitParameters: IPerformanceAdUnitParameters;

    let privacyEventHandler: PrivacyEventHandler;

    beforeEach(() => {
        adUnitParameters = {
            forceOrientation: Orientation.LANDSCAPE,
            focusManager: sinon.createStubInstance(FocusManager),
            container: sinon.createStubInstance(ViewController),
            deviceInfo: sinon.createStubInstance(DeviceInfo),
            clientInfo: sinon.createStubInstance(ClientInfo),
            thirdPartyEventManager: sinon.createStubInstance(ThirdPartyEventManager),
            operativeEventManager: sinon.createStubInstance(OperativeEventManager),
            placement: sinon.createStubInstance(Placement),
            campaign: sinon.createStubInstance(PerformanceCampaign),
            configuration: sinon.createStubInstance(Configuration),
            request: sinon.createStubInstance(Request),
            options: {},
            endScreen: sinon.createStubInstance(PerformanceEndScreen),
            overlay: sinon.createStubInstance(Overlay),
            video: sinon.createStubInstance(Video),
            privacy: sinon.createStubInstance(GDPRPrivacy),
            gdprManager: sinon.createStubInstance(GdprManager),
            programmaticTrackingService: sinon.createStubInstance(ProgrammaticTrackingService)
        };

        adUnit = sinon.createStubInstance(PerformanceAdUnit);

        nativeBridge = sinon.createStubInstance(NativeBridge);
        (<any>nativeBridge).UrlScheme = sinon.createStubInstance(UrlSchemeApi);
        (<any>nativeBridge).Intent = sinon.createStubInstance(IntentApi);
        (<any>nativeBridge).Sdk = sinon.createStubInstance(SdkApi);

        privacyEventHandler = new PrivacyEventHandler(nativeBridge, adUnitParameters);
    });

    describe('on onPrivacy', () => {
        const url = 'http://example.com';

        it('should open url iOS', () => {
            (<sinon.SinonStub>nativeBridge.getPlatform).returns(Platform.IOS);
            privacyEventHandler.onPrivacy('http://example.com');

            sinon.assert.calledWith(<sinon.SinonSpy>nativeBridge.UrlScheme.open, 'http://example.com');

        });

        it('should open url Android', () => {
            (<sinon.SinonStub>nativeBridge.getPlatform).returns(Platform.ANDROID);
            privacyEventHandler.onPrivacy(url);

            sinon.assert.calledWith(<sinon.SinonSpy>nativeBridge.Intent.launch, {
                'action': 'android.intent.action.VIEW',
                'uri': url
            });

        });
    });

    describe('on onGDPROptOut', () => {

        it('should send operative event with action `optout`', () => {
            (<sinon.SinonStub>adUnitParameters.configuration.isOptOutEnabled).returns(false);

            privacyEventHandler.onGDPROptOut(true);

            sinon.assert.calledWith(<sinon.SinonSpy>adUnitParameters.gdprManager.sendGDPREvent, 'optout', GDPREventSource.USER);
        });

        it('should send operative event with action `optin`', () => {
            (<sinon.SinonStub>adUnitParameters.configuration.isOptOutEnabled).returns(true);
            (<sinon.SinonStub>adUnitParameters.configuration.isOptOutRecorded).returns(true);

            privacyEventHandler.onGDPROptOut(false);

            sinon.assert.calledWith(<sinon.SinonSpy>adUnitParameters.gdprManager.sendGDPREvent, 'optin');
        });

        it('should send operative event with action `skip`', () => {
            (<sinon.SinonStub>adUnitParameters.configuration.isOptOutEnabled).returns(true);
            (<sinon.SinonStub>adUnitParameters.configuration.isOptOutRecorded).returns(false);

            privacyEventHandler.onGDPROptOut(false);

            sinon.assert.calledWith(<sinon.SinonSpy>adUnitParameters.gdprManager.sendGDPREvent, 'skip');
        });
    });
});
