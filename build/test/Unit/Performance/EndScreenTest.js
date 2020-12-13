import { UserPrivacyManager } from 'Ads/Managers/UserPrivacyManager';
import { Privacy } from 'Ads/Views/Privacy';
import { assert } from 'chai';
import { Platform } from 'Core/Constants/Platform';
import EndScreenFixture from 'html/fixtures/EndScreenFixture.html';
import 'mocha';
import { PerformanceEndScreen } from 'Performance/Views/PerformanceEndScreen';
import * as sinon from 'sinon';
import { TestFixtures } from 'TestHelpers/TestFixtures';
import { SDKMetrics } from 'Ads/Utilities/SDKMetrics';
describe('EndScreenTest', () => {
    let platform;
    let backend;
    let nativeBridge;
    let core;
    let configuration;
    let privacy;
    let sandbox;
    beforeEach(() => {
        sandbox = sinon.createSandbox();
        platform = Platform.ANDROID;
        backend = TestFixtures.getBackend(platform);
        nativeBridge = TestFixtures.getNativeBridge(platform, backend);
        core = TestFixtures.getCoreApi(nativeBridge);
        configuration = TestFixtures.getCoreConfiguration();
        sandbox.stub(SDKMetrics, 'reportMetricEvent').returns(Promise.resolve());
        sandbox.stub(SDKMetrics, 'reportMetricEventWithTags').returns(Promise.resolve());
    });
    afterEach(() => {
        sandbox.restore();
    });
    const createEndScreen = (language) => {
        const privacyManager = sinon.createStubInstance(UserPrivacyManager);
        const campaign = TestFixtures.getCampaign();
        privacy = new Privacy(platform, campaign, privacyManager, false, false, 'en');
        const params = {
            platform,
            core,
            language,
            gameId: 'testGameId',
            targetGameName: TestFixtures.getCampaign().getGameName(),
            abGroup: configuration.getAbGroup(),
            privacy,
            showGDPRBanner: false,
            campaignId: campaign.getId()
        };
        return new PerformanceEndScreen(params, campaign);
    };
    xit('should render', () => {
        const endScreen = createEndScreen('en');
        endScreen.render();
        assert.equal(endScreen.container().innerHTML, EndScreenFixture);
    });
    it('should render with translations', () => {
        const validateTranslation = (endScreen) => {
            endScreen.render();
            const downloadElement = endScreen.container().querySelectorAll('.download-text')[0];
            assert.equal(downloadElement.innerHTML, 'Lataa ilmaiseksi');
            const container = privacy.container();
            if (container && container.parentElement) {
                container.parentElement.removeChild(container);
            }
            else {
                assert.fail(`${container.parentElement}`);
            }
        };
        validateTranslation(createEndScreen('fi'));
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiRW5kU2NyZWVuVGVzdC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3Rlc3QvVW5pdC9QZXJmb3JtYW5jZS9FbmRTY3JlZW5UZXN0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBRSxrQkFBa0IsRUFBRSxNQUFNLGlDQUFpQyxDQUFDO0FBRXJFLE9BQU8sRUFBRSxPQUFPLEVBQUUsTUFBTSxtQkFBbUIsQ0FBQztBQUU1QyxPQUFPLEVBQUUsTUFBTSxFQUFFLE1BQU0sTUFBTSxDQUFDO0FBQzlCLE9BQU8sRUFBRSxRQUFRLEVBQUUsTUFBTSx5QkFBeUIsQ0FBQztBQU9uRCxPQUFPLGdCQUFnQixNQUFNLHFDQUFxQyxDQUFDO0FBQ25FLE9BQU8sT0FBTyxDQUFDO0FBQ2YsT0FBTyxFQUFFLG9CQUFvQixFQUFFLE1BQU0sd0NBQXdDLENBQUM7QUFDOUUsT0FBTyxLQUFLLEtBQUssTUFBTSxPQUFPLENBQUM7QUFDL0IsT0FBTyxFQUFFLFlBQVksRUFBRSxNQUFNLDBCQUEwQixDQUFDO0FBQ3hELE9BQU8sRUFBRSxVQUFVLEVBQUUsTUFBTSwwQkFBMEIsQ0FBQztBQUV0RCxRQUFRLENBQUMsZUFBZSxFQUFFLEdBQUcsRUFBRTtJQUMzQixJQUFJLFFBQWtCLENBQUM7SUFDdkIsSUFBSSxPQUFnQixDQUFDO0lBQ3JCLElBQUksWUFBMEIsQ0FBQztJQUMvQixJQUFJLElBQWMsQ0FBQztJQUNuQixJQUFJLGFBQWdDLENBQUM7SUFDckMsSUFBSSxPQUFnQixDQUFDO0lBQ3JCLElBQUksT0FBMkIsQ0FBQztJQUVoQyxVQUFVLENBQUMsR0FBRyxFQUFFO1FBQ1osT0FBTyxHQUFHLEtBQUssQ0FBQyxhQUFhLEVBQUUsQ0FBQztRQUNoQyxRQUFRLEdBQUcsUUFBUSxDQUFDLE9BQU8sQ0FBQztRQUM1QixPQUFPLEdBQUcsWUFBWSxDQUFDLFVBQVUsQ0FBQyxRQUFRLENBQUMsQ0FBQztRQUM1QyxZQUFZLEdBQUcsWUFBWSxD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