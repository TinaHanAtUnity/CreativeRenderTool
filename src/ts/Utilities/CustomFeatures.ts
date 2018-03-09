
import { AdUnitStyle } from 'Models/AdUnitStyle';

export class CustomFeatures {

    public static isExampleGameId(gameId: string): boolean {
        return gameId === '14850' || gameId === '14851';
    }

    public static isTimehopApp(gameId: string): boolean {
        return gameId === '1300023' || gameId === '1300024';
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
}
