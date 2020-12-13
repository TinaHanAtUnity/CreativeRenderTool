import { UserPrivacyManager } from 'Ads/Managers/UserPrivacyManager';
import { SDKMetrics } from 'Ads/Utilities/SDKMetrics';
import { Privacy } from 'Ads/Views/Privacy';
import { assert } from 'chai';
import { Platform } from 'Core/Constants/Platform';
import { CustomCloseMRAID } from 'MRAID/Views/CustomCloseMRAID';
import { TestFixtures } from 'TestHelpers/TestFixtures';
import 'mocha';
import * as sinon from 'sinon';
describe('CustomCloseMRAID', () => {
    let platform;
    let backend;
    let nativeBridge;
    let core;
    let configuration;
    let privacy;
    let placement;
    let privacyManager;
    let mraidCampaign;
    let clock;
    let mraid;
    let container;
    beforeEach(() => {
        platform = Platform.ANDROID;
        backend = TestFixtures.getBackend(platform);
        nativeBridge = TestFixtures.getNativeBridge(platform, backend);
        core = TestFixtures.getCoreApi(nativeBridge);
        configuration = TestFixtures.getCoreConfiguration();
        privacyManager = sinon.createStubInstance(UserPrivacyManager);
        mraidCampaign = TestFixtures.getProgrammaticMRAIDCampaign();
        privacy = new Privacy(platform, mraidCampaign, privacyManager, false, false, 'en');
        sinon.stub(SDKMetrics, 'reportMetricEvent').returns(Promise.resolve());
        placement = TestFixtures.getPlacement();
        clock = sinon.useFakeTimers();
    });
    describe('when creating CustomCloseMRAID and allowSkip returns true', () => {
        beforeEach(() => {
            placement.set('allowSkip', true);
            mraid = new CustomCloseMRAID(platform, core, TestFixtures.getAndroidDeviceInfo(core), placement, mraidCampaign, privacy, false, configuration.getAbGroup());
            mraid.render();
            mraid.show();
            container = mraid.container();
        });
        afterEach(() => {
            mraid.hide();
        });
        it('should have moved the close graphic to the left', () => {
            const region = container.querySelector('.close-region');
            assert.equal(region.style.left, '0px');
        });
        describe('when onUseCustomClose is called with true', () => {
            let closeElement;
            beforeEach(() => {
                mraid.onUseCustomClose(true);
                closeElement = container.querySelector('.close');
            });
            it('should not show the close button before 5 seconds', () => {
                assert.equal(closeElement.style.display, 'none');
            });
            it('should not show the close button after 4 seconds', () => {
                clock.tick(4000);
                assert.equal(closeElement.style.display, 'none');
            });
            it('should show the close button after 5 seconds', () => {
                clock.tick(5000);
                assert.equal(closeElement.style.display, 'block');
            });
            it('should not hide the close button if onUseCustomClose is called again', () => {
                clock.tick(5000);
                mraid.onUseCustomClose(true);
                assert.equal(closeElement.style.display, 'block');
            });
        });
    });
    describe('when creating CustomCloseMRAID and allowSkip returns false', () => {
        beforeEach(() => {
            placement.set('allowSkip', false);
            mraid = new CustomCloseMRAID(platform, core, TestFixtures.getAndroidDeviceInfo(core), placement, mraidCampaign, privacy, false, configuration.getAbGroup());
            mraid.render();
            mraid.show();
            container = mraid.container();
        });
        afterEach(() => {
            mraid.hide();
        });
        it('should not move the close graphic to the left', () => {
            const region = container.querySelector('.close-region');
            assert.equal(region.style.left, '');
        });
        describe('when onUseCustomClose is called with true', () => {
            let closeElement;
            beforeEach(() => {
                mraid.onUseCustomClose(true);
                closeElement = container.querySelector('.close');
            });
            it('should not show the close button before 40 seconds', () => {
                assert.equal(closeElement.style.display, 'none');
            });
            it('should not show the close button after 39 seconds', () => {
                clock.tick(39000);
                assert.equal(closeElement.style.display, 'none');
            });
            it('should show the close button after 40 seconds', () => {
                clock.tick(40000);
                assert.equal(closeElement.style.display, 'block');
            });
            it('should not hide the close button if onUseCustomClose is called again', () => {
                clock.tick(40000);
                mraid.onUseCustomClose(true);
                assert.equal(closeElement.style.display, 'block');
            });
        });
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQ3VzdG9tQ2xvc2VNUkFJRFRlc3QuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi90ZXN0L1VuaXQvTVJBSUQvQ3VzdG9tQ2xvc2VNUkFJRFRlc3QudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFFLGtCQUFrQixFQUFFLE1BQU0saUNBQWlDLENBQUM7QUFFckUsT0FBTyxFQUFFLFVBQVUsRUFBRSxNQUFNLDBCQUEwQixDQUFDO0FBQ3RELE9BQU8sRUFBRSxPQUFPLEVBQUUsTUFBTSxtQkFBbUIsQ0FBQztBQUU1QyxPQUFPLEVBQUUsTUFBTSxFQUFFLE1BQU0sTUFBTSxDQUFDO0FBQzlCLE9BQU8sRUFBRSxRQUFRLEVBQUUsTUFBTSx5QkFBeUIsQ0FBQztBQUtuRCxPQUFPLEVBQUUsZ0JBQWdCLEVBQUUsTUFBTSw4QkFBOEIsQ0FBQztBQUNoRSxPQUFPLEVBQUUsWUFBWSxFQUFFLE1BQU0sMEJBQTBCLENBQUM7QUFFeEQsT0FBTyxPQUFPLENBQUM7QUFDZixPQUFPLEtBQUssS0FBSyxNQUFNLE9BQU8sQ0FBQztBQUUvQixRQUFRLENBQUMsa0JBQWtCLEVBQUUsR0FBRyxFQUFFO0lBQzlCLElBQUksUUFBa0IsQ0FBQztJQUN2QixJQUFJLE9BQWdCLENBQUM7SUFDckIsSUFBSSxZQUEwQixDQUFDO0lBQy9CLElBQUksSUFBYyxDQUFDO0lBQ25CLElBQUksYUFBZ0MsQ0FBQztJQUNyQyxJQUFJLE9BQWdCLENBQUM7SUFDckIsSUFBSSxTQUFvQixDQUFDO0lBQ3pCLElBQUksY0FBa0MsQ0FBQztJQUN2QyxJQUFJLGFBQTRCLENBQUM7SUFDakMsSUFBSSxLQUE0QixDQUFDO0lBQ2pDLElBQUksS0FBdUIsQ0FBQztJQUM1QixJQUFJLFNBQXNCLENBQUM7SUFFM0IsVUFBVSxDQUFDLEdBQUcsRUFBRTtRQUNaLFFBQVEsR0FBRyxRQUFRLENBQUMsT0FBTyxDQUFDO1FBQzVCLE9BQU8sR0FBRyxZQUFZLENBQUMsVUFB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