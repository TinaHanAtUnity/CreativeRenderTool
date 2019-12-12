import { OpenMeasurement } from 'Ads/Views/OpenMeasurement/OpenMeasurement';
import { Placement } from 'Ads/Models/Placement';
import { OpenMeasurementController } from 'Ads/Views/OpenMeasurement/OpenMeasurementController';
import { OpenMeasurementAdViewBuilder } from 'Ads/Views/OpenMeasurement/OpenMeasurementAdViewBuilder';
import { AccessMode, IVerificationScriptResource, IImpressionValues, OMID3pEvents, IVastProperties, IViewPort, IAdView, ISessionEvent, SessionEvents, MediaType, VideoPosition, VideoEventAdaptorType, ObstructionReasons, IRectangle, IContext, AdSessionType, PARTNER_NAME, DEFAULT_VENDOR_KEY, OM_JS_VERSION, OMID_P, SDK_APIS} from 'Ads/Views/OpenMeasurement/OpenMeasurementDataTypes';
import { ClientInfo } from 'Core/Models/ClientInfo';
import { DeviceInfo } from 'Core/Models/DeviceInfo';
import { Platform } from 'Core/Constants/Platform';

export class VastOpenMeasurementController extends OpenMeasurementController {
    private _clientInfo: ClientInfo;
    private _deviceInfo: DeviceInfo;
    private _platform: Platform;

    constructor(platform: Platform, placement: Placement, omInstances: OpenMeasurement[], omAdViewBuilder: OpenMeasurementAdViewBuilder, clientInfo: ClientInfo, deviceInfo: DeviceInfo) {
        super(placement, omAdViewBuilder, omInstances);
        this._clientInfo = clientInfo;
        this._deviceInfo = deviceInfo;
        this._platform = platform;

    }

    public addToViewHierarchy(): void {
        console.log('addToViewHierarchy');
        this._omInstances.forEach((om) => {
            om.addToViewHierarchy();
        });
    }

    public removeFromViewHieararchy(): void {
        console.log('removeFromViewHieararchy');
        this._omInstances.forEach((om) => {
            om.removeFromViewHieararchy();
        });
    }

    public injectVerifications(): void {
        console.log('injectVerifications');
        this._omInstances.forEach((om) => {
            om.injectAdVerifications();
        });
    }

    public sessionStart() {
        const contextData: IContext = this.buildSessionContext();

        const event: ISessionEvent = {
            adSessionId: '',
            timestamp: Date.now(),
            type: 'sessionStart',
            data: {}
        };

        this._omInstances.forEach((om) => {
            event.adSessionId = om.getOMAdSessionId();
            const verification = om.getVastVerification();
            event.data.verificationParameters = verification.getVerificationParameters();
            event.data.vendorkey = verification.getVerificationVendor();
            event.data.context = contextData;

            om.sessionStart(event);
        });

    }

    public buildSessionContext(): IContext {
        const contextData: IContext = {
            apiVersion: OMID_P,                                   // Version code of official OMID JS Verification Client API
            environment: 'app',                                   // OMID JS Verification Client API
            accessMode: AccessMode.LIMITED,                       // Verification code is executed in a sandbox with only indirect information about ad
            adSessionType: AdSessionType.NATIVE,                  // Needed to be native for IAS for some reason
            omidNativeInfo: {
                partnerName: PARTNER_NAME,
                partnerVersion: this._clientInfo.getSdkVersionName()
            },
            omidJsInfo: {
                omidImplementer: PARTNER_NAME,
                serviceVersion: this._clientInfo.getSdkVersionName(),
                sessionClientVersion: OMID_P,
                partnerName: PARTNER_NAME,
                partnerVersion: this._clientInfo.getSdkVersionName()
            },
            app: {
                libraryVersion: OM_JS_VERSION,
                appId: this._clientInfo.getApplicationName()
            },
            deviceInfo: {
                deviceType: this._deviceInfo.getModel(),
                os: Platform[this._platform].toLowerCase(),
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
