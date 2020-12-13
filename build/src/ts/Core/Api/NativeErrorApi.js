import { NativeApi, ApiPackage } from 'Core/Native/Bridge/NativeApi';
import { EventCategory } from 'Core/Constants/EventCategory';
import { Diagnostics } from 'Core/Utilities/Diagnostics';
var NativeErrorEvents;
(function (NativeErrorEvents) {
    NativeErrorEvents["ReportNativeError"] = "REPORT_NATIVE_ERROR";
})(NativeErrorEvents || (NativeErrorEvents = {}));
export class NativeErrorApi extends NativeApi {
    constructor(nativeBridge) {
        super(nativeBridge, 'NativeErrorApi', ApiPackage.CORE, EventCategory.NATIVE_ERROR);
    }
    handleEvent(event, parameters) {
        switch (event) {
            case NativeErrorEvents.ReportNativeError:
                this.handleReportNativeError(parameters);
                break;
            default:
                super.handleEvent(event, parameters);
        }
    }
    handleReportNativeError(parameters) {
        if (parameters.length > 0 && parameters[0]) {
            const errorString = parameters[0];
            Diagnostics.trigger('report_native_error', {
                errorString: errorString
            });
        }
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiTmF0aXZlRXJyb3JBcGkuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9zcmMvdHMvQ29yZS9BcGkvTmF0aXZlRXJyb3JBcGkudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFFLFNBQVMsRUFBRSxVQUFVLEVBQUUsTUFBTSw4QkFBOEIsQ0FBQztBQUVyRSxPQUFPLEVBQUUsYUFBYSxFQUFFLE1BQU0sOEJBQThCLENBQUM7QUFDN0QsT0FBTyxFQUFFLFdBQVcsRUFBRSxNQUFNLDRCQUE0QixDQUFDO0FBRXpELElBQUssaUJBRUo7QUFGRCxXQUFLLGlCQUFpQjtJQUNsQiw4REFBeUMsQ0FBQTtBQUM3QyxDQUFDLEVBRkksaUJBQWlCLEtBQWpCLGlCQUFpQixRQUVyQjtBQUVELE1BQU0sT0FBTyxjQUFlLFNBQVEsU0FBUztJQUV6QyxZQUFZLFlBQTBCO1FBQ2xDLEtBQUssQ0FBQyxZQUFZLEVBQUUsZ0JBQWdCLEVBQUUsVUFBVSxDQUFDLElBQUksRUFBRSxhQUFhLENBQUMsWUFBWSxDQUFDLENBQUM7SUFDdkYsQ0FBQztJQUVNLFdBQVcsQ0FBQyxLQUFhLEVBQUUsVUFBcUI7UUFDbkQsUUFBUSxLQUFLLEVBQUU7WUFDWCxLQUFLLGlCQUFpQixDQUFDLGlCQUFpQjtnQkFDcEMsSUFBSSxDQUFDLHVCQUF1QixDQUFDLFVBQVUsQ0FBQyxDQUFDO2dCQUN6QyxNQUFNO1lBQ1Y7Z0JBQ0ksS0FBSyxDQUFDLFdBQVcsQ0FBQyxLQUFLLEVBQUUsVUFBVSxDQUFDLENBQUM7U0FDNUM7SUFDTCxDQUFDO0lBRU8sdUJBQXVCLENBQUMsVUFBcUI7UUFDakQsSUFBSSxVQUFVLENBQUMsTUFBTSxHQUFHLENBQUMsSUFBSSxVQUFVLENBQUMsQ0FBQyxDQUFDLEVBQUU7WUFDeEMsTUFBTSxXQUFXLEdBQW1CLFVBQVUsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUNsRCxXQUFXLENBQUMsT0FBTyxDQUFDLHFCQUFxQixFQUFFO2dCQUN2QyxXQUFXLEVBQUcsV0FBVzthQUM1QixDQUFDLENBQUM7U0FDTjtJQUNMLENBQUM7Q0FFSiJ9