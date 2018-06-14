export class CustomFeatures {
    public static isExampleGameId(gameId: string): boolean {
        return gameId === '14850' || gameId === '14851';
    }

    public static isTimehopApp(gameId: string): boolean {
        return gameId === '1300023' || gameId === '1300024';
    }

    public static isMixedPlacementExperiment(gameId: string): boolean {
        return gameId === '1543512' || gameId === '1003628';
    }

    public static isPlayableConfigurationEnabled(originalResourceUrl: string) {
        return originalResourceUrl.match(/playables\/production\/unity/);
    }
}
