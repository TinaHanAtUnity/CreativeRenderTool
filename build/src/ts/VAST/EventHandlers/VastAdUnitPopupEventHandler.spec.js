import { VastAdUnitPopupEventHandler } from 'VAST/EventHandlers/VastAdUnitPopupEventHandler';
import { AbstractPrivacy } from 'Ads/Views/__mocks__/AbstractPrivacy';
import { Orientation } from 'Ads/AdUnits/Containers/AdUnitContainer';
import { FocusManager } from 'Core/Managers/__mocks__/FocusManager';
import { AdUnitContainer } from 'Ads/AdUnits/Containers/__mocks__/AdUnitContainer';
import { DeviceInfo } from 'Core/Models/__mocks__/DeviceInfo';
import { ClientInfo } from 'Core/Models/__mocks__/ClientInfo';
import { ThirdPartyEventManager } from 'Ads/Managers/__mocks__/ThirdPartyEventManager';
import { OperativeEventManager } from 'Ads/Managers/__mocks__/OperativeEventManager';
import { Placement } from 'Ads/Models/__mocks__/Placement';
import { Platform } from 'Core/Constants/Platform';
import { Core } from 'Core/__mocks__/Core';
import { Ads } from 'Ads/__mocks__/Ads';
import { Store } from 'Store/__mocks__/Store';
import { CoreConfiguration } from 'Core/Models/__mocks__/CoreConfiguration';
import { AdsConfiguration } from 'Ads/Models/__mocks__/AdsConfiguration';
import { RequestManager } from 'Core/Managers/__mocks__/RequestManager';
import { UserPrivacyManager } from 'Ads/Managers/__mocks__/UserPrivacyManager';
import { PrivacySDK } from 'Privacy/__mocks__/PrivacySDK';
import { Video } from 'Ads/Models/Assets/__mocks__/Video';
import { AbstractVideoOverlay } from 'Ads/Views/__mocks__/AbstractVideoOverlay';
import { VastAdUnit } from 'VAST/AdUnits/__mocks__/VastAdUnit';
import { VastCampaign } from 'VAST/Models/__mocks__/VastCampaign';
import { VastOpenMeasurementController } from 'Ads/Views/OpenMeasurement/__mocks__/VastOpenMeasurementController';
import { OpenMeasurementAdViewBuilder } from 'Ads/Views/OpenMeasurement/__mocks__/OpenMeasurementAdViewBuilder';
import { ObstructionReasons } from 'Ads/Views/OpenMeasurement/OpenMeasurementDataTypes';
import { OpenMeasurementUtilities } from 'Ads/Views/OpenMeasurement/OpenMeasurementUtilities';
describe('VastAdUnitPopupEventHandler', () => {
    let vastAdUnitPopupEventHandler;
    let baseParams;
    let adUnit;
    let vastOMController;
    let oMAdViewBuilder;
    let testRectangle;
    const testViewPort = { height: 10, width: 10 };
    beforeEach(() => {
        oMAdViewBuilder = new OpenMeasurementAdViewBuilder();
        oMAdViewBuilder.getViewPort = jest.fn().mockReturnValue(testViewPort);
        vastOMController = new VastOpenMeasurementController();
        vastOMController.getOMAdViewBuilder = jest.fn().mockReturnValue(oMAdViewBuilder);
        vastOMController.geometryChange = jest.fn();
        baseParams = {
            forceOrientation: Orientation.LANDSCAPE,
            focusManager: new FocusManager(),
            container: new AdUnitContainer(),
            deviceInfo: new DeviceInfo(),
            clientInfo: new ClientInfo(),
            thirdPartyEventManager: new ThirdPartyEventManager(),
            operativeEventManager: new OperativeEventManager(),
            placement: new Placement(),
            campaign: new VastCampaign(),
            platform: Platform.TEST,
            core: new Core().Api,
            ads: new Ads().Api,
            store: new Store().Api,
            coreConfig: new CoreConfiguration(),
            adsConfig: new AdsConfiguration(),
            request: new RequestManager(),
            options: undefined,
            privacyManager: new UserPrivacyManager(),
            gameSessionId: 0,
            privacy: new AbstractPrivacy(),
            privacySDK: new PrivacySDK(),
            video: new Video(),
            overlay: new AbstractVideoOverlay(),
            om: vastOMController
        };
        testRectangle = OpenMeasurementUtilities.createRectangle(20, 20, 100, 200);
        OpenMeasurementUtilities.createRectangle = jest.fn().mockReturnValue(testRectangle);
        adUnit = new VastAdUnit();
        vastAdUnitPopupEventHandler = new VastAdUnitPopupEventHandler(adUnit, baseParams);
    });
    describe('when calling onPopupClosed', () => {
        beforeEach(() => {
            oMAdViewBuilder.buildVastAdView = jest.fn().mockReturnValue({});
            vastAdUnitPopupEventHandler.onPopupClosed();
        });
        it('should build VAST ad view', () => {
            expect(oMAdViewBuilder.buildVastAdView).toHaveBeenCalledWith([]);
        });
        it('should call geometryChange', () => {
            expect(vastOMController.geometryChange).toHaveBeenCalledWith(testViewPort, {});
        });
    });
    describe('when calling onPopupVisible', () => {
        beforeEach(() => {
            oMAdViewBuilder.buildVastAdView = jest.fn().mockReturnValue({});
            const testElement = document.createElement('div');
            document.querySelector = jest.fn().mockReturnValue(testElement);
            vastAdUnitPopupEventHandler.onPopupVisible();
        });
        it('should build VAST ad view', () => {
            expect(oMAdViewBuilder.buildVastAdView).toHaveBeenCalledWith([ObstructionReasons.OBSTRUCTED], testRectangle);
        });
        it('should call geometryChange', () => {
            expect(vastOMController.geometryChange).toHaveBeenCalledWith(testViewPort, {});
        });
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVmFzdEFkVW5pdFBvcHVwRXZlbnRIYW5kbGVyLnNwZWMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9zcmMvdHMvVkFTVC9FdmVudEhhbmRsZXJzL1Zhc3RBZFVuaXRQb3B1cEV2ZW50SGFuZGxlci5zcGVjLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBRSwyQkFBMkIsRUFBRSxNQUFNLGdEQUFnRCxDQUFDO0FBQzdGLE9BQU8sRUFBRSxlQUFlLEVBQUUsTUFBTSxxQ0FBcUMsQ0FBQztBQUN0RSxPQUFPLEVBQUUsV0FBVyxFQUFFLE1BQU0sd0NBQXdDLENBQUM7QUFDckUsT0FBTyxFQUFFLFlBQVksRUFBRSxNQUFNLHNDQUFzQyxDQUFDO0FBQ3BFLE9BQU8sRUFBRSxlQUFlLEVBQUUsTUFBTSxrREFBa0QsQ0FBQztBQUNuRixPQUFPLEVBQUUsVUFBVSxFQUFFLE1BQU0sa0NBQWtDLENBQUM7QUFDOUQsT0FBTyxFQUFFLFVBQVUsRUFBRSxNQUFNLGtDQUFrQyxDQUFDO0FBQzlELE9BQU8sRUFBRSxzQkFBc0IsRUFBRSxNQUFNLCtDQUErQyxDQUFDO0FBQ3ZGLE9BQU8sRUFBRSxxQkFBcUIsRUFBRSxNQUFNLDhDQUE4QyxDQUFDO0FBQ3JGLE9BQU8sRUFBRSxTQUFTLEVBQUUsTUFBTSxnQ0FBZ0MsQ0FBQztBQUMzRCxPQUFPLEVBQUUsUUFBUSxFQUFFLE1BQU0seUJBQXlCLENBQUM7QUFDbkQsT0FBTyxFQUFFLElBQUksRUFBRSxNQUFNLHFCQUFxQixDQUFDO0FBQzNDLE9BQU8sRUFBRSxHQUFHLEVBQUUsTUFBTSxtQkFBbUIsQ0FBQztBQUN4QyxPQUFPLEVBQUUsS0FBSyxFQUFFLE1BQU0sdUJBQXVCLENBQUM7QUFDOUMsT0FBTyxFQUFFLGlCQUFpQixFQUFFLE1BQU0seUNBQXlDLENBQUM7QUFDNUUsT0FBTyxFQUFFLGdCQUFnQixFQUFFLE1BQU0sdUNBQXVDLENBQUM7QUFDekUsT0FBTyxFQUFF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