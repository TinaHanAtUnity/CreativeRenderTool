import { ApiPackage, NativeApi } from 'Core/Native/Bridge/NativeApi';
export class ClassDetectionApi extends NativeApi {
    constructor(nativeBridge) {
        super(nativeBridge, 'ClassDetection', ApiPackage.CORE);
    }
    areClassesPresent(classNames) {
        return this._nativeBridge.invoke(this._fullApiClassName, 'areClassesPresent', [classNames]);
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQ2xhc3NEZXRlY3Rpb24uanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9zcmMvdHMvQ29yZS9OYXRpdmUvQ2xhc3NEZXRlY3Rpb24udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFFLFVBQVUsRUFBRSxTQUFTLEVBQUUsTUFBTSw4QkFBOEIsQ0FBQztBQVFyRSxNQUFNLE9BQU8saUJBQWtCLFNBQVEsU0FBUztJQUU1QyxZQUFZLFlBQTBCO1FBQ2xDLEtBQUssQ0FBQyxZQUFZLEVBQUUsZ0JBQWdCLEVBQUUsVUFBVSxDQUFDLElBQUksQ0FBQyxDQUFDO0lBQzNELENBQUM7SUFFTSxpQkFBaUIsQ0FBQyxVQUFvQjtRQUN6QyxPQUFPLElBQUksQ0FBQyxhQUFhLENBQUMsTUFBTSxDQUFlLElBQUksQ0FBQyxpQkFBaUIsRUFBRSxtQkFBbUIsRUFBRSxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUM7SUFDOUcsQ0FBQztDQUNKIn0=