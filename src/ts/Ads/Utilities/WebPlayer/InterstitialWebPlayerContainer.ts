import { WebPlayerViewId } from 'Ads/Native/WebPlayer';
import { WebPlayerContainer } from 'Ads/Utilities/WebPlayer/WebPlayerContainer';
import { NativeBridge } from 'Core/Native/Bridge/NativeBridge';

export class InterstitialWebPlayerContainer extends WebPlayerContainer {
    constructor(nativeBridge: NativeBridge) {
        super(nativeBridge, WebPlayerViewId.WebPlayer);
    }
}
