import 'mocha';
import * as sinon from 'sinon';

import { IVPAIDAdUnitParameters, VPAIDAdUnit } from 'AdUnits/VPAIDAdUnit';
import { VPAIDCampaign } from 'Models/VPAID/VPAIDCampaign';
import { VPAIDParser } from 'Utilities/VPAIDParser';
import { VPAID } from 'Views/VPAID';
import { VPAID as VPAIDModel } from 'Models/VPAID/VPAID';
import { NativeBridge } from 'Native/NativeBridge';
import { ForceOrientation, AdUnitContainer } from 'AdUnits/Containers/AdUnitContainer';
import { Placement } from 'Models/Placement';
import { Observable2, Observable0 } from 'Utilities/Observable';
import { Activity } from 'AdUnits/Containers/Activity';
import { ListenerApi } from 'Native/Api/Listener';
import { Platform } from 'Constants/Platform';
import { IntentApi } from 'Native/Api/Intent';
import { TestFixtures } from 'Test/Unit/TestHelpers/TestFixtures';
import { OperativeEventManager } from 'Managers/OperativeEventManager';
import { ThirdPartyEventManager } from 'Managers/ThirdPartyEventManager';
import { SdkApi } from 'Native/Api/Sdk';
import { FocusManager } from 'Managers/FocusManager';
import { UrlSchemeApi } from 'Native/Api/UrlScheme';
import { Request } from 'Utilities/Request';
import { WakeUpManager } from 'Managers/WakeUpManager';
import { Overlay } from 'Views/Overlay';

import VPAIDTestXML from 'xml/VPAID.xml';
import VPAIDCampaignJson from 'json/OnProgrammaticVPAIDCampaign.json';

describe('VPAIDAdUnit', () => {
    let campaign: VPAIDCampaign;
    let adUnit: VPAIDAdUnit;
    let vpaidView: VPAID;
    let sandbox: sinon.SinonSandbox;
    let nativeBridge: NativeBridge;
    let operativeEventManager: OperativeEventManager;
    let thirdPartyEventManager: ThirdPartyEventManager;
    let container: AdUnitContainer;
    let focusManager: FocusManager;
    let vpaid: VPAIDModel;
    let vpaidAdUnitParameters: IVPAIDAdUnitParameters;
    let request: Request;
    let overlay: Overlay;

    beforeEach(() => {
        sandbox = sinon.sandbox.create();

        vpaidView = <VPAID>sinon.createStubInstance(VPAID);
        (<any>vpaidView).onVPAIDEvent = new Observable2<string, any[]>();
        (<any>vpaidView).onCompanionView = new Observable0();
        (<any>vpaidView).onCompanionClick = new Observable0();
        (<any>vpaidView).onStuck = new Observable0();
        (<any>vpaidView).onSkip = new Observable0();
        nativeBridge = <NativeBridge>sinon.createStubInstance(NativeBridge);
        nativeBridge.Listener = <ListenerApi>sinon.createStubInstance(ListenerApi);
        nativeBridge.Intent = <IntentApi>sinon.createStubInstance(IntentApi);
        nativeBridge.UrlScheme = <UrlSchemeApi>sinon.createStubInstance(UrlSchemeApi);
        nativeBridge.Sdk = <SdkApi>sinon.createStubInstance(SdkApi);
        const wakeUpManager = new WakeUpManager(nativeBridge, focusManager);
        operativeEventManager = <OperativeEventManager>sinon.createStubInstance(OperativeEventManager);
        thirdPartyEventManager = <ThirdPartyEventManager>sinon.createStubInstance(ThirdPartyEventManager);
        container = <AdUnitContainer>sinon.createStubInstance(Activity);
        request = new Request(nativeBridge, wakeUpManager);
        vpaid = new VPAIDParser().parse(VPAIDTestXML);
        const vpaidCampaignJson = JSON.parse(VPAIDCampaignJson);
        const placement = new Placement({
            id: '123',
            name: 'test',
            default: true,
            allowSkip: true,
            skipInSeconds: 5,
            disableBackButton: true,
            useDeviceOrientationForVideo: false,
            muteVideo: false
        });
        campaign = new VPAIDCampaign(vpaid, TestFixtures.getSession(), vpaidCampaignJson.campaignId, vpaidCampaignJson.gamerId, vpaidCampaignJson.abGroup);
        focusManager = <FocusManager>sinon.createStubInstance(FocusManager);
        (<any>focusManager).onAppForeground = new Observable0();
        (<any>focusManager).onAppBackground = new Observable0();
        (<sinon.SinonStub>nativeBridge.getPlatform).returns(Platform.IOS);

        const clientInfo = TestFixtures.getClientInfo(Platform.ANDROID);
        const deviceInfo = TestFixtures.getDeviceInfo(Platform.ANDROID);
        overlay = <Overlay><any> {};

        vpaidAdUnitParameters = {
            forceOrientation: ForceOrientation.LANDSCAPE,
            focusManager: focusManager,
            container: container,
            deviceInfo: deviceInfo,
            clientInfo: clientInfo,
            thirdPartyEventManager: thirdPartyEventManager,
            operativeEventManager: operativeEventManager,
            placement: placement,
            campaign: campaign,
            configuration: TestFixtures.getConfiguration(),
            request: request,
            options: {},
            vpaid: vpaidView,
            overlay: overlay
        };

        adUnit = new VPAIDAdUnit(nativeBridge, vpaidAdUnitParameters);
    });

    afterEach(() => {
        if (adUnit.isShowing()) {
            adUnit.hide();
        }
        sandbox.reset();
    });

    describe('show', () => {

        beforeEach(() => {
            (<sinon.SinonStub>vpaidView.container).returns(document.createElement('div'));
            (<sinon.SinonStub>container.open).returns(Promise.resolve());
        });

        it('should show the view', () => {
            return adUnit.show().then(() => {
                sinon.assert.called(<sinon.SinonSpy>vpaidView.show);
            });
        });

        it('should open the container', () => {
            return adUnit.show().then(() => {
                sinon.assert.called(<sinon.SinonSpy>container.open);
            });
        });
    });

    describe('hide', () => {

        beforeEach(() => {
            (<sinon.SinonStub>vpaidView.container).returns(document.createElement('div'));
            (<sinon.SinonStub>container.open).returns(Promise.resolve());
            (<sinon.SinonStub>container.close).returns(Promise.resolve());
            (<sinon.SinonStub>nativeBridge.Listener.sendFinishEvent).returns(Promise.resolve());
            return adUnit.show();
        });

        it('should hide the view', () => {
            return adUnit.hide().then(() => {
                sinon.assert.called(<sinon.SinonSpy>vpaidView.hide);
            });
        });

        it('should close the container', () => {
            return adUnit.hide().then(() => {
                sinon.assert.called(<sinon.SinonSpy>container.close);
            });
        });
    });
});
