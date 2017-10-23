import { Observable0, Observable1 } from 'Utilities/Observable';
import { AbstractAdUnit } from 'AdUnits/AbstractAdUnit';
import { Campaign } from 'Models/Campaign';

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
    public readonly onAndroidPause = new Observable0(); // ad unit paused (Android only)
    public readonly onSystemInterrupt = new Observable1<boolean>(); // ad unit has been interrupted and video has been paused (iOS only)
    public readonly onLowMemoryWarning = new Observable0(); // ad unit has received low memory warning (iOS only)

    protected _lockedOrientation: ForceOrientation;

    private _diagnosticsEvents: any[] = [];

    public abstract open(adUnit: AbstractAdUnit<Campaign>, videoplayer: boolean, allowRotation: boolean, forceOrientation: ForceOrientation, disableBackbutton: boolean, isTransparent: boolean, withAnimation: boolean, allowStatusBar: boolean, options: any): Promise<void>;
    public abstract close(): Promise<void>;
    public abstract reconfigure(configuration: ViewConfiguration): Promise<any[]>;
    public abstract reorient(allowRotation: boolean, forceOrientation: ForceOrientation): Promise<any[]>;
    public abstract isPaused(): boolean;

    public getLockedOrientation() {
        return this._lockedOrientation;
    }

    public getDiagnosticsEvents(): any[] {
        return this._diagnosticsEvents;
    }

    public addDiagnosticsEvent(event: any): void {
        this._diagnosticsEvents.push(event);
    }

    public resetDiagnosticsEvents(): void {
        this._diagnosticsEvents = [];
    }
}
