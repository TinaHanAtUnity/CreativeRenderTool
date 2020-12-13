import { AuctionPlacement } from 'Ads/Models/AuctionPlacement';
import { AuctionResponse, AuctionStatusCode } from 'Ads/Models/AuctionResponse';
import { MacroUtil } from 'Ads/Utilities/MacroUtil';
import { AuctionV6, SDKMetrics } from 'Ads/Utilities/SDKMetrics';
import { JsonParser } from 'Core/Utilities/JsonParser';
// TODO: Refactor out of this - Replicates default refresh delay in RefreshManager
const DEFAULT_REFRESH_DELAY = 3600;
export class AuctionResponseParser {
    static constructTrackingUrls(trackingTemplates, tracking) {
        const trackingUrls = {};
        const globalParams = tracking.params || {};
        const events = tracking.events || {};
        Object.keys(events).forEach(((eventKey) => {
            const eventTracking = events[eventKey] || {};
            const tempParams = Object.assign({}, eventTracking.params, globalParams);
            const params = {};
            Object.keys(tempParams).forEach(key => {
                const templateKey = `{{${key}}}`;
                params[templateKey] = tempParams[key];
            });
            eventTracking.urlIndices.forEach((index) => {
                if (index >= 0 && index < trackingTemplates.length) {
                    const tempTrackingUrls = trackingUrls[eventKey] || [];
                    const urlToTemplate = trackingTemplates[index];
                    tempTrackingUrls.push(MacroUtil.replaceMacro(urlToTemplate, params));
                    trackingUrls[eventKey] = tempTrackingUrls;
                }
                else {
                    SDKMetrics.reportMetricEvent(AuctionV6.TrackingIndicesOutOfBounds);
                }
            });
        }));
        return trackingUrls;
    }
    static determinePlacementFill(responseJson, placements) {
        let refreshDelay = 0;
        const unfilledPlacementIds = [];
        const campaigns = {};
        Object.keys(placements).forEach((placementId) => {
            const placement = placements[placementId];
            if (placement.isBannerPlacement()) {
                return;
            }
            let mediaId;
            let tracking;
            const placementResponse = responseJson.placements[placementId];
            if (placementResponse) {
                if (placementResponse.mediaId) {
                    mediaId = responseJson.placements[placementId].mediaId;
                }
                if (placementResponse.tracking) {
                    tracking = responseJson.placements[placementId].tracking;
                }
            }
            if (mediaId && tracking) {
                const trackingUrls = this.constructTrackingUrls(responseJson.trackingTemplates, tracking);
                const auctionPlacement = new AuctionPlacement(placementId, mediaId, trackingUrls);
                if (campaigns[mediaId] === undefined) {
                    campaigns[mediaId] = [];
                }
                campaigns[mediaId].push(auctionPlacement);
            }
            else {
                unfilledPlacementIds.push(placementId);
                refreshDelay = DEFAULT_REFRESH_DELAY;
            }
        });
        // TODO: Potentially remove - decide if behavior is wanted in the future
        Object.keys(campaigns).forEach((mediaId) => {
            const contentType = responseJson.media[mediaId].contentType;
            const cacheTTL = responseJson.media[mediaId].cacheTTL ? responseJson.media[mediaId].cacheTTL : 3600;
            if (contentType && contentType !== 'comet/campaign' && typeof cacheTTL !== 'undefined' && cacheTTL > 0 && (cacheTTL < refreshDelay || refreshDelay === 0)) {
                refreshDelay = cacheTTL;
            }
        });
        return {
            refreshDelay,
            unfilledPlacementIds,
            campaigns
        };
    }
    static parse(response, placements) {
        let json;
        try {
            json = JsonParser.parse(response);
        }
        catch (e) {
            SDKMetrics.reportMetricEvent(AuctionV6.FailedToParse);
            throw new Error('Failed to parse IRawAuctionV6Response ' + e.message);
        }
        let auctionId;
        if (!json.auctionId) {
            SDKMetrics.reportMetricEvent(AuctionV6.AuctionIdMissing);
            throw new Error('No auction ID found');
        }
        auctionId = json.auctionId;
        if (!json.placements) {
            SDKMetrics.reportMetricEvent(AuctionV6.PlacementsMissing);
            throw new Error('No placements found');
        }
        let auctionStatusCode = AuctionStatusCode.NORMAL;
        if (json.statusCode) {
            auctionStatusCode = json.statusCode;
        }
        const { campaigns, unfilledPlacementIds, refreshDelay } = this.determinePlacementFill(json, placements);
        const auctionResponses = [];
        Object.keys(campaigns).forEach((mediaId) => {
            try {
                auctionResponses.push(new AuctionResponse(campaigns[mediaId], json.media[mediaId], mediaId, json.correlationId, auctionStatusCode));
            }
            catch (e) {
                SDKMetrics.reportMetricEvent(AuctionV6.FailedCreatingAuctionResponse);
                throw new Error('Failure creating Auction Response' + e.message);
            }
        });
        return {
            auctionId,
            refreshDelay,
            auctionStatusCode,
            auctionResponses,
            unfilledPlacementIds
        };
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQXVjdGlvblJlc3BvbnNlUGFyc2VyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vc3JjL3RzL0Fkcy9QYXJzZXJzL0F1Y3Rpb25SZXNwb25zZVBhcnNlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUUsZ0JBQWdCLEVBQUUsTUFBTSw2QkFBNkIsQ0FBQztBQUMvRCxPQUFPLEVBQUUsZUFBZSxFQUFFLGlCQUFpQixFQUErQyxNQUFNLDRCQUE0QixDQUFDO0FBRzdILE9BQU8sRUFBRSxTQUFTLEVBQUUsTUFBTSx5QkFBeUIsQ0FBQztBQUNwRCxPQUFPLEVBQUUsU0FBUyxFQUFFLFVBQVUsRUFBRSxNQUFNLDBCQUEwQixDQUFDO0FBQ2pFLE9BQU8sRUFBRSxVQUFVLEVBQUUsTUFBTSwyQkFBMkIsQ0FBQztBQWdCdkQsa0ZBQWtGO0FBQ2xGLE1BQU0scUJBQXFCLEdBQUcsSUFBSSxDQUFDO0FBRW5DLE1BQU0sT0FBTyxxQkFBcUI7SUFFdkIsTUFBTSxDQUFDLHFCQUFxQixDQUFDLGlCQUEyQixFQUFFLFFBQThCO1FBQzNGLE1BQU0sWUFBWSxHQUEwQixFQUFFLENBQUM7UUFFL0MsTUFBTSxZQUFZLEdBQUcsUUFBUSxDQUFDLE1BQU0sSUFBSSxFQUFFLENBQUM7UUFDM0MsTUFBTSxNQUFNLEdBQUcsUUFBUSxDQUFDLE1BQU0sSUFBSSxFQUFFLENBQUM7UUFFckMsTUFBTSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLFFBQWdCLEVBQUUsRUFBRTtZQUM5QyxNQUFNLGFBQWEsR0FBRyxNQUFNLENBQUMsUUFBUSxDQUFDLElBQUksRUFBRSxDQUFDO1lBQzdDLE1BQU0sVUFBVSxxQkFDVCxhQUFhLENBQUMsTUFBTSxFQUNwQixZQUFZLENBQ2xCLENBQUM7WUFFRixNQUFNLE1BQU0sR0FBNEIsRUFBRSxDQUFDO1lBQzNDLE1BQU0sQ0FBQyxJQUFJLENBQUMsVUFB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