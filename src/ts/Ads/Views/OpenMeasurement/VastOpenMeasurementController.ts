import { OpenMeasurement } from 'Ads/Views/OpenMeasurement/OpenMeasurement';
import { Placement } from 'Ads/Models/Placement';
import { OMState, OpenMeasurementController } from 'Ads/Views/OpenMeasurement/OpenMeasurementController';
import { OpenMeasurementAdViewBuilder } from 'Ads/Views/OpenMeasurement/OpenMeasurementAdViewBuilder';
import {
    AccessMode,
    AdSessionType,
    IContext,
    ISessionEvent,
    IVastProperties,
    OM_JS_VERSION,
    OMID_P,
    PARTNER_NAME
} from 'Ads/Views/OpenMeasurement/OpenMeasurementDataTypes';
import { ClientInfo } from 'Core/Models/ClientInfo';
import { DeviceInfo } from 'Core/Models/DeviceInfo';
import { Platform } from 'Core/Constants/Platform';
import { VastCampaign } from 'VAST/Models/VastCampaign';

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

    /**
     * Video-only event. The player has loaded and buffered the creative’s
     * media and assets either fully or to the extent that it is ready
     * to play the media. Corresponds to the VAST  loaded  event.
     */
    public loaded(vastProperties: IVastProperties) {
        if (this.getState() === OMState.STOPPED) {
            super.loaded(vastProperties);
        }
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

            event.data.context = contextData;

            om.sessionStart(event);
        });

    }

    private buildSessionContext(): IContext {
        const contextData: IContext = {
            apiVersion: OMID_P, // Version code of official OMID JS Verification Client API
            environment: 'app', // OMID JS Verification Client API
            accessMode: AccessMode.LIMITED, // Verification code is executed in a sandbox with only indirect information about ad
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
