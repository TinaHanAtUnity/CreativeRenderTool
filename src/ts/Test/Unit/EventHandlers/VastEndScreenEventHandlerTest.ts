import 'mocha';
import * as sinon from 'sinon';

import { NativeBridge } from 'Native/NativeBridge';
import { VastCampaign } from 'Models/Vast/VastCampaign';
import { TestFixtures } from '../TestHelpers/TestFixtures';
import { Overlay } from 'Views/Overlay';
import { Platform } from 'Constants/Platform';
import { IVastAdUnitParameters, VastAdUnit } from 'AdUnits/VastAdUnit';
import { VastEndScreen } from 'Views/VastEndScreen';
import { VastEndScreenEventHandler } from 'EventHandlers/VastEndScreenEventHandler';
import { AdUnitContainer, ForceOrientation } from 'AdUnits/Containers/AdUnitContainer';
import { Activity } from 'AdUnits/Containers/Activity';
import { Video } from 'Models/Assets/Video';
import { Request } from 'Utilities/Request';
import { FocusManager } from 'Managers/FocusManager';
import { WakeUpManager } from 'Managers/WakeUpManager';
import { ThirdPartyEventManager } from 'Managers/ThirdPartyEventManager';
import { MetaDataManager } from 'Managers/MetaDataManager';
import { OperativeEventManager } from 'Managers/OperativeEventManager';
import { ComScoreTrackingService } from 'Utilities/ComScoreTrackingService';
import { SessionManager } from 'Managers/SessionManager';

import EventTestVast from 'xml/EventTestVast.xml';

describe('VastEndScreenEventHandlersTest', () => {
    const handleInvocation = sinon.spy();
    const handleCallback = sinon.spy();
    let nativeBridge: NativeBridge;
    let container: AdUnitContainer;
    let request: Request;
    let vastAdUnitParameters: IVastAdUnitParameters;
    let comScoreService: ComScoreTrackingService;

    beforeEach(() => {
        nativeBridge = new NativeBridge({
            handleInvocation,
            handleCallback
        });

        const focusManager = new FocusManager(nativeBridge);
        const metaDataManager = new MetaDataManager(nativeBridge);

        container = new Activity(nativeBridge, TestFixtures.getDeviceInfo(Platform.ANDROID));
        request = new Request(nativeBridge, new WakeUpManager(nativeBridge, new FocusManager(nativeBridge)));
        sinon.stub(request, 'followRedirectChain').callsFake((url) => {
            return Promise.resolve(url);
        });

        const campaign = TestFixtures.getCompanionVastCampaign();
        const clientInfo = TestFixtures.getClientInfo(Platform.ANDROID);
        const deviceInfo = TestFixtures.getDeviceInfo(Platform.ANDROID);
        const thirdPartyEventManager = new ThirdPartyEventManager(nativeBridge, request);
        const sessionManager = new SessionManager(nativeBridge);
        const operativeEventManager = new OperativeEventManager(nativeBridge, request, metaDataManager, sessionManager, clientInfo, deviceInfo);
        const video = new Video('', TestFixtures.getSession());
        const overlay = new Overlay(nativeBridge, true, 'en', 'testGameId');
        comScoreService = new ComScoreTrackingService(thirdPartyEventManager, nativeBridge, deviceInfo);

        vastAdUnitParameters = {
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
            endScreen: undefined,
            overlay: overlay,
            video: video
        };
    });

    describe('when calling onClose', () => {
        it('should hide endcard', () => {
            const vastEndScreen = new VastEndScreen(nativeBridge, vastAdUnitParameters.campaign, vastAdUnitParameters.clientInfo.getGameId());
            vastAdUnitParameters.endScreen = vastEndScreen;
            const vastAdUnit = new VastAdUnit(nativeBridge, vastAdUnitParameters);
            sinon.stub(vastAdUnit, 'hide').returns(sinon.spy());
            const vastEndScreenEventHandler = new VastEndScreenEventHandler(nativeBridge, vastAdUnit, vastAdUnitParameters);

            vastEndScreenEventHandler.onVastEndScreenClose();
            sinon.assert.called(<sinon.SinonSpy>vastAdUnit.hide);
        });
    });

    describe('when calling onClick', () => {
        let vastAdUnit: VastAdUnit;
        let video: Video;
        let campaign: VastCampaign;
        let vastEndScreenEventHandler: VastEndScreenEventHandler;
        const vastXml = EventTestVast;
        const vastParser = TestFixtures.getVastParser();
        const vast = vastParser.parseVast(vastXml);

        beforeEach(() => {

            video = new Video('', TestFixtures.getSession());
            campaign = new VastCampaign(vast, '12345', TestFixtures.getSession(), 'gamerId', 1);

            vastAdUnitParameters.video = video;
            vastAdUnitParameters.campaign = campaign;
            vastAdUnitParameters.placement = TestFixtures.getPlacement();
            const vastEndScreen = new VastEndScreen(nativeBridge, vastAdUnitParameters.campaign, vastAdUnitParameters.clientInfo.getGameId());
            vastAdUnitParameters.endScreen = vastEndScreen;
            vastAdUnit = new VastAdUnit(nativeBridge, vastAdUnitParameters);
            vastEndScreenEventHandler = new VastEndScreenEventHandler(nativeBridge, vastAdUnit, vastAdUnitParameters);
        });

        it('should send a tracking event for vast video end card click', () => {
            sinon.stub(vastAdUnit, 'sendTrackingEvent');

            return vastEndScreenEventHandler.onVastEndScreenClick().then(() => {
                sinon.assert.called(<sinon.SinonSpy>vastAdUnit.sendTrackingEvent);
            });
        });

        it('should use video click through url when companion click url is not present', () => {
            sinon.stub(nativeBridge, 'getPlatform').returns(Platform.IOS);
            sinon.stub(nativeBridge.UrlScheme, 'open');
            sinon.stub(vastAdUnit, 'getCompanionClickThroughUrl').returns(null);
            sinon.stub(vastAdUnit, 'getVideoClickThroughURL').returns('https://bar.com');

            return vastEndScreenEventHandler.onVastEndScreenClick().then(() => {
                sinon.assert.calledWith(<sinon.SinonSpy>nativeBridge.UrlScheme.open, 'https://bar.com');
            });
        });

        it('should open click through link on iOS', () => {
            sinon.stub(nativeBridge, 'getPlatform').returns(Platform.IOS);
            sinon.stub(nativeBridge.UrlScheme, 'open');
            sinon.stub(vastAdUnit, 'getCompanionClickThroughUrl').returns('https://foo.com');

            return vastEndScreenEventHandler.onVastEndScreenClick().then(() => {
                sinon.assert.calledWith(<sinon.SinonSpy>nativeBridge.UrlScheme.open, 'https://foo.com');
            });
        });

        it('should open click through link on Android', () => {
            sinon.stub(nativeBridge, 'getPlatform').returns(Platform.ANDROID);
            sinon.stub(nativeBridge.Intent, 'launch');
            sinon.stub(vastAdUnit, 'getCompanionClickThroughUrl').returns('https://foo.com');

            return vastEndScreenEventHandler.onVastEndScreenClick().then(() => {
                sinon.assert.calledWith(<sinon.SinonSpy>nativeBridge.Intent.launch, {
                    'action': 'android.intent.action.VIEW',
                    'uri': 'https://foo.com'
                });
            });
        });
    });
});
