import { VastOverlayEventHandler } from 'VAST/EventHandlers/VastOverlayEventHandler';
import { TencentUtils } from 'VAST/Utilities/TencentUtils';
import { Tap } from 'Core/Utilities/Tap';

export class TencentVastOverlayEventHandler extends VastOverlayEventHandler {
    public onOverlayCallButton(): Promise<void> {
        let tap: Tap | undefined;
        if (this._vastOverlay) {
            tap = this._vastOverlay.tap('.call-button');
        } else {
            tap = undefined;
        }
        let clickThroughURL = this._vastAdUnit.getVideoClickThroughURL();
        if (clickThroughURL) {
            clickThroughURL = TencentUtils.replaceClickThroughMacro(clickThroughURL, tap);
        }
        return this.onAssembleClickThroughURL(clickThroughURL);
    }

}
