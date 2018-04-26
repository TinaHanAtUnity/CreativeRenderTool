import { Observable0, Observable1 } from 'Utilities/Observable';
import { AbstractAdUnit } from 'AdUnits/AbstractAdUnit';

export enum Orientation {
    NONE,
    PORTRAIT,
    LANDSCAPE
}

export const enum ViewConfiguration {
    ENDSCREEN,
    LANDSCAPE_VIDEO,
    WEB_PLAYER
}

export abstract class AdUnitContainer {

    public static setForcedOrientation(orientation: Orientation) {
        AdUnitContainer._forcedOrientation = orientation;
    }

    public static getForcedOrientation(): Orientation | undefined {
        return AdUnitContainer._forcedOrientation;
    }

    private static _forcedOrientation: Orientation | undefined;

    public readonly onShow = new Observable0(); // ad unit becomes visible
    public readonly onSystemKill = new Observable0(); // ad unit killed by the system (Android only)
    public readonly onAndroidPause = new Observable0(); // ad unit paused (Android only)
    public readonly onSystemInterrupt = new Observable1<boolean>(); // ad unit has been interrupted and video has been paused (iOS only)
    public readonly onLowMemoryWarning = new Observable0(); // ad unit has received low memory warning (iOS only)

    protected _lockedOrientation: Orientation;

    public abstract open(adUnit: AbstractAdUnit, views: string[], allowRotation: boolean, forceOrientation: Orientation, disableBackbutton: boolean, isTransparent: boolean, withAnimation: boolean, allowStatusBar: boolean, options: any): Promise<void>;
    public abstract close(): Promise<void>;
    public abstract reconfigure(configuration: ViewConfiguration): Promise<any[]>;
    public abstract reorient(allowRotation: boolean, forceOrientation: Orientation): Promise<any[]>;
    public abstract isPaused(): boolean;
    public abstract setViewFrame(view: string, x: number, y: number, width: number, height: number): Promise<void>;
    public abstract getViews(): Promise<string[]>;

    public getLockedOrientation() {
        return this._lockedOrientation;
    }
}
