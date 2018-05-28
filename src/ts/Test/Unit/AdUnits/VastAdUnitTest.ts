import 'mocha';
import { assert } from 'chai';
import * as sinon from 'sinon';

import { IVastAdUnitParameters, VastAdUnit } from 'AdUnits/VastAdUnit';
import { VastCreativeCompanionAd } from 'Models/Vast/VastCreativeCompanionAd';
import { VastCampaign } from 'Models/Vast/VastCampaign';
import { Overlay } from 'Views/Overlay';
import { ThirdPartyEventManager } from 'Managers/ThirdPartyEventManager';
import { TestFixtures } from '../TestHelpers/TestFixtures';
import { Request } from 'Utilities/Request';
import { WakeUpManager } from 'Managers/WakeUpManager';
import { Placement } from 'Models/Placement';
import { Platform } from 'Constants/Platform';
import { VastEndScreen } from 'Views/VastEndScreen';
import { Orientation } from 'AdUnits/Containers/AdUnitContainer';
import { Activity } from 'AdUnits/Containers/Activity';
import { Video } from 'Models/Assets/Video';
import { FocusManager } from 'Managers/FocusManager';
import { DeviceInfo } from 'Models/DeviceInfo';
import { ClientInfo } from 'Models/ClientInfo';
import { SessionManager } from 'Managers/SessionManager';
import { MetaDataManager } from 'Managers/MetaDataManager';

import EventTestVast from 'xml/EventTestVast.xml';
import { OperativeEventManagerFactory } from 'Managers/OperativeEventManagerFactory';
import { GdprConsentManager } from 'Managers/GdprConsentManager';

describe('VastAdUnit', () => {

    let sandbox: sinon.SinonSandbox;
    let thirdPartyEventManager: ThirdPartyEventManager;
    let vastAdUnit: VastAdUnit;
    let focusManager: FocusManager;
    let vastAdUnitParameters: IVastAdUnitParameters;
    let deviceInfo: DeviceInfo;
    let clientInfo: ClientInfo;
    let placement: Placement;
    let vastCampaign: VastCampaign;

    before(() => {
        sandbox = sinon.sandbox.create();
    });

    beforeEach(() => {
        const vastParser = TestFixtures.getVastParser();

        const vastXml = EventTestVast;

        const vast = vastParser.parseVast(vastXml);

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

        clientInfo = TestFixtures.getClientInfo(Platform.ANDROID);
        deviceInfo = TestFixtures.getAndroidDeviceInfo();
        const nativeBridge = TestFixtures.getNativeBridge();
        focusManager = new FocusManager(nativeBridge);
        const wakeUpManager = new WakeUpManager(nativeBridge, focusManager);
        const request = new Request(nativeBridge, wakeUpManager);
        const activity = new Activity(nativeBridge, TestFixtures.getAndroidDeviceInfo());
        thirdPartyEventManager = new ThirdPartyEventManager(nativeBridge, request);
        vastCampaign = TestFixtures.getEventVastCampaign();
        const video = vastCampaign.getVideo();
        const configuration = TestFixtures.getConfiguration();

        let duration = vastCampaign.getVast().getDuration();
        if(duration) {
            duration = duration * 1000;
            video.setDuration(duration);
        }

        const sessionManager = new SessionManager(nativeBridge, request);
        const metaDataManager = new MetaDataManager(nativeBridge);
        const operativeEventManager = OperativeEventManagerFactory.createOperativeEventManager({
            nativeBridge: nativeBridge,
            request: request,
            metaDataManager: metaDataManager,
            sessionManager: sessionManager,
            clientInfo: clientInfo,
            deviceInfo: deviceInfo,
            configuration: configuration,
            campaign: vastCampaign
        });

        const overlay = new Overlay(nativeBridge, false, 'en', clientInfo.getGameId());
        const gdprManager = sinon.createStubInstance(GdprConsentManager);

        vastAdUnitParameters = {
            forceOrientation: Orientation.LANDSCAPE,
            focusManager: focusManager,
            container: activity,
            deviceInfo: deviceInfo,
            clientInfo: clientInfo,
            thirdPartyEventManager: thirdPartyEventManager,
            operativeEventManager: operativeEventManager,
            placement: placement,
            campaign: vastCampaign,
            configuration: configuration,
            request: request,
            options: {},
            endScreen: undefined,
            overlay: overlay,
            video: video,
            gdprManager: gdprManager
        };

        vastAdUnit = new VastAdUnit(nativeBridge, vastAdUnitParameters);
    });

    afterEach(() => sandbox.restore());

    describe('sendTrackingEvent', () => {
        it('should replace "%ZONE%" in the url with the placement id', () => {
            const vast = vastCampaign.getVast();
            const urlTemplate = 'http://foo.biz/%ZONE%/123';
            sandbox.stub(vast, 'getTrackingEventUrls').returns([ urlTemplate ]);
            sandbox.stub(thirdPartyEventManager, 'sendEvent').returns(null);
            vastAdUnit.sendTrackingEvent('eventName', 'sessionId');

            sinon.assert.calledOnce(<sinon.SinonSpy>thirdPartyEventManager.sendEvent);
            sinon.assert.calledWith(<sinon.SinonSpy>thirdPartyEventManager.sendEvent, 'vast eventName', 'sessionId', 'http://foo.biz/' + placement.getId() + '/123');
        });

        it('should replace "%SDK_VERSION%" in the url with the SDK version as a query parameter', () => {
            const urlTemplate = 'http://ads-brand-postback.unityads.unity3d.com/brands/2002/defaultVideoAndPictureZone/%ZONE%/impression/common?adSourceId=2&advertiserDomain=appnexus.com&advertisingTrackingId=49f7acaa-81f2-4887-9f3b-cd124854879c&cc=USD&creativeId=54411305&dealCode=&demandSeatId=1&fillSource=appnexus&floor=0&gamerId=5834bc21b54e3b0100f44c92&gross=0&networkId=&precomputedFloor=0&seatId=958&value=1.01&sdkVersion=%SDK_VERSION%';
            const vast = vastCampaign.getVast();
            sandbox.stub(vast, 'getTrackingEventUrls').returns([ urlTemplate ]);
            sandbox.stub(thirdPartyEventManager, 'sendEvent').returns(null);
            vastAdUnit.sendTrackingEvent('start', 'sessionId');

            sinon.assert.calledOnce(<sinon.SinonSpy>thirdPartyEventManager.sendEvent);
            sinon.assert.calledWith(<sinon.SinonSpy>thirdPartyEventManager.sendEvent, 'vast start', 'sessionId', 'http://ads-brand-postback.unityads.unity3d.com/brands/2002/defaultVideoAndPictureZone/' + placement.getId() + '/impression/common?adSourceId=2&advertiserDomain=appnexus.com&advertisingTrackingId=49f7acaa-81f2-4887-9f3b-cd124854879c&cc=USD&creativeId=54411305&dealCode=&demandSeatId=1&fillSource=appnexus&floor=0&gamerId=5834bc21b54e3b0100f44c92&gross=0&networkId=&precomputedFloor=0&seatId=958&value=1.01&sdkVersion=1234');
        });
    });

    describe('with click through url', () => {
        beforeEach(() => {
            const video = new Video('', TestFixtures.getSession());
            vastCampaign = TestFixtures.getEventVastCampaign();
            sinon.stub(vastCampaign, 'getVideo').returns(video);
            const nativeBridge = TestFixtures.getNativeBridge();
            const overlay = new Overlay(nativeBridge, false, 'en', clientInfo.getGameId());
            vastAdUnitParameters.overlay = overlay;
            vastAdUnitParameters.campaign = vastCampaign;
            vastAdUnit = new VastAdUnit(nativeBridge, vastAdUnitParameters);
        });

        it('should return correct http:// url', () => {
            sandbox.stub(vastCampaign.getVast(), 'getVideoClickThroughURL').returns('http://www.example.com/wpstyle/?p=364');

            const clickThroughURL = vastAdUnit.getVideoClickThroughURL();
            assert.equal(clickThroughURL, 'http://www.example.com/wpstyle/?p=364');
        });

        it('should return correct https:// url', () => {
            sandbox.stub(vastCampaign.getVast(), 'getVideoClickThroughURL').returns('https://www.example.com/foo/?bar=baz&inga=42&quux');
            const clickThroughURL = vastAdUnit.getVideoClickThroughURL();
            assert.equal(clickThroughURL, 'https://www.example.com/foo/?bar=baz&inga=42&quux');
        });

        it('should return null for malformed url', () => {
            sandbox.stub(vastCampaign.getVast(), 'getVideoClickThroughURL').returns('www.foo.com');
            const clickThroughURL = vastAdUnit.getVideoClickThroughURL();
            assert.equal(clickThroughURL, null);
        });

        it('should return null for a deeplink to an app', () => {
            sandbox.stub(vastCampaign.getVast(), 'getVideoClickThroughURL').returns('myapp://details?id=foo');
            const clickThroughURL = vastAdUnit.getVideoClickThroughURL();
            assert.equal(clickThroughURL, null);
        });

        it('should call video click tracking url', () => {
            sandbox.stub(vastCampaign.getVast(), 'getVideoClickTrackingURLs').returns(['https://www.example.com/foo/?bar=baz&inga=42&quux', 'http://wwww.tremor.com/click']);
            sandbox.stub(thirdPartyEventManager, 'sendEvent').returns(null);
            vastAdUnit.sendVideoClickTrackingEvent('foo');
            sinon.assert.calledTwice(<sinon.SinonSpy>thirdPartyEventManager.sendEvent);
        });

        it('should not call thirdPartyEvent if there are no tracking urls', () => {
            sandbox.stub(vastCampaign.getVast(), 'getVideoClickTrackingURLs').returns([]);
            sandbox.stub(thirdPartyEventManager, 'sendEvent').returns(null);
            vastAdUnit.sendVideoClickTrackingEvent('foo');
            sinon.assert.notCalled(<sinon.SinonSpy>thirdPartyEventManager.sendEvent);
        });
    });

    describe('VastAdUnit progress event test', () => {
        it('sends video click through tracking event from VAST', () => {
            const mockEventManager = sinon.mock(thirdPartyEventManager);
            mockEventManager.expects('sendEvent').withArgs('vast video click', '123', 'http://myTrackingURL.com/click');

            vastAdUnit.sendVideoClickTrackingEvent('123');
            mockEventManager.verify();
        });
    });

    describe('with companion ad', () => {
        let vastEndScreen: VastEndScreen;

        beforeEach(() => {
            const video = new Video('', TestFixtures.getSession());
            vastCampaign = TestFixtures.getCompanionVastCampaign();
            sinon.stub(vastCampaign, 'getVideo').returns(video);
            const nativeBridge = TestFixtures.getNativeBridge();
            const overlay = new Overlay(nativeBridge, false, 'en', clientInfo.getGameId());
            vastEndScreen = new VastEndScreen(nativeBridge, vastAdUnitParameters.configuration.isCoppaCompliant(), vastAdUnitParameters.campaign, vastAdUnitParameters.clientInfo.getGameId());
            vastAdUnitParameters.overlay = overlay;
            vastAdUnitParameters.campaign = vastCampaign;
            vastAdUnitParameters.endScreen = vastEndScreen;
            vastAdUnit = new VastAdUnit(nativeBridge, vastAdUnitParameters);
        });

        it('should return correct companion click through url', () => {
            sandbox.stub(vastCampaign.getVast(), 'getCompanionClickThroughUrl').returns('http://www.example.com/wpstyle/?p=364');

            const clickThroughURL = vastAdUnit.getCompanionClickThroughUrl();
            assert.equal(clickThroughURL, 'http://www.example.com/wpstyle/?p=364');
        });

        it('should return null when companion click through url is invalid', () => {
            sandbox.stub(vastCampaign.getVast(), 'getCompanionClickThroughUrl').returns('blah');

            const clickThroughURL = vastAdUnit.getCompanionClickThroughUrl();
            assert.equal(clickThroughURL, null);
        });

        it('should return endscreen', () => {
            const endScreen = vastAdUnit.getEndScreen();
            assert.equal(endScreen, vastEndScreen);
        });

        it('it should fire companion tracking events', () => {
            const width = 320;
            const height = 480;
            const url = 'http://example.com/companionCreativeView';
            const companion = new VastCreativeCompanionAd('foobarCompanion', 'Creative', height, width, 'http://example.com/img.png', 'http://example.com/clickme', {
                'creativeView': [url]
            });
            sandbox.stub(vastCampaign.getVast(), 'getLandscapeOrientedCompanionAd').returns(companion);
            sandbox.stub(vastCampaign.getVast(), 'getPortraitOrientedCompanionAd').returns(companion);

            const mockEventManager = sinon.mock(thirdPartyEventManager);
            mockEventManager.expects('sendEvent').withArgs('companion', '123', companion.getEventTrackingUrls('creativeView')[0]);
            vastAdUnit.sendCompanionTrackingEvent('123');
            mockEventManager.verify();
        });

        it('should hide and then remove endscreen on hide', () => {
            sinon.stub(vastEndScreen, 'hide');
            sinon.stub(vastEndScreen, 'remove');
            vastAdUnit.hide();
            return new Promise((resolve, reject) => {
                setTimeout(resolve, 500);
            }).then(() => {
                sinon.assert.called(<sinon.SinonSpy>vastEndScreen.hide);
                sinon.assert.called(<sinon.SinonSpy>vastEndScreen.remove);
            });
        });
    });
});
