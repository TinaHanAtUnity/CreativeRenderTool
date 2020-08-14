import { Activity } from 'Ads/AdUnits/Containers/Activity';
import { Orientation } from 'Ads/AdUnits/Containers/AdUnitContainer';
import { IAdsApi } from 'Ads/IAds';
import { UserPrivacyManager } from 'Ads/Managers/UserPrivacyManager';
import { OperativeEventManager } from 'Ads/Managers/OperativeEventManager';
import { ThirdPartyEventManager } from 'Ads/Managers/ThirdPartyEventManager';
import { Placement } from 'Ads/Models/Placement';
import { Privacy } from 'Ads/Views/Privacy';
import { Backend } from 'Backend/Backend';
import { Platform } from 'Core/Constants/Platform';
import { ICoreApi } from 'Core/ICore';
import { FocusManager } from 'Core/Managers/FocusManager';
import { RequestManager } from 'Core/Managers/RequestManager';
import { NativeBridge } from 'Core/Native/Bridge/NativeBridge';
import {
    DisplayInterstitialAdUnit,
    IDisplayInterstitialAdUnitParameters
} from 'Display/AdUnits/DisplayInterstitialAdUnit';
import { DisplayInterstitialEventHandler } from 'Display/EventHandlers/DisplayInterstitialEventHandler';
import { DisplayInterstitialCampaign } from 'Display/Models/DisplayInterstitialCampaign';
import { DisplayInterstitial } from 'Display/Views/DisplayInterstitial';
import 'mocha';
import * as sinon from 'sinon';
import { TestFixtures } from 'TestHelpers/TestFixtures';
import { WebPlayerContainer } from 'Ads/Utilities/WebPlayer/WebPlayerContainer';
import { InterstitialWebPlayerContainer } from 'Ads/Utilities/WebPlayer/InterstitialWebPlayerContainer';
import { IStoreApi } from 'Store/IStore';
import { PrivacySDK } from 'Privacy/PrivacySDK';

describe('DisplayInterstitialEventHandler', () => {
    let view: DisplayInterstitial;
    let backend: Backend;
    let nativeBridge: NativeBridge;
    let core: ICoreApi;
    let ads: IAdsApi;
    let store: IStoreApi;
    let placement: Placement;
    let campaign: DisplayInterstitialCampaign;
    let sandbox: sinon.SinonSandbox;
    let displayInterstitialAdUnitParameters: IDisplayInterstitialAdUnitParameters;
    let displayInterstitialAdUnit: DisplayInterstitialAdUnit;
    let displayInterstitialEventHandler: DisplayInterstitialEventHandler;
    let operativeEventManager: OperativeEventManager;

    function eventHandlerTests() {
        beforeEach(() => {
            sandbox = sinon.createSandbox();
            const platform = Platform.ANDROID;
            backend = TestFixtures.getBackend(platform);
            nativeBridge = TestFixtures.getNativeBridge(platform, backend);
            core = TestFixtures.getCoreApi(nativeBridge);
            ads = TestFixtures.getAdsApi(nativeBridge);
            store = TestFixtures.getStoreApi(nativeBridge);
            placement = new Placement({
                id: '123',
                name: 'test',
                default: true,
                allowSkip: true,
                skipInSeconds: 5,
                disableBackButton: true,
                useDeviceOrientationForVideo: false,
                skipEndCardOnClose: false,
                disableVideoControlsFade: false,
                useCloseIconInsteadOfSkipIcon: false,
                adTypes: [],
                refreshDelay: 1000,
                muteVideo: false
            });

            campaign = TestFixtures.getDisplayInterstitialCampaign();

            const deviceInfo = TestFixtures.getAndroidDeviceInfo(core);
            sandbox.stub(deviceInfo, 'getApiLevel').returns(16);

            const container = new Activity(core, ads, TestFixtures.getAndroidDeviceInfo(core));
            const focusManager = sinon.createStubInstance(FocusManager);
            const request = sinon.createStubInstance(RequestManager);
            const clientInfo = TestFixtures.getClientInfo(Platform.ANDROID);
            const thirdPartyEventManager = sinon.createStubInstance(ThirdPartyEventManager);
            operativeEventManager = sinon.createStubInstance(OperativeEventManager);
            (<sinon.SinonStub>(<any>operativeEventManager).sendStart).returns(Promise.resolve());
            const privacyManager = sinon.createStubInstance(UserPrivacyManager);

            const coreConfig = TestFixtures.getCoreConfiguration();

            const privacy = new Privacy(platform, campaign, privacyManager, false, false, 'en');

            view = new DisplayInterstitial(platform, core, deviceInfo, placement, campaign, privacy, false);

            const webPlayerContainer: WebPlayerContainer = TestFixtures.getWebPlayerContainer();
            const privacySDK = sinon.createStubInstance(PrivacySDK);

            displayInterstitialAdUnitParameters = {
                platform: platform,
                core: core,
                ads: ads,
                store: store,
                privacy: privacy,
                forceOrientation: Orientation.LANDSCAPE,
                focusManager: focusManager,
                container: container,
                deviceInfo: deviceInfo,
                clientInfo: clientInfo,
                thirdPartyEventManager: thirdPartyEventManager,
                operativeEventManager: operativeEventManager,
                placement: placement,
                campaign: campaign,
                coreConfig: TestFixtures.getCoreConfiguration(),
                adsConfig: TestFixtures.getAdsConfiguration(),
                request: request,
                options: {},
                view: view,
                privacyManager: privacyManager,
                webPlayerContainer: webPlayerContainer,
                privacySDK: privacySDK
            };

            displayInterstitialAdUnit = new DisplayInterstitialAdUnit(displayInterstitialAdUnitParameters);
            displayInterstitialEventHandler = new DisplayInterstitialEventHandler(displayInterstitialAdUnit, displayInterstitialAdUnitParameters);
            view.addEventHandler(displayInterstitialEventHandler);
            return displayInterstitialAdUnit.show();
        });

        describe('on Display Interstitial Markup Campaign', () => {
            eventHandlerTests();
        });

        afterEach(() => {
            sandbox.restore();
            displayInterstitialAdUnit.setShowing(true);
            return displayInterstitialAdUnit.hide();
        });

        describe('on close', () => {
            it('should hide the adUnit', () => {
                sandbox.spy(displayInterstitialAdUnit, 'hide');
                displayInterstitialEventHandler.onDisplayInterstitialClose();

                sinon.assert.called(<sinon.SinonSpy>displayInterstitialAdUnit.hide);
            });
            it('should send the view diagnostic event', () => {
                displayInterstitialEventHandler.onDisplayInterstitialClose();
                sinon.assert.called(<sinon.SinonSpy>operativeEventManager.sendView);
            });
            it('should send the third quartile diagnostic event', () => {
                displayInterstitialEventHandler.onDisplayInterstitialClose();
                sinon.assert.called(<sinon.SinonSpy>operativeEventManager.sendThirdQuartile);
            });
            it('should send PTS third quartile diagnostic event', () => {
                displayInterstitialEventHandler.onDisplayInterstitialClose();
                sinon.assert.called(<sinon.SinonSpy>displayInterstitialAdUnit.sendTrackingEvent);
            });
        });
    }
});
