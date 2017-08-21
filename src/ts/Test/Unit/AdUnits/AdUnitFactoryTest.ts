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

    before(() => {
        sandbox = sinon.sandbox.create();
    });

    beforeEach(() => {
        nativeBridge = TestFixtures.getNativeBridge();
        metaDataManager = new MetaDataManager(nativeBridge);
        focusManager = new FocusManager(nativeBridge);
        const wakeUpManager = new WakeUpManager(nativeBridge, focusManager);
        const request = new Request(nativeBridge, wakeUpManager);
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
            const videoAdUnit = <PerformanceAdUnit>AdUnitFactory.createAdUnit(nativeBridge, ForceOrientation.LANDSCAPE, container, deviceInfo, sessionManager, TestFixtures.getPlacement(), TestFixtures.getCampaign(), config, {});
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
            const videoAdUnit = <VastAdUnit>AdUnitFactory.createAdUnit(nativeBridge, ForceOrientation.NONE, container, deviceInfo, sessionManager, TestFixtures.getPlacement(), vastCampaign, config, {});
            videoAdUnit.onError.trigger();

            sinon.assert.calledOnce(<sinon.SinonSpy>VastVideoEventHandlers.onVideoError);
        });
    });

    describe('MRAID AdUnit', () => {
        let MRAIDAdUnit: MRAIDAdUnit;
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

            MRAIDAdUnit = <MRAIDAdUnit>AdUnitFactory.createAdUnit(nativeBridge, ForceOrientation.NONE, container, deviceInfo, sessionManager, TestFixtures.getPlacement(), campaign, config, {});
        });

        describe('on hide', () => {
            it('should trigger onClose when hide is called', (done) => {
                MRAIDAdUnit.setShowing(true);
                MRAIDAdUnit.onClose.subscribe(() => {
                    assert.equal(MRAIDAdUnit.isShowing(), false);
                    done();
                });

                MRAIDAdUnit.hide();
            });

            it('should trigger onFinish when hide is called', (done) => {
                MRAIDAdUnit.setShowing(true);
                MRAIDAdUnit.onFinish.subscribe(() => {
                    done();
                });

                MRAIDAdUnit.hide();
            });

            it('should call trackers on on finish state completed', () => {
                MRAIDAdUnit.setShowing(true);
                MRAIDAdUnit.setFinishState(FinishState.COMPLETED);

                MRAIDAdUnit.hide();

                sinon.assert.calledOnce(<sinon.SinonSpy>sessionManager.sendThirdQuartile);
                sinon.assert.calledOnce(<sinon.SinonSpy>sessionManager.sendView);
                sinon.assert.calledWith(<sinon.SinonSpy>eventManager.thirdPartyEvent, 'mraid complete', '1111', 'http://test.complete.com/complete1');
            });

            it('should call sendSkip on finish state skipped', () => {
                MRAIDAdUnit.setShowing(true);
                MRAIDAdUnit.setFinishState(FinishState.SKIPPED);

                MRAIDAdUnit.hide();

                sinon.assert.calledOnce(<sinon.SinonSpy>sessionManager.sendSkip);
            });
        });

        describe('on show', () => {
            it('should trigger onStart', (done) => {
                MRAIDAdUnit.onStart.subscribe(() => {
                    done();
                });

                MRAIDAdUnit.show();
            });

            it('should call sendStart', () => {
                MRAIDAdUnit.show();
                sinon.assert.calledOnce(<sinon.SinonSpy>sessionManager.sendStart);
            });

            it('should send impressions', () => {
                MRAIDAdUnit.show();
                sinon.assert.calledOnce(<sinon.SinonSpy>sessionManager.getEventManager);
                sinon.assert.calledWith(<sinon.SinonSpy>eventManager.thirdPartyEvent, 'mraid impression', '1111', 'http://test.impression.com/blah1');
                sinon.assert.calledWith(<sinon.SinonSpy>eventManager.thirdPartyEvent, 'mraid impression', '1111', 'http://test.impression.com/blah2');
            });

            it('should replace macros in the postback impression url', () => {
                MRAIDAdUnit.show();
                sinon.assert.calledOnce(<sinon.SinonSpy>sessionManager.getEventManager);
                sinon.assert.calledWith(<sinon.SinonSpy>eventManager.thirdPartyEvent, 'mraid impression', '1111', 'http://test.impression.com/fooId/blah?sdkVersion=2000');
            });
        });

        it('should call click tracker', () => {
            MRAIDAdUnit.sendClick();
            sinon.assert.calledWith(<sinon.SinonSpy>eventManager.thirdPartyEvent, 'mraid click', '1111', 'http://test.complete.com/click1');
        });
    });
});
