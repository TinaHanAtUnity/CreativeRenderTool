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

export class LegacyCampaignManager extends CampaignManager {
    constructor(nativeBridge: NativeBridge, configuration: Configuration, assetManager: AssetManager, sessionManager: SessionManager, request: Request, clientInfo: ClientInfo, deviceInfo: DeviceInfo, vastParser: VastParser, metaDataManager: MetaDataManager) {
        super(nativeBridge, configuration, assetManager, sessionManager, request, clientInfo, deviceInfo, vastParser, metaDataManager);
    }

    public request(): Promise<INativeResponse | void> {
        return super.request().then(response => {
            if(response) {
                return this.parseCampaign(response);
            }
            return Promise.resolve();
        }).then(() => {
            this._requesting = false;
        }).catch((error) => {
            this._requesting = false;
            this.onError.trigger(error);
            /*
            if(this._configuration.isAuction()) {
                this.onPlcError.trigger(error);
            } else {*/
                // super.onError.trigger(error);
            // }
        });
    }

    private parseCampaign(response: INativeResponse): Promise<void> {
        const json: any = CampaignManager.CampaignResponse ? JsonParser.parse(CampaignManager.CampaignResponse) : JsonParser.parse(response.response);
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
            this.sendNegativeTargetingEvent(campaign, json.gamerId);
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

        for(const placementId in this._configuration.getPlacements()) {
            if(this._configuration.getPlacements().hasOwnProperty(placementId)) {
                this.onNoFill.trigger(placementId);
            }
        }

        return Promise.resolve();
    }

    private handleFill(campaign: Campaign): Promise<void> {
        for(const placementId in this._configuration.getPlacements()) {
            if(this._configuration.getPlacements().hasOwnProperty(placementId)) {
                this.onCampaign.trigger(placementId, campaign);
            }
        }

        return Promise.resolve();
    }
}
