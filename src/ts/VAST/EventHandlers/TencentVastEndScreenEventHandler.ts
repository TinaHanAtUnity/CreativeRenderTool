import { VastEndScreenEventHandler } from 'VAST/EventHandlers/VastEndScreenEventHandler';
import { TencentUtils } from 'VAST/Utilities/TencentUtils';
import { Tap } from 'Core/Utilities/Tap';

export class TencentVastEndScreenEventHandler extends VastEndScreenEventHandler {
    public onVastEndScreenClick(): Promise<void> {
        let tap: Tap | undefined;
        if (this._vastEndScreen) {
            tap = this._vastEndScreen.tap('.game-background');
        } else {
            tap = undefined;
        }
        let clickThroughURL = this._vastAdUnit.getCompanionClickThroughUrl() || this._vastAdUnit.getVideoClickThroughURL();
        if (clickThroughURL) {
            clickThroughURL = TencentUtils.replaceClickThroughMacro(clickThroughURL, tap);
        }
        return this.onAssembleClickThroughURL(clickThroughURL);
    }
}
