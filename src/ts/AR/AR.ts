import { AndroidARApi } from 'AR/Native/Android/AndroidARApi';
import { ARApi } from 'AR/Native/AR';
import { IosARApi } from 'AR/Native/iOS/IosARApi';
import { Platform } from 'Core/Constants/Platform';
import { ICore } from 'Core/ICore';
import { IApiModule, IModuleApi } from 'Core/Modules/IApiModule';

export interface IARApi extends IModuleApi {
    AR: ARApi;
    Android?: {
        AR: AndroidARApi;
    };
    iOS?: {
        AR: IosARApi;
    };
}

export class AR implements IApiModule {

    public readonly Api: IARApi;

    constructor(core: ICore) {
        const platform = core.NativeBridge.getPlatform();
        this.Api = {
            AR: new ARApi(core.NativeBridge),
            Android: platform === Platform.ANDROID ? {
                AR: new AndroidARApi(core.NativeBridge)
            } : undefined,
            iOS: platform === Platform.IOS ? {
            AR: new IosARApi(core.NativeBridge)
            } : undefined
        };
    }

}
