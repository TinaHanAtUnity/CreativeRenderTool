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
import { VastAdUnit, VastAdUnitMock } from 'VAST/AdUnits/__mocks__/VastAdUnit';
import { VastCampaign } from 'VAST/Models/__mocks__/VastCampaign';
import { IVastAdUnitParameters } from 'VAST/AdUnits/VastAdUnit';
import {
    VastOpenMeasurementController,
    VastOpenMeasurementControllerMock
} from 'Ads/Views/OpenMeasurement/__mocks__/VastOpenMeasurementController';
import {
    OpenMeasurementAdViewBuilder,
    OpenMeasurementAdViewBuilderMock
} from 'Ads/Views/OpenMeasurement/__mocks__/OpenMeasurementAdViewBuilder';
import { IRectangle, ObstructionReasons } from 'Ads/Views/OpenMeasurement/OpenMeasurementDataTypes';
import { OpenMeasurementUtilities } from 'Ads/Views/OpenMeasurement/OpenMeasurementUtilities';

describe('VastAdUnitPopupEventHandler', () => {

    let vastAdUnitPopupEventHandler: VastAdUnitPopupEventHandler;
    let baseParams: IVastAdUnitParameters;
    let adUnit: VastAdUnitMock;
    let vastOMController: VastOpenMeasurementControllerMock;
    let oMAdViewBuilder: OpenMeasurementAdViewBuilderMock;
    let testRectangle: IRectangle;
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
