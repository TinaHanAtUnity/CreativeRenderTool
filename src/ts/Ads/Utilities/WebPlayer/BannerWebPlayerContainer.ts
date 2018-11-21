import { IAdsApi } from 'Ads/IAds';
import { WebPlayerViewId } from 'Ads/Native/WebPlayer';
import { WebPlayerContainer } from 'Ads/Utilities/WebPlayer/WebPlayerContainer';
import { Platform } from 'Core/Constants/Platform';

export class BannerWebPlayerContainer extends WebPlayerContainer {
    constructor(platform: Platform, ads: IAdsApi) {
        super(platform, ads, WebPlayerViewId.BannerPlayer);
    }
}
