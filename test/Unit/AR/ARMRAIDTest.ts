import { UserPrivacyManager } from 'Ads/Managers/UserPrivacyManager';
import { Campaign } from 'Ads/Models/Campaign';
import { Placement } from 'Ads/Models/Placement';
import { Privacy } from 'Ads/Views/Privacy';
import { Backend } from 'Backend/Backend';
import { assert } from 'chai';
import { Platform } from 'Core/Constants/Platform';
import { ICoreApi } from 'Core/ICore';
import { CoreConfiguration } from 'Core/Models/CoreConfiguration';
import { NativeBridge } from 'Core/Native/Bridge/NativeBridge';
import 'mocha';
import * as sinon from 'sinon';
import { TestFixtures } from 'TestHelpers/TestFixtures';
import { ARMRAID } from 'AR/Views/ARMRAID'
import { IARApi } from 'AR/AR'
import { ARUtil } from 'AR/Utilities/ARUtil'

describe('ARMRAID', () => {
    let platform: Platform;
    let backend: Backend;
    let nativeBridge: NativeBridge;
    let core: ICoreApi;
    let placement: Placement;
    let configuration: CoreConfiguration;
    let privacy: Privacy;
    let privacyManager: UserPrivacyManager;
    let fakeCampaign: Campaign;
    let ar: IARApi;

    beforeEach(() => {
        platform = Platform.ANDROID;
        backend = TestFixtures.getBackend(platform);
        nativeBridge = TestFixtures.getNativeBridge(platform, backend);
        core = TestFixtures.getCoreApi(nativeBridge);
        ar = TestFixtures.getARApi(nativeBridge);

        placement = new Placement({
            id: '123',
            name: 'test',
            default: true,
            allowSkip: true,
            skipInSeconds: 5,
            disableBackButton: true,
            useDeviceOrientationForVideo: false,
            skipEndCardOnClose: false,
            disableVideoControlsFade: false,
            useCloseIconInsteadOfSkipIcon: false,
            adTypes: ['MRAID_AR'],
            refreshDelay: 1000,
            muteVideo: false
        });

        configuration = TestFixtures.getCoreConfiguration();
        privacyManager = sinon.createStubInstance(UserPrivacyManager);
        fakeCampaign = sinon.createStubInstance(Campaign);
        privacy = new Privacy(platform, fakeCampaign, privacyManager, false, false, 'en');
    });

    it('should render', () => {
        const device = TestFixtures.getAndroidDeviceInfo(core);
        const campaign = TestFixtures.getProgrammaticMRAIDCampaign();
        const automatedExperimentManagerSpy = sinon.mock({ sendReward() {} });
        ARUtil.isARSupported = () => Promise.resolve(true)

        const mraid = new ARMRAID(platform, core, ar, device, placement, campaign, device.getLanguage(), privacy, false, configuration.getAbGroup(), 123, false, automatedExperimentManagerSpy as any, {});

        mraid.render();

        return new Promise((resolve, reject) => {
            setTimeout(() => {
                const container = mraid.container();
                assert.isNotNull(container.innerHTML);
                assert.isNotNull(container.querySelector('.close-region'));
                assert.isNotNull(container.querySelector('.close'));
                assert.isNotNull(container.querySelector('.icon-close'));
                assert.isNotNull(container.querySelector('.progress-wrapper'));
                assert.isNotNull(container.querySelector('.circle-left'));
                assert.isNotNull(container.querySelector('.circle-right'));
                assert.isNotNull(container.querySelector('#mraid-iframe'));
                assert.equal(mraid.container().innerHTML.indexOf('mraid.js'), -1);

                resolve();
            }, 0);
        }).then(() => {
            mraid.hide();
        });
    });
});
