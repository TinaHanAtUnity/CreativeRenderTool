import { OpenMeasurementUtilities } from 'Ads/Views/OpenMeasurement/OpenMeasurementUtilities';
import { ObstructionReasons } from 'Ads/Views/OpenMeasurement/OpenMeasurementDataTypes';
import { VideoAdUnitPopupEventHandler } from 'Ads/EventHandlers/VideoAdUnitPopupEventHandler';
export class VastAdUnitPopupEventHandler extends VideoAdUnitPopupEventHandler {
    constructor(vastAdUnit, parameters) {
        super(vastAdUnit, parameters);
        this._vastAdUnit = vastAdUnit;
        this._vastOMController = parameters.om;
    }
    onPopupClosed() {
        super.onPopupClosed();
        if (this._vastOMController) {
            const adViewBuilder = this._vastOMController.getOMAdViewBuilder();
            const viewPort = adViewBuilder.getViewPort();
            const adView = adViewBuilder.buildVastAdView([]);
            this._vastOMController.geometryChange(viewPort, adView);
        }
    }
    onPopupVisible() {
        super.onPopupVisible();
        if (this._vastOMController) {
            const popup = document.querySelector('.view-container');
            const rect = popup.getBoundingClientRect();
            const x = rect.left;
            const y = rect.top;
            const width = rect.width;
            const height = rect.height;
            const obstructionRectangle = OpenMeasurementUtilities.createRectangle(x, y, width, height);
            const adViewBuilder = this._vastOMController.getOMAdViewBuilder();
            const viewPort = adViewBuilder.getViewPort();
            const adView = adViewBuilder.buildVastAdView([ObstructionReasons.OBSTRUCTED], obstructionRectangle);
            this._vastOMController.geometryChange(viewPort, adView);
        }
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVmFzdEFkVW5pdFBvcHVwRXZlbnRIYW5kbGVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vc3JjL3RzL1ZBU1QvRXZlbnRIYW5kbGVycy9WYXN0QWRVbml0UG9wdXBFdmVudEhhbmRsZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQ0EsT0FBTyxFQUFFLHdCQUF3QixFQUFFLE1BQU0sb0RBQW9ELENBQUM7QUFDOUYsT0FBTyxFQUFFLGtCQUFrQixFQUFFLE1BQU0sb0RBQW9ELENBQUM7QUFDeEYsT0FBTyxFQUFFLDRCQUE0QixFQUFFLE1BQU0sZ0RBQWdELENBQUM7QUFJOUYsTUFBTSxPQUFPLDJCQUE0QixTQUFRLDRCQUEwQztJQUt2RixZQUFZLFVBQXNCLEVBQUUsVUFBaUM7UUFDakUsS0FBSyxDQUFDLFVBQVUsRUFBRSxVQUFVLENBQUMsQ0FBQztRQUU5QixJQUFJLENBQUMsV0FBVyxHQUFHLFVBQVUsQ0FBQztRQUM5QixJQUFJLENBQUMsaUJBQWlCLEdBQUcsVUFBVSxDQUFDLEVBQUUsQ0FBQztJQUMzQyxDQUFDO0lBRU0sYUFBYTtRQUNoQixLQUFLLENBQUMsYUFBYSxFQUFFLENBQUM7UUFFdEIsSUFBSSxJQUFJLENBQUMsaUJBQWlCLEVBQUU7WUFDeEIsTUFBTSxhQUFhLEdBQUcsSUFBSSxDQUFDLGlCQUFpQixDQUFDLGtCQUFrQixFQUFFLENBQUM7WUFDbEUsTUFBTSxRQUFRLEdBQUcsYUFBYSxDQUFDLFdBQVcsRUFBRSxDQUFDO1lBQzdDLE1BQU0sTUFBTSxHQUFHLGFBQWEsQ0FBQyxlQUFlLENBQUMsRUFBRSxDQUFDLENBQUM7WUFDakQsSUFBSSxDQUFDLGlCQUFpQixDQUFDLGNBQWMsQ0FBQyxRQUFRLEVBQUUsTUFBTSxDQUFDLENBQUM7U0FDM0Q7SUFDTCxDQUFDO0lBRU0sY0FBYztRQUNqQixLQUFLLENBQUMsY0FBYyxFQUFFLENBQUM7UUFFdkIsSUFBSSxJQUFJLENBQUMsaUJBQWlCLEVBQUU7WUFDeEIsTUFBTSxLQUFLLEdBQWdCLFFBQVEsQ0FBQyxhQUFhLENBQUMsaUJBQWlCLENBQUMsQ0FBQztZQUNyRSxNQUFNLElBQUksR0FBRyxLQUFLLENBQUMscUJBQXFCLEVBQUUsQ0FBQztZQUMzQyxNQUFNLENBQUMsR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDO1lBQ3BCLE1BQU0sQ0FBQyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUM7WUFDbkIsTUFBTSxLQUFLLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQztZQUN6QixNQUFNLE1BQU0sR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDO1lBRTNCLE1BQU0sb0JBQW9CLEdBQUcsd0JBQXdCLENBQUMsZUFBZSxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsS0FBSyxFQUFFLE1BQU0sQ0FBQyxDQUFDO1lBQzNGLE1BQU0sYUFBYSxHQUFHLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxrQkFBa0IsRUFBRSxDQUFDO1lBQ2xFLE1BQU0sUUFBUSxHQUFHLGFBQWEsQ0FBQyxXQUFXLEVBQUUsQ0FBQztZQUM3QyxNQUFNLE1BQU0sR0FBRyxhQUFhLENBQUMsZUFBZSxDQUFDLENBQUMsa0JBQWtCLENBQUMsVUFBVSxDQUFDLEVBQUUsb0JBQW9CLENBQUMsQ0FBQztZQUNwRyxJQUFJLENBQUMsaUJBQWlCLENBQUMsY0FBYyxDQUFDLFFBQVEsRUFBRSxNQUFNLENBQUMsQ0FBQztTQUMzRDtJQUNMLENBQUM7Q0FDSiJ9