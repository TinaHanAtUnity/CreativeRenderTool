import { CampaignManager } from 'Managers/CampaignManager';
import { NativeBridge } from 'Native/NativeBridge';
import { Configuration } from 'Models/Configuration';
import { AssetManager } from 'Managers/AssetManager';
import { SessionManager } from 'Managers/SessionManager';
import { INativeResponse, Request } from 'Utilities/Request';
import { ClientInfo } from 'Models/ClientInfo';
import { DeviceInfo } from 'Models/DeviceInfo';
import { VastParser } from 'Utilities/VastParser';
import { MetaDataManager } from 'Managers/MetaDataManager';
import { JsonParser } from 'Utilities/JsonParser';
import { MRAIDCampaign } from 'Models/MRAIDCampaign';
import { PerformanceCampaign } from 'Models/PerformanceCampaign';
import { DisplayInterstitialCampaign } from 'Models/DisplayInterstitialCampaign';
import { Url } from 'Utilities/Url';
import { Campaign } from 'Models/Campaign';
import { WebViewError } from 'Errors/WebViewError';
import { CacheStatus } from 'Utilities/Cache';
import { CampaignRefreshManager } from 'Managers/CampaignRefreshManager';
import { DiagnosticError } from 'Errors/DiagnosticError';

export class AuctionCampaignManager extends CampaignManager {

    public static setAuctionBaseUrl(baseUrl: string): void {
        AuctionCampaignManager.AuctionBaseUrl = baseUrl + '/v4/games';
    }

    private static AuctionBaseUrl: string = 'https://auction.unityads.unity3d.com/v4/games';

    constructor(nativeBridge: NativeBridge, configuration: Configuration, assetManager: AssetManager, sessionManager: SessionManager, request: Request, clientInfo: ClientInfo, deviceInfo: DeviceInfo, vastParser: VastParser, metaDataManager: MetaDataManager) {
        super(nativeBridge, configuration, assetManager, sessionManager, request, clientInfo, deviceInfo, vastParser, metaDataManager);
    }

    public request(): Promise<INativeResponse | void> {
        return super.request().then(response => {
            if(response) {
                return this.parsePlcCampaigns(response);
            }
            throw new WebViewError('Empty campaign response', 'CampaignRequestError');
        }).then(() => {
            this._requesting = false;
        }).catch((error) => {
            this._requesting = false;
            return this.handlePlcError(error, this._configuration.getPlacementIds());
        });
    }

    protected getBaseUrl(): string {
        return [
            AuctionCampaignManager.AuctionBaseUrl,
            this._clientInfo.getGameId(),
            'requests'
        ].join('/');
    }

    protected createRequestUrl(): Promise<string> {
        return super.createRequestUrl().then((url) => {
            url = Url.addParameters(url, {
                gamerId: this.getParameter('gamerId', this._configuration.getGamerId(), 'string')
            });

            return url;
        });
    }

    protected createRequestBody(): Promise<any> {
        return super.createRequestBody().then((body) => {
            const placementRequest: any = {};

            const placements = this._configuration.getPlacements();
            for(const placement in placements) {
                if(placements.hasOwnProperty(placement)) {
                    placementRequest[placement] = {
                        adTypes: placements[placement].getAdTypes(),
                        allowSkip: placements[placement].allowSkip()
                    };
                }
            }

            body.placements = placementRequest;
            body.properties = this._configuration.getProperties();

            return body;
        });
    }

    private parsePlcCampaigns(response: INativeResponse) {
        const json: any = CampaignManager.CampaignResponse ? JsonParser.parse(CampaignManager.CampaignResponse) : JsonParser.parse(response.response);

        if('placements' in json) {
            const fill: { [mediaId: string]: string[] } = {};
            const noFill: string[] = [];

            const placements = this._configuration.getPlacements();
            for(const placement in placements) {
                if(placements.hasOwnProperty(placement)) {
                    const mediaId: string = json.placements[placement];

                    if(mediaId) {
                        if(fill[mediaId]) {
                            fill[mediaId].push(placement);
                        } else {
                            fill[mediaId] = [placement];
                        }
                    } else {
                        noFill.push(placement);
                    }
                }
            }

            let refreshDelay: number = 0;
            const promises: Array<Promise<void>> = [];

            for(const placement of noFill) {
                promises.push(this.handlePlcNoFill(placement));
                refreshDelay = CampaignRefreshManager.NoFillDelay;
            }

            for(const mediaId in fill) {
                if(fill.hasOwnProperty(mediaId)) {
                    promises.push(this.handlePlcCampaign(fill[mediaId],
                        json.media[mediaId].contentType,
                        json.media[mediaId].content,
                        json.media[mediaId].trackingUrls,
                        json.media[mediaId].cacheTTL,
                        json.media[mediaId].adType,
                        json.media[mediaId].creativeId,
                        json.media[mediaId].seatId,
                        json.correlationId).catch(error => {
                            if(error === CacheStatus.STOPPED) {
                                return Promise.resolve();
                            }

                            return this.handlePlcError(error, fill[mediaId]);
                    }));

                    // todo: the only reason to calculate ad plan behavior like this is to match the old yield ad plan behavior, this should be refactored in the future
                    const contentType = json.media[mediaId].contentType;
                    const cacheTTL = json.media[mediaId].cacheTTL ? json.media[mediaId].cacheTTL : 3600;
                    if(contentType && contentType !== 'comet/campaign' && cacheTTL > 0 && (cacheTTL < refreshDelay || refreshDelay === 0)) {
                        refreshDelay = cacheTTL;
                    }
                }
            }

            this.onAdPlanReceived.trigger(refreshDelay);

            return Promise.all(promises).catch(error => {
                return this.handlePlcError(error, this._configuration.getPlacementIds());
            });
        } else {
            return this.handlePlcError(new Error('No placements found'), this._configuration.getPlacementIds());
        }
    }

    private handlePlcCampaign(placements: string[], contentType: string, content: string, trackingUrls?: { [eventName: string]: string[] }, cacheTTL?: number, adType?: string, creativeId?: string, seatId?: number, correlationId?: string): Promise<void> {
        const abGroup: number = this._configuration.getAbGroup();
        const gamerId: string = this._configuration.getGamerId();

        this._nativeBridge.Sdk.logDebug('Parsing PLC campaign ' + contentType + ': ' + content);
        switch (contentType) {
            case 'comet/campaign':
                const json = JsonParser.parse(content);
                if(json && json.mraidUrl) {
                    const campaign = new MRAIDCampaign(json, gamerId, CampaignManager.AbGroup ? CampaignManager.AbGroup : abGroup, json.mraidUrl);
                    return this.setupPlcCampaignAssets(placements, campaign);
                } else {
                    const campaign = new PerformanceCampaign(json, gamerId, CampaignManager.AbGroup ? CampaignManager.AbGroup : abGroup);
                    return this.setupPlcCampaignAssets(placements, campaign);
                }

            case 'programmatic/vast':
                if(!content) {
                    return this.handlePlcError(new Error('No vast content'), placements);
                }

                return this.parseVastCampaignHelper(content, gamerId, abGroup, trackingUrls, cacheTTL, adType, creativeId, seatId, correlationId).then((vastCampaign) => {
                    return this.setupPlcCampaignAssets(placements, vastCampaign);
                });

            case 'programmatic/mraid-url':
                // todo: handle ad plan expiration with cacheTTL or something similar
                const jsonMraidUrl = JsonParser.parse(content);
                if(!jsonMraidUrl) {
                    return this.handlePlcError(new Error('No mraid-url content'), placements);
                }

                if(!jsonMraidUrl.inlinedUrl) {
                    const MRAIDError = new DiagnosticError(
                        new Error('MRAID Campaign missing inlinedUrl'),
                        {mraid: jsonMraidUrl}
                    );
                    return this.handlePlcError(MRAIDError, placements);
                }

                jsonMraidUrl.id = this.getProgrammaticCampaignId();
                const mraidUrlCampaign = new MRAIDCampaign(jsonMraidUrl, gamerId, CampaignManager.AbGroup ? CampaignManager.AbGroup : abGroup, jsonMraidUrl.inlinedUrl, undefined, trackingUrls, adType, creativeId, seatId, correlationId);
                return this.setupPlcCampaignAssets(placements, mraidUrlCampaign);

            case 'programmatic/mraid':
                // todo: handle ad plan expiration with cacheTTL or something similar
                const jsonMraid = JsonParser.parse(content);
                if(!jsonMraid) {
                    return this.handlePlcError(new Error('No mraid content'), placements);
                }

                if(!jsonMraid.markup) {
                    const MRAIDError = new DiagnosticError(
                        new Error('MRAID Campaign missing markup'),
                        {mraid: jsonMraid}
                    );
                    return this.handlePlcError(MRAIDError, placements);
                }

                jsonMraid.id = this.getProgrammaticCampaignId();
                const markup = decodeURIComponent(jsonMraid.markup);
                const mraidCampaign = new MRAIDCampaign(jsonMraid, gamerId, CampaignManager.AbGroup ? CampaignManager.AbGroup : abGroup, undefined, markup, trackingUrls, adType, creativeId, seatId, correlationId);
                return this.setupPlcCampaignAssets(placements, mraidCampaign);

            case 'programmatic/static-interstitial':
                const domString = decodeURIComponent(content);
                const progImageCampaign = new DisplayInterstitialCampaign(domString, gamerId, CampaignManager.AbGroup ? CampaignManager.AbGroup : abGroup, adType, creativeId, seatId, correlationId);
                return this.setupPlcCampaignAssets(placements, progImageCampaign);
            default:
                return this.handlePlcError(new Error('Unsupported content-type: ' + contentType), placements);
        }
    }

    private setupPlcCampaignAssets(placements: string[], campaign: Campaign): Promise<void> {
        return this._assetManager.setup(campaign).then(() => {
            for(const placement of placements) {
                this.onCampaign.trigger(placement, campaign);
            }
        });
    }

    private handlePlcNoFill(placement: string): Promise<void> {
        this._nativeBridge.Sdk.logDebug('PLC no fill for placement ' + placement);
        this.onNoFill.trigger(placement);
        return Promise.resolve();
    }

    private handlePlcError(error: any, placementIds: string[]): Promise<void> {
        this._nativeBridge.Sdk.logDebug('PLC error ' + error);
        this.onError.trigger(error, placementIds);

        return Promise.resolve();
    }}
