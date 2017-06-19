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
            return Promise.resolve();
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
                        adTypes: placements[placement].getAdTypes()
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

            let chain = Promise.resolve();

            for(const placement of noFill) {
                chain = chain.then(() => {
                    return this.handlePlcNoFill(placement);
                });
            }

            for(const mediaId in fill) {
                if(fill.hasOwnProperty(mediaId)) {
                    chain = chain.then(() => {
                        return this.handlePlcCampaign(fill[mediaId], json.media[mediaId].contentType, json.media[mediaId].content, json.media[mediaId].trackingUrls);
                    });
                }
            }

            return chain.catch(error => {
                return this.handlePlcError(error);
            });
        } else {
            return this.handlePlcError(new Error('No placements found'));
        }
    }

    private handlePlcCampaign(placements: string[], contentType: string, content: string, trackingUrls?: { [eventName: string]: string[] }): Promise<void> {
        const abGroup: number = this._configuration.getAbGroup();
        const gamerId: string = this._configuration.getGamerId();

        this._nativeBridge.Sdk.logDebug('Parsing PLC campaign ' + contentType + ': ' + content);
        switch (contentType) {
            case 'comet/campaign':
                const json = JsonParser.parse(content);
                if(json && json.mraidUrl) {
                    const campaign = new MRAIDCampaign(json, gamerId, CampaignManager.AbGroup ? CampaignManager.AbGroup : abGroup, json.mraidUrl);
                    return this._assetManager.setup(campaign, true).then(() => {
                        for(const placement of placements) {
                            this.onCampaign.trigger(placement, campaign);
                        }
                    });
                } else {
                    const campaign = new PerformanceCampaign(json, gamerId, CampaignManager.AbGroup ? CampaignManager.AbGroup : abGroup);
                    this.sendNegativeTargetingEvent(campaign, gamerId);
                    return this._assetManager.setup(campaign, true).then(() => {
                        for(const placement of placements) {
                            this.onCampaign.trigger(placement, campaign);
                        }
                    });
                }

            case 'programmatic/vast':
                return this.parseVastCampaignHelper(content, gamerId, abGroup, trackingUrls).then((vastCampaign) => {
                    return this._assetManager.setup(vastCampaign, true).then(() => {
                        for(const placement of placements) {
                            this.onCampaign.trigger(placement, vastCampaign);
                        }
                    });
                });

            default:
                return this.handlePlcError(new Error('Unsupported content-type: ' + contentType));
        }

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
