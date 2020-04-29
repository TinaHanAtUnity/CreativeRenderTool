import { VastOverlayEventHandler } from 'VAST/EventHandlers/VastOverlayEventHandler';
import { TencentUtils } from 'VAST/Utilities/TencentUtils';
import { Tap } from 'Core/Utilities/Tap';

export class TencentVastOverlayEventHandler extends VastOverlayEventHandler {
    protected getClickThroughURL(): string | null {
        let tap: Tap | undefined;
        if (this._vastOverlay) {
            tap = this._vastOverlay.tap('.call-button');
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
