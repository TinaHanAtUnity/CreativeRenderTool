import { Platform } from 'Core/Constants/Platform';
import CheetahGamesJson from 'json/custom_features/CheetahGames.json';
import BitmangoGamesJson from 'json/custom_features/BitmangoGames.json';
import Game7GamesJson from 'json/custom_features/Game7Games.json';
import LionStudiosGamesJson from 'json/custom_features/LionStudiosGames.json';
import LoadWhitelistSDK3200 from 'json/custom_features/LoadWhitelist.json';

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
const LoadWhitelist = JsonStringArrayParser(LoadWhitelistSDK3200);

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

    public static gameSpawnsNewViewControllerOnFinish(gameId: string): boolean {
        return this.existsInList(LionStudiosGameIds, gameId);
    }

    /**
     * Returns true for the 3.1/3.2 Load Whitelist for the 90/10 Reverse Load AB Test
     */
    public static isZyngaDealGame(gameId: string): boolean {
        const wordsWithFriends = ['2895988', '2895998', '2796593', '2895987', '2896000', '2796594'];
        const zyngaSolitaire = ['2988442', '2988443', '2988494', '2988495'];
        return this.existsInList(wordsWithFriends, gameId) || this.existsInList(zyngaSolitaire, gameId);
    }

    /**
     * Includes the list of games for the 3.2 Load API Whitelist on the 10/90 Load AB Test
     */
    public static isWhiteListedForLoadApi(gameId: string): boolean {
        return this.existsInList(LoadWhitelist, gameId);
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

    public static isIASVastTag(wrapperURL: string): boolean {
        return /^https?:\/\/vast\.adsafeprotected\.com/.test(wrapperURL) ||
               /^https?:\/\/vastpixel3\.adsafeprotected\.com/.test(wrapperURL);
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
