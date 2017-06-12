import { Observable0 } from 'Utilities/Observable';
import { AbstractAdUnit } from 'AdUnits/AbstractAdUnit';

export enum ForceOrientation {
    NONE,
    PORTRAIT,
    LANDSCAPE
}

export const enum ViewConfiguration {
    ENDSCREEN,
    LANDSCAPE_VIDEO
}

export abstract class AdUnitContainer {

    public static setForcedOrientation(orientation: ForceOrientation) {
        AdUnitContainer._forcedOrientation = orientation;
    }

    public static getForcedOrientation(): ForceOrientation | undefined {
        return AdUnitContainer._forcedOrientation;
    }

    private static _forcedOrientation: ForceOrientation | undefined;

    public readonly onShow = new Observable0(); // ad unit becomes visible
    public readonly onSystemKill = new Observable0(); // ad unit killed by the system (Android only)
    public readonly onSystemPause = new Observable0(); // ad unit has been resigned from active (iOS only)
    public readonly onSystemInterrupt = new Observable0(); // ad unit has been interrupted and video has been paused (iOS only)

    protected _lockedOrientation: ForceOrientation;

    public abstract open(adUnit: AbstractAdUnit, videoplayer: boolean, allowRotation: boolean, forceOrientation: ForceOrientation, disableBackbutton: boolean, options: any): Promise<void>;
    public abstract close(): Promise<void>;
    public abstract reconfigure(configuration: ViewConfiguration): Promise<any[]>;
    public abstract reorient(allowRotation: boolean, forceOrientation: ForceOrientation): Promise<any[]>;
    public abstract isPaused(): boolean;

    public getLockedOrientation() {
        return this._lockedOrientation;
    }

}
