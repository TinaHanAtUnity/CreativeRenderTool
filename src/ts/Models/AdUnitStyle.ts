import { Model } from 'Models/Model';

interface IAdUnitStyle {
    ctaButtonColor?: string;
}

export class AdUnitStyle extends Model<IAdUnitStyle> {

    constructor(adUnitStyle: IAdUnitStyle) {
        super('AdUnitStyle', {
            ctaButtonColor: ['string', 'undefined']
        }, adUnitStyle);
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