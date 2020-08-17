import { AuctionResponseParser } from 'Ads/Parsers/AuctionResponseParser';
import { AdRequestManager, INotCachedLoadedCampaign, IParsedPlacementPreloadData, AdRequestManagerError } from 'Ads/Managers/AdRequestManager';
import { INativeResponse } from 'Core/Managers/RequestManager';
import { IGameSessionCounters } from 'Ads/Utilities/GameSessionCounters';
import { IRequestPrivacy, ILegacyRequestPrivacy } from 'Ads/Models/RequestPrivacy';
import { IRawAuctionV6Response, AuctionStatusCode, AuctionResponse, IPlacementTrackingV6 } from 'Ads/Models/AuctionResponse';
import { JsonParser } from 'Core/Utilities/JsonParser';
import { Placement } from 'Ads/Models/Placement';
import { ILoadedCampaign } from 'Ads/Managers/CampaignManager';
import { TimeUtils } from 'Ads/Utilities/TimeUtils';
import { IPlacementIdMap } from 'Ads/Managers/PlacementManager';
import { Campaign, ICampaignTrackingUrls } from 'Ads/Models/Campaign';
import { CampaignParser } from 'Ads/Parsers/CampaignParser';
import { LoadV5 } from 'Ads/Utilities/SDKMetrics';

interface IParsedMediaAndTrackingIds {
    mediaId: string | undefined;
    tracking: IPlacementTrackingV6 | undefined;
}

export class AdRequestManagerV6 extends AdRequestManager {
    protected static LoadV5BaseUrlV6: string = 'https://auction-load.unityads.unity3d.com/v6/games';

    protected getBaseUrl(): string {
        return [
            AdRequestManagerV6.LoadV5BaseUrlV6,
            this._clientInfo.getGameId(),
            'requests'
        ].join('/');
    }

    protected parsePreloadResponse(response: INativeResponse, gameSessionCounters: IGameSessionCounters, requestPrivacy?: IRequestPrivacy | undefined, legacyRequestPrivacy?: ILegacyRequestPrivacy): Promise<void> {
        let json: IRawAuctionV6Response;
        try {
            json = JsonParser.parse<IRawAuctionV6Response>(response.response);
        } catch (e) {
            return Promise.reject(new AdRequestManagerError('Could not parse auction response JSON: ' + e.message, 'parse'));
        }

        if (!json.auctionId) {
            return Promise.reject(new AdRequestManagerError('No auction ID found', 'auction_id'));
        } else {
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

    protected parseLoadResponse(response: INativeResponse, placement: Placement, additionalPlacements: string[]): Promise<ILoadedCampaign | undefined> {
        // time
        let json: IRawAuctionV6Response;
        try {
            json = JsonParser.parse<IRawAuctionV6Response>(response.response);
        } catch (e) {
            return Promise.reject(new AdRequestManagerError('Could not parse auction response JSON: ' + e.message, 'parse'));
        }

        const auctionId = json.auctionId;
        if (!auctionId) {
            return Promise.reject(new AdRequestManagerError('No auction id', 'auction_id'));
        }

        const auctionStatusCode: number = json.statusCode || AuctionStatusCode.NORMAL;

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
            const additionalCampaigns = additionalPlacements.reduce<IPlacementIdMap<INotCachedLoadedCampaign | undefined>>((previousValue, currentValue, currentIndex) => {
                previousValue[currentValue] = loadedCampaigns[currentValue];
                return previousValue;
            }, {});
            this.onAdditionalPlacementsReady.trigger(placement.getGroupId(), additionalCampaigns);

            return loadedCampaigns[placement.getId()];
        }).then(
            (notCachedLoadedCampaign) => this.cacheCampaign(notCachedLoadedCampaign)
        );
    }

    private parsePreloadDataV6(response: IRawAuctionV6Response): IPlacementIdMap<IParsedPlacementPreloadData> | null {
        if (!response.preloadData) {
            return null;
        }

        const preloadData: IPlacementIdMap<IParsedPlacementPreloadData> = {};

        for (const placementPreloadData in response.preloadData) {
            if (response.preloadData.hasOwnProperty(placementPreloadData)) {
                const value = response.preloadData[placementPreloadData];
                preloadData[placementPreloadData] = {
                    ttlInSeconds: value.ttlInSeconds,
                    campaignAvailable: value.campaignAvailable,
                    data: response.encryptedPreloadData ? response.encryptedPreloadData[value.dataIndex] || '' : ''
                };
            }
        }

        return preloadData;
    }

    private parseCampaignV6(response: IRawAuctionV6Response, mediaId: string | undefined, auctionStatusCode: AuctionStatusCode): Promise<Campaign | undefined> {
        if (!mediaId) {
            return Promise.resolve(undefined);
        }

        if (this._currentSession === null) {
            throw new AdRequestManagerError('Session is not set', 'no_session');
        }

        let auctionResponse: AuctionResponse;
        let parser: CampaignParser;

        try {
            auctionResponse = new AuctionResponse([], response.media[mediaId], mediaId, response.correlationId, auctionStatusCode);
        } catch (err) {
            return Promise.reject(new AdRequestManagerError('Failed to prepare AuctionPlacement and AuctionResponse', 'prep'));
        }

        try {
            parser = this.getCampaignParser(auctionResponse.getContentType());
        } catch (err) {
            return Promise.reject(new AdRequestManagerError('Failed to create parser', 'create_parser'));
        }

        return parser.parse(auctionResponse, this._currentSession).catch((err) => {
            throw new AdRequestManagerError('Failed to parse', 'campaign_parse');
        }).then((campaign) => {
            if (campaign) {
                campaign.setMediaId(auctionResponse.getMediaId());
                campaign.setIsLoadEnabled(true);
                return campaign;
            } else {
                throw new AdRequestManagerError('Failed to read campaign', 'no_campaign');
            }
        });
    }

    private parseTrackingUrlsV6(response: IRawAuctionV6Response, tracking: IPlacementTrackingV6 | undefined, auctionStatusCode: AuctionStatusCode): Promise<ICampaignTrackingUrls | undefined> {
        if (!response.trackingTemplates) {
            return Promise.resolve(undefined);
        }

        let trackingUrls: ICampaignTrackingUrls | undefined;

        try {
            if (tracking) {
                trackingUrls = AuctionResponseParser.constructTrackingUrls(response.trackingTemplates, tracking);
            }
        } catch (err) {
            return Promise.reject(new AdRequestManagerError('Failed tracking url', 'tracking'));
        }

        return Promise.resolve(trackingUrls);
    }

    private createNotCachedLoadedCampaignV6(response: IRawAuctionV6Response, campaign: Campaign | undefined, tracking: IPlacementTrackingV6 | undefined, auctionStatusCode: AuctionStatusCode): Promise<INotCachedLoadedCampaign | undefined> {
        return Promise.all([
            this.parseTrackingUrlsV6(response, tracking, auctionStatusCode)
        ]).then(([trackingUrls]) => {
            if (!campaign || !trackingUrls) {
                return Promise.resolve(undefined);
            }
            return Promise.resolve({ notCachedCampaign: campaign, notCachedTrackingUrls: trackingUrls });
        });
    }

    private parseMediaAndTrackingUrlsV6(response: IRawAuctionV6Response, placement: Placement, auctionStatusCode: AuctionStatusCode): Promise<IParsedMediaAndTrackingIds> {
        const placementId = placement.getId();
        let mediaId: string | undefined;
        let tracking: IPlacementTrackingV6 | undefined;

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
        } catch (err) {
            return Promise.reject(new AdRequestManagerError('Failed to get media and tracking url', 'media'));
        }

        return Promise.resolve({
            mediaId,
            tracking
        });
    }

    private parseAllPlacementsV6(json: IRawAuctionV6Response, allPlacements: Placement[], auctionStatusCode: AuctionStatusCode, errorMetric: LoadV5): Promise<IPlacementIdMap<INotCachedLoadedCampaign | undefined>> {
        let allMedia: string[] = [];
        let campaignMap: IPlacementIdMap<Campaign | undefined> = {};
        let parsedMap: IPlacementIdMap<IParsedMediaAndTrackingIds> = {};

        return Promise.all(allPlacements.map((plc) => this.parseMediaAndTrackingUrlsV6(json, plc, auctionStatusCode))).then(medias => {
            parsedMap = medias.reduce<IPlacementIdMap<IParsedMediaAndTrackingIds>>((previousValue, currentValue, currentIndex) => {
                previousValue[allPlacements[currentIndex].getId()] = currentValue;
                return previousValue;
            }, {});

            allMedia = medias.reduce<string[]>((previousValue, currentValue, currentIndex) => {
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
            campaignMap = allCampaigns.reduce<IPlacementIdMap<Campaign | undefined>>((previousValue, currentValue, currentIndex) => {
                previousValue[allMedia[currentIndex]] = currentValue;
                return previousValue;
            }, {});

            return Promise.all(
                // Skip caching for those campaigns since we don't need them immediately
                allPlacements.map((x) => this.createNotCachedLoadedCampaignV6(json, parsedMap[x.getId()].mediaId === undefined ? undefined : campaignMap[parsedMap[x.getId()].mediaId!], parsedMap[x.getId()].tracking, auctionStatusCode).catch((err) => {
                    this.handleError(errorMetric, err);
                    return undefined;
                }
            )));
        }).then((loadedCampaigns) => {
            return loadedCampaigns.reduce<IPlacementIdMap<INotCachedLoadedCampaign | undefined>>((previousValue, currentValue, currentIndex) => {
                previousValue[allPlacements[currentIndex].getId()] = currentValue;
                return previousValue;
            }, {});
        });
    }

    protected parseReloadResponse(response: INativeResponse, placementsToLoad: Placement[], gameSessionCounters: IGameSessionCounters, requestPrivacy?: IRequestPrivacy | undefined, legacyRequestPrivacy?: ILegacyRequestPrivacy): Promise<void> {
        let json: IRawAuctionV6Response;
        try {
            json = JsonParser.parse<IRawAuctionV6Response>(response.response);
        } catch (e) {
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

        const auctionStatusCode: number = json.statusCode || AuctionStatusCode.NORMAL;

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
                } else {
                    this.onNoFill.trigger(placementId);
                }
            });
        });
    }
}
