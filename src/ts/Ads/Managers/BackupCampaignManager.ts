import { AdMobCampaign } from 'AdMob/Models/AdMobCampaign';
import { ProgrammaticAdMobLoader } from 'AdMob/Parsers/ProgrammaticAdMobLoader';
import { Asset } from 'Ads/Models/Assets/Asset';
import { Campaign, ICampaignTrackingUrls } from 'Ads/Models/Campaign';
import { Placement } from 'Ads/Models/Placement';
import { CampaignLoader } from 'Ads/Parsers/CampaignLoader';
import { ICoreApi } from 'Core/ICore';
import { CoreConfiguration } from 'Core/Models/CoreConfiguration';
import { IFileInfo } from 'Core/Native/Cache';
import { StorageType } from 'Core/Native/Storage';
import { Diagnostics } from 'Core/Utilities/Diagnostics';
import { StorageBridge } from 'Core/Utilities/StorageBridge';
import { StorageOperation } from 'Core/Utilities/StorageOperation';
import { MRAIDCampaign } from 'MRAID/Models/MRAIDCampaign';
import { MraidLoader } from 'MRAID/Parsers/MraidLoader';
import { PerformanceCampaign } from 'Performance/Models/PerformanceCampaign';
import { CometCampaignLoader } from 'Performance/Parsers/CometCampaignLoader';

export class BackupCampaignManager {
    private static _maxExpiryDelay: number = 7 * 24 * 3600 * 1000; // if campaign expiration value is not set (e.g. comet campaigns), then expire campaign in seven days

    private _core: ICoreApi;
    private _storageBridge: StorageBridge;
    private _coreConfiguration: CoreConfiguration;

    constructor(core: ICoreApi, storageBridge: StorageBridge, coreConfiguration: CoreConfiguration) {
        this._core = core;
        this._storageBridge = storageBridge;
        this._coreConfiguration = coreConfiguration;
    }

    // todo: once auction v5 is unconditionally adopoted, trackingUrls should not be optional
    public storePlacement(placement: Placement, mediaId: string, trackingUrls?: ICampaignTrackingUrls) {
        // never store data when in test mode
        if(this._coreConfiguration.getTestMode()) {
            return;
        }

        const rootKey: string = 'backupcampaign.placement.' + placement.getId();

        const operation = new StorageOperation(StorageType.PRIVATE);
        operation.set(rootKey + '.mediaid', mediaId);
        operation.set(rootKey + '.adtypes', JSON.stringify(placement.getAdTypes()));

        if(trackingUrls) {
            operation.set(rootKey + '.trackingurls', JSON.stringify(trackingUrls));
        }

        this._storageBridge.queue(operation);
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
                willExpireAt = Date.now() + BackupCampaignManager._maxExpiryDelay;
            }

            const operation = new StorageOperation(StorageType.PRIVATE);
            operation.set(rootKey + '.type', campaignType);
            operation.set(rootKey + '.data', campaign.toJSON());
            operation.set(rootKey + '.willexpireat', willExpireAt);
            this._storageBridge.queue(operation);
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
                                return this.verifyCachedFiles(campaign);
                            } else {
                                Diagnostics.trigger('backup_campaign_loading_failed', {
                                    type: type,
                                    data: data,
                                    willExpireAt: willexpireat
                                });
                            }
                        }
                    }

                    return Promise.resolve(undefined);
                });
            } else {
                return undefined;
            }
        }).catch(() => {
            return undefined;
        });
    }

    public loadTrackingUrls(placement: Placement): Promise<ICampaignTrackingUrls | undefined> {
        return this.getString('backupcampaign.placement.' + placement.getId() + '.trackingurls').then(rawTrackingUrls => {
            return JSON.parse(rawTrackingUrls);
        }).catch(() => {
            return undefined;
        });
    }

    public deleteBackupCampaigns() {
        const operation = new StorageOperation(StorageType.PRIVATE);
        operation.delete('backupcampaign');
        this._storageBridge.queue(operation);
    }

    private getCampaignType(campaign: Campaign): string | undefined {
        if(campaign instanceof PerformanceCampaign) {
            return 'performance';
        } else if(campaign instanceof AdMobCampaign) {
            return 'admob';
        } else if(campaign instanceof MRAIDCampaign) {
            return 'mraid';
        } else {
            return undefined;
        }
    }

    private getCampaignLoader(campaignType: string): CampaignLoader | undefined {
        if(campaignType === 'performance') {
            return new CometCampaignLoader();
        } else if(campaignType === 'admob') {
            return new ProgrammaticAdMobLoader();
        } else if (campaignType === 'mraid') {
            return new MraidLoader();
        } else {
            return undefined;
        }
    }

    private getString(key: string): Promise<string> {
        return this._core.Storage.get<string>(StorageType.PRIVATE, key);
    }

    private getNumber(key: string): Promise<number> {
        return this._core.Storage.get<number>(StorageType.PRIVATE, key);
    }

    private verifyCachedFiles(campaign: Campaign): Promise<Campaign> {
        const requiredAssets = campaign.getRequiredAssets();
        const optionalAssets = campaign.getOptionalAssets();

        if(requiredAssets.length === 0 && optionalAssets.length === 0) {
            return Promise.resolve(campaign);
        }

        const promises = [];

        // unfortunately PerformanceCampaign does not strictly follow requiredAssets and optionalAssets pattern
        // it needs either video (landscape) or portraitVideo cached so this special logic is necessary
        if(campaign instanceof PerformanceCampaign) {
            const video = campaign.getVideo();
            const portraitVideo = campaign.getPortraitVideo();
            if(video && video.isCached()) {
                promises.push(this.verifyCachedAsset(video));
            }

            if(portraitVideo && portraitVideo.isCached()) {
                promises.push(this.verifyCachedAsset(portraitVideo));
            }
        }

        for(const requiredAsset of requiredAssets) {
            promises.push(this.verifyCachedAsset(requiredAsset));
        }

        for(const optionalAsset of optionalAssets) {
            promises.push(this.verifyCachedAsset(optionalAsset));
        }

        return Promise.all(promises).then(() => {
            return campaign;
        });
    }

    private verifyCachedAsset(asset: Asset): Promise<void> {
        const fileId = asset.getFileId();

        if(asset.isCached() && fileId) {
            return this._core.Cache.getFileInfo(fileId).then((fileInfo: IFileInfo) => {
                if(fileInfo.found && fileInfo.size > 0) {
                    return;
                } else {
                    asset.setCachedUrl(undefined);
                    asset.setFileId(undefined);
                    return;
                }
            });
        } else {
            return Promise.resolve();
        }
    }
}
