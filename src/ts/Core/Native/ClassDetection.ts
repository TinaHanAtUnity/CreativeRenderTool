import { ApiPackage, NativeApi } from 'Core/Native/Bridge/NativeApi';
import { NativeBridge } from 'Core/Native/Bridge/NativeBridge';

export interface IClassInfo {
    class: string;
    found: boolean;
}

export class ClassDetectionApi extends NativeApi {

    constructor(nativeBridge: NativeBridge) {
        super(nativeBridge, 'ClassDetection', ApiPackage.CORE);
    }

    public areClassesPresent(classNames: string[]): Promise<IClassInfo[]> {
        return this._nativeBridge.invoke<IClassInfo[]>(this._fullApiClassName, 'areClassesPresent', [classNames]);
    }
}
