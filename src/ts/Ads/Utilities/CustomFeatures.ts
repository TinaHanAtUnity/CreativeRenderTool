import { Platform } from 'Core/Constants/Platform';
import CheetahGamesJson from 'json/custom_features/CheetahGames.json';
import BitmangoGamesJson from 'json/custom_features/BitmangoGames.json';
import ZyngaGamesJson from 'json/custom_features/ZyngaGames.json';
import Game7GamesJson from 'json/custom_features/Game7Games.json';
import iOSV5GamesJson from 'json/custom_features/iOSV5Games.json';
import { Campaign } from 'Ads/Models/Campaign';
import { XPromoCampaign } from 'XPromo/Models/XPromoCampaign';
import { PerformanceCampaign } from 'Performance/Models/PerformanceCampaign';
import { CoreConfiguration } from 'Core/Models/CoreConfiguration';
import { HoldOutInstallInRewardedVideos } from 'Core/Models/ABGroup';

const CheetahGameIds = setGameIds(CheetahGamesJson);
const BitmangoGameIds = setGameIds(BitmangoGamesJson);
const ZyngaGameIds = setGameIds(ZyngaGamesJson);
const Game7GameIds = setGameIds(Game7GamesJson);
const iOSV5GameIds = setGameIds(iOSV5GamesJson);

function setGameIds(gameIdJson: string): string[] {
    let gameIds: string[];
    try {
        gameIds = JSON.parse(gameIdJson);
    } catch {
        gameIds = [];
    }
    return gameIds;
}

export class CustomFeatures {
    public static isExampleGameId(gameId: string): boolean {
        return gameId === '14850' || gameId === '14851';
    }

    public static isTimehopApp(gameId: string): boolean {
        return gameId === '1300023' || gameId === '1300024';
    }

    public static isSonicPlayable(creativeId: string | undefined) {
        return  creativeId === '109455881' ||
                creativeId === '109455877' ||
                creativeId === '109091853' ||
                creativeId === '109091754' ||
                creativeId === '114617576' || // Hellfest
                creativeId === '114617336' || // Hellfest
                creativeId === '145941071' || // Miller Lite Fallback
                creativeId === '145940860' || // Miller Lite Fallback
                creativeId === '147367465';   // Carnival Creative
    }

    public static isLoopMeSeat(seatId: number | undefined): boolean {
        return seatId === 9119 ||
               seatId === 9121;
    }

    public static isPlayableConfigurationEnabled(originalResourceUrl: string) {
        return originalResourceUrl.match(/playables\/production\/unity/);
    }

    public static isSimejiJapaneseKeyboardApp(gameId: string): boolean {
        // Baidu's Simeji Japanese Keyboard extension app
        // Ad unit should be closed when going background on iOS
        return gameId === '1795561';
    }

    public static isCloseIconSkipEnabled(gameId: string) {
        // skip icon is replaced with the close icon
        // Android back button enabled on video overlays for skipping the video ads
        // This is also applied to games by Bitmango and Game7 who requested to toggle same features as Cheetah
        // this should be cleaned once there is proper backend support for these features
        return this.existsInList(CheetahGameIds, gameId)
            || this.existsInList(BitmangoGameIds, gameId)
            || this.existsInList(Game7GameIds, gameId);

    }

    public static isChinaSDK(platform: Platform, versionName: string): boolean {
        return platform === Platform.ANDROID
            && versionName.endsWith('china');
    }

    public static isTimerExpirationExperiment(gameId: string): boolean {
        return gameId === '1453434';
    }

    public static isZyngaGame(gameId: string): boolean {
        return this.existsInList(ZyngaGameIds, gameId);
    }

    public static isIOSV5Games(gameId: string): boolean {
        return this.existsInList(iOSV5GameIds, gameId);
    }

    public static isRewardedVideoInstallButtonEnabled(campaign: Campaign, coreConfig: CoreConfiguration) {
        if (HoldOutInstallInRewardedVideos.isValid(coreConfig.getAbGroup())) {
            return false;
        }

        return (campaign instanceof PerformanceCampaign || campaign instanceof XPromoCampaign);
    }

    private static existsInList(gameIdList: string[], gameId: string): boolean {
        return gameIdList.indexOf(gameId) !== -1;
    }

<<<<<<< HEAD
    // Following 2 functions could be merged at some point later
    public static isSliderEndScreenEnabled(campaignId: string): boolean {
        const targetCampaignIds = [
            'TBD',
            'TBD'
        ];

        return true;
    }

    private static getSlideshowCampaignIDs(): string {
        const targetGameIds = [
            '343200656',
            'com.supercell.brawlstars',
            'com.hcg.cok.gp'
        ];
        const randomGame = Math.floor(Math.random() * 3);
        return targetGameIds[randomGame];
        }

    public static getScreenshotsUrls(campaignId: string): string[] {
        const campaignId_rnd = CustomFeatures.getSlideshowCampaignIDs();
        const screenshots: { [key: string]: string[] } = {
            '343200656':[
                'https://unity-ads-test.s3.amazonaws.com/343200656/0.png',
                'https://unity-ads-test.s3.amazonaws.com/343200656/4.png',
                'https://unity-ads-test.s3.amazonaws.com/343200656/1.png',
                'https://unity-ads-test.s3.amazonaws.com/343200656/2.png',
                'https://unity-ads-test.s3.amazonaws.com/343200656/3.png'
            ],
            'com.supercell.brawlstars':[
                'https://unity-ads-test.s3.amazonaws.com/com.supercell.brawlstars/2.png',
                'https://unity-ads-test.s3.amazonaws.com/com.supercell.brawlstars/7.png',
                'https://unity-ads-test.s3.amazonaws.com/com.supercell.brawlstars/1.png',
                'https://unity-ads-test.s3.amazonaws.com/com.supercell.brawlstars/0.png',
                'https://unity-ads-test.s3.amazonaws.com/com.supercell.brawlstars/4.png',
                'https://unity-ads-test.s3.amazonaws.com/com.supercell.brawlstars/3.png',
                'https://unity-ads-test.s3.amazonaws.com/com.supercell.brawlstars/12.png',
                'https://unity-ads-test.s3.amazonaws.com/com.supercell.brawlstars/5.png',
                'https://unity-ads-test.s3.amazonaws.com/com.supercell.brawlstars/10.png',
                'https://unity-ads-test.s3.amazonaws.com/com.supercell.brawlstars/9.png',
                'https://unity-ads-test.s3.amazonaws.com/com.supercell.brawlstars/14.png',
                'https://unity-ads-test.s3.amazonaws.com/com.supercell.brawlstars/11.png',
                'https://unity-ads-test.s3.amazonaws.com/com.supercell.brawlstars/6.png',
                'https://unity-ads-test.s3.amazonaws.com/com.supercell.brawlstars/8.png',
                'https://unity-ads-test.s3.amazonaws.com/com.supercell.brawlstars/13.png'
            ],
            'com.hcg.cok.gp':[
                'https://unity-ads-test.s3.amazonaws.com/com.hcg.cok.gp/5.png',
                'https://unity-ads-test.s3.amazonaws.com/com.hcg.cok.gp/0.png',
                'https://unity-ads-test.s3.amazonaws.com/com.hcg.cok.gp/4.png',
                'https://unity-ads-test.s3.amazonaws.com/com.hcg.cok.gp/2.png',
                'https://unity-ads-test.s3.amazonaws.com/com.hcg.cok.gp/3.png',
                'https://unity-ads-test.s3.amazonaws.com/com.hcg.cok.gp/6.png',
                'https://unity-ads-test.s3.amazonaws.com/com.hcg.cok.gp/1.png',
                'https://unity-ads-test.s3.amazonaws.com/com.hcg.cok.gp/18.png',
                'https://unity-ads-test.s3.amazonaws.com/com.hcg.cok.gp/16.png',
                'https://unity-ads-test.s3.amazonaws.com/com.hcg.cok.gp/15.png',
                'https://unity-ads-test.s3.amazonaws.com/com.hcg.cok.gp/19.png',
                'https://unity-ads-test.s3.amazonaws.com/com.hcg.cok.gp/14.png',
                'https://unity-ads-test.s3.amazonaws.com/com.hcg.cok.gp/17.png',
                'https://unity-ads-test.s3.amazonaws.com/com.hcg.cok.gp/7.png',
                'https://unity-ads-test.s3.amazonaws.com/com.hcg.cok.gp/8.png',
                'https://unity-ads-test.s3.amazonaws.com/com.hcg.cok.gp/11.png',
                'https://unity-ads-test.s3.amazonaws.com/com.hcg.cok.gp/20.png',
                'https://unity-ads-test.s3.amazonaws.com/com.hcg.cok.gp/9.png',
                'https://unity-ads-test.s3.amazonaws.com/com.hcg.cok.gp/13.png',
                'https://unity-ads-test.s3.amazonaws.com/com.hcg.cok.gp/12.png',
                'https://unity-ads-test.s3.amazonaws.com/com.hcg.cok.gp/10.png'
            ]
        };
        return screenshots[campaignId_rnd];
=======
    public static shouldSampleAtOnePercent(): boolean {
        // will only return true when Math.random returns 0
        if (Math.floor(Math.random() * 100) % 100 === 0) {
            return true;
        } else {
            return false;
        }
    }

    public static shouldSampleAtTenPercent(): boolean {
        // will only return true when Math.random returns 1
        if (Math.floor(Math.random() * 10) % 10 === 1) {
            return true;
        } else {
            return false;
        }
>>>>>>> master
    }
}
