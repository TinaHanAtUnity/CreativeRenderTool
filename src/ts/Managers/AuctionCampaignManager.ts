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
import { Url } from 'Utilities/Url';
import { Campaign } from 'Models/Campaign';
import { WebViewError } from 'Errors/WebViewError';
import { CacheStatus } from 'Utilities/Cache';
import { Diagnostics } from 'Utilities/Diagnostics';

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
            this.onError.trigger(error);
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

            const promises: Array<Promise<void>> = [];

            for(const placement of noFill) {
                promises.push(this.handlePlcNoFill(placement));
            }

            let campaigns: number = 0;
            for(const mediaId in fill) {
                if(fill.hasOwnProperty(mediaId)) {
                    campaigns++;
                    promises.push(this.handlePlcCampaign(fill[mediaId], json.media[mediaId].contentType, json.media[mediaId].content, json.media[mediaId].trackingUrls, json.media[mediaId].adType, json.media[mediaId].creativeId, json.media[mediaId].seatId, json.correlationId));
                }
            }

            if(campaigns > 1 || (campaigns === 1 && noFill.length > 0)) {
                Diagnostics.trigger('multiple_plc_campaigns', {
                    campaigns: campaigns,
                    noFillPlacements: noFill.length,
                    rawResponse: response.response
                });
            }

            return Promise.all(promises).catch(error => {
                // stopping campaign parsing and caching due to showing an ad unit is ok
                if(error === CacheStatus.STOPPED) {
                    return Promise.resolve();
                }

                // todo: catch errors by placement
                return this.handlePlcError(error);
            });
        } else {
            return this.handlePlcError(new Error('No placements found'));
        }
    }

    private handlePlcCampaign(placements: string[], contentType: string, content: string, trackingUrls?: { [eventName: string]: string[] }, adType?: string, creativeId?: string, seatId?: number, correlationId?: string): Promise<void> {
        const abGroup: number = this._configuration.getAbGroup();
        const gamerId: string = this._configuration.getGamerId();

        this._nativeBridge.Sdk.logDebug('Parsing PLC campaign ' + contentType + ': ' + content);
        switch (contentType) {
            case 'comet/campaign':
                const json = JsonParser.parse(content);
                json.mraidUrl = 'https://unityads-cdn-origin.s3.amazonaws.com/playables/production/android/roll-the-ball/index.html';
                if(json && json.mraidUrl) {
                    const campaign = new MRAIDCampaign(json, gamerId, CampaignManager.AbGroup ? CampaignManager.AbGroup : abGroup, json.mraidUrl);
                    return this.setupPlcCampaignAssets(placements, campaign);
                } else {
                    const campaign = new PerformanceCampaign(json, gamerId, CampaignManager.AbGroup ? CampaignManager.AbGroup : abGroup);
                    return this.setupPlcCampaignAssets(placements, campaign);
                }

            case 'programmatic/vast':
                return this.parseVastCampaignHelper(content, gamerId, abGroup, trackingUrls, undefined, adType, creativeId, seatId, correlationId).then((vastCampaign) => {
                    return this.setupPlcCampaignAssets(placements, vastCampaign);
                });

            case 'programmatic/mraid-url':
                const jsonMraidUrl = JsonParser.parse(content);
                jsonMraidUrl.id = this.getProgrammaticCampaignId();
                const mraidUrlCampaign = new MRAIDCampaign(jsonMraidUrl, gamerId, CampaignManager.AbGroup ? CampaignManager.AbGroup : abGroup, jsonMraidUrl.inlinedUrl, undefined, trackingUrls, adType, creativeId, seatId, correlationId);
                return this.setupPlcCampaignAssets(placements, mraidUrlCampaign);

            case 'programmatic/mraid':
                const jsonMraid = JsonParser.parse(content);
                jsonMraid.id = this.getProgrammaticCampaignId();
                const mraidCampaign = new MRAIDCampaign(jsonMraid, gamerId, CampaignManager.AbGroup ? CampaignManager.AbGroup : abGroup, undefined, jsonMraid.markup, trackingUrls, adType, creativeId, seatId, correlationId);
                return this.setupPlcCampaignAssets(placements, mraidCampaign);

            default:
                return this.handlePlcError(new Error('Unsupported content-type: ' + contentType));
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

    private handlePlcError(error: any): Promise<void> {
        this._nativeBridge.Sdk.logDebug('PLC error ' + error);
        this.onError.trigger(error);
        return Promise.resolve();
    }}
