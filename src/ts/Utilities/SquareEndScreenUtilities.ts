import { Platform } from 'Constants/Platform';

export const SQUARE_CAMPAIGNS: {[index: string]: string } = {
    '59c2364247257b1456ac3778': 'https://cdn.unityads.unity3d.com/abtests/800_images/homescapes.jpg', // Homescapes
    '5abb845fd27b7d02d0d041f0': 'https://cdn.unityads.unity3d.com/abtests/800_images/angrybirds2.jpg', // Angrybirds 2
    '5abb8d9377477502d0bb4cae': 'https://cdn.unityads.unity3d.com/abtests/800_images/jelly.jpg' // Toons Blast
};

export const SQUARE_END_SCREEN_AB_GROUPS = [18, 19];

export class SquareEndScreenUtilities {

    public static hasCustomImage(campaignId: string): boolean {
        return !!SQUARE_CAMPAIGNS[campaignId];
    }

    public static getCustomImage(campaignId: string): string {
        return SQUARE_CAMPAIGNS[campaignId];
    }

    public static useSquareEndScreenAlt(abGroup: number, platform: Platform, campaignId?: string, osVersion?: string): boolean {
        if (!osVersion || !campaignId) {
            return false;
        }

        if (this.hasCustomImage(campaignId) && this.isDeviceSupported(osVersion, platform) && this.isInCorrectABGroup(abGroup)) {
            return true;
        }

        return false;
    }

    public static isInCorrectABGroup(abGroup: number) {
        return SQUARE_END_SCREEN_AB_GROUPS.indexOf(abGroup) > -1;
    }

    public static isDeviceSupported(osVersion: string, platform: Platform): boolean {
        if (platform === Platform.ANDROID && osVersion.match(/^4/)) {
            return false;
        }

        return true;
    }
}
