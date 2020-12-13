import { ApiPackage, NativeApi } from 'Core/Native/Bridge/NativeApi';
export class BannerListenerApi extends NativeApi {
    constructor(nativeBridge) {
        super(nativeBridge, 'BannerListener', ApiPackage.BANNER);
    }
    sendLoadEvent(bannerAdViewId) {
        return this._nativeBridge.invoke(this._fullApiClassName, 'sendLoadEvent', [bannerAdViewId]);
    }
    sendClickEvent(bannerAdViewId) {
        return this._nativeBridge.invoke(this._fullApiClassName, 'sendClickEvent', [bannerAdViewId]);
    }
    sendLeaveApplicationEvent(bannerAdViewId) {
        return this._nativeBridge.invoke(this._fullApiClassName, 'sendLeaveApplicationEvent', [bannerAdViewId]);
    }
    sendErrorEvent(bannerAdViewId, bannerErrorCode, errorMessage) {
        return this._nativeBridge.invoke(this._fullApiClassName, 'sendErrorEvent', [bannerAdViewId, bannerErrorCode, errorMessage]);
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQmFubmVyTGlzdGVuZXJBcGkuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9zcmMvdHMvQmFubmVycy9OYXRpdmUvQmFubmVyTGlzdGVuZXJBcGkudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFFLFVBQVUsRUFBRSxTQUFTLEVBQUUsTUFBTSw4QkFBOEIsQ0FBQztBQUlyRSxNQUFNLE9BQU8saUJBQWtCLFNBQVEsU0FBUztJQUU1QyxZQUFZLFlBQTBCO1FBQ2xDLEtBQUssQ0FBQyxZQUFZLEVBQUUsZ0JBQWdCLEVBQUUsVUFBVSxDQUFDLE1BQU0sQ0FBQyxDQUFDO0lBQzdELENBQUM7SUFFTSxhQUFhLENBQUMsY0FBc0I7UUFDdkMsT0FBTyxJQUFJLENBQUMsYUFBYSxDQUFDLE1BQU0sQ0FBTyxJQUFJLENBQUMsaUJBQWlCLEVBQUUsZUFBZSxFQUFFLENBQUMsY0FBYyxDQUFDLENBQUMsQ0FBQztJQUN0RyxDQUFDO0lBRU0sY0FBYyxDQUFDLGNBQXNCO1FBQ3hDLE9BQU8sSUFBSSxDQUFDLGFBQWEsQ0FBQyxNQUFNLENBQU8sSUFBSSxDQUFDLGlCQUFpQixFQUFFLGdCQUFnQixFQUFFLENBQUMsY0FBYyxDQUFDLENBQUMsQ0FBQztJQUN2RyxDQUFDO0lBRU0seUJBQXlCLENBQUMsY0FBc0I7UUFDbkQsT0FBTyxJQUFJLENBQUMsYUFBYSxDQUFDLE1BQU0sQ0FBTyxJQUFJLENBQUMsaUJBQWlCLEVBQUUsMkJBQTJCLEVBQUUsQ0FBQyxjQUFjLENBQUMsQ0FBQyxDQUFDO0lBQ2xILENBQUM7SUFFTSxjQUFjLENBQUMsY0FBc0IsRUFBRSxlQUFnQyxFQUFFLFlBQW9CO1FBQ2hHLE9BQU8sSUFBSSxDQUFDLGFBQWEsQ0FBQyxNQUFNLENBQU8sSUFBSSxDQUFDLGlCQUFpQixFQUFFLGdCQUFnQixFQUFFLENBQUMsY0FBYyxFQUFFLGVBQWUsRUFBRSxZQUFZLENBQUMsQ0FBQyxDQUFDO0lBQ3RJLENBQUM7Q0FFSiJ9