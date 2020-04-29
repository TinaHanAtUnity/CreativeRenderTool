import { VastEndScreenEventHandler } from 'VAST/EventHandlers/VastEndScreenEventHandler';
import { TencentUtils } from 'VAST/Utilities/TencentUtils';
import { Tap } from 'Core/Utilities/Tap';

export class TencentVastEndScreenEventHandler extends VastEndScreenEventHandler {
    protected getClickThroughURL(): string | null {
        let tap: Tap | undefined;
        if (this._vastEndScreen) {
            tap = this._vastEndScreen.tap('.game-background');
        } else {
            tap = undefined;
        }
        let clickThroughURL = super.getClickThroughURL();
        if (clickThroughURL) {
            clickThroughURL = TencentUtils.replaceClickThroughMacro(clickThroughURL, tap);
        }
        return clickThroughURL;
    }
}
