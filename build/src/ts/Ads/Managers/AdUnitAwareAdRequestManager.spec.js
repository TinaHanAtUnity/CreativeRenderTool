import * as tslib_1 from "tslib";
import { AdRequestManager } from 'Ads/Managers/__mocks__/AdRequestManager';
import { Placement, withGroupId } from 'Ads/Models/__mocks__/Placement';
import { Campaign } from 'Ads/Models/__mocks__/Campaign';
import { AdUnitAwareAdRequestManager } from 'Ads/Managers/AdUnitAwareAdRequestManager';
describe(`AdUnitAwareAdRequestManager`, () => {
    let adUnitAwareAdRequestManager;
    let adRequestManager;
    let placement;
    let loadedCampaign;
    beforeEach(() => {
        placement = Placement('video');
        adRequestManager = AdRequestManager();
        adUnitAwareAdRequestManager = new AdUnitAwareAdRequestManager(adRequestManager);
        adRequestManager.loadCampaignWithAdditionalPlacement.mockResolvedValue({
            campaign: Campaign('', 'original'),
            trackingUrl: {}
        });
        adRequestManager.loadCampaign.mockResolvedValue({
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
        beforeEach(() => tslib_1.__awaiter(this, void 0, void 0, function* () {
            yield adUnitAwareAdRequestManager.request();
        }));
        it('should forward request call to AdRequestManager', () => {
            expect(adRequestManager.request).toBeCalledTimes(1);
        });
    });
    describe('load campaign with placement without ad unit', () => {
        beforeEach(() => tslib_1.__awaiter(this, void 0, void 0, function* () {
            loadedCampaign = yield adUnitAwareAdRequestManager.loadCampaign(placement);
        }));
        it('should have fill', () => {
            expect(loadedCampaign).toBeDefined();
        });
        it('should have fill with original campaign', () => {
            expect(loadedCampaign.campaign.getId()).toEqual('original');
        });
        it('should forward call to AdRequestManager', () => {
            expect(adRequestManager.loadCampaign).toBeCalledTimes(1);
            expect(adRequestManager.loadCampaign).toBeCalledWith(placement);
        });
    });
    describe('load campaign: with ad unit and additional placements not set', () => {
        beforeEach(() => tslib_1.__awaiter(this, void 0, void 0, function* () {
            placement = withGroupId(placement, 'test');
            loadedCampaign = yield adUnitAwareAdRequestManager.loadCampaign(placement);
        }));
        it('should have fill', () => {
            expect(loadedCampaign).toBeDefined();
        });
        it('should have fill with original campaign', () => {
            expect(loadedCampaign.campaign.getId()).toEqual('original');
        });
        it('should forward call to AdRequestManager', () => {
            expect(adRequestManager.loadCampaignWithAdditionalPlacement).toBeCalledTimes(1);
            expect(adRequestManager.loadCampaignWithAdditionalPlacement).toBeCalledWith(placement);
        });
    });
    describe('load campaign: with ad unit and additional placements set', () => {
        let notCachedCampaign;
        beforeEach(() => tslib_1.__awaiter(this, void 0, void 0, function* () {
            placement = withGroupId(placement, 'test');
            notCachedCampaign = {
                notCachedCampaign: Campaign('', 'cached'),
                notCachedTrackingUrls: {}
            };
            adRequestManager.onAdditionalPlacementsReady.subscribe.mock.calls[0][0]('test', {
                video: notCachedCampaign
            });
            loadedCampaign = yield adUnitAwareAdRequestManager.loadCampaign(placement);
        }));
        it('should have fill', () => {
            expect(loadedCampaign).toBeDefined();
        });
        it('should have fill with cached campaign', () => {
            expect(loadedCampaign.campaign.getId()).toEqual('cached');
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
        let notCachedCampaign;
        beforeEach(() => tslib_1.__awaiter(this, void 0, void 0, function* () {
            placement = withGroupId(placement, 'test');
            notCachedCampaign = {
                notCachedCampaign: Campaign('', 'cached'),
                notCachedTrackingUrls: {}
            };
            adRequestManager.onAdditionalPlacementsReady.subscribe.mock.calls[0][0]('test', {
                video_2: notCachedCampaign
            });
            loadedCampaign = yield adUnitAwareAdRequestManager.loadCampaign(placement);
        }));
        it('should have fill', () => {
            expect(loadedCampaign).toBeDefined();
        });
        it('should have fill with cached campaign', () => {
            expect(loadedCampaign.campaign.getId()).toEqual('original');
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
        beforeEach(() => tslib_1.__awaiter(this, void 0, void 0, function* () {
            placement = withGroupId(placement, 'test');
            adRequestManager.onAdditionalPlacementsReady.subscribe.mock.calls[0][0]('test', {
                video: undefined
            });
            loadedCampaign = yield adUnitAwareAdRequestManager.loadCampaign(placement);
        }));
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
        let notCachedCampaign;
        beforeEach(() => tslib_1.__awaiter(this, void 0, void 0, function* () {
            placement = withGroupId(placement, 'test');
            notCachedCampaign = {
                notCachedCampaign: Campaign('', 'cached'),
                notCachedTrackingUrls: {}
            };
            adRequestManager.onAdditionalPlacementsReady.subscribe.mock.calls[0][0]('test', {
                video: notCachedCampaign
            });
            adUnitAwareAdRequestManager.invalidate();
            loadedCampaign = yield adUnitAwareAdRequestManager.loadCampaign(placement);
        }));
        it('should have fill', () => {
            expect(loadedCampaign).toBeDefined();
        });
        it('should have fill with cached campaign', () => {
            expect(loadedCampaign.campaign.getId()).toEqual('original');
        });
        it('should forward call to AdRequestManager', () => {
            expect(adRequestManager.loadCampaignWithAdditionalPlacement).toBeCalledTimes(1);
        });
        it('should not call cacheCampaign', () => {
            expect(adRequestManager.cacheCampaign).toBeCalledTimes(0);
        });
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQWRVbml0QXdhcmVBZFJlcXVlc3RNYW5hZ2VyLnNwZWMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9zcmMvdHMvQWRzL01hbmFnZXJzL0FkVW5pdEF3YXJlQWRSZXF1ZXN0TWFuYWdlci5zcGVjLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQSxPQUFPLEVBQUUsZ0JBQWdCLEVBQXdCLE1BQU0seUNBQXlDLENBQUM7QUFFakcsT0FBTyxFQUFFLFNBQVMsRUFBaUIsV0FBVyxFQUFFLE1BQU0sZ0NBQWdDLENBQUM7QUFDdkYsT0FBTyxFQUFFLFFBQVEsRUFBRSxNQUFNLCtCQUErQixDQUFDO0FBQ3pELE9BQU8sRUFBRSwyQkFBMkIsRUFBRSxNQUFNLDBDQUEwQyxDQUFDO0FBR3ZGLFFBQVEsQ0FBQyw2QkFBNkIsRUFBRSxHQUFHLEVBQUU7SUFDekMsSUFBSSwyQkFBd0QsQ0FBQztJQUM3RCxJQUFJLGdCQUFzQyxDQUFDO0lBQzNDLElBQUksU0FBd0IsQ0FBQztJQUM3QixJQUFJLGNBQTJDLENBQUM7SUFFaEQsVUFBVSxDQUFDLEdBQUcsRUFBRTtRQUNaLFNBQVMsR0FBRyxTQUFTLENBQUMsT0FBTyxDQUFDLENBQUM7UUFDL0IsZ0JBQWdCLEdBQUcsZ0JBQWdCLEVBQUUsQ0FBQztRQUN0QywyQkFBMkIsR0FBRyxJQUFJLDJCQUEyQixDQUFDLGdCQUFnQixDQUFDLENBQUM7UUFFaEYsZ0JBQWdCLENBQUMsbUNBQW1DLENBQUMsaUJBQWlCLENBQUM7WUFDbkUsUUFBUSxFQUFFLFFBQVEsQ0FBQyxFQUFFLEVBQUUsVUFBVSxDQUFDO1lBQ2xDLFdBQVcsRUFBRSxFQUFFO1NBQ2xCLENBQUMsQ0FBQztRQUVILGdCQUFnQixDQUFDLFlBQVksQ0FBQyxpQkFBaUIsQ0FBQztZQUM1QyxRQUFRLEVBQUUsUUFBUSxDQUFDLEVBQUUsRUFBRSxVQUFVLENBQUM7WUFDbEMsV0FBVyxFQUFFLEVBQUU7U0FDbEIsQ0FBQyxDQUFDO0lB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