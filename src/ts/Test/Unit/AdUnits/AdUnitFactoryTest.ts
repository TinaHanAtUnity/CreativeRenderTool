import 'mocha';
import * as sinon from 'sinon';
import { assert } from 'chai';

import { AdUnitFactory } from "AdUnits/AdUnitFactory";
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
import { AdUnitContainer } from 'AdUnits/Containers/AdUnitContainer';
import { SplitScreenAdUnit } from 'AdUnits/SplitScreenAdUnit';
import { Campaign } from 'Models/Campaign';

describe('AdUnitFactoryTest', () => {

    let sandbox: sinon.SinonSandbox;
    let nativeBridge: NativeBridge;
    let container: AdUnitContainer;
    let deviceInfo: DeviceInfo;
    let sessionManager: SessionManager;
    let config: Configuration;

    before(() => {
        sandbox = sinon.sandbox.create();
    });

    beforeEach(() => {
        nativeBridge = TestFixtures.getNativeBridge();
        const wakeUpManager = new WakeUpManager(nativeBridge);
        const request = new Request(nativeBridge, wakeUpManager);
        container = new Activity(nativeBridge, TestFixtures.getDeviceInfo(Platform.ANDROID));
        const eventManager = new EventManager(nativeBridge, request);
        config = new Configuration({'assetCaching': 'forced', 'placements': []});
        deviceInfo = <DeviceInfo>{getLanguage: () => 'en'};
        sessionManager = new SessionManager(nativeBridge, TestFixtures.getClientInfo(), new DeviceInfo(nativeBridge), eventManager);
    });

    afterEach(() => {
        sandbox.restore();
    });

    describe('Performance AdUnit', () => {
        it('should call onVideoError on video controller error ', () => {
            sandbox.stub(PerformanceVideoEventHandlers, 'onVideoError').returns(null);
            const videoAdUnit = <PerformanceAdUnit>AdUnitFactory.createAdUnit(nativeBridge, container, deviceInfo, sessionManager, TestFixtures.getPlacement(), TestFixtures.getCampaign(), config, {});
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
            const videoAdUnit = <VastAdUnit>AdUnitFactory.createAdUnit(nativeBridge, container, deviceInfo, sessionManager, TestFixtures.getPlacement(), vastCampaign, config, {});
            videoAdUnit.onError.trigger();

            sinon.assert.calledOnce(<sinon.SinonSpy>VastVideoEventHandlers.onVideoError);
        });
    });

    describe('SplitScreen AdUnit', () => {
        let campaign: Campaign;
        before(() => {
            campaign = TestFixtures.getCampaign();
        });

        it('should create SplitScreenAdUnit with orientation 1 and call hide on video close, Android ', () => {
            sandbox.stub(campaign, 'getAbGroup').returns(12);

            const videoAdUnit = AdUnitFactory.createAdUnit(TestFixtures.getNativeBridge(Platform.ANDROID), container, deviceInfo, sessionManager, TestFixtures.getPlacement(), campaign, config, {'requestedOrientation': 1});
            assert.instanceOf(videoAdUnit, SplitScreenAdUnit);
            sandbox.stub(videoAdUnit, 'hide');
            videoAdUnit.onClose.trigger();

            sinon.assert.calledOnce(<sinon.SinonSpy>videoAdUnit.hide);
        });

        it('should create SplitScreenAdUnit with orientation 7 and call hide on video close, Android ', () => {
            sandbox.stub(campaign, 'getAbGroup').returns(12);

            const videoAdUnit = AdUnitFactory.createAdUnit(TestFixtures.getNativeBridge(Platform.ANDROID), container, deviceInfo, sessionManager, TestFixtures.getPlacement(), campaign, config, {'requestedOrientation': 7});
            assert.instanceOf(videoAdUnit, SplitScreenAdUnit);
            sandbox.stub(videoAdUnit, 'hide');
            videoAdUnit.onClose.trigger();

            sinon.assert.calledOnce(<sinon.SinonSpy>videoAdUnit.hide);
        });

        it('should create SplitScreenAdUnit with orientation 2 and call hide on video close, iOS ', () => {
            sandbox.stub(campaign, 'getAbGroup').returns(12);

            const videoAdUnit = AdUnitFactory.createAdUnit(TestFixtures.getNativeBridge(Platform.IOS), container, deviceInfo, sessionManager, TestFixtures.getPlacement(), campaign, config, {'supportedOrientations': 2});
            assert.instanceOf(videoAdUnit, SplitScreenAdUnit);
            sandbox.stub(videoAdUnit, 'hide');
            videoAdUnit.onClose.trigger();

            sinon.assert.calledOnce(<sinon.SinonSpy>videoAdUnit.hide);
        });

        it('should not create SplitScreenAdUnit, iOS ', () => {
            sandbox.stub(campaign, 'getAbGroup').returns(12);

            const videoAdUnit = AdUnitFactory.createAdUnit(TestFixtures.getNativeBridge(Platform.IOS), container, deviceInfo, sessionManager, TestFixtures.getPlacement(), campaign, config, {'supportedOrientations': 30});
            assert.notInstanceOf(videoAdUnit, SplitScreenAdUnit);
            assert.instanceOf(videoAdUnit, PerformanceAdUnit);
            sandbox.stub(videoAdUnit, 'hide');
            videoAdUnit.onClose.trigger();

            sinon.assert.calledOnce(<sinon.SinonSpy>videoAdUnit.hide);
        });

        it('should not create SplitScreenAdUnit, Android ', () => {
            sandbox.stub(campaign, 'getAbGroup').returns(12);

            const videoAdUnit = AdUnitFactory.createAdUnit(TestFixtures.getNativeBridge(Platform.IOS), container, deviceInfo, sessionManager, TestFixtures.getPlacement(), campaign, config, {'requestedOrientation': -1});
            assert.notInstanceOf(videoAdUnit, SplitScreenAdUnit);
            assert.instanceOf(videoAdUnit, PerformanceAdUnit);
            sandbox.stub(videoAdUnit, 'hide');
            videoAdUnit.onClose.trigger();

            sinon.assert.calledOnce(<sinon.SinonSpy>videoAdUnit.hide);
        });
    });
});
