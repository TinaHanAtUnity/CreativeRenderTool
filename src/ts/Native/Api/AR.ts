import { ApiPackage, NativeApi } from 'Native/NativeApi';
import { NativeBridge } from 'Native/NativeBridge';
import { Observable0, Observable1, Observable2 } from 'Utilities/Observable';
import { ARUtil, IARFrameInfo, IARFrameScale, IARPoint, IARRect, IARSize } from 'Utilities/ARUtil';
import { Platform } from 'Constants/Platform';

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

export interface IARConfigurationProperties {
    configurationName: string;
    lightEstimationEnabled?: boolean;
    worldAlignment?: number;
    planeDetection?: number;
}

export interface IARRunProperties {
    runOptions?: number;
    configuration?: IARConfigurationProperties;
}

export interface IARVideoFormat {
    imageResolution: IARSize;
    framesPerSecond: number;
}

export class ARApi extends NativeApi {
    private static calculateVideoScale(frameInfo: IARFrameInfo): IARFrameScale {
        let videoRect: IARRect = {x: 0, y: 0, width: frameInfo.videoSize.width, height: frameInfo.videoSize.height};
        videoRect = ARUtil.transformRect(videoRect, ARUtil.invertTransform(frameInfo.transform));

        // Calculate scaling for aspect fill
        const videoAspectRatio = videoRect.width / videoRect.height;
        const drawableAspectRatio = frameInfo.drawableSize.width / frameInfo.drawableSize.height;

        let dstWidth = frameInfo.drawableSize.width;
        let dstHeight = frameInfo.drawableSize.height;

        if(drawableAspectRatio > videoAspectRatio) {
            dstHeight *= drawableAspectRatio * (1 / videoAspectRatio);
        } else {
            dstWidth *= (1 / drawableAspectRatio) * videoAspectRatio;
        }

        return {
            scaleX: dstWidth / videoRect.width,
            scaleY: dstHeight / videoRect.height
        };
    }

    public readonly onPlanesAdded = new Observable1<string>();
    public readonly onPlanesRemoved = new Observable1<string>();
    public readonly onPlanesUpdated = new Observable1<string>();
    public readonly onAnchorsUpdated = new Observable1<string>();
    public readonly onFrameUpdated = new Observable1<string>();
    public readonly onWindowResized = new Observable2<number, number>();
    public readonly onError = new Observable1<number>();
    public readonly onSessionInterrupted = new Observable0();
    public readonly onSessionInterruptionEnded = new Observable0();
    public readonly onAndroidEnumsReceived = new Observable1<any>();

    constructor(nativeBridge: NativeBridge) {
        super(nativeBridge, 'AR', ApiPackage.AR);
    }

    public isARSupported(): Promise<boolean> {
        return this._nativeBridge.invoke<boolean>(this._fullApiClassName, 'isARSupported', ['ARWorldTrackingConfiguration']);
    }

    public restartSession(arRunProperties: IARRunProperties): Promise<void> {
        return this._nativeBridge.invoke<void>(this._fullApiClassName, 'restartSession', [arRunProperties]);
    }

    public setDepthFar(depth: number): Promise<void> {
        return this._nativeBridge.invoke<void>(this._fullApiClassName, 'setDepthFar', [depth]);
    }

    public setDepthNear(depth: number): Promise<void> {
        return this._nativeBridge.invoke<void>(this._fullApiClassName, 'setDepthNear', [depth]);
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

    public advanceFrame(): Promise<void> {
        // We don't have scaling logic in Android at the moment.
        if (this._nativeBridge.getPlatform() === Platform.ANDROID) {
            return this._nativeBridge.invoke<void>(this._fullApiClassName, 'advanceFrame');
        }

        // Get frame info, calculate scaling and then call advanceFrame
        return this.getFrameInfo().then((frameInfo) => {
            const scale = ARApi.calculateVideoScale(frameInfo);
            return this.setFrameScaling(scale).then(
                () => this._nativeBridge.invoke<void>(this._fullApiClassName, 'advanceFrame')).catch(
                    (error) => this._nativeBridge.Sdk.logInfo('Cannot set scaling: ' + error));
        }).catch((error) => this._nativeBridge.Sdk.logInfo('Cannot get frame info: ' + error));
    }

    public getFrameInfo(): Promise<IARFrameInfo> {
        return this._nativeBridge.invoke<IARFrameInfo>(this._fullApiClassName, 'getFrameInfo');
    }

    public setFrameScaling(scale: IARFrameScale): Promise<void> {
        return this._nativeBridge.invoke<void>(this._fullApiClassName, 'setFrameScaling', [scale]);
    }

    public getSupportedVideoFormats(): Promise<IARVideoFormat[]> {
        return this._nativeBridge.invoke<IARVideoFormat[]>(this._fullApiClassName, 'getSupportedVideoFormats');
    }

    public initAR(): Promise<void> {
        if (this._nativeBridge.getPlatform() === Platform.ANDROID) {
            return this._nativeBridge.invoke<any>(this._fullApiClassName, 'getAndroidConfigEnums').then((enums) => {
                this.onAndroidEnumsReceived.trigger(enums);

                return Promise.resolve();
            });
        }

        return Promise.resolve();
    }

    public handleEvent(event: string, parameters: any[]): void {
        switch (event) {
            case AREvent[AREvent.AR_PLANES_ADDED]:
                this.onPlanesAdded.trigger(parameters[0]);
                break;
            case AREvent[AREvent.AR_PLANES_REMOVED]:
                this.onPlanesRemoved.trigger(parameters[0]);
                break;
            case AREvent[AREvent.AR_PLANES_UPDATED]:
                this.onPlanesUpdated.trigger(parameters[0]);
                break;
            case AREvent[AREvent.AR_ANCHORS_UPDATED]:
                this.onAnchorsUpdated.trigger(parameters[0]);
                break;
            case AREvent[AREvent.AR_FRAME_UPDATED]:
                this.onFrameUpdated.trigger(parameters[0]);
                break;
            case AREvent[AREvent.AR_WINDOW_RESIZED]:
                this.onWindowResized.trigger(parameters[0], parameters[1]);
                break;
            case AREvent[AREvent.AR_ERROR]:
                this.onError.trigger(parameters[0]);
                break;
            case AREvent[AREvent.AR_SESSION_INTERRUPTED]:
                this.onSessionInterrupted.trigger();
                break;
            case AREvent[AREvent.AR_SESSION_INTERRUPTION_ENDED]:
                this.onSessionInterruptionEnded.trigger();
                break;
            default:
                this._nativeBridge.Sdk.logError('Unknown AR event: ' + event);
        }
    }
}
