import { OMState, OpenMeasurementController } from 'Ads/Views/OpenMeasurement/OpenMeasurementController';
import { AccessMode, AdSessionType, OM_JS_VERSION, OMID_P, PARTNER_NAME } from 'Ads/Views/OpenMeasurement/OpenMeasurementDataTypes';
import { Platform } from 'Core/Constants/Platform';
export class VastOpenMeasurementController extends OpenMeasurementController {
    constructor(platform, placement, omInstances, omAdViewBuilder, clientInfo, deviceInfo) {
        super(placement, omAdViewBuilder, omInstances);
        this._clientInfo = clientInfo;
        this._deviceInfo = deviceInfo;
        this._platform = platform;
    }
    addToViewHierarchy() {
        this._omInstances.forEach((om) => {
            om.addToViewHierarchy();
        });
    }
    removeFromViewHieararchy() {
        this._omInstances.forEach((om) => {
            om.removeFromViewHieararchy();
        });
    }
    injectVerifications() {
        this._omInstances.forEach((om) => {
            om.injectAdVerifications();
        });
    }
    /**
     * Video-only event. The player has loaded and buffered the creative’s
     * media and assets either fully or to the extent that it is ready
     * to play the media. Corresponds to the VAST  loaded  event.
     */
    loaded(vastProperties) {
        if (this.getState() === OMState.STOPPED) {
            super.loaded(vastProperties);
        }
    }
    sessionStart() {
        const contextData = this.buildSessionContext();
        const date = Date.now();
        this._omInstances.forEach((om) => {
            const event = {
                adSessionId: '',
                timestamp: date,
                type: 'sessionStart',
                data: {}
            };
            event.adSessionId = om.getOMAdSessionId();
            const verification = om.getVastVerification();
            if (verification.getVerificationParameters()) {
                event.data.verificationParameters = verification.getVerificationParameters();
            }
            const vendorKey = verification.getVerificationVendor();
            event.data.vendorkey = vendorKey;
            event.data.context = contextData;
            om.sessionStart(event);
        });
    }
    buildSessionContext() {
        const contextData = {
            apiVersion: OMID_P,
            environment: 'app',
            accessMode: AccessMode.LIMITED,
            adSessionType: AdSessionType.NATIVE,
            omidNativeInfo: {
                partnerName: PARTNER_NAME,
                partnerVersion: this._clientInfo.getSdkVersionName()
            },
            omidJsInfo: {
                omidImplementer: PARTNER_NAME,
                serviceVersion: '1.2.10',
                sessionClientVersion: '1.2.10',
                partnerName: PARTNER_NAME,
                partnerVersion: this._clientInfo.getSdkVersionName()
            },
            app: {
                libraryVersion: OM_JS_VERSION,
                appId: this._clientInfo.getApplicationName()
            },
            deviceInfo: {
                deviceType: this._deviceInfo.getModel(),
                os: this._platform === Platform.ANDROID ? 'Android' : 'iOS',
                osVersion: this._deviceInfo.getOsVersion()
            },
            supports: ['vlid', 'clid']
        };
        if (contextData.accessMode === AccessMode.FULL) {
            contextData.videoElement = document.querySelector('video');
        }
        return contextData;
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVmFzdE9wZW5NZWFzdXJlbWVudENvbnRyb2xsZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9zcmMvdHMvQWRzL1ZpZXdzL09wZW5NZWFzdXJlbWVudC9WYXN0T3Blbk1lYXN1cmVtZW50Q29udHJvbGxlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFFQSxPQUFPLEVBQUUsT0FBTyxFQUFFLHlCQUF5QixFQUFFLE1BQU0scURBQXFELENBQUM7QUFFekcsT0FBTyxFQUNILFVBQVUsRUFDVixhQUFhLEVBSWIsYUFBYSxFQUNiLE1BQU0sRUFDTixZQUFZLEVBQ2YsTUFBTSxvREFBb0QsQ0FBQztBQUc1RCxPQUFPLEVBQUUsUUFBUSxFQUFFLE1BQU0seUJBQXlCLENBQUM7QUFHbkQsTUFBTSxPQUFPLDZCQUE4QixTQUFRLHlCQUF5QjtJQUt4RSxZQUFZLFFBQWtCLEVBQUUsU0FBb0IsRUFBRSxXQUE0QyxFQUFFLGVBQTZDLEVBQUUsVUFBc0IsRUFBRSxVQUFzQjtRQUM3TCxLQUFLLENBQUMsU0FBUyxFQUFFLGVBQWUsRUFBRSxXQUFXLENBQUMsQ0FBQztRQUMvQyxJQUFJLENBQUMsV0FBVyxHQUFHLFVBQVUsQ0FBQztRQUM5QixJQUFJLENBQUMsV0FBVyxHQUFHLFVBQVUsQ0FBQztRQUM5QixJQUFJLENBQUMsU0FBUyxHQUFHLFFBQVEsQ0FBQztJQUU5QixDQUFDO0lBRU0sa0JBQWtCO1FBQ3JCLElBQUksQ0FBQyxZQUFZLENBQUMsT0FBTyxDQUFDLENBQUMsRUFBRSxFQUFFLEVBQUU7WUFDN0IsRUFBRSxDQUFDLGtCQUFrQixFQUFFLENBQUM7UUFDNUIsQ0FBQyxDQUFDLENBQUM7SUFDUCxDQUFDO0lBRU0sd0JBQXdCO1FBQzNCLElBQUksQ0FBQyxZQUFZLENBQUMsT0FBTyxDQUFDLENBQUMsRUFBRSxFQUFFLEVBQUU7WUFDN0IsRUFBRSxDQUFDLHdCQUF3QixFQUFFLENBQUM7UUFDbEMsQ0FBQyxDQUFDLENBQUM7SUFDUCxDQUFDO0lBRU0sbUJBQW1CO1FBQ3RCLElBQUksQ0FBQyxZQUFZLENBQUMsT0FBTyxDQUFDLENBQUMsRUFBRSxFQUFFLEVBQUU7WUFDN0IsRUFBRSxDQUFDLHFCQUFxQixFQUFFLENBQUM7UUFDL0IsQ0FBQyxDQUFDLENBQUM7SUFDUCxDQUFDO0lBRUQ7Ozs7T0FJRztJQUNJLE1BQU0sQ0FBQyxjQUErQjtRQUN6QyxJQUFJLElBQUksQ0FBQyxRQUFRLEVBQUUsS0FBSyxPQUFPLENBQUMsT0FBTyxFQUFFO1lBQ3JDLEtBQUssQ0FBQyxNQUFNLENBQUMsY0FBYyxDQUFDLENBQUM7U0FDaEM7SUFDTCxDQUFDO0lBRU0sWUFBWTtRQUNmLE1BQU0sV0FBVyxHQUFhLElBQUksQ0FBQyxtQkFBbUIsRUFBRSxDQUFDO1FBQ3pELE1BQU0sSUFBSSxHQUFHLElBQUksQ0FBQyxHQUFHLEVBQUUsQ0FBQztRQUV4QixJQUFJLENBQUMsWUFBWSxDQUFDLE9BQU8sQ0FBQyxDQUFDLEVBQUUsRUFBRSxFQUFFO1lBQzdCLE1BQU0sS0FBSyxHQUFrQjtnQkFDekIsV0FBVyxFQUFFLEVBQUU7Z0JBQ2YsU0FBUyxFQUFFLElBQUk7Z0JBQ2YsSUFBSSxFQUFFLGNBQWM7Z0JBQ3BCLElBQUksRUFBRSxFQUFFO2FBQ1gsQ0FBQztZQUNGLEtBQUssQ0FBQyxXQUFXLEdBQUcsRUFBRSxDQUFDLGdCQUFnQixFQUFFLENBQUM7WUFDMUMsTUFBTSxZQUFZLEdBQUcsRUFBRSxDQUFDLG1CQUFtQixFQUFFLENBQUM7WUFDOUMsSUFBSSxZQUFZLENBQUMseUJBQXlCLEVBQUUsRUFBRTtnQkFDMUMsS0FBSyxDQUFDLElBQUksQ0FBQyxzQkFBc0IsR0FBRyxZQUFZLENBQUMseUJBQXlCLEVBQUUsQ0FBQzthQUNoRjtZQUVELE1BQU0sU0FBUyxHQUFHLFlBQVksQ0FBQyxxQkFBcUIsRUFBRSxDQUFDO1lBRXZELEtBQUssQ0FBQyxJQUFJLENBQUMsU0FBUyxHQUFHLFNBQVMsQ0FBQztZQUVqQyxLQUFLLENBQUMsSUFBSSxDQUFDLE9BQU8sR0FBRyxXQUFXLENBQUM7WUFFakMsRUFBRSxDQUFDLFlBQVksQ0FBQyxLQUFLLENBQUMsQ0FBQztRQUMzQixDQUFDLENBQUMsQ0FBQztJQUVQLENBQUM7SUFFTyxtQkFBbUI7UUFDdkIsTUFBTSxXQUFXLEdBQWE7WUFDMUIsVUFBVSxFQUFFLE1BQU07WUFDbEIsV0FBVyxFQUFFLEtBQUs7WUFDbEIsVUFBVSxFQUFFLFVBQVUsQ0FBQyxPQUFPO1lBQzlCLGFBQWEsRUFBRSxhQUFhLENBQUMsTUFBTTtZQUNuQyxjQUFjLEVBQUU7Z0JBQ1osV0FBVyxFQUFFLFlBQVk7Z0JBQ3pCLGNBQWMsRUFBRSxJQUFJLENBQUMsV0FBVyxDQUFDLGlCQUFpQixFQUFFO2FBQ3ZEO1lBQ0QsVUFBVSxFQUFFO2dCQUNSLGVBQWUsRUFBRSxZQUFZO2dCQUM3QixjQUFjLEVBQUUsUUFBUTtnQkFDeEIsb0JBQW9CLEVBQUUsUUFBUTtnQkFDOUIsV0FBVyxFQUFFLFlBQVk7Z0JBQ3pCLGNBQWMsRUFBRSxJQUFJLENBQUMsV0FBVyxDQUFDLGlCQUFpQixFQUFFO2FBQ3ZEO1lBQ0QsR0FBRyxFQUFFO2dCQUNELGNBQWMsRUFBRSxhQUFhO2dCQUM3QixLQUFLLEVBQUUsSUFBSSxDQUFDLFdBQVcsQ0FBQyxrQkFBa0IsRUFBRTthQUMvQztZQUNELFVBQVUsRUFBRTtnQkFDUixVQUFVLEVBQUUsSUFBSSxDQUFDLFdBQVcsQ0FBQyxRQUFRLEVBQUU7Z0JBQ3ZDLEVBQUUsRUFBRSxJQUFJLENBQUMsU0FBUyxLQUFLLFFBQVEsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsS0FBSztnQkFDM0QsU0FBUyxFQUFFLElBQUksQ0FBQyxXQUFXLENBQUMsWUFBWSxFQUFFO2FBQzdDO1lBQ0QsUUFBUSxFQUFFLENBQUMsTUFBTSxFQUFFLE1BQU0sQ0FBQztTQUM3QixDQUFDO1FBRUYsSUFBSSxXQUFXLENBQUMsVUFBVSxLQUFLLFVBQVUsQ0FBQyxJQUFJLEVBQUU7WUFDNUMsV0FBVyxDQUFDLFlBQVksR0FBRyxRQUFRLENBQUMsYUFBYSxDQUFDLE9BQU8sQ0FBQyxDQUFDO1NBQzlEO1FBRUQsT0FBTyxXQUFXLENBQUM7SUFDdkIsQ0FBQztDQUNKIn0=