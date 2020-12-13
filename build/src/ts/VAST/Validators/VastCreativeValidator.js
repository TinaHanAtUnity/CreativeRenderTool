import { Url } from 'Core/Utilities/Url';
import { VastValidationUtilities } from 'VAST/Validators/VastValidationUtilities';
import { CampaignError, CampaignErrorLevel } from 'Ads/Errors/CampaignError';
import { VastErrorCode } from 'VAST/EventHandlers/VastCampaignErrorHandler';
import { CampaignContentTypes } from 'Ads/Utilities/CampaignContentTypes';
export class VastCreativeValidator {
    constructor(creative) {
        this._errors = [];
        this.validate(creative);
    }
    getErrors() {
        return this._errors;
    }
    validate(creative) {
        const trackingEvents = creative.getTrackingEvents();
        Object.keys(trackingEvents).map((key) => {
            trackingEvents[key].map((url) => {
                if (!Url.isValidProtocol(url)) {
                    // Error level LOW
                    this._errors.push(new CampaignError(VastValidationUtilities.invalidUrlError('creative trackingEvents', url).message, CampaignContentTypes.ProgrammaticVast, CampaignErrorLevel.LOW, VastErrorCode.INVALID_URL_ERROR, undefined, url));
                }
            });
        });
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVmFzdENyZWF0aXZlVmFsaWRhdG9yLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vc3JjL3RzL1ZBU1QvVmFsaWRhdG9ycy9WYXN0Q3JlYXRpdmVWYWxpZGF0b3IudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQ0EsT0FBTyxFQUFFLEdBQUcsRUFBRSxNQUFNLG9CQUFvQixDQUFDO0FBRXpDLE9BQU8sRUFBRSx1QkFBdUIsRUFBRSxNQUFNLHlDQUF5QyxDQUFDO0FBQ2xGLE9BQU8sRUFBRSxhQUFhLEVBQUUsa0JBQWtCLEVBQUUsTUFBTSwwQkFBMEIsQ0FBQztBQUU3RSxPQUFPLEVBQUUsYUFBYSxFQUFFLE1BQU0sNkNBQTZDLENBQUM7QUFDNUUsT0FBTyxFQUFFLG9CQUFvQixFQUFFLE1BQU0sb0NBQW9DLENBQUM7QUFFMUUsTUFBTSxPQUFPLHFCQUFxQjtJQUk5QixZQUFZLFFBQXNCO1FBRjFCLFlBQU8sR0FBb0IsRUFBRSxDQUFDO1FBR2xDLElBQUksQ0FBQyxRQUFRLENBQUMsUUFBUSxDQUFDLENBQUM7SUFDNUIsQ0FBQztJQUVNLFNBQVM7UUFDWixPQUFPLElBQUksQ0FBQyxPQUFPLENBQUM7SUFDeEIsQ0FBQztJQUVPLFFBQVEsQ0FBQyxRQUFzQjtRQUNuQyxNQUFNLGNBQWMsR0FBRyxRQUFRLENBQUMsaUJBQWlCLEVBQUUsQ0FBQztRQUNwRCxNQUFNLENBQUMsSUFBSSxDQUFDLGNBQWMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsRUFBRSxFQUFFO1lBQ3BDLGNBQWMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFHLEVBQUUsRUFBRTtnQkFDNUIsSUFBSSxDQUFDLEdBQUcsQ0FBQyxlQUFlLENBQUMsR0FBRyxDQUFDLEVBQUU7b0JBQzNCLGtCQUFrQjtvQkFDbEIsSUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsSUFBSSxhQUFhLENBQUMsdUJBQXVCLENBQUMsZUFBZSxDQUFDLHlCQUF5QixFQUFFLEdBQUcsQ0FBQyxDQUFDLE9BQU8sRUFBRSxvQkFBb0IsQ0FBQyxnQkFBZ0IsRUFBRSxrQkFBa0IsQ0FBQyxHQUFHLEVBQUUsYUFBYSxDQUFDLGlCQUFpQixFQUFFLFNBQVMsRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDO2lCQUN6TztZQUNMLENBQUMsQ0FBQyxDQUFDO1FBQ1AsQ0FBQyxDQUFDLENBQUM7SUFDUCxDQUFDO0NBRUoifQ==