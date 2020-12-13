import { BackendApi } from 'Backend/BackendApi';
import { UnityAds } from 'Backend/UnityAds';
export class Listener extends BackendApi {
    sendReadyEvent(placement) {
        const listener = UnityAds.getListener();
        if (listener) {
            listener.onUnityAdsReady(placement);
        }
    }
    sendStartEvent(placement) {
        const listener = UnityAds.getListener();
        if (listener) {
            listener.onUnityAdsStart(placement);
        }
    }
    sendFinishEvent(placement, state) {
        const listener = UnityAds.getListener();
        if (listener) {
            listener.onUnityAdsFinish(placement, state);
        }
    }
    sendErrorEvent(error, message) {
        const listener = UnityAds.getListener();
        if (listener) {
            listener.onUnityAdsError(error, message);
        }
    }
    sendClickEvent(placement) {
        const listener = UnityAds.getListener();
        if (listener) {
            listener.onUnityAdsClick(placement);
        }
    }
    sendPlacementStateChangedEvent(placement, oldState, newState) {
        const listener = UnityAds.getListener();
        if (listener) {
            listener.onUnityAdsPlacementStateChanged(placement, oldState, newState);
        }
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiTGlzdGVuZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9zcmMvdHMvQmFja2VuZC9BcGkvTGlzdGVuZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFFLFVBQVUsRUFBRSxNQUFNLG9CQUFvQixDQUFDO0FBQ2hELE9BQU8sRUFBRSxRQUFRLEVBQUUsTUFBTSxrQkFBa0IsQ0FBQztBQUU1QyxNQUFNLE9BQU8sUUFBUyxTQUFRLFVBQVU7SUFFN0IsY0FBYyxDQUFDLFNBQWlCO1FBQ25DLE1BQU0sUUFBUSxHQUFHLFFBQVEsQ0FBQyxXQUFXLEVBQUUsQ0FBQztRQUN4QyxJQUFJLFFBQVEsRUFBRTtZQUNWLFFBQVEsQ0FBQyxlQUFlLENBQUMsU0FBUyxDQUFDLENBQUM7U0FDdkM7SUFDTCxDQUFDO0lBRU0sY0FBYyxDQUFDLFNBQWlCO1FBQ25DLE1BQU0sUUFBUSxHQUFHLFFBQVEsQ0FBQyxXQUFXLEVBQUUsQ0FBQztRQUN4QyxJQUFJLFFBQVEsRUFBRTtZQUNWLFFBQVEsQ0FBQyxlQUFlLENBQUMsU0FBUyxDQUFDLENBQUM7U0FDdkM7SUFDTCxDQUFDO0lBRU0sZUFBZSxDQUFDLFNBQWlCLEVBQUUsS0FBYTtRQUNuRCxNQUFNLFFBQVEsR0FBRyxRQUFRLENBQUMsV0FBVyxFQUFFLENBQUM7UUFDeEMsSUFBSSxRQUFRLEVBQUU7WUFDVixRQUFRLENBQUMsZ0JBQWdCLENBQUMsU0FBUyxFQUFFLEtBQUssQ0FBQyxDQUFDO1NBQy9DO0lBQ0wsQ0FBQztJQUVNLGNBQWMsQ0FBQyxLQUFhLEVBQUUsT0FBZTtRQUNoRCxNQUFNLFFBQVEsR0FBRyxRQUFRLENBQUMsV0FBVyxFQUFFLENBQUM7UUFDeEMsSUFBSSxRQUFRLEVBQUU7WUFDVixRQUFRLENBQUMsZUFBZSxDQUFDLEtBQUssRUFBRSxPQUFPLENBQUMsQ0FBQztTQUM1QztJQUNMLENBQUM7SUFFTSxjQUFjLENBQUMsU0FBaUI7UUFDbkMsTUFBTSxRQUFRLEdBQUcsUUFBUSxDQUFDLFdBQVcsRUFBRSxDQUFDO1FBQ3hDLElBQUksUUFBUSxFQUFFO1lBQ1YsUUFBUSxDQUFDLGVBQWUsQ0FBQyxTQUFTLENBQUMsQ0FBQztTQUN2QztJQUNMLENBQUM7SUFFTSw4QkFBOEIsQ0FBQyxTQUFpQixFQUFFLFFBQWdCLEVBQUUsUUFBZ0I7UUFDdkYsTUFBTSxRQUFRLEdBQUcsUUFBUSxDQUFDLFdBQVcsRUFBRSxDQUFDO1FBQ3hDLElBQUksUUFBUSxFQUFFO1lBQ1YsUUFBUSxDQUFDLCtCQUErQixDQUFDLFNBQVMsRUFBRSxRQUFRLEVBQUUsUUFBUSxDQUFDLENBQUM7U0FDM0U7SUFDTCxDQUFDO0NBRUoifQ==