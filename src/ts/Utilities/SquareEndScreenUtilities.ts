import { Platform } from 'Constants/Platform';
import { ABGroup, SquareEndScreenEnabledAbTest } from 'Models/ABGroup';

export const SQUARE_CAMPAIGNS = [
    {
        customImage: 'https://cdn.unityads.unity3d.com/abtests/800_images/lords_en.jpg',
        campaignIds: [
            '5af41f3346d16a019f9d327d',
            '5afbea849f23a400284f2619',
            '5af534b8e76a0c11fed913de'
        ]
    },
    {
        customImage: 'https://cdn.unityads.unity3d.com/abtests/800_images/lords_pt.jpg',
        campaignIds: [
            '5af41f7dce114315dc22d94d'
        ]
    },
    {
        customImage: 'https://cdn.unityads.unity3d.com/abtests/800_images/fastlane.jpg',
        campaignIds: [
            '5aa28fb107f53705ec4ea9d0',
            '5aa28fb107f53705ec4ea9d1',
            '5aa28fb107f53705ec4ea9d2',
            '5aa28fb107f53705ec4ea9d3',
            '5aa28fb107f53705ec4ea9d4',
            '5aaa837e54e06e034e2fe82c',
            '5aaa837e54e06e034e2fe82f',
            '5aba0813473c01000d0f9525',
            '5ac62f24193d4902ae1df6f1',
            '5ac638cbe0fc6403803b873f',
            '5ac647d999092504fc122a12',
            '5ac65177378bea05b07c5936',
            '5ae9e6a792744e049805904c',
            '5b083378ef90a2015a5bbfcc',
            '5acb6ffeef4b3803b24c43c1',
            '5ad9be26249d6f0128e767f8',
            '5ae092edb352ab07b811d95f',
            '5ae095095ac8a508088ea96c',
            '5ae0997097cfa7086c0b69e3',
            '5ae09a64ae046805c4a862c3',
            '5ae1ebfc660f0102b87099fa',
            '5ae1ed51239de902b8ddc392',
            '5ae1f3009a9c5603129b224d',
            '5ae9e96ca29a6a052418f998',
            '5ae9e971e88f4e04f2c020c3',
            '5ae9e9d0e90fd50538dad995',
            '5af1a5d9d406f40011ded5f4',
            '5afd90b928e8ed06b44806d0',
            '5b02c22881bec301befbaf4f',
            '5b02c4b7c106db018cbb13d4',
            '5b069eae10c98700e2cd535a',
            '5b082e0a87c97500d85144f3',
            '5b083345f8079600ece3527e',
            '5b101e5a83d9d303eea5b14e'
        ]
    },
    {
        customImage: 'https://cdn.unityads.unity3d.com/abtests/800_images/toonblast.jpg',
        campaignIds: [
            '5a942a045461c90416163d2e',
            '5a942a06459c2103a8a853d2',
            '5a942a05e4188f03ee0ba70d',
            '5a942a0420fb3e03f8f256a1',
            '5aa845fe0b2b6c090c06844f',
            '5aa848242cc44409669e4014',
            '5ab4a8f57bfeb51276eeb575',
            '5ab4a8f55816c912948847bc',
            '5ab4a8f431b0a61276669dc8',
            '5acdc70268a2ed005f52880a',
            '5acdc70268a2ed005f528817',
            '5ab4a8f503c6be10d20e6e3d',
            '5a942a03b5c72103d05cd0bc',
            '5aeac508e134d001284b5678',
            '5aeac508e134d001284b5675',
            '5a942a05eb965103933b08ab',
            '5a942a06ae3f9603ea72aefb',
            '5a942a078b8b5c03e49a7da8',
            '5b179a795972c5152841689d',
            '5ae051f033bca802f43154f8',
            '5ae051f033bca802f43154fc',
            '5ac4ae393f01c1024ab83684',
            '5ac4ae393f01c1024ab83683',
            '5ac4ae393f01c1024ab83685',
            '5ac4ae393f01c1024ab83686',
            '5ac4ae393f01c1024ab83689',
            '5ac4ae393f01c1024ab8368a',
            '5ac4ae393f01c1024ab8368c',
            '5ac4ae393f01c1024ab8368f',
            '5ac4ae393f01c1024ab83690',
            '5ac4ae393f01c1024ab8368e',
            '5ac4ae393f01c1024ab83681',
            '5ac4ae393f01c1024ab83687',
            '5ae051f033bca802f43154ee',
            '5ae051f033bca802f43154f1',
            '5ae051f033bca802f43154ed',
            '5ae051f033bca802f43154f3',
            '5ae051f033bca802f43154ef',
            '5ae051f033bca802f43154f7',
            '5ae051f033bca802f43154f2',
            '5ae051f033bca802f43154fa',
            '5acc76a21074a400498957cb',
            '5acc76a21074a400498957c2',
            '5acc76a21074a400498957d0',
            '5acc76a21074a400498957d9',
            '5acc76a21074a400498957ea',
            '5acc76a21074a400498957e1',
            '5acc76a21074a40049895804',
            '5acc76a21074a400498957c0',
            '5acc76a21074a400498957f4',
            '5ac4ae393f01c1024ab83682',
            '5ae051f033bca802f43154fb',
            '5ae051f033bca802f43154f6',
            '5ae051f033bca802f43154f4',
            '5ae051f033bca802f43154f9',
            '5ac4ae393f01c1024ab83688',
            '5ac4ae393f01c1024ab83691',
            '5ac4ae393f01c1024ab8368d',
            '5ac4ae393f01c1024ab8368b',
            '5aeac508e134d001284b567d',
            '5aeac508e134d001284b5680',
            '5ae051f033bca802f43154f0',
            '5ae051f033bca802f43154f5',
            '5b179a795972c515284168a1',
            '5ae0259c1057a3142492c4ac',
            '5ae0259c1057a3142492c4ad',
            '5ae0259c1057a3142492c4ae',
            '5ae0259c1057a3142492c4b0',
            '5ae0259c1057a3142492c4b2',
            '5ae0259c1057a3142492c4b1',
            '5ae0259c1057a3142492c4b6',
            '5ae0259c1057a3142492c4b4',
            '5ae0259c1057a3142492c4b5',
            '5ae0259c1057a3142492c4af',
            '5ae0259c1057a3142492c4b3',
            '5ae0259c1057a3142492c4b7',
            '5a5367d33eedc200114c9b4d',
            '5a5367d4f2fa430018106178',
            '5a5367d5cc34a5003d6d993a',
            '5a5367d61877790056c393c7',
            '5a5367d74f75800036f2b99d',
            '5a5367d88b4be7002400dc13',
            '5a5367d4799fde0049e8e20f',
            '5a5367d4070a7b002cb8522b',
            '5aa7a85cc86fe3001204d1de',
            '5aa839248401ec0862e2cbe1',
            '5a5367d63d4f16002f0844e3',
            '5a5367d5bc8a7c00558e0d01',
            '5abba273d951ee02f4ecf303',
            '5abba273d951ee02f4ecf305',
            '5abba273d951ee02f4ecf306',
            '5abba273d951ee02f4ecf307',
            '5abba273d951ee02f4ecf304',
            '5a4be722f3503d0c54700e05',
            '5a4be7242a187f0c09f9f2d3',
            '5a4be724cfe7d80c3554fad7',
            '5a4be727dd904e0c40ae54db',
            '5a4be729a07e140c4ac1ab01',
            '5a4be72b65c55f0c7cb47e3a',
            '5a4be72afad2050c4a7f15a8',
            '5a4be722d27b5f0c5436951d',
            '5aa7a85c62c8a80036e53d5b',
            '5aa83924f99d69083a73a2cb',
            '5a4be72529f10f08c68889a1',
            '5a4be7284ef32f0c5479bea7'
        ]
    },
    {
        customImage: 'https://cdn.unityads.unity3d.com/abtests/800_images/gunsofglory.jpg',
        campaignIds: [
            '5b18ce3916b2791208e23ead',
            '5b287b705921f11140b9e8f0',
            '5b287d5f3df38210faa9b7a1',
            '5b28a5f1c807f400ce836f84',
            '5b2b479d64eafb1456e00981',
            '5b113bebd17d5c0028fbd2ae',
            '5b193a7ac9180c00e2f977d0',
            '5b1a64327aa4cb01b43d5cbc',
            '5b1f9bfe0ec93903945c31ad',
            '5b1a6eb8e23fd4005802e4f8',
            '5b287a42c5b8e21096d44250',
            '5b10ded979e56d146a482e62',
            '5b10eb3f1bec4615643ba144',
            '5b14de012c689e0966097a18',
            '5b14e32d71a6d50a2e933f31',
            '5b1508667daa1400a641b850',
            '5b150943c74edc01285cbeb0',
            '5b150e055acdb801a028b107',
            '5b15facf27bfa00feb2b3a73',
            '5b1503572896aa004c612d06',
            '5b1a37204606090100a080df',
            '5b1662bf61bab6018c874c46',
            '5b1669ef40adc5024ad74eb8',
            '5b1e8d45fbf86301786c5e88',
            '5b178d6cb8caa514068fddf1',
            '5b192b34e09537002ed79882',
            '5b1a5fe24accc700ff821dff',
            '5b1e4be9c584ff00ba24e0d3',
            '5b07864e465eed0a48ebe1f1',
            '5b07f0d615915e011e7b5529',
            '5b0ba828eeb3564f1658fc28',
            '5b0d52bd1c5c78004fc88e8e',
            '5b0f6ab743624f0fbafc0311',
            '5b1138bc01f5ad049eda47f8'
        ]
    },
    {
        customImage: 'https://cdn.unityads.unity3d.com/abtests/800_images/billiardscity.jpg',
        campaignIds: [
            '5b1f84eec2946901bd903c02',
            '5b1d1468faa4bf3ac6b39123',
            '5b1f84eec2946901bd903bfe',
            '5b1d1468faa4bf3ac6b39128',
            '5b1d1468faa4bf3ac6b3912a',
            '5b1f84eec2946901bd903bfc',
            '5b1d1468faa4bf3ac6b39135',
            '5b1f84efc2946901bd903c05',
            '5b1d1468faa4bf3ac6b39129'
        ]
    },
    {
        customImage: 'https://cdn.unityads.unity3d.com/abtests/800_images/musically1.jpg',
        campaignIds: [
            '5ad7dcf5bfebbb097057e686',
            '5ae77d488fced80ce050eee9',
            '5ae77d488fced80ce050eeeb',
            '5ae78defcb097c0db89e026f',
            '5b032b1a81fbd4054c318112',
            '5b032b1a81fbd4054c318122',
            '5b032b1a81fbd4054c318130',
            '5b032b1a81fbd4054c31812e'
        ]
    },
    {
        customImage: 'https://cdn.unityads.unity3d.com/abtests/800_images/musically2.jpg',
        campaignIds: [
            '5b2b93311e18f803a8ef9698',
            '5b210f570b86f701fab3dc8c',
            '5b04196726bfa402a48c5307',
            '5b04196726bfa402a48c5308',
            '5b04196726bfa402a48c5309',
            '5b04196726bfa402a48c530a',
            '5b04196726bfa402a48c530b',
            '5b10b7d049310311184326dc',
            '5b160a2ea5276410db106bd3'
        ]
    },
    {
        customImage: 'https://cdn.unityads.unity3d.com/abtests/800_images/vikings_ru.jpg',
        campaignIds: [
            '5a6a367e3b2b7005e26f5a4e',
            '5a71b70f1ab3f0004f8ed9b0',
            '5a266b4067c5c80049a7d451',
            '5a434eed45bbae590c398f0f',
            '5aa53e8e59a3ab13dea3b7c2',
            '5b226c9c690c9c06be33cef4',
            '5a6a367e3b2b7005e26f5a69',
            '5aa8d7666e91fe005bbed52d',
            '5aa8d8bb49c77900435ce19b',
            '5ab7b58be6d7623d8d344b21',
            '5ab89ad420696600326f99bb',
            '5acf6f78ff8fe202546b01f8',
            '5ad6f0312dea5d004fb8313c',
            '5ad6fa8ca6047400319257c7',
            '5ad6fbd6910ed9001103799e',
            '5addd84f8b812f02fe8c5368',
            '5af19c4b4f34a600556b6024',
            '5af28f6266fe2b10e6d3d213',
            '5af2e02b39e48f022c959385',
            '5af2e1e0e8882f01dc5b3c9d',
            '5af454318718aa141a3b6e78',
            '5b06a87fd95bed01c829c45d'
        ]
    },
    {
        customImage: 'https://cdn.unityads.unity3d.com/abtests/800_images/vikings_en.jpg',
        campaignIds: [
            '5a6a367e3b2b7005e26f5a3a',
            '5a6a367e3b2b7005e26f5a3c',
            '5a6a367e3b2b7005e26f5a38',
            '5a6a367e3b2b7005e26f5a45',
            '5a6a367e3b2b7005e26f5a49',
            '5a6a367e3b2b7005e26f5a4a',
            '5a6a367e3b2b7005e26f5a46',
            '59afbed18e4338001216fe8d',
            '5a71b70f1ab3f0004f8ed9b3',
            '587dd52a0b0f55261024d0c4',
            '58dcfe71877cb00029b4dc2f',
            '59edd1ed47479800b0df3454',
            '5aa13c200b07c10049cc63b2',
            '5aa151043d29c60844db320e',
            '5aa15224190b07084e942956',
            '59edd1f0b6a51c010a99127d',
            '5a266a6044027a0054b1283d',
            '5a266d26a2f0c00034555af3',
            '5a266e38eb25ca00a695975b',
            '5a6a367e3b2b7005e26f5a32',
            '5aa137585e81830628a6df4a',
            '5aa53e8e59a3ab13dea3b7c3',
            '5af454cc586a190100a09ab3',
            '5a6a367e3b2b7005e26f5a39',
            '5a6a367e3b2b7005e26f5a47',
            '5a6a367e3b2b7005e26f5a3f',
            '5a6a367e3b2b7005e26f5a54',
            '5a6a367e3b2b7005e26f5a4c',
            '5a6a367e3b2b7005e26f5a51',
            '5a6a367e3b2b7005e26f5a4d',
            '5a6a367e3b2b7005e26f5a59',
            '5a6a367e3b2b7005e26f5a5b',
            '5a6a367e3b2b7005e26f5a67',
            '5a6a367e3b2b7005e26f5a64',
            '5a942ee2065c3403e4801310',
            '5a942f8fdf344c042065b548',
            '5a94300c5d5ceb0401208499',
            '5aaa9ad2faebd204bf82f78b',
            '5aaa9bbd5af0e60560bb6d0e',
            '5ab7b58be6d7623d8d344b1f',
            '5ab89ad420696600326f99b8',
            '5aba57adf4a54f0376035bbc',
            '5acf6f78ff8fe202546b01ef',
            '5ad6fc84ae3ae5002fae1d12',
            '5ad702085f7fde00ba4b40d2',
            '5addd8acebbb4d02fe5be422',
            '5afc3a197d19fc000ce22ee6',
            '5b03e060d7e1dc010a2c285c',
            '5b057ce949384b018b91b6ac'
        ]
    },
    {
        customImage: 'https://cdn.unityads.unity3d.com/abtests/800_images/cmlauncher.jpg',
        campaignIds: [
            '5ad842ddae6ee31014a5e197'
        ]
    },
    {
        customImage: 'https://cdn.unityads.unity3d.com/abtests/800_images/cmlauncher2.jpg',
        campaignIds: [
            '5a2f628fff77aa16e0c66cc2'
        ]
    },
    {
        customImage: 'https://cdn.unityads.unity3d.com/abtests/800_images/blockpuzzle.jpg',
        campaignIds: [
            '5b197e8593ce29063cd7a95e',
            '5b197f42a4a60906141f8381',
            '5b197f6af72f57065a0efcbf',
            '5b1947a44078d40114b61fdc',
            '5b0bb9777e5c5d01a0a017d1',
            '5b0bb9777e5c5d01a0a017dd',
            '5b197e8593ce29063cd7a95f',
            '5b197f42a4a60906141f837e',
            '5b197f6af72f57065a0efcbc',
            '5b1947a44078d40114b61fcf',
            '5b0bb9777e5c5d01a0a017cf',
            '5b0bb9777e5c5d01a0a017da'
        ]
    },
    {
        customImage: 'https://cdn.unityads.unity3d.com/abtests/800_images/sniperarena.jpg',
        campaignIds: [
            '5a85a9d3e9404402e965cf3e',
            '5a85a9d3e9404402e965cf3b',
            '5a85a9d3e9404402e965cf3c',
            '5a85a9d3e9404402e965cf3d',
            '5a85a941d77f3302f37d0417',
            '5a85a941d77f3302f37d0418',
            '5a85a941d77f3302f37d0419',
            '5a85a941d77f3302f37d041b',
            '5a85a941d77f3302f37d041a',
            '5a8fe9006e8f91001e152788',
            '5a8fe9006e8f91001e152787',
            '5a8fe9006e8f91001e15278e',
            '5a8fe9006e8f91001e15278a',
            '5a8fe9006e8f91001e15278c',
            '5a8fe9006e8f91001e15278f',
            '5a8fe9006e8f91001e152795',
            '5a8fe9006e8f91001e152791',
            '5a8fe9006e8f91001e152793',
            '5a8fe9006e8f91001e152798',
            '5a8fe9006e8f91001e15279a',
            '5a8fe9006e8f91001e15279c',
            '5a8fe9006e8f91001e1527a1',
            '5a8fe9006e8f91001e15279f',
            '5a8fe9006e8f91001e1527a3',
            '5a8fe9006e8f91001e1527a5',
            '5a8fe9006e8f91001e1527a9',
            '5a8fe9006e8f91001e1527ab',
            '5b081a0c938d580041113646',
            '5b081b40888d160041fe0a33',
            '5ae1c945474d58041626b054',
            '59f745d2ef83c50600446897'
        ]
    }
];

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
