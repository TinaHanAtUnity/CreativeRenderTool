import CheetahGamesJson from 'json/custom_features/CheetahGames.json';
import BitmangoGamesJson from 'json/custom_features/BitmangoGames.json';
import ZyngaGamesJson from 'json/custom_features/ZyngaGames.json';

const CheetahGameIds = setGameIds(CheetahGamesJson);
const BitmangoGameIds = setGameIds(BitmangoGamesJson);
const ZyngaGameIds = setGameIds(ZyngaGamesJson);

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

    public static isCheetahGame(gameId: string) {
        // skip icon is replaced with the close icon
        // Android back button enabled on video overlays for skipping the video ads
        return this.existsInList(CheetahGameIds, gameId)
            // This is also applied to games by Bitmango who requested to toggle same features as Cheetah
            // this should be cleaned once there is proper backend support for these features
            || this.existsInList(BitmangoGameIds, gameId);

    }

    public static isByteDanceSeat(seatId: number | undefined): boolean {
        return seatId === 9116 || seatId === 9154;
    }

    public static isTimerExpirationExperiment(gameId: string): boolean {
        return gameId === '1453434';
    }

    public static isZyngaGame(gameId: string): boolean {
        return this.existsInList(ZyngaGameIds, gameId);
    }

    private static existsInList(gameIdList: string[], gameId: string): boolean {
        return gameIdList.indexOf(gameId) !== -1;
    }
}
