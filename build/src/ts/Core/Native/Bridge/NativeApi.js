import { Platform } from 'Core/Constants/Platform';
export var ApiPackage;
(function (ApiPackage) {
    ApiPackage[ApiPackage["CORE"] = 0] = "CORE";
    ApiPackage[ApiPackage["ADS"] = 1] = "ADS";
    ApiPackage[ApiPackage["MONETIZATION_CORE"] = 2] = "MONETIZATION_CORE";
    ApiPackage[ApiPackage["ANALYTICS"] = 3] = "ANALYTICS";
    ApiPackage[ApiPackage["AR"] = 4] = "AR";
    ApiPackage[ApiPackage["BANNER"] = 5] = "BANNER";
    ApiPackage[ApiPackage["CHINA"] = 6] = "CHINA";
    ApiPackage[ApiPackage["STORE"] = 7] = "STORE";
})(ApiPackage || (ApiPackage = {}));
export class NativeApi {
    constructor(nativeBridge, apiClass, apiPackage, eventCategory) {
        this._nativeBridge = nativeBridge;
        this._apiClass = apiClass;
        this._apiPackage = apiPackage;
        this._fullApiClassName = this.getFullApiClassName();
        if (typeof eventCategory !== 'undefined') {
            nativeBridge.addEventHandler(eventCategory, this);
        }
    }
    handleEvent(event, parameters) {
        throw new Error(this._apiClass + ' event ' + event + ' does not have an observable');
    }
    getFullApiClassName() {
        switch (this._nativeBridge.getPlatform()) {
            case Platform.ANDROID:
                return NativeApi._apiPackageMapping[this._apiPackage].android + '.' + this._apiClass;
            case Platform.IOS:
                return NativeApi._apiPackageMapping[this._apiPackage].ios + this._apiClass;
            default:
                return this._apiClass;
        }
    }
}
NativeApi._apiPackageMapping = {
    [ApiPackage.CORE]: { android: 'com.unity3d.services.core.api', ios: 'USRVApi' },
    [ApiPackage.ADS]: { android: 'com.unity3d.services.ads.api', ios: 'UADSApi' },
    [ApiPackage.MONETIZATION_CORE]: { android: 'com.unity3d.services.monetization.core.api', ios: 'UMONApi' },
    [ApiPackage.ANALYTICS]: { android: 'com.unity3d.services.analytics.core.api', ios: 'UANAApi' },
    [ApiPackage.AR]: { android: 'com.unity3d.services.ar.api', ios: 'UARApi' },
    [ApiPackage.BANNER]: { android: 'com.unity3d.services.banners.api', ios: 'UADSApi' },
    [ApiPackage.CHINA]: { android: 'com.unity3d.services.china.api', ios: '' },
    [ApiPackage.STORE]: { android: 'com.unity3d.services.store.core.api', ios: 'USTRApi' }
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiTmF0aXZlQXBpLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vc3JjL3RzL0NvcmUvTmF0aXZlL0JyaWRnZS9OYXRpdmVBcGkudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQ0EsT0FBTyxFQUFFLFFBQVEsRUFBRSxNQUFNLHlCQUF5QixDQUFDO0FBR25ELE1BQU0sQ0FBTixJQUFZLFVBU1g7QUFURCxXQUFZLFVBQVU7SUFDbEIsMkNBQUksQ0FBQTtJQUNKLHlDQUFHLENBQUE7SUFDSCxxRUFBaUIsQ0FBQTtJQUNqQixxREFBUyxDQUFBO0lBQ1QsdUNBQUUsQ0FBQTtJQUNGLCtDQUFNLENBQUE7SUFDTiw2Q0FBSyxDQUFBO0lBQ0wsNkNBQUssQ0FBQTtBQUNULENBQUMsRUFUVyxVQUFVLEtBQVYsVUFBVSxRQVNyQjtBQUVELE1BQU0sT0FBZ0IsU0FBUztJQWtCM0IsWUFBc0IsWUFBMEIsRUFBRSxRQUFnQixFQUFFLFVBQXNCLEVBQUUsYUFBNkI7UUFDckgsSUFBSSxDQUFDLGFBQWEsR0FBRyxZQUFZLENBQUM7UUFDbEMsSUFBSSxDQUFDLFNBQVMsR0FBRyxRQUFRLENBQUM7UUFDMUIsSUFBSSxDQUFDLFdBQVcsR0FBRyxVQUFVLENBQUM7UUFDOUIsSUFBSSxDQUFDLGlCQUFpQixHQUFHLElBQUksQ0FBQyxtQkFBbUIsRUFBRSxDQUFDO1FBQ3BELElBQUksT0FBTyxhQUFhLEtBQUssV0FBVyxFQUFFO1lBQ3RDLFlBQVksQ0FBQyxlQUFlLENBQUMsYUFBYSxFQUFFLElBQUksQ0FBQyxDQUFDO1NBQ3JEO0lBQ0wsQ0FBQztJQUVNLFdBQVcsQ0FBQyxLQUFhLEVBQUUsVUFBcUI7UUFDbkQsTUFBTSxJQUFJLEtBQUssQ0FBQyxJQUFJLENBQUMsU0FBUyxHQUFHLFNBQVMsR0FBRyxLQUFLLEdBQUcsOEJBQThCLENBQUMsQ0FBQztJQUN6RixDQUFDO0lBRVMsbUJBQW1CO1FBQ3pCLFFBQVEsSUFBSSxDQUFDLGFBQWEsQ0FBQyxXQUFXLEVBQUUsRUFBRTtZQUN0QyxLQUFLLFFBQVEsQ0FBQyxPQUFPO2dCQUNqQixPQUFPLFNBQVMsQ0FBQyxrQkFBa0IsQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLENBQUMsT0FBTyxHQUFHLEdBQUcsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDO1lBRXpGLEtBQUssUUFBUSxDQUFDLEdBQUc7Z0JBQ2IsT0FBTyxTQUFTLENBQUMsa0JBQWtCLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxDQUFDLEdBQUcsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDO1lBRS9FO2dCQUNJLE9BQU8sSUFBSSxDQUFDLFNBQVMsQ0FBQztTQUM3QjtJQUNMLENBQUM7O0FBekNjLDRCQUFrQixHQUFHO0lBQ2hDLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxFQUFFLEVBQUUsT0FBTyxFQUFFLCtCQUErQixFQUFFLEdBQUcsRUFBRSxTQUFTLEVBQUU7SUFDL0UsQ0FBQyxVQUFVLENBQUMsR0FBRyxDQUFDLEVBQUUsRUFBRSxPQUFPLEVBQUUsOEJBQThCLEVBQUUsR0FBRyxFQUFFLFNBQVMsRUFBRTtJQUM3RSxDQUFDLFVBQVUsQ0FBQyxpQkFBaUIsQ0FBQyxFQUFFLEVBQUUsT0FBTyxFQUFFLDRDQUE0QyxFQUFFLEdBQUcsRUFBRSxTQUFTLEVBQUU7SUFDekcsQ0FBQyxVQUFVLENBQUMsU0FBUyxDQUFDLEVBQUUsRUFBRSxPQUFPLEVBQUUseUNBQXlDLEVBQUUsR0FBRyxFQUFFLFNBQVMsRUFBRTtJQUM5RixDQUFDLFVBQVUsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFLE9BQU8sRUFBRSw2QkFBNkIsRUFBRSxHQUFHLEVBQUUsUUFBUSxFQUFFO0lBQzFFLENBQUMsVUFBVSxDQUFDLE1BQU0sQ0FBQyxFQUFFLEVBQUUsT0FBTyxFQUFFLGtDQUFrQyxFQUFFLEdBQUcsRUFBRSxTQUFTLEVBQUU7SUFDcEYsQ0FBQyxVQUFVLENBQUMsS0FBSyxDQUFDLEVBQUUsRUFBRSxPQUFPLEVBQUUsZ0NBQWdDLEVBQUUsR0FBRyxFQUFFLEVBQUUsRUFBRTtJQUMxRSxDQUFDLFVBQVUsQ0FBQyxLQUFLLENBQUMsRUFBRSxFQUFFLE9BQU8sRUFBRSxxQ0FBcUMsRUFBRSxHQUFHLEVBQUUsU0FBUyxFQUFFO0NBQ3pGLENBQUMifQ==