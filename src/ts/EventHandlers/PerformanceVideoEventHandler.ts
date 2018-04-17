import { PerformanceAdUnit } from 'AdUnits/PerformanceAdUnit';
import { IVideoEventHandler } from 'Native/Api/VideoPlayer';
import { IVideoEventHandlerParams } from 'EventHandlers/BaseVideoEventHandler';

export class PerformanceVideoEventHandlers implements IVideoEventHandler {

    private _adUnit: PerformanceAdUnit;

    constructor(params: IVideoEventHandlerParams) {
        this._adUnit = <PerformanceAdUnit>params.adUnit;
    }

    public onProgress(progress: number): void {
        // EMPTY
    }

    public onPrepared(url: string, duration: number, width: number, height: number): void {
        // EMPTY
    }

    public onPrepareTimeout(url: string): void {
        // EMPTY
    }

    public onPlay(url: string): void {
        // EMPTY
    }

    public onPause(url: string): void {
        // EMPTY
    }

    public onSeek(url: string): void {
        // EMPTY
    }

    public onStop(url: string): void {
        // EMPTY
    }

    public onCompleted(url: string) {
        const endScreen = this._adUnit.getEndScreen();

        if (endScreen) {
            endScreen.show();
        }
    }

    public onVideoError(adUnit: PerformanceAdUnit) {
        const endScreen = adUnit.getEndScreen();
        if (endScreen) {
            endScreen.show();
        }
    }
}
