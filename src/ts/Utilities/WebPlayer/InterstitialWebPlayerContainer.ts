import { WebPlayerContainer } from 'Utilities/WebPlayer/WebPlayerContainer';
import { NativeBridge } from 'Native/NativeBridge';
import { WebPlayerViewId } from 'Native/Api/WebPlayer';

export class InterstitialWebPlayerContainer extends WebPlayerContainer {
    constructor(nativeBridge: NativeBridge) {
        super(nativeBridge, WebPlayerViewId.WebPlayer);
    }
}
