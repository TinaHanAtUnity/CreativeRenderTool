import { ApiPackage, NativeApi } from 'Native/NativeApi';
import { NativeBridge } from 'Native/NativeBridge';
import { Observable2, Observable1 } from 'Utilities/Observable';

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

export enum AppSheetEvent {
    PREPARED,
    OPENED,
    CLOSED,
    FAILED
}

export class AppSheetApi extends NativeApi {

    public readonly onPrepared = new Observable1<IAppSheetOptions>();
    public readonly onOpen = new Observable1<IAppSheetOptions>();
    public readonly onClose = new Observable1<IAppSheetOptions>();
    public readonly onError = new Observable2<string, IAppSheetOptions>();

    constructor(nativeBridge: NativeBridge) {
        super(nativeBridge, 'AppSheet', ApiPackage.CORE);
    }

    public canOpen(): Promise<boolean> {
        return this._nativeBridge.invoke<boolean>(this._fullApiClassName, 'canOpen');
    }

    public prepare(options: IAppSheetOptions, timeout: number = 30000): Promise<void> {
        return this._nativeBridge.invoke<void>(this._fullApiClassName, 'prepare', [options, timeout]);
    }

    public present(options: IAppSheetOptions, animated: boolean = true): Promise<void> {
        return this._nativeBridge.invoke<void>(this._fullApiClassName, 'present', [options, animated]);
    }

    public destroy(options?: IAppSheetOptions): Promise<void> {
        if(typeof options === 'undefined') {
            return this._nativeBridge.invoke<void>(this._fullApiClassName, 'destroy');
        }
        return this._nativeBridge.invoke<void>(this._fullApiClassName, 'destroy', [options]);
    }

    public setPrepareTimeout(timeout: number): Promise<void> {
        return this._nativeBridge.invoke<void>(this._fullApiClassName, 'setPrepareTimeout', [timeout]);
    }

    public getPrepareTimeout(): Promise<number> {
        return this._nativeBridge.invoke<number>(this._fullApiClassName, 'getPrepareTimeout');
    }

    public handleEvent(event: string, parameters: any[]): void {
        switch(event) {
            case AppSheetEvent[AppSheetEvent.PREPARED]:
                this.onPrepared.trigger(parameters[0]);
                break;

            case AppSheetEvent[AppSheetEvent.OPENED]:
                this.onOpen.trigger(parameters[0]);
                break;

            case AppSheetEvent[AppSheetEvent.CLOSED]:
                this.onClose.trigger(parameters[0]);
                break;

            case AppSheetEvent[AppSheetEvent.FAILED]:
                this.onError.trigger(parameters[0], parameters[1]);
                break;

            default:
                super.handleEvent(event, parameters);
        }
    }

}
