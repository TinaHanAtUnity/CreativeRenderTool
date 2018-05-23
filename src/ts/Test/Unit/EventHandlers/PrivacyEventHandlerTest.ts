import 'mocha';
import * as sinon from 'sinon';

import { NativeBridge } from 'Native/NativeBridge';
import { Overlay } from 'Views/Overlay';
import { DeviceInfo } from 'Models/DeviceInfo';
import { ThirdPartyEventManager } from 'Managers/ThirdPartyEventManager';
import { Request } from 'Utilities/Request';
import { Platform } from 'Constants/Platform';
import { Orientation } from 'AdUnits/Containers/AdUnitContainer';
import { ViewController } from 'AdUnits/Containers/ViewController';
import { Video } from 'Models/Assets/Video';
import { FocusManager } from 'Managers/FocusManager';
import { ClientInfo } from 'Models/ClientInfo';
import { OperativeEventManager } from 'Managers/OperativeEventManager';
import { IPerformanceAdUnitParameters, PerformanceAdUnit } from 'AdUnits/PerformanceAdUnit';
import { PerformanceEndScreen } from 'Views/PerformanceEndScreen';
import { PerformanceCampaign } from 'Models/Campaigns/PerformanceCampaign';
import { PrivacyEventHandler } from 'EventHandlers/PrivacyEventHandler';
import { Configuration } from 'Models/Configuration';
import { SdkApi } from 'Native/Api/Sdk';
import { UrlSchemeApi } from 'Native/Api/UrlScheme';
import { IntentApi } from 'Native/Api/Intent';
import { GDPRPrivacy } from 'Views/GDPRPrivacy';
import { Placement } from 'Models/Placement';
import { GdprManager } from 'Managers/GdprManager';

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
            gdprManager: sinon.createStubInstance(GdprManager)
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

            sinon.assert.calledWith(<sinon.SinonSpy>adUnitParameters.operativeEventManager.sendGDPREvent, 'optout');
        });

        it('should send operative event with action `optin`', () => {
            (<sinon.SinonStub>adUnitParameters.configuration.isOptOutEnabled).returns(true);
            (<sinon.SinonStub>adUnitParameters.configuration.isOptOutRecorded).returns(true);

            privacyEventHandler.onGDPROptOut(false);

            sinon.assert.calledWith(<sinon.SinonSpy>adUnitParameters.operativeEventManager.sendGDPREvent, 'optin');
        });

        it('should send operative event with action `skip`', () => {
            (<sinon.SinonStub>adUnitParameters.configuration.isOptOutEnabled).returns(true);
            (<sinon.SinonStub>adUnitParameters.configuration.isOptOutRecorded).returns(false);

            privacyEventHandler.onGDPROptOut(false);

            sinon.assert.calledWith(<sinon.SinonSpy>adUnitParameters.operativeEventManager.sendGDPREvent, 'skip');
        });
    });
});
