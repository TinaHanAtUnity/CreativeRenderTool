import { Campaign } from 'Ads/Models/Campaign';
export class ProgrammaticCampaign extends Campaign {
    constructor(name, schema, data) {
        super(name, schema, data);
    }
    getUseWebViewUserAgentForTracking() {
        return !!this.get('useWebViewUserAgentForTracking');
    }
}
ProgrammaticCampaign.Schema = Object.assign({}, Campaign.Schema, { useWebViewUserAgentForTracking: ['boolean'] });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUHJvZ3JhbW1hdGljQ2FtcGFpZ24uanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9zcmMvdHMvQWRzL01vZGVscy9DYW1wYWlnbnMvUHJvZ3JhbW1hdGljQ2FtcGFpZ24udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFFLFFBQVEsRUFBYSxNQUFNLHFCQUFxQixDQUFDO0FBTzFELE1BQU0sT0FBZ0Isb0JBQXNELFNBQVEsUUFBVztJQU0zRixZQUFZLElBQVksRUFBRSxNQUFrQixFQUFFLElBQU87UUFDakQsS0FBSyxDQUFDLElBQUksRUFBRSxNQUFNLEVBQUUsSUFBSSxDQUFDLENBQUM7SUFDOUIsQ0FBQztJQUVNLGlDQUFpQztRQUNwQyxPQUFPLENBQUMsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLGdDQUFnQyxDQUFDLENBQUM7SUFDeEQsQ0FBQzs7QUFYYSwyQkFBTSxxQkFDWixRQUFRLENBQUMsTUFBTSxJQUNuQiw4QkFBOEIsRUFBRSxDQUFDLFNBQVMsQ0FBQyxJQUM3QyJ9