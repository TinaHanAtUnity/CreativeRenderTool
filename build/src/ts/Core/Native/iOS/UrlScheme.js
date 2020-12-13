import { ApiPackage, NativeApi } from 'Core/Native/Bridge/NativeApi';
export class UrlSchemeApi extends NativeApi {
    constructor(nativeBridge) {
        super(nativeBridge, 'UrlScheme', ApiPackage.CORE);
    }
    open(url) {
        return this._nativeBridge.invoke(this._fullApiClassName, 'open', [url]);
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVXJsU2NoZW1lLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vc3JjL3RzL0NvcmUvTmF0aXZlL2lPUy9VcmxTY2hlbWUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFFLFVBQVUsRUFBRSxTQUFTLEVBQUUsTUFBTSw4QkFBOEIsQ0FBQztBQUdyRSxNQUFNLE9BQU8sWUFBYSxTQUFRLFNBQVM7SUFFdkMsWUFBWSxZQUEwQjtRQUNsQyxLQUFLLENBQUMsWUFBWSxFQUFFLFdBQVcsRUFBRSxVQUFVLENBQUMsSUFBSSxDQUFDLENBQUM7SUFDdEQsQ0FBQztJQUVNLElBQUksQ0FBQyxHQUFXO1FBQ25CLE9BQU8sSUFBSSxDQUFDLGFBQWEsQ0FBQyxNQUFNLENBQU8sSUFBSSxDQUFDLGlCQUFpQixFQUFFLE1BQU0sRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7SUFDbEYsQ0FBQztDQUNKIn0=