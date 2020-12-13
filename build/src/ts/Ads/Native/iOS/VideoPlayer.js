import { EventedNativeApi } from 'Core/Native/Bridge/EventedNativeApi';
import { ApiPackage } from 'Core/Native/Bridge/NativeApi';
export var IosVideoPlayerEvent;
(function (IosVideoPlayerEvent) {
    IosVideoPlayerEvent[IosVideoPlayerEvent["LIKELY_TO_KEEP_UP"] = 0] = "LIKELY_TO_KEEP_UP";
    IosVideoPlayerEvent[IosVideoPlayerEvent["BUFFER_EMPTY"] = 1] = "BUFFER_EMPTY";
    IosVideoPlayerEvent[IosVideoPlayerEvent["BUFFER_FULL"] = 2] = "BUFFER_FULL";
    IosVideoPlayerEvent[IosVideoPlayerEvent["GENERIC_ERROR"] = 3] = "GENERIC_ERROR";
    IosVideoPlayerEvent[IosVideoPlayerEvent["VIDEOVIEW_NULL"] = 4] = "VIDEOVIEW_NULL";
})(IosVideoPlayerEvent || (IosVideoPlayerEvent = {}));
export class IosVideoPlayerApi extends EventedNativeApi {
    constructor(nativeBridge) {
        super(nativeBridge, 'VideoPlayer', ApiPackage.ADS);
    }
    handleEvent(event, parameters) {
        switch (event) {
            case IosVideoPlayerEvent[IosVideoPlayerEvent.LIKELY_TO_KEEP_UP]:
                this._handlers.forEach(handler => handler.onLikelyToKeepUp(parameters[0], parameters[1]));
                break;
            case IosVideoPlayerEvent[IosVideoPlayerEvent.BUFFER_EMPTY]:
                this._handlers.forEach(handler => handler.onBufferEmpty(parameters[0], parameters[1]));
                break;
            case IosVideoPlayerEvent[IosVideoPlayerEvent.BUFFER_FULL]:
                this._handlers.forEach(handler => handler.onBufferFull(parameters[0], parameters[1]));
                break;
            case IosVideoPlayerEvent[IosVideoPlayerEvent.GENERIC_ERROR]:
                this._handlers.forEach(handler => handler.onGenericError(parameters[0], parameters[1]));
                break;
            default:
                throw new Error('VideoPlayer event ' + event + ' does not have an observable');
        }
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVmlkZW9QbGF5ZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9zcmMvdHMvQWRzL05hdGl2ZS9pT1MvVmlkZW9QbGF5ZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFFLGdCQUFnQixFQUFFLE1BQU0scUNBQXFDLENBQUM7QUFDdkUsT0FBTyxFQUFFLFVBQVUsRUFBRSxNQUFNLDhCQUE4QixDQUFDO0FBRzFELE1BQU0sQ0FBTixJQUFZLG1CQU1YO0FBTkQsV0FBWSxtQkFBbUI7SUFDM0IsdUZBQWlCLENBQUE7SUFDakIsNkVBQVksQ0FBQTtJQUNaLDJFQUFXLENBQUE7SUFDWCwrRUFBYSxDQUFBO0lBQ2IsaUZBQWMsQ0FBQTtBQUNsQixDQUFDLEVBTlcsbUJBQW1CLEtBQW5CLG1CQUFtQixRQU05QjtBQVNELE1BQU0sT0FBTyxpQkFBa0IsU0FBUSxnQkFBdUM7SUFFMUUsWUFBWSxZQUEwQjtRQUNsQyxLQUFLLENBQUMsWUFBWSxFQUFFLGFBQWEsRUFBRSxVQUFVLENBQUMsR0FBRyxDQUFDLENBQUM7SUFDdkQsQ0FBQztJQUVNLFdBQVcsQ0FBQyxLQUFhLEVBQUUsVUFBcUI7UUFDbkQsUUFBUSxLQUFLLEVBQUU7WUFDWCxLQUFLLG1CQUFtQixDQUFDLG1CQUFtQixDQUFDLGlCQUFpQixDQUFDO2dCQUMzRCxJQUFJLENBQUMsU0FBUyxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsRUFBRSxDQUFDLE9BQU8sQ0FBQyxnQkFBZ0IsQ0FBUyxVQUFVLENBQUMsQ0FBQyxDQUFDLEVBQVcsVUFBVSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFDM0csTUFBTTtZQUVWLEtBQUssbUJBQW1CLENBQUMsbUJBQW1CLENBQUMsWUFBWSxDQUFDO2dCQUN0RCxJQUFJLENBQUMsU0FBUyxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsRUFBRSxDQUFDLE9BQU8sQ0FBQyxhQUFhLENBQVMsVUFBVSxDQUFDLENBQUMsQ0FBQyxFQUFXLFVBQVUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBQ3hHLE1BQU07WUFFVixLQUFLLG1CQUFtQixDQUFDLG1CQUFtQixDQUFDLFdBQVcsQ0FBQztnQkFDckQsSUFBSSxDQUFDLFNBQVMsQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQyxPQUFPLENBQUMsWUFBWSxDQUFTLFVBQVUsQ0FBQyxDQUFDLENBQUMsRUFBVyxVQUFVLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO2dCQUN2RyxNQUFNO1lBRVYsS0FBSyxtQkFBbUIsQ0FBQyxtQkFBbUIsQ0FBQyxhQUFhLENBQUM7Z0JBQ3ZELElBQUksQ0FBQyxTQUFTLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxFQUFFLENBQUMsT0FBTyxDQUFDLGNBQWMsQ0FBUyxVQUFVLENBQUMsQ0FBQyxDQUFDLEVBQVUsVUFBVSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFDeEcsTUFBTTtZQUVWO2dCQUNJLE1BQU0sSUFBSSxLQUFLLENBQUMsb0JBQW9CLEdBQUcsS0FBSyxHQUFHLDhCQUE4QixDQUFDLENBQUM7U0FDdEY7SUFDTCxDQUFDO0NBQ0oifQ==