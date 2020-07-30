import { ISchema, Model } from 'Core/Models/Model';

export interface IAdUnitStyle {
    ctaButtonColor?: string;
}

export class AdUnitStyle extends Model<IAdUnitStyle> {
    public static Schema: ISchema<IAdUnitStyle> = {
        ctaButtonColor: ['string', 'undefined']
    };

    public static getDefaultAdUnitStyle(): AdUnitStyle {
        return new AdUnitStyle({
            ctaButtonColor: '#33cc00'
        });
    }

    private static validateIAdUnitStyle(adUnitStyle: IAdUnitStyle) {
        const validatedAdUnitStyle: IAdUnitStyle = { ...adUnitStyle };
        // ctaButtonColor needs to be a proper html color code string or undefined
        if ((!adUnitStyle.ctaButtonColor) || !adUnitStyle.ctaButtonColor.match(/#[0-F]{6}/i)) {
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

    public getDTO(): { [key: string]: unknown } {
        return {
            'ctaButtonColor': this.getCTAButtonColor()
        };
    }
}
