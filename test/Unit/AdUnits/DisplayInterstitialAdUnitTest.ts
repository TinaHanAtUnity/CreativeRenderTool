import { Activity } from 'Ads/AdUnits/Containers/Activity';
import { AdUnitContainer, Orientation } from 'Ads/AdUnits/Containers/AdUnitContainer';
import { GdprManager } from 'Ads/Managers/GdprManager';
import { OperativeEventManager } from 'Ads/Managers/OperativeEventManager';
import { OperativeEventManagerFactory } from 'Ads/Managers/OperativeEventManagerFactory';
import { SessionManager } from 'Ads/Managers/SessionManager';
import { ThirdPartyEventManager } from 'Ads/Managers/ThirdPartyEventManager';
import { Placement } from 'Ads/Models/Placement';
import { ProgrammaticTrackingService } from 'Ads/Utilities/ProgrammaticTrackingService';
import { WebPlayerContainer } from 'Ads/Utilities/WebPlayer/WebPlayerContainer';
import { Platform } from 'Core/Constants/Platform';
import { FocusManager } from 'Core/Managers/FocusManager';
import { MetaDataManager } from 'Core/Managers/MetaDataManager';
import { WakeUpManager } from 'Core/Managers/WakeUpManager';
import { ClientInfo } from 'Core/Models/ClientInfo';
import { DeviceInfo } from 'Core/Models/DeviceInfo';
import { NativeBridge } from 'Core/Native/Bridge/NativeBridge';
import { Observable1, Observable2 } from 'Core/Utilities/Observable';
import { Request } from 'Core/Utilities/Request';

import {
    DisplayInterstitialAdUnit,
    IDisplayInterstitialAdUnitParameters
} from 'Display/AdUnits/DisplayInterstitialAdUnit';
import { DisplayInterstitialCampaign } from 'Display/Models/DisplayInterstitialCampaign';
import { DisplayInterstitial } from 'Display/Views/DisplayInterstitial';
import 'mocha';
import * as sinon from 'sinon';
import { asStub } from 'TestHelpers/Functions';
import { TestFixtures } from 'TestHelpers/TestFixtures';
import { GDPRPrivacy } from 'Ads/Views/GDPRPrivacy';

describe('DisplayInterstitialAdUnitTest', () => {
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
            const coreConfig = TestFixtures.getCoreConfiguration();
            const adsConfig = TestFixtures.getAdsConfiguration();
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
                coreConfig: coreConfig,
                adsConfig: adsConfig,
                campaign: campaign
            });

            const privacy = new GDPRPrivacy(nativeBridge, gdprManager, coreConfig.isCoppaCompliant());

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
                coreConfig: coreConfig,
                adsConfig: adsConfig,
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
