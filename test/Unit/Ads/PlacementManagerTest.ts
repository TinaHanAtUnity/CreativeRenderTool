import { IAdsApi } from 'Ads/IAds';
import { PlacementManager } from 'Ads/Managers/PlacementManager';
import { AdsConfiguration } from 'Ads/Models/AdsConfiguration';
import { Campaign } from 'Ads/Models/Campaign';
import { PlacementState } from 'Ads/Models/Placement';
import { ListenerApi } from 'Ads/Native/Listener';
import { PlacementApi } from 'Ads/Native/Placement';
import { AdsConfigurationParser } from 'Ads/Parsers/AdsConfigurationParser';
import { Backend } from 'Backend/Backend';
import { assert, expect } from 'chai';
import { Platform } from 'Core/Constants/Platform';
import { CoreConfiguration } from 'Core/Models/CoreConfiguration';

import { NativeBridge } from 'Core/Native/Bridge/NativeBridge';
import { CoreConfigurationParser } from 'Core/Parsers/CoreConfigurationParser';
import ConfigurationPromoPlacements from 'json/ConfigurationPromoPlacements.json';
import 'mocha';
import { PromoCampaign } from 'Promo/Models/PromoCampaign';
import { PromoCampaignParser } from 'Promo/Parsers/PromoCampaignParser';
import * as sinon from 'sinon';
import { TestFixtures } from 'TestHelpers/TestFixtures';

describe('PlacementManagerTest', () => {
    let platform: Platform;
    let backend: Backend;
    let nativeBridge: NativeBridge;
    let ads: IAdsApi;
    let coreConfig: CoreConfiguration;
    let adsConfig: AdsConfiguration;

    beforeEach(() => {
        platform = Platform.ANDROID;
        backend = TestFixtures.getBackend(platform);
        nativeBridge = TestFixtures.getNativeBridge(platform, backend);
        ads = TestFixtures.getAdsApi(nativeBridge);
        coreConfig = TestFixtures.getCoreConfiguration();
        adsConfig = TestFixtures.getAdsConfiguration();
    });

    describe('addCampaignPlacementIds', () => {
        it('should add passed placementid and campaign to the placementCampaignMap', () => {
            const placementManager = new PlacementManager(ads, adsConfig);
            const campaign: PromoCampaign = TestFixtures.getPromoCampaign();
            sinon.stub(campaign, 'getAdType').returns('purchasing/iap');
            placementManager.addCampaignPlacementIds('testid', campaign);
            assert.deepEqual(placementManager.getPlacementCampaignMap(PromoCampaignParser.ContentType), {'testid': campaign});
        });
    });

    describe('getPlacementCampaignMap', () => {
        it('should return map of only placements specified by the content type of the campaign in the placement campaign map', () => {
            const placementManager = new PlacementManager(ads, adsConfig);

            const campaign1 = TestFixtures.getPromoCampaign();
            const campaign2 = TestFixtures.getXPromoCampaign();
            sinon.stub(campaign1, 'getAdType').returns('purchasing/iap');
            sinon.stub(campaign2, 'getAdType').returns('xpromo/video');

            let map = placementManager.getPlacementCampaignMap(PromoCampaignParser.ContentType);
            expect(Object.keys(map)).to.have.length(0);

            placementManager.addCampaignPlacementIds('testid', campaign1);
            placementManager.addCampaignPlacementIds('testid2', campaign2);
            map = placementManager.getPlacementCampaignMap(PromoCampaignParser.ContentType);
            expect(Object.keys(map)).to.have.length(1);
            assert.deepEqual(placementManager.getPlacementCampaignMap(PromoCampaignParser.ContentType), {
                'testid': campaign1
            });
        });
    });

    describe('clear', () => {
        it('should empty all placement IDs', () => {
            const placementManager = new PlacementManager(ads, adsConfig);
            const campaign: PromoCampaign = TestFixtures.getPromoCampaign();
            sinon.stub(campaign, 'getAdType').returns('purchasing/iap');

            placementManager.addCampaignPlacementIds('testid', campaign);
            assert.equal(Object.keys(placementManager.getPlacementCampaignMap(PromoCampaignParser.ContentType)).length, 1);
            placementManager.clear();
            assert.equal(Object.keys(placementManager.getPlacementCampaignMap(PromoCampaignParser.ContentType)).length, 0);
        });
    });

    describe('setPlacementReady', () => {
        let campaign: Campaign;
        let sandbox: sinon.SinonSandbox;
        let placementManager: PlacementManager;

        beforeEach(() => {
            platform = Platform.ANDROID;
            backend = TestFixtures.getBackend(platform);
            nativeBridge = TestFixtures.getNativeBridge(platform, backend);
            ads = TestFixtures.getAdsApi(nativeBridge);
            campaign = TestFixtures.getPromoCampaign();
            sandbox = sinon.sandbox.create();
        });

        afterEach(() => {
            sandbox.restore();
        });

        it('should set placement state of the passed placementId', () => {
            coreConfig = CoreConfigurationParser.parse(JSON.parse(ConfigurationPromoPlacements));
            adsConfig = AdsConfigurationParser.parse(JSON.parse(ConfigurationPromoPlacements));
            placementManager = new PlacementManager(ads, adsConfig);
            assert.equal(adsConfig.getPlacement('promoPlacement').getState(), PlacementState.NOT_AVAILABLE);
            placementManager.setPlacementReady('promoPlacement', campaign);
            assert.equal(adsConfig.getPlacement('promoPlacement').getState(), PlacementState.READY);
        });

        it('should set the campaign of the placement to passed campaign', () => {
            coreConfig = CoreConfigurationParser.parse(JSON.parse(ConfigurationPromoPlacements));
            adsConfig = AdsConfigurationParser.parse(JSON.parse(ConfigurationPromoPlacements));
            placementManager = new PlacementManager(ads, adsConfig);
            assert.equal(adsConfig.getPlacement('promoPlacement').getCurrentCampaign(), undefined);
            placementManager.setPlacementReady('promoPlacement', campaign);
            assert.equal(adsConfig.getPlacement('promoPlacement').getCurrentCampaign(), campaign);
        });

        it('should not change placement state to ready if placement doesnt exist in config', () => {
            coreConfig = CoreConfigurationParser.parse(JSON.parse(ConfigurationPromoPlacements));
            adsConfig = AdsConfigurationParser.parse(JSON.parse(ConfigurationPromoPlacements));
            placementManager = new PlacementManager(ads, adsConfig);

            sandbox.stub(adsConfig, 'getPlacement').returns(undefined);
            sandbox.stub(placementManager, 'setPlacementState');

            placementManager.setPlacementReady('promoPlacement', campaign);
            sinon.assert.notCalled(<sinon.SinonSpy>placementManager.setPlacementState);
        });
    });

    it('should get and set campaign for known placement', () => {
        const placementManager = new PlacementManager(ads, adsConfig);
        const testCampaign = TestFixtures.getCampaign();

        assert.isUndefined(placementManager.getCampaign('video'), 'uninitialized video campaign was not undefined');

        placementManager.setCampaign('video', testCampaign);
        assert.isDefined(placementManager.getCampaign('video'), 'campaign for placement was not successfully set');
        assert.equal((<Campaign>placementManager.getCampaign('video')).getId(), testCampaign.getId(), 'campaign ids do not match');
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