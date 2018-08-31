import { NativeBridge } from 'Common/Native/NativeBridge';
import { ApiPackage, NativeApi } from 'Common/Native/NativeApi';

export interface IntentExtra {
    key: string;
    value: any;
}

export interface IntentData {
    className?: string;
    packageName?: string;
    action?: string;
    uri?: string;
    mimeType?: string;
    categories?: string[];
    flags?: number;
    extras?: IntentExtra[];
    id?: string;
}

export class IntentApi extends NativeApi {

    constructor(nativeBridge: NativeBridge) {
        super(nativeBridge, 'Intent', ApiPackage.CORE);
    }

    public launch(intentData: IntentData): Promise<void> {
        return this._nativeBridge.invoke<void>(this._fullApiClassName, 'launch', [intentData]);
    }

    public canOpenIntent(intentData: IntentData): Promise<boolean> {
        return this._nativeBridge.invoke<boolean>(this._fullApiClassName, 'canOpenIntent', [intentData]);
    }

    public canOpenIntents(intents: IntentData[]): Promise<{ [id: string]: boolean }> {
        return this._nativeBridge.invoke<{ [id: string]: boolean }>(this._fullApiClassName, 'canOpenIntents', [intents]);
    }
}
