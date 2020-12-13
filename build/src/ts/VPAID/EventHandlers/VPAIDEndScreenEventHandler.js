export class VPAIDEndScreenEventHandler {
    constructor(adUnit, parameters) {
        this._adUnit = adUnit;
        this._vpaidCampaign = parameters.campaign;
    }
    onVPAIDEndScreenClick() {
        const url = this.getCompanionClickThroughURL() || this.getClickThroughURL();
        this._adUnit.openUrl(url);
    }
    onVPAIDEndScreenClose() {
        this._adUnit.hide();
    }
    onVPAIDEndScreenShow() {
        // EMPTY?
    }
    getCompanionClickThroughURL() {
        return this._vpaidCampaign.getCompanionClickThroughURL();
    }
    getClickThroughURL() {
        return this._vpaidCampaign.getVideoClickThroughURL();
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVlBBSURFbmRTY3JlZW5FdmVudEhhbmRsZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9zcmMvdHMvVlBBSUQvRXZlbnRIYW5kbGVycy9WUEFJREVuZFNjcmVlbkV2ZW50SGFuZGxlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFJQSxNQUFNLE9BQU8sMEJBQTBCO0lBSW5DLFlBQVksTUFBbUIsRUFBRSxVQUFrQztRQUMvRCxJQUFJLENBQUMsT0FBTyxHQUFHLE1BQU0sQ0FBQztRQUN0QixJQUFJLENBQUMsY0FBYyxHQUFHLFVBQVUsQ0FBQyxRQUFRLENBQUM7SUFDOUMsQ0FBQztJQUVNLHFCQUFxQjtRQUN4QixNQUFNLEdBQUcsR0FBRyxJQUFJLENBQUMsMkJBQTJCLEVBQUUsSUFBSSxJQUFJLENBQUMsa0JBQWtCLEVBQUUsQ0FBQztRQUM1RSxJQUFJLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsQ0FBQztJQUM5QixDQUFDO0lBRU0scUJBQXFCO1FBQ3hCLElBQUksQ0FBQyxPQUFPLENBQUMsSUFBSSxFQUFFLENBQUM7SUFDeEIsQ0FBQztJQUVNLG9CQUFvQjtRQUN2QixTQUFTO0lBQ2IsQ0FBQztJQUVPLDJCQUEyQjtRQUMvQixPQUFPLElBQUksQ0FBQyxjQUFjLENBQUMsMkJBQTJCLEVBQUUsQ0FBQztJQUM3RCxDQUFDO0lBRU8sa0JBQWtCO1FBQ3RCLE9BQU8sSUFBSSxDQUFDLGNBQWMsQ0FBQyx1QkFBdUIsRUFBRSxDQUFDO0lBQ3pELENBQUM7Q0FDSiJ9