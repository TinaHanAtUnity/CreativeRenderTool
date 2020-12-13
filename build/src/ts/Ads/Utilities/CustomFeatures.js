import CheetahGamesJson from 'json/custom_features/CheetahGames.json';
import BitmangoGamesJson from 'json/custom_features/BitmangoGames.json';
import NestedIframePlayableCreativeJson from 'json/custom_features/NestedIframePlayableCreatives.json';
import Game7GamesJson from 'json/custom_features/Game7Games.json';
import LionStudiosGamesJson from 'json/custom_features/LionStudiosGames.json';
import MobilityWareGamesJson from 'json/custom_features/MobilityWareGames.json';
import CacheModeAllowedExperimentGames from 'json/custom_features/CacheModeAllowedExperimentGames.json';
export class CustomFeatures {
    static shouldSendLoadFillEvent() {
        return this.sampleAtGivenPercent(55);
    }
    static isTencentSeat(seatId) {
        return seatId === 9107 ||
            seatId === 9258;
    }
    static isNoGzipGame(gameId) {
        return gameId === '1475968' ||
            gameId === '1708468' ||
            gameId === '3391175' ||
            gameId === '37214' ||
            gameId === '37215';
    }
    static isExampleGameId(gameId) {
        return gameId === '14850' || gameId === '14851';
    }
    static isTimehopApp(gameId) {
        return gameId === '1300023' || gameId === '1300024';
    }
    static isWhitelistedToShowInBackground(gameId) {
        return gameId === '3016669'; // anipang2 from Korea dev
    }
    static isNestedIframePlayable(creativeId) {
        return creativeId !== undefined && this.existsInList(NestedIframePlayableCreativeJson, creativeId);
    }
    static isCacheModeAllowedTestGame(gameId) {
        return this.existsInList(CacheModeAllowedExperimentGames, gameId);
    }
    static isLoopMeSeat(seatId) {
        return seatId === 9119 ||
            seatId === 9121;
    }
    static isPlayableConfigurationEnabled(originalResourceUrl) {
        return originalResourceUrl.match(/playables\/production\/unity/);
    }
    static isSimejiJapaneseKeyboardApp(gameId) {
        // Baidu's Simeji Japanese Keyboard extension app
        // Ad unit should be closed when going background on iOS
        return gameId === '1795561';
    }
    static isCloseIconSkipEnabled(gameId) {
        // skip icon is replaced with the close icon
        // Android back button enabled on video overlays for skipping the video ads
        // This is also applied to games by Bitmango and Game7 who requested to toggle same features as Cheetah
        // this should be cleaned once there is proper backend support for these features
        return this.existsInList(CheetahGamesJson, gameId)
            || this.existsInList(BitmangoGamesJson, gameId)
            || this.existsInList(Game7GamesJson, gameId)
            || this.existsInList(MobilityWareGamesJson, gameId);
    }
    static isTimerExpirationExperiment(gameId) {
        return gameId === '1453434';
    }
    static existsInList(gameIdList, gameId) {
        return gameIdList.indexOf(gameId) !== -1;
    }
    static sampleAtGivenPercent(givenPercentToSample) {
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
    static isUnsupportedOMVendor(resourceUrl) {
        return false;
    }
    static gameSpawnsNewViewControllerOnFinish(gameId) {
        return this.existsInList(LionStudiosGamesJson, gameId) || gameId === '1195277';
    }
    /**
     * Returns true for the 3.1/3.2 Load Whitelist for the 90/10 Reverse Load AB Test
     */
    static isZyngaDealGame(gameId) {
        const wordsWithFriends = ['2895988', '2895998', '2796593', '2895987', '2896000', '2796594'];
        const zyngaSolitaire = ['2988442', '2988443', '2988494', '2988495'];
        return this.existsInList(wordsWithFriends, gameId) || this.existsInList(zyngaSolitaire, gameId);
    }
    static isExternalMopubTestGameForLoad(gameId) {
        return gameId === '2788221';
    }
    static isPSPTestAppGame(gameId) {
        return gameId === '1926039' || gameId === '1732577' || gameId === '3206806';
    }
    static isCheetahTestGameForLoad(gameId) {
        return (gameId === '3058518' || gameId === '3058519');
    }
    static isFanateeExtermaxGameForLoad(gameId) {
        const fanateeGames = ['56659', '1225669'];
        const etermaxGames = ['20721', '20723', '89611', '1781085', '1781084'];
        return this.existsInList(fanateeGames, gameId) ||
            this.existsInList(etermaxGames, gameId);
    }
    static shouldDisableBannerRefresh(gameId) {
        if (gameId === '2962474') {
            return true;
        }
        else {
            return false;
        }
    }
    static isWebPlayerTestProjects(gameId, creativeId) {
        return this.isMRAIDWebPlayerAndroidGamesTest(gameId) && this.isMRAIDWebPlayerCreativesTest(creativeId);
    }
    static isIASVastTag(wrapperURL) {
        return /^https?:\/\/vast\.adsafeprotected\.com/.test(wrapperURL) ||
            /^https?:\/\/vastpixel3\.adsafeprotected\.com/.test(wrapperURL);
    }
    static isMRAIDWebPlayerAndroidGamesTest(gameId) {
        return gameId === '1789727' || // ru.iprado.spot
            gameId === '1373394' || // pl.idreams.Dino
            gameId === '2950248' || // com.game5mobile.lineandwater
            gameId === '2950184' || // com.game5mobile.popular
            gameId === '2639270' || // com.ohmgames.paperplane
            gameId === '1300959'; // com.sadpuppy.lemmings
    }
    static isMRAIDWebPlayerCreativesTest(creativeId) {
        return creativeId === 'futur_idlec_p1.1' ||
            creativeId === 'lions_hooke_p1' ||
            creativeId === 'gg_bounzy' ||
            creativeId === 'social_dc';
    }
    static isIASVendor(omVendor) {
        return omVendor === 'IAS' ||
            omVendor === 'integralads.com-omid';
    }
    static isDoubleClickGoogle(vendorKey) {
        return vendorKey ? vendorKey.startsWith('doubleclickbygoogle.com') : false;
    }
    static isMoatVendor(vendorKey) {
        return vendorKey ? vendorKey.includes('moat.com') : false;
    }
    static isWhitelistedOMVendor(omVendor) {
        return this.isIASVendor(omVendor) ||
            this.isDoubleClickGoogle(omVendor) ||
            omVendor === 'doubleverify.com-omid' ||
            this.isMoatVendor(omVendor);
    }
    // Enables experimental PausableListenerApi, which allows pausing and resuming events.
    // This is needed as a fix for https://jira.unity3d.com/browse/ABT-1125.
    static pauseEventsSupported(gameId) {
        return gameId === '1543460' || // richardh, test app (Apple App Store)
            gameId === '1543461' || // richardh, test app (Google Play Store)
            gameId === '80222'; // Pocketgems, Episode (Google Play Store)
    }
    static shouldVideoOverlayRemainVisible(orgId) {
        return orgId === '2878851';
    }
    // Enable skipping the orientation safety check on iOS as in some cases it
    // can causes crashes for publishers: https://jira.unity3d.com/browse/ABT-1080
    static allowSupportedOrientationCheck(gameId) {
        const skipCheckGameIds = [
            '3254219',
            '3262346',
            '1636888',
            '3268075'
        ];
        // return true if not in list.
        return !this.existsInList(skipCheckGameIds, gameId);
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQ3VzdG9tRmVhdHVyZXMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9zcmMvdHMvQWRzL1V0aWxpdGllcy9DdXN0b21GZWF0dXJlcy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLGdCQUFnQixNQUFNLHdDQUF3QyxDQUFDO0FBQ3RFLE9BQU8saUJBQWlCLE1BQU0seUNBQXlDLENBQUM7QUFDeEUsT0FBTyxnQ0FBZ0MsTUFBTSx5REFBeUQsQ0FBQztBQUN2RyxPQUFPLGNBQWMsTUFBTSxzQ0FBc0MsQ0FBQztBQUNsRSxPQUFPLG9CQUFvQixNQUFNLDRDQUE0QyxDQUFDO0FBQzlFLE9BQU8scUJBQXFCLE1BQU0sNkNBQTZDLENBQUM7QUFDaEYsT0FBTywrQkFBK0IsTUFBTSwyREFBMkQsQ0FBQztBQUV4RyxNQUFNLE9BQU8sY0FBYztJQUVoQixNQUFNLENBQUMsdUJBQXVCO1FBQ2pDLE9BQU8sSUFBSSxDQUFDLG9CQUFvQixDQUFDLEVBQUUsQ0FBQyxDQUFDO0lBQ3pDLENBQUM7SUFFTSxNQUFNLENBQUMsYUFBYSxDQUFDLE1BQTBCO1FBQ2xELE9BQU8sTUFBTSxLQUFLLElBQUk7WUFDZixNQUFNLEtBQUssSUFBSSxDQUFDO0lBQzNCLENBQUM7SUFFTSxNQUFNLENBQUMsWUFBWSxDQUFDLE1BQWM7UUFDckMsT0FBTyxNQUFNLEtBQUssU0FBUztZQUNwQixNQUFNLEtBQUssU0FBUztZQUNwQixNQUFNLEtBQUssU0FBUztZQUNwQixNQUFNLEtBQUssT0FBTztZQUNsQixNQUFNLEtBQUssT0FBTyxDQUFDO0lBQzlCLENBQUM7SUFFTSxNQUFNLENBQUMsZUFBZSxDQUFDLE1BQWM7UUFDeEMsT0FBTyxNQUFNLEtBQUssT0FBTyxJQUFJLE1BQU0sS0FBSyxPQUFPLENBQUM7SUFDcEQsQ0FBQztJQUVNLE1BQU0sQ0FBQyxZQUFZLENBQUMsTUFBYztRQUNyQyxPQUFPLE1BQU0sS0FBSyxTQUFTLElBQUksTUFBTSxL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