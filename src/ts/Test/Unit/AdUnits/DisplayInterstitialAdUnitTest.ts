import 'mocha';
import * as sinon from 'sinon';

import { DisplayInterstitialAdUnit, IDisplayInterstitialAdUnitParameters } from 'AdUnits/DisplayInterstitialAdUnit';
import { NativeBridge } from 'Native/NativeBridge';
import { AdUnitContainer, Orientation } from 'AdUnits/Containers/AdUnitContainer';
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
import { OperativeEventManagerFactory } from 'Managers/OperativeEventManagerFactory';
import { GdprManager } from 'Managers/GdprManager';
import { Privacy } from 'Views/Privacy';
import { WebPlayerContainer } from 'Utilities/WebPlayer/WebPlayerContainer';
import { asStub } from '../TestHelpers/Functions';
import { Observable, Observable2, Observable1 } from 'Utilities/Observable';
import { PrivacyEventHandler } from 'EventHandlers/PrivacyEventHandler';
import { ProgrammaticTrackingService } from 'ProgrammaticTrackingService/ProgrammaticTrackingService';

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
    let webPlayerContainer: WebPlayerContainer;
    let displayInterstitialAdUnitParameters: IDisplayInterstitialAdUnitParameters;

    describe('On static-interstial campaign', () => {
        adUnitTests();
    });

    function adUnitTests(): void {
        beforeEach(() => {
            campaign = TestFixtures.getDisplayInterstitialCampaign();

            sandbox = sinon.sandbox.create();
            nativeBridge = TestFixtures.getNativeBridge(Platform.ANDROID);
            placement = TestFixtures.getPlacement();

            const metaDataManager = new MetaDataManager(nativeBridge);
            const focusManager = new FocusManager(nativeBridge);
            const wakeUpManager = new WakeUpManager(nativeBridge, focusManager);
            const request = new Request(nativeBridge, wakeUpManager);
            const configuration = TestFixtures.getConfiguration();
            container = new Activity(nativeBridge, TestFixtures.getAndroidDeviceInfo());
            sandbox.stub(container, 'open').returns(Promise.resolve());
            sandbox.stub(container, 'close').returns(Promise.resolve());
            clientInfo = TestFixtures.getClientInfo(Platform.ANDROID);
            deviceInfo = TestFixtures.getAndroidDeviceInfo();
            thirdPartyEventManager = new ThirdPartyEventManager(nativeBridge, request);
            sessionManager = new SessionManager(nativeBridge, request);
            const gdprManager = sinon.createStubInstance(GdprManager);
            const programmaticTrackingService = sinon.createStubInstance(ProgrammaticTrackingService);
            operativeEventManager = OperativeEventManagerFactory.createOperativeEventManager({
                nativeBridge: nativeBridge,
                request: request,
                metaDataManager: metaDataManager,
                sessionManager: sessionManager,
                clientInfo: clientInfo,
                deviceInfo: deviceInfo,
                configuration: configuration,
                campaign: campaign
            });

            const privacy = new Privacy(nativeBridge, configuration.isCoppaCompliant());

            webPlayerContainer = sinon.createStubInstance(WebPlayerContainer);
            (<any>webPlayerContainer).onPageStarted = new Observable1<string>();
            (<any>webPlayerContainer).shouldOverrideUrlLoading = new Observable2<string, string>();
            asStub(webPlayerContainer.setSettings).resolves();
            asStub(webPlayerContainer.clearSettings).resolves();

            view = new DisplayInterstitial(nativeBridge, placement, campaign, privacy, false);
            view.render();
            document.body.appendChild(view.container());
            sandbox.stub(view, 'show');
            sandbox.stub(view, 'hide');

            displayInterstitialAdUnitParameters = {
                webPlayerContainer,
                forceOrientation: Orientation.LANDSCAPE,
                focusManager: focusManager,
                container: container,
                deviceInfo: deviceInfo,
                clientInfo: clientInfo,
                thirdPartyEventManager: thirdPartyEventManager,
                operativeEventManager: operativeEventManager,
                placement: TestFixtures.getPlacement(),
                campaign: campaign,
                configuration: configuration,
                request: request,
                options: {},
                view: view,
                gdprManager: gdprManager,
                programmaticTrackingService: programmaticTrackingService
            };

            adUnit = new DisplayInterstitialAdUnit(nativeBridge, displayInterstitialAdUnitParameters);
        });

        afterEach(() => {
            if(adUnit.isShowing()) {
                adUnit.hide();
            }
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
    }
});
