import { NativeBridge } from 'Native/NativeBridge';
import { Observable0, Observable1, Observable4 } from 'Utilities/Observable';
import { ScreenOrientation } from 'Constants/Android/ScreenOrientation';
import { SystemUiVisibility } from 'Constants/Android/SystemUiVisibility';
import { KeyCode } from 'Constants/Android/KeyCode';
import { NativeApi } from 'Native/NativeApi';

enum AdUnitEvent {
    ON_START,
    ON_CREATE,
    ON_RESUME,
    ON_DESTROY,
    ON_PAUSE,
    KEY_DOWN,
    ON_RESTORE,
    ON_STOP,
}

export class AndroidAdUnitApi extends NativeApi {

    public onStart: Observable0 = new Observable0();
    public onCreate: Observable0 = new Observable0();
    public onResume: Observable0 = new Observable0();
    public onDestroy: Observable1<boolean> = new Observable1();
    public onPause: Observable1<boolean> = new Observable1();
    public onKeyDown: Observable4<number, number, number, number> = new Observable4();
    public onRestore: Observable0 = new Observable0();
    public onStop: Observable0 = new Observable0();

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
            case AdUnitEvent[AdUnitEvent.ON_START]:
                this.onStart.trigger();
                break;

            case AdUnitEvent[AdUnitEvent.ON_CREATE]:
                this.onCreate.trigger();
                break;

            case AdUnitEvent[AdUnitEvent.ON_RESUME]:
                this.onResume.trigger();
                break;

            case AdUnitEvent[AdUnitEvent.ON_DESTROY]:
                this.onDestroy.trigger(parameters[0]);
                break;

            case AdUnitEvent[AdUnitEvent.ON_PAUSE]:
                this.onPause.trigger(parameters[0]);
                break;

            case AdUnitEvent[AdUnitEvent.KEY_DOWN]:
                this.onKeyDown.trigger(parameters[0], parameters[1], parameters[2], parameters[3]);
                break;

            case AdUnitEvent[AdUnitEvent.ON_RESTORE]:
                this.onRestore.trigger();
                break;

            case AdUnitEvent[AdUnitEvent.ON_STOP]:
                this.onStop.trigger();
                break;

            default:
                super.handleEvent(event, parameters);
        }
    }

}
