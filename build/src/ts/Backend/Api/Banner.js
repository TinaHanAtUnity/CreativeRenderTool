import { BackendApi } from 'Backend/BackendApi';
import { Observable2, Observable1, Observable4 } from 'Core/Utilities/Observable';
export class BannerBackendApi extends BackendApi {
    constructor() {
        super(...arguments);
        this.onBannerResized = new Observable2();
        this.onBannerVisibilityChanged = new Observable2();
        this.onBannerAttached = new Observable1();
        this.onBannerDetached = new Observable1();
        this.onBannerLoaded = new Observable1();
        this.onBannerDestroyed = new Observable1();
        this.onBannerLoadPlacement = new Observable4();
        this.onBannerDestroyBanner = new Observable1();
    }
    setRefreshRate(placementId, refreshRate) {
        return Promise.resolve();
    }
    load(bannerViewType, width, height, bannerAdViewId) {
        this.onBannerLoaded.trigger(bannerAdViewId);
        return Promise.resolve();
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQmFubmVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vc3JjL3RzL0JhY2tlbmQvQXBpL0Jhbm5lci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUUsVUFBVSxFQUFFLE1BQU0sb0JBQW9CLENBQUM7QUFFaEQsT0FBTyxFQUFFLFdBQVcsRUFBRSxXQUFXLEVBQUUsV0FBVyxFQUFFLE1BQU0sMkJBQTJCLENBQUM7QUFFbEYsTUFBTSxPQUFPLGdCQUFpQixTQUFRLFVBQVU7SUFBaEQ7O1FBRW9CLG9CQUFlLEdBQUcsSUFBSSxXQUFXLEVBQStCLENBQUM7UUFDakUsOEJBQXlCLEdBQUcsSUFBSSxXQUFXLEVBQXNCLENBQUM7UUFDbEUscUJBQWdCLEdBQUcsSUFBSSxXQUFXLEVBQVUsQ0FBQztRQUM3QyxxQkFBZ0IsR0FBRyxJQUFJLFdBQVcsRUFBVSxDQUFDO1FBQzdDLG1CQUFjLEdBQUcsSUFBSSxXQUFXLEVBQVUsQ0FBQztRQUMzQyxzQkFBaUIsR0FBRyxJQUFJLFdBQVcsRUFBVSxDQUFDO1FBQzlDLDBCQUFxQixHQUFHLElBQUksV0FBVyxFQUFrQyxDQUFDO1FBQzFFLDBCQUFxQixHQUFHLElBQUksV0FBVyxFQUFVLENBQUM7SUFXdEUsQ0FBQztJQVRVLGNBQWMsQ0FBQyxXQUFtQixFQUFFLFdBQW1CO1FBQzFELE9BQU8sT0FBTyxDQUFDLE9BQU8sRUFBRSxDQUFDO0lBQzdCLENBQUM7SUFFTSxJQUFJLENBQUMsY0FBOEIsRUFBRSxLQUFhLEVBQUUsTUFBYyxFQUFFLGNBQXNCO1FBQzdGLElBQUksQ0FBQyxjQUFjLENBQUMsT0FBTyxDQUFDLGNBQWMsQ0FBQyxDQUFDO1FBQzVDLE9BQU8sT0FBTyxDQUFDLE9BQU8sRUFBRSxDQUFDO0lBQzdCLENBQUM7Q0FFSiJ9