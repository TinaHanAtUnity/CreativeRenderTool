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
            || gameId === '2861297'
            || gameId === '2845426';
    }

    public static isByteDanceSeat(seatId: number | undefined): boolean {
        return seatId === 9116 || seatId === 9154;
    }

    public static isTimerExpirationExperiment(gameId: string): boolean {
        return gameId === '1453434';
    }

    public static isZyngaGame(gameId: string): boolean {
        return gameId === '15004'
            || gameId === '20686'
            || gameId === '21739'
            || gameId === '98530'
            || gameId === '98531'
            || gameId === '114992'
            || gameId === '114993'
            || gameId === '118767'
            || gameId === '1109774'
            || gameId === '1175821'
            || gameId === '1192151'
            || gameId === '1192152'
            || gameId === '1372112'
            || gameId === '1372113'
            || gameId === '1390960'
            || gameId === '1390961'
            || gameId === '1410360'
            || gameId === '1414226'
            || gameId === '1414227'
            || gameId === '1414235'
            || gameId === '1414236'
            || gameId === '1414255'
            || gameId === '1414256'
            || gameId === '1417097'
            || gameId === '1417098'
            || gameId === '1447366'
            || gameId === '1447367'
            || gameId === '1448869'
            || gameId === '1448870'
            || gameId === '1458950'
            || gameId === '1458951'
            || gameId === '1467848'
            || gameId === '1467849'
            || gameId === '1475967'
            || gameId === '1475968'
            || gameId === '1493884'
            || gameId === '1493885'
            || gameId === '1503417'
            || gameId === '1503418'
            || gameId === '1528834'
            || gameId === '1528835'
            || gameId === '1537504'
            || gameId === '1566978'
            || gameId === '1574641'
            || gameId === '1574642'
            || gameId === '1632335'
            || gameId === '1635343'
            || gameId === '1635344'
            || gameId === '1702113'
            || gameId === '1702114'
            || gameId === '1702360'
            || gameId === '1702361'
            || gameId === '2778131'
            || gameId === '2778132'
            || gameId === '2792900'
            || gameId === '2792901'
            || gameId === '2796593'
            || gameId === '2796594'
            || gameId === '2895987'
            || gameId === '2895988'
            || gameId === '2895998'
            || gameId === '2896000'
            || gameId === '2988442'
            || gameId === '2988443'
            || gameId === '2988494'
            || gameId === '2988495';
    }
}
