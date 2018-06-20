import { Platform } from 'Constants/Platform';
import { ABGroup } from 'Models/ABGroup';
import { SquareEndScreenEnabledAbTest } from 'Models/ABGroup';

export const SQUARE_CAMPAIGNS = [
    {
        customImage: 'https://cdn.unityads.unity3d.com/abtests/800_images/homescapes.jpg',
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
        customImage: 'https://cdn.unityads.unity3d.com/abtests/800_images/angrybirds2.jpg',
        campaignIds: [
            '5a86c548ed250d00c4f7ce49',
            '5a86c548ed250d00c4f7ce4a',
            '5a86c548ed250d00c4f7ce4e',
            '5a86ca17f5e9cd00d835180b',
            '5a9928043eaac50036de6c09',
            '5abca79c69091201643238fa',
            '5abca79c69091201643238ff',
            '5abca79c6909120164323904',
            '5abca79c690912016432393e',
            '5ad5d1ff6e9f6602b7ca3b4c',
            '5ae2ff325a84d70036a58e1a',
            '5ae2ff325a84d70036a58e1d'
        ],
    },
    {
        customImage: 'https://cdn.unityads.unity3d.com/abtests/800_images/jelly.jpg',
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

// Egor-TODO: Not really best practice to have these here after the ABGroup change, only used for testing tho.
export const SQUARE_END_SCREEN_AB_GROUPS = [ABGroup.getAbGroup(18), ABGroup.getAbGroup(19)];

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

    public static useSquareEndScreenAlt(abGroup: ABGroup, platform: Platform, campaignId?: string, osVersion?: string): boolean {
        if (!osVersion || !campaignId) {
            return false;
        }

        if (!SquareEndScreenEnabledAbTest.isValid(abGroup)) {
            return false;
        }

        if (this.hasCustomImage(campaignId) && this.isDeviceSupported(osVersion, platform)) {
            return true;
        }

        return false;
    }

    public static isDeviceSupported(osVersion: string, platform: Platform): boolean {
        if (platform === Platform.ANDROID && osVersion.match(/^4/)) {
            return false;
        }

        return true;
    }
}
