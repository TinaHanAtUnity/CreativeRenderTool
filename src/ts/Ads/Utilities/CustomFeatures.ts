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
               gameId === '1543513' ||
               gameId === '1783091' || // Guild of Heroes
               gameId === '1783092';   // Guild of Heroes
    }

    public static isSonicPlayable(creativeId: string | undefined) {
        return  creativeId === '109455881' ||
                creativeId === '109455877' ||
                creativeId === '109091853' ||
                creativeId === '109091754' ||
                creativeId === '114617576' || // Hellfest
                creativeId === '114617336';   // Hellfest
    }

    public static isTencentAdvertisement(seatId: number | undefined) {
        return seatId === 9107;
    }

    public static isPlayableConfigurationEnabled(originalResourceUrl: string) {
        return originalResourceUrl.match(/playables\/production\/unity/);
    }

    public static isSimejiJapaneseKeyboardApp(gameId: string): boolean {
        // Baidu's Simeji Japanese Keyboard extension app
        // Ad unit should be closed when going background on iOS
        return gameId === '1795561';
    }

    public static isAdmobCachedVideoGame(gameId: string) {
        return gameId === '1475967' // CSR2 Racing iOS
            || gameId === '1475968' // CSR2 Racing Android
            || gameId === '1787178' // BrawlStars iOS
            || gameId === '2391158' // Brawlstars Android
            || gameId === '1782301' // Hayday iOS
            || gameId === '1782302';// Hayday Android
    }

    public static isCloseIconSkipApp(gameId: string) {
        // Clean master (Cheetah)
        return gameId === '1196341';
    }

    /* Following 2 functions could be merged at some point later */
    public static isSliderEndScreenEnabled(campaignId: string): boolean {
        const targetCampaignIds = [
            'TBD',
            'TBD'
        ];

        return targetCampaignIds.indexOf(campaignId) !== -1;
    }

    public static getScreenshotsUrls(campaignId: string): string[] {
        campaignId = 'test';
        const screenshots: { [key: string]: string[] } = {
            'test': [
                'https://lh3.googleusercontent.com/r9Lop-rvoj5NJepnt6DFe2qrGiVEEc05D-1mB6XUb49tf4FrnVSIEdh6Pi7tBzsIFnI=w1739-h1170-rw',
                'https://lh3.googleusercontent.com/hUEuMju1dhqANA_7g6xOtR9A6SVbj3YxSvwAo5vq7-vBJ8sarDn1IRwQYff5vgjIL88_=w1739-h1170-rw',
                'https://lh3.googleusercontent.com/P4nGXQPqTS_eJ0jSiKp0e1xUYLrE365PTlxrJaeZoJlS321xom-LiZCdXoJOaRxbDQ=w1739-h1170-rw',
                'https://lh3.googleusercontent.com/pHOAqc-gMT4e2jND7X96mw1Tm4JnelLjtTLtqXvBOQnOZjcXuKKwrVvOYNJeHXlrfm5m=w1739-h1170-rw',
                'https://lh3.googleusercontent.com/c4356hfvZwsqAHstmamvYU2O9zFNSxwpTqpNic8BhF0Vj9ashpOOxiDBNWJpwr64t4w=w1739-h1170-rw'
            ]
        };
        return screenshots[campaignId];
    }
}
