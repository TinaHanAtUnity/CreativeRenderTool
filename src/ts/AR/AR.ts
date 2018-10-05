import { Ads, AdsModule } from '../Ads/Ads';
import { IApiModule, IModuleApi } from '../Core/Modules/IApiModule';
import { ARApi } from './Native/AR';
import { AndroidARApi } from './Native/Android/AndroidARApi';
import { IosARApi } from './Native/iOS/IosARApi';
import { Platform } from '../Core/Constants/Platform';

export interface IARApi extends IModuleApi {
    AR: ARApi;
    Android?: {
        AR: AndroidARApi;
    };
    iOS?: {
        AR: IosARApi;
    };
}

export class AR extends AdsModule implements IApiModule {

    public readonly Api: IARApi;

    private _initialized = false;

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

    public isInitialized() {
        return this._initialized;
    }

}
