import { NativeBridge } from 'Native/NativeBridge';
import { NativeApi } from 'Native/NativeApi';

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
        super(nativeBridge, 'Intent');
    }

    public launch(intentData: IntentData): Promise<void> {
        return this._nativeBridge.invoke<void>(this._apiClass, 'launch', [intentData]);
    }

    public canOpenIntent(intentData: IntentData): Promise<{ [id: string]: boolean }> {
        return this._nativeBridge.invoke<{ [id: string]: boolean }>(this._apiClass, 'canOpenIntent', [intentData]);
    }

    public canOpenIntents(intentData: IntentData[]): Promise<{ [id: string]: boolean }> {
        return this._nativeBridge.invoke<{ [id: string]: boolean }>(this._apiClass, 'canOpenIntents', [intentData]);
    }
}
