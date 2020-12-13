import { PlacementContentManager } from 'Monetization/Managers/PlacementContentManager';
import { MonetizationListenerApi } from 'Monetization/Native/MonetizationListener';
import { PlacementContentsApi } from 'Monetization/Native/PlacementContents';
export class Monetization {
    constructor(core, ads) {
        this._initialized = false;
        this._core = core;
        this._ads = ads;
        this.Api = {
            Listener: new MonetizationListenerApi(core.NativeBridge),
            PlacementContents: new PlacementContentsApi(core.NativeBridge)
        };
    }
    initialize() {
        this._core.ClientInfo.setMonetizationInUse(true);
        this.PlacementContentManager = new PlacementContentManager(this.Api, this._ads.Config, this._ads.CampaignManager);
        this._initialized = true;
    }
    isInitialized() {
        return this._initialized;
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiTW9uZXRpemF0aW9uLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vc3JjL3RzL01vbmV0aXphdGlvbi9Nb25ldGl6YXRpb24udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBSUEsT0FBTyxFQUFFLHVCQUF1QixFQUFFLE1BQU0sK0NBQStDLENBQUM7QUFDeEYsT0FBTyxFQUFFLHVCQUF1QixFQUFFLE1BQU0sMENBQTBDLENBQUM7QUFDbkYsT0FBTyxFQUFFLG9CQUFvQixFQUFFLE1BQU0sdUNBQXVDLENBQUM7QUFFN0UsTUFBTSxPQUFPLFlBQVk7SUFXckIsWUFBWSxJQUFXLEVBQUUsR0FBUztRQUYxQixpQkFBWSxHQUFHLEtBQUssQ0FBQztRQUd6QixJQUFJLENBQUMsS0FBSyxHQUFHLElBQUksQ0FBQztRQUNsQixJQUFJLENBQUMsSUFBSSxHQUFHLEdBQUcsQ0FBQztRQUVoQixJQUFJLENBQUMsR0FBRyxHQUFHO1lBQ1AsUUFBUSxFQUFFLElBQUksdUJBQXVCLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQztZQUN4RCxpQkFBaUIsRUFBRSxJQUFJLG9CQUFvQixDQUFDLElBQUksQ0FBQyxZQUFZLENBQUM7U0FDakUsQ0FBQztJQUNOLENBQUM7SUFFTSxVQUFVO1FBQ2IsSUFBSSxDQUFDLEtBQUssQ0FBQyxVQUFVLENBQUMsb0JBQW9CLENBQUMsSUFBSSxDQUFDLENBQUM7UUFFakQsSUFBSSxDQUFDLHVCQUF1QixHQUFHLElBQUksdUJBQXVCLENBQUMsSUFBSSxDQUFDLEdBQUcsRUFBRSxJQUFJLENBQUMsSUFBSSxDQUFDLE1BQU0sRUFBRSxJQUFJLENBQUMsSUFBSSxDQUFDLGVBQWUsQ0FBQyxDQUFDO1FBQ2xILElBQUksQ0FBQyxZQUFZLEdBQUcsSUFBSSxDQUFDO0lBQzdCLENBQUM7SUFFTSxhQUFhO1FBQ2hCLE9BQU8sSUFBSSxDQUFDLFlBQVksQ0FBQztJQUM3QixDQUFDO0NBRUoifQ==