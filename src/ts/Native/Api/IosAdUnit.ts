import { NativeBridge } from 'Native/NativeBridge';
import { Observable0 } from 'Utilities/Observable';
import { ScreenOrientation } from 'Constants/Android/ScreenOrientation';
import { SystemUiVisibility } from 'Constants/Android/SystemUiVisibility';
import { KeyCode } from 'Constants/Android/KeyCode';
import { NativeApi } from 'Native/NativeApi';

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

    public open(views: string[], orientation: ScreenOrientation, keyEvents: number[] = null, systemUiVisibility: SystemUiVisibility = 0): Promise<void> {
        return this._nativeBridge.invoke<void>(this._apiClass, 'open', [views, orientation, keyEvents, systemUiVisibility]);
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

    public setOrientation(orientation: ScreenOrientation): Promise<void> {
        return this._nativeBridge.invoke<void>(this._apiClass, 'setOrientation', [orientation]);
    }

    public getOrientation(): Promise<ScreenOrientation> {
        return this._nativeBridge.invoke<ScreenOrientation>(this._apiClass, 'getOrientation');
    }

    public setKeepScreenOn(screenOn: boolean): Promise<void> {
        return this._nativeBridge.invoke<void>(this._apiClass, 'setKeepScreenOn', [screenOn]);
    }

    public setSystemUiVisibility(systemUiVisibility: SystemUiVisibility): Promise<SystemUiVisibility> {
        return this._nativeBridge.invoke<SystemUiVisibility>(this._apiClass, 'setSystemUiVisibility', [systemUiVisibility]);
    }

    public setKeyEventList(keyEventList: KeyCode[]): Promise<KeyCode[]> {
        return this._nativeBridge.invoke<KeyCode[]>(this._apiClass, 'setKeyEventList', [keyEventList]);
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
