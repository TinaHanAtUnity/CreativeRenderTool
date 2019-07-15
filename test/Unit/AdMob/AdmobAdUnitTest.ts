
import { AdMobAdUnit, IAdMobAdUnitParameters } from 'AdMob/AdUnits/AdMobAdUnit';
import { IAds } from 'Ads/IAds';
import { AdmobMetric } from 'Ads/Utilities/ProgrammaticTrackingService';
import { Backend } from 'Backend/Backend';
import { Platform } from 'Core/Constants/Platform';
import { ICore } from 'Core/ICore';
import { NativeBridge } from 'Core/Native/Bridge/NativeBridge';
import 'mocha';
import * as sinon from 'sinon';
import { Store } from 'Store/Store';
import { TestFixtures } from 'TestHelpers/TestFixtures';

describe('AdmobAdUnitTest', () => {

    let admobAdUnit: AdMobAdUnit;
    let admobAdUnitParameters: IAdMobAdUnitParameters;
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

        admobAdUnitParameters = TestFixtures.getAdmobAdUnitParameters(platform, core, ads, core.Store);

        (<sinon.SinonStub>admobAdUnitParameters.view.container).returns(document.createElement('div'));

        sandbox.stub(core.Api.SensorInfo.Ios!, 'startAccelerometerUpdates').returns(Promise.resolve());
        sandbox.stub(core.Api.SensorInfo, 'stopAccelerometerUpdates').returns(Promise.resolve());
    });

    afterEach(async () => {
        await admobAdUnit.hide();

        sandbox.restore();
    });

    it('should call rewarded placement metrics when allowSkip is false', async () => {
        admobAdUnitParameters.placement.set('allowSkip', false);

        admobAdUnit = new AdMobAdUnit(admobAdUnitParameters);

        await admobAdUnit.show();

        sandbox.assert.calledWithExactly(<sinon.SinonStub>core.ProgrammaticTrackingService.reportMetric, AdmobMetric.AdmobRewardedVideoStart);

        admobAdUnit.sendRewardEvent();
        sandbox.assert.calledWithExactly(<sinon.SinonStub>core.ProgrammaticTrackingService.reportMetric, AdmobMetric.AdmobUserWasRewarded);

        admobAdUnit.sendSkipEvent();
        sandbox.assert.calledWithExactly(<sinon.SinonStub>core.ProgrammaticTrackingService.reportMetric, AdmobMetric.AdmobUserSkippedRewardedVideo);
    });

    it('should not call rewarded placement metrics when allowSkip is true', async () => {
        admobAdUnitParameters.placement.set('allowSkip', true);

        admobAdUnit = new AdMobAdUnit(admobAdUnitParameters);

        await admobAdUnit.show();

        sandbox.assert.notCalled(<sinon.SinonStub>core.ProgrammaticTrackingService.reportMetric);

        admobAdUnit.sendRewardEvent();
        sandbox.assert.notCalled(<sinon.SinonStub>core.ProgrammaticTrackingService.reportMetric);

        admobAdUnit.sendSkipEvent();
        sandbox.assert.notCalled(<sinon.SinonStub>core.ProgrammaticTrackingService.reportMetric);
    });
});
