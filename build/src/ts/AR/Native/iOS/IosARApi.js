import { ApiPackage, NativeApi } from 'Core/Native/Bridge/NativeApi';
export class IosARApi extends NativeApi {
    constructor(nativeBridge) {
        super(nativeBridge, 'AR', ApiPackage.AR);
    }
    isARSupported() {
        return this._nativeBridge.invoke(this._fullApiClassName, 'isARSupported', ['ARWorldTrackingConfiguration']);
    }
    getFrameInfo() {
        return this._nativeBridge.invoke(this._fullApiClassName, 'getFrameInfo');
    }
    setFrameScaling(scale) {
        return this._nativeBridge.invoke(this._fullApiClassName, 'setFrameScaling', [scale]);
    }
    advanceFrame() {
        return this._nativeBridge.invoke(this._fullApiClassName, 'advanceFrame');
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiSW9zQVJBcGkuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9zcmMvdHMvQVIvTmF0aXZlL2lPUy9Jb3NBUkFwaS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFDQSxPQUFPLEVBQUUsVUFBVSxFQUFFLFNBQVMsRUFBRSxNQUFNLDhCQUE4QixDQUFDO0FBR3JFLE1BQU0sT0FBTyxRQUFTLFNBQVEsU0FBUztJQUNuQyxZQUFZLFlBQTBCO1FBQ2xDLEtBQUssQ0FBQyxZQUFZLEVBQUUsSUFBSSxFQUFFLFVBQVUsQ0FBQyxFQUFFLENBQUMsQ0FBQztJQUM3QyxDQUFDO0lBRU0sYUFBYTtRQUNoQixPQUFPLElBQUksQ0FBQyxhQUFhLENBQUMsTUFBTSxDQUFVLElBQUksQ0FBQyxpQkFBaUIsRUFBRSxlQUFlLEVBQUUsQ0FBQyw4QkFBOEIsQ0FBQyxDQUFDLENBQUM7SUFDekgsQ0FBQztJQUVNLFlBQVk7UUFDZixPQUFPLElBQUksQ0FBQyxhQUFhLENBQUMsTUFBTSxDQUFlLElBQUksQ0FBQyxpQkFBaUIsRUFBRSxjQUFjLENBQUMsQ0FBQztJQUMzRixDQUFDO0lBRU0sZUFBZSxDQUFDLEtBQW9CO1FBQ3ZDLE9BQU8sSUFBSSxDQUFDLGFBQWEsQ0FBQyxNQUFNLENBQU8sSUFBSSxDQUFDLGlCQUFpQixFQUFFLGlCQUFpQixFQUFFLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQztJQUMvRixDQUFDO0lBRU0sWUFBWTtRQUNmLE9BQU8sSUFBSSxDQUFDLGFBQWEsQ0FBQyxNQUFNLENBQU8sSUFBSSxDQUFDLGlCQUFpQixFQUFFLGNBQWMsQ0FBQyxDQUFDO0lBQ25GLENBQUM7Q0FDSiJ9