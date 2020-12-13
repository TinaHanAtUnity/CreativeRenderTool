import { ApiPackage, NativeApi } from 'Core/Native/Bridge/NativeApi';
export class AdsPropertiesApi extends NativeApi {
    constructor(nativeBridge) {
        super(nativeBridge, 'AdsProperties', ApiPackage.ADS);
    }
    setShowTimeout(timeout) {
        return this._nativeBridge.invoke(this._fullApiClassName, 'setShowTimeout', [timeout]);
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQWRzUHJvcGVydGllcy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3NyYy90cy9BZHMvTmF0aXZlL0Fkc1Byb3BlcnRpZXMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFFLFVBQVUsRUFBRSxTQUFTLEVBQUUsTUFBTSw4QkFBOEIsQ0FBQztBQUdyRSxNQUFNLE9BQU8sZ0JBQWlCLFNBQVEsU0FBUztJQUMzQyxZQUFZLFlBQTBCO1FBQ2xDLEtBQUssQ0FBQyxZQUFZLEVBQUUsZUFBZSxFQUFFLFVBQVUsQ0FBQyxHQUFHLENBQUMsQ0FBQztJQUN6RCxDQUFDO0lBRU0sY0FBYyxDQUFDLE9BQWU7UUFDakMsT0FBTyxJQUFJLENBQUMsYUFBYSxDQUFDLE1BQU0sQ0FBTyxJQUFJLENBQUMsaUJBQWlCLEVBQUUsZ0JBQWdCLEVBQUUsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDO0lBQ2hHLENBQUM7Q0FDSiJ9