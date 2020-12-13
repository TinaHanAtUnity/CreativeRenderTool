import * as tslib_1 from "tslib";
import { Platform } from 'Core/Constants/Platform';
import { PerPlacementLoadManagerV5 } from 'Ads/Managers/PerPlacementLoadManagerV5';
import { AdsConfiguration } from 'Ads/Models/__mocks__/AdsConfiguration';
import { CoreConfiguration } from 'Core/Models/__mocks__/CoreConfiguration';
import { FocusManager } from 'Core/Managers/__mocks__/FocusManager';
import { ClientInfo } from 'Core/Models/__mocks__/ClientInfo';
import { AdRequestManager } from 'Ads/Managers/__mocks__/AdRequestManager';
import { Ads } from 'Ads/__mocks__/Ads';
import { Placement, withGroupId } from 'Ads/Models/__mocks__/Placement';
import { PlacementState } from 'Ads/Models/Placement';
import { Campaign } from 'Ads/Models/__mocks__/Campaign';
import { AbstractAdUnit } from 'Ads/AdUnits/__mocks__/AbstractAdUnit';
import { PerformanceAdUnitFactory } from 'Performance/AdUnits/PerformanceAdUnitFactory';
import { ProgrammaticMraidParser } from 'MRAID/Parsers/ProgrammaticMraidParser';
import { LoadAndFillEventManager } from 'Ads/Managers/__mocks__/LoadAndFillEventManager';
[Platform.IOS, Platform.ANDROID].forEach((platform) => {
    describe(`PerPlacementLoadManagerV5(${Platform[platform]})`, () => {
        let adsApi;
        let adsConfiguration;
        let coreConfiguration;
        let adRequestManager;
        let clientInfo;
        let focusManager;
        let loadAndFillEventManager;
        let refreshManager;
        beforeEach(() => tslib_1.__awaiter(this, void 0, void 0, function* () {
            adsApi = Ads().Api;
            adsConfiguration = AdsConfiguration();
            coreConfiguration = CoreConfiguration();
            adRequestManager = AdRequestManager();
            clientInfo = ClientInfo();
            focusManager = FocusManager();
            loadAndFillEventManager = LoadAndFillEventManager();
            refreshManager = new PerPlacementLoadManagerV5(adsApi, adsConfiguration, coreConfiguration, adRequestManager, clientInfo, focusManager, false, loadAndFillEventManager);
        }));
        describe('initialization', () => {
            beforeEach(() => {
                return refreshManager.initialize();
            });
            it('should make preload request', () => {
                expect(adRequestManager.requestPreload).toBeCalledTimes(1);
            });
        });
        describe('refresh expired placements', () => {
            let placements;
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
            ['video_2', 'video_3', 'video_4', 'video_5', 'video_6'].forEach(placement => {
                it(`should not set campaign to undefined ${placement}`, () => {
                    expect(placements[placement].setCurrentCampaign).not.toBeCalled();
                });
            });
        });
        describe('refresh expired placements when preload expired', () => {
            const expectedReloadPlacements = ['video_1', 'video_4', 'video_6'];
            let placements;
            beforeEach(() => {
                const expiredCampaign = Campaign();
                expiredCampaign.isExpired.mockReturnValue(true);
                const readyCampaign = Campaign();
                placements = {
                    'video_1': Placement('video_1', PlacementState.READY, expiredCampaign),
                    'video_2': Placement('video_2', PlacementState.NOT_AVAILABLE, expiredCampaign),
                    'video_3': Placement('video_3', PlacementState.NO_FILL, readyCampaign),
                    'video_4': Placement('video_4', PlacementState.WAITING, expiredCampaign),
                    'video_5': Placement('video_5', PlacementState.DISABLED, expiredCampaign),
                    'video_6': Placement('video_6', PlacementState.READY, readyCampaign)
                };
                adsConfiguration.getPlacementIds.mockReturnValue(['video_1', 'video_2', 'video_3', 'video_4', 'video_5', 'video_6']);
                adsConfiguration.getPlacement.mockImplementation((x) => placements[x]);
                adRequestManager.isPreloadDataExpired.mockReturnValue(true);
                return refreshManager.refresh();
            });
            it('should call requestReload', () => {
                expect(adRequestManager.requestReload).toBeCalledTimes(1);
                expect(adRequestManager.requestReload).toBeCalledWith(expectedReloadPlacements);
            });
            expectedReloadPlacements.forEach(placement => {
                it(`should set invalidation state for ${placement}`, () => {
                    expect(placements[placement].setInvalidationPending).toBeCalledTimes(1);
                    expect(placements[placement].setInvalidationPending).toBeCalledWith(true);
                });
            });
            expectedReloadPlacements.forEach(placement => {
                it(`should not set campaign to undefined in ${placement}`, () => {
                    expect(placements.video_1.setCurrentCampaign).not.toBeCalled();
                });
            });
            expectedReloadPlacements.forEach(placement => {
                it(`should not send update ${placement}`, () => {
                    expect(adsApi.Listener.sendPlacementStateChangedEvent).not.toBeCalled();
                });
            });
            ['video_2', 'video_3', 'video_5'].forEach(placement => {
                it(`should not set invalidation state for ${placement}`, () => {
                    expect(placements[placement].setInvalidationPending).not.toBeCalled();
                });
            });
        });
        describe('refresh after start: with timeout', () => {
            let adUnit;
            let placements;
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
                expect(placements.video_5.setInvalidationPending).toBeCalledTimes(1);
                expect(placements.video_5.setInvalidationPending).toHaveBeenNthCalledWith(1, true);
                expect(placements.video_6.setInvalidationPending).toBeCalledTimes(1);
                expect(placements.video_6.setInvalidationPending).toHaveBeenNthCalledWith(1, true);
            });
        });
        describe('refresh after start: on close', () => {
            let adUnit;
            let placements;
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
                expect(placements.video_5.setInvalidationPending).toBeCalledTimes(1);
                expect(placements.video_5.setInvalidationPending).toHaveBeenNthCalledWith(1, true);
                expect(placements.video_6.setInvalidationPending).toBeCalledTimes(1);
                expect(placements.video_6.setInvalidationPending).toHaveBeenNthCalledWith(1, true);
            });
        });
        describe('refresh after start: on finish', () => {
            let adUnit;
            let placements;
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
                expect(placements.video_5.setInvalidationPending).toBeCalledTimes(1);
                expect(placements.video_5.setInvalidationPending).toHaveBeenNthCalledWith(1, true);
                expect(placements.video_6.setInvalidationPending).toBeCalledTimes(1);
                expect(placements.video_6.setInvalidationPending).toHaveBeenNthCalledWith(1, true);
            });
        });
        describe('trigger on no fill programmatic', () => {
            let placements;
            beforeEach(() => tslib_1.__awaiter(this, void 0, void 0, function* () {
                placements = {
                    'video': Placement('video', PlacementState.READY, Campaign(ProgrammaticMraidParser.ContentType, 'another')),
                    'rewardedVideo': Placement('rewardedVideo', PlacementState.READY, Campaign(ProgrammaticMraidParser.ContentType, 'shown'))
                };
                adsConfiguration.getPlacement.mockImplementation((x) => placements[x]);
                yield refreshManager.initialize();
                refreshManager.setCurrentAdUnit(AbstractAdUnit(), placements.rewardedVideo);
                adRequestManager.onNoFill.subscribe.mock.calls[0][0]('video');
            }));
            it('should reset campaign', () => {
                expect(placements.video.setCurrentCampaign).toBeCalledTimes(0);
            });
            it('should reset tracking urls', () => {
                expect(placements.video.setCurrentTrackingUrls).toBeCalledTimes(0);
            });
            it('should reset invalidation pending', () => {
                expect(placements.video.setInvalidationPending).toBeCalledTimes(1);
                expect(placements.video.setInvalidationPending).toHaveBeenNthCalledWith(1, false);
            });
        });
        describe(`trigger on no fill programmatic for same campaign`, () => {
            let placements;
            beforeEach(() => tslib_1.__awaiter(this, void 0, void 0, function* () {
                const campaign = Campaign(ProgrammaticMraidParser.ContentType, 'shown');
                placements = {
                    'video': Placement('video', PlacementState.READY, campaign),
                    'rewardedVideo': Placement('rewardedVideo', PlacementState.READY, campaign)
                };
                adsConfiguration.getPlacement.mockImplementation((x) => placements[x]);
                yield refreshManager.initialize();
                refreshManager.setCurrentAdUnit(AbstractAdUnit(), placements.rewardedVideo);
                adRequestManager.onNoFill.subscribe.mock.calls[0][0]('video');
            }));
            it('should reset campaign', () => {
                expect(placements.video.setCurrentCampaign).toBeCalledTimes(1);
            });
            it('should reset tracking urls', () => {
                expect(placements.video.setCurrentTrackingUrls).toBeCalledTimes(1);
            });
            it('should reset invalidation pending', () => {
                expect(placements.video.setInvalidationPending).toBeCalledTimes(1);
                expect(placements.video.setInvalidationPending).toHaveBeenNthCalledWith(1, false);
            });
        });
        [
            PerformanceAdUnitFactory.ContentType,
            PerformanceAdUnitFactory.ContentTypeMRAID,
            PerformanceAdUnitFactory.ContentTypeVideo
        ].forEach(contentType => {
            describe(`trigger on no fill with performance campaign with ${contentType}`, () => {
                let placement;
                beforeEach(() => tslib_1.__awaiter(this, void 0, void 0, function* () {
                    placement = Placement();
                    placement.getCurrentCampaign.mockReturnValue(Campaign(contentType));
                    adsConfiguration.getPlacement.mockReturnValue(placement);
                    yield refreshManager.initialize();
                    adRequestManager.onNoFill.subscribe.mock.calls[0][0]('video');
                }));
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
        });
        describe('trigger on campaign', () => {
            let placement;
            let campaign;
            beforeEach(() => tslib_1.__awaiter(this, void 0, void 0, function* () {
                placement = Placement();
                campaign = Campaign();
                adsConfiguration.getPlacement.mockReturnValue(placement);
                yield refreshManager.initialize();
                adRequestManager.onCampaign.subscribe.mock.calls[0][0]('video', campaign, {});
            }));
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
            let placement;
            let campaign;
            beforeEach(() => tslib_1.__awaiter(this, void 0, void 0, function* () {
                placement = Placement();
                campaign = Campaign();
                placement.setState(PlacementState.NOT_AVAILABLE);
                adsConfiguration.getPlacement.mockReturnValue(placement);
                adRequestManager.hasPreloadFailed.mockReturnValue(false);
                adRequestManager.loadCampaign.mockResolvedValue({
                    campaign: campaign,
                    trackingUrls: {}
                });
                adsApi.LoadApi.onLoad.subscribe.mock.calls[0][0]({ 'video': 1 });
            }));
            it('should call loadCampaign', () => {
                expect(adRequestManager.loadCampaign).toBeCalledTimes(1);
                expect(adRequestManager.loadCampaign).toBeCalledWith(placement);
            });
            it('should not call requestPreload', () => {
                expect(adRequestManager.requestPreload).not.toBeCalled();
            });
            it('should set state to no fill', () => {
                expect(adsApi.Listener.sendPlacementStateChangedEvent).toBeCalledTimes(2);
                expect(adsApi.Listener.sendPlacementStateChangedEvent).toBeCalledWith('video', 'NOT_AVAILABLE', 'WAITING');
                expect(adsApi.Listener.sendPlacementStateChangedEvent).toBeCalledWith('video', 'WAITING', 'READY');
            });
        });
        describe('load placement when no preload data', () => {
            let placement;
            let campaign;
            beforeEach(() => tslib_1.__awaiter(this, void 0, void 0, function* () {
                placement = Placement();
                campaign = Campaign();
                placement.setState(PlacementState.NOT_AVAILABLE);
                adsConfiguration.getPlacement.mockReturnValue(placement);
                adRequestManager.hasPreloadFailed.mockReturnValue(true);
                adRequestManager.loadCampaign.mockResolvedValue({
                    campaign: campaign,
                    trackingUrls: {}
                });
                adsApi.LoadApi.onLoad.subscribe.mock.calls[0][0]({ 'video': 1 });
            }));
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
            let placement;
            let campaign;
            beforeEach(() => tslib_1.__awaiter(this, void 0, void 0, function* () {
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
                adsApi.LoadApi.onLoad.subscribe.mock.calls[0][0]({ 'video': 1 });
            }));
            it('should call loadCampaign', () => {
                expect(adRequestManager.loadCampaign).not.toBeCalled();
            });
            it('should not call requestPreload', () => {
                expect(adRequestManager.requestPreload).toBeCalledTimes(1);
            });
            it('should set state to no fill', () => {
                expect(adsApi.Listener.sendPlacementStateChangedEvent).toBeCalledTimes(2);
                expect(adsApi.Listener.sendPlacementStateChangedEvent).toBeCalledWith('video', 'NOT_AVAILABLE', 'WAITING');
                expect(adsApi.Listener.sendPlacementStateChangedEvent).toBeCalledWith('video', 'WAITING', 'NO_FILL');
            });
            it('should send load event', () => {
                expect(loadAndFillEventManager.sendLoadTrackingEvents).toBeCalledTimes(1);
            });
            it('should send load event with correct placement ID', () => {
                expect(loadAndFillEventManager.sendLoadTrackingEvents).toBeCalledWith('video');
            });
        });
        describe('load placement with expired data', () => {
            let placements;
            let campaign;
            beforeEach(() => tslib_1.__awaiter(this, void 0, void 0, function* () {
                campaign = Campaign();
                placements = {
                    'video_1': Placement('video_1', PlacementState.READY, campaign),
                    'video_2': Placement('video_2', PlacementState.NOT_AVAILABLE),
                    'video_3': Placement('video_3', PlacementState.NO_FILL),
                    'video_4': Placement('video_4', PlacementState.DISABLED),
                    'video_5': Placement('video_5', PlacementState.WAITING),
                    'video_6': Placement('video_6', PlacementState.READY)
                };
                adsConfiguration.getPlacementIds.mockReturnValue(['video_1', 'video_2', 'video_3', 'video_4', 'video_5', 'video_6']);
                adsConfiguration.getPlacement.mockImplementation((x) => placements[x]);
                adRequestManager.isPreloadDataExpired.mockReturnValue(true);
                adRequestManager.hasPreloadFailed.mockReturnValue(false);
                adRequestManager.loadCampaign.mockResolvedValue({
                    campaign: campaign,
                    trackingUrls: {}
                });
                adsApi.LoadApi.onLoad.subscribe.mock.calls[0][0]({ 'video_2': 1 });
            }));
            it('should call loadCampaign', () => {
                expect(adRequestManager.loadCampaign).toBeCalledTimes(1);
                expect(adRequestManager.loadCampaign).toBeCalledWith(placements.video_2);
            });
            it('should call requestReload', () => {
                expect(adRequestManager.requestReload).toBeCalledTimes(1);
                expect(adRequestManager.requestReload).toBeCalledWith(['video_1', 'video_5', 'video_6']);
            });
            ['video_1', 'video_5', 'video_6'].forEach(placement => {
                it(`should set invalidation state for ${placement}`, () => {
                    expect(placements[placement].setInvalidationPending).toBeCalledTimes(1);
                    expect(placements[placement].setInvalidationPending).toBeCalledWith(true);
                });
            });
            ['video_2', 'video_3', 'video_4'].forEach(placement => {
                it(`should not set invalidation state for ${placement}`, () => {
                    expect(placements[placement].setInvalidationPending).not.toBeCalled();
                });
            });
            it('should update state loaded placement', () => {
                expect(adsApi.Listener.sendPlacementStateChangedEvent).toBeCalledTimes(2);
                expect(adsApi.Listener.sendPlacementStateChangedEvent).toBeCalledWith('video_2', 'NOT_AVAILABLE', 'WAITING');
                expect(adsApi.Listener.sendPlacementStateChangedEvent).toBeCalledWith('video_2', 'WAITING', 'READY');
            });
        });
        describe('with ad units', () => {
            beforeEach(() => {
                adsApi = Ads().Api;
                adsConfiguration = AdsConfiguration();
                coreConfiguration = CoreConfiguration();
                adRequestManager = AdRequestManager();
                clientInfo = ClientInfo();
                focusManager = FocusManager();
                refreshManager = new PerPlacementLoadManagerV5(adsApi, adsConfiguration, coreConfiguration, adRequestManager, clientInfo, focusManager, true, loadAndFillEventManager);
            });
            describe('load placement which was load as additional placements', () => {
                let placements;
                let campaign;
                beforeEach(() => tslib_1.__awaiter(this, void 0, void 0, function* () {
                    campaign = Campaign();
                    placements = {
                        'video_1': withGroupId(Placement('video_1', PlacementState.NOT_AVAILABLE, campaign), 'group_id'),
                        'video_2': withGroupId(Placement('video_2', PlacementState.NOT_AVAILABLE, campaign), 'group_id'),
                        'video_3': withGroupId(Placement('video_3', PlacementState.NOT_AVAILABLE, campaign), 'group_id')
                    };
                    adsConfiguration.getPlacementIds.mockReturnValue(['video_1', 'video_2', 'video_3', 'video_4', 'video_5', 'video_6']);
                    adsConfiguration.getPlacement.mockImplementation((x) => placements[x]);
                    adRequestManager.hasPreloadFailed.mockReturnValue(false);
                    adRequestManager.loadCampaign.mockResolvedValueOnce({
                        campaign: campaign,
                        trackingUrls: {}
                    });
                    adRequestManager.loadCampaignWithAdditionalPlacement.mockResolvedValueOnce({
                        campaign: campaign,
                        trackingUrls: {}
                    });
                    adsApi.LoadApi.onLoad.subscribe.mock.calls[0][0]({ 'video_1': 1 });
                    adRequestManager.onAdditionalPlacementsReady.subscribe.mock.calls[0][0]('group_id', {
                        'video_2': {
                            campaign: campaign,
                            trackingUrl: {}
                        },
                        'video_3': undefined
                    });
                    adsApi.LoadApi.onLoad.subscribe.mock.calls[0][0]({ 'video_2': 1 });
                    adsApi.LoadApi.onLoad.subscribe.mock.calls[0][0]({ 'video_3': 1 });
                }));
                it('should call loadCampaign', () => {
                    expect(adRequestManager.loadCampaignWithAdditionalPlacement).toBeCalledTimes(1);
                    expect(adRequestManager.loadCampaignWithAdditionalPlacement).toBeCalledWith(placements.video_1);
                });
                it('should not call requestPreload', () => {
                    expect(adRequestManager.requestPreload).not.toBeCalled();
                });
                it('should call sendPlacementStateChangedEvent expected amount of times', () => {
                    expect(adsApi.Listener.sendPlacementStateChangedEvent).toBeCalledTimes(6);
                });
                it('should set state to fill for video_1', () => {
                    expect(adsApi.Listener.sendPlacementStateChangedEvent).toBeCalledWith('video_1', 'NOT_AVAILABLE', 'WAITING');
                    expect(adsApi.Listener.sendPlacementStateChangedEvent).toBeCalledWith('video_1', 'WAITING', 'READY');
                });
                it('should set state to fill for video_2', () => {
                    expect(adsApi.Listener.sendPlacementStateChangedEvent).toBeCalledWith('video_2', 'NOT_AVAILABLE', 'WAITING');
                    expect(adsApi.Listener.sendPlacementStateChangedEvent).toBeCalledWith('video_2', 'WAITING', 'READY');
                });
                it('should set state to fill for video_3', () => {
                    expect(adsApi.Listener.sendPlacementStateChangedEvent).toBeCalledWith('video_3', 'NOT_AVAILABLE', 'WAITING');
                    expect(adsApi.Listener.sendPlacementStateChangedEvent).toBeCalledWith('video_3', 'WAITING', 'NO_FILL');
                });
            });
            describe('clean up additional campaign for ad unit: on finish', () => {
                let placements;
                let campaign1;
                let campaign2;
                let adUnit;
                beforeEach(() => tslib_1.__awaiter(this, void 0, void 0, function* () {
                    adUnit = AbstractAdUnit();
                    campaign1 = Campaign();
                    campaign2 = Campaign();
                    placements = {
                        'video_1': withGroupId(Placement('video_1', PlacementState.NOT_AVAILABLE), 'group_id'),
                        'video_2': withGroupId(Placement('video_2', PlacementState.NOT_AVAILABLE), 'group_id'),
                        'video_3': withGroupId(Placement('video_3', PlacementState.NOT_AVAILABLE), 'group_id')
                    };
                    adsConfiguration.getPlacementIds.mockReturnValue(['video_1', 'video_2', 'video_3']);
                    adsConfiguration.getPlacement.mockImplementation((x) => placements[x]);
                    adRequestManager.hasPreloadFailed.mockReturnValue(false);
                    adRequestManager.loadCampaignWithAdditionalPlacement.mockResolvedValueOnce({
                        campaign: campaign1,
                        trackingUrls: {}
                    });
                    adRequestManager.loadCampaignWithAdditionalPlacement.mockResolvedValueOnce({
                        campaign: campaign2,
                        trackingUrls: {}
                    });
                    adsApi.LoadApi.onLoad.subscribe.mock.calls[0][0]({ 'video_1': 1 });
                    adRequestManager.onAdditionalPlacementsReady.subscribe.mock.calls[0][0]('group_id', {
                        'video_2': {
                            campaign: campaign1,
                            trackingUrl: {}
                        },
                        'video_3': {
                            campaign: campaign1,
                            trackingUrl: {}
                        }
                    });
                    adsApi.LoadApi.onLoad.subscribe.mock.calls[0][0]({ 'video_3': 1 });
                    refreshManager.setCurrentAdUnit(adUnit, placements.video_1);
                    adUnit.onFinish.subscribe.mock.calls[0][0]();
                    adsApi.LoadApi.onLoad.subscribe.mock.calls[0][0]({ 'video_2': 1 });
                }));
                it('should call loadCampaign', () => {
                    expect(adRequestManager.loadCampaignWithAdditionalPlacement).toBeCalledTimes(2);
                    expect(adRequestManager.loadCampaignWithAdditionalPlacement).toBeCalledWith(placements.video_1);
                    expect(adRequestManager.loadCampaignWithAdditionalPlacement).toBeCalledWith(placements.video_2);
                });
                it('should make reload request', () => {
                    expect(adRequestManager.requestReload).toBeCalledTimes(1);
                    expect(adRequestManager.requestReload).toBeCalledWith(['video_3']);
                });
                it('should have correct campaign in placement video_2', () => {
                    expect(placements.video_2.setCurrentCampaign).toBeCalledWith(campaign2);
                });
            });
            describe('invalidate programmatic campaigns', () => {
                let placement;
                beforeEach(() => tslib_1.__awaiter(this, void 0, void 0, function* () {
                    placement = Placement();
                    placement.getCurrentCampaign.mockReturnValue(Campaign(ProgrammaticMraidParser.ContentType));
                    adsConfiguration.getPlacement.mockReturnValue(placement);
                    yield refreshManager.initialize();
                    adRequestManager.onNoFill.subscribe.mock.calls[0][0]('video');
                }));
                it('should reset campaign', () => {
                    expect(placement.setCurrentCampaign).toBeCalledTimes(0);
                });
                it('should reset tracking urls', () => {
                    expect(placement.setCurrentTrackingUrls).toBeCalledTimes(0);
                });
                it('should reset invalidation pending', () => {
                    expect(placement.setInvalidationPending).toBeCalledTimes(1);
                    expect(placement.setInvalidationPending).toHaveBeenNthCalledWith(1, false);
                });
            });
        });
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUGVyUGxhY2VtZW50TG9hZE1hbmFnZXJWNS5zcGVjLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vc3JjL3RzL0Fkcy9NYW5hZ2Vycy9QZXJQbGFjZW1lbnRMb2FkTWFuYWdlclY1LnNwZWMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBLE9BQU8sRUFBRSxRQUFRLEVBQUUsTUFBTSx5QkFBeUIsQ0FBQztBQUNuRCxPQUFPLEVBQUUseUJBQXlCLEVBQUUsTUFBTSx3Q0FBd0MsQ0FBQztBQUVuRixPQUFPLEVBQXdCLGdCQUFnQixFQUFFLE1BQU0sdUNBQXVDLENBQUM7QUFDL0YsT0FBTyxFQUF5QixpQkFBaUIsRUFBRSxNQUFNLHlDQUF5QyxDQUFDO0FBQ25HLE9BQU8sRUFBb0IsWUFBWSxFQUFFLE1BQU0sc0NBQXNDLENBQUM7QUFDdEYsT0FBTyxFQUFrQixVQUFVLEVBQUUsTUFBTSxrQ0FBa0MsQ0FBQztBQUM5RSxPQUFPLEVBQXdCLGdCQUFnQixFQUFFLE1BQU0seUNBQXlDLENBQUM7QUFDakcsT0FBTyxFQUFFLEdBQUcsRUFBRSxNQUFNLG1CQUFtQixDQUFDO0FBQ3hDLE9BQU8sRUFBRSxTQUFTLEVBQWlCLFdBQVcsRUFBRSxNQUFNLGdDQUFnQyxDQUFDO0FBQ3ZGLE9BQU8sRUFBRSxjQUFjLEVBQUUsTUFBTSxzQkFBc0IsQ0FBQztBQUN0RCxPQUFPLEVBQUUsUUFBUSxFQUFnQixNQUFNLCtCQUErQixDQUFDO0FBQ3ZFLE9BQU8sRUFBc0IsY0FBYyxFQUFFLE1BQU0sc0NBQXNDLENBQUM7QUFFMUYsT0FBTyxFQUFFLHdCQUF3QixFQUFFLE1BQU0sOENBQThDLENBQUM7QUFDeEYsT0FBTyxFQUFFLHVCQUF1QixFQUFFLE1BQU0sdUNBQXVDLENBQUM7QUFDaEYsT0FBTyxFQUErQix1QkFBdUIsRUFBRSxNQUFNLGdEQUFnRCxDQUFDO0FBRXRILENBQUMsUUFBUSxDQUFDLEdBQUcsRUFBRSxRQUFRLENBQUMsT0FB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