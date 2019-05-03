import { NativeApi, ApiPackage } from 'Core/Native/Bridge/NativeApi';
import { NativeBridge } from 'Core/Native/Bridge/NativeBridge';
import { EventCategory } from 'Core/Constants/EventCategory';
import { Diagnostics } from 'Core/Utilities/Diagnostics';

enum NativeErrorEvents {
    ReportNativeError = 'REPORT_NATIVE_ERROR'
}

export class NativeErrorApi extends NativeApi {

    constructor(nativeBridge: NativeBridge) {
        super(nativeBridge, 'NativeErrorApi', ApiPackage.CORE, EventCategory.NATIVE_ERROR);
    }

    public handleEvent(event: string, parameters: unknown[]) {
        switch (event) {
            case NativeErrorEvents.ReportNativeError:
                this.handleReportNativeError(parameters);
                break;
            default:
                super.handleEvent(event, parameters);
        }
    }

    private handleReportNativeError(parameters: unknown[]) {
        if (parameters.length > 0 && parameters[0]) {
            const errorString: string = <string>parameters[0];
            Diagnostics.trigger('report_native_error', {
                errorString : errorString
            });
        }
    }

}
