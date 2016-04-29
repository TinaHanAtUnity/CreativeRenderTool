import { NativeApi } from 'Native/NativeApi';
import { NativeBridge } from 'Native/NativeBridge';

/*
 // iTunes Store item identifier (NSNumber) of the product
 SK_EXTERN NSString * const SKStoreProductParameterITunesItemIdentifier NS_AVAILABLE_IOS(6_0);

 // iTunes Store affiliate token (NSString)
 SK_EXTERN NSString * const SKStoreProductParameterAffiliateToken NS_AVAILABLE_IOS(8_0);

 // iTunes Store affiliate campaign token (NSString)
 SK_EXTERN NSString * const SKStoreProductParameterCampaignToken NS_AVAILABLE_IOS(8_0);

 // Analytics provider token (NSString)
 SK_EXTERN NSString * const SKStoreProductParameterProviderToken NS_AVAILABLE_IOS(8_3);

 // Advertising partner token (NSString)
 SK_EXTERN NSString * const SKStoreProductParameterAdvertisingPartnerToken NS_AVAILABLE_IOS(9_3);
 */

/*
 (lldb) po SKStoreProductParameterITunesItemIdentifier
 id

 (lldb) po SKStoreProductParameterAffiliateToken
 at

 (lldb) po SKStoreProductParameterCampaignToken
 ct

 (lldb) po SKStoreProductParameterProviderToken
 pt

 (lldb) po SKStoreProductParameterAdvertisingPartnerToken
 advp
 */

export interface IAppSheetOptions {
    id: number;
    at?: string;
    ct?: string;
    pt?: string;
    advp?: string;
}

export class AppSheetApi extends NativeApi {

    constructor(nativeBridge: NativeBridge) {
        super(nativeBridge, 'AppSheet');
    }

    public canOpen(): Promise<boolean> {
        return this._nativeBridge.invoke<boolean>(this._apiClass, 'canOpen');
    }

    public prepare(options: IAppSheetOptions): Promise<void> {
        return this._nativeBridge.invoke<void>(this._apiClass, 'prepare', [options]);
    }

    public present(options: IAppSheetOptions, animated: boolean = true): Promise<void> {
        return this._nativeBridge.invoke<void>(this._apiClass, 'present', [options, animated]);
    }

    public destroy(iTunesId?: string): Promise<void> {
        if(typeof iTunesId === 'undefined') {
            return this._nativeBridge.invoke<void>(this._apiClass, 'destroy');
        }
        return this._nativeBridge.invoke<void>(this._apiClass, 'destroy', [iTunesId]);
    }

}
