import { ApiPackage, NativeApi } from 'Core/Native/Bridge/NativeApi';
export class ListenerApi extends NativeApi {
    constructor(nativeBridge) {
        super(nativeBridge, 'Listener', ApiPackage.ADS);
    }
    sendErrorEvent(error, message) {
        // Uses same codepath as Ads/Native/Listener.sendErrorEvent
        return this._nativeBridge.invoke(this._fullApiClassName, 'sendErrorEvent', [error, message]);
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiTGlzdGVuZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9zcmMvdHMvQ29yZS9OYXRpdmUvTGlzdGVuZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFFLFVBQVUsRUFBRSxTQUFTLEVBQUUsTUFBTSw4QkFBOEIsQ0FBQztBQUdyRSxNQUFNLE9BQU8sV0FBWSxTQUFRLFNBQVM7SUFFdEMsWUFBWSxZQUEwQjtRQUNsQyxLQUFLLENBQUMsWUFBWSxFQUFFLFVBQVUsRUFBRSxVQUFVLENBQUMsR0FBRyxDQUFDLENBQUM7SUFDcEQsQ0FBQztJQUVNLGNBQWMsQ0FBQyxLQUFhLEVBQUUsT0FBZTtRQUNoRCwyREFBMkQ7UUFDM0QsT0FBTyxJQUFJLENBQUMsYUFBYSxDQUFDLE1BQU0sQ0FBTyxJQUFJLENBQUMsaUJBQWlCLEVBQUUsZ0JBQWdCLEVBQUUsQ0FBQyxLQUFLLEVBQUUsT0FBTyxDQUFDLENBQUMsQ0FBQztJQUN2RyxDQUFDO0NBRUoifQ==