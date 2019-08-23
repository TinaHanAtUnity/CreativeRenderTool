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

    /**
     * Rollout plan can be found here: https://docs.google.com/document/d/1QI-bjyTZrwNgx4D6X8_oq5FW_57ikPKBcwbY_MQ_v4g/edit?ts=5d5713ce#
     * Lists are split out to easily handle the rollout plan
     */
    public static isPartOfPhaseTwoLoadRollout(gameId: string): boolean {
        const wordsWithFriends = ['2895988', '2895998', '2796593', '2895987', '2896000', '2796594'];
        const zyngaSolitaire = ['2988443', '2988442', '2988495', '2988494'];

        return this.existsInList(wordsWithFriends, gameId) || this.existsInList(zyngaSolitaire, gameId);
    }

    public static isWhiteListedForLoadApi(gameId: string): boolean {
        return gameId === '2988442' ||  // Zynga Solitaire          : iOS
               gameId === '2988443' ||  // Zynga Solitaire          : Android
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
               gameId === '3238972' ||  // Unity-Ironsource ID      : iOS
               gameId === '3238973' ||  // Unity-Ironsource ID      : Android
               gameId === '1793545' ||  // Sniper Strike            : iOS
               gameId === '1793539' ||  // Sniper Strike            : Android
               gameId === '3239343' ||  // China Unity Support App  : iOS
               gameId === '3239342' ||  // China Unity Support App  : Android
               gameId === '3095066' ||  // Double Win Vegas         : iOS
               gameId === '3095067' ||  // Double Win Vegas         : Android
               gameId === '3248965' ||  // Ironsource Internal ID   : iOS
               gameId === '3248964' ||  // Ironsource Internal ID   : Android
               gameId === '1580822' ||  // SimCity BuildIt China    : iOS
               gameId === '1047241' ||  // Solitaire Deluxe 2       : iOS
               gameId === '1047242' ||  // Solitaire Deluxe 2       : Android
               gameId === '3131831' ||  // Bus Simulator: Ultimate  : iOS
               gameId === '3131830' ||  // Bus Simulator: Ultimate  : Android
               gameId === '3089601' ||  // Always Sunny: GG Mobile  : iOS
               gameId === '3089600' ||  // Always Sunny: GG Mobile  : Android
               gameId === '3112525' ||  // Solitaire Infinite       : iOS
               gameId === '3112524' ||  // Solitaire Infinite       : Android
               gameId === '108057'  ||  // Crossword Quiz           : iOS
               gameId === '105361'  ||  // Crossword Quiz           : Android
               gameId === '20721'   ||  // Trivia Crack             : iOS
               gameId === '20723'   ||  // Trivia Crack             : Android
               gameId === '112873'  ||  // Infinite Word Search     : iOS
               gameId === '113115'  ||  // Infinite Word Search     : Android
               gameId === '2784703' ||  // Bitlife                  : iOS
               gameId === '3179966';    // Lucky Money              : Android
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
