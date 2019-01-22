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
            || gameId === '2845426'
        // following game IDs are from Bitmango who requested to toggle same features as Cheetah
        // this should be cleaned once there is proper backend support for these features
            || gameId === '15391'
            || gameId === '2211169'
            || gameId === '2363810'
            || gameId === '16284'
            || gameId === '2765682'
            || gameId === '2765683'
            || gameId === '2730783'
            || gameId === '2730782'
            || gameId === '16061'
            || gameId === '1878566'
            || gameId === '2055438'
            || gameId === '16062'
            || gameId === '131625570'
            || gameId === '2445047'
            || gameId === '2312323'
            || gameId === '131625571'
            || gameId === '2907327'
            || gameId === '2907326'
            || gameId === '2907308'
            || gameId === '2907309'
            || gameId === '1863295'
            || gameId === '1863296'
            || gameId === '15722'
            || gameId === '1859834'
            || gameId === '2149582'
            || gameId === '15723'
            || gameId === '2685612'
            || gameId === '2685611'
            || gameId === '1541846'
            || gameId === '1541847'
            || gameId === '2668271'
            || gameId === '2668272'
            || gameId === '1541612'
            || gameId === '1541613'
            || gameId === '2765468'
            || gameId === '2765469'
            || gameId === '2485319'
            || gameId === '48355'
            || gameId === '2926628'
            || gameId === '2926630'
            || gameId === '2952181'
            || gameId === '2952180'
            || gameId === '2619760'
            || gameId === '2619759'
            || gameId === '1541834'
            || gameId === '1541835'
            || gameId === '2053161'
            || gameId === '131621886'
            || gameId === '131621885'
            || gameId === '1869053'
            || gameId === '2388960'
            || gameId === '48358'
            || gameId === '16063'
            || gameId === '2030094'
            || gameId === '2335087'
            || gameId === '16064'
            || gameId === '2387137'
            || gameId === '48359'
            || gameId === '2843413'
            || gameId === '2843411'
            || gameId === '1665967'
            || gameId === '1541876'
            || gameId === '1541840'
            || gameId === '1541841'
            || gameId === '1800320'
            || gameId === '1800321'
            || gameId === '1541619'
            || gameId === '1541620'
            || gameId === '1541810'
            || gameId === '1541811'
            || gameId === '1541615'
            || gameId === '1541616'
            || gameId === '1556514'
            || gameId === '1541602'
            || gameId === '131625767'
            || gameId === '2212370'
            || gameId === '2377821'
            || gameId === '131625768'
            || gameId === '1541590'
            || gameId === '1541591'
            || gameId === '2918432'
            || gameId === '2918434'
            || gameId === '2952283'
            || gameId === '2952282'
            || gameId === '2753680'
            || gameId === '2753679'
            || gameId === '2037812'
            || gameId === '1541881'
            || gameId === '1541802'
            || gameId === '1541793'
            || gameId === '1541823'
            || gameId === '1541824'
            || gameId === '2661968'
            || gameId === '2661969'
            || gameId === '1663575'
            || gameId === '1634476'
            || gameId === '1541697'
            || gameId === '1541698'
            || gameId === '1541690'
            || gameId === '1541691'
            || gameId === '16233'
            || gameId === '2256940'
            || gameId === '2221521'
            || gameId === '16234'
            || gameId === '22991'
            || gameId === '2330683'
            || gameId === '2332368'
            || gameId === '22992'
            || gameId === '2767608'
            || gameId === '2767607'
            || gameId === '2697608'
            || gameId === '2697610'
            || gameId === '2907396'
            || gameId === '2907397'
            || gameId === '1540733'
            || gameId === '52429'
            || gameId === '1527935'
            || gameId === '1527936'
            || gameId === '21822'
            || gameId === '2136120'
            || gameId === '2223741'
            || gameId === '21823'
            || gameId === '131623211'
            || gameId === '1967311'
            || gameId === '2146017'
            || gameId === '131623212'
            || gameId === '1675064'
            || gameId === '1613773'
            || gameId === '2325322'
            || gameId === '1541821'
            || gameId === '2695848'
            || gameId === '2695849'
            || gameId === '1540871'
            || gameId === '1540872'
            || gameId === '2964378'
            || gameId === '2964379'
            || gameId === '1542734'
            || gameId === '1541685'
            || gameId === '2961299'
            || gameId === '2961298'
            || gameId === '1504846'
            || gameId === '1501244'
            || gameId === '1976419'
            || gameId === '21370'
            || gameId === '21369'
            || gameId === '2504936'
            || gameId === '2561481'
            || gameId === '48360'
            || gameId === '131623186'
            || gameId === '2271110'
            || gameId === '2509563'
            || gameId === '131623187'
            || gameId === '1540880'
            || gameId === '1540881'
            || gameId === '25279'
            || gameId === '1875270'
            || gameId === '2148139'
            || gameId === '25280'
            || gameId === '2757035'
            || gameId === '2757036'
            || gameId === '2382865'
            || gameId === '30440'
            || gameId === '30439'
            || gameId === '2395936'
            || gameId === '2580760'
            || gameId === '2580758'
            || gameId === '2865649'
            || gameId === '2865647'
            || gameId === '1934475'
            || gameId === '24313'
            || gameId === '24312'
            || gameId === '2112501'
            || gameId === '2918429'
            || gameId === '2918430'
            || gameId === '1671076'
            || gameId === '1634471'
            || gameId === '21686'
            || gameId === '1841408'
            || gameId === '1972278'
            || gameId === '21687'
            || gameId === '27948'
            || gameId === '1987658'
            || gameId === '2108651'
            || gameId === '27949'
            || gameId === '1541862'
            || gameId === '1541863'
            || gameId === '1540876'
            || gameId === '1540877';
    }

    public static isByteDanceSeat(seatId: number | undefined): boolean {
        return seatId === 9116 || seatId === 9154;
    }

    public static isTimerExpirationExperiment(gameId: string): boolean {
        return gameId === '1453434';
    }
}
