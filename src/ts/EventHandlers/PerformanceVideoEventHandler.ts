import { PerformanceAdUnit } from 'AdUnits/PerformanceAdUnit';
import { IVideoEventHandlerParams } from 'EventHandlers/BaseVideoEventHandler';
import { VideoEventHandler } from 'EventHandlers/VideoEventHandler';
import { TestEnvironment } from 'Utilities/TestEnvironment';

export class PerformanceVideoEventHandler extends VideoEventHandler {

    private _performanceAdUnit: PerformanceAdUnit;

    constructor(params: IVideoEventHandlerParams<PerformanceAdUnit>) {
        super(params);
        this._performanceAdUnit = params.adUnit;
    }

    public onCompleted(url: string): void {
        super.onCompleted(url);

        const endScreen = this._performanceAdUnit.getEndScreen();

        if(endScreen) {
            endScreen.show();
        }
    }

    public onPrepared(url: string, duration: number, width: number, height: number): void {
        super.onPrepared(url, duration, width, height);

        const overlay = this._adUnit.getOverlay();
        if(TestEnvironment.get('debugOverlayEnabled') && overlay) {
            overlay.setDebugMessage('Performance Ad');
        }
    }

    protected handleVideoError(errorType?: string, errorData?: any): void {
        super.handleVideoError(errorType, errorData);

        const endScreen = this._performanceAdUnit.getEndScreen();
        if(endScreen) {
            endScreen.show();
        }
    }

    protected getVideoOrientation(): string | undefined {
        return this._performanceAdUnit.getVideoOrientation();
    }
}
