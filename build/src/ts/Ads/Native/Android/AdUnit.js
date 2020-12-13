import { EventCategory } from 'Core/Constants/EventCategory';
import { ApiPackage, NativeApi } from 'Core/Native/Bridge/NativeApi';
import { Observable1, Observable2, Observable5 } from 'Core/Utilities/Observable';
var AdUnitEvent;
(function (AdUnitEvent) {
    AdUnitEvent[AdUnitEvent["ON_START"] = 0] = "ON_START";
    AdUnitEvent[AdUnitEvent["ON_CREATE"] = 1] = "ON_CREATE";
    AdUnitEvent[AdUnitEvent["ON_RESUME"] = 2] = "ON_RESUME";
    AdUnitEvent[AdUnitEvent["ON_DESTROY"] = 3] = "ON_DESTROY";
    AdUnitEvent[AdUnitEvent["ON_PAUSE"] = 4] = "ON_PAUSE";
    AdUnitEvent[AdUnitEvent["KEY_DOWN"] = 5] = "KEY_DOWN";
    AdUnitEvent[AdUnitEvent["ON_RESTORE"] = 6] = "ON_RESTORE";
    AdUnitEvent[AdUnitEvent["ON_STOP"] = 7] = "ON_STOP";
    AdUnitEvent[AdUnitEvent["ON_FOCUS_GAINED"] = 8] = "ON_FOCUS_GAINED";
    AdUnitEvent[AdUnitEvent["ON_FOCUS_LOST"] = 9] = "ON_FOCUS_LOST";
})(AdUnitEvent || (AdUnitEvent = {}));
export var AndroidAdUnitError;
(function (AndroidAdUnitError) {
    AndroidAdUnitError[AndroidAdUnitError["ADUNIT_NULL"] = 0] = "ADUNIT_NULL";
    AndroidAdUnitError[AndroidAdUnitError["ACTIVITY_ID"] = 1] = "ACTIVITY_ID";
    AndroidAdUnitError[AndroidAdUnitError["GENERIC"] = 2] = "GENERIC";
    AndroidAdUnitError[AndroidAdUnitError["ORIENTATION"] = 3] = "ORIENTATION";
    AndroidAdUnitError[AndroidAdUnitError["SCREENVISIBILITY"] = 4] = "SCREENVISIBILITY";
    AndroidAdUnitError[AndroidAdUnitError["CORRUPTED_VIEWLIST"] = 5] = "CORRUPTED_VIEWLIST";
    AndroidAdUnitError[AndroidAdUnitError["CORRUPTED_KEYEVENTLIST"] = 6] = "CORRUPTED_KEYEVENTLIST";
    AndroidAdUnitError[AndroidAdUnitError["SYSTEM_UI_VISIBILITY"] = 7] = "SYSTEM_UI_VISIBILITY";
    AndroidAdUnitError[AndroidAdUnitError["UNKNOWN_VIEW"] = 8] = "UNKNOWN_VIEW";
})(AndroidAdUnitError || (AndroidAdUnitError = {}));
export class AndroidAdUnitApi extends NativeApi {
    constructor(nativeBridge) {
        super(nativeBridge, 'AdUnit', ApiPackage.ADS, EventCategory.ADUNIT);
        this.onStart = new Observable1();
        this.onCreate = new Observable1();
        this.onResume = new Observable1();
        this.onDestroy = new Observable2();
        this.onPause = new Observable2();
        this.onKeyDown = new Observable5();
        this.onRestore = new Observable1();
        this.onStop = new Observable1();
        this.onFocusGained = new Observable1();
        this.onFocusLost = new Observable1();
    }
    open(activityId, views, orientation, keyEvents = [], systemUiVisibility = 0, hardwareAccel = true, isTransparent = false) {
        return this._nativeBridge.invoke(this._fullApiClassName, 'open', [activityId, views, orientation, keyEvents, systemUiVisibility, hardwareAccel, isTransparent]);
    }
    close() {
        return this._nativeBridge.invoke(this._fullApiClassName, 'close');
    }
    setViews(views) {
        return this._nativeBridge.invoke(this._fullApiClassName, 'setViews', [views]);
    }
    getViews() {
        return this._nativeBridge.invoke(this._fullApiClassName, 'getViews');
    }
    setOrientation(orientation) {
        return this._nativeBridge.invoke(this._fullApiClassName, 'setOrientation', [orientation]);
    }
    getOrientation() {
        return this._nativeBridge.invoke(this._fullApiClassName, 'getOrientation');
    }
    setKeepScreenOn(screenOn) {
        return this._nativeBridge.invoke(this._fullApiClassName, 'setKeepScreenOn', [screenOn]);
    }
    setSystemUiVisibility(systemUiVisibility) {
        return this._nativeBridge.invoke(this._fullApiClassName, 'setSystemUiVisibility', [systemUiVisibility]);
    }
    setKeyEventList(keyEventList) {
        return this._nativeBridge.invoke(this._fullApiClassName, 'setKeyEventList', [keyEventList]);
    }
    setViewFrame(view, x, y, width, height) {
        return this._nativeBridge.invoke(this._fullApiClassName, 'setViewFrame', [view, x, y, width, height]);
    }
    getViewFrame(view) {
        return this._nativeBridge.invoke(this._fullApiClassName, 'getViewFrame', [view]);
    }
    startMotionEventCapture(maxEvents) {
        return this._nativeBridge.invoke(this._fullApiClassName, 'startMotionEventCapture', [maxEvents]);
    }
    endMotionEventCapture() {
        return this._nativeBridge.invoke(this._fullApiClassName, 'endMotionEventCapture');
    }
    clearMotionEventCapture() {
        return this._nativeBridge.invoke(this._fullApiClassName, 'clearMotionEventCapture');
    }
    getMotionEventCount(actions) {
        return this._nativeBridge.invoke(this._fullApiClassName, 'getMotionEventCount', [actions]);
    }
    getMotionEventData(data) {
        return this._nativeBridge.invoke(this._fullApiClassName, 'getMotionEventData', [data]);
    }
    getCurrentMotionEventCount() {
        return this._nativeBridge.invoke(this._fullApiClassName, 'getCurrentMotionEventCount');
    }
    handleEvent(event, parameters) {
        switch (event) {
            case AdUnitEvent[AdUnitEvent.ON_START]:
                this.onStart.trigger(parameters[0]);
                break;
            case AdUnitEvent[AdUnitEvent.ON_CREATE]:
                this.onCreate.trigger(parameters[0]);
                break;
            case AdUnitEvent[AdUnitEvent.ON_RESUME]:
                this.onResume.trigger(parameters[0]);
                break;
            case AdUnitEvent[AdUnitEvent.ON_DESTROY]:
                this.onDestroy.trigger(parameters[0], parameters[1]);
                break;
            case AdUnitEvent[AdUnitEvent.ON_PAUSE]:
                this.onPause.trigger(parameters[0], parameters[1]);
                break;
            case AdUnitEvent[AdUnitEvent.KEY_DOWN]:
                this.onKeyDown.trigger(parameters[0], parameters[1], parameters[2], parameters[3], parameters[4]);
                break;
            case AdUnitEvent[AdUnitEvent.ON_RESTORE]:
                this.onRestore.trigger(parameters[0]);
                break;
            case AdUnitEvent[AdUnitEvent.ON_STOP]:
                this.onStop.trigger(parameters[0]);
                break;
            case AdUnitEvent[AdUnitEvent.ON_FOCUS_GAINED]:
                this.onFocusGained.trigger(parameters[0]);
                break;
            case AdUnitEvent[AdUnitEvent.ON_FOCUS_LOST]:
                this.onFocusLost.trigger(parameters[0]);
                break;
            default:
                super.handleEvent(event, parameters);
        }
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQWRVbml0LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vc3JjL3RzL0Fkcy9OYXRpdmUvQW5kcm9pZC9BZFVuaXQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBSUEsT0FBTyxFQUFFLGFBQWEsRUFBRSxNQUFNLDhCQUE4QixDQUFDO0FBQzdELE9BQU8sRUFBRSxVQUFVLEVBQUUsU0FBUyxFQUFFLE1BQU0sOEJBQThCLENBQUM7QUFFckUsT0FBTyxFQUFFLFdBQVcsRUFBRSxXQUFXLEVBQUUsV0FBVyxFQUFFLE1BQU0sMkJBQTJCLENBQUM7QUFFbEYsSUFBSyxXQVdKO0FBWEQsV0FBSyxXQUFXO0lBQ1oscURBQVEsQ0FBQTtJQUNSLHVEQUFTLENBQUE7SUFDVCx1REFBUyxDQUFBO0lBQ1QseURBQVUsQ0FBQTtJQUNWLHFEQUFRLENBQUE7SUFDUixxREFBUSxDQUFBO0lBQ1IseURBQVUsQ0FBQTtJQUNWLG1EQUFPLENBQUE7SUFDUCxtRUFBZSxDQUFBO0lBQ2YsK0RBQWEsQ0FBQTtBQUNqQixDQUFDLEVBWEksV0FBVyxLQUFYLFdBQVcsUUFXZjtBQUVELE1BQU0sQ0FBTixJQUFZLGtCQVVYO0FBVkQsV0FBWSxrQkFBa0I7SUFDMUIseUVBQVcsQ0FBQTtJQUNYLHlFQUFXLENBQUE7SUFDWCxpRUFBTyxDQUFBO0lBQ1AseUVBQVcsQ0FBQTtJQUNYLG1GQUFnQixDQUFBO0lBQ2hCLHVGQUFrQixDQUFBO0lBQ2xCLCtGQUFzQixDQUFBO0lBQ3RCLDJGQUFvQixDQUFBO0lBQ3BCLDJFQUFZLENBQUE7QUFDaEIsQ0FBQyxFQVZXLGtCQUFrQixLQUFsQixrQkFBa0IsUUFVN0I7QUFlRCxNQUFNLE9BQU8sZ0JBQWlCLFNBQVEsU0FBUztJQWEzQyxZQUFZLFlBQTBCO1FBQ2xDLEtBQUssQ0FBQyxZQUFZLEVBQUUsUUFBUSxFQUFFLFVBQVUsQ0FBQyxHQUFHLEVBQUUsYUFBYSxDQUFDLE1BQU0sQ0FBQyxDQUFDO1FBWnhELFlB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