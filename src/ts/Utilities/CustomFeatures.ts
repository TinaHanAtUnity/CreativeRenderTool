
import { AdUnitStyle } from 'Models/AdUnitStyle';
import { StorageType } from 'Native/Api/Storage';
import { NativeBridge } from 'Native/NativeBridge';
import { Configuration } from 'Models/Configuration';
import { StorageError } from 'Native/Api/Storage';

export class CustomFeatures {

    public static isIosVideoCachingEnabled(abGroup: number): boolean {
        return abGroup === 14 || abGroup === 15;
    }

    public static isExampleGameId(gameId: string): boolean {
        return gameId === '14850' || gameId === '14851';
    }

    public static isTimehopApp(gameId: string): boolean {
        return gameId === '1300023' || gameId === '1300024';
    }

    public static isPlayableConfigurationEnabled(originalResourceUrl: string) {
        return originalResourceUrl.match(/playables\/production\/unity/);
    }

    public static getAdUnitStyle(abGroup: number): AdUnitStyle {
        return new AdUnitStyle({ctaButtonColor: '#167dfb'});
    }

}
