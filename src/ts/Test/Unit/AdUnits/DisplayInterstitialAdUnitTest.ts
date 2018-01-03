import 'mocha';
import * as sinon from 'sinon';

import { DisplayInterstitialAdUnit, IDisplayInterstitialAdUnitParameters } from 'AdUnits/DisplayInterstitialAdUnit';
import { NativeBridge } from 'Native/NativeBridge';
import { AdUnitContainer, ForceOrientation } from 'AdUnits/Containers/AdUnitContainer';
import { SessionManager } from 'Managers/SessionManager';
import { Placement } from 'Models/Placement';
import { Request } from 'Utilities/Request';
import { DisplayInterstitialCampaign } from 'Models/Campaigns/DisplayInterstitialCampaign';
import { DisplayInterstitial } from 'Views/DisplayInterstitial';
import { TestFixtures } from 'Test/Unit/TestHelpers/TestFixtures';
import { Activity } from 'AdUnits/Containers/Activity';
import { Platform } from 'Constants/Platform';
import { ThirdPartyEventManager } from 'Managers/ThirdPartyEventManager';
import { DeviceInfo } from 'Models/DeviceInfo';
import { MetaDataManager } from 'Managers/MetaDataManager';
import { WakeUpManager } from 'Managers/WakeUpManager';
import { FocusManager } from 'Managers/FocusManager';
import { OperativeEventManager } from 'Managers/OperativeEventManager';
import { ClientInfo } from 'Models/ClientInfo';
import { ComScoreTrackingService } from 'Utilities/ComScoreTrackingService';

describe('DisplayInterstitialAdUnit', () => {
    const isStaticInterstitialUrlCampaign = true;
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
    let displayInterstitialAdUnitParameters: IDisplayInterstitialAdUnitParameters;
    let comScoreService: ComScoreTrackingService;
    let server: sinon.SinonFakeServer;

    describe('On static-interstial campaign', () => {
        adUnitTests(!isStaticInterstitialUrlCampaign);
    });

    describe('On static-interstial-url campaign', () => {
        adUnitTests(isStaticInterstitialUrlCampaign);
    });

    function adUnitTests(isUrlCampaign: boolean): void {
        beforeEach(() => {
            campaign = TestFixtures.getDisplayInterstitialCampaign(isUrlCampaign);

            if (isUrlCampaign) {
                server = sinon.fakeServer.create();
                server.respondImmediately = true;
                server.respondWith('<div><a href="http://unity3d.com"></a></div>');
            }

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
            comScoreService = new ComScoreTrackingService(thirdPartyEventManager, nativeBridge, deviceInfo);

            view = new DisplayInterstitial(nativeBridge, placement, campaign);
            view.render();
            document.body.appendChild(view.container());
            sandbox.stub(view, 'show');
            sandbox.stub(view, 'hide');

            displayInterstitialAdUnitParameters = {
                forceOrientation: ForceOrientation.LANDSCAPE,
                focusManager: focusManager,
                container: container,
                deviceInfo: deviceInfo,
                clientInfo: clientInfo,
                thirdPartyEventManager: thirdPartyEventManager,
                operativeEventManager: operativeEventManager,
                comScoreTrackingService: comScoreService,
                placement: TestFixtures.getPlacement(),
                campaign: campaign,
                configuration: TestFixtures.getConfiguration(),
                request: request,
                options: {},
                view: view
            };

            adUnit = new DisplayInterstitialAdUnit(nativeBridge, displayInterstitialAdUnitParameters);
        });

        afterEach(() => {
            if(adUnit.isShowing()) {
                adUnit.hide();
            }
            sandbox.restore();

            if (server) {
                server.restore();
            }
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
    }
});
