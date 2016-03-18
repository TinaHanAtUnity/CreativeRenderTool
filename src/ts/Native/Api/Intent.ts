import { NativeBridge } from 'Native/NativeBridge';

export interface IntentExtra {
    key: string;
    value: any;
}

export interface IntentData {
    className: string;
    packageName: string;
    action: string;
    uri: string;
    mimeType: string;
    categories: string[];
    flags: number;
    extras: IntentExtra[];
}

export class IntentApi {

    private static ApiClass = 'Intent';

    public static launch(intentData: IntentData): Promise<void> {
        return NativeBridge.getInstance().invoke<void>(IntentApi.ApiClass, 'launch', [intentData]);
    }

}
