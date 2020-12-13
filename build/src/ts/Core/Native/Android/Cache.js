import { ApiPackage, NativeApi } from 'Core/Native/Bridge/NativeApi';
export class AndroidCacheApi extends NativeApi {
    constructor(nativeBridge) {
        super(nativeBridge, 'Cache', ApiPackage.CORE);
    }
    getMetaData(fileId, properties) {
        return this._nativeBridge.invoke(this._fullApiClassName, 'getMetaData', [fileId, properties]);
    }
    getCacheDirectoryType() {
        return this._nativeBridge.invoke(this._fullApiClassName, 'getCacheDirectoryType');
    }
    getCacheDirectoryExists() {
        return this._nativeBridge.invoke(this._fullApiClassName, 'getCacheDirectoryExists');
    }
    recreateCacheDirectory() {
        return this._nativeBridge.invoke(this._fullApiClassName, 'recreateCacheDirectory');
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQ2FjaGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9zcmMvdHMvQ29yZS9OYXRpdmUvQW5kcm9pZC9DYWNoZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUUsVUFBVSxFQUFFLFNBQVMsRUFBRSxNQUFNLDhCQUE4QixDQUFDO0FBR3JFLE1BQU0sT0FBTyxlQUFnQixTQUFRLFNBQVM7SUFDMUMsWUFBWSxZQUEwQjtRQUNsQyxLQUFLLENBQUMsWUFBWSxFQUFFLE9BQU8sRUFBRSxVQUFVLENBQUMsSUFBSSxDQUFDLENBQUM7SUFDbEQsQ0FBQztJQUVNLFdBQVcsQ0FBQyxNQUFjLEVBQUUsVUFBb0I7UUFDbkQsT0FBTyxJQUFJLENBQUMsYUFBYSxDQUFDLE1BQU0sQ0FBc0IsSUFBSSxDQUFDLGlCQUFpQixFQUFFLGFBQWEsRUFBRSxDQUFDLE1BQU0sRUFBRSxVQUFVLENBQUMsQ0FBQyxDQUFDO0lBQ3ZILENBQUM7SUFFTSxxQkFBcUI7UUFDeEIsT0FBTyxJQUFJLENBQUMsYUFBYSxDQUFDLE1BQU0sQ0FBUyxJQUFJLENBQUMsaUJBQWlCLEVBQUUsdUJBQXVCLENBQUMsQ0FBQztJQUM5RixDQUFDO0lBRU0sdUJBQXVCO1FBQzFCLE9BQU8sSUFBSSxDQUFDLGFBQWEsQ0FBQyxNQUFNLENBQVUsSUFBSSxDQUFDLGlCQUFpQixFQUFFLHlCQUF5QixDQUFDLENBQUM7SUFDakcsQ0FBQztJQUVNLHNCQUFzQjtRQUN6QixPQUFPLElBQUksQ0FBQyxhQUFhLENBQUMsTUFBTSxDQUFPLElBQUksQ0FBQyxpQkFBaUIsRUFBRSx3QkFBd0IsQ0FBQyxDQUFDO0lBQzdGLENBQUM7Q0FDSiJ9