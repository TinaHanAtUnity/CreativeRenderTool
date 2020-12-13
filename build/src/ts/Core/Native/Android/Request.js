import { ApiPackage, NativeApi } from 'Core/Native/Bridge/NativeApi';
export class AndroidRequestApi extends NativeApi {
    constructor(nativeBridge) {
        super(nativeBridge, 'Request', ApiPackage.CORE);
    }
    setMaximumPoolSize(count) {
        return this._nativeBridge.invoke(this._fullApiClassName, 'setMaximumPoolSize', [count]);
    }
    setKeepAliveTime(keepAliveTime) {
        return this._nativeBridge.invoke(this._fullApiClassName, 'setKeepAliveTime', [keepAliveTime]);
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUmVxdWVzdC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3NyYy90cy9Db3JlL05hdGl2ZS9BbmRyb2lkL1JlcXVlc3QudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFFLFVBQVUsRUFBRSxTQUFTLEVBQUUsTUFBTSw4QkFBOEIsQ0FBQztBQUdyRSxNQUFNLE9BQU8saUJBQWtCLFNBQVEsU0FBUztJQUM1QyxZQUFZLFlBQTBCO1FBQ2xDLEtBQUssQ0FBQyxZQUFZLEVBQUUsU0FBUyxFQUFFLFVBQVUsQ0FBQyxJQUFJLENBQUMsQ0FBQztJQUNwRCxDQUFDO0lBRU0sa0JBQWtCLENBQUMsS0FBYTtRQUNuQyxPQUFPLElBQUksQ0FBQyxhQUFhLENBQUMsTUFBTSxDQUFPLElBQUksQ0FBQyxpQkFBaUIsRUFBRSxvQkFBb0IsRUFBRSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUM7SUFDbEcsQ0FBQztJQUVNLGdCQUFnQixDQUFDLGFBQXFCO1FBQ3pDLE9BQU8sSUFBSSxDQUFDLGFBQWEsQ0FBQyxNQUFNLENBQU8sSUFBSSxDQUFDLGlCQUFpQixFQUFFLGtCQUFrQixFQUFFLENBQUMsYUFBYSxDQUFDLENBQUMsQ0FBQztJQUN4RyxDQUFDO0NBQ0oifQ==