import { Asset } from 'Ads/Models/Assets/Asset';
import { Video } from 'Ads/Models/Assets/Video';
import { IProgrammaticCampaign, ProgrammaticCampaign } from 'Ads/Models/Campaigns/ProgrammaticCampaign';
import { Model } from 'Core/Models/Model';
import { Observable0 } from 'Core/Utilities/Observable';

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
    omVendors: string[];
    isOMEnabled: boolean | undefined;
    shouldMuteByDefault: boolean | undefined;
}

export class AdMobCampaign extends ProgrammaticCampaign<IAdMobCampaign> {

    public readonly omClosedEarly: Observable0;

    constructor(campaign: IAdMobCampaign) {
        super('AdMobCampaign', {
            ... ProgrammaticCampaign.Schema,
            dynamicMarkup: ['string'],
            video: ['object', 'null'],
            omVendors: ['array'],
            isOMEnabled: ['boolean', 'undefined'],
            shouldMuteByDefault: ['boolean', 'undefined']
        }, campaign);
    }

    public isOMEnabled(): boolean | undefined {
        return this.get('isOMEnabled');
    }

    public getOMVendors(): string[] {
        return this.get('omVendors');
    }

    public setOmEnabled(isOMEnabled: boolean): void {
        this.set('isOMEnabled', isOMEnabled);
    }

    public setOMVendors(omVendors: string[]): void {
        this.set('omVendors', omVendors);
    }

    public shouldMuteByDefault(): boolean | undefined {
        return this.get('shouldMuteByDefault');
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
