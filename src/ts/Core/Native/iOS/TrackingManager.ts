import { NativeApi, ApiPackage } from 'Core/Native/Bridge/NativeApi';
import { NativeBridge } from 'Core/Native/Bridge/NativeBridge';
import { EventCategory } from 'Core/Constants/EventCategory';
import { Observable1 } from 'Core/Utilities/Observable';

export enum TrackingAuthorizationStatus {
    NotDetermined,
    Restricted,
    Denied,
    Authorized
}

export class TrackingManagerApi extends NativeApi {

    public readonly onTrackingAuthorizationStatus: Observable1<TrackingAuthorizationStatus>;

    constructor(nativeBridge: NativeBridge) {
        super(nativeBridge, 'TrackingManager', ApiPackage.CORE, EventCategory.TRACKING_MANAGER);

        this.onTrackingAuthorizationStatus = new Observable1<TrackingAuthorizationStatus>();
    }

    public available(): Promise<boolean> {
        return this._nativeBridge.invoke<boolean>(this._fullApiClassName, 'available', []);
    }

    public getTrackingAuthorizationStatus(): Promise<TrackingAuthorizationStatus> {
        return this._nativeBridge.invoke<TrackingAuthorizationStatus>(this._fullApiClassName, 'getTrackingAuthorizationStatus', []);
    }

    public requestTrackingAuthorization(): Promise<void> {
        return this._nativeBridge.invoke(this._fullApiClassName, 'requestTrackingAuthorization', []);
    }

    public handleEvent(event: string, parameters: unknown[]) {
        switch (event) {
            case 'TRACKING_AUTHORIZATION_RESPONSE':
                this.onTrackingAuthorizationStatus.trigger(<TrackingAuthorizationStatus>parameters[0]);
                break;
            default:
                super.handleEvent(event, parameters);
        }
    }
}
