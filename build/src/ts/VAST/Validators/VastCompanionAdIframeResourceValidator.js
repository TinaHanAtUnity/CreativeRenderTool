import { Url } from 'Core/Utilities/Url';
import { VastValidationUtilities } from 'VAST/Validators/VastValidationUtilities';
import { CampaignError, CampaignErrorLevel } from 'Ads/Errors/CampaignError';
import { CampaignContentTypes } from 'Ads/Utilities/CampaignContentTypes';
import { VastErrorCode } from 'VAST/EventHandlers/VastCampaignErrorHandler';
export class VastCompanionAdIframeResourceValidator {
    constructor(companionAd) {
        this._errors = [];
        this.validate(companionAd);
    }
    getErrors() {
        return this._errors;
    }
    validate(companionAd) {
        this.validateIframeResourceUrl(companionAd);
        this.validateCreativeDimensions(companionAd);
    }
    validateIframeResourceUrl(companionAd) {
        const adId = companionAd.getId();
        const IframeResourceURL = companionAd.getIframeResourceURL();
        if (IframeResourceURL === null) {
            this._errors.push(new CampaignError(`VAST Companion ad(${adId}) is missing required IframeResource Element`, CampaignContentTypes.ProgrammaticVast, CampaignErrorLevel.MEDIUM, VastErrorCode.COMPANION_RESOURCE_NOT_FOUND, undefined, undefined));
        }
        else if (!Url.isValidProtocol(IframeResourceURL)) {
            this._errors.push(new CampaignError(VastValidationUtilities.invalidUrlError(`companion ad(${adId}) IframeResourceUrl`, IframeResourceURL).message, CampaignContentTypes.ProgrammaticVast, CampaignErrorLevel.MEDIUM, VastErrorCode.COMPANION_RESOURCE_NOT_FOUND, undefined, IframeResourceURL));
        }
    }
    validateCreativeDimensions(companionAd) {
        const adId = companionAd.getId();
        const height = companionAd.getHeight();
        const width = companionAd.getWidth();
        const IframeResourceURL = companionAd.getIframeResourceURL() || undefined;
        // Check minimum square size but notify minimum Portrait/Landscape as suggestion
        // minimum square size 200 px will be the limit to cuoff rendering
        if (height < VastCompanionAdIframeResourceValidator._minSquareSize || width < VastCompanionAdIframeResourceValidator._minSquareSize) {
            if (height > width) { // Portrait
                this._errors.push(new CampaignError(`VAST Companion ad(${adId}) "IframeResource" is not meeting minimum size ${VastCompanionAdIframeResourceValidator._minPortraitWidth} x ${VastCompanionAdIframeResourceValidator._minPortraitHeight} for Portrait display`, CampaignContentTypes.ProgrammaticVast, CampaignErrorLevel.MEDIUM, VastErrorCode.COMPANION_SIZE_UNSUPPORTED, undefined, IframeResourceURL));
            }
            else { // Landscape
                this._errors.push(new CampaignError(`VAST Companion ad(${adId}) "IframeResource" is not meeting minimum size ${VastCompanionAdIframeResourceValidator._minLandscapeWidth} x ${VastCompanionAdIframeResourceValidator._minLandscapeHeight} for Landscape display`, CampaignContentTypes.ProgrammaticVast, CampaignErrorLevel.MEDIUM, VastErrorCode.COMPANION_SIZE_UNSUPPORTED, undefined, IframeResourceURL));
            }
        }
    }
}
VastCompanionAdIframeResourceValidator._minPortraitHeight = 480;
VastCompanionAdIframeResourceValidator._minPortraitWidth = 320;
VastCompanionAdIframeResourceValidator._minLandscapeHeight = 320;
VastCompanionAdIframeResourceValidator._minLandscapeWidth = 480;
VastCompanionAdIframeResourceValidator._minSquareSize = 200; // minimum size requirement
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVmFzdENvbXBhbmlvbkFkSWZyYW1lUmVzb3VyY2VWYWxpZGF0b3IuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9zcmMvdHMvVkFTVC9WYWxpZGF0b3JzL1Zhc3RDb21wYW5pb25BZElmcmFtZVJlc291cmNlVmFsaWRhdG9yLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUVBLE9BQU8sRUFBRSxHQUFHLEVBQUUsTUFBTSxvQkFBb0IsQ0FBQztBQUN6QyxPQUFPLEVBQUUsdUJBQXVCLEVBQUUsTUFBTSx5Q0FBeUMsQ0FBQztBQUNsRixPQUFPLEVBQUUsYUFBYSxFQUFFLGtCQUFrQixFQUFFLE1BQU0sMEJBQTBCLENBQUM7QUFDN0UsT0FBTyxFQUFFLG9CQUFvQixFQUFFLE1BQU0sb0NBQW9DLENBQUM7QUFDMUUsT0FBTyxFQUFFLGFBQWEsRUFBRSxNQUFNLDZDQUE2QyxDQUFDO0FBRTVFLE1BQU0sT0FBTyxzQ0FBc0M7SUFVL0MsWUFBWSxXQUEwQztRQUY5QyxZQUFPLEdBQW9CLEVBQUUsQ0FBQztRQUdsQyxJQUFJLENBQUMsUUFBUSxDQUFDLFdBQVcsQ0FBQyxDQUFDO0lBQy9CLENBQUM7SUFFTSxTQUFTO1FBQ1osT0FBTyxJQUFJLENBQUMsT0FBTyxDQUFDO0lBQ3hCLENBQUM7SUFFTyxRQUFRLENBQUMsV0FBMEM7UUFDdkQsSUFBSSxDQUFDLHlCQUF5QixDQUFDLFdBQVcsQ0FBQyxDQUFDO1FBQzVDLElBQUksQ0FBQywwQkFBMEIsQ0FBQyxXQUFXLENBQUMsQ0FBQztJQUNqRCxDQUFDO0lBRU8seUJBQXlCLENBQUMsV0FBMEM7UUFDeEUsTUFBTSxJQUFJLEdBQUcsV0FBVyxDQUFDLEtBQUssRUFBRSxDQUFDO1FBQ2pDLE1BQU0saUJBQWlCLEdBQUcsV0FBVyxDQUFDLG9CQUFvQixFQUFFLENBQUM7UUFDN0QsSUFBSSxpQkFBaUIsS0FBSyxJQUFJLEVBQUU7WUFDNUIsSUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsSUFBSSxhQUFhLENBQUMscUJBQXFCLElBQUksOENBQThDLEVBQUUsb0JBQW9CLENBQUMsZ0JBQWdCLEVBQUUsa0JBQWtCLENBQUMsTUFBTSxFQUFFLGFBQWEsQ0FBQyw0QkFBNEIsRUFBRSxTQUFTLEVBQUUsU0FBUyxDQUFDLENBQUMsQ0FBQztTQUNyUDthQUFNLElBQUksQ0FBQyxHQUFHLENBQUMsZUFBZSxDQUFDLGlCQUFpQixDQUFDLEVBQUU7WUFDaEQsSUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsSUFBSSxhQUFhLENBQUMsdUJBQXVCLENBQUMsZUFBZSxDQUFDLGdCQUFnQixJQUFJLHFCQUFxQixFQUFFLGlCQUFpQixDQUFDLENBQUMsT0FBTyxFQUFFLG9CQUFvQixDQUFDLGdCQUFnQixFQUFFLGtCQUFrQixDQUFDLE1BQU0sRUFBRSxhQUFhLENBQUMsNEJBQTRCLEVBQUUsU0FBUyxFQUFFLGlCQUFpQixDQUFDLENBQUMsQ0FBQztTQUNuUztJQUNMLENBQUM7SUFFTywwQkFBMEIsQ0FBQyxXQUEwQztRQUN6RSxNQUFNLElBQUksR0FBRyxXQUFXLENBQUMsS0FBSyxFQUFFLENBQUM7UUFDakMsTUFBTSxNQUFNLEdBQUcsV0FBVyxDQUFDLFNBQVMsRUFBRSxDQUFDO1FBQ3ZDLE1BQU0sS0FBSyxHQUFHLFdBQVcsQ0FBQyxRQUFRLEVBQUUsQ0FBQztRQUNyQyxNQUFNLGlCQUFpQixHQUFHLFdBQVcsQ0FBQyxvQkFBb0IsRUFBRSxJQUFJLFNBQVMsQ0FBQztRQUUxRSxnRkFBZ0Y7UUFDaEYsa0VBQWtFO1FBQ2xFLElBQUksTUFBTSxHQUFHLHNDQUFzQyxDQUFDLGNBQWMsSUFBSSxLQUFLLEdBQUcsc0NBQXNDLENBQUMsY0FBYyxFQUFFO1lBQ2pJLElBQUksTUFBTSxHQUFHLEtBQUssRUFBRSxFQUFFLFdBQVc7Z0JBQzdCLElBQUksQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLElBQUksYUFBYSxDQUFDLHFCQUFxQixJQUFJLGtEQUFrRCxzQ0FBc0MsQ0FBQyxpQkFBaUIsTUFBTSxzQ0FBc0MsQ0FBQyxrQkFBa0IsdUJBQXVCLEVBQUUsb0JBQW9CLENBQUMsZ0JBQWdCLEVBQUUsa0JBQWtCLENBQUMsTUFBTSxFQUFFLGFBQWEsQ0FBQywwQkFBMEIsRUFBRSxTQUFTLEVBQUUsaUJBQWlCLENBQUMsQ0FBQyxDQUFDO2FBQzdZO2lCQUFNLEVBQUUsWUFBWTtnQkFDakIsSUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsSUFBSSxhQUFhLENBQUMscUJBQXFCLElBQUksa0RBQWtELHNDQUFzQyxDQUFDLGtCQUFrQixNQUFNLHNDQUFzQyxDQUFDLG1CQUFtQix3QkFBd0IsRUFBRSxvQkFBb0IsQ0FBQyxnQkFBZ0IsRUFBRSxrQkFBa0IsQ0FBQyxNQUFNLEVBQUUsYUFBYSxDQUFDLDBCQUEwQixFQUFFLFNBQVMsRUFBRSxpQkFBaUIsQ0FBQyxDQUFDLENBQUM7YUFDaFo7U0FDSjtJQUNMLENBQUM7O0FBOUN1Qix5REFBa0IsR0FBRyxHQUFHLENBQUM7QUFDekIsd0RBQWlCLEdBQUcsR0FBRyxDQUFDO0FBQ3hCLDBEQUFtQixHQUFHLEdBQUcsQ0FBQztBQUMxQix5REFBa0IsR0FBRyxHQUFHLENBQUM7QUFDekIscURBQWMsR0FBRyxHQUFHLENBQUMsQ0FBQywyQkFBMkIifQ==