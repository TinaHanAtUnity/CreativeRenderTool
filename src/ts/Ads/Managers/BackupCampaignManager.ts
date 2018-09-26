import { Campaign } from 'Ads/Models/Campaign';
import { Placement } from 'Ads/Models/Placement';
import { NativeBridge } from 'Core/Native/Bridge/NativeBridge';
import { StorageType } from 'Core/Native/Storage';
import { PerformanceCampaign } from 'Performance/Models/PerformanceCampaign';
import { AdMobCampaign } from 'AdMob/Models/AdMobCampaign';
import { CometCampaignLoader } from 'Performance/Parsers/CometCampaignLoader';
import { ProgrammaticAdMobLoader } from 'AdMob/Parsers/ProgrammaticAdMobLoader';
import { CampaignLoader } from 'Ads/Parsers/CampaignLoader';
import { CoreConfiguration } from 'Core/Models/CoreConfiguration';
import { Asset } from 'Ads/Models/Assets/Asset';
import { IFileInfo } from 'Core/Native/Cache';
import { Video } from 'Ads/Models/Assets/Video';

export class BackupCampaignManager {
    private _nativeBridge: NativeBridge;
    private _coreConfiguration: CoreConfiguration;

    constructor(nativeBridge: NativeBridge, coreConfiguration: CoreConfiguration) {
        this._nativeBridge = nativeBridge;
        this._coreConfiguration = coreConfiguration;
    }

    public storePlacement(placement: Placement, mediaId: string) {
        // never store data when in test mode
        if(this._coreConfiguration.getTestMode()) {
            return;
        }

        const rootKey: string = 'backupcampaign.placement.' + placement.getId();

        this._nativeBridge.Storage.set(StorageType.PRIVATE, rootKey + '.mediaid', mediaId);
        this._nativeBridge.Storage.set(StorageType.PRIVATE, rootKey + '.adtypes', JSON.stringify(placement.getAdTypes()));
        // note: Storage.write is intentionally omitted as an optimization hack
        // it is enough to have Storage.write after campaigns are stored
        // if placements are not written because of this, it won't matter since campaigns would not be written either
    }

    public storeCampaign(campaign: Campaign) {
        // never store data when in test mode
        if(this._coreConfiguration.getTestMode()) {
            return;
        }

        const rootKey: string = 'backupcampaign.campaign.' + campaign.getMediaId();
        const campaignType: string | undefined = this.getCampaignType(campaign);

        // ignore non-serializable campaigns
        if(campaignType) {
            let willExpireAt: number | undefined = campaign.getWillExpireAt();
            if(!willExpireAt) {
                // if campaign expiration value is not set (e.g. comet campaigns), then expire campaign in seven days
                const maxExpiryDelay: number = 7 * 24 * 3600 * 1000;
                willExpireAt = Date.now() + maxExpiryDelay;
            }

            this._nativeBridge.Storage.set(StorageType.PRIVATE, rootKey + '.type', campaignType);
            this._nativeBridge.Storage.set(StorageType.PRIVATE, rootKey + '.data', campaign.toJSON());
            this._nativeBridge.Storage.set(StorageType.PRIVATE, rootKey + '.willexpireat', willExpireAt);
            this._nativeBridge.Storage.write(StorageType.PRIVATE);
        }
    }

    public loadCampaign(placement: Placement): Promise<Campaign | undefined> {
        // test mode should never use stored production campaigns even when they would be available in storage
        if(this._coreConfiguration.getTestMode()) {
            return Promise.resolve(undefined);
        }

        const placementRootKey: string = 'backupcampaign.placement.' + placement.getId();
        return Promise.all([this.getString(placementRootKey + '.mediaid'), this.getString(placementRootKey + '.adtypes')]).then(([mediaId, adTypes]) => {
            if(mediaId && adTypes && adTypes === JSON.stringify(placement.getAdTypes())) {
                const campaignRootKey: string = 'backupcampaign.campaign.' + mediaId;
                return Promise.all([this.getString(campaignRootKey + '.type'), this.getString(campaignRootKey + '.data'), this.getNumber(campaignRootKey + '.willexpireat')]).then(([type, data, willexpireat]) => {
                    if(type && data && willexpireat && Date.now() < willexpireat) {
                        const loader = this.getCampaignLoader(type);

                        if(loader) {
                            const campaign = loader.load(data);

                            if(campaign) {
                                return this.verifyCachedFiles(campaign).then(cached => {
                                    if(cached) {
                                        return campaign;
                                    } else {
                                        return undefined;
                                    }
                                });
                            }
                        }
                    }

                    return undefined;
                });
            } else {
                return undefined;
            }
        }).catch(() => {
            return undefined;
        });
    }

    public deleteBackupCampaigns() {
        this._nativeBridge.Storage.delete(StorageType.PRIVATE, 'backupcampaign');
        this._nativeBridge.Storage.write(StorageType.PRIVATE);
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

    private getString(key: string): Promise<string> {
        return this._nativeBridge.Storage.get<string>(StorageType.PRIVATE, key);
    }

    private getNumber(key: string): Promise<number> {
        return this._nativeBridge.Storage.get<number>(StorageType.PRIVATE, key);
    }

    private verifyCachedFiles(campaign: Campaign): Promise<boolean> {
        const requiredAssets = campaign.getRequiredAssets();
        const optionalAssets = campaign.getOptionalAssets();

        if(requiredAssets.length === 0 && optionalAssets.length === 0) {
            return Promise.resolve(true);
        }

        const promises = [];

        // unfortunately PerformanceCampaign does not strictly follow requiredAssets and optionalAssets pattern
        // it needs either video (landscape) or portraitVideo cached so this special logic is necessary
        if(campaign instanceof PerformanceCampaign) {
            const video = campaign.getVideo();
            const portraitVideo = campaign.getPortraitVideo();
            if(video && video.isCached()) {
                promises.push(this.verifyCachedAsset(video));
            } else if(portraitVideo && portraitVideo.isCached()) {
                promises.push(this.verifyCachedAsset(portraitVideo));
            } else {
                return Promise.resolve(false);
            }
        }

        for(const requiredAsset of requiredAssets) {
            promises.push(this.verifyCachedAsset(requiredAsset));
        }

        for(const optionalAsset of optionalAssets) {
            promises.push(this.verifyCachedAsset(optionalAsset));
        }

        return Promise.all(promises).then((values: boolean[]) => {
            return values.every(value => value);
        });
    }

    private verifyCachedAsset(asset: Asset): Promise<boolean> {
        const fileId = asset.getFileId();

        if(asset.isCached() && fileId) {
            return this._nativeBridge.Cache.getFileInfo(fileId).then((fileInfo: IFileInfo) => {
                if(fileInfo.found && fileInfo.size > 0) {
                    return true;
                }

                return false;
            });
        } else {
            return Promise.resolve(false);
        }
    }
}
