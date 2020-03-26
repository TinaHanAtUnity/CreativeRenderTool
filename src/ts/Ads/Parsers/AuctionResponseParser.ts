import { MediationLoadTrackingManager } from 'Ads/Managers/MediationLoadTrackingManager';
import { AdsConfiguration } from 'Ads/Models/AdsConfiguration';
import { AuctionPlacement } from 'Ads/Models/AuctionPlacement';
import { AuctionResponse, AuctionStatusCode, IPlacementTrackingV6, IRawAuctionV6Response } from 'Ads/Models/AuctionResponse';
import { ICampaignTrackingUrls } from 'Ads/Models/Campaign';
import { MacroUtil } from 'Ads/Utilities/MacroUtil';
import { JsonParser } from 'Core/Utilities/JsonParser';
import { Observable3 } from 'Core/Utilities/Observable';

export class AuctionResponseParser {

    public static parse(response: string, adsConfig: AdsConfiguration, handleNoFill: (placementId: string) => void, onAdPlanReceived: Observable3<number, number, number>, mediationLoadTracking: MediationLoadTrackingManager | undefined): AuctionResponse[] {
        let json: IRawAuctionV6Response;
        try {
            json = JsonParser.parse<IRawAuctionV6Response>(response);
        } catch (e) {
            throw new Error('Failed to parse IRawAuctionV6Response ' + e.message);
        }

        if (!json.auctionId) {
            throw new Error('No auction ID found');
        }

        if (!json.placements) {
            throw new Error('No placements found');
        }

        let auctionStatusCode: AuctionStatusCode = AuctionStatusCode.NORMAL;

        if (json.statusCode) {
            auctionStatusCode = json.statusCode;
        }

        const campaigns: { [mediaId: string]: AuctionPlacement[] } = {};
        let refreshDelay: number = 0;

        const placements = adsConfig.getPlacements();
        Object.keys(placements).forEach((placementId) => {
            const placement = placements[placementId];
            if (!placement.isBannerPlacement()) {
                let mediaId: string | undefined;
                let tracking: IPlacementTrackingV6 | undefined;

                const placementResponse = json.placements[placementId];
                if (placementResponse) {
                    if (placementResponse.mediaId) {
                        mediaId = json.placements[placementId].mediaId;
                    } else {
                        // Alert issue with media
                    }

                    if (placementResponse.tracking) {
                        tracking = json.placements[placementId].tracking;
                    } else {
                        // Alert issue with tracking
                    }
                }

                if (mediaId && tracking) {
                    const trackingTemplates: string[] = json.trackingTemplates;
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
                            if (index >= 0 && trackingTemplates.length >= index + 1) {
                                const tempTrackingUrls: string[] = trackingUrls[eventKey] || [];
                                const urlToTemplate = trackingTemplates[index];
                                tempTrackingUrls.push(MacroUtil.replaceMacro(urlToTemplate, params));
                                trackingUrls[eventKey] = tempTrackingUrls;
                            } else {
                                // Alert to out of bounds array
                            }
                        });
                    }));

                    const auctionPlacement: AuctionPlacement = new AuctionPlacement(placementId, mediaId, trackingUrls);

                    if (campaigns[mediaId] === undefined) {
                        campaigns[mediaId] = [];
                    }

                    campaigns[mediaId].push(auctionPlacement);
                } else {
                    handleNoFill(placementId);
                    refreshDelay = 3600; // Moved const from RefreshManager
                }
            } else {
                // Alert to banner placement being requested
            }
        });

        const auctionResponses: AuctionResponse[] = [];

        Object.keys(campaigns).forEach((mediaId) => {
            // TODO: Followup if this behavior is wanted - Should be controlled server-side
            const contentType = json.media[mediaId].contentType;
            const cacheTTL = json.media[mediaId].cacheTTL ? json.media[mediaId].cacheTTL : 3600;
            if (contentType && contentType !== 'comet/campaign' && typeof cacheTTL !== 'undefined' && cacheTTL > 0 && (cacheTTL < refreshDelay || refreshDelay === 0)) {
                refreshDelay = cacheTTL;
            }

            try {
                auctionResponses.push(new AuctionResponse(campaigns[mediaId], json.media[mediaId], mediaId, json.correlationId, auctionStatusCode, json.auctionId));
            } catch (e) {
                throw new Error('Failure creating Auction Response' + e.message);
            }
        });

        const campaignCount = auctionResponses.length;

        if (mediationLoadTracking) {
            mediationLoadTracking.reportMediaCount(campaignCount);
        }

        onAdPlanReceived.trigger(refreshDelay, auctionResponses.length, auctionStatusCode);

        return auctionResponses;
    }

}
