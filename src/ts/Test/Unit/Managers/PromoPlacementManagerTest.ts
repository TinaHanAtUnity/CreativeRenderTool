import 'mocha';
import * as sinon from 'sinon';
import { assert, expect } from 'chai';
import { PromoPlacementManager } from 'Managers/PromoPlacementManager';
import { NativeBridge } from 'Native/NativeBridge';
import { Configuration } from 'Models/Configuration';
import { ConfigurationParser } from 'Parsers/ConfigurationParser';
import ConfigurationPromoPlacements from 'json/ConfigurationPromoPlacements.json';
import { TestFixtures } from '../TestHelpers/TestFixtures';
import { Campaign } from 'Models/Campaign';
import { PlacementState } from 'Models/Placement';

describe('PromoPlacementManagerTest', () => {

    let promoPlacementManager: PromoPlacementManager;
    let nativeBridge: NativeBridge;
    let configuration: Configuration;
    let campaign: Campaign;
    let sandbox: sinon.SinonSandbox;

    beforeEach(() => {
        nativeBridge = TestFixtures.getNativeBridge();
        configuration = ConfigurationParser.parse(JSON.parse(ConfigurationPromoPlacements));
        campaign = TestFixtures.getPromoCampaign();
        sandbox = sinon.sandbox.create();

        promoPlacementManager = new PromoPlacementManager(nativeBridge, configuration);
    });

    afterEach(() => {
        sandbox.restore();
    });

    describe('addAuctionFillPromoPlacementId', () => {
        it('should add passed placementid to the placementIds array', () => {
            promoPlacementManager.addAuctionFillPromoPlacementId('testid');
            assert.equal(promoPlacementManager.getAuctionFillPlacementIds()[0], 'testid');
            assert.deepEqual(promoPlacementManager.getAuctionFillPlacementIds(), ['testid']);
        });
    });

    describe('getAuctionFillPlacementIds', () => {
        it('should return the placementIds array', () => {
            const placements = promoPlacementManager.getAuctionFillPlacementIds();
            expect(placements).to.have.length(0);
            promoPlacementManager.addAuctionFillPromoPlacementId('testid');
            expect(placements).to.have.length(1);
            assert.deepEqual(promoPlacementManager.getAuctionFillPlacementIds(), ['testid']);
        });
    });

    describe('setPromoPlacementReady', () => {
        it('should set placement state of the passed placementId', () => {
            assert.equal(configuration.getPlacement('promoPlacement').getState(), PlacementState.NOT_AVAILABLE);
            promoPlacementManager.setPromoPlacementReady('promoPlacement', campaign);
            assert.equal(configuration.getPlacement('promoPlacement').getState(), PlacementState.READY);
        });

        it('should set the campaign of the placement to passed campaign', () => {
            assert.equal(configuration.getPlacement('promoPlacement').getCurrentCampaign(), undefined);
            promoPlacementManager.setPromoPlacementReady('promoPlacement', campaign);
            assert.equal(configuration.getPlacement('promoPlacement').getCurrentCampaign(), campaign);
        });

        it('should not set placement state or current campaign if placement is not promo', () => {
            promoPlacementManager.setPromoPlacementReady('video', campaign);
            assert.equal(configuration.getPlacement('video').getCurrentCampaign(), undefined);
            assert.equal(configuration.getPlacement('video').getState(), PlacementState.NOT_AVAILABLE);
        });
    });

    describe('setPlacementState', () => {
        it('should set state of placement with passed placementstate', () => {
            const placementId = 'promoPlacement';
            assert.equal(configuration.getPlacement(placementId).getState(), PlacementState.NOT_AVAILABLE);
            promoPlacementManager.setPlacementState(placementId, PlacementState.READY);
            assert.equal(configuration.getPlacement(placementId).getState(), PlacementState.READY);
        });

        it('should send placement state change with correct params', () => {
            const placementId = 'promoPlacement';
            const newState = PlacementState.READY;
            const oldState = PlacementState.NOT_AVAILABLE;

            sinon.stub(nativeBridge.Placement, 'setPlacementState').returns(Promise.resolve());
            sinon.stub(nativeBridge.Listener, 'sendPlacementStateChangedEvent').returns(Promise.resolve());
            sinon.stub(nativeBridge.Listener, 'sendReadyEvent').returns(Promise.resolve());

            assert.equal(configuration.getPlacement(placementId).getState(), oldState);
            promoPlacementManager.setPlacementState(placementId, newState);
            assert.equal(configuration.getPlacement(placementId).getState(), newState);

            sinon.assert.calledWith(<sinon.SinonSpy>nativeBridge.Placement.setPlacementState, placementId, newState);
            sinon.assert.calledWith(<sinon.SinonSpy>nativeBridge.Listener.sendPlacementStateChangedEvent, placementId, PlacementState[oldState], PlacementState[newState]);
            sinon.assert.calledWith(<sinon.SinonSpy>nativeBridge.Listener.sendReadyEvent, placementId);
        });

        it('should no-op when old state is equal to new state', () => {
            const placementId = 'promoPlacement';
            const newState = PlacementState.NOT_AVAILABLE;
            const oldState = PlacementState.NOT_AVAILABLE;

            sinon.stub(nativeBridge.Placement, 'setPlacementState').returns(Promise.resolve());
            sinon.stub(nativeBridge.Listener, 'sendPlacementStateChangedEvent').returns(Promise.resolve());
            sinon.stub(nativeBridge.Listener, 'sendReadyEvent').returns(Promise.resolve());

            assert.equal(configuration.getPlacement(placementId).getState(), oldState);
            promoPlacementManager.setPlacementState(placementId, newState);
            assert.equal(configuration.getPlacement(placementId).getState(), newState);

            sinon.assert.notCalled(<sinon.SinonSpy>nativeBridge.Placement.setPlacementState);
            sinon.assert.notCalled(<sinon.SinonSpy>nativeBridge.Listener.sendPlacementStateChangedEvent);
            sinon.assert.notCalled(<sinon.SinonSpy>nativeBridge.Listener.sendReadyEvent);
        });

        it('should not send ready event when new state is not equal to ready', () => {
            const placementId = 'promoPlacement';
            const newState = PlacementState.WAITING;
            const oldState = PlacementState.NOT_AVAILABLE;

            sinon.stub(nativeBridge.Placement, 'setPlacementState').returns(Promise.resolve());
            sinon.stub(nativeBridge.Listener, 'sendPlacementStateChangedEvent').returns(Promise.resolve());
            sinon.stub(nativeBridge.Listener, 'sendReadyEvent').returns(Promise.resolve());

            assert.equal(configuration.getPlacement(placementId).getState(), oldState);
            promoPlacementManager.setPlacementState(placementId, newState);
            assert.equal(configuration.getPlacement(placementId).getState(), newState);

            sinon.assert.calledWith(<sinon.SinonSpy>nativeBridge.Placement.setPlacementState, placementId, newState);
            sinon.assert.calledWith(<sinon.SinonSpy>nativeBridge.Listener.sendPlacementStateChangedEvent, placementId, PlacementState[oldState], PlacementState[newState]);
            sinon.assert.notCalled(<sinon.SinonSpy>nativeBridge.Listener.sendReadyEvent);
        });

        it('should not set placement state for placement that is not promo', () => {
            promoPlacementManager.setPlacementState('video', PlacementState.READY);
            assert.equal(configuration.getPlacement('video').getState(), PlacementState.NOT_AVAILABLE);
        });
    });
});
