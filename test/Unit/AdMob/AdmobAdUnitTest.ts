
import { AdMobAdUnit, IAdMobAdUnitParameters } from 'AdMob/AdUnits/AdMobAdUnit';
import { AdMobAdUnitParametersFactory } from 'AdMob/AdUnits/AdMobAdUnitParametersFactory';
import { AdMobCampaign } from 'AdMob/Models/AdMobCampaign';
import { Orientation } from 'Ads/AdUnits/Containers/AdUnitContainer';
import { IAds } from 'Ads/IAds';
import { Placement } from 'Ads/Models/Placement';
import { AdmobMetric } from 'Ads/Utilities/ProgrammaticTrackingService';
import { Backend } from 'Backend/Backend';
import { Platform } from 'Core/Constants/Platform';
import { ICore } from 'Core/ICore';
import { NativeBridge } from 'Core/Native/Bridge/NativeBridge';
import { Store } from 'Store/Store';
import { TestFixtures } from 'TestHelpers/TestFixtures';

import 'mocha';
import * as sinon from 'sinon';

describe('AdmobAdUnitTest', () => {

    let admobAdUnit: AdMobAdUnit;
    let admobAdUnitParameters: IAdMobAdUnitParameters;
    let admobAdUnitParametersFactory: AdMobAdUnitParametersFactory;
    let admobCampaign: AdMobCampaign;
    let placement: Placement;
    let core: ICore;
    let ads: IAds;
    let nativeBridge: NativeBridge;
    let backend: Backend;
    let platform: Platform;
    let sandbox: sinon.SinonSandbox;

    beforeEach(() => {
        sandbox = sinon.createSandbox();
        platform = Platform.IOS;
        backend = TestFixtures.getBackend(platform);
        nativeBridge = TestFixtures.getNativeBridge(platform, backend);
        core = TestFixtures.getCoreModule(nativeBridge);
        ads = TestFixtures.getAdsModule(core);
        core.Store = new Store(core);
        admobAdUnitParametersFactory = new AdMobAdUnitParametersFactory(core, ads);
        admobCampaign = new AdMobCampaign(TestFixtures.getAdmobCampaignBaseParams());
        placement = TestFixtures.getPlacement();
        admobAdUnitParameters = admobAdUnitParametersFactory.create(admobCampaign, placement, Orientation.LANDSCAPE, 'foo', {});

        sandbox.stub(core.Api.SensorInfo, 'stopAccelerometerUpdates').callsFake(() => {
            return Promise.resolve();
        });
    });

    afterEach(() => {
        admobAdUnit.hide();
        sandbox.restore();
    });

    it('should call rewarded placement metrics when allowSkip is false', () => {
        admobAdUnitParameters.placement.set('allowSkip', false);
        admobAdUnit = new AdMobAdUnit(admobAdUnitParameters);
        admobAdUnit.show();
        sandbox.assert.calledWithExactly(<sinon.SinonStub>core.ProgrammaticTrackingService.reportMetric, AdmobMetric.AdmobRewardedVideoStart);
        admobAdUnit.sendRewardEvent();
        sandbox.assert.calledWithExactly(<sinon.SinonStub>core.ProgrammaticTrackingService.reportMetric, AdmobMetric.AdmobUserWasRewarded);
        admobAdUnit.sendSkipEvent();
        sandbox.assert.calledWithExactly(<sinon.SinonStub>core.ProgrammaticTrackingService.reportMetric, AdmobMetric.AdmobUserSkippedRewardedVideo);
    });

    it('should not call rewarded placement metrics when allowSkip is true', () => {
        admobAdUnitParameters.placement.set('allowSkip', true);
        admobAdUnit = new AdMobAdUnit(admobAdUnitParameters);
        admobAdUnit.show();
        sandbox.assert.notCalled(<sinon.SinonStub>core.ProgrammaticTrackingService.reportMetric);
        admobAdUnit.sendRewardEvent();
        sandbox.assert.notCalled(<sinon.SinonStub>core.ProgrammaticTrackingService.reportMetric);
        admobAdUnit.sendSkipEvent();
        sandbox.assert.notCalled(<sinon.SinonStub>core.ProgrammaticTrackingService.reportMetric);
    });
});
