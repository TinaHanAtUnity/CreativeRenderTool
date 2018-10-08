import { SmartCloseButtonTest, ABGroup } from 'Core/Models/ABGroup';

export class CustomFeatures {
    public static isExampleGameId(gameId: string): boolean {
        return gameId === '14850' || gameId === '14851';
    }

    public static isTimehopApp(gameId: string): boolean {
        return gameId === '1300023' || gameId === '1300024';
    }

    public static isMixedPlacementExperiment(gameId: string): boolean {
        return false;
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

    public static isSmartCloseButtonEnabled(abGroup: ABGroup, campaignId: string): boolean {
        const targetCampaignIds = [
            // Zynga Poker iOS
            '5b2d309b2e1c0427c0237516',
            '5b2d309b2e1c0427c0237515',
            '5b3a9a3e90451c0b28173854',
            // Zynga Poker Android
            '5b2d30a40923dc275cab0ebc',
            '5b2d30a40923dc275cab0ebb',
            '5b3a99ceb4ab8c0b82a00cd1',
            // 1010! iOS
            '5b7aa6738391f801282a99c9',
            '5a44fce889df846807310676',
            '5b90dd3d0da63900e2fdea75',
            '5b90dd261b607e00ba04f923',
            '5b90dd261b607e00ba04f922',
            '5b90dd3d0da63900e2fdea76',
            '5b7aa6738391f801282a99c8',
            '5b6db866f2060509343aa2dd',
            // 1010! Android
            '5a587fe24e7cba00ce63218d',
            '5b90da8eed2013003abedba7',
            '5b90d73e6e521e002e6bdcd6',
            '5a5879e3c8e2e1002b0c2b3b',
            '5a83eb18a4966712c6c7bdf6',
            '5b90d73e6e521e002e6bdcd9',
            '5b90da8eed2013003abedbaa',
            '5b90d73e6e521e002e6bdcda',
            '5b90da8eed2013003abedba9',
            '5a83eb18a4966712c6c7be07',
            '5b90d73e6e521e002e6bdcd8',
            '5b90da8eed2013003abedba8'
        ];

        return SmartCloseButtonTest.isValid(abGroup) && targetCampaignIds.indexOf(campaignId) !== -1;
    }

    public static isCloseIconSkipApp(gameId: string) {
        return gameId === '1196341'
            || gameId === '1594775'
            || gameId === '2755671'
            || gameId === '1451510'
            || gameId === '1585102'
            || gameId === '2808037'
            || gameId === '2755670'
            || gameId === '2625701'
            || gameId === '2625703';
    }

    public static isAlwaysAutobatching(gameId: string): boolean {
        return gameId === '1448666'; // for testing if this helps with Wooga ANR issue, ABT-567
    }
}
