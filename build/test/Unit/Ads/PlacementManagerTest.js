import { PlacementManager } from 'Ads/Managers/PlacementManager';
import { PlacementState } from 'Ads/Models/Placement';
import { ListenerApi } from 'Ads/Native/Listener';
import { PlacementApi } from 'Ads/Native/Placement';
import { assert } from 'chai';
import { Platform } from 'Core/Constants/Platform';
import 'mocha';
import * as sinon from 'sinon';
import { TestFixtures } from 'TestHelpers/TestFixtures';
describe('PlacementManagerTest', () => {
    let platform;
    let backend;
    let nativeBridge;
    let ads;
    let coreConfig;
    let adsConfig;
    beforeEach(() => {
        platform = Platform.ANDROID;
        backend = TestFixtures.getBackend(platform);
        nativeBridge = TestFixtures.getNativeBridge(platform, backend);
        ads = TestFixtures.getAdsApi(nativeBridge);
        coreConfig = TestFixtures.getCoreConfiguration();
        adsConfig = TestFixtures.getAdsConfiguration();
    });
    it('should get and set campaign for known placement', () => {
        const placementManager = new PlacementManager(ads, adsConfig);
        const testCampaign = TestFixtures.getCampaign();
        assert.isUndefined(placementManager.getCampaign('video'), 'uninitialized video campaign was not undefined');
        placementManager.setCampaign('video', testCampaign);
        assert.isDefined(placementManager.getCampaign('video'), 'campaign for placement was not successfully set');
        assert.equal(placementManager.getCampaign('video').getId(), testCampaign.getId(), 'campaign ids do not match');
    });
    it('should not get or set campaign for unknown placement', () => {
        const placementManager = new PlacementManager(ads, adsConfig);
        const testCampaign = TestFixtures.getCampaign();
        assert.isUndefined(placementManager.getCampaign('unknown'), 'unknown placement did not return undefined campaign');
        placementManager.setCampaign('unknown', testCampaign);
        assert.isUndefined(placementManager.getCampaign('unknown'), 'unknown placement returns a campaign after setCampaign invocation');
    });
    it('should clear campaigns', () => {
        const placementManager = new PlacementManager(ads, adsConfig);
        const testCampaign = TestFixtures.getCampaign();
        placementManager.setCampaign('premium', testCampaign);
        placementManager.setCampaign('video', testCampaign);
        assert.isDefined(placementManager.getCampaign('premium'), 'test campaign was not properly set to premium placement');
        assert.isDefined(placementManager.getCampaign('video'), 'test campaign was not properly set to video placement');
        placementManager.clearCampaigns();
        assert.isUndefined(placementManager.getCampaign('premium'), 'premium placement was not cleared');
        assert.isUndefined(placementManager.getCampaign('video'), 'video placement was not cleared');
    });
    it('should set waiting placement state for freshly initialized SDK', () => {
        ads.Placement = new PlacementApi(nativeBridge);
        ads.Listener = new ListenerApi(nativeBridge);
        const placementSpy = sinon.spy(ads.Placement, 'setPlacementState');
        const listenerSpy = sinon.spy(ads.Listener, 'sendPlacementStateChangedEvent');
        const placementManager = new PlacementManager(ads, adsConfig);
        placementManager.setPlacementState('video', PlacementState.WAITING);
        assert.isTrue(placementSpy.calledOnceWithExactly('video', PlacementState.WAITING), 'placement state waiting was not set');
        assert.isTrue(listenerSpy.calledOnceWithExactly('video', PlacementState[PlacementState.NOT_AVAILABLE], PlacementState[PlacementState.WAITING]), 'placement state change event was not sent');
    });
    it('should set ready placement state for waiting placement', () => {
        ads.Placement = new PlacementApi(nativeBridge);
        ads.Listener = new ListenerApi(nativeBridge);
        const placementManager = new PlacementManager(ads, adsConfig);
        placementManager.setPlacementState('video', PlacementState.WAITING);
        const placementSpy = sinon.spy(ads.Placement, 'setPlacementState');
        const listenerSpy = sinon.spy(ads.Listener, 'sendReadyEvent');
        placementManager.setPlacementState('video', PlacementState.READY);
        assert.isTrue(placementSpy.calledOnceWithExactly('video', PlacementState.READY), 'placement state readt was not set');
        assert.isTrue(listenerSpy.calledOnceWithExactly('video'), 'ready event was not sent');
    });
    it('should not send events when placement state does not change', () => {
        ads.Placement = new PlacementApi(nativeBridge);
        ads.Listener = new ListenerApi(nativeBridge);
        const placementManager = new PlacementManager(ads, adsConfig);
        placementManager.setPlacementState('video', PlacementState.WAITING);
        const placementSpy = sinon.spy(ads.Placement, 'setPlacementState');
        const listenerSpy = sinon.spy(ads.Listener, 'sendPlacementStateChangedEvent');
        placementManager.setPlacementState('video', PlacementState.WAITING);
        assert.isFalse(placementSpy.called, 'placement state was set to native side when placement state did not change');
        assert.isFalse(listenerSpy.called, 'placement state change event was sent when placement state did not change');
    });
    it('should set all placements to no fill state', () => {
        const placementManager = new PlacementManager(ads, adsConfig);
        placementManager.setPlacementState('premium', PlacementState.WAITING);
        placementManager.setPlacementState('video', PlacementState.WAITING);
        placementManager.setAllPlacementStates(PlacementState.NO_FILL);
        assert.equal(adsConfig.getPlacement('premium').getState(), PlacementState.NO_FILL, 'premium placement was not set to no fill');
        assert.equal(adsConfig.getPlacement('video').getState(), PlacementState.NO_FILL, 'video placement was not set to no fill');
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUGxhY2VtZW50TWFuYWdlclRlc3QuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi90ZXN0L1VuaXQvQWRzL1BsYWNlbWVudE1hbmFnZXJUZXN0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUNBLE9BQU8sRUFBRSxnQkFBZ0IsRUFBRSxNQUFNLCtCQUErQixDQUFDO0FBR2pFLE9BQU8sRUFBRSxjQUFjLEVBQUUsTUFBTSxzQkFBc0IsQ0FBQztBQUN0RCxPQUFPLEVBQUUsV0FBVyxFQUFFLE1BQU0scUJBQXFCLENBQUM7QUFDbEQsT0FBTyxFQUFFLFlBQVksRUFBRSxNQUFNLHNCQUFzQixDQUFDO0FBR3BELE9BQU8sRUFBRSxNQUFNLEVBQVUsTUFBTSxNQUFNLENBQUM7QUFDdEMsT0FBTyxFQUFFLFFBQVEsRUFBRSxNQUFNLHlCQUF5QixDQUFDO0FBS25ELE9BQU8sT0FBTyxDQUFDO0FBQ2YsT0FBTyxLQUFLLEtBQUssTUFBTSxPQUFPLENBQUM7QUFDL0IsT0FBTyxFQUFFLFlBQVksRUFBRSxNQUFNLDBCQUEwQixDQUFDO0FBRXhELFFBQVEsQ0FBQyxzQkFBc0IsRUFBRSxHQUFHLEVBQUU7SUFDbEMsSUFBSSxRQUFrQixDQUFDO0lBQ3ZCLElBQUksT0FBZ0IsQ0FBQztJQUNyQixJQUFJLFlBQTBCLENBQUM7SUFDL0IsSUFBSSxHQUFZLENBQUM7SUFDakIsSUFBSSxVQUE2QixDQUFDO0lBQ2xDLElBQUksU0FBMkIsQ0FBQztJQUVoQyxVQUFVLENBQUMsR0FBRyxFQUFFO1FBQ1osUUFBUSxHQUFHLFFBQVEsQ0FBQyxPQUFPLENBQUM7UUFDNUIsT0FBTyxHQUFHLFlBQVksQ0FBQyxVQUFVLENBQUMsUUFBUSxDQUFDLENBQUM7UUFDNUMsWUFBWSxHQUFHLFlBQVksQ0FBQyxlQUFlLENBQUMsUUFBUSxFQUFFLE9BQU8sQ0FBQyxDQUFDO1FBQy9ELEdBQUcsR0FBRyxZQUFZLENBQUMsU0FBUyxDQUFDLFlBQVksQ0FBQyxDQUFDO1FB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