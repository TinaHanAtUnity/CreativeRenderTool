import { NativeBridge } from 'Native/NativeBridge';
import { Observable0 } from 'Utilities/Observable';
import { NativeApi } from 'Native/NativeApi';
import { InterfaceOrientation } from 'Constants/iOS/InterfaceOrientation';

enum AdUnitEvent {
    VIEW_CONTROLLER_INIT,
    VIEW_CONTROLLER_DID_LOAD,
    VIEW_CONTROLLER_DID_APPEAR,
    VIEW_CONTROLLER_WILL_DISAPPEAR,
    VIEW_CONTROLLER_DID_DISAPPEAR,
    VIEW_CONTROLLER_DID_RECEIVE_MEMORY_WARNING
}

export class IosAdUnitApi extends NativeApi {

    public onViewControllerInit: Observable0 = new Observable0();
    public onViewControllerDidLoad: Observable0 = new Observable0();
    public onViewControllerDidAppear: Observable0 = new Observable0();
    public onViewControllerWillDisappear: Observable0 = new Observable0();
    public onViewControllerDidDisappear: Observable0 = new Observable0();
    public onViewControllerDidReceiveMemoryWarning: Observable0 = new Observable0();

    constructor(nativeBridge: NativeBridge) {
        super(nativeBridge, 'AdUnit');
    }

    public open(view: string[], supportedOrientations: InterfaceOrientation, statusBarHidden: boolean, shouldAutorotate: boolean): Promise<void> {
        return this._nativeBridge.invoke<void>(this._apiClass, 'open', [supportedOrientations, statusBarHidden, shouldAutorotate]);
    }

    public close(): Promise<void> {
        return this._nativeBridge.invoke<void>(this._apiClass, 'close');
    }

    public setViews(views: string[]): Promise<string[]> {
        return this._nativeBridge.invoke<string[]>(this._apiClass, 'setViews', [views]);
    }

    public getViews(): Promise<string[]> {
        return this._nativeBridge.invoke<string[]>(this._apiClass, 'getViews');
    }

    public setSupportedOrientations(supportedOrientations: InterfaceOrientation): Promise<void> {
        return this._nativeBridge.invoke<void>(this._apiClass, 'setSupportedOrientations', [supportedOrientations]);
    }

    public getSupportedOrientations(): Promise<InterfaceOrientation> {
        return this._nativeBridge.invoke<InterfaceOrientation>(this._apiClass, 'getSupportedOrientations');
    }

    public setKeepScreenOn(screenOn: boolean): Promise<void> {
        return this._nativeBridge.invoke<void>(this._apiClass, 'setKeepScreenOn', [screenOn]);
    }

    public setStatusBarHidden(hidden: boolean): Promise<void> {
        return this._nativeBridge.invoke<void>(this._apiClass, 'setStatusBarHidden', [hidden]);
    }

    public getStatusBarHidden(): Promise<boolean> {
        return this._nativeBridge.invoke<boolean>(this._apiClass, 'getStatusBarHidden');
    }

    public setShouldAutorotate(autorotate: boolean): Promise<void> {
        return this._nativeBridge.invoke<void>(this._apiClass, 'setShouldAutorotate', [autorotate]);
    }

    public getShouldAutorate(): Promise<boolean> {
        return this._nativeBridge.invoke<boolean>(this._apiClass, 'getShouldAutorotate');
    }

    public handleEvent(event: string, ...parameters: any[]): void {
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
