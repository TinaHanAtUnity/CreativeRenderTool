import { NativeApi } from 'Native/NativeApi';
import { StreamType } from 'Constants/Android/StreamType';
import { NativeBridge } from 'Native/NativeBridge';

export enum StorageType {
    EXTERNAL,
    INTERNAL
}

export class IosDeviceInfoApi extends NativeApi {
    constructor(nativeBridge: NativeBridge) {
        super(nativeBridge, 'DeviceInfo');
    }
}