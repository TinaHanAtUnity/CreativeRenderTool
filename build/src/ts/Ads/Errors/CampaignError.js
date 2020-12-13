/**
 * Levels of errors that can occur in a campaign: parsing, validating, rendering, tracking
 */
export var CampaignErrorLevel;
(function (CampaignErrorLevel) {
    CampaignErrorLevel["LOW"] = "low priority";
    CampaignErrorLevel["MEDIUM"] = "medium priority";
    CampaignErrorLevel["HIGH"] = "high priority"; // Severe level error that stops proceeding
})(CampaignErrorLevel || (CampaignErrorLevel = {}));
export class CampaignError extends Error {
    constructor(message, contentType, errorLevel, errorCode, errorTrackingUrls, assetUrl, seatId, creativeId) {
        super(message);
        this.errorLevel = errorLevel || CampaignErrorLevel.MEDIUM;
        this.contentType = contentType;
        this.errorTrackingUrls = errorTrackingUrls || [];
        this.errorCode = errorCode || 999; // 999 Undefined general error
        this.errorMessage = message;
        this.assetUrl = assetUrl;
        this.seatId = seatId;
        this.creativeId = creativeId;
        this.errorData = {};
        this._subCampaignErrors = [];
    }
    addSubCampaignError(campaignError) {
        this._subCampaignErrors.push(campaignError);
    }
    getAllCampaignErrors() {
        let errorList = [this];
        for (const subError of this.getSubCampaignErrors()) {
            errorList = errorList.concat(subError.getAllCampaignErrors());
        }
        return errorList;
    }
    getSubCampaignErrors() {
        return this._subCampaignErrors;
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQ2FtcGFpZ25FcnJvci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3NyYy90cy9BZHMvRXJyb3JzL0NhbXBhaWduRXJyb3IudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQ0E7O0dBRUc7QUFDSCxNQUFNLENBQU4sSUFBWSxrQkFJWDtBQUpELFdBQVksa0JBQWtCO0lBQzFCLDBDQUFvQixDQUFBO0lBQ3BCLGdEQUEwQixDQUFBO0lBQzFCLDRDQUFzQixDQUFBLENBQUMsMkNBQTJDO0FBQ3RFLENBQUMsRUFKVyxrQkFBa0IsS0FBbEIsa0JBQWtCLFFBSTdCO0FBQ0QsTUFBTSxPQUFPLGFBQWMsU0FBUSxLQUFLO0lBYXBDLFlBQVksT0FBZSxFQUFFLFdBQW1CLEVBQUUsVUFBK0IsRUFBRSxTQUFrQixFQUFFLGlCQUE0QixFQUFFLFFBQWlCLEVBQUUsTUFBZSxFQUFFLFVBQW1CO1FBQ3hMLEtBQUssQ0FBQyxPQUFPLENBQUMsQ0FBQztRQUNmLElBQUksQ0FBQyxVQUFVLEdBQUcsVUFBVSxJQUFJLGtCQUFrQixDQUFDLE1BQU0sQ0FBQztRQUMxRCxJQUFJLENBQUMsV0FBVyxHQUFHLFdBQVcsQ0FBQztRQUMvQixJQUFJLENBQUMsaUJBQWlCLEdBQUcsaUJBQWlCLElBQUksRUFBRSxDQUFDO1FBQ2pELElBQUksQ0FBQyxTQUFTLEdBQUcsU0FBUyxJQUFJLEdBQUcsQ0FBQyxDQUFDLDhCQUE4QjtRQUNqRSxJQUFJLENBQUMsWUFBWSxHQUFHLE9BQU8sQ0FBQztRQUM1QixJQUFJLENBQUMsUUFBUSxHQUFHLFFBQVEsQ0FBQztRQUN6QixJQUFJLENBQUMsTUFBTSxHQUFHLE1BQU0sQ0FBQztRQUNyQixJQUFJLENBQUMsVUFBVSxHQUFHLFVBQVUsQ0FBQztRQUM3QixJQUFJLENBQUMsU0FBUyxHQUFHLEVBQUUsQ0FBQztRQUVwQixJQUFJLENBQUMsa0JBQWtCLEdBQUcsRUFBRSxDQUFDO0lBQ2pDLENBQUM7SUFFTSxtQkFBbUIsQ0FBQyxhQUE0QjtRQUNuRCxJQUFJLENBQUMsa0JBQWtCLENBQUMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxDQUFDO0lBQ2hELENBQUM7SUFFTSxvQkFBb0I7UUFDdkIsSUFBSSxTQUFTLEdBQW9CLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDeEMsS0FBSyxNQUFNLFFBQVEsSUFBSSxJQUFJLENBQUMsb0JBQW9CLEVBQUUsRUFBRTtZQUNoRCxTQUFTLEdBQUcsU0FBUyxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsb0JBQW9CLEVBQUUsQ0FBQyxDQUFDO1NBQ2pFO1FBQ0QsT0FBTyxTQUFTLENBQUM7SUFDckIsQ0FBQztJQUVPLG9CQUFvQjtRQUN4QixPQUFPLElBQUksQ0FBQyxrQkFBa0IsQ0FBQztJQUNuQyxDQUFDO0NBQ0oifQ==