import { CampaignError, CampaignErrorLevel } from 'Ads/Errors/CampaignError';
import { CampaignContentTypes } from 'Ads/Utilities/CampaignContentTypes';
import { VastErrorCode } from 'VAST/EventHandlers/VastCampaignErrorHandler';
export class VastCompanionAdHTMLResourceValidator {
    constructor(companionAd) {
        this._errors = [];
        this.validate(companionAd);
    }
    getErrors() {
        return this._errors;
    }
    validate(companionAd) {
        this.validateHTMLResourceUrl(companionAd);
        this.validateCreativeDimensions(companionAd);
    }
    validateHTMLResourceUrl(companionAd) {
        const adId = companionAd.getId();
        const HTMLResourceContent = companionAd.getHtmlResourceContent();
        if (HTMLResourceContent === null) {
            this._errors.push(new CampaignError(`VAST Companion ad(${adId}) is missing required HTMLResource Element`, CampaignContentTypes.ProgrammaticVast, CampaignErrorLevel.MEDIUM, VastErrorCode.COMPANION_RESOURCE_NOT_FOUND, undefined, undefined));
        }
    }
    validateCreativeDimensions(companionAd) {
        const adId = companionAd.getId();
        const height = companionAd.getHeight();
        const width = companionAd.getWidth();
        const HTMLResourceContent = companionAd.getHtmlResourceContent() || undefined;
        // Check minimum square size but notify minimum Portrait/Landscape as suggestion
        // minimum square size 200 px will be the limit to cuoff rendering
        if (height < VastCompanionAdHTMLResourceValidator._minSquareSize || width < VastCompanionAdHTMLResourceValidator._minSquareSize) {
            if (height > width) { // Portrait
                this._errors.push(new CampaignError(`VAST Companion ad(${adId}) "HTMLResource" is not meeting minimum size ${VastCompanionAdHTMLResourceValidator._minPortraitWidth} x ${VastCompanionAdHTMLResourceValidator._minPortraitHeight} for Portrait display`, CampaignContentTypes.ProgrammaticVast, CampaignErrorLevel.MEDIUM, VastErrorCode.COMPANION_SIZE_UNSUPPORTED, undefined, HTMLResourceContent));
            }
            else { // Landscape
                this._errors.push(new CampaignError(`VAST Companion ad(${adId}) "HTMLResource" is not meeting minimum size ${VastCompanionAdHTMLResourceValidator._minLandscapeWidth} x ${VastCompanionAdHTMLResourceValidator._minLandscapeHeight} for Landscape display`, CampaignContentTypes.ProgrammaticVast, CampaignErrorLevel.MEDIUM, VastErrorCode.COMPANION_SIZE_UNSUPPORTED, undefined, HTMLResourceContent));
            }
        }
    }
}
VastCompanionAdHTMLResourceValidator._minPortraitHeight = 480;
VastCompanionAdHTMLResourceValidator._minPortraitWidth = 320;
VastCompanionAdHTMLResourceValidator._minLandscapeHeight = 320;
VastCompanionAdHTMLResourceValidator._minLandscapeWidth = 480;
VastCompanionAdHTMLResourceValidator._minSquareSize = 200; // minimum size requirement
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVmFzdENvbXBhbmlvbkFkSFRNTFJlc291cmNlVmFsaWRhdG9yLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vc3JjL3RzL1ZBU1QvVmFsaWRhdG9ycy9WYXN0Q29tcGFuaW9uQWRIVE1MUmVzb3VyY2VWYWxpZGF0b3IudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBSUEsT0FBTyxFQUFFLGFBQWEsRUFBRSxrQkFBa0IsRUFBRSxNQUFNLDBCQUEwQixDQUFDO0FBQzdFLE9BQU8sRUFBRSxvQkFBb0IsRUFBRSxNQUFNLG9DQUFvQyxDQUFDO0FBQzFFLE9BQU8sRUFBRSxhQUFhLEVBQUUsTUFBTSw2Q0FBNkMsQ0FBQztBQUU1RSxNQUFNLE9BQU8sb0NBQW9DO0lBVTdDLFlBQVksV0FBd0M7UUFGNUMsWUFBTyxHQUFvQixFQUFFLENBQUM7UUFHbEMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxXQUFXLENBQUMsQ0FBQztJQUMvQixDQUFDO0lBRU0sU0FBUztRQUNaLE9BQU8sSUFBSSxDQUFDLE9BQU8sQ0FBQztJQUN4QixDQUFDO0lBRU8sUUFBUSxDQUFDLFdBQXdDO1FBQ3JELElBQUksQ0FBQyx1QkFBdUIsQ0FBQyxXQUFXLENBQUMsQ0FBQztRQUMxQyxJQUFJLENBQUMsMEJBQTBCLENBQUMsV0FBVyxDQUFDLENBQUM7SUFDakQsQ0FBQztJQUVPLHVCQUF1QixDQUFDLFdBQXdDO1FBQ3BFLE1BQU0sSUFBSSxHQUFHLFdBQVcsQ0FBQyxLQUFLLEVBQUUsQ0FBQztRQUNqQyxNQUFNLG1CQUFtQixHQUFHLFdBQVcsQ0FBQyxzQkFBc0IsRUFBRSxDQUFDO1FBQ2pFLElBQUksbUJBQW1CLEtBQUssSUFBSSxFQUFFO1lBQzlCLElBQUksQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLElBQUksYUFBYSxDQUFDLHFCQUFxQixJQUFJLDRDQUE0QyxFQUFFLG9CQUFvQixDQUFDLGdCQUFnQixFQUFFLGtCQUFrQixDQUFDLE1BQU0sRUFBRSxhQUFhLENBQUMsNEJBQTRCLEVBQUUsU0FBUyxFQUFFLFNBQVMsQ0FBQyxDQUFDLENBQUM7U0FDblA7SUFDTCxDQUFDO0lBRU8sMEJBQTBCLENBQUMsV0FBd0M7UUFDdkUsTUFBTSxJQUFJLEdBQUcsV0FBVyxDQUFDLEtBQUssRUFBRSxDQUFDO1FBQ2pDLE1BQU0sTUFBTSxHQUFHLFdBQVcsQ0FBQyxTQUFTLEVBQUUsQ0FBQztRQUN2QyxNQUFNLEtBQUssR0FBRyxXQUFXLENBQUMsUUFBUSxFQUFFLENBQUM7UUFDckMsTUFBTSxtQkFBbUIsR0FBRyxXQUFXLENBQUMsc0JBQXNCLEVBQUUsSUFBSSxTQUFTLENBQUM7UUFFOUUsZ0ZBQWdGO1FBQ2hGLGtFQUFrRTtRQUNsRSxJQUFJLE1BQU0sR0FBRyxvQ0FBb0MsQ0FBQyxjQUFjLElBQUksS0FBSyxHQUFHLG9DQUFvQyxDQUFDLGNBQWMsRUFBRTtZQUM3SCxJQUFJLE1BQU0sR0FBRyxLQUFLLEVBQUUsRUFBRSxXQUFXO2dCQUM3QixJQUFJLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxJQUFJLGFBQWEsQ0FBQyxxQkFBcUIsSUFBSSxnREFBZ0Qsb0NBQW9DLENBQUMsaUJBQWlCLE1BQU0sb0NBQW9DLENBQUMsa0JBQWtCLHVCQUF1QixFQUFFLG9CQUFvQixDQUFDLGdCQUFnQixFQUFFLGtCQUFrQixDQUFDLE1BQU0sRUFBRSxhQUFhLENBQUMsMEJBQTBCLEVBQUUsU0FBUyxFQUFFLG1CQUFtQixDQUFDLENBQUMsQ0FBQzthQUN6WTtpQkFBTSxFQUFFLFlBQVk7Z0JBQ2pCLElBQUksQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLElBQUksYUFBYSxDQUFDLHFCQUFxQixJQUFJLGdEQUFnRCxvQ0FBb0MsQ0FBQyxrQkFBa0IsTUFBTSxvQ0FBb0MsQ0FBQyxtQkFBbUIsd0JBQXdCLEVBQUUsb0JBQW9CLENBQUMsZ0JBQWdCLEVBQUUsa0JBQWtCLENBQUMsTUFBTSxFQUFFLGFBQWEsQ0FBQywwQkFBMEIsRUFBRSxTQUFTLEVBQUUsbUJBQW1CLENBQUMsQ0FBQyxDQUFDO2FBQzVZO1NBQ0o7SUFDTCxDQUFDOztBQTVDdUIsdURBQWtCLEdBQUcsR0FBRyxDQUFDO0FBQ3pCLHNEQUFpQixHQUFHLEdBQUcsQ0FBQztBQUN4Qix3REFBbUIsR0FBRyxHQUFHLENBQUM7QUFDMUIsdURBQWtCLEdBQUcsR0FBRyxDQUFDO0FBQ3pCLG1EQUFjLEdBQUcsR0FBRyxDQUFDLENBQUMsMkJBQTJCIn0=