import { Asset } from 'Ads/Models/Assets/Asset';
import { Video } from 'Ads/Models/Assets/Video';
import { IProgrammaticCampaign, ProgrammaticCampaign } from 'Ads/Models/Campaigns/ProgrammaticCampaign';
import { Model } from 'Common/Models/Model';

export interface IAdMobVideo {
    mediaFileURL: string;
    video: Video;
    extension: string | null;
}

export class AdMobVideo extends Model<IAdMobVideo> {
    constructor(data: IAdMobVideo) {
        super('AdMobVideo', {
            mediaFileURL: ['string'],
            video: ['object'],
            extension: ['string', 'null']
        }, data);
    }

    public getMediaFileURL(): string {
        return this.get('mediaFileURL');
    }

    public getVideo(): Video {
        return this.get('video');
    }

    public getExtension(): string | null {
        return this.get('extension');
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
        return [];
    }

    public getOptionalAssets(): Asset[] {
        const assets = [];
        const video = this.get('video');
        if (video) {
            assets.push(video.getVideo());
        }
        return assets;
    }

    public isConnectionNeeded(): boolean {
        return true;
    }
}
