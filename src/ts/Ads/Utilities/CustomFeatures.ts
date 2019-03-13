import { Platform } from 'Core/Constants/Platform';
import CheetahGamesJson from 'json/custom_features/CheetahGames.json';
import BitmangoGamesJson from 'json/custom_features/BitmangoGames.json';
import ZyngaGamesJson from 'json/custom_features/ZyngaGames.json';
import Game7GamesJson from 'json/custom_features/Game7Games.json';
import { Campaign } from 'Ads/Models/Campaign';
import { IosUtils } from 'Ads/Utilities/IosUtils';
import { DeviceInfo } from 'Core/Models/DeviceInfo';
import { XPromoCampaign } from 'XPromo/Models/XPromoCampaign';
import { PerformanceCampaign } from 'Performance/Models/PerformanceCampaign';
import { CoreConfiguration } from 'Core/Models/CoreConfiguration';
import { toAbGroup, HoldOutInstallInRewardedVideos } from 'Core/Models/ABGroup';

const CheetahGameIds = setGameIds(CheetahGamesJson);
const BitmangoGameIds = setGameIds(BitmangoGamesJson);
const ZyngaGameIds = setGameIds(ZyngaGamesJson);
const Game7GameIds = setGameIds(Game7GamesJson);

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
                creativeId === '114617336';   // Hellfest
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

    public static isRewardedVideoInstallButtonEnabled(campaign: Campaign, coreConfig: CoreConfiguration) {
        if (HoldOutInstallInRewardedVideos.isValid(coreConfig.getAbGroup())) {
            return false;
        }

        return (campaign instanceof PerformanceCampaign || campaign instanceof XPromoCampaign);
    }

    private static existsInList(gameIdList: string[], gameId: string): boolean {
        return gameIdList.indexOf(gameId) !== -1;
    }
}
