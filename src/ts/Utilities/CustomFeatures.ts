export class CustomFeatures {
    public static isExampleGameId(gameId: string): boolean {
        return gameId === '14850' || gameId === '14851';
    }

    public static isTimehopApp(gameId: string): boolean {
        return gameId === '1300023' || gameId === '1300024';
    }

    public static isMixedPlacementExperiment(gameId: string): boolean {
        return gameId === '1543512' ||
               gameId === '1003628' ||
               gameId === '1042745' ||
               gameId === '1783249' ||
               gameId === '1783250' ||
               gameId === '1543513';
    }

    public static isSonicPlayable(creativeId: string | undefined) {
        return  creativeId === '109455881' ||
                creativeId === '109455877' ||
                creativeId === '109091853' ||
                creativeId === '109091754';
    }

    public static isPlayableConfigurationEnabled(originalResourceUrl: string) {
        return originalResourceUrl.match(/playables\/production\/unity/);
    }

    public static isSimejiJapaneseKeyboardApp(gameId: string): boolean {
        // Baidu's Simeji Japanese Keyboard extension app
        // Ad unit should be closed when going background on iOS
        return gameId === '1795561';
    }

    public static isCacheUpdateDisabledApp(gameId: string): boolean {
        // Uken game id to disable cache change PR https://github.com/Applifier/unity-ads-webview/pull/4755
        // ABT-466 black screen issue
        return gameId === '1000671' ||
               gameId === '1000670' ||
               gameId === '1557353' ||
               gameId === '1557354';
    }
}
