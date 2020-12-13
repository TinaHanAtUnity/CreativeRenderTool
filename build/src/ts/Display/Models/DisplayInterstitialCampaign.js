import { ProgrammaticCampaign } from 'Ads/Models/Campaigns/ProgrammaticCampaign';
export class DisplayInterstitialCampaign extends ProgrammaticCampaign {
    constructor(campaign) {
        super('DisplayInterstitialCampaign', Object.assign({}, ProgrammaticCampaign.Schema, { dynamicMarkup: ['string', 'undefined'], width: ['number', 'undefined'], height: ['number', 'undefined'] }), campaign);
    }
    getDynamicMarkup() {
        return this.get('dynamicMarkup');
    }
    getRequiredAssets() {
        return [];
    }
    getOptionalAssets() {
        return [];
    }
    isConnectionNeeded() {
        return false;
    }
    getWidth() {
        return this.get('width');
    }
    getHeight() {
        return this.get('height');
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiRGlzcGxheUludGVyc3RpdGlhbENhbXBhaWduLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vc3JjL3RzL0Rpc3BsYXkvTW9kZWxzL0Rpc3BsYXlJbnRlcnN0aXRpYWxDYW1wYWlnbi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFDQSxPQUFPLEVBQXlCLG9CQUFvQixFQUFFLE1BQU0sMkNBQTJDLENBQUM7QUFReEcsTUFBTSxPQUFPLDJCQUE0QixTQUFRLG9CQUFrRDtJQUMvRixZQUFZLFFBQXNDO1FBQzlDLEtBQUssQ0FBQyw2QkFBNkIsb0JBQzNCLG9CQUFvQixDQUFDLE1BQU0sSUFDL0IsYUFBYSxFQUFFLENBQUMsUUFBUSxFQUFFLFdBQVcsQ0FBQyxFQUN0QyxLQUFLLEVBQUUsQ0FBQyxRQUFRLEVBQUUsV0FBVyxDQUFDLEVBQzlCLE1BQU0sRUFBRSxDQUFDLFFBQVEsRUFBRSxXQUFXLENBQUMsS0FDaEMsUUFBUSxDQUFDLENBQUM7SUFDakIsQ0FBQztJQUVNLGdCQUFnQjtRQUNuQixPQUFPLElBQUksQ0FBQyxHQUFHLENBQUMsZUFBZSxDQUFDLENBQUM7SUFDckMsQ0FBQztJQUVNLGlCQUFpQjtRQUNwQixPQUFPLEVBQUUsQ0FBQztJQUNkLENBQUM7SUFFTSxpQkFBaUI7UUFDcEIsT0FBTyxFQUFFLENBQUM7SUFDZCxDQUFDO0lBRU0sa0JBQWtCO1FBQ3JCLE9BQU8sS0FBSyxDQUFDO0lBQ2pCLENBQUM7SUFFTSxRQUFRO1FBQ1gsT0FBTyxJQUFJLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxDQUFDO0lBQzdCLENBQUM7SUFFTSxTQUFTO1FBQ1osT0FBTyxJQUFJLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBQyxDQUFDO0lBQzlCLENBQUM7Q0FDSiJ9