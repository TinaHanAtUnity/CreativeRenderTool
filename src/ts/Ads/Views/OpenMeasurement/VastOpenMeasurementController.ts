import { OpenMeasurement } from 'Ads/Views/OpenMeasurement/OpenMeasurement';
import { Placement } from 'Ads/Models/Placement';
import { OpenMeasurementController } from 'Ads/Views/OpenMeasurement/OpenMeasurementController';
import { OpenMeasurementAdViewBuilder } from 'Ads/Views/OpenMeasurement/OpenMeasurementAdViewBuilder';
import { AccessMode,  ISessionEvent, IContext, AdSessionType, PARTNER_NAME, OM_JS_VERSION, OMID_P} from 'Ads/Views/OpenMeasurement/OpenMeasurementDataTypes';
import { ClientInfo } from 'Core/Models/ClientInfo';
import { DeviceInfo } from 'Core/Models/DeviceInfo';
import { Platform } from 'Core/Constants/Platform';
import { VastCampaign } from 'VAST/Models/VastCampaign';
import { CustomFeatures } from 'Ads/Utilities/CustomFeatures';

export class VastOpenMeasurementController extends OpenMeasurementController {
    private _clientInfo: ClientInfo;
    private _deviceInfo: DeviceInfo;
    private _platform: Platform;

    constructor(platform: Platform, placement: Placement, omInstances: OpenMeasurement<VastCampaign>[], omAdViewBuilder: OpenMeasurementAdViewBuilder, clientInfo: ClientInfo, deviceInfo: DeviceInfo) {
        super(placement, omAdViewBuilder, omInstances);
        this._clientInfo = clientInfo;
        this._deviceInfo = deviceInfo;
        this._platform = platform;

    }

    public addToViewHierarchy(): void {
        this._omInstances.forEach((om) => {
            om.addToViewHierarchy();
        });
    }

    public removeFromViewHieararchy(): void {
        this._omInstances.forEach((om) => {
            om.removeFromViewHieararchy();
        });
    }

    public injectVerifications(): void {
        this._omInstances.forEach((om) => {
            om.injectAdVerifications();
        });
    }

    public sessionStart() {
        const contextData: IContext = this.buildSessionContext();
        const date = Date.now();

        this._omInstances.forEach((om) => {
            const event: ISessionEvent = {
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

            if (CustomFeatures.isIASVendor(vendorKey)) {
                contextData.adSessionType = AdSessionType.NATIVE;  // TODO: Adjust. IAS expects native to run properly
            }

            event.data.context = contextData;

            om.sessionStart(event);
        });

    }

    private buildSessionContext(): IContext {
        const contextData: IContext = {
            apiVersion: OMID_P,                                   // Version code of official OMID JS Verification Client API
            environment: 'app',                                   // OMID JS Verification Client API
            accessMode: AccessMode.LIMITED,                       // Verification code is executed in a sandbox with only indirect information about ad
            adSessionType: AdSessionType.HTML,
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
