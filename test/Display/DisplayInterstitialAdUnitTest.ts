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
import { RequestManager } from 'Core/Managers/RequestManager';

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
import { Privacy } from 'Ads/Views/Privacy';
import { StorageBridge } from 'Core/Utilities/StorageBridge';
import { Backend } from '../../src/ts/Backend/Backend';
import { IAdsApi } from '../../src/ts/Ads/IAds';
import { ICoreApi } from '../../src/ts/Core/ICore';
import { ViewController } from '../../src/ts/Ads/AdUnits/Containers/ViewController';
import { AndroidDeviceInfo } from '../../src/ts/Core/Models/AndroidDeviceInfo';

[Platform.ANDROID, Platform.IOS].forEach(platform => {
    describe('DisplayInterstitialAdUnitTest', () => {
        let adUnit: DisplayInterstitialAdUnit;
        let backend: Backend;
        let nativeBridge: NativeBridge;
        let core: ICoreApi;
        let ads: IAdsApi;
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
                backend = TestFixtures.getBackend(platform);
                nativeBridge = TestFixtures.getNativeBridge(platform, backend);
                core = TestFixtures.getCoreApi(nativeBridge);
                ads = TestFixtures.getAdsApi(nativeBridge);
                const storageBridge = new StorageBridge(core);
                placement = TestFixtures.getPlacement();

                const metaDataManager = new MetaDataManager(core);
                const focusManager = new FocusManager(platform, core);
                const wakeUpManager = new WakeUpManager(core);
                const request = new RequestManager(platform, core, wakeUpManager);
                const coreConfig = TestFixtures.getCoreConfiguration();
                const adsConfig = TestFixtures.getAdsConfiguration();
                clientInfo = TestFixtures.getClientInfo(platform);
                if(platform === Platform.ANDROID) {
                    container = new Activity(core, ads, TestFixtures.getAndroidDeviceInfo(core));
                    deviceInfo = TestFixtures.getAndroidDeviceInfo(core);
                }
                if(platform === Platform.IOS) {
                    container = new ViewController(core, ads, TestFixtures.getIosDeviceInfo(core), focusManager, clientInfo);
                    deviceInfo = TestFixtures.getIosDeviceInfo(core);
                }
                sandbox.stub(container, 'open').returns(Promise.resolve());
                sandbox.stub(container, 'close').returns(Promise.resolve());
                thirdPartyEventManager = new ThirdPartyEventManager(core, request);
                sessionManager = new SessionManager(core.Storage, request, storageBridge);
                const gdprManager = sinon.createStubInstance(GdprManager);
                const programmaticTrackingService = sinon.createStubInstance(ProgrammaticTrackingService);
                operativeEventManager = OperativeEventManagerFactory.createOperativeEventManager({
                    platform: platform,
                    core: core,
                    ads: ads,
                    request: request,
                    metaDataManager: metaDataManager,
                    sessionManager: sessionManager,
                    clientInfo: clientInfo,
                    deviceInfo: deviceInfo,
                    coreConfig: coreConfig,
                    adsConfig: adsConfig,
                    storageBridge: storageBridge,
                    campaign: campaign
                });

                const privacy = new Privacy(platform, campaign, gdprManager, adsConfig.isGDPREnabled(), coreConfig.isCoppaCompliant());

                webPlayerContainer = sinon.createStubInstance(WebPlayerContainer);
                (<any>webPlayerContainer).onPageStarted = new Observable1<string>();
                (<any>webPlayerContainer).shouldOverrideUrlLoading = new Observable2<string, string>();
                asStub(webPlayerContainer.setSettings).resolves();
                asStub(webPlayerContainer.clearSettings).resolves();

                view = new DisplayInterstitial(platform, core, <AndroidDeviceInfo>deviceInfo, placement, campaign, privacy, false);
                view.render();
                document.body.appendChild(view.container());
                sandbox.stub(view, 'show');
                sandbox.stub(view, 'hide');

                displayInterstitialAdUnitParameters = {
                    platform: platform,
                    core: core,
                    ads: ads,
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

                adUnit = new DisplayInterstitialAdUnit(displayInterstitialAdUnitParameters);
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
});
