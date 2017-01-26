import { Observable1 } from 'Utilities/Observable';
import { DeviceInfo } from 'Models/DeviceInfo';
import { Url } from 'Utilities/Url';
import { Campaign } from 'Models/Campaign';
import { VastCampaign } from 'Models/Vast/VastCampaign';
import { Request, INativeResponse } from 'Utilities/Request';
import { ClientInfo } from 'Models/ClientInfo';
import { Platform } from 'Constants/Platform';
import { NativeBridge } from 'Native/NativeBridge';
import { VastParser } from 'Utilities/VastParser';
import { MetaDataManager } from 'Managers/MetaDataManager';
import { JsonParser } from 'Utilities/JsonParser';
import { DiagnosticError } from 'Errors/DiagnosticError';
import { StorageType } from 'Native/Api/Storage';
import { HtmlCampaign } from 'Models/HtmlCampaign';
import { MRAIDCampaign } from 'Models/MRAIDCampaign';

import TestMRAID from 'html/fixtures/TestMRAID.html';
// import SimpleTestMRAID from 'html/fixtures/SimpleTestMRAID.html';

export class CampaignManager {

    public static setTestBaseUrl(baseUrl: string): void {
        CampaignManager.CampaignBaseUrl = baseUrl + '/games';
    }

    public static setAbGroup(abGroup: number) {
        CampaignManager.AbGroup = abGroup;
    }

    public static setCampaignId(campaignId: string) {
        CampaignManager.CampaignId = campaignId;
    }

    public static setCountry(country: string) {
        CampaignManager.Country = country;
    }

    public static setCampaignResponse(campaignResponse: string) {
        CampaignManager.CampaignResponse = campaignResponse;
    }

    private static CampaignBaseUrl: string = 'https://adserver.unityads.unity3d.com/games';
    private static AbGroup: number | undefined;
    private static CampaignId: string | undefined;
    private static Country: string | undefined;
    private static CampaignResponse: string | undefined;

    public onCampaign: Observable1<Campaign> = new Observable1();
    public onVastCampaign: Observable1<Campaign> = new Observable1();
    public onThirdPartyCampaign: Observable1<HtmlCampaign> = new Observable1();
    public onMRAIDCampaign: Observable1<MRAIDCampaign> = new Observable1();
    public onNoFill: Observable1<number> = new Observable1();
    public onError: Observable1<any> = new Observable1();

    private _nativeBridge: NativeBridge;
    private _request: Request;
    private _clientInfo: ClientInfo;
    private _deviceInfo: DeviceInfo;
    private _vastParser: VastParser;

    constructor(nativeBridge: NativeBridge, request: Request, clientInfo: ClientInfo, deviceInfo: DeviceInfo, vastParser: VastParser) {
        this._nativeBridge = nativeBridge;
        this._request = request;
        this._clientInfo = clientInfo;
        this._deviceInfo = deviceInfo;
        this._vastParser = vastParser;
    }

    public request(): Promise<void> {
        return Promise.all([this.createRequestUrl(), this.createRequestBody()]).then(([requestUrl, requestBody]) => {
            this._nativeBridge.Sdk.logInfo('Requesting ad plan from ' + requestUrl);
            return this._request.post(requestUrl, requestBody, [], {
                retries: 5,
                retryDelay: 5000,
                followRedirects: false,
                retryWithConnectionEvents: true
            });
        }).then(response => {
            return this.parseCampaign(response);
        }).catch((error) => {
            this.onError.trigger(error);
        });
    }

    private parseCampaign(response: INativeResponse) {
        const json: any = CampaignManager.CampaignResponse ? JsonParser.parse(CampaignManager.CampaignResponse) : JsonParser.parse(response.response);
        if(json.gamerId) {
            this.storeGamerId(json.gamerId);
        }

        if(1 === 1) {
            this.parseMRAIDCampaign(json);
            return;
        }

        if('campaign' in json) {
            this.parsePerformanceCampaign(json);
        } else if('vast' in json) {
            this.parseVastCampaign(json);
        } else if('mraid' in json) {
            this.parseMRAIDCampaign(json);
        } else {
            this._nativeBridge.Sdk.logInfo('Unity Ads server returned no fill');
            this.onNoFill.trigger(3600); // default to retry in one hour, this value should be set by server
        }
    }

    private parsePerformanceCampaign(json: any) {
        this._nativeBridge.Sdk.logInfo('Unity Ads server returned game advertisement for AB Group ' + json.abGroup);
        const htmlCampaign = this.parseHtmlCampaign(json);
        if(htmlCampaign) {
            this.onThirdPartyCampaign.trigger(htmlCampaign);
        } else {
            const campaign = new Campaign(json.campaign, json.gamerId, CampaignManager.AbGroup ? CampaignManager.AbGroup : json.abGroup);
            this.onCampaign.trigger(campaign);
        }
    }

    private parseHtmlCampaign(json: any): HtmlCampaign | undefined {
        const campaign = new Campaign(json.campaign, json.gamerId, CampaignManager.AbGroup ? CampaignManager.AbGroup : json.abGroup);
        let resource: string | undefined;
        switch(campaign.getId()) {
            // Game of War iOS
            case '583dfda0d933a3630a53249c':
            case '583dfd52abb1feee0909882b':
            case '583dfd45669a903e086e38d2':
            case '583dfd4c9ceadb4708b021de':
                resource = 'https://static.applifier.com/playables/SG_ios/index_ios.html';
                break;

            // Game of War Android
            case '583dfca5a93bfa6700d8c6f3':
            case '583dfcb54622865a0a246bdf':
                resource = 'https://static.applifier.com/playables/SG_android/index_android.html';
                break;

            // Mobile Strike iOS
            case '583dfb9a5b79df3f0a274f0b':
            case '583dfe483fe2166c0ac9e6fb':
            case '583dfba09bfc2a2d0a9a0b1c':
            case '583dfba69d308fe203d7d740':
                resource = 'https://static.applifier.com/playables/SMA_ios/index_ios.html';
                break;

            // Mobile Strike Android
            case '583dfc532e4d9b5008c934d1':
            case '583dfc667f448e630ac6a4bc':
                resource = 'https://static.applifier.com/playables/SMA_android/index_android.html';
                break;

            default:
                break;
        }

        const abGroup = campaign.getAbGroup();
        if(resource && abGroup !== 6 && abGroup !== 7) {
            return new HtmlCampaign(json.campaign, json.gamerId, CampaignManager.AbGroup ? CampaignManager.AbGroup : json.abGroup, resource);
        }
        return undefined;
    }

    private parseVastCampaign(json: any) {
        if(json.vast === null) {
            this._nativeBridge.Sdk.logInfo('Unity Ads server returned no fill');
            this.onNoFill.trigger(3600);
            return;
        }
        this._nativeBridge.Sdk.logInfo('Unity Ads server returned VAST advertisement for AB Group ' + json.abGroup);
        const decodedVast = decodeURIComponent(json.vast.data).trim();
        return this._vastParser.retrieveVast(decodedVast, this._nativeBridge, this._request).then(vast => {
            let campaignId: string;
            if(this._nativeBridge.getPlatform() === Platform.IOS) {
                campaignId = '00005472656d6f7220694f53';
            } else if(this._nativeBridge.getPlatform() === Platform.ANDROID) {
                campaignId = '005472656d6f7220416e6472';
            } else {
                campaignId = 'UNKNOWN';
            }
            const campaign = new VastCampaign(vast, campaignId, json.gamerId, CampaignManager.AbGroup ? CampaignManager.AbGroup : json.abGroup, json.cacheTTL, json.vast.tracking);
            if(campaign.getVast().getImpressionUrls().length === 0) {
                this.onError.trigger(new Error('Campaign does not have an impression url'));
                return;
            }
            // todo throw an Error if required events are missing. (what are the required events?)
            if(campaign.getVast().getErrorURLTemplates().length === 0) {
                this._nativeBridge.Sdk.logWarning(`Campaign does not have an error url for game id ${this._clientInfo.getGameId()}`);
            }
            if(!campaign.getVideoUrl()) {
                const videoUrlError = new DiagnosticError(
                    new Error('Campaign does not have a video url'),
                    {rootWrapperVast: json.vast}
                );
                this.onError.trigger(videoUrlError);
                return;
            }
            if(this._nativeBridge.getPlatform() === Platform.IOS && !campaign.getVideoUrl().match(/^https:\/\//)) {
                const videoUrlError = new DiagnosticError(
                    new Error('Campaign video url needs to be https for iOS'),
                    {rootWrapperVast: json.vast}
                );
                this.onError.trigger(videoUrlError);
                return;
            }
            this.onVastCampaign.trigger(campaign);
        }).catch((error) => {
            this.onError.trigger(error);
        });
    }

    private parseMRAIDCampaign(json: any) {
        const campaign = new MRAIDCampaign(json.campaign, 'gamerId', 0, '', TestMRAID);
        this.onMRAIDCampaign.trigger(campaign);
    }

    private createRequestUrl(): Promise<string> {
        let url: string = [
            CampaignManager.CampaignBaseUrl,
            this._clientInfo.getGameId(),
            'fill'
        ].join('/');

        if(this._deviceInfo.getAdvertisingIdentifier()) {
            url = Url.addParameters(url, {
                advertisingTrackingId: this._deviceInfo.getAdvertisingIdentifier(),
                limitAdTracking: this._deviceInfo.getLimitAdTracking()
            });
        } else if(this._clientInfo.getPlatform() === Platform.ANDROID) {
            url = Url.addParameters(url, {
                androidId: this._deviceInfo.getAndroidId()
            });
        }

        url = Url.addParameters(url, {
            deviceMake: this._deviceInfo.getManufacturer(),
            deviceModel: this._deviceInfo.getModel(),
            platform: Platform[this._clientInfo.getPlatform()].toLowerCase(),
            screenDensity: this._deviceInfo.getScreenDensity(),
            screenWidth: this._deviceInfo.getScreenWidth(),
            screenHeight: this._deviceInfo.getScreenHeight(),
            sdkVersion: this._clientInfo.getSdkVersion(),
            screenSize: this._deviceInfo.getScreenLayout()
        });

        if(this._clientInfo.getPlatform() === Platform.IOS) {
            url = Url.addParameters(url, {
                osVersion: this._deviceInfo.getOsVersion()
            });
        } else {
            url = Url.addParameters(url, {
                apiLevel: this._deviceInfo.getApiLevel()
            });
        }

        if(this._clientInfo.getTestMode()) {
            url = Url.addParameters(url, {test: true});
        }

        if(CampaignManager.CampaignId) {
            url = Url.addParameters(url, {
                forceCampaignId: CampaignManager.CampaignId
            });
        }

        if(CampaignManager.AbGroup) {
            url = Url.addParameters(url, {
                forceAbGroup: CampaignManager.AbGroup
            });
        }

        if(CampaignManager.Country) {
            url = Url.addParameters(url, {
                force_country: CampaignManager.Country
            });
        }

        const promises: Promise<any>[] = [];
        promises.push(this._deviceInfo.getConnectionType());
        promises.push(this._deviceInfo.getNetworkType());
        promises.push(this.fetchGamerId());

        return Promise.all(promises).then(([connectionType, networkType, gamerId]) => {
            url = Url.addParameters(url, {
                connectionType: connectionType,
                networkType: networkType,
                gamerId: gamerId
            });

            return url;
        });
    }

    private createRequestBody(): Promise<string> {
        const promises: Promise<any>[] = [];
        promises.push(this._deviceInfo.getFreeSpace());
        promises.push(this._deviceInfo.getNetworkOperator());
        promises.push(this._deviceInfo.getNetworkOperatorName());

        const body: any = {
            bundleVersion: this._clientInfo.getApplicationVersion(),
            bundleId: this._clientInfo.getApplicationName(),
            language: this._deviceInfo.getLanguage(),
            timeZone: this._deviceInfo.getTimeZone(),
        };

        if(typeof navigator !== 'undefined' && navigator.userAgent) {
            body.webviewUa = navigator.userAgent;
        }

        return Promise.all(promises).then(([freeSpace, networkOperator, networkOperatorName]) => {
            body.deviceFreeSpace = freeSpace;
            body.networkOperator = networkOperator;
            body.networkOperatorName = networkOperatorName;

            return MetaDataManager.fetchMediationMetaData(this._nativeBridge).then(mediation => {
                if(mediation) {
                    body.mediationName = mediation.getName();
                    body.mediationVersion = mediation.getVersion();
                    if(mediation.getOrdinal()) {
                        body.mediationOrdinal = mediation.getOrdinal();
                    }
                }

                return JSON.stringify(body);
            });
        });
    }

    private fetchGamerId(): Promise<string> {
        return this._nativeBridge.Storage.get<string>(StorageType.PRIVATE, 'gamerId').then(gamerId => {
            return gamerId;
        }).catch(error => {
            return undefined;
        });
    }

    private storeGamerId(gamerId: string): Promise<void[]> {
        return Promise.all([
            this._nativeBridge.Storage.set(StorageType.PRIVATE, 'gamerId', gamerId),
            this._nativeBridge.Storage.write(StorageType.PRIVATE)
        ]);
    }

}
