import { VastOpenMeasurementSetup } from 'Ads/Views/OpenMeasurement/VastOpenMeasurementSetup';
import { ThirdPartyEventManager, ThirdPartyEventManagerMock } from 'Ads/Managers/__mocks__/ThirdPartyEventManager';
import { VastCampaign, VastCampaignMock } from 'VAST/Models/__mocks__/VastCampaign';
import { DeviceInfo, DeviceInfoMock } from 'Core/Models/__mocks__/DeviceInfo';
import { Platform } from 'Core/Constants/Platform';
import { ClientInfo, ClientInfoMock } from 'Core/Models/__mocks__/ClientInfo';
import { Placement, PlacementMock } from 'Ads/Models/__mocks__/Placement';
import { VastAdVerificationMock, VastAdVerification } from 'VAST/Models/__mocks__/VastAdVerification';
import { VastVerificationResource } from 'VAST/Models/VastVerificationResource';
import { Vast } from 'VAST/Models/__mocks__/Vast';

describe(`VastOpenMeasurementSetup`, () => {
    let omSetup: VastOpenMeasurementSetup;
    let adVerifications: VastAdVerificationMock[];
    let campaign: VastCampaignMock;
    let deviceInfo: DeviceInfoMock;
    let platform: Platform;
    let clientInfo: ClientInfoMock;
    let placement: PlacementMock;

    beforeEach(() => {
        campaign = new VastCampaign();
        deviceInfo = new DeviceInfo();
        platform = Platform.TEST;
        clientInfo = new ClientInfo();
        placement = new Placement();

        const verificationResource = new VastVerificationResource('https://scootmcdoot.com', 'omid');
        const verification = new VastAdVerification();
        verification.getVerificationVendor.mockReturnValue('IAS');
        verification.getVerficationResources.mockReturnValue([verificationResource]);
        adVerifications = [verification];

        omSetup = new VastOpenMeasurementSetup(adVerifications, campaign, deviceInfo, platform, clientInfo, placement);
    });

    describe('setting up OM tracking', () => {
        let thirdPartyEventManager: ThirdPartyEventManagerMock;

        beforeEach(() => {
            thirdPartyEventManager = new ThirdPartyEventManager();
            const vastModel = new Vast();
            vastModel.isPublicaTag.mockReturnValue(true);
            campaign.getVast.mockReturnValue(vastModel);

            // unique not on array prototype
            Array.prototype.unique = function () {
                // tslint:disable-next-line
                return this.filter((val, index) => this.indexOf(val) === index);
            };
        });

        afterEach(() => {
            jest.restoreAllMocks();
        });

        it('should set third party template values', () => {
            omSetup.setOMVendorTracking(thirdPartyEventManager);
            expect(thirdPartyEventManager.setTemplateValue).toBeCalledTimes(2);
            expect(thirdPartyEventManager.setTemplateValue).toBeCalledWith('%25OM_ENABLED%25', 'true');
            expect(thirdPartyEventManager.setTemplateValue).toBeCalledWith('%25OM_VENDORS%25', 'IAS|publica');
        });

        it('should set om vendors on the campaign', () => {
            omSetup.setOMVendorTracking(thirdPartyEventManager);
            expect(campaign.setOmEnabled).toBeCalledWith(true);
            expect(campaign.setOMVendors).toBeCalledWith(['IAS', 'publica']);
        });
    });
});
