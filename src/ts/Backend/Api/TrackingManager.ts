import { BackendApi } from 'Backend/BackendApi';

export class TrackingManager extends BackendApi {

    public getTrackingAuthorizationStatus() {
        return 0;
    }

    public requestTrackingAuthorization() {
        return undefined;
    }

    public available() {
        return true;
    }
}
