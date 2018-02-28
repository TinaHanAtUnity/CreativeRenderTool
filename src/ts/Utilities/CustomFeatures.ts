
import { AdUnitStyle } from 'Models/AdUnitStyle';

export class CustomFeatures {

    public static isFadeDisabled(gameId: string) {
        const enabledGameIDs = ['1536139', // Outfit7
            '1536140', // Outfit7
            '1536129', // Outfit7
            // Bitmango games
            '15391',
            '16061',
            '131625570',
            '15722',
            '1541846',
            '1541612',
            '1541834',
            '131621885',
            '16063',
            '1541840',
            '1541619',
            '1541810',
            '1541615',
            '1556514',
            '131625767',
            '1541590',
            '1541802',
            '1541823',
            '1541697',
            '1541690',
            '16233',
            '22991',
            '1540733',
            '1527935',
            '21822',
            '131623211',
            '1540871',
            '1542734',
            '1504846',
            '21369',
            '131623186',
            '1540880',
            '25279',
            '30439',
            '24312',
            '21686',
            '27948',
            '1541862',
            '1540876',
            '16284',
            '16062',
            '131625571',
            '15723',
            '1541847',
            '1541613',
            '48355',
            '1541835',
            '131621886',
            '48358',
            '16064',
            '48359',
            '1541876',
            '1541841',
            '1541620',
            '1541811',
            '1541616',
            '1541602',
            '131625768',
            '1541591',
            '1541881',
            '1541793',
            '1541824',
            '1541698',
            '1541691',
            '16234',
            '22992',
            '52429',
            '1527936',
            '21823',
            '131623212',
            '1613773',
            '1541821',
            '1540872',
            '1541685',
            '1501244',
            '21370',
            '48360',
            '131623187',
            '1540881',
            '25280',
            '30440',
            '24313',
            '21687',
            '27949',
            '1541863',
            '1540877'];

        if(enabledGameIDs.indexOf(gameId) !== -1) {
            return true;
        } else {
            return false;
        }
    }

    public static getAdUnitStyle(abGroup: number): AdUnitStyle {
        if(abGroup === 8 || abGroup === 10) {
            return new AdUnitStyle({ctaButtonColor: this.getColor()});
        } else {
            return new AdUnitStyle({ctaButtonColor: "#167dfb"});
        }
    }

    private static getColor(): string {
        const colors = ['#ff9900',
            '#ffcc33',
            '#99cc00',
            '#33cc00',
            '#00cccc',
            '#167dfb',
            '#003366',
            '#6600cc',
            '#cc0099',
            '#c1272d'];

        return colors[Math.floor(Math.random() * colors.length)];
    }

    public static isPlayableConfigurationEnabled(originalResourceUrl: string) {
        return originalResourceUrl.match(/playables\/production\/unity/);
    }
}
