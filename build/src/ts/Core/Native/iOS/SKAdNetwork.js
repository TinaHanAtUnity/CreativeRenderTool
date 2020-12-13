import { NativeApi, ApiPackage } from 'Core/Native/Bridge/NativeApi';
export class SKAdNetworkApi extends NativeApi {
    constructor(nativeBridge) {
        super(nativeBridge, 'SKAdNetwork', ApiPackage.CORE);
    }
    available() {
        return this._nativeBridge.invoke(this._fullApiClassName, 'available', []);
    }
    updateConversionValue(conversionValue) {
        return this._nativeBridge.invoke(this._fullApiClassName, 'updateConversionValue', [conversionValue]);
    }
    registerAppForAdNetworkAttribution() {
        return this._nativeBridge.invoke(this._fullApiClassName, 'registerAppForAdNetworkAttribution', []);
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiU0tBZE5ldHdvcmsuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9zcmMvdHMvQ29yZS9OYXRpdmUvaU9TL1NLQWROZXR3b3JrLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBRSxTQUFTLEVBQUUsVUFBVSxFQUFFLE1BQU0sOEJBQThCLENBQUM7QUFHckUsTUFBTSxPQUFPLGNBQWUsU0FBUSxTQUFTO0lBRXpDLFlBQVksWUFBMEI7UUFDbEMsS0FBSyxDQUFDLFlBQVksRUFBRSxhQUFhLEVBQUUsVUFBVSxDQUFDLElBQUksQ0FBQyxDQUFDO0lBQ3hELENBQUM7SUFFTSxTQUFTO1FBQ1osT0FBTyxJQUFJLENBQUMsYUFBYSxDQUFDLE1BQU0sQ0FBVSxJQUFJLENBQUMsaUJBQWlCLEVBQUUsV0FBVyxFQUFFLEVBQUUsQ0FBQyxDQUFDO0lBQ3ZGLENBQUM7SUFFTSxxQkFBcUIsQ0FBQyxlQUF1QjtRQUNoRCxPQUFPLElBQUksQ0FBQyxhQUFhLENBQUMsTUFBTSxDQUFPLElBQUksQ0FBQyxpQkFBaUIsRUFBRSx1QkFBdUIsRUFBRSxDQUFDLGVBQWUsQ0FBQyxDQUFDLENBQUM7SUFDL0csQ0FBQztJQUVNLGtDQUFrQztRQUNyQyxPQUFPLElBQUksQ0FBQyxhQUFhLENBQUMsTUFBTSxDQUFPLElBQUksQ0FBQyxpQkFBaUIsRUFBRSxvQ0FBb0MsRUFBRSxFQUFFLENBQUMsQ0FBQztJQUM3RyxDQUFDO0NBRUoifQ==