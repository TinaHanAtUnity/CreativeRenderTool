import { Platform } from 'Core/Constants/Platform';
import { AndroidDeviceInfo } from 'Core/Models/AndroidDeviceInfo';
export class TrackingIdentifierFilter {
    static getDeviceTrackingIdentifiers(platform, deviceInfo) {
        let trackingIdentifiers = {};
        if (deviceInfo.getAdvertisingIdentifier()) {
            trackingIdentifiers = {
                advertisingTrackingId: deviceInfo.getAdvertisingIdentifier(),
                limitAdTracking: deviceInfo.getLimitAdTracking()
            };
        }
        else if (platform === Platform.ANDROID && deviceInfo instanceof AndroidDeviceInfo) {
            trackingIdentifiers = {
                androidId: deviceInfo.getAndroidId()
            };
        }
        return trackingIdentifiers;
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVHJhY2tpbmdJZGVudGlmaWVyRmlsdGVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vc3JjL3RzL0Fkcy9VdGlsaXRpZXMvVHJhY2tpbmdJZGVudGlmaWVyRmlsdGVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBRSxRQUFRLEVBQUUsTUFBTSx5QkFBeUIsQ0FBQztBQUNuRCxPQUFPLEVBQUUsaUJBQWlCLEVBQUUsTUFBTSwrQkFBK0IsQ0FBQztBQVNsRSxNQUFNLE9BQU8sd0JBQXdCO0lBQzFCLE1BQU0sQ0FBQyw0QkFBNEIsQ0FBQyxRQUFrQixFQUFFLFVBQXNCO1FBQ2pGLElBQUksbUJBQW1CLEdBQXdCLEVBQUUsQ0FBQztRQUNsRCxJQUFJLFVBQVUsQ0FBQyx3QkFBd0IsRUFBRSxFQUFFO1lBQ3ZDLG1CQUFtQixHQUFHO2dCQUNsQixxQkFBcUIsRUFBRSxVQUFVLENBQUMsd0JBQXdCLEVBQUU7Z0JBQzVELGVBQWUsRUFBRSxVQUFVLENBQUMsa0JBQWtCLEVBQUU7YUFDbkQsQ0FBQztTQUNMO2FBQU0sSUFBSSxRQUFRLEtBQUssUUFBUSxDQUFDLE9BQU8sSUFBSSxVQUFVLFlBQVksaUJBQWlCLEVBQUU7WUFDakYsbUJBQW1CLEdBQUc7Z0JBQ2xCLFNBQVMsRUFBRSxVQUFVLENBQUMsWUFBWSxFQUFFO2FBQ3ZDLENBQUM7U0FDTDtRQUNELE9BQU8sbUJBQW1CLENBQUM7SUFDL0IsQ0FBQztDQUNKIn0=