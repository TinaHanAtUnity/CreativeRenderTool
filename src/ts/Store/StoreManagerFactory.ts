import { StoreManager } from 'Store/Managers/StoreManager';
import { Core } from 'Core/Core';
import { Platform } from 'Core/Constants/Platform';
import { GoogleStoreManager } from 'Store/Managers/GoogleStoreManager';
import { AppleStoreManager } from 'Store/Managers/AppleStoreManager';

export class StoreManagerFactory {
    public static create(core: Core): StoreManager {
        if(core.NativeBridge.getPlatform() === Platform.ANDROID) {
            return new GoogleStoreManager(core);
        } else {
            return new AppleStoreManager(core);
        }
    }
}
