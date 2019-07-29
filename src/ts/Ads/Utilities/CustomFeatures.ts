import { Platform } from 'Core/Constants/Platform';
import CheetahGamesJson from 'json/custom_features/CheetahGames.json';
import BitmangoGamesJson from 'json/custom_features/BitmangoGames.json';
import Game7GamesJson from 'json/custom_features/Game7Games.json';
import LionStudiosGamesJson from 'json/custom_features/LionStudiosGames.json';
import { SliderEndCardExperiment, ABGroup } from 'Core/Models/ABGroup';
import SliderEndScreenImagesJson from 'json/experiments/SliderEndScreenImages.json';
import { SliderEndScreenImageOrientation } from 'Performance/Models/SliderPerformanceCampaign';
import { VersionMatchers } from 'Ads/Utilities/VersionMatchers';

const JsonStringObjectParser = (json: string): { [index: string]: number } => {
    try {
        return JSON.parse(json);
    } catch {
        return {};
    }
};

const SliderEndScreenImages = JsonStringObjectParser(SliderEndScreenImagesJson);

const JsonStringArrayParser = (gameIdJson: string): string[] => {
    let gameIds: string[];
    try {
        gameIds = JSON.parse(gameIdJson);
    } catch {
        gameIds = [];
    }
    return gameIds;
};
const CheetahGameIds = JsonStringArrayParser(CheetahGamesJson);
const BitmangoGameIds = JsonStringArrayParser(BitmangoGamesJson);
const Game7GameIds = JsonStringArrayParser(Game7GamesJson);
const LionStudiosGameIds = JsonStringArrayParser(LionStudiosGamesJson);

export class CustomFeatures {
    public static isExampleGameId(gameId: string): boolean {
        return gameId === '14850' || gameId === '14851';
    }

    public static isTimehopApp(gameId: string): boolean {
        return gameId === '1300023' || gameId === '1300024';
    }

    public static isWhitelistedToShowInBackground(gameId: string) {
        return gameId === '3016669';    // anipang2 from Korea dev
    }

    public static isNestedIframePlayable(creativeId: string | undefined) {
        return  creativeId === '109455881' ||
                creativeId === '109455877' ||
                creativeId === '109091853' ||
                creativeId === '109091754' ||
                creativeId === '114617576' || // Hellfest
                creativeId === '114617336' || // Hellfest
                creativeId === '145941071' || // Miller Lite Fallback
                creativeId === '145940860' || // Miller Lite Fallback
                creativeId === '147367465' || // Carnival Creative
                creativeId === '151099348' ||
                creativeId === '151338976' ||
                creativeId === '151337994' ||
                creativeId === '152919353' ||
                creativeId === '153119177';
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

    private static existsInList(gameIdList: string[], gameId: string): boolean {
        return gameIdList.indexOf(gameId) !== -1;
    }

    public static sampleAtGivenPercent(givenPercentToSample: number): boolean {

        if (givenPercentToSample <= 0) {
            return false;
        }

        if (givenPercentToSample >= 100) {
            return true;
        }

        if (Math.floor(Math.random() * 100) < givenPercentToSample) {
            return true;
        }

        return false;
    }

    public static isUnsupportedOMVendor(resourceUrl: string) {
        return false;
    }

    public static isSliderEndScreenEnabled(abGroup: ABGroup, targetGameAppStoreId: string, osVersion: string, platform: Platform): boolean {
        const isAndroid4 = platform === Platform.ANDROID && VersionMatchers.matchesMajorOSVersion(4, osVersion);
        const isIOS7 = platform === Platform.IOS && VersionMatchers.matchesMajorOSVersion(7, osVersion);

        // Exclude Android 4 and iOS 7 devices from the test because of layout issues
        if (isAndroid4 || isIOS7) {
            return false;
        }

        return SliderEndCardExperiment.isValid(abGroup) && SliderEndScreenImages[targetGameAppStoreId] !== undefined;
    }

    public static getSliderEndScreenImageOrientation(targetGameAppStoreId: string): SliderEndScreenImageOrientation {
        return SliderEndScreenImages[targetGameAppStoreId];
    }

    public static gameSpawnsNewViewControllerOnFinish(gameId: string): boolean {
        return this.existsInList(LionStudiosGameIds, gameId);
    }

    /**
     *  Method used for gating PTS metrics for this specific Zynga Game using Load API
     */
    public static isTrackedGameUsingLoadApi(gameId: string) {
        return gameId === '2988443';
    }

    public static isWhiteListedForLoadApi(gameId: string) {
        return gameId === '2988443' ||  // Zynga Solitaire          : Android
               gameId === '2988494' ||  // Zynga Freecell           : iOS
               gameId === '2988495' ||  // Zynga Freecell Solitaire : Android
               gameId === '3054609' ||  // Unity Test App           : iOS
               gameId === '3054608' ||  // Unity Test App           : Android
               gameId === '3083498' ||  // Max test ID              : iOS
               gameId === '3083499' ||  // Max test ID              : Android
               gameId === '3238965' ||  // Admob test ID            : iOS
               gameId === '3238964' ||  // Admob test ID            : Android
               gameId === '3238970' ||  // Mopub test ID            : iOS
               gameId === '3238971' ||  // Mopub test ID            : Android
               gameId === '3238972' ||  // IronSource test ID       : iOS
               gameId === '3238973';    // IronSource test ID       : Android
    }

    public static shouldDisableBannerRefresh(gameId: string): boolean {
        if (gameId === '2962474') {
            return true;
        } else {
            return false;
        }
    }

    public static isWebPlayerTestProjects(gameId: string, creativeId: string | undefined) {
        return this.isMRAIDWebPlayerAndroidGamesTest(gameId) && this.isMRAIDWebPlayerCreativesTest(creativeId);
    }

    private static isMRAIDWebPlayerAndroidGamesTest(gameId: string) {
        return gameId === '1789727' ||      // ru.iprado.spot
               gameId === '1373394' ||      // pl.idreams.Dino
               gameId === '2950248' ||      // com.game5mobile.lineandwater
               gameId === '2950184' ||      // com.game5mobile.popular
               gameId === '2639270' ||      // com.ohmgames.paperplane
               gameId === '1300959';        // com.sadpuppy.lemmings
    }

    private static isMRAIDWebPlayerCreativesTest(creativeId: string | undefined) {
        return creativeId === 'futur_idlec_p1.1' ||
               creativeId === 'lions_hooke_p1'   ||
               creativeId === 'gg_bounzy'        ||
               creativeId === 'social_dc';
    }
}
