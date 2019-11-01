import { ApiPackage, NativeApi } from 'Core/Native/Bridge/NativeApi';
import { NativeBridge } from 'Core/Native/Bridge/NativeBridge';

export class ClassDetectionApi extends NativeApi {

    constructor(nativeBridge: NativeBridge) {
        super(nativeBridge, 'ClassDetection', ApiPackage.CORE);
    }

    public areClassesPresent(classNames: string[]): Promise<boolean[]> {
        return this._nativeBridge.invoke<boolean[]>(this._fullApiClassName, 'areClassesPresent', [classNames]);
    }
}
