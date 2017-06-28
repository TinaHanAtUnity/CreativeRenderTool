import { CampaignManager } from 'Managers/CampaignManager';
import { NativeBridge } from 'Native/NativeBridge';
import { Configuration } from 'Models/Configuration';
import { AssetManager } from 'Managers/AssetManager';
import { SessionManager } from 'Managers/SessionManager';
import { ClientInfo } from 'Models/ClientInfo';
import { DeviceInfo } from 'Models/DeviceInfo';
import { VastParser } from 'Utilities/VastParser';
import { MetaDataManager } from 'Managers/MetaDataManager';
import { INativeResponse, Request } from 'Utilities/Request';
import { JsonParser } from 'Utilities/JsonParser';
import { DiagnosticError } from 'Errors/DiagnosticError';
import { MRAIDCampaign } from 'Models/MRAIDCampaign';
import { PerformanceCampaign } from 'Models/PerformanceCampaign';
import { Platform } from 'Constants/Platform';
import { Campaign } from 'Models/Campaign';
import { StorageType } from 'Native/Api/Storage';
import { Url } from 'Utilities/Url';
import { WebViewError } from 'Errors/WebViewError';
import { CampaignRefreshManager } from 'Managers/CampaignRefreshManager';

export class LegacyCampaignManager extends CampaignManager {
    public static setTestBaseUrl(baseUrl: string): void {
        LegacyCampaignManager.CampaignBaseUrl = baseUrl + '/games';
    }

    private static CampaignBaseUrl: string = 'https://adserver.unityads.unity3d.com/games';

    constructor(nativeBridge: NativeBridge, configuration: Configuration, assetManager: AssetManager, sessionManager: SessionManager, request: Request, clientInfo: ClientInfo, deviceInfo: DeviceInfo, vastParser: VastParser, metaDataManager: MetaDataManager) {
        super(nativeBridge, configuration, assetManager, sessionManager, request, clientInfo, deviceInfo, vastParser, metaDataManager);
    }

    public request(): Promise<INativeResponse | void> {
        return super.request().then(response => {
            if(response) {
                return this.parseCampaign(response);
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
            LegacyCampaignManager.CampaignBaseUrl,
            this._clientInfo.getGameId(),
            'fill'
        ].join('/');
    }

    protected createRequestUrl(): Promise<string> {
        return Promise.all([super.createRequestUrl(), this.fetchGamerId()]).then(([url, gamerId]) => {
            if(gamerId) {
                url = Url.addParameters(url, {
                    gamerId: this.getParameter('gamerId', gamerId, 'string')
                });
            }
            return url;
        });
    }

    private storeGamerId(gamerId: string): Promise<void[]> {
        return Promise.all([
            this._nativeBridge.Storage.set(StorageType.PRIVATE, 'gamerId', gamerId),
            this._nativeBridge.Storage.write(StorageType.PRIVATE)
        ]);
    }

    private fetchGamerId(): Promise<string> {
        return this._nativeBridge.Storage.get<string>(StorageType.PRIVATE, 'gamerId').then(gamerId => {
            return gamerId;
        }).catch(error => {
            return undefined;
        });
    }

    private parseCampaign(response: INativeResponse): Promise<void> {
        const json: any = CampaignManager.CampaignResponse ? JsonParser.parse(CampaignManager.CampaignResponse) : JsonParser.parse(response.response);

        // note: very hackish way of setting A/B group for a test but practically the only easy way to handle everything including all error paths
        if(json.abGroup) {
            CampaignRefreshManager.QuickRefillAbGroup = json.abGroup;
        }

        if(json.gamerId) {
            this.storeGamerId(json.gamerId);
        } else if('campaign' in json || 'vast' in json || 'mraid' in json) {
            this._nativeBridge.Sdk.logError('Unity Ads server returned a campaign without gamerId, ignoring campaign');
            const error: DiagnosticError = new DiagnosticError(new Error('Missing gamerId'), {
                rawAdPlan: json
            });
            this.onError.trigger(error);
            return Promise.resolve();
        }

        if('campaign' in json) {
            return this.parsePerformanceCampaign(json);
        } else if('vast' in json) {
            return this.parseVastCampaign(json);
        } else if('mraid' in json) {
            return this.parseMraidCampaign(json);
        } else {
            return this.handleNoFill();
        }
    }

    private parsePerformanceCampaign(json: any): Promise<void> {
        this._nativeBridge.Sdk.logInfo('Unity Ads server returned game advertisement for AB Group ' + json.abGroup);
        if(json.campaign && json.campaign.mraidUrl) {
            const campaign = new MRAIDCampaign(json.campaign, json.gamerId, CampaignManager.AbGroup ? CampaignManager.AbGroup : json.abGroup, json.campaign.mraidUrl);
            return this._assetManager.setup(campaign).then(() => {
                return this.handleFill(campaign);
            });
        } else {
            const campaign = new PerformanceCampaign(json.campaign, json.gamerId, CampaignManager.AbGroup ? CampaignManager.AbGroup : json.abGroup);
            return this._assetManager.setup(campaign).then(() => {
                return this.handleFill(campaign);
            });
        }
    }

    private parseVastCampaign(json: any): Promise<void> {
        if(json.vast === null) {
            return this.handleNoFill();
        }
        this._nativeBridge.Sdk.logInfo('Unity Ads server returned VAST advertisement for AB Group ' + json.abGroup);
        return this.parseVastCampaignHelper(json.vast.data, json.gamerId, json.abGroup, json.vast.tracking, json.cacheTTL).then(campaign => {
            return this._assetManager.setup(campaign).then(() => {
                return this.handleFill(campaign);
            });
        }).catch((error) => {
            this.onError.trigger(error);
        });
    }

    private parseMraidCampaign(json: any): Promise<void> {
        let campaignId: string;

        if(json.mraid === null) {
            return this.handleNoFill();
        }
        this._nativeBridge.Sdk.logInfo('Unity Ads server returned game advertisement for AB Group ' + json.abGroup);

        if(this._nativeBridge.getPlatform() === Platform.IOS) {
            campaignId = '00005472656d6f7220694f53';
        } else if(this._nativeBridge.getPlatform() === Platform.ANDROID) {
            campaignId = '005472656d6f7220416e6472';
        } else {
            campaignId = 'UNKNOWN';
        }

        json.mraid.id = campaignId;

        if(json.mraid.inlinedURL || json.mraid.markup) {
            const campaign = new MRAIDCampaign(json.mraid, json.gamerId, CampaignManager.AbGroup ? CampaignManager.AbGroup : json.abGroup, json.mraid.inlinedURL, json.mraid.markup, json.mraid.tracking);
            return this._assetManager.setup(campaign).then(() => {
                return this.handleFill(campaign);
            });
        } else {
            const MRAIDUrlError = new DiagnosticError(
                new Error('MRAID Campaign missing markup'),
                {mraid: json.mraid}
            );
            this.onError.trigger(MRAIDUrlError);
            return Promise.resolve();
        }
    }

    private handleNoFill(): Promise<void> {
        this._nativeBridge.Sdk.logInfo('Unity Ads server returned no fill, no ads to show');
        this.onNoFill.trigger('');
        return Promise.resolve();
    }

    private handleFill(campaign: Campaign): Promise<void> {
        this.onCampaign.trigger('', campaign);
        return Promise.resolve();
    }
}
