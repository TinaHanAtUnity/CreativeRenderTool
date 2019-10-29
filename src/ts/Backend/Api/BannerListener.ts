import { BackendApi } from 'Backend/BackendApi';
import { BannerErrorCode } from 'Banners/Native/BannerErrorCode';

export class BannerListener extends BackendApi {

    public sendLoadEvent(bannerAdViewId: string) {
        return;
    }

    public sendClickEvent(bannerAdViewId: string) {
        return;
    }

    public sendLeaveApplicationEvent(bannerAdViewId: string) {
        return;
    }

    public sendErrorEvent(bannerAdViewId: string, bannerErrorCode: BannerErrorCode, errorMessage: string) {
        return;
    }

}
