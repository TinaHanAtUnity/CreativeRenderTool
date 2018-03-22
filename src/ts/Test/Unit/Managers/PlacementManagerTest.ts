import 'mocha';
import { assert } from 'chai';
import * as sinon from 'sinon';

import { NativeBridge } from 'Native/NativeBridge';
import { Configuration } from 'Models/Configuration';
import { PlacementManager } from 'Managers/PlacementManager';
import { TestFixtures } from '../TestHelpers/TestFixtures';
import { Campaign } from 'Models/Campaign';
import { PlacementApi } from 'Native/Api/Placement';
import { ListenerApi } from 'Native/Api/Listener';
import { PlacementState } from 'Models/Placement';

describe('PlacementManagerTest', () => {
    let nativeBridge: NativeBridge;
    let configuration: Configuration;

    beforeEach(() => {
        nativeBridge = TestFixtures.getNativeBridge();
        configuration = TestFixtures.getConfiguration();
    });

    it('should get and set campaign for known placement', () => {
        const placementManager = new PlacementManager(nativeBridge, configuration);
        const testCampaign = TestFixtures.getCampaign();

        assert.isUndefined(placementManager.getCampaign('video'), 'uninitialized video campaign was not undefined');

        placementManager.setCampaign('video', testCampaign);
        assert.isDefined(placementManager.getCampaign('video'), 'campaign for placement was not successfully set');
        assert.equal((<Campaign>placementManager.getCampaign('video')).getId(), testCampaign.getId(), 'campaign ids do not match');
    });

    it('should not get or set campaign for unknown placement', () => {
        const placementManager = new PlacementManager(nativeBridge, configuration);
        const testCampaign = TestFixtures.getCampaign();

        assert.isUndefined(placementManager.getCampaign('unknown'), 'unknown placement did not return undefined campaign');

        placementManager.setCampaign('unknown', testCampaign);

        assert.isUndefined(placementManager.getCampaign('unknown'), 'unknown placement returns a campaign after setCampaign invocation');
    });

    it('should clear campaigns', () => {
        const placementManager = new PlacementManager(nativeBridge, configuration);
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
        nativeBridge.Placement = new PlacementApi(nativeBridge);
        nativeBridge.Listener = new ListenerApi(nativeBridge);
        const placementSpy = sinon.spy(nativeBridge.Placement, 'setPlacementState');
        const listenerSpy = sinon.spy(nativeBridge.Listener, 'sendPlacementStateChangedEvent');

        const placementManager = new PlacementManager(nativeBridge, configuration);

        placementManager.setPlacementState('video', PlacementState.WAITING);

        assert.isTrue(placementSpy.calledOnceWithExactly('video', PlacementState.WAITING), 'placement state waiting was not set');
        assert.isTrue(listenerSpy.calledOnceWithExactly('video', PlacementState[PlacementState.NOT_AVAILABLE], PlacementState[PlacementState.WAITING]), 'placement state change event was not sent');
    });

    it('should set ready placement state for waiting placement', () => {
        nativeBridge.Placement = new PlacementApi(nativeBridge);
        nativeBridge.Listener = new ListenerApi(nativeBridge);

        const placementManager = new PlacementManager(nativeBridge, configuration);

        placementManager.setPlacementState('video', PlacementState.WAITING);

        const placementSpy = sinon.spy(nativeBridge.Placement, 'setPlacementState');
        const listenerSpy = sinon.spy(nativeBridge.Listener, 'sendReadyEvent');

        placementManager.setPlacementState('video', PlacementState.READY);

        assert.isTrue(placementSpy.calledOnceWithExactly('video', PlacementState.READY), 'placement state readt was not set');
        assert.isTrue(listenerSpy.calledOnceWithExactly('video'), 'ready event was not sent');
    });

    it('should not send events when placement state does not change', () => {
        nativeBridge.Placement = new PlacementApi(nativeBridge);
        nativeBridge.Listener = new ListenerApi(nativeBridge);

        const placementManager = new PlacementManager(nativeBridge, configuration);

        placementManager.setPlacementState('video', PlacementState.WAITING);

        const placementSpy = sinon.spy(nativeBridge.Placement, 'setPlacementState');
        const listenerSpy = sinon.spy(nativeBridge.Listener, 'sendPlacementStateChangedEvent');

        placementManager.setPlacementState('video', PlacementState.WAITING);

        assert.isFalse(placementSpy.called, 'placement state was set to native side when placement state did not change');
        assert.isFalse(listenerSpy.called, 'placement state change event was sent when placement state did not change');
    });

    it('should set all placements to no fill state', () => {
        const placementManager = new PlacementManager(nativeBridge, configuration);

        placementManager.setPlacementState('premium', PlacementState.WAITING);
        placementManager.setPlacementState('video', PlacementState.WAITING);

        placementManager.setAllPlacementStates(PlacementState.NO_FILL);

        assert.equal(configuration.getPlacement('premium').getState(), PlacementState.NO_FILL, 'premium placement was not set to no fill');
        assert.equal(configuration.getPlacement('video').getState(), PlacementState.NO_FILL, 'video placement was not set to no fill');
    });
});
