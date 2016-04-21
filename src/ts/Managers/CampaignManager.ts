import { Observable1, Observable2 } from 'Utilities/Observable';

import { DeviceInfo } from 'Models/DeviceInfo';
import { Url } from 'Utilities/Url';

import { Campaign } from 'Models/Campaign';
import { Placement } from 'Models/Placement';
import { Request } from 'Utilities/Request';
import { ClientInfo } from 'Models/ClientInfo';
import { Platform } from 'Constants/Platform';
import { NativeBridge } from 'Native/NativeBridge';
import { MediationMetaData } from 'Models/MetaData/MediationMetaData';

export class CampaignManager {

    private static CampaignBaseUrl = 'https://adserver.unityads.unity3d.com/games';

    public onCampaign: Observable2<Placement, Campaign> = new Observable2();
    public onError: Observable1<Error> = new Observable1();

    private _nativeBridge: NativeBridge;
    private _request: Request;
    private _clientInfo: ClientInfo;
    private _deviceInfo: DeviceInfo;
    private _failedPlacements: string[];

    constructor(nativeBridge: NativeBridge, request: Request, clientInfo: ClientInfo, deviceInfo: DeviceInfo) {
        this._nativeBridge = nativeBridge;
        this._request = request;
        this._clientInfo = clientInfo;
        this._deviceInfo = deviceInfo;
        this._failedPlacements = [];
    }

    public request(placement: Placement): void {
        if(this._failedPlacements.indexOf(placement.getId()) > -1) {
            delete this._failedPlacements[this._failedPlacements.indexOf(placement.getId())];
        }

        this.createRequestUrl(placement.getId()).then(requestUrl => {
            return this._request.get(requestUrl, [], 5, 5000).then(response => {
                let campaignJson: any = JSON.parse(response.response);
                let campaign: Campaign = new Campaign(campaignJson.campaign, campaignJson.gamerId, campaignJson.abGroup);
                placement.setCampaign(campaign);
                this.onCampaign.trigger(placement, campaign);
            });
        }).catch((error) => {
            placement.setCampaign(null);
            this._failedPlacements.push(placement.getId());
            this.onError.trigger(error);
        });
    }

    public retryFailedPlacements(placements: { [id: string]: Placement }) {
        for(let placementId in placements) {
            if(placements.hasOwnProperty(placementId)) {
                if(this._failedPlacements.indexOf(placementId) > -1) {
                    this.request(placements[placementId]);
                }
            }
        }
    }

    private createRequestUrl(placementId: string): Promise<string> {
        let url: string = [
            CampaignManager.CampaignBaseUrl,
            this._clientInfo.getGameId(),
            'placements',
            placementId,
            'fill'
        ].join('/');

        return MediationMetaData.fetch(this._nativeBridge).then(mediation => {
            url = Url.addParameters(url, {
                application_version: this._clientInfo.getApplicationVersion(),
                application_name: this._clientInfo.getApplicationName(),
                advertisingTrackingId: this._deviceInfo.getAdvertisingIdentifier(),
                androidId: this._deviceInfo.getAndroidId(),
                connectionType: this._deviceInfo.getConnectionType(),
                device_free_space: this._deviceInfo.getFreeSpace(),
                gameId: this._clientInfo.getGameId(),
                hardwareVersion: this._deviceInfo.getManufacturer() + ' ' + this._deviceInfo.getModel(),
                deviceType: this._deviceInfo.getModel(),
                limitAdTracking: this._deviceInfo.getLimitAdTracking(),
                language: this._deviceInfo.getLanguage(),
                networkType: this._deviceInfo.getNetworkType(),
                network_operator: this._deviceInfo.getNetworkOperator(),
                network_operator_name: this._deviceInfo.getNetworkOperatorName(),
                platform: Platform[this._clientInfo.getPlatform()].toLowerCase(),
                screenDensity: this._deviceInfo.getScreenDensity(),
                screenSize: this._deviceInfo.getScreenLayout(),
                screen_width: this._deviceInfo.getScreenWidth(),
                screen_height: this._deviceInfo.getScreenHeight(),
                sdkVersion: this._clientInfo.getSdkVersion(),
                softwareVersion: this._deviceInfo.getApiLevel(),
                placementId: placementId,
                timeZone: this._deviceInfo.getTimeZone()
            });

            if(this._clientInfo.getTestMode()) {
                url = Url.addParameters(url, {test: true});
            }

            if(mediation) {
                url = Url.addParameters(url, {
                    mediation_name: mediation.getName(),
                    mediation_version: mediation.getVersion(),
                    medation_ordinal: mediation.getOrdinal()
                });
            }

            return url;
        });
    }

}
