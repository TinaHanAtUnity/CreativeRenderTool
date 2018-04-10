
import { AdUnitStyle } from 'Models/AdUnitStyle';
import { StorageType } from 'Native/Api/Storage';
import { NativeBridge } from 'Native/NativeBridge';
import { Configuration } from 'Models/Configuration';

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

    public static showGDPRPopup(nativeBridge: NativeBridge, configuration: Configuration, abGroup: number): Promise<boolean> {
        if((abGroup === 16 || abGroup === 17) && this._euCountries.indexOf(configuration.getCountry()) !== -1) {
            return nativeBridge.Storage.get(StorageType.PRIVATE, 'gdpr.popupshown.value').then(value => {
                return !<boolean>value;
            }).catch(error => {
                return true;
            });

        } else {
            return Promise.resolve(false);
        }
    }

    private static _euCountries = [
        'BE',
        'BG',
        'CZ',
        'DK',
        'DE',
        'EE',
        'IE',
        'EL',
        'ES',
        'FR',
        'HR',
        'IT',
        'CY',
        'LV',
        'LT',
        'LU',
        'HU',
        'MT',
        'NL',
        'AT',
        'PL',
        'PT',
        'RO',
        'SI',
        'SK',
        'FI',
        'SE',
        'UK'
    ];
}
