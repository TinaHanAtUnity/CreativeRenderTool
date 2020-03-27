import { AuctionPlacement } from 'Ads/Models/AuctionPlacement';
import { AuctionResponse, AuctionStatusCode, IPlacementTrackingV6, IRawAuctionV6Response } from 'Ads/Models/AuctionResponse';
import { ICampaignTrackingUrls } from 'Ads/Models/Campaign';
import { Placement } from 'Ads/Models/Placement';
import { MacroUtil } from 'Ads/Utilities/MacroUtil';
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

export class AuctionResponseParser {

    private static constructTrackingUrls(trackingTemplates: string[], tracking: IPlacementTrackingV6): ICampaignTrackingUrls {
        const trackingUrls: ICampaignTrackingUrls = {};

        const globalParams = tracking.params;
        const events = tracking.events;

        Object.keys(events).forEach(((eventKey) => {
            const eventTracking = events[eventKey];
            const params = {
                ...(eventTracking.params || {}),
                ...globalParams
            };
            eventTracking.urlIndices.forEach((index) => {
                if (index >= 0 && index < trackingTemplates.length) {
                    const tempTrackingUrls: string[] = trackingUrls[eventKey] || [];
                    const urlToTemplate = trackingTemplates[index];
                    tempTrackingUrls.push(MacroUtil.replaceMacro(urlToTemplate, params));
                    trackingUrls[eventKey] = tempTrackingUrls;
                } else {
                    // Alert to out of bounds array
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
            if (!placement.isBannerPlacement()) {
                let mediaId: string | undefined;
                let tracking: IPlacementTrackingV6 | undefined;

                const placementResponse = responseJson.placements[placementId];
                if (placementResponse) {
                    if (placementResponse.mediaId) {
                        mediaId = responseJson.placements[placementId].mediaId;
                    } else {
                        // Alert issue with media
                    }

                    if (placementResponse.tracking) {
                        tracking = responseJson.placements[placementId].tracking;
                    } else {
                        // Alert issue with tracking
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
                    refreshDelay = 3600; // Moved const from RefreshManager
                }
            } else {
                // Alert to banner placement being requested
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
            throw new Error('Failed to parse IRawAuctionV6Response ' + e.message);
        }

        let auctionId: string;
        if (!json.auctionId) {
            throw new Error('No auction ID found');
        }
        auctionId = json.auctionId;

        if (!json.placements) {
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
