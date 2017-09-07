import 'mocha';
import * as sinon from 'sinon';
import { assert } from 'chai';

import { AdUnitFactory } from 'AdUnits/AdUnitFactory';
import { VastCampaign } from 'Models/Vast/VastCampaign';
import { Vast } from 'Models/Vast/Vast';
import { EventManager } from 'Managers/EventManager';
import { TestFixtures } from '../TestHelpers/TestFixtures';
import { Request } from 'Utilities/Request';
import { WakeUpManager } from 'Managers/WakeUpManager';
import { Platform } from 'Constants/Platform';
import { Configuration } from 'Models/Configuration';
import { DeviceInfo } from 'Models/DeviceInfo';
import { SessionManager } from 'Managers/SessionManager';
import { VastVideoEventHandlers } from 'EventHandlers/VastVideoEventHandlers';
import { PerformanceVideoEventHandlers } from 'EventHandlers/PerformanceVideoEventHandlers';
import { NativeBridge } from 'Native/NativeBridge';

import { VastAdUnit } from 'AdUnits/VastAdUnit';
import { PerformanceAdUnit } from 'AdUnits/PerformanceAdUnit';
import { Activity } from 'AdUnits/Containers/Activity';
import { AdUnitContainer, ForceOrientation } from 'AdUnits/Containers/AdUnitContainer';
import { MetaDataManager } from 'Managers/MetaDataManager';
import { MRAIDAdUnit } from 'AdUnits/MRAIDAdUnit';
import { MRAIDCampaign } from 'Models/MRAIDCampaign';
import { FinishState } from 'Constants/FinishState';
import { FocusManager } from 'Managers/FocusManager';

import { DisplayInterstitialAdUnit } from "AdUnits/DisplayInterstitialAdUnit";
import { DisplayInterstitialCampaign } from "Models/DisplayInterstitialCampaign";
import ConfigurationJson from 'json/ConfigurationAuctionPlc.json';

describe('AdUnitFactoryTest', () => {

    let sandbox: sinon.SinonSandbox;
    let nativeBridge: NativeBridge;
    let focusManager: FocusManager;
    let container: AdUnitContainer;
    let deviceInfo: DeviceInfo;
    let sessionManager: SessionManager;
    let config: Configuration;
    let metaDataManager: MetaDataManager;
    let request: Request;

    before(() => {
        sandbox = sinon.sandbox.create();
    });

    beforeEach(() => {
        nativeBridge = TestFixtures.getNativeBridge();
        metaDataManager = new MetaDataManager(nativeBridge);
        focusManager = new FocusManager(nativeBridge);
        const wakeUpManager = new WakeUpManager(nativeBridge, focusManager);
        request = new Request(nativeBridge, wakeUpManager);
        container = new Activity(nativeBridge, TestFixtures.getDeviceInfo(Platform.ANDROID));
        sandbox.stub(container, 'close').returns(Promise.resolve());
        const eventManager = new EventManager(nativeBridge, request);
        config = new Configuration(JSON.parse(ConfigurationJson));
        deviceInfo = <DeviceInfo>{getLanguage: () => 'en'};
        sessionManager = new SessionManager(nativeBridge, TestFixtures.getClientInfo(), new DeviceInfo(nativeBridge), eventManager, metaDataManager);
        sandbox.stub(sessionManager, 'sendStart').returns(Promise.resolve());
        sandbox.stub(sessionManager, 'sendView').returns(Promise.resolve());
        sandbox.stub(sessionManager, 'sendThirdQuartile').returns(Promise.resolve());
        sandbox.stub(sessionManager, 'sendSkip').returns(Promise.resolve());
    });

    afterEach(() => {
        sandbox.restore();
    });

    describe('Performance AdUnit', () => {
        it('should call onVideoError on video controller error ', () => {
            sandbox.stub(PerformanceVideoEventHandlers, 'onVideoError').returns(null);
            const videoAdUnit = <PerformanceAdUnit>AdUnitFactory.createAdUnit(nativeBridge, ForceOrientation.LANDSCAPE, container, deviceInfo, sessionManager, TestFixtures.getPlacement(), TestFixtures.getCampaign(), config, request, {});
            videoAdUnit.onError.trigger();

            sinon.assert.calledOnce(<sinon.SinonSpy>PerformanceVideoEventHandlers.onVideoError);
        });
    });

    describe('VAST AdUnit', () => {
        it('should call onVideoError on video controller error', () => {
            sandbox.stub(VastVideoEventHandlers, 'onVideoError').returns(null);
            const vast = new Vast([], []);
            sandbox.stub(vast, 'getVideoUrl').returns('http://www.google.fi');
            const vastCampaign = new VastCampaign(vast, 'campaignId', 'gamerId', 1);
            const videoAdUnit = <VastAdUnit>AdUnitFactory.createAdUnit(nativeBridge, ForceOrientation.NONE, container, deviceInfo, sessionManager, TestFixtures.getPlacement(), vastCampaign, config, request, {});
            videoAdUnit.onError.trigger();

            sinon.assert.calledOnce(<sinon.SinonSpy>VastVideoEventHandlers.onVideoError);
        });
    });

    describe('MRAID AdUnit', () => {
        let adUnit: MRAIDAdUnit;
        let eventManager: any;
        let campaign: MRAIDCampaign;

        beforeEach(() => {
            eventManager = {
                thirdPartyEvent: sinon.stub().returns(Promise.resolve())
            };

            sandbox.stub(sessionManager, 'getEventManager').returns(
                eventManager
            );

            sandbox.stub(sessionManager, 'getSession').returns({
                getId: sinon.stub().returns('1111')
            });

            campaign = TestFixtures.getProgrammaticMRAIDCampaign();
            const resourceUrl = campaign.getResourceUrl();
            if(resourceUrl) {
                resourceUrl.setFileId('1234');
            }

            adUnit = <MRAIDAdUnit>AdUnitFactory.createAdUnit(nativeBridge, ForceOrientation.NONE, container, deviceInfo, sessionManager, TestFixtures.getPlacement(), campaign, config, request, {});
        });

        describe('on hide', () => {
            it('should trigger onClose when hide is called', (done) => {
                adUnit.setShowing(true);
                adUnit.onClose.subscribe(() => {
                    assert.equal(adUnit.isShowing(), false);
                    done();
                });

                adUnit.hide();
            });

            it('should trigger onFinish when hide is called', (done) => {
                adUnit.setShowing(true);
                adUnit.onFinish.subscribe(() => {
                    done();
                });

                adUnit.hide();
            });

            it('should call trackers on on finish state completed', () => {
                adUnit.setShowing(true);
                adUnit.setFinishState(FinishState.COMPLETED);

                adUnit.hide();

                sinon.assert.calledOnce(<sinon.SinonSpy>sessionManager.sendThirdQuartile);
                sinon.assert.calledOnce(<sinon.SinonSpy>sessionManager.sendView);
                sinon.assert.calledWith(<sinon.SinonSpy>eventManager.thirdPartyEvent, 'mraid complete', '1111', 'http://test.complete.com/complete1');
            });

            it('should call sendSkip on finish state skipped', () => {
                adUnit.setShowing(true);
                adUnit.setFinishState(FinishState.SKIPPED);

                adUnit.hide();

                sinon.assert.calledOnce(<sinon.SinonSpy>sessionManager.sendSkip);
            });
        });

        describe('on show', () => {
            it('should trigger onStart', (done) => {
                adUnit.onStart.subscribe(() => {
                    adUnit.hide();
                    done();
                });

                adUnit.show();
            });
            it('should call sendStart', () => {
                adUnit.show();
                sinon.assert.calledOnce(<sinon.SinonSpy>sessionManager.sendStart);
                adUnit.hide();
            });

            it('should send impressions', () => {
                adUnit.show();
                sinon.assert.calledOnce(<sinon.SinonSpy>sessionManager.getEventManager);
                sinon.assert.calledWith(<sinon.SinonSpy>eventManager.thirdPartyEvent, 'mraid impression', '1111', 'http://test.impression.com/blah1');
                sinon.assert.calledWith(<sinon.SinonSpy>eventManager.thirdPartyEvent, 'mraid impression', '1111', 'http://test.impression.com/blah2');
                adUnit.hide();
            });

            it('should replace macros in the postback impression url', () => {
                adUnit.show();
                sinon.assert.calledOnce(<sinon.SinonSpy>sessionManager.getEventManager);
                sinon.assert.calledWith(<sinon.SinonSpy>eventManager.thirdPartyEvent, 'mraid impression', '1111', 'http://test.impression.com/fooId/blah?sdkVersion=2000');
                adUnit.hide();
            });
        });

        it('should call click tracker', () => {
            adUnit.sendClick();
            sinon.assert.calledWith(<sinon.SinonSpy>eventManager.thirdPartyEvent, 'mraid click', '1111', 'http://test.complete.com/click1');
        });
    });

    describe('DisplayInterstitialAdUnit', () => {
        let adUnit: DisplayInterstitialAdUnit;
        let campaign: DisplayInterstitialCampaign;

        beforeEach(() => {
            campaign = TestFixtures.getDisplayInterstitialCampaign();
            adUnit = <DisplayInterstitialAdUnit>AdUnitFactory.createAdUnit(nativeBridge, ForceOrientation.NONE, container, deviceInfo, sessionManager, TestFixtures.getPlacement(), campaign, config, request, {});
        });

        describe('on click', () => {
            it('should open an intent on Android', () => {
                sandbox.stub(nativeBridge, 'getPlatform').returns(Platform.ANDROID);
                sandbox.stub(nativeBridge.Intent, 'launch');
                adUnit.onRedirect.trigger('http://google.com');

                sinon.assert.calledWith(<sinon.SinonSpy>nativeBridge.Intent.launch, {
                    'action': 'android.intent.action.VIEW',
                    'uri': 'http://google.com'
                });
            });

            it('should open the url on iOS', () => {
                sandbox.stub(nativeBridge, 'getPlatform').returns(Platform.IOS);
                sandbox.stub(nativeBridge.UrlScheme, 'open');
                adUnit.onRedirect.trigger('http://google.com');

                sinon.assert.calledWith(<sinon.SinonSpy>nativeBridge.UrlScheme.open, 'http://google.com');
            });
        });

        describe('on close', () => {
            it('should hide the adUnit', () => {
                sandbox.stub(adUnit, 'hide');

                adUnit.onClose.trigger();

                sinon.assert.called(<sinon.SinonSpy>adUnit.hide);
            });
        });

        describe('on skip', () => {
            it('should hide the adUnit', () => {
                sandbox.stub(adUnit, 'hide');

                adUnit.onSkip.trigger();

                sinon.assert.called(<sinon.SinonSpy>adUnit.hide);
            });
        });
    });
});
