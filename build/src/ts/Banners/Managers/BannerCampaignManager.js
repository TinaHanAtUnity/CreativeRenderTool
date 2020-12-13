import { AuctionResponse } from 'Ads/Models/AuctionResponse';
import { Session } from 'Ads/Models/Session';
import { GameSessionCounters } from 'Ads/Utilities/GameSessionCounters';
import { BannerCampaignParserFactory } from 'Banners/Parsers/BannerCampaignParserFactory';
import { BannerAuctionRequest } from 'Banners/Networking/BannerAuctionRequest';
import { RequestManager, AuctionProtocol } from 'Core/Managers/RequestManager';
import { JsonParser } from 'Core/Utilities/JsonParser';
import { AuctionPlacement } from 'Ads/Models/AuctionPlacement';
import { SessionDiagnostics } from 'Ads/Utilities/SessionDiagnostics';
export class NoFillError extends Error {
}
export class BannerCampaignManager {
    constructor(platform, core, coreConfig, adsConfig, sessionManager, adMobSignalFactory, request, clientInfo, deviceInfo, metaDataManager, privacySDK, userPrivacyManager) {
        this._platform = platform;
        this._core = core;
        this._coreConfig = coreConfig;
        this._adsConfig = adsConfig;
        this._sessionManager = sessionManager;
        this._request = request;
        this._clientInfo = clientInfo;
        this._deviceInfo = deviceInfo;
        this._metaDataManager = metaDataManager;
        this._adMobSignalFactory = adMobSignalFactory;
        this._privacySDK = privacySDK;
        this._userPrivacyManager = userPrivacyManager;
    }
    request(placement, bannerSize, nofillRetry) {
        GameSessionCounters.addAdRequest();
        const request = new BannerAuctionRequest({
            platform: this._platform,
            core: this._core,
            adMobSignalFactory: this._adMobSignalFactory,
            coreConfig: this._coreConfig,
            adsConfig: this._adsConfig,
            clientInfo: this._clientInfo,
            deviceInfo: this._deviceInfo,
            metaDataManager: this._metaDataManager,
            request: this._request,
            sessionManager: this._sessionManager,
            bannerSize: bannerSize,
            privacySDK: this._privacySDK,
            userPrivacyManager: this._userPrivacyManager
        });
        request.addPlacement(placement);
        request.setTimeout(3000);
        return request.request()
            .then((response) => {
            const nativeResponse = request.getNativeResponse();
            if (nativeResponse) {
                switch (RequestManager.getAuctionProtocol()) {
                    case AuctionProtocol.V4:
                        return this.parseBannerCampaign(nativeResponse, placement);
                    case AuctionProtocol.V5:
                    default:
                        return this.parseAuctionV5BannerCampaign(nativeResponse, placement);
                }
            }
            throw new Error('Empty campaign response');
        })
            .catch((e) => {
            return this.handleError(e, 'banner_auction_request_failed');
        })
            .then((campaign) => {
            return campaign;
        });
    }
    setPreviousPlacementId(id) {
        this._previousPlacementId = id;
    }
    getPreviousPlacementId() {
        return this._previousPlacementId;
    }
    handleError(e, diagnostic) {
        return Promise.reject(e);
    }
    parseBannerCampaign(response, placement) {
        const json = JsonParser.parse(response.response);
        const session = new Session(json.auctionId);
        if ('placements' in json) {
            const mediaId = json.placements[placement.getId()];
            if (mediaId) {
                const auctionPlacement = new AuctionPlacement(placement.getId(), mediaId);
                const auctionResponse = new AuctionResponse([auctionPlacement], json.media[mediaId], mediaId, json.correlationId);
                return this.handleBannerCampaign(auctionResponse, session);
            }
            else {
                const e = new NoFillError(`No fill for placement ${placement.getId()}`);
                e.response = response;
                return Promise.reject(e);
            }
        }
        else {
            const e = new Error('No placements found');
            this._core.Sdk.logError(e.message);
            return Promise.reject(e);
        }
    }
    parseAuctionV5BannerCampaign(response, placement) {
        const json = JsonParser.parse(response.response);
        const session = new Session(json.auctionId);
        if ('placements' in json) {
            const placementId = placement.getId();
            if (placement.isBannerPlacement()) {
                let mediaId;
                if (json.placements.hasOwnProperty(placementId)) {
                    if (json.placements[placementId].hasOwnProperty('mediaId')) {
                        mediaId = json.placements[placementId].mediaId;
                    }
                    else {
                        SessionDiagnostics.trigger('missing_auction_v5_banner_mediaid', {
                            placementId: placement
                        }, session);
                    }
                }
                else {
                    SessionDiagnostics.trigger('missing_auction_v5_banner_placement', {
                        placementId: placement
                    }, session);
                }
                if (mediaId) {
                    let trackingUrls = {};
                    if (json.placements[placementId].hasOwnProperty('trackingId')) {
                        const trackingId = json.placements[placementId].trackingId;
                        if (json.tracking[trackingId]) {
                            trackingUrls = json.tracking[trackingId];
                        }
                        else {
                            SessionDiagnostics.trigger('invalid_auction_v5_banner_tracking_id', {
                                mediaId: mediaId,
                                trackingId: trackingId
                            }, session);
                            throw new Error('Invalid tracking ID ' + trackingId);
                        }
                    }
                    else {
                        SessionDiagnostics.trigger('missing_auction_v5_banner_tracking_id', {
                            mediaId: mediaId
                        }, session);
                        throw new Error('Missing tracking ID');
                    }
                    const auctionPlacement = new AuctionPlacement(placementId, mediaId, trackingUrls);
                    const auctionResponse = new AuctionResponse([auctionPlacement], json.media[mediaId], mediaId, json.correlationId);
                    return this.handleV5BannerCampaign(auctionResponse, session, trackingUrls);
                }
                else {
                    const e = new NoFillError(`No fill for placement ${placementId}`);
                    this._core.Sdk.logError(e.message);
                    return Promise.reject(e);
                }
            }
            else {
                const e = new Error(`Placement ${placementId} is not a banner placement`);
                this._core.Sdk.logError(e.message);
                return Promise.reject(e);
            }
        }
        else {
            const e = new Error('No placements found in V5 campaign json.');
            this._core.Sdk.logError(e.message);
            return Promise.reject(e);
        }
    }
    handleV5BannerCampaign(response, session, trackingUrls) {
        this._core.Sdk.logDebug('Parsing campaign ' + response.getContentType() + ': ' + response.getContent());
        const parser = this.getCampaignParser(response.getContentType());
        return parser.parse(response, session).then((campaign) => {
            campaign.setMediaId(response.getMediaId());
            campaign.setTrackingUrls(trackingUrls);
            return campaign;
        });
    }
    handleBannerCampaign(response, session) {
        this._core.Sdk.logDebug('Parsing campaign ' + response.getContentType() + ': ' + response.getContent());
        const parser = this.getCampaignParser(response.getContentType());
        return parser.parse(response, session).then((campaign) => {
            campaign.setMediaId(response.getMediaId());
            return campaign;
        });
    }
    getCampaignParser(contentType) {
        return BannerCampaignParserFactory.getCampaignParser(this._platform, contentType);
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQmFubmVyQ2FtcGFpZ25NYW5hZ2VyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vc3JjL3RzL0Jhbm5lcnMvTWFuYWdlcnMvQmFubmVyQ2FtcGFpZ25NYW5hZ2VyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUdBLE9BQU8sRUFBRSxlQUFlLEVBQW9CLE1BQU0sNEJBQTRCLENBQUM7QUFHL0UsT0FBTyxFQUFFLE9BQU8sRUFBRSxNQUFNLG9CQUFvQixDQUFDO0FBRTdDLE9BQU8sRUFBRSxtQkFBbUIsRUFBRSxNQUFNLG1DQUFtQyxDQUFDO0FBQ3hFLE9BQU8sRUFBRSwyQkFBMkIsRUFBRSxNQUFNLDZDQUE2QyxDQUFDO0FBQzFGLE9BQU8sRUFBRSxvQkFBb0IsRUFBRSxNQUFNLHlDQUF5QyxDQUFDO0FBSS9FLE9BQU8sRUFBbUIsY0FBYyxFQUFFLGVBQWUsRUFBRSxNQUFNLDhCQUE4QixDQUFDO0FBSWhHLE9BQU8sRUFBRSxVQUFVLEVBQUUsTUFBTSwyQkFBMkIsQ0FBQztBQUN2RCxPQUFPLEVBQUUsZ0JBQWdCLEVBQUUsTUFBTSw2QkFBNkIsQ0FBQztBQUMvRCxPQUFPLEVBQUUsa0JBQWtCLEVBQUUsTUFBTSxrQ0FBa0MsQ0FBQztBQUt0RSxNQUFNLE9BQU8sV0FBWSxTQUFRLEtBQUs7Q0FFckM7QUFpQkQsTUFBTSxPQUFPLHFCQUFxQjtJQWlCOUIsWUFBWSxRQUFrQixFQUFFLElBQWMsRUFBRSxVQUE2QixFQUFFLFNBQTJCLEVBQUUsY0FBOEIsRUFBRSxrQkFBc0MsRUFBRSxPQUF1QixFQUFFLFVBQXNCLEVBQUUsVUFBc0IsRUFBRSxlQUFnQyxFQUFFLFVBQXNCLEVBQUUsa0JBQXNDO1FBQ3pWLElBQUksQ0FBQyxTQUFTLEdBQUcsUUFBUSxDQUFDO1FBQzFCLElBQUksQ0FBQyxLQUFLLEdBQUcsSUFBSSxDQUFDO1FBQ2xCLElBQUksQ0FBQyxXQUFXLEdBQUcsVUFBVSxDQUFDO1FBQzlCLElBQUksQ0FBQyxVQUFV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