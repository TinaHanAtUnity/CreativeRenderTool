import { WebPlayerContainer } from 'Utilities/WebPlayer/WebPlayerContainer';
import { NativeBridge } from 'Native/NativeBridge';
import { WebPlayerViewId } from 'Native/Api/WebPlayer';

export class BannerWebPlayerContainer extends WebPlayerContainer {
    constructor(nativeBridge: NativeBridge) {
        super(nativeBridge, WebPlayerViewId.BannerPlayer);
    }
}
