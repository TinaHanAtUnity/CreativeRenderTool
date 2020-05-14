import { AdRequestManager, AdRequestManagerMock } from 'Ads/Managers/__mocks__/AdRequestManager';
import { ILoadedCampaign } from 'Ads/Managers/CampaignManager';
import { Placement, PlacementMock, withAdUnit } from 'Ads/Models/__mocks__/Placement';
import { Campaign } from 'Ads/Models/__mocks__/Campaign';
import { AdUnitAwareAdRequestManager } from 'Ads/Managers/AdUnitAwareAdRequestManager';
import { INotCachedLoadedCampaign } from 'Ads/Managers/AdRequestManager';

describe(`AdUnitAwareAdRequestManager`, () => {
    let adUnitAwareAdRequestManager: AdUnitAwareAdRequestManager;
    let adRequestManager: AdRequestManagerMock;
    let placement: PlacementMock;
    let loadedCampaign: ILoadedCampaign | undefined;

    beforeEach(() => {
        placement = Placement('video');
        adRequestManager = AdRequestManager();
        adUnitAwareAdRequestManager = new AdUnitAwareAdRequestManager(adRequestManager);

        adRequestManager.loadCampaignWithAdditionalPlacement.mockResolvedValue({
            campaign: Campaign('', 'original'),
            trackingUrl: {}
        });
    });

    describe('initial state', () => {
        it('should subscribe to onAdditionalPlacementsReady', () => {
            expect(adRequestManager.onAdditionalPlacementsReady.subscribe).toBeCalledTimes(1);
        });
    });

    describe('request call', () => {
        beforeEach(async () => {
            await adUnitAwareAdRequestManager.request();
        });
        it('should forward request call to AdRequestManager', () => {
            expect(adRequestManager.request).toBeCalledTimes(1);
        });
    });


    describe('load campaign with placement without ad unit', () => {
        beforeEach(async () => {
            loadedCampaign = await adUnitAwareAdRequestManager.loadCampaign(placement);
        });

        it('should have fill', () => {
            expect(loadedCampaign).toBeDefined();
        });

        it('should have fill with original campaign', () => {
            expect(loadedCampaign!.campaign.getId()).toEqual('original');
        });

        it('should forward call to AdRequestManager', () => {
            expect(adRequestManager.loadCampaignWithAdditionalPlacement).toBeCalledTimes(1);
            expect(adRequestManager.loadCampaignWithAdditionalPlacement).toBeCalledWith(placement);
        });
    });

    describe('load campaign: with ad unit and additional placements not set', () => {
        beforeEach(async () => {
            placement = withAdUnit(placement, 'test');
            loadedCampaign = await adUnitAwareAdRequestManager.loadCampaign(placement);
        });

        it('should have fill', () => {
            expect(loadedCampaign).toBeDefined();
        });

        it('should have fill with original campaign', () => {
            expect(loadedCampaign!.campaign.getId()).toEqual('original');
        });

        it('should forward call to AdRequestManager', () => {
            expect(adRequestManager.loadCampaignWithAdditionalPlacement).toBeCalledTimes(1);
            expect(adRequestManager.loadCampaignWithAdditionalPlacement).toBeCalledWith(placement);
        });
    });

    describe('load campaign: with ad unit and additional placements set', () => {
        let notCachedCampaign: INotCachedLoadedCampaign;

        beforeEach(async () => {
            placement = withAdUnit(placement, 'test');
            notCachedCampaign = {
                notCachedCampaign: Campaign('', 'cached'),
                notCachedTrackingUrls: {}
            };

            adRequestManager.onAdditionalPlacementsReady.subscribe.mock.calls[0][0]('test', {
                video: notCachedCampaign
            });

            loadedCampaign = await adUnitAwareAdRequestManager.loadCampaign(placement);
        });

        it('should have fill', () => {
            expect(loadedCampaign).toBeDefined();
        });

        it('should have fill with cached campaign', () => {
            expect(loadedCampaign!.campaign.getId()).toEqual('cached');
        });

        it('should not forward call to AdRequestManager', () => {
            expect(adRequestManager.loadCampaign).toBeCalledTimes(0);
        });

        it('should call cacheCampaign', () => {
            expect(adRequestManager.cacheCampaign).toBeCalledTimes(1);
            expect(adRequestManager.cacheCampaign).toBeCalledWith(notCachedCampaign);
        });
    });

    describe('load campaign: with ad unit and additional placements set but not for the placement', () => {
        let notCachedCampaign: INotCachedLoadedCampaign;

        beforeEach(async () => {
            placement = withAdUnit(placement, 'test');
            notCachedCampaign = {
                notCachedCampaign: Campaign('', 'cached'),
                notCachedTrackingUrls: {}
            };

            adRequestManager.onAdditionalPlacementsReady.subscribe.mock.calls[0][0]('test', {
                video_2: notCachedCampaign
            });

            loadedCampaign = await adUnitAwareAdRequestManager.loadCampaign(placement);
        });

        it('should have fill', () => {
            expect(loadedCampaign).toBeDefined();
        });

        it('should have fill with cached campaign', () => {
            expect(loadedCampaign!.campaign.getId()).toEqual('original');
        });

        it('should not forward call to AdRequestManager', () => {
            expect(adRequestManager.loadCampaignWithAdditionalPlacement).toBeCalledTimes(1);
            expect(adRequestManager.loadCampaignWithAdditionalPlacement).toBeCalledWith(placement);
        });

        it('should call cacheCampaign', () => {
            expect(adRequestManager.cacheCampaign).toBeCalledTimes(0);
        });
    });

    describe('load campaign: with ad unit and additional placements set with no fill', () => {
        beforeEach(async () => {
            placement = withAdUnit(placement, 'test');

            adRequestManager.onAdditionalPlacementsReady.subscribe.mock.calls[0][0]('test', {
                video: undefined
            });

            loadedCampaign = await adUnitAwareAdRequestManager.loadCampaign(placement);
        });

        it('should have fill', () => {
            expect(loadedCampaign).toBeUndefined();
        });

        it('should not forward call to AdRequestManager', () => {
            expect(adRequestManager.loadCampaignWithAdditionalPlacement).toBeCalledTimes(0);
        });

        it('should not call cacheCampaign', () => {
            expect(adRequestManager.cacheCampaign).toBeCalledTimes(0);
        });
    });

    describe('load campaign after invalidate', () => {
        let notCachedCampaign: INotCachedLoadedCampaign;

        beforeEach(async () => {
            placement = withAdUnit(placement, 'test');
            notCachedCampaign = {
                notCachedCampaign: Campaign('', 'cached'),
                notCachedTrackingUrls: {}
            };

            adRequestManager.onAdditionalPlacementsReady.subscribe.mock.calls[0][0]('test', {
                video: notCachedCampaign
            })

            adUnitAwareAdRequestManager.invalidate();

            loadedCampaign = await adUnitAwareAdRequestManager.loadCampaign(placement);
        });

        it('should have fill', () => {
            expect(loadedCampaign).toBeDefined();
        });

        it('should have fill with cached campaign', () => {
            expect(loadedCampaign!.campaign.getId()).toEqual('original');
        });

        it('should forward call to AdRequestManager', () => {
            expect(adRequestManager.loadCampaignWithAdditionalPlacement).toBeCalledTimes(1);
        });

        it('should not call cacheCampaign', () => {
            expect(adRequestManager.cacheCampaign).toBeCalledTimes(0);
        });
    });
});
