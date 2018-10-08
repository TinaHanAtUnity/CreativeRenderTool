import { WebPlayerApi, WebPlayerViewId } from 'Ads/Native/WebPlayer';
import { WebPlayerContainer } from 'Ads/Utilities/WebPlayer/WebPlayerContainer';
import { IAdsApi } from '../../Ads';

export class InterstitialWebPlayerContainer extends WebPlayerContainer {
    constructor(ads: IAdsApi) {
        super(ads, WebPlayerViewId.WebPlayer);
    }
}
