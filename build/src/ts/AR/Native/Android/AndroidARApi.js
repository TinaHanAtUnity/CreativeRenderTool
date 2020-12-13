import { ApiPackage, NativeApi } from 'Core/Native/Bridge/NativeApi';
import { Observable1 } from 'Core/Utilities/Observable';
export class AndroidARApi extends NativeApi {
    constructor(nativeBridge) {
        super(nativeBridge, 'AR', ApiPackage.AR);
        this.onAndroidEnumsReceived = new Observable1();
    }
    isARSupported() {
        return this._nativeBridge.invoke(this._fullApiClassName, 'isARSupported');
    }
    initAR() {
        return this._nativeBridge.invoke(this._fullApiClassName, 'getAndroidConfigEnums').then((enums) => {
            this.onAndroidEnumsReceived.trigger(enums);
            return Promise.resolve();
        });
    }
    advanceFrame() {
        return this._nativeBridge.invoke(this._fullApiClassName, 'advanceFrame');
    }
    swapBuffers() {
        return this._nativeBridge.invoke(this._fullApiClassName, 'swapBuffers');
    }
    setViewRenderMode(mode) {
        return this._nativeBridge.invoke(this._fullApiClassName, 'setViewRenderMode', [mode]);
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQW5kcm9pZEFSQXBpLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vc3JjL3RzL0FSL05hdGl2ZS9BbmRyb2lkL0FuZHJvaWRBUkFwaS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUUsVUFBVSxFQUFFLFNBQVMsRUFBRSxNQUFNLDhCQUE4QixDQUFDO0FBRXJFLE9BQU8sRUFBRSxXQUFXLEVBQUUsTUFBTSwyQkFBMkIsQ0FBQztBQUV4RCxNQUFNLE9BQU8sWUFBYSxTQUFRLFNBQVM7SUFHdkMsWUFBWSxZQUEwQjtRQUNsQyxLQUFLLENBQUMsWUFBWSxFQUFFLElBQUksRUFBRSxVQUFVLENBQUMsRUFBRSxDQUFDLENBQUM7UUFIN0IsMkJBQXNCLEdBQUcsSUFBSSxXQUFXLEVBQVcsQ0FBQztJQUlwRSxDQUFDO0lBRU0sYUFBYTtRQUNoQixPQUFPLElBQUksQ0FBQyxhQUFhLENBQUMsTUFBTSxDQUFxQixJQUFJLENBQUMsaUJBQWlCLEVBQUUsZUFBZSxDQUFDLENBQUM7SUFDbEcsQ0FBQztJQUVNLE1BQU07UUFDVCxPQUFPLElBQUksQ0FBQyxhQUFhLENBQUMsTUFBTSxDQUFVLElBQUksQ0FBQyxpQkFBaUIsRUFBRSx1QkFBdUIsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLEtBQUssRUFBRSxFQUFFO1lBQ3RHLElBQUksQ0FBQyxzQkFBc0IsQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLENBQUM7WUFFM0MsT0FBTyxPQUFPLENBQUMsT0FBTyxFQUFFLENBQUM7UUFDN0IsQ0FBQyxDQUFDLENBQUM7SUFDUCxDQUFDO0lBRU0sWUFBWTtRQUNmLE9BQU8sSUFBSSxDQUFDLGFBQWEsQ0FBQyxNQUFNLENBQU8sSUFBSSxDQUFDLGlCQUFpQixFQUFFLGNBQWMsQ0FBQyxDQUFDO0lBQ25GLENBQUM7SUFFTSxXQUFXO1FBQ2QsT0FBTyxJQUFJLENBQUMsYUFBYSxDQUFDLE1BQU0sQ0FBTyxJQUFJLENBQUMsaUJBQWlCLEVBQUUsYUFBYSxDQUFDLENBQUM7SUFDbEYsQ0FBQztJQUVNLGlCQUFpQixDQUFDLElBQVk7UUFDakMsT0FBTyxJQUFJLENBQUMsYUFBYSxDQUFDLE1BQU0sQ0FBTyxJQUFJLENBQUMsaUJBQWlCLEVBQUUsbUJBQW1CLEVBQUUsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO0lBQ2hHLENBQUM7Q0FDSiJ9