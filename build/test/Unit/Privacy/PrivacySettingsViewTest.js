import { UserPrivacyManager } from 'Ads/Managers/UserPrivacyManager';
import { Privacy } from 'Ads/Views/Privacy';
import { assert } from 'chai';
import { Platform } from 'Core/Constants/Platform';
import 'mocha';
import * as sinon from 'sinon';
import { TestFixtures } from 'TestHelpers/TestFixtures';
describe('Privacy settings view tests', () => {
    let platform;
    let privacyView;
    let campaign;
    let userPrivacyManager;
    beforeEach(() => {
        platform = Platform.IOS;
        campaign = TestFixtures.getCampaign();
        userPrivacyManager = sinon.createStubInstance(UserPrivacyManager);
    });
    describe('Renders Privacy for legal framework none (gdprEnabled == false)', () => {
        beforeEach(() => {
            privacyView = new Privacy(Platform.IOS, campaign, userPrivacyManager, false, false, 'en');
            privacyView.render();
        });
        it('should render correct main div', () => {
            assert.isNotNull(privacyView.container().innerHTML);
            assert.isNotNull(privacyView.container().querySelector('.not-gdpr'));
        });
        it('should not render content for other privacy configurations', () => {
            assert.isNull(privacyView.container().querySelector('.coppa'));
            assert.isNull(privacyView.container().querySelector('.opt-out-flow'));
            assert.isNull(privacyView.container().querySelector('.user-under-age-limit'));
        });
    });
    describe('Renders Privacy for COPPA games', () => {
        beforeEach(() => {
            privacyView = new Privacy(Platform.IOS, campaign, userPrivacyManager, true, true, 'en');
            privacyView.render();
        });
        it('should render correct main div', () => {
            assert.isNotNull(privacyView.container().innerHTML);
            assert.isNotNull(privacyView.container().querySelector('.coppa'));
        });
        it('should not render content for other privacy configurations', () => {
            assert.isNull(privacyView.container().querySelector('.not-gdpr'));
            assert.isNull(privacyView.container().querySelector('.opt-out-flow'));
            assert.isNull(privacyView.container().querySelector('.user-under-age-limit'));
        });
    });
    describe('Renders Privacy for Legitimate Interest (opt-out)', () => {
        beforeEach(() => {
            privacyView = new Privacy(Platform.IOS, campaign, userPrivacyManager, true, false, 'en');
            privacyView.render();
        });
        it('should render correct main div', () => {
            assert.isNotNull(privacyView.container().innerHTML);
            assert.isNotNull(privacyView.container().querySelector('.opt-out-flow'));
        });
        it('should not render content for other privacy configurations', () => {
            assert.isNull(privacyView.container().querySelector('.not-gdpr'));
            assert.isNull(privacyView.container().querySelector('.coppa'));
            assert.isNull(privacyView.container().querySelector('.user-under-age-limit'));
        });
    });
    describe('Renders Privacy for under age limit users', () => {
        beforeEach(() => {
            userPrivacyManager.isUserUnderAgeLimit.returns(true);
            privacyView = new Privacy(Platform.IOS, campaign, userPrivacyManager, true, false, 'en');
            privacyView.render();
        });
        it('should render correct main div', () => {
            assert.isNotNull(privacyView.container().innerHTML);
            assert.isNotNull(privacyView.container().querySelector('.user-under-age-limit'));
        });
        it('should not render content for other privacy configurations', () => {
            assert.isNull(privacyView.container().querySelector('.not-gdpr'));
            assert.isNull(privacyView.container().querySelector('.coppa'));
            assert.isNull(privacyView.container().querySelector('.opt-out-flow'));
        });
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUHJpdmFjeVNldHRpbmdzVmlld1Rlc3QuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi90ZXN0L1VuaXQvUHJpdmFjeS9Qcml2YWN5U2V0dGluZ3NWaWV3VGVzdC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUUsa0JBQWtCLEVBQUUsTUFBTSxpQ0FBaUMsQ0FBQztBQUVyRSxPQUFPLEVBQUUsT0FBTyxFQUFFLE1BQU0sbUJBQW1CLENBQUM7QUFDNUMsT0FBTyxFQUFFLE1BQU0sRUFBRSxNQUFNLE1BQU0sQ0FBQztBQUM5QixPQUFPLEVBQUUsUUFBUSxFQUFFLE1BQU0seUJBQXlCLENBQUM7QUFDbkQsT0FBTyxPQUFPLENBQUM7QUFDZixPQUFPLEtBQUssS0FBSyxNQUFNLE9BQU8sQ0FBQztBQUMvQixPQUFPLEVBQUUsWUFBWSxFQUFFLE1BQU0sMEJBQTBCLENBQUM7QUFHeEQsUUFBUSxDQUFDLDZCQUE2QixFQUFFLEdBQUcsRUFBRTtJQUN6QyxJQUFJLFFBQWtCLENBQUM7SUFDdkIsSUFBSSxXQUE0QixDQUFDO0lBQ2pDLElBQUksUUFBa0IsQ0FBQztJQUN2QixJQUFJLGtCQUFzQyxDQUFDO0lBRTNDLFVBQVUsQ0FBQyxHQUFHLEVBQUU7UUFDWixRQUFRLEdBQUcsUUFBUSxDQUFDLEdBQUcsQ0FBQztRQUN4QixRQUFRLEdBQUcsWUFBWSxDQUFDLFdBQVcsRUFBRSxDQUFDO1FBQ3RDLGtCQUFrQixHQUFHLEtBQUssQ0FBQyxrQkFBa0IsQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDO0lBQ3RFLENBQUMsQ0FBQyxDQUFDO0lBRUgsUUFBUSxDQUFDLGlFQUFpRSxFQUFFLEdBQUcsRUFBRTtRQUM3RSxVQUFVLENBQUMsR0FBRyxFQUFFO1lBQ1osV0FBVyxHQUFHLElBQUksT0FBTyxDQUFDLFFBQVEsQ0FBQyxHQUFHLEVBQUUsUUFBUSxFQUFFLGtCQUFrQixFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUUsSUFBSSxDQUFDLENBQUM7WUFDMUYsV0FBVyxDQUFDLE1BQU0sRUFBRSxDQUFDO1FBQ3pCLENBQUMsQ0FBQyxDQUFDO1FBRUgsRUFBRSxDQUFDLGdDQUFnQyxFQUFFLEdBQUcsRUFBRTtZQUN0QyxNQUFNLENBQUMsU0FBUyxDQUFDLFdBQVcsQ0FBQyxTQUFTLEVBQUUsQ0FBQyxTQUFTLENBQUMsQ0FBQztZQUNwRCxNQUFNLENBQUMsU0FBUyxDQUFDLFdBQVcsQ0FBQyxTQUFTLEVBQUUsQ0FBQyxhQUFhLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQztRQUN6RSxDQUFDLENBQUMsQ0FBQztRQUVILEVBQUUsQ0FBQyw0REFBNEQsRUFBRSxHQUFHLEVBQUU7WUFDbEUsTUFBTSxDQUFDLE1BQU0sQ0FBQyxXQUFXLENBQUMsU0FBUyxFQUFFLENBQUMsYUFBYSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUM7WUFDL0QsTUFBTSxDQUFDLE1BQU0sQ0FBQyxXQUFXLENBQUMsU0FBUyxFQUFFLENBQUMsYUFBYSxDQUFDLGVBQWUsQ0FBQyxDQUFDLENBQUM7WUFDdEUsTUFBTSxDQUFDLE1BQU0sQ0FBQyxXQUFXLENBQUMsU0FBUyxFQUFFLENBQUMsYUFBYSxDQUFDLHVCQUF1QixDQUFDLENBQUMsQ0FBQztRQUNsRixDQUFDLENBQUMsQ0FBQztJQUNQLENBQUMsQ0FBQyxDQUFDO0lBRUgsUUFBUSxDQUFDLGlDQUFpQyxFQUFFLEdBQUcsRUFBRTtRQUM3QyxVQUFVLENBQUMsR0FBRyxFQUFFO1lBQ1osV0FBVyxHQUFHLElBQUksT0FBTyxDQUFDLFFBQVEsQ0FBQyxHQUFHLEVBQUUsUUFBUSxFQUFFLGtCQUFrQixFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxDQUFDLENBQUM7WUFDeEYsV0FBVyxDQUFDLE1BQU0sRUFBRSxDQUFDO1FBQ3pCLENBQUMsQ0FBQyxDQUFDO1FBRUgsRUFBRSxDQUFDLGdDQUFnQyxFQUFFLEdBQUcsRUFBRTtZQUN0QyxNQUFNLENBQUMsU0FBUyxDQUFDLFdBQVcsQ0FBQyxTQUFTLEVBQUUsQ0FBQyxTQUFTLENBQUMsQ0FBQztZQUNwRCxNQUFNLENBQUMsU0FBUyxDQUFDLFdBQVcsQ0FBQyxTQUFTLEVBQUUsQ0FBQyxhQUFhLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQztRQUN0RSxDQUFDLENBQUMsQ0FBQztRQUVILEVBQUUsQ0FBQyw0REFBNEQsRUFBRSxHQUFHLEVBQUU7WUFDbEUsTUFBTSxDQUFDLE1BQU0sQ0FBQyxXQUFXLENBQUMsU0FBUyxFQUFFLENBQUMsYUFBYSxDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUM7WUFDbEUsTUFBTSxDQUFDLE1BQU0sQ0FBQyxXQUFXLENBQUMsU0FBUyxFQUFFLENBQUMsYUFBYSxDQUFDLGVBQWUsQ0FBQyxDQUFDLENBQUM7WUFDdEUsTUFBTSxDQUFDLE1BQU0sQ0FBQyxXQUFXLENBQUMsU0FBUyxFQUFFLENBQUMsYUFBYSxDQUFDLHVCQUF1QixDQUFDLENBQUMsQ0FBQztRQUNsRixDQUFDLENBQUMsQ0FBQztJQUNQLENBQUMsQ0FBQyxDQUFDO0lBRUgsUUFBUSxDQUFDLG1EQUFtRCxFQUFFLEdBQUcsRUFBRTtRQUMvRCxVQUFVLENBQUMsR0FBRyxFQUFFO1lBQ1osV0FBVyxHQUFHLElBQUksT0FBTyxDQUFDLFFBQVEsQ0FBQyxHQUFHLEVBQUUsUUFBUSxFQUFFLGtCQUFrQixFQUFFLElBQUksRUFBRSxLQUFLLEVBQUUsSUFBSSxDQUFDLENBQUM7WUFDekYsV0FBVyxDQUFDLE1BQU0sRUFBRSxDQUFDO1FBQ3pCLENBQUMsQ0FBQyxDQUFDO1FBRUgsRUFBRSxDQUFDLGdDQUFnQyxFQUFFLEdBQUcsRUFBRTtZQUN0QyxNQUFNLENBQUMsU0FBUyxDQUFDLFdBQVcsQ0FBQyxTQUFTLEVBQUUsQ0FBQyxTQUFTLENBQUMsQ0FBQztZQUNwRCxNQUFNLENBQUMsU0FBUyxDQUFDLFdBQVcsQ0FBQyxTQUFTLEVBQUUsQ0FBQyxhQUFhLENBQUMsZUFBZSxDQUFDLENBQUMsQ0FBQztRQUM3RSxDQUFDLENBQUMsQ0FBQztRQUVILEVBQUUsQ0FBQyw0REFBNEQsRUFBRSxHQUFHLEVBQUU7WUFDbEUsTUFBTSxDQUFDLE1BQU0sQ0FBQyxXQUFXLENBQUMsU0FBUyxFQUFFLENBQUMsYUFBYSxDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUM7WUFDbEUsTUFBTSxDQUFDLE1BQU0sQ0FBQyxXQUFXLENBQUMsU0FBUyxFQUFFLENBQUMsYUFBYSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUM7WUFDL0QsTUFBTSxDQUFDLE1BQU0sQ0FBQyxXQUFXLENBQUMsU0FBUyxFQUFFLENBQUMsYUFBYSxDQUFDLHVCQUF1QixDQUFDLENBQUMsQ0FBQztRQUVsRixDQUFDLENBQUMsQ0FBQztJQUNQLENBQUMsQ0FBQyxDQUFDO0lBRUgsUUFBUSxDQUFDLDJDQUEyQyxFQUFFLEdBQUcsRUFBRTtRQUN2RCxVQUFVLENBQUMsR0FBRyxFQUFFO1lBQ00sa0JBQWtCLENBQUMsbUJBQW9CLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDO1lBRXhFLFdBQVcsR0FBRyxJQUFJLE9BQU8sQ0FBQyxRQUFRLENBQUMsR0FBRyxFQUFFLFFBQVEsRUFBRSxrQkFBa0IsRUFBRSxJQUFJLEVBQUUsS0FBSyxFQUFFLElBQUksQ0FBQyxDQUFDO1lBQ3pGLFdBQVcsQ0FBQyxNQUFNLEVBQUUsQ0FBQztRQUN6QixDQUFDLENBQUMsQ0FBQztRQUVILEVBQUUsQ0FBQyxnQ0FBZ0MsRUFBRSxHQUFHLEVBQUU7WUFDdEMsTUFBTSxDQUFDLFNBQVMsQ0FBQyxXQUFXLENBQUMsU0FBUyxFQUFFLENBQUMsU0FBUyxDQUFDLENBQUM7WUFDcEQsTUFBTSxDQUFDLFNBQVMsQ0FBQyxXQUFXLENBQUMsU0FBUyxFQUFFLENBQUMsYUFBYSxDQUFDLHVCQUF1QixDQUFDLENBQUMsQ0FBQztRQUNyRixDQUFDLENBQUMsQ0FBQztRQUVILEVBQUUsQ0FBQyw0REFBNEQsRUFBRSxHQUFHLEVBQUU7WUFDbEUsTUFBTSxDQUFDLE1BQU0sQ0FBQyxXQUFXLENBQUMsU0FBUyxFQUFFLENBQUMsYUFBYSxDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUM7WUFDbEUsTUFBTSxDQUFDLE1BQU0sQ0FBQyxXQUFXLENBQUMsU0FBUyxFQUFFLENBQUMsYUFBYSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUM7WUFDL0QsTUFBTSxDQUFDLE1BQU0sQ0FBQyxXQUFXLENBQUMsU0FBUyxFQUFFLENBQUMsYUFBYSxDQUFDLGVBQWUsQ0FBQyxDQUFDLENBQUM7UUFDMUUsQ0FBQyxDQUFDLENBQUM7SUFDUCxDQUFDLENBQUMsQ0FBQztBQUNQLENBQUMsQ0FBQyxDQUFDIn0=