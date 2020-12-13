import { AndroidVideoPlayerApi } from 'Ads/Native/Android/VideoPlayer';
import { IosVideoPlayerApi } from 'Ads/Native/iOS/VideoPlayer';
import { EventCategory } from 'Core/Constants/EventCategory';
import { Platform } from 'Core/Constants/Platform';
import { EventedNativeApi } from 'Core/Native/Bridge/EventedNativeApi';
import { ApiPackage } from 'Core/Native/Bridge/NativeApi';
var VideoPlayerEvent;
(function (VideoPlayerEvent) {
    VideoPlayerEvent[VideoPlayerEvent["PROGRESS"] = 0] = "PROGRESS";
    VideoPlayerEvent[VideoPlayerEvent["COMPLETED"] = 1] = "COMPLETED";
    VideoPlayerEvent[VideoPlayerEvent["PREPARED"] = 2] = "PREPARED";
    VideoPlayerEvent[VideoPlayerEvent["PREPARE_TIMEOUT"] = 3] = "PREPARE_TIMEOUT";
    VideoPlayerEvent[VideoPlayerEvent["PLAY"] = 4] = "PLAY";
    VideoPlayerEvent[VideoPlayerEvent["PAUSE"] = 5] = "PAUSE";
    VideoPlayerEvent[VideoPlayerEvent["SEEKTO"] = 6] = "SEEKTO";
    VideoPlayerEvent[VideoPlayerEvent["STOP"] = 7] = "STOP";
})(VideoPlayerEvent || (VideoPlayerEvent = {}));
export class VideoPlayerApi extends EventedNativeApi {
    constructor(nativeBridge) {
        super(nativeBridge, 'VideoPlayer', ApiPackage.ADS, EventCategory.VIDEOPLAYER);
        if (nativeBridge.getPlatform() === Platform.IOS) {
            this.iOS = new IosVideoPlayerApi(nativeBridge);
        }
        else if (nativeBridge.getPlatform() === Platform.ANDROID) {
            this.Android = new AndroidVideoPlayerApi(nativeBridge);
        }
    }
    setProgressEventInterval(milliseconds) {
        return this._nativeBridge.invoke(this._fullApiClassName, 'setProgressEventInterval', [milliseconds]);
    }
    getProgressEventInterval() {
        return this._nativeBridge.invoke(this._fullApiClassName, 'getProgressEventInterval');
    }
    prepare(url, initialVolume, timeout) {
        return this._nativeBridge.invoke(this._fullApiClassName, 'prepare', [url, initialVolume, timeout]);
    }
    play() {
        return this._nativeBridge.invoke(this._fullApiClassName, 'play');
    }
    pause() {
        return this._nativeBridge.invoke(this._fullApiClassName, 'pause');
    }
    stop() {
        return this._nativeBridge.invoke(this._fullApiClassName, 'stop');
    }
    seekTo(time) {
        return this._nativeBridge.invoke(this._fullApiClassName, 'seekTo', [time]);
    }
    getCurrentPosition() {
        return this._nativeBridge.invoke(this._fullApiClassName, 'getCurrentPosition');
    }
    getVolume() {
        return this._nativeBridge.invoke(this._fullApiClassName, 'getVolume');
    }
    setVolume(volume) {
        return this._nativeBridge.invoke(this._fullApiClassName, 'setVolume', [volume]);
    }
    setAutomaticallyWaitsToMinimizeStalling(value) {
        return this._nativeBridge.invoke(this._fullApiClassName, 'setAutomaticallyWaitsToMinimizeStalling', [value]);
    }
    getVideoViewRectangle() {
        return this._nativeBridge.invoke(this._fullApiClassName, 'getVideoViewRectangle');
    }
    handleEvent(event, parameters) {
        switch (event) {
            case VideoPlayerEvent[VideoPlayerEvent.PROGRESS]:
                this._handlers.forEach(handler => handler.onProgress(parameters[0]));
                break;
            case VideoPlayerEvent[VideoPlayerEvent.COMPLETED]:
                this._handlers.forEach(handler => handler.onCompleted(parameters[0]));
                break;
            case VideoPlayerEvent[VideoPlayerEvent.PREPARED]:
                this._handlers.forEach(handler => handler.onPrepared(parameters[0], parameters[1], parameters[2], parameters[3]));
                break;
            case VideoPlayerEvent[VideoPlayerEvent.PREPARE_TIMEOUT]:
                this._handlers.forEach(handler => handler.onPrepareTimeout(parameters[0]));
                break;
            case VideoPlayerEvent[VideoPlayerEvent.PLAY]:
                this._handlers.forEach(handler => handler.onPlay(parameters[0]));
                break;
            case VideoPlayerEvent[VideoPlayerEvent.PAUSE]:
                this._handlers.forEach(handler => handler.onPause(parameters[0]));
                break;
            case VideoPlayerEvent[VideoPlayerEvent.SEEKTO]:
                this._handlers.forEach(handler => handler.onSeek(parameters[0]));
                break;
            case VideoPlayerEvent[VideoPlayerEvent.STOP]:
                this._handlers.forEach(handler => handler.onStop(parameters[0]));
                break;
            default:
                if (this._nativeBridge.getPlatform() === Platform.IOS) {
                    this.iOS.handleEvent(event, parameters);
                }
                else if (this._nativeBridge.getPlatform() === Platform.ANDROID) {
                    this.Android.handleEvent(event, parameters);
                }
        }
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVmlkZW9QbGF5ZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9zcmMvdHMvQWRzL05hdGl2ZS9WaWRlb1BsYXllci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUUscUJBQXFCLEVBQUUsTUFBTSxnQ0FBZ0MsQ0FBQztBQUN2RSxPQUFPLEVBQUUsaUJBQWlCLEVBQUUsTUFBTSw0QkFBNEIsQ0FBQztBQUMvRCxPQUFPLEVBQUUsYUFBYSxFQUFFLE1BQU0sOEJBQThCLENBQUM7QUFDN0QsT0FBTyxFQUFFLFFBQVEsRUFBRSxNQUFNLHlCQUF5QixDQUFDO0FBQ25ELE9BQU8sRUFBRSxnQkFBZ0IsRUFBRSxNQUFNLHFDQUFxQyxDQUFDO0FBQ3ZFLE9BQU8sRUFBRSxVQUFVLEVBQUUsTUFBTSw4QkFBOEIsQ0FBQztBQUkxRCxJQUFLLGdCQVNKO0FBVEQsV0FBSyxnQkFBZ0I7SUFDakIsK0RBQVEsQ0FBQTtJQUNSLGlFQUFTLENBQUE7SUFDVCwrREFBUSxDQUFBO0lBQ1IsNkVBQWUsQ0FBQTtJQUNmLHVEQUFJLENBQUE7SUFDSix5REFBSyxDQUFBO0lBQ0wsMkRBQU0sQ0FBQTtJQUNOLHVEQUFJLENBQUE7QUFDUixDQUFDLEVBVEksZ0JBQWdCLEtBQWhCLGdCQUFnQixRQVNwQjtBQWFELE1BQU0sT0FBTyxjQUFlLFNBQVEsZ0JBQW9DO0lBS3BFLFlBQVksWUFBMEI7UUFDbEMsS0FBSyxDQUFDLFlBQVksRUFBRSxhQUFhLEVBQUUsVUFBVSxDQUFDLEdBQUcsRUFBRSxhQUFhLENBQUMsV0FBVyxDQUFDLENBQUM7UUFDOUUsSUFBSSxZQUFZLENBQUMsV0FBVyxFQUFFLEtBQUssUUFBUSxDQUFDLEdBQUcsRUFBRTtZQUM3QyxJQUFJLENBQUMsR0FBRyxHQUFHLElBQUksaUJBQWlCLENBQUMsWUFBWSxDQUFDLENBQUM7U0FDbEQ7YUFBTSxJQUFJLFlBQVksQ0FBQyxXQUFXLEVBQUUsS0FBSyxRQUFRLENBQUMs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