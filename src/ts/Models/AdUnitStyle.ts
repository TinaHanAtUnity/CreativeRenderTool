import { ISchema, Model } from 'Models/Model';

interface IAdUnitStyle {
    ctaButtonColor?: string;
}

export class AdUnitStyle extends Model<IAdUnitStyle> {
    public static Schema: ISchema<IAdUnitStyle> = {
        ctaButtonColor: ['string', 'undefined']
    };

    public static getDefaultAdUnitStyle(): AdUnitStyle {
        return new AdUnitStyle({
            ctaButtonColor: '#167dfb'
        });
    }

    private static validateIAdUnitStyle(adUnitStyle: IAdUnitStyle) {
        const validatedAdUnitStyle: IAdUnitStyle = {...adUnitStyle};
        // ctaButtonColor needs to a proper html color code string or undefined
        if ( (!adUnitStyle.ctaButtonColor) || !adUnitStyle.ctaButtonColor.match(/#[0-F]{6}/i)) {
            validatedAdUnitStyle.ctaButtonColor = undefined;
        }
        return validatedAdUnitStyle;
    }

    constructor(adUnitStyle: IAdUnitStyle) {
        const validatedIAdUnitStyle = AdUnitStyle.validateIAdUnitStyle(adUnitStyle);
        super('AdUnitStyle', AdUnitStyle.Schema, validatedIAdUnitStyle);
    }

    public getCTAButtonColor(): string | undefined {
        return this.get('ctaButtonColor');
    }

    public getDTO(): { [key: string]: any; } {
        return {
            'ctaButtonColor': this.getCTAButtonColor()
        };
    }
}
