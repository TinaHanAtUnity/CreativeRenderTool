import { WebPlayerViewId } from 'Ads/Native/WebPlayer';
import { WebPlayerContainer } from 'Ads/Utilities/WebPlayer/WebPlayerContainer';
import { NativeBridge } from 'Core/Native/Bridge/NativeBridge';
import { IAdsApi } from '../../Ads';

export class BannerWebPlayerContainer extends WebPlayerContainer {
    constructor(ads: IAdsApi) {
        super(ads, WebPlayerViewId.BannerPlayer);
    }
}
