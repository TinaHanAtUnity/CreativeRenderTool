import { ProgrammaticCampaign } from 'Ads/Models/Campaigns/ProgrammaticCampaign';
export class BannerCampaign extends ProgrammaticCampaign {
    constructor(campaign) {
        super('BannerCampaign', Object.assign({}, ProgrammaticCampaign.Schema, { markup: ['string'], width: ['number'], height: ['number'] }), campaign);
        if (campaign.willExpireAt) {
            this.set('willExpireAt', Date.now() + (campaign.willExpireAt * 1000));
        }
        else {
            this.set('willExpireAt', undefined);
        }
    }
    getRequiredAssets() {
        return [];
    }
    getOptionalAssets() {
        return [];
    }
    isConnectionNeeded() {
        return true;
    }
    getWidth() {
        return this.get('width');
    }
    getHeight() {
        return this.get('height');
    }
    getMarkup() {
        return this.get('markup');
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQmFubmVyQ2FtcGFpZ24uanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9zcmMvdHMvQmFubmVycy9Nb2RlbHMvQmFubmVyQ2FtcGFpZ24udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQ0EsT0FBTyxFQUF5QixvQkFBb0IsRUFBRSxNQUFNLDJDQUEyQyxDQUFDO0FBUXhHLE1BQU0sT0FBTyxjQUFlLFNBQVEsb0JBQXFDO0lBQ3JFLFlBQVksUUFBeUI7UUFDakMsS0FBSyxDQUFDLGdCQUFnQixvQkFDZCxvQkFBb0IsQ0FBQyxNQUFNLElBQy9CLE1BQU0sRUFBRSxDQUFDLFFBQVEsQ0FBQyxFQUNsQixLQUFLLEVBQUUsQ0FBQyxRQUFRLENBQUMsRUFDakIsTUFBTSxFQUFFLENBQUMsUUFBUSxDQUFDLEtBQ25CLFFBQVEsQ0FBQyxDQUFDO1FBRWIsSUFBSSxRQUFRLENBQUMsWUFBWSxFQUFFO1lBQ3ZCLElBQUksQ0FBQyxHQUFHLENBQUMsY0FBYyxFQUFFLElBQUksQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDLFFBQVEsQ0FBQyxZQUFZLEdBQUcsSUFBSSxDQUFDLENBQUMsQ0FBQztTQUN6RTthQUFNO1lBQ0gsSUFBSSxDQUFDLEdBQUcsQ0FBQyxjQUFjLEVBQUUsU0FBUyxDQUFDLENBQUM7U0FDdkM7SUFDTCxDQUFDO0lBQ00saUJBQWlCO1FBQ3BCLE9BQU8sRUFBRSxDQUFDO0lBQ2QsQ0FBQztJQUNNLGlCQUFpQjtRQUNwQixPQUFPLEVBQUUsQ0FBQztJQUNkLENBQUM7SUFDTSxrQkFBa0I7UUFDckIsT0FBTyxJQUFJLENBQUM7SUFDaEIsQ0FBQztJQUNNLFFBQVE7UUFDWCxPQUFPLElBQUksQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLENBQUM7SUFDN0IsQ0FBQztJQUNNLFNBQVM7UUFDWixPQUFPLElBQUksQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDLENBQUM7SUFDOUIsQ0FBQztJQUNNLFNBQVM7UUFDWixPQUFPLElBQUksQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDLENBQUM7SUFDOUIsQ0FBQztDQUNKIn0=