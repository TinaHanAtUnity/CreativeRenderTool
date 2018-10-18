import { Activity } from 'Ads/AdUnits/Containers/Activity';
import { Orientation } from 'Ads/AdUnits/Containers/AdUnitContainer';
import { GdprManager } from 'Ads/Managers/GdprManager';
import { OperativeEventManager } from 'Ads/Managers/OperativeEventManager';
import { ThirdPartyEventManager } from 'Ads/Managers/ThirdPartyEventManager';
import { Placement } from 'Ads/Models/Placement';
import { ProgrammaticTrackingService } from 'Ads/Utilities/ProgrammaticTrackingService';
import { Platform } from 'Core/Constants/Platform';
import { FocusManager } from 'Core/Managers/FocusManager';
import { NativeBridge } from 'Core/Native/Bridge/NativeBridge';
import { RequestManager } from 'Core/Managers/RequestManager';
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
import { Privacy } from 'Ads/Views/Privacy';
import { Backend } from '../../src/ts/Backend/Backend';
import { ICoreApi } from '../../src/ts/Core/ICore';
import { IAdsApi } from '../../src/ts/Ads/IAds';

describe('DisplayInterstitialEventHandler', () => {
    let view: DisplayInterstitial;
    let backend: Backend;
    let nativeBridge: NativeBridge;
    let core: ICoreApi;
    let ads: IAdsApi;
    let placement: Placement;
    let campaign: DisplayInterstitialCampaign;
    let sandbox: sinon.SinonSandbox;
    let displayInterstitialAdUnitParameters: IDisplayInterstitialAdUnitParameters;
    let displayInterstitialAdUnit: DisplayInterstitialAdUnit;
    let displayInterstitialEventHandler: DisplayInterstitialEventHandler;
    let operativeEventManager: OperativeEventManager;

    describe('on Display Interstitial Markup Campaign', () => {
        eventHandlerTests();
    });

    function eventHandlerTests() {
        beforeEach(() => {
            sandbox = sinon.sandbox.create();
            const platform = Platform.ANDROID;
            backend = TestFixtures.getBackend(platform);
            nativeBridge = TestFixtures.getNativeBridge(platform, backend);
            core = TestFixtures.getCoreApi(nativeBridge);
            ads = TestFixtures.getAdsApi(nativeBridge);
            placement = new Placement({
                id: '123',
                name: 'test',
                default: true,
                allowSkip: true,
                skipInSeconds: 5,
                disableBackButton: true,
                useDeviceOrientationForVideo: false,
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
            const gdprManager = sinon.createStubInstance(GdprManager);

            const coreConfig = TestFixtures.getCoreConfiguration();
            const programmaticTrackingService = sinon.createStubInstance(ProgrammaticTrackingService);

            const privacy = new Privacy(platform, campaign, gdprManager, false, false);

            view = new DisplayInterstitial(platform, core, deviceInfo, placement, campaign, privacy, false);

            displayInterstitialAdUnitParameters = {
                platform: platform,
                core: core,
                ads: ads,
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
                gdprManager: gdprManager,
                programmaticTrackingService: programmaticTrackingService
            };

            displayInterstitialAdUnit = new DisplayInterstitialAdUnit(displayInterstitialAdUnitParameters);
            displayInterstitialEventHandler = new DisplayInterstitialEventHandler(displayInterstitialAdUnit, displayInterstitialAdUnitParameters);
            view.addEventHandler(displayInterstitialEventHandler);
            view.render();
            return view.show();
        });

        afterEach(() => {
            view.hide();
            sandbox.restore();
        });

        describe('on close', () => {
            it('should hide the adUnit', () => {
                sandbox.stub(displayInterstitialAdUnit, 'hide');
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
        });
    }
});
