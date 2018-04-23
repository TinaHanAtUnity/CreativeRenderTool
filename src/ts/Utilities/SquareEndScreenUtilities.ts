import { Platform } from 'Constants/Platform';

export const SQUARE_CAMPAIGNS = [
    {
        customImage: 'http://cdn.unityads.unity3d.com/abtests/800_images/homescapes.jpg',
        campaignIds: [
            '59c20aaed34ca7123046fed0',
            '59c209f17e8caf1258703669',
            '59c102cb1329ba0100637424',
            '59c20aee99b0e412266365de',
            '59c247422c542115a045e7ea',
            '59c247ef6c835115b368f97e',
            '59c7c4881dfdec52b751f41e',
            '59c7c5f977b01e0326026d9b',
            '5a30fdd3b8ebfe0420ee374e',
            '59c2364247257b1456ac3778',
            '5ab4e8a4cbfc5500cee26ebb'
        ]
    },
    {
        customImage: 'http://cdn.unityads.unity3d.com/abtests/800_images/angrybirds2.jpg',
        campaignIds: [
            '5abb8462149ff500300f0748',
            '5abb8462149ff500300f0749',
            '5abb8462149ff500300f074b',
            '5abb8462149ff500300f074d',
            '5abb8462149ff500300f074c',
            '5abb8462149ff500300f074e',
            '5abb8462149ff500300f0746',
            '5abb8462149ff500300f074a'
        ],
    },
    {
        customImage: 'http://cdn.unityads.unity3d.com/abtests/800_images/jelly.jpg',
        campaignIds: [
            '5a707dde709a4005ecf945cd',
            '5a707ddf4f24e305b07a9da0',
            '5a707de058413f0600638e05',
            '5a707de11dff6705f6ec6210',
            '5a707de2b8d500053868ac12',
            '5a707de21c96f4060a4d05ba',
            '5a707dde07888a05bb85b132',
            '5a707ddd4d970d03d0792d0d',
            '5aa7a860fe9fce003ef9981f',
            '5aa839284f7aa40844d8f049',
            '5a707de1bc3fb905ce5783e5',
            '5a707de0be070f05f68ed5da',
            '5abba333fc76b802fe2650a8',
            '5abba333fc76b802fe2650ac',
            '5abba333fc76b802fe2650aa',
            '5abba333fc76b802fe2650b2',
            '5abba333fc76b802fe2650b0',
            '5abba333fc76b802fe2650b6',
            '5abba333fc76b802fe2650b4',
            '5abba333fc76b802fe2650b9',
            '5abba333fc76b802fe2650bb',
            '5abba333fc76b802fe2650bd',
            '5abba95584048f0178167fb8',
            '5abba333fc76b802fe2650a4',
            '5abba333fc76b802fe2650a6',
            '5abba333fc76b802fe2650ae'
        ]
    }
];

export const SQUARE_END_SCREEN_AB_GROUPS = [18, 19];

export class SquareEndScreenUtilities {

    public static hasCustomImage(campaignId: string): boolean {
        return !!this.getCustomImage(campaignId);
    }

    public static getCustomImage(campaignId: string): string | undefined {
        for (const campaign of SQUARE_CAMPAIGNS) {
            if (campaign.campaignIds.indexOf(campaignId) > -1) {
                return campaign.customImage;
            }
        }

        return undefined;
    }

    public static useSquareEndScreenAlt(abGroup: number, platform: Platform, campaignId?: string, osVersion?: string): boolean {
        if (!osVersion || !campaignId) {
            return false;
        }

        if (this.isInCorrectABGroup(abGroup) && this.hasCustomImage(campaignId) && this.isDeviceSupported(osVersion, platform)) {
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
