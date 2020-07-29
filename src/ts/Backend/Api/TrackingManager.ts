import { BackendApi } from 'Backend/BackendApi';

export class DeviceInfo extends BackendApi {

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
