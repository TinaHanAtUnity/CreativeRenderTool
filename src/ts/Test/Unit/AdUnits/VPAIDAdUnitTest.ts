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
import { Activity } from 'AdUnits/Containers/Activity';
import { Platform } from 'Constants/Platform';
import { TestFixtures } from 'Test/Unit/TestHelpers/TestFixtures';
import { OperativeEventManager } from 'Managers/OperativeEventManager';
import { ThirdPartyEventManager } from 'Managers/ThirdPartyEventManager';
import { FocusManager } from 'Managers/FocusManager';
import { Request } from 'Utilities/Request';
import { WakeUpManager } from 'Managers/WakeUpManager';
import { Overlay } from 'Views/Overlay';
import { SessionManager } from 'Managers/SessionManager';
import { MetaDataManager } from 'Managers/MetaDataManager';
import { ComScoreTrackingService } from 'Utilities/ComScoreTrackingService';

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
    let vpaidAdUnitParameters: IVPAIDAdUnitParameters;
    let request: Request;
    let overlay: Overlay;
    let comScoreService: ComScoreTrackingService;

    beforeEach(() => {
        sandbox = sinon.sandbox.create();

        const clientInfo = TestFixtures.getClientInfo(Platform.ANDROID);
        const deviceInfo = TestFixtures.getDeviceInfo(Platform.ANDROID);
        nativeBridge = TestFixtures.getNativeBridge();
        sinon.stub(nativeBridge, 'getPlatform').returns(Platform.IOS);
        focusManager = new FocusManager(nativeBridge);
        const wakeUpManager = new WakeUpManager(nativeBridge, focusManager);

        container = new Activity(nativeBridge, TestFixtures.getDeviceInfo(Platform.ANDROID));
        sinon.stub(container, 'open').returns(Promise.resolve());
        sinon.stub(container, 'close').returns(Promise.resolve());

        request = new Request(nativeBridge, wakeUpManager);

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

        campaign = TestFixtures.getVPAIDCampaign();

        vpaidView = new VPAID(nativeBridge, campaign, placement, 'en', 'TestGameId');
        sinon.stub(vpaidView, 'container').returns(document.createElement('div'));
        sinon.stub(vpaidView, 'show').returns(Promise.resolve());
        sinon.stub(vpaidView, 'hide').returns(Promise.resolve());

        const sessionManager = new SessionManager(nativeBridge);
        const metaDataManager = new MetaDataManager(nativeBridge);
        thirdPartyEventManager = new ThirdPartyEventManager(nativeBridge, request);
        operativeEventManager = new OperativeEventManager(nativeBridge, request, metaDataManager, sessionManager, clientInfo, deviceInfo);
        overlay = new Overlay(nativeBridge, false, 'en', clientInfo.getGameId());
        comScoreService = new ComScoreTrackingService(thirdPartyEventManager, nativeBridge, deviceInfo);

        vpaidAdUnitParameters = {
            forceOrientation: ForceOrientation.LANDSCAPE,
            focusManager: focusManager,
            container: container,
            deviceInfo: deviceInfo,
            clientInfo: clientInfo,
            thirdPartyEventManager: thirdPartyEventManager,
            operativeEventManager: operativeEventManager,
            comScoreTrackingService: comScoreService,
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
        let spy: sinon.SinonSpy;

        beforeEach(() => {
            spy = sinon.spy();
            adUnit.onStart.subscribe(spy);
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

        it('should trigger onStart', () => {
            return adUnit.show().then(() => {
                sinon.assert.called(spy);
            });
        });
    });

    describe('hide', () => {

        beforeEach(() => {
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
