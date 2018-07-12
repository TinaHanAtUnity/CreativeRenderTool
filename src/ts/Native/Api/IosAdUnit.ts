import { NativeBridge } from 'Native/NativeBridge';
import { Observable0 } from 'Utilities/Observable';
import { ApiPackage, NativeApi } from 'Native/NativeApi';
import { UIInterfaceOrientationMask } from 'Constants/iOS/UIInterfaceOrientationMask';
import { Double } from 'Utilities/Double';

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
        super(nativeBridge, 'AdUnit', ApiPackage.ADS_CORE);
    }

    public open(view: string[], supportedOrientations: UIInterfaceOrientationMask, statusBarHidden: boolean, shouldAutorotate: boolean, isTransparent: boolean, withAnimation: boolean): Promise<void> {
        return this._nativeBridge.invoke<void>(this.getFullApiClassName(), 'open', [view, supportedOrientations, statusBarHidden, shouldAutorotate, isTransparent, withAnimation]);
    }

    public close(): Promise<void> {
        return this._nativeBridge.invoke<void>(this.getFullApiClassName(), 'close');
    }

    public setViews(views: string[]): Promise<string[]> {
        return this._nativeBridge.invoke<string[]>(this.getFullApiClassName(), 'setViews', [views]);
    }

    public getViews(): Promise<string[]> {
        return this._nativeBridge.invoke<string[]>(this.getFullApiClassName(), 'getViews');
    }

    public setSupportedOrientations(supportedOrientations: UIInterfaceOrientationMask): Promise<void> {
        return this._nativeBridge.invoke<void>(this.getFullApiClassName(), 'setSupportedOrientations', [supportedOrientations]);
    }

    public getSupportedOrientations(): Promise<UIInterfaceOrientationMask> {
        return this._nativeBridge.invoke<UIInterfaceOrientationMask>(this.getFullApiClassName(), 'getSupportedOrientations');
    }

    public setKeepScreenOn(screenOn: boolean): Promise<void> {
        return this._nativeBridge.invoke<void>(this.getFullApiClassName(), 'setKeepScreenOn', [screenOn]);
    }

    public setStatusBarHidden(hidden: boolean): Promise<void> {
        return this._nativeBridge.invoke<void>(this.getFullApiClassName(), 'setStatusBarHidden', [hidden]);
    }

    public getStatusBarHidden(): Promise<boolean> {
        return this._nativeBridge.invoke<boolean>(this.getFullApiClassName(), 'getStatusBarHidden');
    }

    public setShouldAutorotate(autorotate: boolean): Promise<void> {
        return this._nativeBridge.invoke<void>(this.getFullApiClassName(), 'setShouldAutorotate', [autorotate]);
    }

    public getShouldAutorotate(): Promise<boolean> {
        return this._nativeBridge.invoke<boolean>(this.getFullApiClassName(), 'getShouldAutorotate');
    }

    public setTransform(rotation: Double): Promise<void> {
        return this._nativeBridge.invoke<void>(this.getFullApiClassName(), 'setTransform', [rotation]);
    }

    public getTransform(): Promise<Double> {
        return this._nativeBridge.invoke<Double>(this.getFullApiClassName(), 'getTransform');
    }

    public setViewFrame(view: string, x: Double, y: Double, width: Double, height: Double): Promise<void> {
        return this._nativeBridge.invoke<void>(this.getFullApiClassName(), 'setViewFrame', [view, x, y, width, height]);
    }

    public getViewFrame(view: string): Promise<Double[]> {
        return this._nativeBridge.invoke<Double[]>(this.getFullApiClassName(), 'getViewFrame', [view]);
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
