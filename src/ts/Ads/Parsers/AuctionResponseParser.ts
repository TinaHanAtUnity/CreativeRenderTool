import { AuctionPlacement } from 'Ads/Models/AuctionPlacement';
import { AuctionResponse, AuctionStatusCode, IPlacementTrackingV6, IRawAuctionV6Response } from 'Ads/Models/AuctionResponse';
import { ICampaignTrackingUrls } from 'Ads/Models/Campaign';
import { Placement } from 'Ads/Models/Placement';
import { MacroUtil } from 'Ads/Utilities/MacroUtil';
import { AuctionV6, SDKMetrics } from 'Ads/Utilities/SDKMetrics';
import { JsonParser } from 'Core/Utilities/JsonParser';

export interface IParsedAuctionResponse {
    auctionId: string;
    refreshDelay: number;
    auctionStatusCode: AuctionStatusCode;
    auctionResponses: AuctionResponse[];
    unfilledPlacementIds: string[];
}

interface IPlacementMedia {
    refreshDelay: number;
    unfilledPlacementIds: string[];
    campaigns: { [mediaId: string]: AuctionPlacement[] };
}

// TODO: Refactor out of this - Replicates default refresh delay in RefreshManager
const DEFAULT_REFRESH_DELAY = 3600;

export class AuctionResponseParser {

    public static constructTrackingUrls(trackingTemplates: string[], tracking: IPlacementTrackingV6): ICampaignTrackingUrls {
        const trackingUrls: ICampaignTrackingUrls = {};

        const globalParams = tracking.params || {};
        const events = tracking.events || {};

        Object.keys(events).forEach(((eventKey: string) => {
            const eventTracking = events[eventKey] || {};
            const tempParams: { [x: string]: string } = {
                ...eventTracking.params,
                ...globalParams
            };

            const params: { [x: string]: string } = {};
            Object.keys(tempParams).forEach(key => {
                const templateKey = `{{${key}}}`;
                params[templateKey] = tempParams[key];
            });

            eventTracking.urlIndices.forEach((index) => {
                if (index >= 0 && index < trackingTemplates.length) {
                    const tempTrackingUrls: string[] = trackingUrls[eventKey] || [];
                    const urlToTemplate = trackingTemplates[index];
                    tempTrackingUrls.push(MacroUtil.replaceMacro(urlToTemplate, params));
                    trackingUrls[eventKey] = tempTrackingUrls;
                } else {
                    SDKMetrics.reportMetricEvent(AuctionV6.TrackingIndicesOutOfBounds);
                }
            });
        }));

        return trackingUrls;
    }

    private static determinePlacementFill(responseJson: IRawAuctionV6Response, placements: { [id: string]: Placement }): IPlacementMedia {
        let refreshDelay: number = 0;
        const unfilledPlacementIds: string[] = [];
        const campaigns: { [mediaId: string]: AuctionPlacement[] } = {};

        Object.keys(placements).forEach((placementId) => {
            const placement = placements[placementId];
            if (placement.isBannerPlacement()) {
                return;
            }

            let mediaId: string | undefined;
            let tracking: IPlacementTrackingV6 | undefined;

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
                const auctionPlacement: AuctionPlacement = new AuctionPlacement(placementId, mediaId, trackingUrls);

                if (campaigns[mediaId] === undefined) {
                    campaigns[mediaId] = [];
                }

                campaigns[mediaId].push(auctionPlacement);
            } else {
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

    public static parse(response: string, placements: { [id: string]: Placement }): IParsedAuctionResponse {
        let json: IRawAuctionV6Response;
        try {
            json = JsonParser.parse<IRawAuctionV6Response>(response);
        } catch (e) {
            SDKMetrics.reportMetricEvent(AuctionV6.FailedToParse);
            throw new Error('Failed to parse IRawAuctionV6Response ' + e.message);
        }

        let auctionId: string;
        if (!json.auctionId) {
            SDKMetrics.reportMetricEvent(AuctionV6.AuctionIdMissing);
            throw new Error('No auction ID found');
        }
        auctionId = json.auctionId;

        if (!json.placements) {
            SDKMetrics.reportMetricEvent(AuctionV6.PlacementsMissing);
            throw new Error('No placements found');
        }

        let auctionStatusCode: AuctionStatusCode = AuctionStatusCode.NORMAL;

        if (json.statusCode) {
            auctionStatusCode = json.statusCode;
        }

        const { campaigns, unfilledPlacementIds, refreshDelay } = this.determinePlacementFill(json, placements);

        const auctionResponses: AuctionResponse[] = [];

        Object.keys(campaigns).forEach((mediaId) => {
            try {
                auctionResponses.push(new AuctionResponse(campaigns[mediaId], json.media[mediaId], mediaId, json.correlationId, auctionStatusCode));
            } catch (e) {
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
