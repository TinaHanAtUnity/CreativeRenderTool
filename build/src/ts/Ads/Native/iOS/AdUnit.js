import { EventCategory } from 'Core/Constants/EventCategory';
import { ApiPackage, NativeApi } from 'Core/Native/Bridge/NativeApi';
import { Observable0 } from 'Core/Utilities/Observable';
var AdUnitEvent;
(function (AdUnitEvent) {
    AdUnitEvent[AdUnitEvent["VIEW_CONTROLLER_INIT"] = 0] = "VIEW_CONTROLLER_INIT";
    AdUnitEvent[AdUnitEvent["VIEW_CONTROLLER_DID_LOAD"] = 1] = "VIEW_CONTROLLER_DID_LOAD";
    AdUnitEvent[AdUnitEvent["VIEW_CONTROLLER_DID_APPEAR"] = 2] = "VIEW_CONTROLLER_DID_APPEAR";
    AdUnitEvent[AdUnitEvent["VIEW_CONTROLLER_WILL_DISAPPEAR"] = 3] = "VIEW_CONTROLLER_WILL_DISAPPEAR";
    AdUnitEvent[AdUnitEvent["VIEW_CONTROLLER_DID_DISAPPEAR"] = 4] = "VIEW_CONTROLLER_DID_DISAPPEAR";
    AdUnitEvent[AdUnitEvent["VIEW_CONTROLLER_DID_RECEIVE_MEMORY_WARNING"] = 5] = "VIEW_CONTROLLER_DID_RECEIVE_MEMORY_WARNING";
})(AdUnitEvent || (AdUnitEvent = {}));
export var IosAdUnitError;
(function (IosAdUnitError) {
    IosAdUnitError[IosAdUnitError["ADUNIT_NULL"] = 0] = "ADUNIT_NULL";
    IosAdUnitError[IosAdUnitError["NO_ROTATION_Z"] = 1] = "NO_ROTATION_Z";
    IosAdUnitError[IosAdUnitError["UNKNOWN_VIEW"] = 2] = "UNKNOWN_VIEW";
})(IosAdUnitError || (IosAdUnitError = {}));
export class IosAdUnitApi extends NativeApi {
    constructor(nativeBridge) {
        super(nativeBridge, 'AdUnit', ApiPackage.ADS, EventCategory.ADUNIT);
        this.onViewControllerInit = new Observable0();
        this.onViewControllerDidLoad = new Observable0();
        this.onViewControllerDidAppear = new Observable0();
        this.onViewControllerWillDisappear = new Observable0();
        this.onViewControllerDidDisappear = new Observable0();
        this.onViewControllerDidReceiveMemoryWarning = new Observable0();
    }
    open(view, supportedOrientations, statusBarHidden, shouldAutorotate, isTransparent, withAnimation) {
        return this._nativeBridge.invoke(this._fullApiClassName, 'open', [view, supportedOrientations, statusBarHidden, shouldAutorotate, isTransparent, withAnimation]);
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
    setSupportedOrientations(supportedOrientations) {
        return this._nativeBridge.invoke(this._fullApiClassName, 'setSupportedOrientations', [supportedOrientations]);
    }
    getSupportedOrientations() {
        return this._nativeBridge.invoke(this._fullApiClassName, 'getSupportedOrientations');
    }
    setKeepScreenOn(screenOn) {
        return this._nativeBridge.invoke(this._fullApiClassName, 'setKeepScreenOn', [screenOn]);
    }
    setStatusBarHidden(hidden) {
        return this._nativeBridge.invoke(this._fullApiClassName, 'setStatusBarHidden', [hidden]);
    }
    getStatusBarHidden() {
        return this._nativeBridge.invoke(this._fullApiClassName, 'getStatusBarHidden');
    }
    setShouldAutorotate(autorotate) {
        return this._nativeBridge.invoke(this._fullApiClassName, 'setShouldAutorotate', [autorotate]);
    }
    getShouldAutorotate() {
        return this._nativeBridge.invoke(this._fullApiClassName, 'getShouldAutorotate');
    }
    setTransform(rotation) {
        return this._nativeBridge.invoke(this._fullApiClassName, 'setTransform', [rotation]);
    }
    getTransform() {
        return this._nativeBridge.invoke(this._fullApiClassName, 'getTransform');
    }
    setViewFrame(view, x, y, width, height) {
        return this._nativeBridge.invoke(this._fullApiClassName, 'setViewFrame', [view, x, y, width, height]);
    }
    getViewFrame(view) {
        return this._nativeBridge.invoke(this._fullApiClassName, 'getViewFrame', [view]);
    }
    handleEvent(event, parameters) {
        switch (event) {
            case AdUnitEvent[AdUnitEvent.VIEW_CONTROLLER_INIT]:
                this.onViewControllerInit.trigger();
                break;
            case AdUnitEvent[AdUnitEvent.VIEW_CONTROLLER_DID_LOAD]:
                this.onViewControllerDidLoad.trigger();
                break;
            case AdUnitEvent[AdUnitEvent.VIEW_CONTROLLER_DID_APPEAR]:
                this.onViewControllerDidAppear.trigger();
                break;
            case AdUnitEvent[AdUnitEvent.VIEW_CONTROLLER_WILL_DISAPPEAR]:
                this.onViewControllerWillDisappear.trigger();
                break;
            case AdUnitEvent[AdUnitEvent.VIEW_CONTROLLER_DID_DISAPPEAR]:
                this.onViewControllerDidDisappear.trigger();
                break;
            case AdUnitEvent[AdUnitEvent.VIEW_CONTROLLER_DID_RECEIVE_MEMORY_WARNING]:
                this.onViewControllerDidReceiveMemoryWarning.trigger();
                break;
            default:
                super.handleEvent(event, parameters);
        }
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQWRVbml0LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vc3JjL3RzL0Fkcy9OYXRpdmUvaU9TL0FkVW5pdC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUUsYUFBYSxFQUFFLE1BQU0sOEJBQThCLENBQUM7QUFFN0QsT0FBTyxFQUFFLFVBQVUsRUFBRSxTQUFTLEVBQUUsTUFBTSw4QkFBOEIsQ0FBQztBQUdyRSxPQUFPLEVBQUUsV0FBVyxFQUFFLE1BQU0sMkJBQTJCLENBQUM7QUFFeEQsSUFBSyxXQU9KO0FBUEQsV0FBSyxXQUFXO0lBQ1osNkVBQW9CLENBQUE7SUFDcEIscUZBQXdCLENBQUE7SUFDeEIseUZBQTBCLENBQUE7SUFDMUIsaUdBQThCLENBQUE7SUFDOUIsK0ZBQTZCLENBQUE7SUFDN0IseUhBQTBDLENBQUE7QUFDOUMsQ0FBQyxFQVBJLFdBQVcsS0FBWCxXQUFXLFFBT2Y7QUFFRCxNQUFNLENBQU4sSUFBWSxjQUlYO0FBSkQsV0FBWSxjQUFjO0lBQ3RCLGlFQUFXLENBQUE7SUFDWCxxRUFBYSxDQUFBO0lBQ2IsbUVBQVksQ0FBQTtBQUNoQixDQUFDLEVBSlcsY0FBYyxLQUFkLGNBQWMsUUFJekI7QUFFRCxNQUFNLE9BQU8sWUFBYSxTQUFRLFNBQVM7SUFTdkMsWUFBWSxZQUEwQjtRQUNsQyxLQUFLLENBQUMsWUFBWSxFQUFFLFFBQVEsRUFBRSxVQUFVLENBQUMsR0FBRyxFQUFFLGFBQWEsQ0FBQyxNQUFNLENBQUMsQ0FBQztRQVJ4RCx5QkFBb0IsR0FBRyxJQUFJLFdBQVcsRUFBRSxDQUFDO1FBQ3pDLDRCQUF1QixHQUFHLElBQUksV0FBVyxFQUFFLENBQUM7UUFDNUMsOEJBQXlCLEdBQUcsSUFBSSxXQUFXLEVBQUUsQ0FBQztRQUM5QyxrQ0FBNkIsR0FBRyxJQUFJLFdBQVcsRUFBRSxDQUFDO1FBQ2xELGlDQUE0QixHQUFHLElBQUksV0FBVyxFQUFFLENBQUM7UUFDakQsNENB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