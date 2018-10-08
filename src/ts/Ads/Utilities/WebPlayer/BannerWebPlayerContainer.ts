import { WebPlayerViewId } from 'Ads/Native/WebPlayer';
import { WebPlayerContainer } from 'Ads/Utilities/WebPlayer/WebPlayerContainer';
import { IAdsApi } from 'Ads/Ads';

export class BannerWebPlayerContainer extends WebPlayerContainer {
    constructor(ads: IAdsApi) {
        super(ads, WebPlayerViewId.BannerPlayer);
    }
}
