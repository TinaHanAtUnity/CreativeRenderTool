import { BackendApi } from 'Backend/BackendApi';
import { TrackingAuthorizationStatus } from 'Core/Native/iOS/TrackingManager';

export class TrackingManager extends BackendApi {
    public available() {
        return true;
    }

    public getTrackingAuthorizationStatus() {
        return TrackingAuthorizationStatus.Authorized;
    }

    public requestTrackingAuthorization() {
        return;
    }
}
