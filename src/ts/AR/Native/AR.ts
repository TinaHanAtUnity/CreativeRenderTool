import { AndroidARApi } from 'AR/Native/Android/AndroidARApi';
import { IosARApi } from 'AR/Native/iOS/IosARApi';
import { IARSize } from 'AR/Utilities/ARUtil';
import { EventCategory } from 'Core/Constants/EventCategory';
import { Platform } from 'Core/Constants/Platform';
import { ApiPackage, NativeApi } from 'Core/Native/Bridge/NativeApi';
import { NativeBridge } from 'Core/Native/Bridge/NativeBridge';
import { Double } from 'Core/Utilities/Double';
import { Observable0, Observable1, Observable2 } from 'Core/Utilities/Observable';

enum AREvent {
    AR_PLANES_ADDED,
    AR_PLANES_REMOVED,
    AR_PLANES_UPDATED,
    AR_ANCHORS_UPDATED,
    AR_FRAME_UPDATED,
    AR_WINDOW_RESIZED,
    AR_ERROR,
    AR_SESSION_INTERRUPTED,
    AR_SESSION_INTERRUPTION_ENDED
}

export interface IIosARConfigurationProperties {
    configurationName: string;
    lightEstimationEnabled?: boolean;
    worldAlignment?: number;
    planeDetection?: number;
}

export interface IIosARRunProperties {
    runOptions?: number;
    configuration?: IIosARConfigurationProperties;
}

export interface IAndroidARRunProperties {
    lightEstimationMode?: string;
    planeFindingMode?: string;
    updateMode?: string;
}

export interface IARVideoFormat {
    imageResolution: IARSize;
    framesPerSecond: number;
}

export class ARApi extends NativeApi {
    public Android: AndroidARApi;
    public Ios: IosARApi;

    public readonly onPlanesAdded = new Observable1<string>();
    public readonly onPlanesRemoved = new Observable1<string>();
    public readonly onPlanesUpdated = new Observable1<string>();
    public readonly onAnchorsUpdated = new Observable1<string>();
    public readonly onFrameUpdated = new Observable1<string>();
    public readonly onWindowResized = new Observable2<number, number>();
    public readonly onError = new Observable1<number>();
    public readonly onSessionInterrupted = new Observable0();
    public readonly onSessionInterruptionEnded = new Observable0();

    constructor(nativeBridge: NativeBridge) {
        super(nativeBridge, 'AR', ApiPackage.AR, EventCategory.AR);

        if (nativeBridge.getPlatform() === Platform.ANDROID) {
            this.Android = new AndroidARApi(nativeBridge);
        } else if (nativeBridge.getPlatform() === Platform.IOS) {
            this.Ios = new IosARApi(nativeBridge);
        }
    }

    public restartSession(arRunProperties: IIosARRunProperties|IAndroidARRunProperties): Promise<void> {
        return this._nativeBridge.invoke<void>(this._fullApiClassName, 'restartSession', [arRunProperties]);
    }

    public setDepthFar(depth: number): Promise<void> {
        return this._nativeBridge.invoke<void>(this._fullApiClassName, 'setDepthFar', [new Double(depth)]);
    }

    public setDepthNear(depth: number): Promise<void> {
        return this._nativeBridge.invoke<void>(this._fullApiClassName, 'setDepthNear', [new Double(depth)]);
    }

    public showCameraFeed(): Promise<void> {
        return this._nativeBridge.invoke<void>(this._fullApiClassName, 'showCameraFeed');
    }

    public hideCameraFeed(): Promise<void> {
        return this._nativeBridge.invoke<void>(this._fullApiClassName, 'hideCameraFeed');
    }

    public addAnchor(identifier: string, matrix: string): Promise<void> {
        return this._nativeBridge.invoke<void>(this._fullApiClassName, 'addAnchor', [identifier, matrix]);
    }

    public removeAnchor(identifier: string): Promise<void> {
        return this._nativeBridge.invoke<void>(this._fullApiClassName, 'removeAnchor', [identifier]);
    }

    public getSupportedVideoFormats(configName: string): Promise<IARVideoFormat[]> {
        return this._nativeBridge.invoke<IARVideoFormat[]>(this._fullApiClassName, 'getSupportedVideoFormats', [configName]);
    }

    public handleEvent(event: string, parameters: unknown[]): void {
        switch (event) {
            case AREvent[AREvent.AR_PLANES_ADDED]:
                this.onPlanesAdded.trigger(<string>parameters[0]);
                break;
            case AREvent[AREvent.AR_PLANES_REMOVED]:
                this.onPlanesRemoved.trigger(<string>parameters[0]);
                break;
            case AREvent[AREvent.AR_PLANES_UPDATED]:
                this.onPlanesUpdated.trigger(<string>parameters[0]);
                break;
            case AREvent[AREvent.AR_ANCHORS_UPDATED]:
                this.onAnchorsUpdated.trigger(<string>parameters[0]);
                break;
            case AREvent[AREvent.AR_FRAME_UPDATED]:
                this.onFrameUpdated.trigger(<string>parameters[0]);
                break;
            case AREvent[AREvent.AR_WINDOW_RESIZED]:
                this.onWindowResized.trigger(<number>parameters[0], <number>parameters[1]);
                break;
            case AREvent[AREvent.AR_ERROR]:
                this.onError.trigger(<number>parameters[0]);
                break;
            case AREvent[AREvent.AR_SESSION_INTERRUPTED]:
                this.onSessionInterrupted.trigger();
                break;
            case AREvent[AREvent.AR_SESSION_INTERRUPTION_ENDED]:
                this.onSessionInterruptionEnded.trigger();
                break;
            default:
                super.handleEvent(event, parameters);
        }
    }
}
