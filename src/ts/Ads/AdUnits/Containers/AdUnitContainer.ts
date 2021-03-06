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

export enum AdUnitContainerSystemMessage {
    MEMORY_WARNING,
    AUDIO_SESSION_INTERRUPT_BEGAN,
    AUDIO_SESSION_INTERRUPT_ENDED,
    AUDIO_SESSION_ROUTE_CHANGED,
    AUDIO_SESSION_CATEGORY_CHANGED
}

export interface IAdUnit {
    description(): string;
}

export interface IAdUnitContainerListener {
    onContainerShow(): void;
    onContainerDestroy(): void;
    onContainerBackground(): void;
    onContainerForeground(): void;
    onContainerSystemMessage(message: AdUnitContainerSystemMessage): void;
}

export abstract class AdUnitContainer {

    public static setForcedOrientation(orientation: Orientation) {
        AdUnitContainer._forcedOrientation = orientation;
    }

    public static getForcedOrientation(): Orientation | undefined {
        return AdUnitContainer._forcedOrientation;
    }

    private static _forcedOrientation: Orientation | undefined;

    protected _lockedOrientation: Orientation;
    protected _handlers: IAdUnitContainerListener[] = [];
    protected _paused = false;

    public abstract open(adUnit: IAdUnit, views: string[], allowRotation: boolean, forceOrientation: Orientation, disableBackbutton: boolean, isTransparent: boolean, withAnimation: boolean, allowStatusBar: boolean, options: unknown): Promise<void>;
    public abstract close(): Promise<void>;
    public abstract reconfigure(configuration: ViewConfiguration): Promise<unknown[]>;
    public abstract reorient(allowRotation: boolean, forceOrientation: Orientation): Promise<void>;
    public abstract isPaused(): boolean;
    public abstract setViewFrame(view: string, x: number, y: number, width: number, height: number): Promise<void>;
    public abstract getViews(): Promise<string[]>;

    public getLockedOrientation() {
        return this._lockedOrientation;
    }

    public addEventHandler(handler: IAdUnitContainerListener): IAdUnitContainerListener {
        this._handlers.push(handler);
        return handler;
    }

    public removeEventHandler(handler: IAdUnitContainerListener): void {
        if (this._handlers.length) {
            if (typeof handler !== 'undefined') {
                this._handlers = this._handlers.filter(storedHandler => storedHandler !== handler);
            } else {
                this._handlers = [];
            }
        }
    }
}
