import * as sinon from 'sinon';
import { Platform } from 'Core/Constants/Platform';
import { Placement } from 'Ads/Models/Placement';
import { OpenMeasurementManager } from 'Ads/Views/OpenMeasurement/OpenMeasurementManager';
import { OpenMeasurement } from 'Ads/Views/OpenMeasurement/OpenMeasurement';
import { TestFixtures } from 'TestHelpers/TestFixtures';
import { AdmobOpenMeasurementManager } from 'Ads/Views/OpenMeasurement/AdmobOpenMeasurementManager';
import { AdMobCampaign } from 'AdMob/Models/AdMobCampaign';
import { IAdUnitParameters } from 'Ads/AdUnits/AbstractAdUnit';
import { Orientation } from 'Ads/AdUnits/Containers/AdUnitContainer';
import { Backend } from 'Backend/Backend';
import { NativeBridge } from 'Core/Native/Bridge/NativeBridge';
import { ClientInfo } from 'Core/Models/ClientInfo';
import { VastCampaign } from 'VAST/Models/VastCampaign';
import { RequestManager } from 'Core/Managers/RequestManager';
import { ICoreApi } from 'Core/ICore';
import { DeviceInfo } from 'Core/Models/DeviceInfo';

[Platform.ANDROID, Platform.IOS].forEach(platform => {
    describe(`${platform} AdmobOpenMeasurementManager`, () => {
        const sandbox = sinon.createSandbox();
        let placement: Placement;
        let backend: Backend;
        let nativeBridge: NativeBridge;
        let core: ICoreApi;
        let clientInformation: ClientInfo;
        let campaign: AdMobCampaign;
        let deviceInfo: DeviceInfo;
        let request: RequestManager;

        const init = () => {
            placement = TestFixtures.getPlacement();

            const openMeasurement: OpenMeasurement = sandbox.createStubInstance(OpenMeasurement);
            return new AdmobOpenMeasurementManager(platform, core, clientInformation, campaign, placement, deviceInfo, request);
        };

        describe('DOM Hierarchy', () => {
            describe('addToViewHierarchy', () => {
                //
            });
            describe('removeFromViewHieararchy', () => {
                //
            });
            describe('injectVerifications', () => {
                //
            });
        });
        describe('adEvents', () => {
            describe('impression', () => {
                //
            });
            describe('loaded', () => {
                //
            });
            describe('start', () => {
                //
            });
            describe('playerStateChanged', () => {
                //
            });
            describe('sendFirstQuartile', () => {
                //
            });
            describe('sendMidpoint', () => {
                //
            });
            describe('sendThirdQuartile', () => {
                //
            });
            describe('completed', () => {
                //
            });
            describe('pause', () => {
                //
            });
            describe('resume', () => {
                //
            });
            describe('skipped', () => {
                //
            });
            describe('volumeChange', () => {
                //
            });
            describe('adUserInteraction', () => {
                //
            });
            describe('bufferStart', () => {
                //
            });
            describe('bufferFinish', () => {
                //
            });
            describe('geometryChange', () => {
                //
            });
        });
        describe('session events', () => {
            describe('sessionStart', () => {
                //
            });
            describe('sessionFinish', () => {
                //
            });
        });
    });
});
