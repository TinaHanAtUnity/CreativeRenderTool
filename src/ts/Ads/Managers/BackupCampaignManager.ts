import { Campaign } from 'Ads/Models/Campaign';
import { Placement } from 'Ads/Models/Placement';
import { NativeBridge } from 'Core/Native/Bridge/NativeBridge';
import { StorageType } from 'Core/Native/Storage';
import { PerformanceCampaign } from 'Performance/Models/PerformanceCampaign';
import { AdMobCampaign } from 'AdMob/Models/AdMobCampaign';
import { CometCampaignLoader } from 'Performance/Parsers/CometCampaignLoader';
import { ProgrammaticAdMobLoader } from 'AdMob/Parsers/ProgrammaticAdMobLoader';
import { CampaignLoader } from 'Ads/Parsers/CampaignLoader';

export class BackupCampaignManager {
    private _nativeBridge: NativeBridge;

    constructor(nativeBridge: NativeBridge) {
        this._nativeBridge = nativeBridge;
    }

    public storePlacement(placement: Placement, mediaId: string) {
        const rootKey: string = 'backupcampaign.placement.' + placement.getId();

        this._nativeBridge.Storage.set(StorageType.PRIVATE, rootKey + '.mediaid', mediaId);
        this._nativeBridge.Storage.set(StorageType.PRIVATE, rootKey + '.adtypes', JSON.stringify(placement.getAdTypes()));
        this._nativeBridge.Storage.write(StorageType.PRIVATE);
    }

    public storeCampaign(campaign: Campaign) {
        const rootKey: string = 'backupcampaign.campaign.' + campaign.getMediaId();
        const campaignType: string | undefined = this.getCampaignType(campaign);

        // ignore non-serializable campaigns
        if(campaignType) {
            let willExpireAt: number | undefined = campaign.getWillExpireAt();
            if(!willExpireAt) {
                willExpireAt = Date.now() + 7 * 24 * 3600 * 1000;
            }

            this._nativeBridge.Storage.set(StorageType.PRIVATE, rootKey + '.type', campaignType);
            this._nativeBridge.Storage.set(StorageType.PRIVATE, rootKey + '.data', campaign.toJSON());
            this._nativeBridge.Storage.set(StorageType.PRIVATE, rootKey + '.willexpireat', willExpireAt);
            this._nativeBridge.Storage.write(StorageType.PRIVATE);
        }
    }

    public loadCampaign(placement: Placement): Promise<Campaign | undefined> {
        const placementRootKey: string = 'backupcampaign.placement.' + placement.getId();
        return Promise.all([this.getString(placementRootKey + '.mediaid'), this.getString(placementRootKey + '.adtypes')]).then(([mediaId, adTypes]) => {
            if(mediaId && adTypes) {
                const campaignRootKey: string = 'backupcampaign.campaign.' + mediaId;
                return Promise.all([this.getString(campaignRootKey + '.type'), this.getString(campaignRootKey + '.data'), this.getNumber(campaignRootKey + '.willexpireat')]).then(([type, data, willexpireat]) => {
                    if(type && data && willexpireat) {
                        const loader: CampaignLoader | undefined = this.getCampaignLoader(type);

                        if(loader && Date.now() < willexpireat) {
                            return loader.load(data);
                            // todo: add cache check for all required and optional assets
                        }
                    }

                    return undefined;
                }).catch(() => {
                    return undefined; // todo: this should never get executed so add some diagnostics here
                });
            } else {
                return undefined;
            }
        }).catch(() => {
            return undefined; // todo: this should never get executed so add some diagnostics here
        });
    }

    public deleteBackupCampaigns() {
        this._nativeBridge.Storage.delete(StorageType.PRIVATE, 'backupcampaign');
    }

    private getCampaignType(campaign: Campaign): string | undefined {
        if(campaign instanceof PerformanceCampaign) {
            return 'performance';
        } else if(campaign instanceof AdMobCampaign) {
            return 'admob';
        } else {
            return undefined;
        }
    }

    private getCampaignLoader(campaignType: string): CampaignLoader | undefined {
        if(campaignType === 'performance') {
            return new CometCampaignLoader();
        } else if(campaignType === 'admob') {
            return new ProgrammaticAdMobLoader();
        } else {
            return undefined;
        }
    }

    private getString(key: string): Promise<string | undefined> {
        return this._nativeBridge.Storage.get<string>(StorageType.PRIVATE, key).then(value => {
            return value;
        }).catch(() => {
            return undefined;
        });
    }

    private getNumber(key: string): Promise<number | undefined> {
        return this._nativeBridge.Storage.get<number>(StorageType.PRIVATE, key).then(value => {
            return value;
        }).catch(() => {
            return undefined;
        });
    }
}
