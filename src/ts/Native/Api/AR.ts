import { NativeApi } from 'Native/NativeApi';
import { NativeBridge } from 'Native/NativeBridge';
import { Observable0, Observable1, Observable2 } from 'Utilities/Observable';
import { ARUtil, IARFrameInfo, IARFrameScale, IARPoint, IARRect } from 'Utilities/ARUtil';

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

export class ARApi extends NativeApi {
    private static calculateVideoScale(frameInfo: IARFrameInfo): IARFrameScale {
        let videoRect: IARRect = {x: 0, y: 0, width: frameInfo.videoSize.width, height: frameInfo.videoSize.height};
        videoRect = ARUtil.transformRect(videoRect, ARUtil.invertTransform(frameInfo.transform));

        let bottomRight: IARPoint = {x: frameInfo.videoSize.width, y: frameInfo.videoSize.height};
        bottomRight = ARUtil.transformPoint(bottomRight, frameInfo.transform);
        const videoBounds: IARRect = {x: 0, y: 0, width: bottomRight.x, height: bottomRight.y};
        const videoAspectRatio = videoBounds.width / videoBounds.height;
        const drawableAspectRatio = frameInfo.drawableSize.width / frameInfo.drawableSize.height;

        const scaleX = frameInfo.drawableSize.width / videoRect.width;
        const scaleY = frameInfo.drawableSize.height / videoRect.height;
        if (videoAspectRatio < drawableAspectRatio) {
            return {scaleX: Math.max(scaleX, scaleY), scaleY: Math.max(scaleX, scaleY)};
        } else {
            return {scaleX: Math.min(scaleX, scaleY), scaleY: Math.min(scaleX, scaleY)};
        }
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

    constructor(nativeBridge: NativeBridge) {
        super(nativeBridge, 'AR');
    }

    public isARSupported(): Promise<boolean> {
        return this._nativeBridge.invoke<boolean>(this._apiClass, 'isARSupported', ['ARWorldTrackingConfiguration']);
    }

    public restartSession(arRunProperties: IARRunProperties): Promise<void> {
        return this._nativeBridge.invoke<void>(this._apiClass, 'restartSession', [arRunProperties]);
    }

    public setDepthFar(depth: number): Promise<void> {
        return this._nativeBridge.invoke<void>(this._apiClass, 'setDepthFar', [depth]);
    }

    public setDepthNear(depth: number): Promise<void> {
        return this._nativeBridge.invoke<void>(this._apiClass, 'setDepthNear', [depth]);
    }

    public showCameraFeed(): Promise<void> {
        return this._nativeBridge.invoke<void>(this._apiClass, 'showCameraFeed');
    }

    public hideCameraFeed(): Promise<void> {
        return this._nativeBridge.invoke<void>(this._apiClass, 'hideCameraFeed');
    }

    public addAnchor(identifier: string, matrix: string): Promise<void> {
        return this._nativeBridge.invoke<void>(this._apiClass, 'addAnchor', [identifier, matrix]);
    }

    public removeAnchor(identifier: string): Promise<void> {
        return this._nativeBridge.invoke<void>(this._apiClass, 'removeAnchor', [identifier]);
    }

    public advanceFrame(): Promise<void> {
        // Get frame info, calculate scaling and then call advanceFrame
        return this.getFrameInfo().then((frameInfo) => {
            const scale = ARApi.calculateVideoScale(frameInfo);
            return this.setFrameScaling(scale).then(
                () => this._nativeBridge.invoke<void>(this._apiClass, 'advanceFrame')).catch(
                    (error) => this._nativeBridge.Sdk.logInfo('Cannot set scaling: ' + error));
        }).catch((error) => this._nativeBridge.Sdk.logInfo('Cannot get frame info: ' + error));
    }

    public getFrameInfo(): Promise<IARFrameInfo> {
        return this._nativeBridge.invoke<IARFrameInfo>(this._apiClass, 'getFrameInfo');
    }

    public setFrameScaling(scale: IARFrameScale): Promise<void> {
        return this._nativeBridge.invoke<void>(this._apiClass, 'setFrameScaling', [scale]);
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
        }
    }
}
