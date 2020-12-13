import { ApiPackage, NativeApi } from 'Core/Native/Bridge/NativeApi';
export class MainBundleApi extends NativeApi {
    constructor(nativeBridge) {
        super(nativeBridge, 'MainBundle', ApiPackage.CORE);
    }
    getDataForKeysContaining(containsString) {
        return this._nativeBridge.invoke(this._fullApiClassName, 'getDataForKeysContaining', [containsString]);
    }
    getDataForKey(key) {
        return this._nativeBridge.invoke(this._fullApiClassName, 'getDataForKey', [key]);
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiTWFpbkJ1bmRsZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3NyYy90cy9Db3JlL05hdGl2ZS9pT1MvTWFpbkJ1bmRsZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUUsVUFBVSxFQUFFLFNBQVMsRUFBRSxNQUFNLDhCQUE4QixDQUFDO0FBR3JFLE1BQU0sT0FBTyxhQUFjLFNBQVEsU0FBUztJQUN4QyxZQUFZLFlBQTBCO1FBQ2xDLEtBQUssQ0FBQyxZQUFZLEVBQUUsWUFBWSxFQUFFLFVBQVUsQ0FBQyxJQUFJLENBQUMsQ0FBQztJQUN2RCxDQUFDO0lBRU0sd0JBQXdCLENBQUMsY0FBc0I7UUFDbEQsT0FBTyxJQUFJLENBQUMsYUFBYSxDQUFDLE1BQU0sQ0FBNkIsSUFBSSxDQUFDLGlCQUFpQixFQUFFLDBCQUEwQixFQUFFLENBQUMsY0FBYyxDQUFDLENBQUMsQ0FBQztJQUN2SSxDQUFDO0lBRU0sYUFBYSxDQUFDLEdBQVc7UUFDNUIsT0FBTyxJQUFJLENBQUMsYUFBYSxDQUFDLE1BQU0sQ0FBb0IsSUFBSSxDQUFDLGlCQUFpQixFQUFFLGVBQWUsRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7SUFDeEcsQ0FBQztDQUNKIn0=