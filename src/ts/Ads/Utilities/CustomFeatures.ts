import CheetahGamesJson from 'json/custom_features/CheetahGames.json';
import BitmangoGamesJson from 'json/custom_features/BitmangoGames.json';
import NestedIframePlayableCreativeJson from 'json/custom_features/NestedIframePlayableCreatives.json';
import Game7GamesJson from 'json/custom_features/Game7Games.json';
import LionStudiosGamesJson from 'json/custom_features/LionStudiosGames.json';
import MobilityWareGamesJson from 'json/custom_features/MobilityWareGames.json';
import CacheModeAllowedExperimentGames from 'json/custom_features/CacheModeAllowedExperimentGames.json';

export class CustomFeatures {

    public static isExcludedGameFromCacheModeTest(gameId: string) {
        return gameId === '1365102' || gameId === '3254102';
    }

    public static isTencentSeat(seatId: number | undefined): boolean {
        return seatId === 9107 ||
               seatId === 9258;
    }

    public static isNoGzipGame(gameId: string): boolean {
        return gameId === '1475968' ||
               gameId === '1708468' ||
               gameId === '3391175' ||
               gameId === '37214' ||
               gameId === '37215';
    }

    public static isExampleGameId(gameId: string): boolean {
        return gameId === '14850' || gameId === '14851';
    }

    public static isTimehopApp(gameId: string): boolean {
        return gameId === '1300023' || gameId === '1300024';
    }

    public static isWhitelistedToShowInBackground(gameId: string) {
        return gameId === '3016669'; // anipang2 from Korea dev
    }

    public static isNestedIframePlayable(creativeId: string | undefined) {
        return creativeId !== undefined && this.existsInList(NestedIframePlayableCreativeJson, creativeId);
    }

    public static isCacheModeAllowedTestGame(gameId: string): boolean {
        return this.existsInList(CacheModeAllowedExperimentGames, gameId);
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
        return this.existsInList(CheetahGamesJson, gameId)
            || this.existsInList(BitmangoGamesJson, gameId)
            || this.existsInList(Game7GamesJson, gameId)
            || this.existsInList(MobilityWareGamesJson, gameId);

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
        return this.existsInList(LionStudiosGamesJson, gameId) || gameId === '1195277';
    }

    /**
     * Returns true for the 3.1/3.2 Load Whitelist for the 90/10 Reverse Load AB Test
     */
    public static isZyngaDealGame(gameId: string): boolean {
        const wordsWithFriends = ['2895988', '2895998', '2796593', '2895987', '2896000', '2796594'];
        const zyngaSolitaire = ['2988442', '2988443', '2988494', '2988495'];
        return this.existsInList(wordsWithFriends, gameId) || this.existsInList(zyngaSolitaire, gameId);
    }

    public static isExternalMopubTestGameForLoad(gameId: string): boolean {
        return gameId === '2788221';
    }

    public static isPSPTestAppGame(gameId: string): boolean {
        return gameId === '1926039' || gameId === '1732577' || gameId === '3206806';
    }

    public static isCheetahTestGameForLoad(gameId: string): boolean {
        return (gameId === '3058518' || gameId === '3058519');

    }

    public static isFanateeExtermaxGameForLoad(gameId: string): boolean {
        const fanateeGames = ['56659', '1225669'];
        const etermaxGames = ['20721', '20723', '89611', '1781085', '1781084'];

        return this.existsInList(fanateeGames, gameId) ||
               this.existsInList(etermaxGames, gameId);
    }

    public static isLoadV5Game(gameId: string): boolean {
        const gameIds = [
            '1783252', '1781853', '1781854', // Initial Games
            '1428861', '1428862', // Chimera Game
            '1434564', '3079031', '3334336', '3211592', '1566453', '3334337', // First batch
            '56659', '1514842', '3486364', '3475665', '3334339', '1346246', '1658494', // Second batch
            '1548038', '3250882', '1783251', '3464560', '1551176', '1565348', '3250883', // Second batch
            '3334338', '3486365', '3475664', '131622009', '1551177', '3464561', // Second batch
            '3147786', '3147787', // Voodoo Games
            '2830470', '2830469', '1550799', '1550800', '1448936', '1448937', '1781085', // Etermax Games
            '1781084', '1178247', '2242221', '3532036', '3532037', '2115428', // Etermax Games
            '20723', '20721', '2337355', '89610', '89611', '3532028', '3532029', // Etermax Games
            '3532031', '3532030', '3532021', '3532020', // Etermax Games
            '1616156', '3514607', '1455064', '1104777', '3532356', '3239880', '1712122', '3544375', '3587590',
            '12723', '3397999', '3493681', '2608915', '3409976', '3541918', '1500889', '3018278', '3157462',
            '1662635', '3320399',
            '3364489', '1484914', '3080737', '1335941', '3027195', // Ironsource Games
            '3525257', '3525256'
        ];

        return this.existsInList(gameIds, gameId) || CustomFeatures.isZyngaDealGame(gameId)
            || this.isExternalMopubTestGameForLoad(gameId) || this.isFanateeExtermaxGameForLoad(gameId)
            || this.isCheetahTestGameForLoad(gameId);
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
        return gameId === '1789727' || // ru.iprado.spot
               gameId === '1373394' || // pl.idreams.Dino
               gameId === '2950248' || // com.game5mobile.lineandwater
               gameId === '2950184' || // com.game5mobile.popular
               gameId === '2639270' || // com.ohmgames.paperplane
               gameId === '1300959'; // com.sadpuppy.lemmings
    }

    private static isMRAIDWebPlayerCreativesTest(creativeId: string | undefined) {
        return creativeId === 'futur_idlec_p1.1' ||
               creativeId === 'lions_hooke_p1' ||
               creativeId === 'gg_bounzy' ||
               creativeId === 'social_dc';
    }

    public static isIASVendor(omVendor: string | undefined) {
        return omVendor === 'IAS' ||
               omVendor === 'integralads.com-omid';
    }

    public static isDoubleClickGoogle(vendorKey: string | undefined): boolean {
        return vendorKey ? vendorKey.startsWith('doubleclickbygoogle.com') : false;
    }

    private static isMoatVendor(vendorKey: string | undefined): boolean {
        return vendorKey ? vendorKey.includes('moat.com') : false;
    }

    public static isWhitelistedOMVendor(omVendor: string | undefined) {
        return this.isIASVendor(omVendor) ||
               this.isDoubleClickGoogle(omVendor) ||
               omVendor === 'doubleverify.com-omid' ||
               this.isMoatVendor(omVendor);
    }

    // Enables experimental PausableListenerApi, which allows pausing and resuming events.
    // This is needed as a fix for https://jira.unity3d.com/browse/ABT-1125.
    public static pauseEventsSupported(gameId: string): boolean {
        return gameId === '1543460' || // richardh, test app (Apple App Store)
               gameId === '1543461' || // richardh, test app (Google Play Store)
               gameId === '80222'; // Pocketgems, Episode (Google Play Store)
    }

    public static shouldVideoOverlayRemainVisible(orgId: string | undefined): boolean {
        return orgId === '2878851';
    }

    // Enable skipping the orientation safety check on iOS as in some cases it
    // can causes crashes for publishers: https://jira.unity3d.com/browse/ABT-1080
    public static allowSupportedOrientationCheck(gameId: string): boolean {
        const skipCheckGameIds = [
            '3254219', // Blowfire
            '3262346',
            '1636888',
            '3268075'
        ];
        // return true if not in list.
        return !this.existsInList(skipCheckGameIds, gameId);
    }
}
