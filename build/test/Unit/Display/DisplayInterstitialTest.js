import { UserPrivacyManager } from 'Ads/Managers/UserPrivacyManager';
import { Placement } from 'Ads/Models/Placement';
import { Privacy } from 'Ads/Views/Privacy';
import { assert } from 'chai';
import { Platform } from 'Core/Constants/Platform';
import { DisplayInterstitial } from 'Display/Views/DisplayInterstitial';
import DummyDisplayInterstitialCampaign from 'json/DummyDisplayInterstitialCampaign.json';
import 'mocha';
import * as sinon from 'sinon';
import { TestFixtures } from 'TestHelpers/TestFixtures';
const json = DummyDisplayInterstitialCampaign;
describe('DisplayInterstitialTest', () => {
    let view;
    let backend;
    let nativeBridge;
    let core;
    let placement;
    let campaign;
    let sandbox;
    function viewUnitTests() {
        beforeEach(() => {
            sandbox = sinon.createSandbox();
            const platform = Platform.ANDROID;
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
            campaign = TestFixtures.getDisplayInterstitialCampaign();
            const privacyManager = sinon.createStubInstance(UserPrivacyManager);
            const coreConfig = TestFixtures.getCoreConfiguration();
            const privacy = new Privacy(platform, campaign, privacyManager, false, coreConfig.isCoppaCompliant(), 'en');
            const deviceInfo = TestFixtures.getAndroidDeviceInfo(core);
            view = new DisplayInterstitial(platform, core, deviceInfo, placement, campaign, privacy, false);
            sandbox.stub(nativeBridge, 'getPlatform').returns(Platform.ANDROID);
            sandbox.stub(deviceInfo, 'getApiLevel').returns(16);
        });
        afterEach(() => {
            sandbox.restore();
        });
        // Disabled because of missing srcdoc support on Android < 4.4
        xit('should render', () => {
            view.render();
            const srcdoc = view.container().querySelector('#display-iframe').getAttribute('srcdoc');
            assert.isNotNull(srcdoc);
            assert.isTrue(srcdoc.indexOf(json.display.markup) !== -1);
        });
        it('should show', () => {
            view.render();
            view.show();
            view.hide();
        });
    }
    describe('on Display Interstitial Markup Campaign', () => {
        viewUnitTests();
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiRGlzcGxheUludGVyc3RpdGlhbFRlc3QuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi90ZXN0L1VuaXQvRGlzcGxheS9EaXNwbGF5SW50ZXJzdGl0aWFsVGVzdC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUUsa0JBQWtCLEVBQUUsTUFBTSxpQ0FBaUMsQ0FBQztBQUNyRSxPQUFPLEVBQUUsU0FBUyxFQUFFLE1BQU0sc0JBQXNCLENBQUM7QUFDakQsT0FBTyxFQUFFLE9BQU8sRUFBRSxNQUFNLG1CQUFtQixDQUFDO0FBRTVDLE9BQU8sRUFBRSxNQUFNLEVBQUUsTUFBTSxNQUFNLENBQUM7QUFDOUIsT0FBTyxFQUFFLFFBQVEsRUFBRSxNQUFNLHlCQUF5QixDQUFDO0FBSW5ELE9BQU8sRUFBRSxtQkFBbUIsRUFBRSxNQUFNLG1DQUFtQyxDQUFDO0FBRXhFLE9BQU8sZ0NBQWdDLE1BQU0sNENBQTRDLENBQUM7QUFDMUYsT0FBTyxPQUFPLENBQUM7QUFDZixPQUFPLEtBQUssS0FBSyxNQUFNLE9BQU8sQ0FBQztBQUMvQixPQUFPLEVBQUUsWUFBWSxFQUFFLE1BQU0sMEJBQTBCLENBQUM7QUFFeEQsTUFBTSxJQUFJLEdBQUcsZ0NBQWdDLENBQUM7QUFFOUMsUUFBUSxDQUFDLHlCQUF5QixFQUFFLEdBQUcsRUFBRTtJQUNyQyxJQUFJLElBQXlCLENBQUM7SUFDOUIsSUFBSSxPQUFnQixDQUFDO0lBQ3JCLElBQUksWUFBMEIsQ0FBQztJQUMvQixJQUFJLElBQWMsQ0FBQztJQUNuQixJQUFJLFNBQW9CLENBQUM7SUFDekIsSUFBSSxRQUFxQyxDQUFDO0lBQzFDLElBQUksT0FBMkIsQ0FBQztJQUVoQyxTQUFTLGFBQWE7UUFDbEIsVUFBVSxDQUFDLEdBQUcsRUFBRTtZQUNaLE9BQU8sR0FBRyxLQUFLLENBQUMsYUFBYSxFQUFFLENBQUM7WUFDaEMsTUFBTSxRQUFRLEdBQUcsUUFBUSxDQUFDLE9BQU8sQ0FBQztZ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