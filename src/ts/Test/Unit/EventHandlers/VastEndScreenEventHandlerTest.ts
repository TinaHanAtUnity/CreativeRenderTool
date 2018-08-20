import 'mocha';
import * as sinon from 'sinon';
import { assert } from 'chai';

import { NativeBridge } from 'Native/NativeBridge';
import { VastCampaign } from 'Models/Vast/VastCampaign';
import { TestFixtures } from '../TestHelpers/TestFixtures';
import { Overlay } from 'Views/Overlay';
import { Platform } from 'Constants/Platform';
import { IVastAdUnitParameters, VastAdUnit } from 'AdUnits/VastAdUnit';
import { VastEndScreen } from 'Views/VastEndScreen';
import { VastEndScreenEventHandler } from 'EventHandlers/VastEndScreenEventHandler';
import { AdUnitContainer, Orientation } from 'AdUnits/Containers/AdUnitContainer';
import { Activity } from 'AdUnits/Containers/Activity';
import { Video } from 'Models/Assets/Video';
import { Request } from 'Utilities/Request';
import { FocusManager } from 'Managers/FocusManager';
import { WakeUpManager } from 'Managers/WakeUpManager';
import { ThirdPartyEventManager } from 'Managers/ThirdPartyEventManager';
import { MetaDataManager } from 'Managers/MetaDataManager';
import { SessionManager } from 'Managers/SessionManager';

import EventTestVast from 'xml/EventTestVast.xml';
import { OperativeEventManagerFactory } from 'Managers/OperativeEventManagerFactory';
import { GdprManager } from 'Managers/GdprManager';
import { Privacy } from 'Views/Privacy';
import { ProgrammaticTrackingService } from 'ProgrammaticTrackingService/ProgrammaticTrackingService';
import { ForceQuitManager } from 'Managers/ForceQuitManager';

describe('VastEndScreenEventHandlersTest', () => {
    const handleInvocation = sinon.spy();
    const handleCallback = sinon.spy();
    let nativeBridge: NativeBridge;
    let container: AdUnitContainer;
    let request: Request;
    let vastAdUnitParameters: IVastAdUnitParameters;
    let forceQuitManager: ForceQuitManager;

    beforeEach(() => {
        nativeBridge = new NativeBridge({
            handleInvocation,
            handleCallback
        });

        const focusManager = new FocusManager(nativeBridge);
        const metaDataManager = new MetaDataManager(nativeBridge);

        forceQuitManager = sinon.createStubInstance(ForceQuitManager);
        container = new Activity(nativeBridge, TestFixtures.getAndroidDeviceInfo(), forceQuitManager);
        request = new Request(nativeBridge, new WakeUpManager(nativeBridge, new FocusManager(nativeBridge)));
        sinon.stub(request, 'followRedirectChain').callsFake((url) => {
            return Promise.resolve(url);
        });

        const campaign = TestFixtures.getCompanionVastCampaign();
        const clientInfo = TestFixtures.getClientInfo(Platform.ANDROID);
        const deviceInfo = TestFixtures.getAndroidDeviceInfo();
        const thirdPartyEventManager = new ThirdPartyEventManager(nativeBridge, request);
        const sessionManager = new SessionManager(nativeBridge, request);
        const configuration = TestFixtures.getConfiguration();
        const operativeEventManager = OperativeEventManagerFactory.createOperativeEventManager({
            nativeBridge: nativeBridge,
            request: request,
            metaDataManager: metaDataManager,
            sessionManager: sessionManager,
            clientInfo: clientInfo,
            deviceInfo: deviceInfo,
            configuration: configuration,
            campaign: campaign
        });

        const privacy = new Privacy(nativeBridge, false);
        const video = new Video('', TestFixtures.getSession());
        const overlay = new Overlay(nativeBridge, true, 'en', 'testGameId', privacy, false);
        const gdprManager = sinon.createStubInstance(GdprManager);
        const programmaticTrackingService = sinon.createStubInstance(ProgrammaticTrackingService);

        vastAdUnitParameters = {
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
            endScreen: undefined,
            overlay: overlay,
            video: video,
            gdprManager: gdprManager,
            programmaticTrackingService: programmaticTrackingService
        };
    });

    describe('when calling onClose', () => {
        it('should hide endcard', () => {
            const vastEndScreen = new VastEndScreen(nativeBridge, vastAdUnitParameters.configuration.isCoppaCompliant(), vastAdUnitParameters.campaign, vastAdUnitParameters.clientInfo.getGameId());
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
        let vastEndScreen: VastEndScreen;
        let vastEndScreenEventHandler: VastEndScreenEventHandler;
        const vastXml = EventTestVast;
        const vastParser = TestFixtures.getVastParser();

        beforeEach(() => {

            video = new Video('', TestFixtures.getSession());
            campaign = TestFixtures.getEventVastCampaign();

            vastAdUnitParameters.video = video;
            vastAdUnitParameters.campaign = campaign;
            vastAdUnitParameters.placement = TestFixtures.getPlacement();
            vastEndScreen = new VastEndScreen(nativeBridge, vastAdUnitParameters.configuration.isCoppaCompliant(), vastAdUnitParameters.campaign, vastAdUnitParameters.clientInfo.getGameId());
            vastAdUnitParameters.endScreen = vastEndScreen;
            vastAdUnit = new VastAdUnit(nativeBridge, vastAdUnitParameters);
            vastEndScreenEventHandler = new VastEndScreenEventHandler(nativeBridge, vastAdUnit, vastAdUnitParameters);
            sinon.stub(vastAdUnit, 'sendTrackingEvent').returns(sinon.spy());
        });

        it('should send a tracking event for vast video end card click', () => {
            sinon.stub(nativeBridge, 'getPlatform').returns(Platform.IOS);
            sinon.stub(nativeBridge.UrlScheme, 'open').resolves();
            return vastEndScreenEventHandler.onVastEndScreenClick().then(() => {
                sinon.assert.calledOnce(<sinon.SinonSpy>vastAdUnit.sendTrackingEvent);
            });
        });

        it('should send second tracking event for vast video end card click after processing the first', () => {
            sinon.stub(nativeBridge, 'getPlatform').returns(Platform.IOS);
            sinon.stub(nativeBridge.UrlScheme, 'open').resolves();
            return vastEndScreenEventHandler.onVastEndScreenClick().then(() => {
                return vastEndScreenEventHandler.onVastEndScreenClick().then(() => {
                    sinon.assert.calledTwice(<sinon.SinonSpy>vastAdUnit.sendTrackingEvent);
                });
            });
        });

        it('should ignore user clicks while processing the first click event', () => {
            const mockEndScreen = sinon.mock(vastEndScreen);
            const expectationEndScreen = sinon.mock(vastEndScreen).expects('setCallButtonEnabled').twice();
            sinon.stub(nativeBridge, 'getPlatform').returns(Platform.IOS);
            sinon.stub(nativeBridge.UrlScheme, 'open').resolves();
            vastEndScreenEventHandler.onVastEndScreenClick().then(() => {
                mockEndScreen.verify();
                assert.equal(expectationEndScreen.getCall(0).args[0], false, 'Should disable end screen CTA while processing click event');
                assert.equal(expectationEndScreen.getCall(1).args[0], true, 'Should enable end screen CTA after processing click event');
            });
        });

        it('should use video click through url when companion click url is not present', () => {
            sinon.stub(nativeBridge, 'getPlatform').returns(Platform.IOS);
            sinon.stub(nativeBridge.UrlScheme, 'open').resolves();
            sinon.stub(vastAdUnit, 'getCompanionClickThroughUrl').returns(null);
            sinon.stub(vastAdUnit, 'getVideoClickThroughURL').returns('https://bar.com');
            return vastEndScreenEventHandler.onVastEndScreenClick().then(() => {
                sinon.assert.calledWith(<sinon.SinonSpy>nativeBridge.UrlScheme.open, 'https://bar.com');
            });
        });

        it('should open click through link on iOS', () => {
            sinon.stub(nativeBridge, 'getPlatform').returns(Platform.IOS);
            sinon.stub(nativeBridge.UrlScheme, 'open').resolves();
            sinon.stub(vastAdUnit, 'getCompanionClickThroughUrl').returns('https://foo.com');
            return vastEndScreenEventHandler.onVastEndScreenClick().then(() => {
                sinon.assert.calledWith(<sinon.SinonSpy>nativeBridge.UrlScheme.open, 'https://foo.com');
            });
        });

        it('should open click through link on Android', () => {
            sinon.stub(nativeBridge, 'getPlatform').returns(Platform.ANDROID);
            sinon.stub(nativeBridge.Intent, 'launch').resolves();
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
