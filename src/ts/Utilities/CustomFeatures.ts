
import { AdUnitStyle } from 'Models/AdUnitStyle';

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

    public static isAnalyticsDisabled(gameId: string): boolean {
        return this._analyticsDisabledGameIds.indexOf(gameId) !== -1;
    }

    private static _analyticsDisabledGameIds = [
        '101315',
        '102845',
        '103545',
        '104094',
        '104606',
        '104706',
        '106381',
        '106382',
        '112694',
        '115064',
        '122641',
        '128849',
        '1369279',
        '1369280',
        '1409425',
        '1409426',
        '1547367',
        '1547372',
        '22115',
        '72990',
        '75497',
        '81424',
        '81425',
        '86348',
        '93101',
        '93102',
        '94031',
        '94033',
        '94034',
        '94553',
        '94554',
        '94853',
        '94854',
        '99335',
        '99339',
        '99776',
        '99777'
    ];
}
