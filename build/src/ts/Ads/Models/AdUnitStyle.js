import { Model } from 'Core/Models/Model';
export class AdUnitStyle extends Model {
    constructor(adUnitStyle) {
        const validatedIAdUnitStyle = AdUnitStyle.validateIAdUnitStyle(adUnitStyle);
        super('AdUnitStyle', AdUnitStyle.Schema, validatedIAdUnitStyle);
    }
    static getDefaultAdUnitStyle() {
        return new AdUnitStyle({
            ctaButtonColor: '#33cc00'
        });
    }
    static validateIAdUnitStyle(adUnitStyle) {
        const validatedAdUnitStyle = Object.assign({}, adUnitStyle);
        // ctaButtonColor needs to be a proper html color code string or undefined
        if ((!adUnitStyle.ctaButtonColor) || !adUnitStyle.ctaButtonColor.match(/#[0-F]{6}/i)) {
            validatedAdUnitStyle.ctaButtonColor = undefined;
        }
        return validatedAdUnitStyle;
    }
    getCTAButtonColor() {
        return this.get('ctaButtonColor');
    }
    getDTO() {
        return {
            'ctaButtonColor': this.getCTAButtonColor()
        };
    }
}
AdUnitStyle.Schema = {
    ctaButtonColor: ['string', 'undefined']
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQWRVbml0U3R5bGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9zcmMvdHMvQWRzL01vZGVscy9BZFVuaXRTdHlsZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQVcsS0FBSyxFQUFFLE1BQU0sbUJBQW1CLENBQUM7QUFNbkQsTUFBTSxPQUFPLFdBQVksU0FBUSxLQUFtQjtJQW9CaEQsWUFBWSxXQUF5QjtRQUNqQyxNQUFNLHFCQUFxQixHQUFHLFdBQVcsQ0FBQyxvQkFBb0IsQ0FBQyxXQUFXLENBQUMsQ0FBQztRQUM1RSxLQUFLLENBQUMsYUFBYSxFQUFFLFdBQVcsQ0FBQyxNQUFNLEVBQUUscUJBQXFCLENBQUMsQ0FBQztJQUNwRSxDQUFDO0lBbEJNLE1BQU0sQ0FBQyxxQkFBcUI7UUFDL0IsT0FBTyxJQUFJLFdBQVcsQ0FBQztZQUNuQixjQUFjLEVBQUUsU0FBUztTQUM1QixDQUFDLENBQUM7SUFDUCxDQUFDO0lBRU8sTUFBTSxDQUFDLG9CQUFvQixDQUFDLFdBQXlCO1FBQ3pELE1BQU0sb0JBQW9CLHFCQUFzQixXQUFXLENBQUUsQ0FBQztRQUM5RCwwRUFBMEU7UUFDMUUsSUFBSSxDQUFDLENBQUMsV0FBVyxDQUFDLGNBQWMsQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLGNBQWMsQ0FBQyxLQUFLLENBQUMsWUFBWSxDQUFDLEVBQUU7WUFDbEYsb0JBQW9CLENBQUMsY0FBYyxHQUFHLFNBQVMsQ0FBQztTQUNuRDtRQUNELE9BQU8sb0JBQW9CLENBQUM7SUFDaEMsQ0FBQztJQU9NLGlCQUFpQjtRQUNwQixPQUFPLElBQUksQ0FBQyxHQUFHLENBQUMsZ0JBQWdCLENBQUMsQ0FBQztJQUN0QyxDQUFDO0lBRU0sTUFBTTtRQUNULE9BQU87WUFDSCxnQkFBZ0IsRUFBRSxJQUFJLENBQUMsaUJBQWlCLEVBQUU7U0FDN0MsQ0FBQztJQUNOLENBQUM7O0FBaENhLGtCQUFNLEdBQTBCO0lBQzFDLGNBQWMsRUFBRSxDQUFDLFFBQVEsRUFBRSxXQUFXLENBQUM7Q0FDMUMsQ0FBQyJ9