import { NativeBridge } from 'Native/NativeBridge';
import { Observable0, Observable1, Observable4 } from 'Utilities/Observable';
import { ScreenOrientation } from 'Constants/Android/ScreenOrientation';
import { SystemUiVisibility } from 'Constants/Android/SystemUiVisibility';
import { KeyCode } from 'Constants/Android/KeyCode';

enum AdUnitEvent {
    ON_START,
    ON_CREATE,
    ON_RESUME,
    ON_DESTROY,
    ON_PAUSE,
    KEY_DOWN,
    ON_RESTORE,
    ON_STOP
}

export class AdUnit {

    public static onStart: Observable0 = new Observable0();
    public static onCreate: Observable0 = new Observable0();
    public static onResume: Observable0 = new Observable0();
    public static onDestroy: Observable1<boolean> = new Observable1();
    public static onPause: Observable1<boolean> = new Observable1();
    public static onKeyDown: Observable4<number, number, number, number> = new Observable4();
    public static onRestore: Observable0 = new Observable0();
    public static onStop: Observable0 = new Observable0();

    private static ApiClass = 'AdUnit';

    public static open(views: string[], orientation: ScreenOrientation, keyEvents?: number[], systemUiVisibility?: SystemUiVisibility): Promise<void> {
        if(typeof keyEvents === 'undefined') {
            keyEvents = null;
        }
        if(typeof systemUiVisibility === 'undefined') {
            systemUiVisibility = 0;
        }
        return NativeBridge.getInstance().invoke<void>(AdUnit.ApiClass, 'open', [views, orientation, keyEvents, systemUiVisibility]);
    }

    public static close(): Promise<void> {
        return NativeBridge.getInstance().invoke<void>(AdUnit.ApiClass, 'close');
    }

    public static setViews(views: string[]): Promise<string[]> {
        return NativeBridge.getInstance().invoke<string[]>(AdUnit.ApiClass, 'setViews', [views]);
    }

    public static getViews(): Promise<string[]> {
        return NativeBridge.getInstance().invoke<string[]>(AdUnit.ApiClass, 'getViews');
    }

    public static setOrientation(orientation: ScreenOrientation): Promise<void> {
        return NativeBridge.getInstance().invoke<void>(AdUnit.ApiClass, 'setOrientation', [orientation]);
    }

    public static getOrientation(): Promise<ScreenOrientation> {
        return NativeBridge.getInstance().invoke<ScreenOrientation>(AdUnit.ApiClass, 'getOrientation');
    }

    public static setKeepScreenOn(screenOn: boolean): Promise<void> {
        return NativeBridge.getInstance().invoke<void>(AdUnit.ApiClass, 'setKeepScreenOn', [screenOn]);
    }

    public static setSystemUiVisibility(systemUiVisibility: SystemUiVisibility): Promise<SystemUiVisibility> {
        return NativeBridge.getInstance().invoke<SystemUiVisibility>(AdUnit.ApiClass, 'setSystemUiVisibility', [systemUiVisibility]);
    }

    public static setKeyEventList(keyEventList: KeyCode[]): Promise<KeyCode[]> {
        return NativeBridge.getInstance().invoke<KeyCode[]>(AdUnit.ApiClass, 'setKeyEventList', [keyEventList]);
    }

    public static handleEvent(event: string, ...parameters: any[]): void {
        switch(event) {
            case AdUnitEvent[AdUnitEvent.ON_START]:
                AdUnit.onStart.trigger();
                break;

            case AdUnitEvent[AdUnitEvent.ON_CREATE]:
                AdUnit.onCreate.trigger();
                break;

            case AdUnitEvent[AdUnitEvent.ON_RESUME]:
                AdUnit.onResume.trigger();
                break;

            case AdUnitEvent[AdUnitEvent.ON_DESTROY]:
                AdUnit.onDestroy.trigger(parameters[0]);
                break;

            case AdUnitEvent[AdUnitEvent.ON_PAUSE]:
                AdUnit.onPause.trigger(parameters[0]);
                break;

            case AdUnitEvent[AdUnitEvent.KEY_DOWN]:
                AdUnit.onKeyDown.trigger(parameters[0], parameters[1], parameters[2], parameters[3]);
                break;

            case AdUnitEvent[AdUnitEvent.ON_RESTORE]:
                AdUnit.onRestore.trigger();
                break;

            case AdUnitEvent[AdUnitEvent.ON_STOP]:
                AdUnit.onStop.trigger();
                break;

            default:
                throw new Error('AdUnit event ' + event + ' does not have an observable');
        }
    }

}
