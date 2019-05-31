import { ApiPackage, NativeApi } from 'Core/Native/Bridge/NativeApi';
import { NativeBridge } from 'Core/Native/Bridge/NativeBridge';

export enum IntentFlag {
    FLAG_GRANT_READ_URI_PERMISSION = 1,
    FLAG_ACTIVITY_NEW_TASK = 268435456
}

export interface IIntentExtra {
    key: string;
    value: unknown;
}

export interface IIntentData {
    className?: string;
    packageName?: string;
    action?: string;
    uri?: string;
    mimeType?: string;
    categories?: string[];
    flags?: number;
    extras?: IIntentExtra[];
    id?: string;
}

export class IntentApi extends NativeApi {

    constructor(nativeBridge: NativeBridge) {
        super(nativeBridge, 'Intent', ApiPackage.CORE);
    }

    public launch(intentData: IIntentData): Promise<void> {
        return this._nativeBridge.invoke<void>(this._fullApiClassName, 'launch', [intentData]);
    }

    public canOpenIntent(intentData: IIntentData): Promise<boolean> {
        return this._nativeBridge.invoke<boolean>(this._fullApiClassName, 'canOpenIntent', [intentData]);
    }

    public canOpenIntents(intents: IIntentData[]): Promise<{ [id: string]: boolean }> {
        return this._nativeBridge.invoke<{ [id: string]: boolean }>(this._fullApiClassName, 'canOpenIntents', [intents]);
    }
}
