import { AdUnitStyle } from 'Models/AdUnitStyle';
import { StorageType } from 'Native/Api/Storage';
import { NativeBridge } from 'Native/NativeBridge';
import { Configuration } from 'Models/Configuration';
import { StorageError } from 'Native/Api/Storage';

export class CustomFeatures {
    public static isExampleGameId(gameId: string): boolean {
        return gameId === '14850' || gameId === '14851';
    }

    public static isTimehopApp(gameId: string): boolean {
        return gameId === '1300023' || gameId === '1300024';
    }

    public static isPlayableConfigurationEnabled(originalResourceUrl: string) {
        return originalResourceUrl.match(/playables\/production\/unity/);
    }

    public static isGDPRBaseTest(abGroup: number): boolean {
        return abGroup === 16 || abGroup === 17;
    }

    public static isPlayableEndScreenHideDelayDisabled(abGroup: number): boolean {
        return abGroup === 18 || abGroup === 19;
    }
}
