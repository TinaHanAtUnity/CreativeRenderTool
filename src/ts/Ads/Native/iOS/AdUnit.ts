import { UIInterfaceOrientationMask } from 'Core/Constants/iOS/UIInterfaceOrientationMask';
import { ApiPackage, NativeApi } from 'Core/Native/Bridge/NativeApi';
import { NativeBridge } from 'Core/Native/Bridge/NativeBridge';
import { Double } from 'Core/Utilities/Double';
import { Observable0 } from 'Core/Utilities/Observable';
import { EventCategory } from '../../../Core/Constants/EventCategory';

enum AdUnitEvent {
    VIEW_CONTROLLER_INIT,
    VIEW_CONTROLLER_DID_LOAD,
    VIEW_CONTROLLER_DID_APPEAR,
    VIEW_CONTROLLER_WILL_DISAPPEAR,
    VIEW_CONTROLLER_DID_DISAPPEAR,
    VIEW_CONTROLLER_DID_RECEIVE_MEMORY_WARNING
}

export enum IosAdUnitError {
    ADUNIT_NULL,
    NO_ROTATION_Z,
    UNKNOWN_VIEW
}

export class IosAdUnitApi extends NativeApi {

    public readonly onViewControllerInit = new Observable0();
    public readonly onViewControllerDidLoad = new Observable0();
    public readonly onViewControllerDidAppear = new Observable0();
    public readonly onViewControllerWillDisappear = new Observable0();
    public readonly onViewControllerDidDisappear = new Observable0();
    public readonly onViewControllerDidReceiveMemoryWarning = new Observable0();

    constructor(nativeBridge: NativeBridge) {
        super(nativeBridge, 'AdUnit', ApiPackage.ADS, EventCategory.ADUNIT);
    }

    public open(view: string[], supportedOrientations: UIInterfaceOrientationMask, statusBarHidden: boolean, shouldAutorotate: boolean, isTransparent: boolean, withAnimation: boolean): Promise<void> {
        return this._nativeBridge.invoke<void>(this._fullApiClassName, 'open', [view, supportedOrientations, statusBarHidden, shouldAutorotate, isTransparent, withAnimation]);
    }

    public close(): Promise<void> {
        return this._nativeBridge.invoke<void>(this._fullApiClassName, 'close');
    }

    public setViews(views: string[]): Promise<string[]> {
        return this._nativeBridge.invoke<string[]>(this._fullApiClassName, 'setViews', [views]);
    }

    public getViews(): Promise<string[]> {
        return this._nativeBridge.invoke<string[]>(this._fullApiClassName, 'getViews');
    }

    public setSupportedOrientations(supportedOrientations: UIInterfaceOrientationMask): Promise<void> {
        return this._nativeBridge.invoke<void>(this._fullApiClassName, 'setSupportedOrientations', [supportedOrientations]);
    }

    public getSupportedOrientations(): Promise<UIInterfaceOrientationMask> {
        return this._nativeBridge.invoke<UIInterfaceOrientationMask>(this._fullApiClassName, 'getSupportedOrientations');
    }

    public setKeepScreenOn(screenOn: boolean): Promise<void> {
        return this._nativeBridge.invoke<void>(this._fullApiClassName, 'setKeepScreenOn', [screenOn]);
    }

    public setStatusBarHidden(hidden: boolean): Promise<void> {
        return this._nativeBridge.invoke<void>(this._fullApiClassName, 'setStatusBarHidden', [hidden]);
    }

    public getStatusBarHidden(): Promise<boolean> {
        return this._nativeBridge.invoke<boolean>(this._fullApiClassName, 'getStatusBarHidden');
    }

    public setShouldAutorotate(autorotate: boolean): Promise<void> {
        return this._nativeBridge.invoke<void>(this._fullApiClassName, 'setShouldAutorotate', [autorotate]);
    }

    public getShouldAutorotate(): Promise<boolean> {
        return this._nativeBridge.invoke<boolean>(this._fullApiClassName, 'getShouldAutorotate');
    }

    public setTransform(rotation: Double): Promise<void> {
        return this._nativeBridge.invoke<void>(this._fullApiClassName, 'setTransform', [rotation]);
    }

    public getTransform(): Promise<Double> {
        return this._nativeBridge.invoke<Double>(this._fullApiClassName, 'getTransform');
    }

    public setViewFrame(view: string, x: Double, y: Double, width: Double, height: Double): Promise<void> {
        return this._nativeBridge.invoke<void>(this._fullApiClassName, 'setViewFrame', [view, x, y, width, height]);
    }

    public getViewFrame(view: string): Promise<Double[]> {
        return this._nativeBridge.invoke<Double[]>(this._fullApiClassName, 'getViewFrame', [view]);
    }

    public handleEvent(event: string, parameters: any[]): void {
        switch(event) {
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
