import { Campaign, ICampaign } from 'Models/Campaign';
import { Asset } from 'Models/Assets/Asset';
import { ProgrammaticCampaign, IProgrammaticCampaign } from 'Models/Campaigns/ProgrammaticCampaign';
import { Video } from 'Models/Assets/Video';
import { Model } from 'Models/Model';

export interface IAdMobVideo {
    mediaFileURL: string;
    video: Video;
}

export class AdMobVideo extends Model<IAdMobVideo> {
    constructor(data: IAdMobVideo) {
        super('AdMobVideo', {
            mediaFileURL: ['string'],
            video: ['object']
        }, data);
    }

    public getMediaFileURL(): string {
        return this.get('mediaFileURL');
    }

    public getVideo(): Video {
        return this.get('video');
    }

    public getDTO() {
        return {
            mediaFileUrl: this.getMediaFileURL(),
            video: this.getVideo().getDTO()
        };
    }
}

export interface IAdMobCampaign extends IProgrammaticCampaign {
    dynamicMarkup: string;
    video: AdMobVideo | null;
}

export class AdMobCampaign extends ProgrammaticCampaign<IAdMobCampaign> {
    constructor(campaign: IAdMobCampaign) {
        super('AdMobCampaign', {
            ... ProgrammaticCampaign.Schema,
            dynamicMarkup: ['string'],
            video: ['object', 'null']
        }, campaign);
    }

    public getDynamicMarkup(): string {
        return this.get('dynamicMarkup');
    }

    public getVideo(): AdMobVideo | null {
        return this.get('video');
    }

    public getRequiredAssets(): Asset[] {
        const assets = [];
        const video = this.get('video');
        if (video) {
            assets.push(video.getVideo());
        }
        return assets;
    }

    public getOptionalAssets(): Asset[] {
        return [];
    }

    public isConnectionNeeded(): boolean {
        return false;
    }
}
