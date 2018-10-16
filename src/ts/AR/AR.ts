import { Ads, AdsModule } from 'Ads/Ads';
import { IAPIModule, IModuleApi } from 'Core/Modules/IApiModule';
import { ARApi } from 'AR/Native/AR';
import { AndroidARApi } from 'AR/Native/Android/AndroidARApi';
import { IosARApi } from 'AR/Native/iOS/IosARApi';
import { Platform } from 'Core/Constants/Platform';

export interface IARApi extends IModuleApi {
    AR: ARApi;
    Android?: {
        AR: AndroidARApi;
    };
    iOS?: {
        AR: IosARApi;
    };
}

export class AR extends AdsModule implements IAPIModule {

    public readonly Api: IARApi;

    constructor(ads: Ads) {
        super(ads);

        const platform = ads.Core.NativeBridge.getPlatform();
        this.Api = {
            AR: new ARApi(ads.Core.NativeBridge),
            Android: platform === Platform.ANDROID ? {
                AR: new AndroidARApi(ads.Core.NativeBridge)
            } : undefined,
            iOS: platform === Platform.IOS ? {
            AR: new IosARApi(ads.Core.NativeBridge)
            } : undefined
        };
    }

    public initialize() {
        this._initialized = true;
    }

}
