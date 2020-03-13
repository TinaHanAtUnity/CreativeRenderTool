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

    private _isClosing: boolean = false;

    constructor(nativeBridge: NativeBridge) {
        super(nativeBridge, 'AdUnit', ApiPackage.ADS, EventCategory.ADUNIT);
    }

    public open(activityId: number, views: string[], orientation: ScreenOrientation, keyEvents: number[] = [], systemUiVisibility: SystemUiVisibility = 0, hardwareAccel: boolean = true, isTransparent: boolean = false): Promise<void> {
        let timeout = 0;
        if (this._isClosing) {
            timeout = 5000;
        }
        const bridge = this._nativeBridge;
        const className = this._fullApiClassName;
        return new Promise(function(resolve, reject){
            setTimeout(function(){
                bridge.invoke<void>(className, 'open', [activityId, views, orientation, keyEvents, systemUiVisibility, hardwareAccel, isTransparent])
                .then(() => {
                    resolve();
                },
                (reason) => {
                    reject(reason);
                });
            }, timeout)
        });
    }

    public close(): Promise<void> {
        this._isClosing = true;
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

    public handleEvent(event: string, parameters: unknown[]): void {
        switch (event) {
            case AdUnitEvent[AdUnitEvent.ON_START]:
                this.onStart.trigger(<number>parameters[0]);
                break;

            case AdUnitEvent[AdUnitEvent.ON_CREATE]:
                this.onCreate.trigger(<number>parameters[0]);
                break;

            case AdUnitEvent[AdUnitEvent.ON_RESUME]:
                this.onResume.trigger(<number>parameters[0]);
                break;

            case AdUnitEvent[AdUnitEvent.ON_DESTROY]:
                this.onDestroy.trigger(<boolean>parameters[0], <number>parameters[1]);
                this._isClosing = false;
                break;

            case AdUnitEvent[AdUnitEvent.ON_PAUSE]:
                this.onPause.trigger(<boolean>parameters[0], <number>parameters[1]);
                break;

            case AdUnitEvent[AdUnitEvent.KEY_DOWN]:
                this.onKeyDown.trigger(<number>parameters[0], <number>parameters[1], <number>parameters[2], <number>parameters[3], <number>parameters[4]);
                break;

            case AdUnitEvent[AdUnitEvent.ON_RESTORE]:
                this.onRestore.trigger(<number>parameters[0]);
                break;

            case AdUnitEvent[AdUnitEvent.ON_STOP]:
                this.onStop.trigger(<number>parameters[0]);
                break;

            case AdUnitEvent[AdUnitEvent.ON_FOCUS_GAINED]:
                this.onFocusGained.trigger(<number>parameters[0]);
                break;

            case AdUnitEvent[AdUnitEvent.ON_FOCUS_LOST]:
                this.onFocusLost.trigger(<number>parameters[0]);
                break;

            default:
                super.handleEvent(event, parameters);
        }
    }

}
