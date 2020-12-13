import { EventedNativeApi } from 'Core/Native/Bridge/EventedNativeApi';
import { ApiPackage } from 'Core/Native/Bridge/NativeApi';
var AndroidVideoPlayerEvent;
(function (AndroidVideoPlayerEvent) {
    AndroidVideoPlayerEvent[AndroidVideoPlayerEvent["INFO"] = 0] = "INFO";
})(AndroidVideoPlayerEvent || (AndroidVideoPlayerEvent = {}));
export var AndroidVideoPlayerError;
(function (AndroidVideoPlayerError) {
    AndroidVideoPlayerError[AndroidVideoPlayerError["VIDEOVIEW_NULL"] = 0] = "VIDEOVIEW_NULL";
    AndroidVideoPlayerError[AndroidVideoPlayerError["API_LEVEL_ERROR"] = 1] = "API_LEVEL_ERROR";
    AndroidVideoPlayerError[AndroidVideoPlayerError["GENERIC_ERROR"] = 2] = "GENERIC_ERROR";
    AndroidVideoPlayerError[AndroidVideoPlayerError["PAUSE_ERROR"] = 3] = "PAUSE_ERROR";
    AndroidVideoPlayerError[AndroidVideoPlayerError["PREPARE_ERROR"] = 4] = "PREPARE_ERROR";
    AndroidVideoPlayerError[AndroidVideoPlayerError["SEEKTO_ERROR"] = 5] = "SEEKTO_ERROR";
    AndroidVideoPlayerError[AndroidVideoPlayerError["ILLEGAL_STATE"] = 6] = "ILLEGAL_STATE";
})(AndroidVideoPlayerError || (AndroidVideoPlayerError = {}));
export class AndroidVideoPlayerApi extends EventedNativeApi {
    constructor(nativeBridge) {
        super(nativeBridge, 'VideoPlayer', ApiPackage.ADS);
    }
    setInfoListenerEnabled(enabled) {
        return this._nativeBridge.invoke(this._fullApiClassName, 'setInfoListenerEnabled', [enabled]);
    }
    handleEvent(event, parameters) {
        switch (event) {
            case AndroidVideoPlayerEvent[AndroidVideoPlayerEvent.INFO]:
                this._handlers.forEach(handler => handler.onInfo(parameters[0], parameters[1], parameters[2]));
                break;
            case AndroidVideoPlayerError[AndroidVideoPlayerError.GENERIC_ERROR]:
                this._handlers.forEach(handler => handler.onGenericError(parameters[0], parameters[1], parameters[2]));
                break;
            case AndroidVideoPlayerError[AndroidVideoPlayerError.PAUSE_ERROR]:
                this._handlers.forEach(handler => handler.onPauseError(parameters[0]));
                break;
            case AndroidVideoPlayerError[AndroidVideoPlayerError.PREPARE_ERROR]:
                this._handlers.forEach(handler => handler.onPrepareError(parameters[0]));
                break;
            case AndroidVideoPlayerError[AndroidVideoPlayerError.SEEKTO_ERROR]:
                this._handlers.forEach(handler => handler.onSeekToError(parameters[0]));
                break;
            case AndroidVideoPlayerError[AndroidVideoPlayerError.ILLEGAL_STATE]:
                this._handlers.forEach(handler => handler.onIllegalStateError(parameters[0], parameters[1]));
                break;
            default:
                throw new Error('VideoPlayer event ' + event + ' does not have an observable');
        }
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVmlkZW9QbGF5ZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9zcmMvdHMvQWRzL05hdGl2ZS9BbmRyb2lkL1ZpZGVvUGxheWVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBRSxnQkFBZ0IsRUFBRSxNQUFNLHFDQUFxQyxDQUFDO0FBQ3ZFLE9BQU8sRUFBRSxVQUFVLEVBQUUsTUFBTSw4QkFBOEIsQ0FBQztBQUcxRCxJQUFLLHVCQUVKO0FBRkQsV0FBSyx1QkFBdUI7SUFDeEIscUVBQUksQ0FBQTtBQUNSLENBQUMsRUFGSSx1QkFBdUIsS0FBdkIsdUJBQXVCLFFBRTNCO0FBRUQsTUFBTSxDQUFOLElBQVksdUJBUVg7QUFSRCxXQUFZLHVCQUF1QjtJQUMvQix5RkFBYyxDQUFBO0lBQ2QsMkZBQWUsQ0FBQTtJQUNmLHVGQUFhLENBQUE7SUFDYixtRkFBVyxDQUFBO0lBQ1gsdUZBQWEsQ0FBQTtJQUNiLHFGQUFZLENBQUE7SUFDWix1RkFBYSxDQUFBO0FBQ2pCLENBQUMsRUFSVyx1QkFBdUIsS0FBdkIsdUJBQXVCLFFBUWxDO0FBV0QsTUFBTSxPQUFPLHFCQUFzQixTQUFRLGdCQUEyQztJQUVsRixZQUFZLFlBQTBCO1FBQ2xDLEtBQUssQ0FBQyxZQUFZLEVBQUUsYUFBYSxFQUFFLFVBQVUsQ0FBQyxHQUFHLENBQUMsQ0FBQztJQUN2RCxDQUFDO0lBRU0sc0JBQXNCLENBQUMsT0FBZ0I7UUFDMUMsT0FBTyxJQUFJLENBQUMsYUFBYSxDQUFDLE1BQU0sQ0FBTyxJQUFJLENBQUMsaUJBQWlCLEVBQUUsd0JBQXdCLEVBQUUsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDO0lBQ3hHLENBQUM7SUFFTSxXQUFXLENBQUMsS0FBYSxFQUFFLFVBQXFCO1FBQ25ELFFBQVEsS0FBSyxFQUFFO1lBQ1gsS0FBSyx1QkFBdUIsQ0FBQyx1QkFBdUIsQ0FBQyxJQUFJLENBQUM7Z0JBQ3RELElBQUksQ0FBQyxTQUFTLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxFQUFFLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBUyxVQUFVLENBQUMsQ0FBQyxDQUFDLEVBQVUsVUFBVSxDQUFDLENBQUMsQ0FBQyxFQUFVLFVBQVUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBQ3ZILE1BQU07WUFFVixLQUFLLHVCQUF1QixDQUFDLHVCQUF1QixDQUFDLGFBQWEsQ0FBQztnQkFDL0QsSUFBSSxDQUFDLFNBQVMsQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQyxPQUFPLENBQUMsY0FBYyxDQUFTLFVBQVUsQ0FBQyxDQUFDLENBQUMsRUFBVSxVQUFVLENBQUMsQ0FBQyxDQUFDLEVBQVUsVUFBVSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFDL0gsTUFBTTtZQUVWLEtBQUssdUJBQXVCLENBQUMsdUJBQXVCLENBQUMsV0FBVyxDQUFDO2dCQUM3RCxJQUFJLENBQUMsU0FBUyxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsRUFBRSxDQUFDLE9BQU8sQ0FBQyxZQUFZLENBQVMsVUFBVSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFDL0UsTUFBTTtZQUVWLEtBQUssdUJBQXVCLENBQUMsdUJBQXVCLENBQUMsYUFBYSxDQUFDO2dCQUMvRCxJQUFJLENBQUMsU0FBUyxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsRUFBRSxDQUFDLE9BQU8sQ0FBQyxjQUFjLENBQVMsVUFBVSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFDakYsTUFBTTtZQUVWLEtBQUssdUJBQXVCLENBQUMsdUJBQXVCLENBQUMsWUFBWSxDQUFDO2dCQUM5RCxJQUFJLENBQUMsU0FBUyxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsRUFBRSxDQUFDLE9BQU8sQ0FBQyxhQUFhLENBQVMsVUFBVSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFDaEYsTUFBTTtZQUVWLEtBQUssdUJBQXVCLENBQUMsdUJBQXVCLENBQUMsYUFBYSxDQUFDO2dCQUMvRCxJQUFJLENBQUMsU0FBUyxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsRUFBRSxDQUFDLE9BQU8sQ0FBQyxtQkFBbUIsQ0FBUyxVQUFVLENBQUMsQ0FBQyxDQUFDLEVBQVcsVUFBVSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFDOUcsTUFBTTtZQUVWO2dCQUNJLE1BQU0sSUFBSSxLQUFLLENBQUMsb0JBQW9CLEdBQUcsS0FBSyxHQUFHLDhCQUE4QixDQUFDLENBQUM7U0FDdEY7SUFDTCxDQUFDO0NBQ0oifQ==