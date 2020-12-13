import { AuctionResponseParser } from 'Ads/Parsers/AuctionResponseParser';
import { AdRequestManager, AdRequestManagerError } from 'Ads/Managers/AdRequestManager';
import { AuctionStatusCode, AuctionResponse } from 'Ads/Models/AuctionResponse';
import { JsonParser } from 'Core/Utilities/JsonParser';
import { TimeUtils } from 'Ads/Utilities/TimeUtils';
import { LoadV5 } from 'Ads/Utilities/SDKMetrics';
export class AdRequestManagerV6 extends AdRequestManager {
    getBaseUrl() {
        return [
            AdRequestManagerV6.LoadV5BaseUrlV6,
            this._clientInfo.getGameId(),
            'requests'
        ].join('/');
    }
    parsePreloadResponse(response, gameSessionCounters, requestPrivacy, legacyRequestPrivacy) {
        let json;
        try {
            json = JsonParser.parse(response.response);
        }
        catch (e) {
            return Promise.reject(new AdRequestManagerError('Could not parse auction response JSON: ' + e.message, 'parse'));
        }
        if (!json.auctionId) {
            return Promise.reject(new AdRequestManagerError('No auction ID found', 'auction_id'));
        }
        else {
            this._lastAuctionId = json.auctionId;
        }
        this._preloadData = this.parsePreloadDataV6(json);
        this.updatePreloadDataExpiration();
        this._currentSession = this._sessionManager.create(json.auctionId);
        this._currentSession.setGameSessionCounters(gameSessionCounters);
        this._currentSession.setPrivacy(requestPrivacy);
        this._currentSession.setLegacyPrivacy(legacyRequestPrivacy);
        this._currentSession.setDeviceFreeSpace(this._deviceFreeSpace);
        return Promise.resolve();
    }
    parseLoadResponse(response, placement, additionalPlacements) {
        // time
        let json;
        try {
            json = JsonParser.parse(response.response);
        }
        catch (e) {
            return Promise.reject(new AdRequestManagerError('Could not parse auction response JSON: ' + e.message, 'parse'));
        }
        const auctionId = json.auctionId;
        if (!auctionId) {
            return Promise.reject(new AdRequestManagerError('No auction id', 'auction_id'));
        }
        const auctionStatusCode = json.statusCode || AuctionStatusCode.NORMAL;
        if (auctionStatusCode === AuctionStatusCode.FREQUENCY_CAP_REACHED) {
            const nowInMilliSec = Date.now();
            this._frequencyCapTimestamp = nowInMilliSec + TimeUtils.getNextUTCDayDeltaSeconds(nowInMilliSec) * 1000;
            return Promise.reject(new AdRequestManagerError('Frequency cap reached first', 'frequency_cap_first'));
        }
        if (!('placements' in json)) {
            return Promise.reject(new AdRequestManagerError('No placement', 'no_plc'));
        }
        const allPlacements = [
            placement,
            ...additionalPlacements.map((x) => this._adsConfig.getPlacement(x))
        ];
        return this.parseAllPlacementsV6(json, allPlacements, auctionStatusCode, LoadV5.LoadRequestParseCampaignFailed).then((loadedCampaigns) => {
            const additionalCampaigns = additionalPlacements.reduce((previousValue, currentValue, currentIndex) => {
                previousValue[currentValue] = loadedCampaigns[currentValue];
                return previousValue;
            }, {});
            this.onAdditionalPlacementsReady.trigger(placement.getGroupId(), additionalCampaigns);
            return loadedCampaigns[placement.getId()];
        }).then((notCachedLoadedCampaign) => this.cacheCampaign(notCachedLoadedCampaign));
    }
    parsePreloadDataV6(response) {
        if (!response.preloadData) {
            return null;
        }
        const preloadData = {};
        this._encryptedPreloadData = response.encryptedPreloadData;
        for (const placementPreloadData in response.preloadData) {
            if (response.preloadData.hasOwnProperty(placementPreloadData)) {
                const value = response.preloadData[placementPreloadData];
                preloadData[placementPreloadData] = {
                    ttlInSeconds: value.ttlInSeconds,
                    campaignAvailable: value.campaignAvailable,
                    dataIndex: value.dataIndex
                };
            }
        }
        return preloadData;
    }
    parseCampaignV6(response, mediaId, auctionStatusCode) {
        if (!mediaId) {
            return Promise.resolve(undefined);
        }
        if (this._currentSession === null) {
            throw new AdRequestManagerError('Session is not set', 'no_session');
        }
        let auctionResponse;
        let parser;
        try {
            auctionResponse = new AuctionResponse([], response.media[mediaId], mediaId, response.correlationId, auctionStatusCode);
        }
        catch (err) {
            return Promise.reject(new AdRequestManagerError('Failed to prepare AuctionPlacement and AuctionResponse', 'prep'));
        }
        try {
            parser = this.getCampaignParser(auctionResponse.getContentType());
        }
        catch (err) {
            return Promise.reject(new AdRequestManagerError('Failed to create parser', 'create_parser'));
        }
        return parser.parse(auctionResponse, this._currentSession).catch((err) => {
            throw new AdRequestManagerError('Failed to parse', 'campaign_parse');
        }).then((campaign) => {
            if (campaign) {
                campaign.setMediaId(auctionResponse.getMediaId());
                campaign.setIsLoadEnabled(true);
                return campaign;
            }
            else {
                throw new AdRequestManagerError('Failed to read campaign', 'no_campaign');
            }
        });
    }
    parseTrackingUrlsV6(response, tracking, auctionStatusCode) {
        if (!response.trackingTemplates) {
            return Promise.resolve(undefined);
        }
        let trackingUrls;
        try {
            if (tracking) {
                trackingUrls = AuctionResponseParser.constructTrackingUrls(response.trackingTemplates, tracking);
            }
        }
        catch (err) {
            return Promise.reject(new AdRequestManagerError('Failed tracking url', 'tracking'));
        }
        return Promise.resolve(trackingUrls);
    }
    createNotCachedLoadedCampaignV6(response, campaign, tracking, auctionStatusCode) {
        return Promise.all([
            this.parseTrackingUrlsV6(response, tracking, auctionStatusCode)
        ]).then(([trackingUrls]) => {
            if (!campaign || !trackingUrls) {
                return Promise.resolve(undefined);
            }
            return Promise.resolve({ notCachedCampaign: campaign, notCachedTrackingUrls: trackingUrls });
        });
    }
    parseMediaAndTrackingUrlsV6(response, placement, auctionStatusCode) {
        const placementId = placement.getId();
        let mediaId;
        let tracking;
        try {
            if (response.placements.hasOwnProperty(placementId)) {
                if (response.placements[placementId].hasOwnProperty('mediaId')) {
                    mediaId = response.placements[placementId].mediaId;
                }
            }
            if (response.placements.hasOwnProperty(placementId)) {
                if (response.placements[placementId].hasOwnProperty('tracking')) {
                    tracking = response.placements[placementId].tracking;
                }
            }
        }
        catch (err) {
            return Promise.reject(new AdRequestManagerError('Failed to get media and tracking url', 'media'));
        }
        return Promise.resolve({
            mediaId,
            tracking
        });
    }
    parseAllPlacementsV6(json, allPlacements, auctionStatusCode, errorMetric) {
        let allMedia = [];
        let campaignMap = {};
        let parsedMap = {};
        return Promise.all(allPlacements.map((plc) => this.parseMediaAndTrackingUrlsV6(json, plc, auctionStatusCode))).then(medias => {
            parsedMap = medias.reduce((previousValue, currentValue, currentIndex) => {
                previousValue[allPlacements[currentIndex].getId()] = currentValue;
                return previousValue;
            }, {});
            allMedia = medias.reduce((previousValue, currentValue, currentIndex) => {
                if (currentValue.mediaId) {
                    previousValue.push(currentValue.mediaId);
                }
                return previousValue;
            }, []);
            allMedia = allMedia.filter((val, index) => allMedia.indexOf(val) === index);
            return Promise.all(allMedia.map((media) => this.parseCampaignV6(json, media, auctionStatusCode).catch((err) => {
                this.handleError(errorMetric, err);
                return undefined;
            })));
        }).then(allCampaigns => {
            campaignMap = allCampaigns.reduce((previousValue, currentValue, currentIndex) => {
                previousValue[allMedia[currentIndex]] = currentValue;
                return previousValue;
            }, {});
            return Promise.all(
            // Skip caching for those campaigns since we don't need them immediately
            allPlacements.map((x) => this.createNotCachedLoadedCampaignV6(json, parsedMap[x.getId()].mediaId === undefined ? undefined : campaignMap[parsedMap[x.getId()].mediaId], parsedMap[x.getId()].tracking, auctionStatusCode).catch((err) => {
                this.handleError(errorMetric, err);
                return undefined;
            })));
        }).then((loadedCampaigns) => {
            return loadedCampaigns.reduce((previousValue, currentValue, currentIndex) => {
                previousValue[allPlacements[currentIndex].getId()] = currentValue;
                return previousValue;
            }, {});
        });
    }
    parseReloadResponse(response, placementsToLoad, gameSessionCounters, requestPrivacy, legacyRequestPrivacy) {
        let json;
        try {
            json = JsonParser.parse(response.response);
        }
        catch (e) {
            return Promise.reject(new AdRequestManagerError('Could not parse auction response JSON: ' + e.message, 'parse'));
        }
        const auctionId = json.auctionId;
        if (!auctionId) {
            return Promise.reject(new AdRequestManagerError('No auction id', 'auction_id'));
        }
        this._preloadData = this.parsePreloadDataV6(json);
        this.updatePreloadDataExpiration();
        this._currentSession = this._sessionManager.create(auctionId);
        this._currentSession.setGameSessionCounters(gameSessionCounters);
        this._currentSession.setPrivacy(requestPrivacy);
        this._currentSession.setLegacyPrivacy(legacyRequestPrivacy);
        this._currentSession.setDeviceFreeSpace(this._deviceFreeSpace);
        const auctionStatusCode = json.statusCode || AuctionStatusCode.NORMAL;
        if (!('placements' in json)) {
            placementsToLoad.forEach((x) => this.onNoFill.trigger(x.getId()));
            return Promise.resolve();
        }
        return this.parseAllPlacementsV6(json, placementsToLoad, auctionStatusCode, LoadV5.ReloadRequestParseCampaignFailed)
            .then((notCachedLoadedCampaigns) => {
            return Promise.all(placementsToLoad.map((placement) => {
                const placementId = placement.getId();
                return this.cacheCampaign(notCachedLoadedCampaigns[placementId]);
            }));
        }).then((loadedCampaigns) => {
            loadedCampaigns.forEach((loadedCampaign, index) => {
                const placementId = placementsToLoad[index].getId();
                if (loadedCampaign !== undefined) {
                    this._reloadResults[placementId] = loadedCampaign;
                    this.onCampaign.trigger(placementId, loadedCampaign.campaign, loadedCampaign.trackingUrls);
                }
                else {
                    this.onNoFill.trigger(placementId);
                }
            });
        });
    }
}
AdRequestManagerV6.LoadV5BaseUrlV6 = 'https://auction-load.unityads.unity3d.com/v6/games';
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQWRSZXF1ZXN0TWFuYWdlclY2LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vc3JjL3RzL0Fkcy9NYW5hZ2Vycy9BZFJlcXVlc3RNYW5hZ2VyVjYudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFFLHFCQUFxQixFQUFFLE1BQU0sbUNBQW1DLENBQUM7QUFDMUUsT0FBTyxFQUFFLGdCQUFnQixFQUF5RCxxQkFBcUIsRUFBRSxNQUFNLCtCQUErQixDQUFDO0FBSS9JLE9BQU8sRUFBeUIsaUJBQWlCLEVBQUUsZUFBZSxFQUF3QixNQUFNLDRCQUE0QixDQUFDO0FBQzdILE9BQU8sRUFBRSxVQUFVLEVBQUUsTUFBTSwyQkFBMkIsQ0FBQztBQUd2RCxPQUFPLEVBQUUsU0FBUyxFQUFFLE1BQU0seUJBQXlCLENBQUM7QUFJcEQsT0FBTyxFQUFFLE1BQU0sRUFBRSxNQUFNLDBCQUEwQixDQUFDO0FBT2xELE1BQU0sT0FBTyxrQkFBbUIsU0FBUSxnQkFBZ0I7SUFHMUMsVUFBVTtRQUNoQixPQUFPO1lBQ0gsa0JBQWtCLENBQUMsZUFBZTtZQUNsQyxJQUFJLENBQUMsV0FBVyxDQUFDLFNBQVMsRUFBRTtZQUM1QixVQUFVO1NBQ2IsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUM7SUFDaEIsQ0FBQztJQUVTLG9CQUFvQixDQUFDLFFBQXlCLEVBQUUsbUJBQXlDLEVBQUUsY0FBNEMsRUFBRSxvQkFBNEM7UUFDM0wsSUFBSSxJQUEyQixDQUFDO1FBQ2hDLElBQUk7WUFDQSxJQUFJLEdBQUcsVUFBVSxDQUFDLEtBQUssQ0FBd0IsUUFBUSxDQUFDLFFBQVEsQ0FBQyxDQUFDO1NBQ3JFO1FBQUMsT0FBTyxDQUFDLEVBQUU7WUFDUixPQUFPLE9BQU8sQ0FBQyxNQUFNLENBQUMsSUFBSSxxQkFBcUIsQ0FBQyx5Q0FBeUMsR0FBRyxDQUFDLENBQUMsT0FBTyxFQUFFLE9BQU8sQ0FBQyxDQUFDLENBQUM7U0FDcEg7UUFF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