import { Platform } from 'Core/Constants/Platform';
import { PerPlacementLoadManagerV5 } from 'Ads/Managers/PerPlacementLoadManagerV5';
import { IAdsApi } from 'Ads/IAds';
import { AdsConfigurationMock, AdsConfiguration } from 'Ads/Models/__mocks__/AdsConfiguration';
import { CoreConfigurationMock, CoreConfiguration } from 'Core/Models/__mocks__/CoreConfiguration';
import { FocusManagerMock, FocusManager } from 'Core/Managers/__mocks__/FocusManager';
import { ClientInfoMock, ClientInfo } from 'Core/Models/__mocks__/ClientInfo';
import { AdRequestManagerMock, AdRequestManager } from 'Ads/Managers/__mocks__/AdRequestManager';
import { Ads } from 'Ads/__mocks__/Ads';
import { Placement, PlacementMock } from 'Ads/Models/__mocks__/Placement';
import { PlacementState } from 'Ads/Models/Placement';
import { Campaign, CampaignMock } from 'Ads/Models/__mocks__/Campaign';
import { AbstractAdUnitMock, AbstractAdUnit } from 'Ads/AdUnits/__mocks__/AbstractAdUnit';
import { ObservableMock } from 'Core/Utilities/__mocks__/Observable';

[Platform.IOS, Platform.ANDROID].forEach((platform) => {
    describe(`PerPlacementLoadManagerV5(${Platform[platform]})`, () => {
        let adsApi: IAdsApi;
        let adsConfiguration: AdsConfigurationMock;
        let coreConfiguration: CoreConfigurationMock;
        let adRequestManager: AdRequestManagerMock;
        let clientInfo: ClientInfoMock;
        let focusManager: FocusManagerMock;
        let refreshManager: PerPlacementLoadManagerV5;

        beforeEach(async () => {
            adsApi = Ads().Api;
            adsConfiguration = AdsConfiguration();
            coreConfiguration = CoreConfiguration();
            adRequestManager = AdRequestManager();
            clientInfo = ClientInfo();
            focusManager = FocusManager();

            refreshManager = new PerPlacementLoadManagerV5(adsApi, adsConfiguration, coreConfiguration, adRequestManager, clientInfo, focusManager);
        });

        describe('initialization', () => {
            beforeEach(() => {
                return refreshManager.initialize();
            });

            it('should make preload request', () => {
                expect(adRequestManager.requestPreload).toBeCalledTimes(1);
            });
        });

        describe('refresh expired placements', () => {
            let placements: {[key: string]: PlacementMock};

            beforeEach(() => {
                const expiredCampaign = Campaign();
                expiredCampaign.isExpired.mockReturnValue(true);

                const readyCampaign = Campaign();

                placements = {
                    'video_1': Placement('video_1', PlacementState.READY, expiredCampaign),
                    'video_2': Placement('video_2', PlacementState.NOT_AVAILABLE, expiredCampaign),
                    'video_3': Placement('video_3', PlacementState.NO_FILL, expiredCampaign),
                    'video_4': Placement('video_4', PlacementState.WAITING, expiredCampaign),
                    'video_5': Placement('video_5', PlacementState.DISABLED, expiredCampaign),
                    'video_6': Placement('video_6', PlacementState.READY, readyCampaign)
                };

                adsConfiguration.getPlacementIds.mockReturnValue(['video_1', 'video_2', 'video_3', 'video_4', 'video_5', 'video_6']);
                adsConfiguration.getPlacement.mockImplementation((x) => placements[x]);

                return refreshManager.refresh();
            });

            it('should send update', () => {
                expect(adsApi.Listener.sendPlacementStateChangedEvent).toBeCalledTimes(1);
                expect(adsApi.Listener.sendPlacementStateChangedEvent).toBeCalledWith('video_1', 'READY', 'NOT_AVAILABLE');
            });

            it('should set campaign to undefined', () => {
                expect(placements.video_1.setCurrentCampaign).toBeCalledTimes(1);
                expect(placements.video_1.setCurrentCampaign).toBeCalledWith(undefined);
            });
        });

        describe('refresh after start: with timeout', () => {
            let adUnit: AbstractAdUnitMock;
            let placements: {[key: string]: PlacementMock};

            beforeEach(() => {
                jest.useFakeTimers();

                adUnit = AbstractAdUnit();

                placements = {
                    'video_1': Placement('video_1', PlacementState.READY),
                    'video_2': Placement('video_2', PlacementState.NOT_AVAILABLE),
                    'video_3': Placement('video_3', PlacementState.NO_FILL),
                    'video_4': Placement('video_4', PlacementState.DISABLED),
                    'video_5': Placement('video_5', PlacementState.WAITING),
                    'video_6': Placement('video_6', PlacementState.READY)
                };

                adsConfiguration.getPlacementIds.mockReturnValue(['video_1', 'video_2', 'video_3', 'video_4', 'video_5', 'video_6']);
                adsConfiguration.getPlacement.mockImplementation((x) => placements[x]);

                refreshManager.setCurrentAdUnit(adUnit, placements.video_1);

                adUnit.onStartProcessed.subscribe.mock.calls[0][0]();

                jest.advanceTimersByTime(6000);
            });

            it('should make reload request', () => {
                expect(adRequestManager.requestReload).toBeCalledTimes(1);
                expect(adRequestManager.requestReload).toBeCalledWith(['video_5', 'video_6']);
            });

            it('should set invalidation pending for placements', () => {
                expect(placements['video_5'].setInvalidationPending).toBeCalledTimes(1);
                expect(placements['video_5'].setInvalidationPending).toHaveBeenNthCalledWith(1, true);

                expect(placements['video_6'].setInvalidationPending).toBeCalledTimes(1);
                expect(placements['video_6'].setInvalidationPending).toHaveBeenNthCalledWith(1, true);
            });
        });

        describe('refresh after start: on close', () => {
            let adUnit: AbstractAdUnitMock;
            let placements: {[key: string]: PlacementMock};

            beforeEach(() => {
                adUnit = AbstractAdUnit();

                placements = {
                    'video_1': Placement('video_1', PlacementState.READY),
                    'video_2': Placement('video_2', PlacementState.NOT_AVAILABLE),
                    'video_3': Placement('video_3', PlacementState.NO_FILL),
                    'video_4': Placement('video_4', PlacementState.DISABLED),
                    'video_5': Placement('video_5', PlacementState.WAITING),
                    'video_6': Placement('video_6', PlacementState.READY)
                };

                adsConfiguration.getPlacementIds.mockReturnValue(['video_1', 'video_2', 'video_3', 'video_4', 'video_5', 'video_6']);
                adsConfiguration.getPlacement.mockImplementation((x) => placements[x]);

                refreshManager.setCurrentAdUnit(adUnit, placements.video_1);

                adUnit.onClose.subscribe.mock.calls[0][0]();
            });

            it('should make reload request', () => {
                expect(adRequestManager.requestReload).toBeCalledTimes(1);
                expect(adRequestManager.requestReload).toBeCalledWith(['video_5', 'video_6']);
            });

            it('should set invalidation pending for placements', () => {
                expect(placements['video_5'].setInvalidationPending).toBeCalledTimes(1);
                expect(placements['video_5'].setInvalidationPending).toHaveBeenNthCalledWith(1, true);

                expect(placements['video_6'].setInvalidationPending).toBeCalledTimes(1);
                expect(placements['video_6'].setInvalidationPending).toHaveBeenNthCalledWith(1, true);
            });
        });

        describe('refresh after start: on finish', () => {
            let adUnit: AbstractAdUnitMock;
            let placements: {[key: string]: PlacementMock};

            beforeEach(() => {
                adUnit = AbstractAdUnit();

                placements = {
                    'video_1': Placement('video_1', PlacementState.READY),
                    'video_2': Placement('video_2', PlacementState.NOT_AVAILABLE),
                    'video_3': Placement('video_3', PlacementState.NO_FILL),
                    'video_4': Placement('video_4', PlacementState.DISABLED),
                    'video_5': Placement('video_5', PlacementState.WAITING),
                    'video_6': Placement('video_6', PlacementState.READY)
                };

                adsConfiguration.getPlacementIds.mockReturnValue(['video_1', 'video_2', 'video_3', 'video_4', 'video_5', 'video_6']);
                adsConfiguration.getPlacement.mockImplementation((x) => placements[x]);

                refreshManager.setCurrentAdUnit(adUnit, placements.video_1);

                adUnit.onFinish.subscribe.mock.calls[0][0]();
            });

            it('should make reload request', () => {
                expect(adRequestManager.requestReload).toBeCalledTimes(1);
                expect(adRequestManager.requestReload).toBeCalledWith(['video_5', 'video_6']);
            });

            it('should set invalidation pending for placements', () => {
                expect(placements['video_5'].setInvalidationPending).toBeCalledTimes(1);
                expect(placements['video_5'].setInvalidationPending).toHaveBeenNthCalledWith(1, true);

                expect(placements['video_6'].setInvalidationPending).toBeCalledTimes(1);
                expect(placements['video_6'].setInvalidationPending).toHaveBeenNthCalledWith(1, true);
            });
        });

        describe('trigger on no fill', () => {
            let placement: PlacementMock;

            beforeEach(async () => {
                placement = Placement();

                adsConfiguration.getPlacement.mockReturnValue(placement);

                await refreshManager.initialize();

                adRequestManager.onNoFill.subscribe.mock.calls[0][0]('video');
            });

            it('should reset campaign', () => {
                expect(placement.setCurrentCampaign).toBeCalledTimes(1);
                expect(placement.setCurrentCampaign).toBeCalledWith(undefined);
            });

            it('should reset tracking urls', () => {
                expect(placement.setCurrentTrackingUrls).toBeCalledTimes(1);
                expect(placement.setCurrentTrackingUrls).toBeCalledWith(undefined);
            });

            it('should reset invalidation pending', () => {
                expect(placement.setInvalidationPending).toBeCalledTimes(1);
                expect(placement.setInvalidationPending).toHaveBeenNthCalledWith(1, false);
            });
        });

        describe('trigger on campaign', () => {
            let placement: PlacementMock;
            let campaign: CampaignMock;

            beforeEach(async () => {
                placement = Placement();
                campaign = Campaign();

                adsConfiguration.getPlacement.mockReturnValue(placement);

                await refreshManager.initialize();

                adRequestManager.onCampaign.subscribe.mock.calls[0][0]('video', campaign, {});
            });

            it('should reset campaign', () => {
                expect(placement.setCurrentCampaign).toBeCalledTimes(1);
                expect(placement.setCurrentCampaign).toBeCalledWith(campaign);
            });

            it('should reset tracking urls', () => {
                expect(placement.setCurrentTrackingUrls).toBeCalledTimes(1);
                expect(placement.setCurrentTrackingUrls).toBeCalledWith({});
            });

            it('should reset invalidation pending', () => {
                expect(placement.setInvalidationPending).toBeCalledTimes(1);
                expect(placement.setInvalidationPending).toHaveBeenNthCalledWith(1, false);
            });
        });

        describe('load placement', () => {
            let placement: PlacementMock;
            let campaign: CampaignMock;

            beforeEach(async () => {
                placement = Placement();
                campaign = Campaign();

                placement.setState(PlacementState.NOT_AVAILABLE);

                adsConfiguration.getPlacement.mockReturnValue(placement);

                adRequestManager.hasPreloadFailed.mockReturnValue(false);
                adRequestManager.loadCampaign.mockResolvedValue({
                    campaign: campaign,
                    trackingUrls: {}
                });

                (<ObservableMock>adsApi.LoadApi.onLoad).subscribe.mock.calls[0][0]({ 'video': 1 });
            });

            it('should call loadCampaign', () => {
                expect(adRequestManager.loadCampaign).toBeCalledTimes(1);
                expect(adRequestManager.loadCampaign).toBeCalledWith(placement);
            });

            it('should not call requestPreload', () => {
                expect(adRequestManager.requestPreload).toBeCalledTimes(0);
            });

            it('should set state to no fill', () => {
                expect(adsApi.Listener.sendPlacementStateChangedEvent).toBeCalledTimes(2);
                expect(adsApi.Listener.sendPlacementStateChangedEvent).toBeCalledWith('video', 'NOT_AVAILABLE', 'WAITING');
                expect(adsApi.Listener.sendPlacementStateChangedEvent).toBeCalledWith('video', 'WAITING', 'READY');
            });
        });

        describe('load placement when no preload data', () => {
            let placement: PlacementMock;
            let campaign: CampaignMock;

            beforeEach(async () => {
                placement = Placement();
                campaign = Campaign();

                placement.setState(PlacementState.NOT_AVAILABLE);

                adsConfiguration.getPlacement.mockReturnValue(placement);

                adRequestManager.hasPreloadFailed.mockReturnValue(true);
                adRequestManager.loadCampaign.mockResolvedValue({
                    campaign: campaign,
                    trackingUrls: {}
                });

                (<ObservableMock>adsApi.LoadApi.onLoad).subscribe.mock.calls[0][0]({ 'video': 1 });
            });

            it('should call loadCampaign', () => {
                expect(adRequestManager.loadCampaign).toBeCalledTimes(1);
                expect(adRequestManager.loadCampaign).toBeCalledWith(placement);
            });

            it('should not call requestPreload', () => {
                expect(adRequestManager.requestPreload).toBeCalledTimes(1);
            });

            it('should set state to no fill', () => {
                expect(adsApi.Listener.sendPlacementStateChangedEvent).toBeCalledTimes(2);
                expect(adsApi.Listener.sendPlacementStateChangedEvent).toBeCalledWith('video', 'NOT_AVAILABLE', 'WAITING');
                expect(adsApi.Listener.sendPlacementStateChangedEvent).toBeCalledWith('video', 'WAITING', 'READY');
            });
        });

        describe('load placement when no preload data and preload fails', () => {
            let placement: PlacementMock;
            let campaign: CampaignMock;

            beforeEach(async () => {
                placement = Placement();
                campaign = Campaign();

                placement.setState(PlacementState.NOT_AVAILABLE);

                adsConfiguration.getPlacement.mockReturnValue(placement);

                adRequestManager.hasPreloadFailed.mockReturnValue(true);
                adRequestManager.requestPreload.mockRejectedValue(new Error());
                adRequestManager.loadCampaign.mockResolvedValue({
                    campaign: campaign,
                    trackingUrls: {}
                });

                (<ObservableMock>adsApi.LoadApi.onLoad).subscribe.mock.calls[0][0]({ 'video': 1 });
            });

            it('should call loadCampaign', () => {
                expect(adRequestManager.loadCampaign).toBeCalledTimes(0);
            });

            it('should not call requestPreload', () => {
                expect(adRequestManager.requestPreload).toBeCalledTimes(1);
            });

            it('should set state to no fill', () => {
                expect(adsApi.Listener.sendPlacementStateChangedEvent).toBeCalledTimes(2);
                expect(adsApi.Listener.sendPlacementStateChangedEvent).toBeCalledWith('video', 'NOT_AVAILABLE', 'WAITING');
                expect(adsApi.Listener.sendPlacementStateChangedEvent).toBeCalledWith('video', 'WAITING', 'NO_FILL');
            });
        });
    });
});