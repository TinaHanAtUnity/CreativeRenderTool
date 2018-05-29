import { ISchema, Model } from 'Models/Model';

interface IAdUnitStyle {
    ctaButtonColor?: string;
}

export class AdUnitStyle extends Model<IAdUnitStyle> {
    public static Schema: ISchema<IAdUnitStyle> = {
        ctaButtonColor: ['string', 'undefined']
    };

    constructor(adUnitStyle: IAdUnitStyle) {
        super('AdUnitStyle', AdUnitStyle.Schema, adUnitStyle);
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
