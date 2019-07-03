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
import MRAIDContainer from 'html/mraid/container.html';

import OnProgrammaticMraidUrlPlcCampaign from 'json/OnProgrammaticMraidUrlPlcCampaign.json';
import 'mocha';
import { MRAIDCampaign } from 'MRAID/Models/MRAIDCampaign';
import { MRAID } from 'MRAID/Views/MRAID';

import * as sinon from 'sinon';
import { TestFixtures } from 'TestHelpers/TestFixtures';

describe('MRAIDDeviceOrientation', () => {
    let platform: Platform;
    let backend: Backend;
    let nativeBridge: NativeBridge;
    let core: ICoreApi;
    let placement: Placement;
    let configuration: CoreConfiguration;
    let privacy: Privacy;
    let privacyManager: UserPrivacyManager;
    let fakeCampaign: Campaign;

    beforeEach(() => {
        platform = Platform.ANDROID;
        backend = TestFixtures.getBackend(platform);
        nativeBridge = TestFixtures.getNativeBridge(platform, backend);
        core = TestFixtures.getCoreApi(nativeBridge);

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
            adTypes: [],
            refreshDelay: 1000,
            muteVideo: false
        });

        configuration = TestFixtures.getCoreConfiguration();
        privacyManager = sinon.createStubInstance(UserPrivacyManager);
        fakeCampaign = sinon.createStubInstance(Campaign);
        privacy = new Privacy(platform, fakeCampaign, privacyManager, false, false);
    });

    it('should not expose deviceorientation data to ad if the ad does not need it', () => {
        const json = JSON.parse(OnProgrammaticMraidUrlPlcCampaign);
        const params = TestFixtures.getProgrammaticMRAIDCampaignParams(json, 3600, '123abc');
        params.resourceAsset = undefined;
        params.resource = '<script src="mraid.js"></script><script>{UNITY_DYNAMIC_MARKUP}</script><script></script><div>Hello World</div>';
        params.dynamicMarkup = 'InjectMe';
        const campaign = new MRAIDCampaign(params);
        const mraid = new MRAID(platform, core, TestFixtures.getAndroidDeviceInfo(core), placement, campaign, privacy, false, configuration.getAbGroup());
        mraid.render();

        return mraid.createMRAID(MRAIDContainer).then((mraidSrc) => {
            assert.equal(mraidSrc.indexOf('_iframeOrientationListeners'), -1);
            assert.notEqual(mraidSrc.indexOf('<script id=\"deviceorientation-support\"></script>'), -1);
            mraid.hide();
        });
    });

    it('should expose deviceorientation data to ad if the ad needs it', () => {
        const json = JSON.parse(OnProgrammaticMraidUrlPlcCampaign);
        const params = TestFixtures.getProgrammaticMRAIDCampaignParams(json, 3600, '123abc');
        params.resourceAsset = undefined;
        params.resource = '<script src="mraid.js"></script><script>{UNITY_DYNAMIC_MARKUP}</script><script>window.addEventListener("deviceorientation", (event) => {});</script><div>Hello World</div>';
        params.dynamicMarkup = 'InjectMe';
        const campaign = new MRAIDCampaign(params);
        const mraid = new MRAID(platform, core, TestFixtures.getAndroidDeviceInfo(core), placement, campaign, privacy, false, configuration.getAbGroup());
        mraid.render();
        return mraid.createMRAID(MRAIDContainer).then((mraidSrc) => {
            assert.notEqual(mraidSrc.indexOf('_iframeOrientationListeners'), -1);
            assert.equal(mraidSrc.indexOf('<script id=\"deviceorientation-support\"></script>'), -1);
            mraid.hide();
        });
    });
});
