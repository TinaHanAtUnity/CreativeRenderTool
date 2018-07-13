import 'mocha';
import * as sinon from 'sinon';
import { assert } from 'chai';
import { PromoPlacementManager } from 'Managers/PromoPlacementManager';
import { NativeBridge } from 'Native/NativeBridge';
import { TestFixtures } from '../TestHelpers/TestFixtures';
import { Configuration } from 'Models/Configuration';

xdescribe('PromoPlacementManagerTest', () => {

    let promoPlacementManager: PromoPlacementManager;
    let nativeBridge: NativeBridge;
    let configuration: Configuration;

    beforeEach(() => {
        nativeBridge = sinon.createStubInstance(NativeBridge);
        configuration = TestFixtures.getConfiguration();

        promoPlacementManager = new PromoPlacementManager(nativeBridge, configuration);
    });

    afterEach(() => {
        //
    });

    describe('addAuctionFillPromoPlacementId', () => {
        it('should add passed placementid to placementIds array', () => {
            //
        });
    });

    describe('getAuctionFillPlacementIds', () => {
        it('should return the placementIds array', () => {
            //
        });
    });

    describe('setPromoPlacementReady', () => {
       it('should set placement state of the passed placementId', () => {
            //
       });

       it('should set the campaign of the placement to passed campaign', () => {
            //
       });

       it('should not set placement state or current campaign if placement does not exist', () => {
            //
       });
    });

    describe('setPlacementState', () => {
        it('should set state of placement with passed placementstate', () => {
            //
        });
    });
});
