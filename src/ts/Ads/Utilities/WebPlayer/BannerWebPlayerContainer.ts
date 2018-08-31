import { WebPlayerContainer } from 'Ads/Utilities/WebPlayer/WebPlayerContainer';
import { NativeBridge } from 'Common/Native/NativeBridge';
import { WebPlayerViewId } from 'Common/Native/Api/WebPlayer';

export class BannerWebPlayerContainer extends WebPlayerContainer {
    constructor(nativeBridge: NativeBridge) {
        super(nativeBridge, WebPlayerViewId.BannerPlayer);
    }
}
