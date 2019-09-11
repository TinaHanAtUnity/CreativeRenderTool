import { IAdsApi } from 'Ads/IAds';
import { WebPlayerContainer } from 'Ads/Utilities/WebPlayer/WebPlayerContainer';
import { Platform } from 'Core/Constants/Platform';

export class BannerWebPlayerContainer extends WebPlayerContainer {
    constructor(platform: Platform, ads: IAdsApi, viewId: string) {
        super(platform, ads, viewId);
    }
}
