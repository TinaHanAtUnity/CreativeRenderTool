import { UserPrivacyManager } from 'Ads/Managers/UserPrivacyManager';
import { Campaign } from 'Ads/Models/Campaign';
import { Placement } from 'Ads/Models/Placement';
import { Privacy } from 'Ads/Views/Privacy';
import { assert } from 'chai';
import { Platform } from 'Core/Constants/Platform';
import MRAIDContainer from 'html/mraid/container.html';
import OnProgrammaticMraidUrlPlcCampaign from 'json/OnProgrammaticMraidUrlPlcCampaign.json';
import 'mocha';
import { MRAIDCampaign } from 'MRAID/Models/MRAIDCampaign';
import { MRAID } from 'MRAID/Views/MRAID';
import * as sinon from 'sinon';
import { TestFixtures } from 'TestHelpers/TestFixtures';
describe('MRAID', () => {
    let platform;
    let backend;
    let nativeBridge;
    let core;
    let placement;
    let configuration;
    let privacy;
    let privacyManager;
    let fakeCampaign;
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
        privacy = new Privacy(platform, fakeCampaign, privacyManager, false, false, 'en');
    });
    it('should render', () => {
        const campaign = TestFixtures.getProgrammaticMRAIDCampaign();
        const mraid = new MRAID(platform, core, TestFixtures.getAndroidDeviceInfo(core), placement, campaign, privacy, false, configuration.getAbGroup());
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
    it('should replace placeholder with dynamic markup injected', () => {
        const json = OnProgrammaticMraidUrlPlcCampaign;
        const params = TestFixtures.getProgrammaticMRAIDCampaignParams(json, 3600, '123abc');
        params.resourceAsset = undefined;
        params.resource = '<script src="mraid.js"></script><script>{UNITY_DYNAMIC_MARKUP}</script><div>Hello</div>';
        params.dynamicMarkup = 'InjectMe';
        const campaign = new MRAIDCampaign(params);
        const mraid = new MRAID(platform, core, TestFixtures.getAndroidDeviceInfo(core), placement, campaign, privacy, false, configuration.getAbGroup());
        mraid.render();
        return mraid.createMRAID(MRAIDContainer).then((mraidSrc) => {
            assert.notEqual(mraidSrc.indexOf('InjectMe'), -1);
            mraid.hide();
        });
    });
    it('should remove the mraid.js placeholder when it has a query parameter', () => {
        const markup = '<script src="mraid.js?foo=bar&baz=blah><div>Hello, world!</div>';
        const json = OnProgrammaticMraidUrlPlcCampaign;
        const params = TestFixtures.getProgrammaticMRAIDCampaignParams(json, 3600, '123abc');
        params.resourceAsset = undefined;
        params.resource = markup;
        params.dynamicMarkup = 'InjectMe';
        const campaign = new MRAIDCampaign(params);
        const mraid = new MRAID(platform, core, TestFixtures.getAndroidDeviceInfo(core), placement, campaign, privacy, false, configuration.getAbGroup());
        mraid.render();
        return mraid.createMRAID(MRAIDContainer).then((src) => {
            const dom = new DOMParser().parseFromString(src, 'text/html');
            assert.isNotNull(dom);
            assert.isNull(dom.querySelector('script[src^="mraid.js"]'));
            mraid.hide();
        });
    });
    it('should not remove string replacement patterns', () => {
        const json = OnProgrammaticMraidUrlPlcCampaign;
        const params = TestFixtures.getProgrammaticMRAIDCampaignParams(json, 3600, '123abc');
        params.resourceAsset = undefined;
        params.resource = '<script src="mraid.js"></script><script>{UNITY_DYNAMIC_MARKUP}</script><script>var test = "Hello $&"</script><div>Hello World</div>';
        params.dynamicMarkup = 'InjectMe';
        const campaign = new MRAIDCampaign(params);
        const mraid = new MRAID(platform, core, TestFixtures.getAndroidDeviceInfo(core), placement, campaign, privacy, false, configuration.getAbGroup());
        mraid.render();
        return mraid.createMRAID(MRAIDContainer).then((mraidSrc) => {
            assert.notEqual(mraidSrc.indexOf('InjectMe'), -1);
            assert.notEqual(mraidSrc.indexOf('<script>var test = "Hello $&"</script>'), -1);
            mraid.hide();
        });
    });
    it('should install deviceorientation support script', () => {
        const json = OnProgrammaticMraidUrlPlcCampaign;
        const params = TestFixtures.getProgrammaticMRAIDCampaignParams(json, 3600, '123abc');
        params.resourceAsset = undefined;
        params.resource = '<script src="mraid.js"></script><script>{UNITY_DYNAMIC_MARKUP}</script><script>(function() {window.addEventListener("deviceorientation", (event) => {console.log("data:"+event.alpha);});})()</script><div>Hello World</div>';
        params.dynamicMarkup = 'InjectMe';
        const campaign = new MRAIDCampaign(params);
        const mraid = new MRAID(platform, core, TestFixtures.getAndroidDeviceInfo(core), placement, campaign, privacy, false, configuration.getAbGroup());
        mraid.render();
        return mraid.createMRAID(MRAIDContainer).then((mraidSrc) => {
            assert.notInclude(mraidSrc, '<script id=\"deviceorientation-support\"></script>', 'deviceorientation script stub not replaced with script');
            mraid.hide();
        });
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiTVJBSURUZXN0LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vdGVzdC9Vbml0L01SQUlEL01SQUlEVGVzdC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUUsa0JBQWtCLEVBQUUsTUFBTSxpQ0FBaUMsQ0FBQztBQUNyRSxPQUFPLEVBQUUsUUFBUSxFQUFFLE1BQU0scUJBQXFCLENBQUM7QUFDL0MsT0FBTyxFQUFFLFNBQVMsRUFBRSxNQUFNLHNCQUFzQixDQUFDO0FBQ2pELE9BQU8sRUFBRSxPQUFPLEVBQUUsTUFBTSxtQkFBbUIsQ0FBQztBQUU1QyxPQUFPLEVBQUUsTUFBTSxFQUFFLE1BQU0sTUFBTSxDQUFDO0FBQzlCLE9BQU8sRUFBRSxRQUFRLEVBQUUsTUFBTSx5QkFBeUIsQ0FBQztBQUtuRCxPQUFPLGNBQWMsTUFBTSwyQkFBMkIsQ0FBQztBQUV2RCxPQUFPLGlDQUFpQyxNQUFNLDZDQUE2QyxDQUFDO0FBQzVGLE9BQU8sT0FBTyxDQUFDO0FBQ2YsT0FBTyxFQUFFLGFBQWEsRUFBRSxNQUFNLDRCQUE0QixDQUFDO0FBQzNELE9BQU8sRUFBRSxLQUFLLEVBQUUsTUFBTSxtQkFBbUIsQ0FBQztBQUUxQyxPQUFPLEtBQUssS0FBSyxNQUFNLE9BQU8sQ0FBQztBQUMvQixPQUFPLEVBQUUsWUFBWSxFQUFFLE1BQU0sMEJBQTBCLENBQUM7QUFFeEQsUUFBUSxDQUFDLE9BQU8sRUFBRSxHQUFHLEVBQUU7SUFDbkIsSUFBSSxRQUFrQixDQUFDO0lBQ3ZCLElBQUksT0FBZ0IsQ0FBQztJQUNyQixJQUFJLFlBQTBCLENBQUM7SUFDL0IsSUFBSSxJQUFjLENBQUM7SUFDbkIsSUFBSSxTQUFvQixDQUFDO0lBQ3pCLElBQUksYUFBZ0MsQ0FBQztJQUNyQyxJQUFJLE9BQWdCLENBQUM7SUFDckIsSUFBSSxjQUFrQyxDQUFDO0lBQ3ZDLElBQUksWUFBc0IsQ0FBQztJQUUzQixVQUFVLENBQUMsR0FBRyxFQUFFO1FB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