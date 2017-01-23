import 'mocha';
import * as sinon from 'sinon';

import { AdUnitFactory } from "AdUnits/AdUnitFactory";
import { VastCampaign } from 'Models/Vast/VastCampaign';
import { Vast } from 'Models/Vast/Vast';
import { EventManager } from 'Managers/EventManager';
import { TestFixtures } from '../TestHelpers/TestFixtures';
import { Request } from 'Utilities/Request';
import { WakeUpManager } from 'Managers/WakeUpManager';
import { Platform } from 'Constants/Platform';
import { AndroidAdUnit } from 'Utilities/AndroidAdUnit';
import { Configuration } from 'Models/Configuration';
import { DeviceInfo } from 'Models/DeviceInfo';
import { SessionManager } from 'Managers/SessionManager';
import { VastVideoEventHandlers } from 'EventHandlers/VastVideoEventHandlers';
import { PerformanceVideoEventHandlers } from 'EventHandlers/PerformanceVideoEventHandlers';
import { NativeBridge } from 'Native/NativeBridge';

import {VastAdUnit} from 'AdUnits/VastAdUnit';
import {PerformanceAdUnit} from 'AdUnits/PerformanceAdUnit';

describe('AdUnitFactoryTest', () => {

    let sandbox: sinon.SinonSandbox;
    let nativeBridge: NativeBridge;
    let adUnit: AndroidAdUnit;
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
        adUnit = new AndroidAdUnit(nativeBridge, TestFixtures.getDeviceInfo(Platform.ANDROID));
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
            const videoAdUnit = <PerformanceAdUnit>AdUnitFactory.createAdUnit(nativeBridge, adUnit, deviceInfo, sessionManager, TestFixtures.getPlacement(), TestFixtures.getCampaign(), config, {});
            videoAdUnit.getVideoAdUnitController().onVideoError.trigger();

            sinon.assert.calledOnce(<sinon.SinonSpy>PerformanceVideoEventHandlers.onVideoError);
        });
    });

    describe('VAST AdUnit', () => {
        it('should call onVideoError on video controller error', () => {
            sandbox.stub(VastVideoEventHandlers, 'onVideoError').returns(null);
            const vastCampaign = new VastCampaign(new Vast([], []), 'campaignId', 'gamerId', 1);
            const videoAdUnit = <VastAdUnit>AdUnitFactory.createAdUnit(nativeBridge, adUnit, deviceInfo, sessionManager, TestFixtures.getPlacement(), vastCampaign, config, {});
            videoAdUnit.getVideoAdUnitController().onVideoError.trigger();

            sinon.assert.calledOnce(<sinon.SinonSpy>VastVideoEventHandlers.onVideoError);
        });
    });
});
