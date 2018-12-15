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
        return gameId === '1196341'
            || gameId === '1594775'
            || gameId === '2755671'
            || gameId === '1451510'
            || gameId === '1585102'
            || gameId === '2808037'
            || gameId === '2755670'
            || gameId === '2625701'
            || gameId === '2625703'
            || gameId === '2845426';
    }

    public static isByteDanceSeat(seatId: number | undefined): boolean {
        return seatId === 9116;
    }
}
