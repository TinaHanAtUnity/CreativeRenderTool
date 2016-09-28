import { NativeBridge } from 'Native/NativeBridge';
import { Observable1, Observable2, Observable5 } from 'Utilities/Observable';
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

export enum AndroidAdUnitError {
    ACTIVITY_NULL,
    ACTIVITY_ID,
    CORRUPTED_VIEWLIST,
    CORRUPTED_KEYEVENTLIST
}

export class AndroidAdUnitApi extends NativeApi {

    public onStart: Observable1<number> = new Observable1();
    public onCreate: Observable1<number> = new Observable1();
    public onResume: Observable1<number> = new Observable1();
    public onDestroy: Observable2<boolean, number> = new Observable2();
    public onPause: Observable2<boolean, number> = new Observable2();
    public onKeyDown: Observable5<number, number, number, number, number> = new Observable5();
    public onRestore: Observable1<number> = new Observable1();
    public onStop: Observable1<number> = new Observable1();

    constructor(nativeBridge: NativeBridge) {
        super(nativeBridge, 'AdUnit');
    }

    public open(activityId: number, views: string[], orientation: ScreenOrientation, keyEvents: number[] = [], systemUiVisibility: SystemUiVisibility = 0, hardwareAccel: boolean = true): Promise<void> {
        return this._nativeBridge.invoke<void>(this._apiClass, 'open', [activityId, views, orientation, keyEvents, systemUiVisibility, hardwareAccel]);
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

    public handleEvent(event: string, parameters: any[]): void {
        switch(event) {
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

            default:
                super.handleEvent(event, parameters);
        }
    }

}
