import { NativeBridge } from 'Core/Native/Bridge/NativeBridge';
import { NativeApi, ApiPackage } from 'Core/Native/Bridge/NativeApi';
import { Observable1 } from 'Core/Utilities/Observable';
import { EventCategory } from 'Core/Constants/EventCategory';

enum InstallEvent {
    PACKAGE_ADDED
}

export class AndroidInstallListenerApi extends NativeApi {

    public readonly onPackageAdded = new Observable1<string>();

    constructor(nativeBridge: NativeBridge) {
        super(nativeBridge, 'Install', ApiPackage.CHINA, EventCategory.INSTALL);
    }

    public subscribeInstallComplete(): Promise<number> {
        return this._nativeBridge.invoke<number>(this._fullApiClassName, 'subscribeInstallComplete');
    }

    public unsubscribeInstallComplete(): Promise<number> {
        return this._nativeBridge.invoke<number>(this._fullApiClassName, 'unsubscribeInstallComplete');
    }

    public handleEvent(event: string, parameters: unknown[]): void {
        if (event === InstallEvent[InstallEvent.PACKAGE_ADDED]) {
            this.onPackageAdded.trigger(<string>parameters[0]);
        } else {
            super.handleEvent(event, parameters);
        }
    }
}
