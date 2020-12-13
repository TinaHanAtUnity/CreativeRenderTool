import { ThirdPartyEventManager } from 'Ads/Managers/ThirdPartyEventManager';
export class ThirdPartyEventManagerFactory {
    constructor(core, requestManager, storageBridge) {
        this._core = core;
        this._requestManager = requestManager;
        this._storageBridge = storageBridge;
    }
    create(templateValues) {
        return new ThirdPartyEventManager(this._core, this._requestManager, templateValues, this._storageBridge);
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVGhpcmRQYXJ0eUV2ZW50TWFuYWdlckZhY3RvcnkuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9zcmMvdHMvQWRzL01hbmFnZXJzL1RoaXJkUGFydHlFdmVudE1hbmFnZXJGYWN0b3J5LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBcUIsc0JBQXNCLEVBQUUsTUFBTSxxQ0FBcUMsQ0FBQztBQVNoRyxNQUFNLE9BQU8sNkJBQTZCO0lBTXRDLFlBQVksSUFBYyxFQUFFLGNBQThCLEVBQUUsYUFBNEI7UUFDcEYsSUFBSSxDQUFDLEtBQUssR0FBRyxJQUFJLENBQUM7UUFDbEIsSUFBSSxDQUFDLGVBQWUsR0FBRyxjQUFjLENBQUM7UUFDdEMsSUFBSSxDQUFDLGNBQWMsR0FBRyxhQUFhLENBQUM7SUFDeEMsQ0FBQztJQUVNLE1BQU0sQ0FBQyxjQUFpQztRQUMzQyxPQUFPLElBQUksc0JBQXNCLENBQUMsSUFBSSxDQUFDLEtBQUssRUFBRSxJQUFJLENBQUMsZUFBZSxFQUFFLGNBQWMsRUFBRSxJQUFJLENBQUMsY0FBYyxDQUFDLENBQUM7SUFDN0csQ0FBQztDQUNKIn0=