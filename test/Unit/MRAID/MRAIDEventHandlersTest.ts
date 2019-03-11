import { Activity } from 'Ads/AdUnits/Containers/Activity';
import { AdUnitContainer, Orientation } from 'Ads/AdUnits/Containers/AdUnitContainer';
import { IAdsApi } from 'Ads/IAds';
import { UserPrivacyManager } from 'Ads/Managers/UserPrivacyManager';
import { OperativeEventManager } from 'Ads/Managers/OperativeEventManager';
import { ThirdPartyEventManager } from 'Ads/Managers/ThirdPartyEventManager';
import { Placement } from 'Ads/Models/Placement';
import { ProgrammaticTrackingService } from 'Ads/Utilities/ProgrammaticTrackingService';
import { Privacy } from 'Ads/Views/Privacy';
import { Backend } from 'Backend/Backend';
import { Platform } from 'Core/Constants/Platform';
import { ICoreApi } from 'Core/ICore';
import { FocusManager } from 'Core/Managers/FocusManager';
import { RequestManager } from 'Core/Managers/RequestManager';
import { WakeUpManager } from 'Core/Managers/WakeUpManager';
import { ClientInfo } from 'Core/Models/ClientInfo';
import { DeviceInfo } from 'Core/Models/DeviceInfo';
import { NativeBridge } from 'Core/Native/Bridge/NativeBridge';
import { HttpKafka } from 'Core/Utilities/HttpKafka';
import 'mocha';
import { IMRAIDAdUnitParameters, MRAIDAdUnit } from 'MRAID/AdUnits/MRAIDAdUnit';
import { MRAIDEventHandler } from 'MRAID/EventHandlers/MRAIDEventHandler';
import { MRAIDCampaign } from 'MRAID/Models/MRAIDCampaign';
import { MRAID } from 'MRAID/Views/MRAID';
import * as sinon from 'sinon';
import { TestFixtures } from 'TestHelpers/TestFixtures';
import { IARApi } from 'AR/AR';
import { WebPlayerContainer } from 'Ads/Utilities/WebPlayer/WebPlayerContainer';
import { IStoreApi } from 'Store/IStore';

describe('MRAIDEventHandlersTest', () => {

    let platform: Platform;
    let backend: Backend;
    let nativeBridge: NativeBridge;
    let container: AdUnitContainer;
    let core: ICoreApi;
    let ads: IAdsApi;
    let store: IStoreApi;
    let ar: IARApi;
    let mraidAdUnit: MRAIDAdUnit;
    let mraidView: MRAID;
    let placement: Placement;
    let focusManager: FocusManager;
    let request: RequestManager;
    let operativeEventManager: OperativeEventManager;
    let deviceInfo: DeviceInfo;
    let clientInfo: ClientInfo;
    let thirdPartyEventManager: ThirdPartyEventManager;
    let extendedMraidAdUnitParams: IMRAIDAdUnitParameters;
    let mraidEventHandler: MRAIDEventHandler;
    let extendedMraidCampaign: MRAIDCampaign;
    let privacyManager: UserPrivacyManager;
    let programmaticTrackingService: ProgrammaticTrackingService;
    let webPlayerContainer: WebPlayerContainer;

    describe('with onClick', () => {
        beforeEach(() => {
            platform = Platform.ANDROID;
            backend = TestFixtures.getBackend(platform);
            nativeBridge = TestFixtures.getNativeBridge(platform, backend);
            core = TestFixtures.getCoreApi(nativeBridge);
            ads = TestFixtures.getAdsApi(nativeBridge);
            store = TestFixtures.getStoreApi(nativeBridge);
            ar = TestFixtures.getARApi(nativeBridge);

            sinon.spy(ads.Listener, 'sendClickEvent');

            focusManager = new FocusManager(platform, core);
            container = new Activity(core, ads, TestFixtures.getAndroidDeviceInfo(core));
            request = sinon.createStubInstance(RequestManager);
            placement = TestFixtures.getPlacement();
            request = new RequestManager(platform, core, new WakeUpManager(core));
            clientInfo = TestFixtures.getClientInfo(Platform.ANDROID);
            deviceInfo = TestFixtures.getAndroidDeviceInfo(core);

            thirdPartyEventManager = sinon.createStubInstance(ThirdPartyEventManager);
            operativeEventManager = sinon.createStubInstance(OperativeEventManager);

            extendedMraidCampaign = TestFixtures.getExtendedMRAIDCampaign();
            mraidView = sinon.createStubInstance(MRAID);
            (<sinon.SinonSpy>mraidView.container).restore();
            const viewContainer = document.createElement('div');
            sinon.stub(mraidView, 'container').returns(viewContainer);
            privacyManager = sinon.createStubInstance(UserPrivacyManager);
            programmaticTrackingService = sinon.createStubInstance(ProgrammaticTrackingService);
            webPlayerContainer = sinon.createStubInstance(WebPlayerContainer);

            extendedMraidAdUnitParams = {
            platform,
                core,
                ads,
                store,
                ar,
                forceOrientation: Orientation.LANDSCAPE,
                focusManager: focusManager,
                container: container,
                deviceInfo: deviceInfo,
                clientInfo: clientInfo,
                thirdPartyEventManager: thirdPartyEventManager,
                operativeEventManager: operativeEventManager,
                placement: TestFixtures.getPlacement(),
                campaign: extendedMraidCampaign,
                coreConfig: TestFixtures.getCoreConfiguration(),
                adsConfig: TestFixtures.getAdsConfiguration(),
                request: request,
                options: {},
                mraid: mraidView,
                endScreen: undefined,
                privacy: new Privacy(platform, extendedMraidCampaign, privacyManager, false, false),
                privacyManager: privacyManager,
                programmaticTrackingService: programmaticTrackingService,
                webPlayerContainer: webPlayerContainer
            };

            mraidAdUnit = new MRAIDAdUnit(extendedMraidAdUnitParams);
            sinon.stub(mraidAdUnit, 'sendClick');
            mraidEventHandler = new MRAIDEventHandler(mraidAdUnit, extendedMraidAdUnitParams);
        });

        afterEach(() => {
            mraidAdUnit.setShowing(true);
            return mraidAdUnit.hide();
        });

        it('should send a native click event', () => {
            mraidEventHandler.onMraidClick('http://example.net');
            sinon.assert.calledWith(<sinon.SinonSpy>ads.Listener.sendClickEvent, placement.getId());
        });

        describe('with onPlayableAnalyticsEvent', () => {
            let sandbox: sinon.SinonSandbox;

            before(() => {
                sandbox = sinon.createSandbox();
            });

            beforeEach(() => {
                extendedMraidCampaign = TestFixtures.getExtendedMRAIDCampaign();
                extendedMraidAdUnitParams.campaign = extendedMraidCampaign;
                sandbox.stub(HttpKafka, 'sendEvent');
            });

            afterEach(() => {
                sandbox.restore();
            });

            describe('MRAIDEventHandler', () => {
                it('should not send a analytics event', () => {
                    mraidAdUnit = new MRAIDAdUnit(extendedMraidAdUnitParams);
                    sinon.stub(mraidAdUnit, 'sendClick');
                    mraidEventHandler = new MRAIDEventHandler(mraidAdUnit, extendedMraidAdUnitParams);

                    mraidEventHandler.onPlayableAnalyticsEvent(15, 12, 0, 'win_screen', { 'level': 2 });
                    sinon.assert.notCalled(<sinon.SinonStub>HttpKafka.sendEvent);
                });
            });
        });
    });
});
