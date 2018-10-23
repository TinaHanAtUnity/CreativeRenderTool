import { GdprManager } from 'Ads/Managers/GdprManager';
import { Placement } from 'Ads/Models/Placement';
import { assert } from 'chai';
import { CoreConfiguration } from 'Core/Models/CoreConfiguration';

import { NativeBridge } from 'Core/Native/Bridge/NativeBridge';
import MRAIDContainer from 'html/mraid/container.html';

import OnProgrammaticMraidUrlPlcCampaign from 'json/OnProgrammaticMraidUrlPlcCampaign.json';
import 'mocha';
import { MRAIDCampaign } from 'MRAID/Models/MRAIDCampaign';
import { MRAID } from 'MRAID/Views/MRAID';

import * as sinon from 'sinon';
import { TestFixtures } from 'TestHelpers/TestFixtures';
import { Campaign } from 'Ads/Models/Campaign';
import { Privacy } from 'Ads/Views/Privacy';
import { Platform } from 'Core/Constants/Platform';
import { Backend } from 'Backend/Backend';
import { ICoreApi } from 'Core/ICore';

describe('MRAID', () => {
    let platform: Platform;
    let backend: Backend;
    let nativeBridge: NativeBridge;
    let core: ICoreApi;
    let placement: Placement;
    let configuration: CoreConfiguration;
    let privacy: Privacy;
    let gdprManager: GdprManager;
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
            muteVideo: false
        });

        configuration = TestFixtures.getCoreConfiguration();
        gdprManager = sinon.createStubInstance(GdprManager);
        fakeCampaign = sinon.createStubInstance(Campaign);
        privacy = new Privacy(platform, fakeCampaign, gdprManager, false, false);
    });

    it('should render', (done) => {
        const campaign = TestFixtures.getProgrammaticMRAIDCampaign();
        const mraid = new MRAID(platform, core, TestFixtures.getAndroidDeviceInfo(core), placement, campaign, privacy, false, configuration.getAbGroup());

        mraid.render();

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

            done();
        }, 0);
    });

    it('should replace placeholder with dynamic markup injected', () => {
        const json = JSON.parse(OnProgrammaticMraidUrlPlcCampaign);
        const params = TestFixtures.getProgrammaticMRAIDCampaignParams(json, 3600, '123abc');
        params.resourceAsset = undefined;
        params.resource = '<script src="mraid.js"></script><script>{UNITY_DYNAMIC_MARKUP}</script><div>Hello</div>';
        params.dynamicMarkup = 'InjectMe';
        const campaign = new MRAIDCampaign(params);

        const mraid = new MRAID(platform, core, TestFixtures.getAndroidDeviceInfo(core), placement, campaign, privacy, false, configuration.getAbGroup());
        return mraid.createMRAID(MRAIDContainer).then((mraidSrc) => {
            assert.notEqual(mraidSrc.indexOf('InjectMe'), -1);
        });
    });

    it('should remove the mraid.js placeholder when it has a query parameter', () => {
        const markup = '<script src="mraid.js?foo=bar&baz=blah><div>Hello, world!</div>';
        const json = JSON.parse(OnProgrammaticMraidUrlPlcCampaign);
        const params = TestFixtures.getProgrammaticMRAIDCampaignParams(json, 3600, '123abc');
        params.resourceAsset = undefined;
        params.resource = markup;
        params.dynamicMarkup = 'InjectMe';
        const campaign = new MRAIDCampaign(params);
        const mraid = new MRAID(platform, core, TestFixtures.getAndroidDeviceInfo(core), placement, campaign, privacy, false, configuration.getAbGroup());
        return mraid.createMRAID(MRAIDContainer).then((src) => {
            const dom = new DOMParser().parseFromString(src, 'text/html');
            assert.isNotNull(dom);
            assert.isNull(dom.querySelector('script[src^="mraid.js"]'));
        });
    });

    it('should not remove string replacement patterns', () => {
        const json = JSON.parse(OnProgrammaticMraidUrlPlcCampaign);
        const params = TestFixtures.getProgrammaticMRAIDCampaignParams(json, 3600, '123abc');
        params.resourceAsset = undefined;
        params.resource = '<script src="mraid.js"></script><script>{UNITY_DYNAMIC_MARKUP}</script><script>var test = "Hello $&"</script><div>Hello World</div>';
        params.dynamicMarkup = 'InjectMe';
        const campaign = new MRAIDCampaign(params);
        const mraid = new MRAID(platform, core, TestFixtures.getAndroidDeviceInfo(core), placement, campaign, privacy, false, configuration.getAbGroup());
        return mraid.createMRAID(MRAIDContainer).then((mraidSrc) => {
            assert.notEqual(mraidSrc.indexOf('InjectMe'), -1);
            assert.notEqual(mraidSrc.indexOf('<script>var test = "Hello $&"</script>'), -1);
        });
    });
});
