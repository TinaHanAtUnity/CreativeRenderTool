import { NativeApi, ApiPackage } from 'Core/Native/Bridge/NativeApi';
import { EventCategory } from 'Core/Constants/EventCategory';
import { Observable1 } from 'Core/Utilities/Observable';
export var TrackingAuthorizationStatus;
(function (TrackingAuthorizationStatus) {
    TrackingAuthorizationStatus[TrackingAuthorizationStatus["NotDetermined"] = 0] = "NotDetermined";
    TrackingAuthorizationStatus[TrackingAuthorizationStatus["Restricted"] = 1] = "Restricted";
    TrackingAuthorizationStatus[TrackingAuthorizationStatus["Denied"] = 2] = "Denied";
    TrackingAuthorizationStatus[TrackingAuthorizationStatus["Authorized"] = 3] = "Authorized";
})(TrackingAuthorizationStatus || (TrackingAuthorizationStatus = {}));
export class TrackingManagerApi extends NativeApi {
    constructor(nativeBridge) {
        super(nativeBridge, 'TrackingManager', ApiPackage.CORE, EventCategory.TRACKING_MANAGER);
        this.onTrackingAuthorizationStatus = new Observable1();
    }
    available() {
        return this._nativeBridge.invoke(this._fullApiClassName, 'available', []);
    }
    getTrackingAuthorizationStatus() {
        return this._nativeBridge.invoke(this._fullApiClassName, 'getTrackingAuthorizationStatus', []);
    }
    requestTrackingAuthorization() {
        return this._nativeBridge.invoke(this._fullApiClassName, 'requestTrackingAuthorization', []);
    }
    handleEvent(event, parameters) {
        switch (event) {
            case 'TRACKING_AUTHORIZATION_RESPONSE':
                this.onTrackingAuthorizationStatus.trigger(parameters[0]);
                break;
            default:
                super.handleEvent(event, parameters);
        }
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVHJhY2tpbmdNYW5hZ2VyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vc3JjL3RzL0NvcmUvTmF0aXZlL2lPUy9UcmFja2luZ01hbmFnZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFFLFNBQVMsRUFBRSxVQUFVLEVBQUUsTUFBTSw4QkFBOEIsQ0FBQztBQUVyRSxPQUFPLEVBQUUsYUFBYSxFQUFFLE1BQU0sOEJBQThCLENBQUM7QUFDN0QsT0FBTyxFQUFFLFdBQVcsRUFBRSxNQUFNLDJCQUEyQixDQUFDO0FBRXhELE1BQU0sQ0FBTixJQUFZLDJCQUtYO0FBTEQsV0FBWSwyQkFBMkI7SUFDbkMsK0ZBQWEsQ0FBQTtJQUNiLHlGQUFVLENBQUE7SUFDVixpRkFBTSxDQUFBO0lBQ04seUZBQVUsQ0FBQTtBQUNkLENBQUMsRUFMVywyQkFBMkIsS0FBM0IsMkJBQTJCLFFBS3RDO0FBRUQsTUFBTSxPQUFPLGtCQUFtQixTQUFRLFNBQVM7SUFJN0MsWUFBWSxZQUEwQjtRQUNsQyxLQUFLLENBQUMsWUFBWSxFQUFFLGlCQUFpQixFQUFFLFVBQVUsQ0FBQyxJQUFJLEVBQUUsYUFBYSxDQUFDLGdCQUFnQixDQUFDLENBQUM7UUFFeEYsSUFBSSxDQUFDLDZCQUE2QixHQUFHLElBQUksV0FBVyxFQUErQixDQUFDO0lBQ3hGLENBQUM7SUFFTSxTQUFTO1FBQ1osT0FBTyxJQUFJLENBQUMsYUFBYSxDQUFDLE1BQU0sQ0FBVSxJQUFJLENBQUMsaUJBQWlCLEVBQUUsV0FBVyxFQUFFLEVBQUUsQ0FBQyxDQUFDO0lBQ3ZGLENBQUM7SUFFTSw4QkFBOEI7UUFDakMsT0FBTyxJQUFJLENBQUMsYUFBYSxDQUFDLE1BQU0sQ0FBOEIsSUFBSSxDQUFDLGlCQUFpQixFQUFFLGdDQUFnQyxFQUFFLEVBQUUsQ0FBQyxDQUFDO0lBQ2hJLENBQUM7SUFFTSw0QkFBNEI7UUFDL0IsT0FBTyxJQUFJLENBQUMsYUFBYSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsaUJBQWlCLEVBQUUsOEJBQThCLEVBQUUsRUFBRSxDQUFDLENBQUM7SUFDakcsQ0FBQztJQUVNLFdBQVcsQ0FBQyxLQUFhLEVBQUUsVUFBcUI7UUFDbkQsUUFBUSxLQUFLLEVBQUU7WUFDWCxLQUFLLGlDQUFpQztnQkFDbEMsSUFBSSxDQUFDLDZCQUE2QixDQUFDLE9BQU8sQ0FBOEIsVUFBVSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBQ3ZGLE1BQU07WUFDVjtnQkFDSSxLQUFLLENBQUMsV0FBVyxDQUFDLEtBQUssRUFBRSxVQUFVLENBQUMsQ0FBQztTQUM1QztJQUNMLENBQUM7Q0FDSiJ9