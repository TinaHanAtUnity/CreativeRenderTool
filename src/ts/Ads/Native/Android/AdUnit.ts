import { KeyCode } from 'Core/Constants/Android/KeyCode';
import { MotionEventAction } from 'Core/Constants/Android/MotionEventAction';
import { ScreenOrientation } from 'Core/Constants/Android/ScreenOrientation';
import { SystemUiVisibility } from 'Core/Constants/Android/SystemUiVisibility';
import { EventCategory } from 'Core/Constants/EventCategory';
import { ApiPackage, NativeApi } from 'Core/Native/Bridge/NativeApi';
import { NativeBridge } from 'Core/Native/Bridge/NativeBridge';
import { Observable1, Observable2, Observable5 } from 'Core/Utilities/Observable';

enum AdUnitEvent {
    ON_START,
    ON_CREATE,
    ON_RESUME,
    ON_DESTROY,
    ON_PAUSE,
    KEY_DOWN,
    ON_RESTORE,
    ON_STOP,
    ON_FOCUS_GAINED,
    ON_FOCUS_LOST
}

export enum AndroidAdUnitError {
    ADUNIT_NULL,
    ACTIVITY_ID,
    GENERIC,
    ORIENTATION,
    SCREENVISIBILITY,
    CORRUPTED_VIEWLIST,
    CORRUPTED_KEYEVENTLIST,
    SYSTEM_UI_VISIBILITY,
    UNKNOWN_VIEW
}

export interface IMotionEvent {
    action: MotionEventAction;
    isObscured: boolean;
    toolType: number;
    source: number;
    deviceId: number;
    x: number;
    y: number;
    eventTime: number;
    pressure: number;
    size: number;
}

export class AndroidAdUnitApi extends NativeApi {

    public readonly onStart = new Observable1<number>();
    public readonly onCreate = new Observable1<number>();
    public readonly onResume = new Observable1<number>();
    public readonly onDestroy = new Observable2<boolean, number>();
    public readonly onPause = new Observable2<boolean, number>();
    public readonly onKeyDown = new Observable5<number, number, number, number, number>();
    public readonly onRestore = new Observable1<number>();
    public readonly onStop = new Observable1<number>();
    public readonly onFocusGained = new Observable1<number>();
    public readonly onFocusLost = new Observable1<number>();

    constructor(nativeBridge: NativeBridge) {
        super(nativeBridge, 'AdUnit', ApiPackage.ADS, EventCategory.ADUNIT);
    }

    public open(activityId: number, views: string[], orientation: ScreenOrientation, keyEvents: number[] = [], systemUiVisibility: SystemUiVisibility = 0, hardwareAccel: boolean = true, isTransparent: boolean = false): Promise<void> {
        return this._nativeBridge.invoke<void>(this._fullApiClassName, 'open', [activityId, views, orientation, keyEvents, systemUiVisibility, hardwareAccel, isTransparent]);
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

    public setOrientation(orientation: ScreenOrientation): Promise<void> {
        return this._nativeBridge.invoke<void>(this._fullApiClassName, 'setOrientation', [orientation]);
    }

    public getOrientation(): Promise<ScreenOrientation> {
        return this._nativeBridge.invoke<ScreenOrientation>(this._fullApiClassName, 'getOrientation');
    }

    public setKeepScreenOn(screenOn: boolean): Promise<void> {
        return this._nativeBridge.invoke<void>(this._fullApiClassName, 'setKeepScreenOn', [screenOn]);
    }

    public setSystemUiVisibility(systemUiVisibility: SystemUiVisibility): Promise<SystemUiVisibility> {
        return this._nativeBridge.invoke<SystemUiVisibility>(this._fullApiClassName, 'setSystemUiVisibility', [systemUiVisibility]);
    }

    public setKeyEventList(keyEventList: KeyCode[]): Promise<KeyCode[]> {
        return this._nativeBridge.invoke<KeyCode[]>(this._fullApiClassName, 'setKeyEventList', [keyEventList]);
    }

    public setViewFrame(view: string, x: number, y: number, width: number, height: number): Promise<void> {
        return this._nativeBridge.invoke<void>(this._fullApiClassName, 'setViewFrame', [view, x, y, width, height]);
    }

    public getViewFrame(view: string): Promise<number[]> {
        return this._nativeBridge.invoke<number[]>(this._fullApiClassName, 'getViewFrame', [view]);
    }

    public startMotionEventCapture(maxEvents: number): Promise<void> {
        return this._nativeBridge.invoke<void>(this._fullApiClassName, 'startMotionEventCapture', [maxEvents]);
    }

    public endMotionEventCapture(): Promise<void> {
        return this._nativeBridge.invoke<void>(this._fullApiClassName, 'endMotionEventCapture');
    }

    public clearMotionEventCapture(): Promise<void> {
        return this._nativeBridge.invoke<void>(this._fullApiClassName, 'clearMotionEventCapture');
    }

    public getMotionEventCount(actions: MotionEventAction[]): Promise<{ [action: string]: number}> {
        return this._nativeBridge.invoke<{ [action: string]: number}>(this._fullApiClassName, 'getMotionEventCount', [actions]);
    }

    public getMotionEventData(data: { [action: string]: number[] }): Promise<{ [action: string]: { [index: string]: IMotionEvent } }> {
        return this._nativeBridge.invoke<{ [action: string]: { [index: string]: IMotionEvent } }>(this._fullApiClassName, 'getMotionEventData', [data]);
    }

    public getCurrentMotionEventCount(): Promise<number> {
        return this._nativeBridge.invoke<number>(this._fullApiClassName, 'getCurrentMotionEventCount');
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
