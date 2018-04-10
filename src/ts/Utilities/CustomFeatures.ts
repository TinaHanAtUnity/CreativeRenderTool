
import { AdUnitStyle } from 'Models/AdUnitStyle';
import { StorageType } from 'Native/Api/Storage';
import { NativeBridge } from 'Native/NativeBridge';

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

    public static getAdUnitStyle(abGroup: number): AdUnitStyle {
        return new AdUnitStyle({ctaButtonColor: '#167dfb'});
    }

    public static showGDPRPopup(nativeBridge: NativeBridge, abGroup: number): Promise<boolean> {
        // todo: check is the user in an EU country
        if(abGroup === 16 || abGroup === 17) {
            return nativeBridge.Storage.get(StorageType.PRIVATE, 'gdpr.popupshown.value').then(value => {
                return !<boolean>value;
            }).catch(error => {
                return true;
            });

        } else {
            return Promise.resolve(false);
        }
    }
}
