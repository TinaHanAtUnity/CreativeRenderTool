import 'mocha';
import * as sinon from 'sinon';

import { DisplayInterstitialAdUnit } from "AdUnits/DisplayInterstitialAdUnit";
import { NativeBridge } from "Native/NativeBridge";
import { AdUnitContainer } from "AdUnits/Containers/AdUnitContainer";
import { SessionManager } from "Managers/SessionManager";
import { Placement } from "Models/Placement";
import { Request } from 'Utilities/Request';
import { DisplayInterstitialCampaign } from "Models/Campaigns/DisplayInterstitialCampaign";
import { DisplayInterstitial } from "Views/DisplayInterstitial";
import { TestFixtures } from "Test/Unit/TestHelpers/TestFixtures";
import { Activity } from "AdUnits/Containers/Activity";
import { Platform } from "Constants/Platform";
import { ThirdPartyEventManager } from "Managers/ThirdPartyEventManager";
import { DeviceInfo } from "Models/DeviceInfo";
import { MetaDataManager } from "Managers/MetaDataManager";
import { WakeUpManager } from "Managers/WakeUpManager";
import { FocusManager } from "Managers/FocusManager";
import { OperativeEventManager } from 'Managers/OperativeEventManager';
import { ClientInfo } from 'Models/ClientInfo';
import DummyDisplayInterstitialCampaign from 'json/DummyDisplayInterstitialCampaign.json';

const json = JSON.parse(DummyDisplayInterstitialCampaign);
describe('DisplayInterstitialAdUnit', () => {
    let adUnit: DisplayInterstitialAdUnit;
    let nativeBridge: NativeBridge;
    let container: AdUnitContainer;
    let sessionManager: SessionManager;
    let placement: Placement;
    let campaign: DisplayInterstitialCampaign;
    let view: DisplayInterstitial;
    let sandbox: sinon.SinonSandbox;
    let operativeEventManager: OperativeEventManager;
    let thirdPartyEventManager: ThirdPartyEventManager;
    let deviceInfo: DeviceInfo;
    let clientInfo: ClientInfo;

    beforeEach(() => {
        sandbox = sinon.sandbox.create();
        nativeBridge = TestFixtures.getNativeBridge(Platform.ANDROID);
        placement = TestFixtures.getPlacement();

        const metaDataManager = new MetaDataManager(nativeBridge);
        const focusManager = new FocusManager(nativeBridge);
        const wakeUpManager = new WakeUpManager(nativeBridge, focusManager);
        const request = new Request(nativeBridge, wakeUpManager);
        container = new Activity(nativeBridge, TestFixtures.getDeviceInfo(Platform.ANDROID));
        sandbox.stub(container, 'open').returns(Promise.resolve());
        sandbox.stub(container, 'close').returns(Promise.resolve());
        clientInfo = TestFixtures.getClientInfo(Platform.ANDROID);
        deviceInfo = TestFixtures.getDeviceInfo(Platform.ANDROID);
        thirdPartyEventManager = new ThirdPartyEventManager(nativeBridge, request);
        sessionManager = new SessionManager(nativeBridge);
        operativeEventManager = new OperativeEventManager(nativeBridge, request, metaDataManager, sessionManager, clientInfo, deviceInfo);
        campaign = new DisplayInterstitialCampaign(json.display.markup, TestFixtures.getSession(), json.gamerId, json.abGroup, undefined);

        view = new DisplayInterstitial(nativeBridge, placement, campaign);
        view.render();
        document.body.appendChild(view.container());
        sandbox.stub(view, 'show');
        sandbox.stub(view, 'hide');

        adUnit = new DisplayInterstitialAdUnit(nativeBridge, container, operativeEventManager, placement, campaign, view, {});
    });

    afterEach(() => {
        sandbox.restore();
    });

    describe('showing', () => {
        it('should open the container', () => {
            return adUnit.show().then(() => {
                sinon.assert.called(<sinon.SinonSpy>container.open);
            });
        });

        it('should open the view', () => {
            return adUnit.show().then(() => {
                sinon.assert.called(<sinon.SinonSpy>view.show);
            });
        });

        it('should trigger onStart', () => {
            const spy = sinon.spy();
            adUnit.onStart.subscribe(spy);
            return adUnit.show().then(() => {
                sinon.assert.called(spy);
            });
        });
    });

    describe('hiding', () => {
        beforeEach(() => {
            return adUnit.show();
        });

        it('should close the view', () => {
            return adUnit.hide().then(() => {
                sinon.assert.called(<sinon.SinonSpy>view.hide);
            });
        });
    });
});
