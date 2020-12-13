import * as tslib_1 from "tslib";
import { Platform } from 'Core/Constants/Platform';
import { LoadV5ExperimentType } from 'Ads/Managers/AdRequestManager';
import { AdRequestManagerV6 } from 'Ads/Managers/AdRequestManagerV6';
import { Core } from 'Core/__mocks__/Core';
import { CoreConfiguration } from 'Core/Models/__mocks__/CoreConfiguration';
import { AdsConfiguration } from 'Ads/Models/__mocks__/AdsConfiguration';
import { AssetManager } from 'Ads/Managers/__mocks__/AssetManager';
import { SessionManager } from 'Ads/Managers/__mocks__/SessionManager';
import { AdMobSignalFactory } from 'AdMob/Utilities/__mocks__/AdMobSignalFactory';
import { RequestManager } from 'Core/Managers/__mocks__/RequestManager';
import { ClientInfo } from 'Core/Models/__mocks__/ClientInfo';
import { DeviceInfo } from 'Core/Models/__mocks__/DeviceInfo';
import { MetaDataManager } from 'Core/Managers/__mocks__/MetaDataManager';
import { CacheBookkeepingManager } from 'Core/Managers/__mocks__/CacheBookkeepingManager';
import { ContentTypeHandlerManager } from 'Ads/Managers/__mocks__/ContentTypeHandlerManager';
import { PrivacySDK } from 'Privacy/__mocks__/PrivacySDK';
import { UserPrivacyManager } from 'Ads/Managers/__mocks__/UserPrivacyManager';
import { GameSessionCounters } from 'Ads/Utilities/GameSessionCounters';
import { Placement, withGroupId } from 'Ads/Models/__mocks__/Placement';
import { CometCampaignParser } from 'Performance/Parsers/CometCampaignParser';
import { SDKMetrics, LoadV5 } from 'Ads/Utilities/SDKMetrics';
// eslint-disable-next-line
const LoadV5PreloadResponse = require('json/LoadV5PreloadResponse.json');
// eslint-disable-next-line
const LoadV5PreloadResponse_LongTTL = require('json/LoadV5PreloadResponse_LongTTL.json');
// eslint-disable-next-line
const LoadV5PreloadResponse_NoFill = require('json/LoadV5PreloadResponse_NoFill.json');
// eslint-disable-next-line
const LoadV5LoadResponse = require('json/LoadV5LoadResponse_V6.json');
// eslint-disable-next-line
const LoadV5LoadResponse_2 = require('json/LoadV5LoadResponse_2_V6.json');
// eslint-disable-next-line
const LoadV5LoadResponseWithAdditionalPlacements = require('json/LoadV5LoadResponseWithAdditionalPlacements_V6.json');
// eslint-disable-next-line
const LoadV5LoadResponse_NoFill = require('json/LoadV5LoadResponse_NoFill.json');
// eslint-disable-next-line
const LoadV5LoadResponse_FrequencyCapping = require('json/LoadV5LoadResponse_FrequencyCapping.json');
// eslint-disable-next-line
const LoadV5ReloadResponse = require('json/LoadV5ReloadResponse_V6.json');
class SatisfiesMatcher {
    constructor(object) {
        this.object = object;
    }
    asymmetricMatch(other) {
        expect(JSON.parse(other)).toMatchObject(this.object);
        return true;
    }
}
[Platform.ANDROID, Platform.IOS].forEach((platform) => {
    describe(`AdRequestManagerTest(${Platform[platform]})`, () => {
        let adRequestManager;
        let core;
        let coreConfig;
        let adsConfig;
        let assetManager;
        let sessionManager;
        let adMobSignalFactory;
        let request;
        let clientInfo;
        let deviceInfo;
        let metaDataManager;
        let cacheBookkeeping;
        let contentTypeHandlerManager;
        let privacySDK;
        let userPrivacyManager;
        beforeEach(() => {
            GameSessionCounters.init();
            core = Core();
            coreConfig = CoreConfiguration();
            adsConfig = AdsConfiguration();
            assetManager = AssetManager();
            sessionManager = SessionManager();
            adMobSignalFactory = AdMobSignalFactory();
            request = RequestManager();
            clientInfo = ClientInfo();
            deviceInfo = DeviceInfo();
            metaDataManager = MetaDataManager();
            cacheBookkeeping = CacheBookkeepingManager();
            contentTypeHandlerManager = ContentTypeHandlerManager();
            privacySDK = PrivacySDK();
            userPrivacyManager = UserPrivacyManager();
            adRequestManager = new AdRequestManagerV6(platform, core, coreConfig, adsConfig, assetManager, sessionManager, adMobSignalFactory, request, clientInfo, deviceInfo, metaDataManager, cacheBookkeeping, contentTypeHandlerManager, privacySDK, userPrivacyManager, LoadV5ExperimentType.None);
        });
        describe('initial state', () => {
            it('should have expired state', () => {
                expect(adRequestManager.isPreloadDataExpired()).toEqual(false);
            });
            it('should have previous placement', () => {
                expect(adRequestManager.getPreviousPlacementId()).toBeUndefined();
            });
        });
        describe('successful preload request', () => {
            beforeEach(() => tslib_1.__awaiter(this, void 0, void 0, function* () {
                adsConfig.getPlacements.mockReturnValue({
                    video: Placement(),
                    rewardedVideo: Placement()
                });
                request.post.mockResolvedValueOnce({
                    url: '',
                    response: JSON.stringify(LoadV5PreloadResponse),
                    responseCode: 200,
                    headers: {}
                });
                yield adRequestManager.requestPreload();
            }));
            it('should have correct request', () => {
                expect(request.post).toHaveBeenCalledTimes(1);
                expect(request.post).toHaveBeenLastCalledWith(expect.anything(), new SatisfiesMatcher({
                    loadV5Support: true,
                    isLoadEnabled: true,
                    preload: true,
                    load: false,
                    preloadPlacements: {
                        video: {
                            adTypes: ['VIDEO'],
                            allowSkip: false,
                            auctionType: 'cpm'
                        },
                        rewardedVideo: {
                            adTypes: ['VIDEO'],
                            allowSkip: false,
                            auctionType: 'cpm'
                        }
                    },
                    placements: {},
                    preloadData: {}
                }), [], {
                    followRedirects: false,
                    retries: 3,
                    retryDelay: 0,
                    retryWithConnectionEvents: false,
                    timeout: 5000
                });
            });
            it('should increase request count in game session counter', () => {
                expect(GameSessionCounters.getCurrentCounters()).toEqual({
                    adRequests: 1,
                    starts: 0,
                    views: 0,
                    startsPerTarget: {},
                    viewsPerTarget: {},
                    latestTargetStarts: {}
                });
            });
            it('should reset expire state', () => {
                expect(adRequestManager.isPreloadDataExpired()).toEqual(false);
            });
            it('should have previous placement', () => {
                expect(adRequestManager.getPreviousPlacementId()).toBeUndefined();
            });
        });
        describe('two preload request', () => {
            beforeEach(() => tslib_1.__awaiter(this, void 0, void 0, function* () {
                adsConfig.getPlacements.mockReturnValue({
                    video: Placement(),
                    rewardedVideo: Placement()
                });
                let requestPromiseResolve = () => { expect(false).toBe(true); };
                const requestPromise = new Promise((resolve) => { requestPromiseResolve = resolve; });
                request.post.mockImplementationOnce(() => requestPromise);
                adRequestManager.requestPreload();
                const promise = adRequestManager.requestPreload();
                requestPromiseResolve({
                    url: '',
                    response: JSON.stringify(LoadV5PreloadResponse),
                    responseCode: 200,
                    headers: []
                });
                yield promise;
            }));
            it('should increase request count in game session counter', () => {
                expect(GameSessionCounters.getCurrentCounters()).toEqual({
                    adRequests: 1,
                    starts: 0,
                    views: 0,
                    startsPerTarget: {},
                    viewsPerTarget: {},
                    latestTargetStarts: {}
                });
            });
        });
        describe('failed preload request', () => {
            beforeEach(() => tslib_1.__awaiter(this, void 0, void 0, function* () {
                request.post.mockRejectedValueOnce(new Error());
                adsConfig.getPlacement.mockImplementation(Placement);
                contentTypeHandlerManager.getParser.mockReturnValue(new CometCampaignParser(core));
                try {
                    yield adRequestManager.requestPreload();
                }
                catch (err) {
                    // no-op
                }
            }));
            it('should return true in hasPreloadFailed', () => {
                expect(adRequestManager.hasPreloadFailed()).toEqual(true);
            });
        });
        describe('successful load request', () => {
            let loadedCampaign1;
            let loadedCampaign2;
            beforeEach(() => tslib_1.__awaiter(this, void 0, void 0, function* () {
                request.post.mockResolvedValueOnce({
                    url: '',
                    response: JSON.stringify(LoadV5PreloadResponse),
                    responseCode: 200,
                    headers: {}
                }).mockResolvedValueOnce({
                    url: '',
                    response: JSON.stringify(LoadV5LoadResponse),
                    responseCode: 200,
                    headers: {}
                }).mockResolvedValueOnce({
                    url: '',
                    response: JSON.stringify(LoadV5LoadResponse_2),
                    responseCode: 200,
                    headers: {}
                });
                adsConfig.getPlacement.mockImplementation(Placement);
                contentTypeHandlerManager.getParser.mockReturnValue(new CometCampaignParser(core));
                yield adRequestManager.requestPreload();
                loadedCampaign1 = yield adRequestManager.requestLoad('video');
                loadedCampaign2 = yield adRequestManager.requestLoad('rewardedVideo');
            }));
            it('should send fill metric', () => {
                expect(SDKMetrics.reportMetricEventWithTags).toBeCalledWith(LoadV5.LoadRequestFill, expect.anything());
            });
            it('should not increase request count in game session counter', () => {
                expect(GameSessionCounters.getCurrentCounters()).toEqual({
                    adRequests: 1,
                    starts: 0,
                    views: 0,
                    startsPerTarget: {},
                    viewsPerTarget: {},
                    latestTargetStarts: {}
                });
            });
            it('should have a fill', () => {
                expect(loadedCampaign1).toBeDefined();
                expect(loadedCampaign2).toBeDefined();
            });
            it('should isLoadEnabled flag be set to true', () => {
                expect(loadedCampaign1.campaign.isLoadEnabled()).toEqual(true);
                expect(loadedCampaign2.campaign.isLoadEnabled()).toEqual(true);
            });
            it('should have correct in loadedCampaign1', () => {
                expect(loadedCampaign1.campaign.getId()).toEqual('5be40c5f602f4510ec583881');
            });
            it('should have correct tracking url in loadedCampaign1', () => {
                expect(loadedCampaign1.trackingUrls).toEqual({
                    click: [
                        'https://tracking.stg.mz.internal.unity3d.com/operative/%ZONE%?eventType=click&test=0&5be40c5f602f4510ec583881'
                    ],
                    complete: [
                        'https://tracking.stg.mz.internal.unity3d.com/operative/%ZONE%?eventType=complete&test=0&5be40c5f602f4510ec583881'
                    ],
                    error: [
                        'https://tracking.stg.mz.internal.unity3d.com/operative/%ZONE%?eventType=error&test=0&5be40c5f602f4510ec583881'
                    ],
                    firstQuartile: [
                        'https://tracking.stg.mz.internal.unity3d.com/operative/%ZONE%?eventType=firstQuartile&test=0&5be40c5f602f4510ec583881'
                    ],
                    loaded: [
                        'https://tracking.stg.mz.internal.unity3d.com/operative/%ZONE%?eventType=loaded&test=0&5be40c5f602f4510ec583881'
                    ],
                    midpoint: [
                        'https://tracking.stg.mz.internal.unity3d.com/operative/%ZONE%?eventType=midpoint&test=0&5be40c5f602f4510ec583881'
                    ],
                    show: [
                        'https://tracking.stg.mz.internal.unity3d.com/operative/%ZONE%?eventType=show&test=0&5be40c5f602f4510ec583881'
                    ],
                    skip: [
                        'https://tracking.stg.mz.internal.unity3d.com/operative/%ZONE%?eventType=skip&test=0&5be40c5f602f4510ec583881'
                    ],
                    stalled: [
                        'https://tracking.stg.mz.internal.unity3d.com/operative/%ZONE%?eventType=stalled&test=0&5be40c5f602f4510ec583881'
                    ],
                    start: [
                        'https://tracking.stg.mz.internal.unity3d.com/impression/%ZONE%?data=randomData&test=0&5be40c5f602f4510ec583881',
                        'https://tracking.stg.mz.internal.unity3d.com/operative/%ZONE%?eventType=start&test=0&5be40c5f602f4510ec583881'
                    ],
                    thirdQuartile: [
                        'https://tracking.stg.mz.internal.unity3d.com/operative/%ZONE%?eventType=thirdQuartile&test=0&5be40c5f602f4510ec583881'
                    ],
                    videoEndCardClick: [
                        'https://tracking.stg.mz.internal.unity3d.com/operative/%ZONE%?eventType=videoEndCardClick&test=0&5be40c5f602f4510ec583881'
                    ]
                });
            });
            it('should have correct in loadedCampaign2', () => {
                expect(loadedCampaign2.campaign.getId()).toEqual('load_v5_2');
            });
            it('should have correct tracking url in loadedCampaign2', () => {
                expect(loadedCampaign2.trackingUrls).toEqual({
                    click: [
                        'https://tracking.stg.mz.internal.unity3d.com/operative/%ZONE%?eventType=click&test=0&load_v5_2_rewardedVideo'
                    ],
                    complete: [
                        'https://tracking.stg.mz.internal.unity3d.com/operative/%ZONE%?eventType=complete&test=0&load_v5_2_rewardedVideo'
                    ],
                    error: [
                        'https://tracking.stg.mz.internal.unity3d.com/operative/%ZONE%?eventType=error&test=0&load_v5_2_rewardedVideo'
                    ],
                    firstQuartile: [
                        'https://tracking.stg.mz.internal.unity3d.com/operative/%ZONE%?eventType=firstQuartile&test=0&load_v5_2_rewardedVideo'
                    ],
                    loaded: [
                        'https://tracking.stg.mz.internal.unity3d.com/operative/%ZONE%?eventType=loaded&test=0&load_v5_2_rewardedVideo'
                    ],
                    midpoint: [
                        'https://tracking.stg.mz.internal.unity3d.com/operative/%ZONE%?eventType=midpoint&test=0&load_v5_2_rewardedVideo'
                    ],
                    show: [
                        'https://tracking.stg.mz.internal.unity3d.com/operative/%ZONE%?eventType=show&test=0&load_v5_2_rewardedVideo'
                    ],
                    skip: [
                        'https://tracking.stg.mz.internal.unity3d.com/operative/%ZONE%?eventType=skip&test=0&load_v5_2_rewardedVideo'
                    ],
                    stalled: [
                        'https://tracking.stg.mz.internal.unity3d.com/operative/%ZONE%?eventType=stalled&test=0&load_v5_2_rewardedVideo'
                    ],
                    start: [
                        'https://tracking.stg.mz.internal.unity3d.com/impression/%ZONE%?data=randomData&test=0&load_v5_2_rewardedVideo',
                        'https://tracking.stg.mz.internal.unity3d.com/operative/%ZONE%?eventType=start&test=0&load_v5_2_rewardedVideo'
                    ],
                    thirdQuartile: [
                        'https://tracking.stg.mz.internal.unity3d.com/operative/%ZONE%?eventType=thirdQuartile&test=0&load_v5_2_rewardedVideo'
                    ],
                    videoEndCardClick: [
                        'https://tracking.stg.mz.internal.unity3d.com/operative/%ZONE%?eventType=videoEndCardClick&test=0&load_v5_2_rewardedVideo'
                    ]
                });
            });
            it('should sessions have id from preload response', () => {
                expect(loadedCampaign1.campaign.getSession()).toBeDefined();
                expect(loadedCampaign1.campaign.getSession().getId()).toEqual('d301fd4c-4a9e-48e4-82aa-ad8b07977ca6');
                expect(loadedCampaign2.campaign.getSession()).toBeDefined();
                expect(loadedCampaign2.campaign.getSession().getId()).toEqual('d301fd4c-4a9e-48e4-82aa-ad8b07977ca6');
            });
            it('should set same sessions for all campaigns', () => {
                expect(loadedCampaign1.campaign.getSession()).toBeDefined();
                expect(loadedCampaign1.campaign.getSession()).toEqual(loadedCampaign2.campaign.getSession());
                expect(loadedCampaign1.campaign.getSession()).toStrictEqual(loadedCampaign2.campaign.getSession());
            });
            it('should make request with correct body', () => {
                expect(request.post).toHaveBeenCalledTimes(3);
                expect(request.post).toHaveBeenNthCalledWith(2, expect.anything(), new SatisfiesMatcher({
                    loadV5Support: true,
                    isLoadEnabled: true,
                    preload: false,
                    load: true,
                    preloadPlacements: {},
                    placements: {
                        video: {
                            adTypes: ['VIDEO'],
                            allowSkip: false,
                            auctionType: 'cpm'
                        }
                    },
                    preloadData: {
                        video: {
                            campaignAvailable: true,
                            ttlInSeconds: 3600,
                            dataIndex: '0'
                        }
                    },
                    encryptedPreloadData: {
                        0: 'test-data-preload-1'
                    }
                }), [], {
                    followRedirects: false,
                    retries: 3,
                    retryDelay: 0,
                    retryWithConnectionEvents: false,
                    timeout: 5000
                });
                expect(request.post).toHaveBeenNthCalledWith(3, expect.anything(), new SatisfiesMatcher({
                    preload: false,
                    load: true,
                    preloadPlacements: {},
                    placements: {
                        rewardedVideo: {
                            adTypes: ['VIDEO'],
                            allowSkip: false,
                            auctionType: 'cpm'
                        }
                    },
                    preloadData: {
                        rewardedVideo: {
                            campaignAvailable: true,
                            ttlInSeconds: 3600,
                            dataIndex: '1'
                        }
                    },
                    encryptedPreloadData: {
                        '1': 'test-data-preload-2'
                    }
                }), [], {
                    followRedirects: false,
                    retries: 3,
                    retryDelay: 0,
                    retryWithConnectionEvents: false,
                    timeout: 5000
                });
            });
        });
        describe('successful load request with additional placements', () => {
            let loadedCampaign;
            let onAdditionalPlacementsReady;
            beforeEach(() => tslib_1.__awaiter(this, void 0, void 0, function* () {
                request.post.mockResolvedValueOnce({
                    url: '',
                    response: JSON.stringify(LoadV5PreloadResponse),
                    responseCode: 200,
                    headers: {}
                }).mockResolvedValueOnce({
                    url: '',
                    response: JSON.stringify(LoadV5LoadResponseWithAdditionalPlacements),
                    responseCode: 200,
                    headers: {}
                });
                const placements = {
                    'video': withGroupId(Placement('video'), 'test_group_id'),
                    'rewardedVideo': withGroupId(Placement('rewardedVideo'), 'test_group_id'),
                    'video2': withGroupId(Placement('video2'), 'test_group_id'),
                    'video3': withGroupId(Placement('video3'), 'test_group_id')
                };
                adsConfig.getPlacement.mockImplementation((x) => placements[x]);
                adsConfig.getPlacementsForGroupId.mockReturnValueOnce([placements.video.getId(), placements.rewardedVideo.getId(), placements.video2.getId(), placements.video3.getId()]);
                contentTypeHandlerManager.getParser.mockReturnValue(new CometCampaignParser(core));
                onAdditionalPlacementsReady = jest.fn();
                adRequestManager.onAdditionalPlacementsReady.subscribe(onAdditionalPlacementsReady);
                yield adRequestManager.requestPreload();
                loadedCampaign = yield adRequestManager.loadCampaignWithAdditionalPlacement(placements.video);
            }));
            it('should getPlacementsForGroupId be called with correct ad unit id', () => {
                expect(adsConfig.getPlacementsForGroupId).toBeCalledWith('test_group_id');
            });
            it('should send fill metric', () => {
                expect(SDKMetrics.reportMetricEventWithTags).toBeCalledWith(LoadV5.LoadRequestFill, expect.anything());
            });
            it('should not increase request count in game session counter', () => {
                expect(GameSessionCounters.getCurrentCounters()).toEqual({
                    adRequests: 1,
                    starts: 0,
                    views: 0,
                    startsPerTarget: {},
                    viewsPerTarget: {},
                    latestTargetStarts: {}
                });
            });
            it('should have a fill', () => {
                expect(loadedCampaign).toBeDefined();
            });
            it('should have correct in loadedCampaign', () => {
                expect(loadedCampaign.campaign.getId()).toEqual('5be40c5f602f4510ec583881');
            });
            it('should sessions have id from preload response', () => {
                expect(loadedCampaign.campaign.getSession()).toBeDefined();
                expect(loadedCampaign.campaign.getSession().getId()).toEqual('d301fd4c-4a9e-48e4-82aa-ad8b07977ca6');
            });
            it('should make request with correct body', () => {
                expect(request.post).toHaveBeenCalledTimes(2);
                expect(request.post).toHaveBeenNthCalledWith(2, expect.anything(), new SatisfiesMatcher({
                    loadV5Support: true,
                    isLoadEnabled: true,
                    preload: false,
                    load: true,
                    preloadPlacements: {},
                    placements: {
                        video: {
                            adTypes: ['VIDEO'],
                            allowSkip: false,
                            auctionType: 'cpm'
                        },
                        rewardedVideo: {
                            adTypes: ['VIDEO'],
                            allowSkip: false,
                            auctionType: 'cpm'
                        }
                    },
                    preloadData: {
                        video: {
                            campaignAvailable: true,
                            ttlInSeconds: 3600,
                            dataIndex: '0'
                        },
                        rewardedVideo: {
                            campaignAvailable: true,
                            ttlInSeconds: 3600,
                            dataIndex: '1'
                        }
                    },
                    encryptedPreloadData: {
                        0: 'test-data-preload-1',
                        1: 'test-data-preload-2'
                    }
                }), [], {
                    followRedirects: false,
                    retries: 3,
                    retryDelay: 0,
                    retryWithConnectionEvents: false,
                    timeout: 5000
                });
            });
            it('should onAdditionalPlacementsReady be called for additional placements', () => {
                expect(onAdditionalPlacementsReady).toBeCalledTimes(1);
            });
            it('should have 3 placements in additional placements', () => {
                expect(onAdditionalPlacementsReady).toBeCalledTimes(1);
                const additionalCampaigns = onAdditionalPlacementsReady.mock.calls[0][1];
                expect(Object.keys(additionalCampaigns).length).toEqual(3);
            });
            it('should return correct ad unit id in onAdditionalPlacementsReady', () => {
                const groupId = onAdditionalPlacementsReady.mock.calls[0][0];
                expect(groupId).toEqual('test_group_id');
            });
            it('should get correct campaign for rewardedVideo', () => {
                const additionalCampaigns = onAdditionalPlacementsReady.mock.calls[0][1];
                const campaign = additionalCampaigns.rewardedVideo.notCachedCampaign;
                expect(campaign.getId()).toEqual('load_v5_second');
                expect(campaign.getSession()).toBeDefined();
                expect(campaign.getSession().getId()).toEqual('d301fd4c-4a9e-48e4-82aa-ad8b07977ca6');
            });
            it('should get correct campaign video2', () => {
                const additionalCampaigns = onAdditionalPlacementsReady.mock.calls[0][1];
                const campaign = additionalCampaigns.video2.notCachedCampaign;
                expect(campaign.getId()).toEqual('load_v5_second');
                expect(campaign.getSession()).toBeDefined();
                expect(campaign.getSession().getId()).toEqual('d301fd4c-4a9e-48e4-82aa-ad8b07977ca6');
            });
            it('should get a no fill for video3', () => {
                const additionalCampaigns = onAdditionalPlacementsReady.mock.calls[0][1];
                const campaign = additionalCampaigns.video3;
                expect(campaign).toBeUndefined();
            });
            it('should have the same campaigns in video2 and rewardedVideo', () => {
                const additionalCampaigns = onAdditionalPlacementsReady.mock.calls[0][1];
                const campaign1 = additionalCampaigns.rewardedVideo.notCachedCampaign;
                const campaign2 = additionalCampaigns.video2.notCachedCampaign;
                expect(campaign1).toBe(campaign2);
            });
            it('should have different tracking urls', () => {
                const additionalCampaigns = onAdditionalPlacementsReady.mock.calls[0][1];
                const trackingUrls1 = additionalCampaigns.rewardedVideo.notCachedTrackingUrls;
                const trackingUrls2 = additionalCampaigns.video2.notCachedTrackingUrls;
                expect(trackingUrls1).not.toEqual(trackingUrls2);
            });
            it('should have different correct tracking urls for video', () => {
                const trackingUrls = loadedCampaign.trackingUrls;
                expect(Object.keys(trackingUrls).length).toEqual(12);
                Object.keys(trackingUrls).forEach(event => {
                    trackingUrls[event].forEach(url => {
                        expect(url.endsWith('&video')).toEqual(true);
                    });
                });
            });
            it('should have different correct tracking urls for rewardedVideo', () => {
                const additionalCampaigns = onAdditionalPlacementsReady.mock.calls[0][1];
                const trackingUrls = additionalCampaigns.rewardedVideo.notCachedTrackingUrls;
                expect(Object.keys(trackingUrls).length).toEqual(12);
                Object.keys(trackingUrls).forEach(event => {
                    trackingUrls[event].forEach(url => {
                        expect(url.endsWith('&rewardedVideo')).toEqual(true);
                    });
                });
            });
            it('should have different correct tracking urls for video2', () => {
                const additionalCampaigns = onAdditionalPlacementsReady.mock.calls[0][1];
                const trackingUrls = additionalCampaigns.video2.notCachedTrackingUrls;
                expect(Object.keys(trackingUrls).length).toEqual(12);
                Object.keys(trackingUrls).forEach(event => {
                    trackingUrls[event].forEach(url => {
                        expect(url.endsWith('&video2')).toEqual(true);
                    });
                });
            });
            it('should cache only 1 campaigns', () => {
                expect(assetManager.setup).toBeCalledTimes(1);
            });
            it('should start caching in correct order', () => {
                expect(assetManager.setup).toHaveBeenNthCalledWith(1, loadedCampaign.campaign);
            });
        });
        describe('successful load request and caching fails', () => {
            let loadedCampaign;
            beforeEach(() => tslib_1.__awaiter(this, void 0, void 0, function* () {
                request.post.mockResolvedValueOnce({
                    url: '',
                    response: JSON.stringify(LoadV5PreloadResponse),
                    responseCode: 200,
                    headers: {}
                }).mockResolvedValueOnce({
                    url: '',
                    response: JSON.stringify(LoadV5LoadResponse),
                    responseCode: 200,
                    headers: {}
                });
                assetManager.setup.mockRejectedValue(new Error());
                adsConfig.getPlacement.mockImplementation(Placement);
                contentTypeHandlerManager.getParser.mockReturnValue(new CometCampaignParser(core));
                yield adRequestManager.requestPreload();
                loadedCampaign = yield adRequestManager.requestLoad('video');
            }));
            it('should have a fill', () => {
                expect(loadedCampaign).toBeDefined();
            });
        });
        describe('successful load request with no fill from preload', () => {
            let loadedCampaign;
            beforeEach(() => tslib_1.__awaiter(this, void 0, void 0, function* () {
                request.post.mockResolvedValueOnce({
                    url: '',
                    response: JSON.stringify(LoadV5PreloadResponse_NoFill),
                    responseCode: 200,
                    headers: {}
                }).mockResolvedValueOnce({
                    url: '',
                    response: JSON.stringify(LoadV5LoadResponse),
                    responseCode: 200,
                    headers: {}
                });
                adsConfig.getPlacement.mockImplementation(Placement);
                contentTypeHandlerManager.getParser.mockReturnValue(new CometCampaignParser(core));
                yield adRequestManager.requestPreload();
                loadedCampaign = yield adRequestManager.requestLoad('video');
            }));
            it('should load campaign', () => {
                expect(loadedCampaign).toBeDefined();
            });
            it('should have correct in loadedCampaign', () => {
                expect(loadedCampaign.campaign.getId()).toEqual('5be40c5f602f4510ec583881');
            });
            it('should make request with correct body', () => {
                expect(request.post).toHaveBeenCalledTimes(2);
                expect(request.post).toHaveBeenNthCalledWith(2, expect.anything(), new SatisfiesMatcher({
                    loadV5Support: true,
                    isLoadEnabled: true,
                    preload: false,
                    load: true,
                    preloadPlacements: {},
                    placements: {
                        video: {
                            adTypes: ['VIDEO'],
                            allowSkip: false,
                            auctionType: 'cpm'
                        }
                    },
                    preloadData: {
                        video: {
                            campaignAvailable: false
                        }
                    }
                }), [], {
                    followRedirects: false,
                    retries: 3,
                    retryDelay: 0,
                    retryWithConnectionEvents: false,
                    timeout: 5000
                });
            });
        });
        describe('successful load request with no fill', () => {
            let loadedCampaign;
            beforeEach(() => tslib_1.__awaiter(this, void 0, void 0, function* () {
                request.post.mockResolvedValueOnce({
                    url: '',
                    response: JSON.stringify(LoadV5PreloadResponse),
                    responseCode: 200,
                    headers: {}
                }).mockResolvedValueOnce({
                    url: '',
                    response: JSON.stringify(LoadV5LoadResponse_NoFill),
                    responseCode: 200,
                    headers: {}
                });
                adsConfig.getPlacement.mockImplementation(Placement);
                contentTypeHandlerManager.getParser.mockReturnValue(new CometCampaignParser(core));
                yield adRequestManager.requestPreload();
                loadedCampaign = yield adRequestManager.requestLoad('video');
            }));
            it('should not load campaign', () => {
                expect(loadedCampaign).toBeUndefined();
            });
            it('should not send fill metric', () => {
                expect(SDKMetrics.reportMetricEventWithTags).not.toBeCalledWith(LoadV5.LoadRequestFill, expect.anything());
            });
            it('should not trigger error metric', () => {
                expect(SDKMetrics.reportMetricEventWithTags).not.toBeCalledWith(LoadV5.LoadRequestFailed, expect.anything());
            });
        });
        describe('successful load request with no fill when frequency capping', () => {
            let loadedCampaign;
            beforeEach(() => tslib_1.__awaiter(this, void 0, void 0, function* () {
                request.post.mockResolvedValueOnce({
                    url: '',
                    response: JSON.stringify(LoadV5PreloadResponse),
                    responseCode: 200,
                    headers: {}
                }).mockResolvedValueOnce({
                    url: '',
                    response: JSON.stringify(LoadV5LoadResponse_FrequencyCapping),
                    responseCode: 200,
                    headers: {}
                });
                adsConfig.getPlacement.mockImplementation(Placement);
                contentTypeHandlerManager.getParser.mockReturnValue(new CometCampaignParser(core));
                yield adRequestManager.requestPreload();
                loadedCampaign = yield adRequestManager.requestLoad('video');
            }));
            it('should not load campaign', () => {
                expect(loadedCampaign).toBeUndefined();
            });
            it('should not send fill metric', () => {
                expect(SDKMetrics.reportMetricEventWithTags).not.toBeCalledWith(LoadV5.LoadRequestFill, expect.anything());
            });
            it('should trigger error metric', () => {
                expect(SDKMetrics.reportMetricEventWithTags).toBeCalledWith(LoadV5.LoadRequestFailed, expect.objectContaining({ 'rsn': 'frequency_cap_first' }));
            });
            it('should not trigger metric', () => {
                expect(SDKMetrics.reportMetricEventWithTags).not.toBeCalledWith(LoadV5.LoadRequestFrequencyCap, expect.anything());
            });
        });
        describe('successful load request with no fill when frequency capping with following request', () => {
            let loadedCampaign;
            beforeEach(() => tslib_1.__awaiter(this, void 0, void 0, function* () {
                request.post.mockResolvedValueOnce({
                    url: '',
                    response: JSON.stringify(LoadV5PreloadResponse),
                    responseCode: 200,
                    headers: {}
                }).mockResolvedValueOnce({
                    url: '',
                    response: JSON.stringify(LoadV5LoadResponse_FrequencyCapping),
                    responseCode: 200,
                    headers: {}
                });
                adsConfig.getPlacement.mockImplementation(Placement);
                contentTypeHandlerManager.getParser.mockReturnValue(new CometCampaignParser(core));
                yield adRequestManager.requestPreload();
                yield adRequestManager.requestLoad('video');
                loadedCampaign = yield adRequestManager.requestLoad('video');
            }));
            it('should not load campaign', () => {
                expect(loadedCampaign).toBeUndefined();
            });
            it('should trigger metric', () => {
                expect(SDKMetrics.reportMetricEventWithTags).toBeCalledWith(LoadV5.LoadRequestFrequencyCap, expect.anything());
            });
        });
        describe('successful load request with no fill when frequency capping with following request after timeout', () => {
            let loadedCampaign;
            let dateNowSpy;
            beforeEach(() => tslib_1.__awaiter(this, void 0, void 0, function* () {
                request.post.mockResolvedValueOnce({
                    url: '',
                    response: JSON.stringify(LoadV5PreloadResponse_LongTTL),
                    responseCode: 200,
                    headers: {}
                }).mockResolvedValueOnce({
                    url: '',
                    response: JSON.stringify(LoadV5LoadResponse_FrequencyCapping),
                    responseCode: 200,
                    headers: {}
                }).mockResolvedValueOnce({
                    url: '',
                    response: JSON.stringify(LoadV5LoadResponse),
                    responseCode: 200,
                    headers: {}
                });
                dateNowSpy = jest.spyOn(Date, 'now');
                dateNowSpy.mockReturnValue(0);
                adsConfig.getPlacement.mockImplementation(Placement);
                contentTypeHandlerManager.getParser.mockReturnValue(new CometCampaignParser(core));
                yield adRequestManager.requestPreload();
                yield adRequestManager.requestLoad('video');
                dateNowSpy.mockReturnValue(24 * 3600 * 1000 + 1);
                loadedCampaign = yield adRequestManager.requestLoad('video');
            }));
            afterEach(() => {
                dateNowSpy.mockRestore();
            });
            it('should have a fill', () => {
                expect(loadedCampaign).toBeDefined();
            });
            it('should send fill metric', () => {
                expect(SDKMetrics.reportMetricEventWithTags).toBeCalledWith(LoadV5.LoadRequestFill, expect.anything());
            });
            it('should not trigger metric', () => {
                expect(SDKMetrics.reportMetricEventWithTags).not.toBeCalledWith(LoadV5.LoadRequestFrequencyCap, expect.anything());
            });
        });
        describe('successful load request with no fill and no fill from preload', () => {
            let loadedCampaign;
            beforeEach(() => tslib_1.__awaiter(this, void 0, void 0, function* () {
                request.post.mockResolvedValueOnce({
                    url: '',
                    response: JSON.stringify(LoadV5PreloadResponse_NoFill),
                    responseCode: 200,
                    headers: {}
                }).mockResolvedValueOnce({
                    url: '',
                    response: JSON.stringify(LoadV5LoadResponse_NoFill),
                    responseCode: 200,
                    headers: {}
                });
                adsConfig.getPlacement.mockImplementation(Placement);
                contentTypeHandlerManager.getParser.mockReturnValue(new CometCampaignParser(core));
                yield adRequestManager.requestPreload();
                loadedCampaign = yield adRequestManager.requestLoad('video');
            }));
            it('should not load campaign', () => {
                expect(loadedCampaign).toBeUndefined();
            });
            it('should make request with correct body', () => {
                expect(request.post).toHaveBeenCalledTimes(2);
                expect(request.post).toHaveBeenNthCalledWith(2, expect.anything(), new SatisfiesMatcher({
                    loadV5Support: true,
                    isLoadEnabled: true,
                    preload: false,
                    load: true,
                    preloadPlacements: {},
                    placements: {
                        video: {
                            adTypes: ['VIDEO'],
                            allowSkip: false,
                            auctionType: 'cpm'
                        }
                    },
                    preloadData: {
                        video: {
                            campaignAvailable: false
                        }
                    }
                }), [], {
                    followRedirects: false,
                    retries: 3,
                    retryDelay: 0,
                    retryWithConnectionEvents: false,
                    timeout: 5000
                });
            });
        });
        describe('load request when no preload data', () => {
            let loadedCampaign;
            beforeEach(() => tslib_1.__awaiter(this, void 0, void 0, function* () {
                request.post
                    .mockRejectedValue(new Error())
                    .mockResolvedValueOnce({
                    url: '',
                    response: JSON.stringify(LoadV5LoadResponse),
                    responseCode: 200,
                    headers: {}
                });
                adsConfig.getPlacement.mockImplementation(Placement);
                yield adRequestManager.requestPreload();
                loadedCampaign = yield adRequestManager.requestLoad('video');
            }));
            it('should have no fill', () => {
                expect(loadedCampaign).toBeUndefined();
            });
        });
        describe('load request when no preload expired', () => {
            let loadedCampaign;
            beforeEach(() => tslib_1.__awaiter(this, void 0, void 0, function* () {
                jest.spyOn(Date, 'now')
                    .mockReturnValueOnce(1)
                    .mockReturnValue(60 * 60 * 1000 + 100);
                request.post.mockResolvedValueOnce({
                    url: '',
                    response: JSON.stringify(LoadV5PreloadResponse),
                    responseCode: 200,
                    headers: {}
                }).mockResolvedValueOnce({
                    url: '',
                    response: JSON.stringify(LoadV5LoadResponse),
                    responseCode: 200,
                    headers: {}
                });
                adsConfig.getPlacement.mockImplementation(Placement);
                yield adRequestManager.requestPreload();
                loadedCampaign = yield adRequestManager.requestLoad('video');
            }));
            afterEach(() => tslib_1.__awaiter(this, void 0, void 0, function* () {
                jest.useRealTimers();
            }));
            it('should have expired data', () => {
                expect(adRequestManager.isPreloadDataExpired()).toEqual(true);
            });
            it('should have no fill', () => {
                expect(loadedCampaign).toBeUndefined();
            });
        });
        describe('failed load request', () => {
            let loadedCampaign1;
            let loadedCampaign2;
            beforeEach(() => tslib_1.__awaiter(this, void 0, void 0, function* () {
                request.post.mockResolvedValueOnce({
                    url: '',
                    response: JSON.stringify(LoadV5PreloadResponse),
                    responseCode: 200,
                    headers: {}
                }).mockRejectedValueOnce(new Error()).mockResolvedValueOnce({
                    url: '',
                    response: JSON.stringify(LoadV5LoadResponse),
                    responseCode: 200,
                    headers: {}
                });
                adsConfig.getPlacement.mockImplementation(Placement);
                contentTypeHandlerManager.getParser.mockReturnValue(new CometCampaignParser(core));
                yield adRequestManager.requestPreload();
                loadedCampaign1 = yield adRequestManager.requestLoad('video');
                loadedCampaign2 = yield adRequestManager.requestLoad('rewardedVideo');
            }));
            it('should load single campaigns', () => {
                expect(loadedCampaign2).toBeDefined();
            });
            it('should have correct in loadedCampaign2', () => {
                expect(loadedCampaign2.campaign.getId()).toEqual('load_v5_1');
            });
            it('should have no fill', () => {
                expect(loadedCampaign1).toBeUndefined();
            });
        });
        describe('load request before preload', () => {
            let loadedCampaign;
            beforeEach(() => tslib_1.__awaiter(this, void 0, void 0, function* () {
                request.post.mockResolvedValueOnce({
                    url: '',
                    response: JSON.stringify(LoadV5PreloadResponse),
                    responseCode: 200,
                    headers: {}
                }).mockResolvedValueOnce({
                    url: '',
                    response: JSON.stringify(LoadV5LoadResponse),
                    responseCode: 200,
                    headers: {}
                });
                adsConfig.getPlacement.mockImplementation(Placement);
                contentTypeHandlerManager.getParser.mockReturnValue(new CometCampaignParser(core));
                const promise = adRequestManager.requestLoad('video');
                yield adRequestManager.requestPreload();
                loadedCampaign = yield promise;
            }));
            it('should have a fill', () => {
                expect(loadedCampaign).toBeDefined();
            });
            it('should have correct in loadedCampaign2', () => {
                expect(loadedCampaign.campaign.getId()).toEqual('5be40c5f602f4510ec583881');
            });
            it('should sessions have id from preload response', () => {
                expect(loadedCampaign.campaign.getSession()).toBeDefined();
                expect(loadedCampaign.campaign.getSession().getId()).toEqual('d301fd4c-4a9e-48e4-82aa-ad8b07977ca6');
            });
        });
        describe('load request while preload ongoing', () => {
            let loadedCampaign1;
            let loadedCampaign2;
            beforeEach(() => tslib_1.__awaiter(this, void 0, void 0, function* () {
                let requestPromiseResolve = () => { expect(false).toBe(true); };
                const requestPromise = new Promise((resolve) => { requestPromiseResolve = resolve; });
                request.post.mockImplementationOnce(() => requestPromise).mockResolvedValueOnce({
                    url: '',
                    response: JSON.stringify(LoadV5LoadResponse_2),
                    responseCode: 200,
                    headers: []
                }).mockResolvedValueOnce({
                    url: '',
                    response: JSON.stringify(LoadV5LoadResponse),
                    responseCode: 200,
                    headers: []
                });
                adsConfig.getPlacement.mockImplementation(Placement);
                contentTypeHandlerManager.getParser.mockReturnValue(new CometCampaignParser(core));
                const preload = adRequestManager.requestPreload();
                const load1 = adRequestManager.requestLoad('video');
                const load2 = adRequestManager.requestLoad('rewardedVideo');
                requestPromiseResolve({
                    url: '',
                    response: JSON.stringify(LoadV5PreloadResponse),
                    responseCode: 200,
                    headers: []
                });
                yield preload;
                loadedCampaign1 = yield load1;
                loadedCampaign2 = yield load2;
            }));
            it('should have a fill', () => {
                expect(loadedCampaign1).toBeDefined();
                expect(loadedCampaign2).toBeDefined();
            });
            it('should have correct in loadedCampaign1', () => {
                expect(loadedCampaign1.campaign.getId()).toEqual('load_v5_2');
            });
            it('should have correct in loadedCampaign2', () => {
                expect(loadedCampaign2.campaign.getId()).toEqual('load_v5_1');
            });
            it('should sessions have id from preload response', () => {
                expect(loadedCampaign1.campaign.getSession()).toBeDefined();
                expect(loadedCampaign1.campaign.getSession().getId()).toEqual('d301fd4c-4a9e-48e4-82aa-ad8b07977ca6');
                expect(loadedCampaign2.campaign.getSession()).toBeDefined();
                expect(loadedCampaign2.campaign.getSession().getId()).toEqual('d301fd4c-4a9e-48e4-82aa-ad8b07977ca6');
            });
        });
        describe('load request while preload ongoing and load request fails', () => {
            let loadedCampaign1;
            let loadedCampaign2;
            beforeEach(() => tslib_1.__awaiter(this, void 0, void 0, function* () {
                let requestPromiseResolve = () => { expect(false).toBe(true); };
                const requestPromise = new Promise((resolve) => { requestPromiseResolve = resolve; });
                request.post.mockImplementationOnce(() => requestPromise).mockRejectedValueOnce(new Error()).mockResolvedValueOnce({
                    url: '',
                    response: JSON.stringify(LoadV5LoadResponse_2),
                    responseCode: 200,
                    headers: []
                });
                adsConfig.getPlacement.mockImplementation(Placement);
                contentTypeHandlerManager.getParser.mockReturnValue(new CometCampaignParser(core));
                const preload = adRequestManager.requestPreload();
                const load1 = adRequestManager.requestLoad('video');
                const load2 = adRequestManager.requestLoad('rewardedVideo');
                requestPromiseResolve({
                    url: '',
                    response: JSON.stringify(LoadV5PreloadResponse),
                    responseCode: 200,
                    headers: []
                });
                yield preload;
                loadedCampaign1 = yield load1;
                loadedCampaign2 = yield load2;
            }));
            it('should have a fill', () => {
                expect(loadedCampaign2).toBeDefined();
            });
            it('should have correct campaign', () => {
                expect(loadedCampaign2.campaign.getId()).toEqual('load_v5_2');
            });
            it('should have no fill', () => {
                expect(loadedCampaign1).toBeUndefined();
            });
        });
        describe('load request while preload ongoing and preload fails', () => {
            let loadedCampaign1;
            let loadedCampaign2;
            beforeEach(() => tslib_1.__awaiter(this, void 0, void 0, function* () {
                let requestPromiseReject = () => { expect(false).toBe(true); };
                const requestPromise = new Promise((reject) => { requestPromiseReject = reject; });
                request.post.mockImplementationOnce(() => requestPromise).mockRejectedValueOnce(new Error()).mockResolvedValueOnce({
                    url: '',
                    response: JSON.stringify(LoadV5LoadResponse),
                    responseCode: 200,
                    headers: []
                });
                adsConfig.getPlacement.mockImplementation(Placement);
                contentTypeHandlerManager.getParser.mockReturnValue(new CometCampaignParser(core));
                const preload = adRequestManager.requestPreload();
                const load1 = adRequestManager.requestLoad('video');
                const load2 = adRequestManager.requestLoad('rewardedVideo');
                requestPromiseReject(new Error());
                try {
                    yield preload;
                }
                catch (err) {
                    // no-op
                }
                loadedCampaign1 = yield load1;
                loadedCampaign2 = yield load2;
            }));
            it('should have no fill', () => {
                expect(loadedCampaign1).toBeUndefined();
                expect(loadedCampaign2).toBeUndefined();
            });
            it('should send metric when reload rescheduled', () => {
                expect(SDKMetrics.reportMetricEventWithTags).toBeCalledWith(LoadV5.LoadRequestFailed, expect.objectContaining({ 'rsn': 'rescheduled_failed_preload' }));
            });
        });
        describe('load request while reload ongoing', () => {
            let loadedCampaign;
            beforeEach(() => tslib_1.__awaiter(this, void 0, void 0, function* () {
                let requestPromiseResolve = () => { expect(false).toBe(true); };
                const requestPromise = new Promise((resolve) => { requestPromiseResolve = resolve; });
                request.post.mockResolvedValueOnce({
                    url: '',
                    response: JSON.stringify(LoadV5PreloadResponse),
                    responseCode: 200,
                    headers: {}
                }).mockResolvedValueOnce({
                    url: '',
                    response: JSON.stringify(LoadV5LoadResponse_2),
                    responseCode: 200,
                    headers: {}
                }).mockImplementationOnce(() => requestPromise).mockResolvedValueOnce({
                    url: '',
                    response: JSON.stringify(LoadV5LoadResponse),
                    responseCode: 200,
                    headers: {}
                });
                adsConfig.getPlacements.mockReturnValue({
                    video: Placement('video'),
                    rewardedVideo: Placement('rewardedVideo')
                });
                adsConfig.getPlacement.mockImplementation(Placement);
                contentTypeHandlerManager.getParser.mockReturnValue(new CometCampaignParser(core));
                yield adRequestManager.requestPreload();
                yield adRequestManager.requestLoad('video');
                const reload = adRequestManager.requestReload([]);
                const load = adRequestManager.requestLoad('video');
                requestPromiseResolve({
                    url: '',
                    response: JSON.stringify(LoadV5ReloadResponse),
                    responseCode: 200,
                    headers: []
                });
                yield reload;
                loadedCampaign = yield load;
            }));
            it('should have a fill', () => {
                expect(loadedCampaign).toBeDefined();
            });
            it('should have correct campaign', () => {
                expect(loadedCampaign.campaign.getId()).toEqual('5be40c5f602f4510ec583881');
            });
        });
        describe('successful reload request', () => {
            let onCampaign;
            beforeEach(() => tslib_1.__awaiter(this, void 0, void 0, function* () {
                request.post.mockResolvedValueOnce({
                    url: '',
                    response: JSON.stringify(LoadV5PreloadResponse),
                    responseCode: 200,
                    headers: {}
                }).mockResolvedValueOnce({
                    url: '',
                    response: JSON.stringify(LoadV5LoadResponse),
                    responseCode: 200,
                    headers: {}
                }).mockResolvedValueOnce({
                    url: '',
                    response: JSON.stringify(LoadV5LoadResponse),
                    responseCode: 200,
                    headers: {}
                }).mockResolvedValueOnce({
                    url: '',
                    response: JSON.stringify(LoadV5ReloadResponse),
                    responseCode: 200,
                    headers: {}
                });
                adsConfig.getPlacements.mockReturnValue({
                    video: Placement('video'),
                    rewardedVideo: Placement('rewardedVideo')
                });
                adsConfig.getPlacement.mockImplementation(Placement);
                contentTypeHandlerManager.getParser.mockReturnValue(new CometCampaignParser(core));
                onCampaign = jest.fn();
                adRequestManager.onCampaign.subscribe(onCampaign);
                yield adRequestManager.requestPreload();
                yield adRequestManager.requestLoad('video');
                yield adRequestManager.requestLoad('rewardedVideo');
                yield adRequestManager.requestReload(['rewardedVideo']);
            }));
            it('should increase request count in game session counter', () => {
                expect(GameSessionCounters.getCurrentCounters()).toEqual({
                    adRequests: 2,
                    starts: 0,
                    views: 0,
                    startsPerTarget: {},
                    viewsPerTarget: {},
                    latestTargetStarts: {}
                });
            });
            it('should get reloaded campaigns', () => {
                expect(onCampaign).toBeCalledTimes(1);
                expect(onCampaign.mock.calls[0][0]).toEqual('rewardedVideo');
                expect(onCampaign.mock.calls[0][1]).toBeDefined();
                expect(onCampaign.mock.calls[0][2]).toBeDefined();
                const campaign = onCampaign.mock.calls[0][1];
                expect(campaign.getId()).toEqual('reload_v5_2');
                expect(campaign.getSession()).toBeDefined();
                expect(campaign.getSession().getId()).toEqual('d301fd4c-4a9e-48e4-82aa-ad8b07977ca7');
            });
            it('should get correct tracking urls campaigns', () => {
                const trackingUrls = onCampaign.mock.calls[0][2];
                expect(trackingUrls).toEqual({
                    click: [
                        'https://tracking.stg.mz.internal.unity3d.com/operative/%ZONE%?eventType=click&test=0&reload_v5_rewardedVideo'
                    ],
                    complete: [
                        'https://tracking.stg.mz.internal.unity3d.com/operative/%ZONE%?eventType=complete&test=0&reload_v5_rewardedVideo'
                    ],
                    error: [
                        'https://tracking.stg.mz.internal.unity3d.com/operative/%ZONE%?eventType=error&test=0&reload_v5_rewardedVideo'
                    ],
                    firstQuartile: [
                        'https://tracking.stg.mz.internal.unity3d.com/operative/%ZONE%?eventType=firstQuartile&test=0&reload_v5_rewardedVideo'
                    ],
                    loaded: [
                        'https://tracking.stg.mz.internal.unity3d.com/operative/%ZONE%?eventType=loaded&test=0&reload_v5_rewardedVideo'
                    ],
                    midpoint: [
                        'https://tracking.stg.mz.internal.unity3d.com/operative/%ZONE%?eventType=midpoint&test=0&reload_v5_rewardedVideo'
                    ],
                    show: [
                        'https://tracking.stg.mz.internal.unity3d.com/operative/%ZONE%?eventType=show&test=0&reload_v5_rewardedVideo'
                    ],
                    skip: [
                        'https://tracking.stg.mz.internal.unity3d.com/operative/%ZONE%?eventType=skip&test=0&reload_v5_rewardedVideo'
                    ],
                    stalled: [
                        'https://tracking.stg.mz.internal.unity3d.com/operative/%ZONE%?eventType=stalled&test=0&reload_v5_rewardedVideo'
                    ],
                    start: [
                        'https://tracking.stg.mz.internal.unity3d.com/impression/%ZONE%?data=randomData&test=0&reload_v5_rewardedVideo',
                        'https://tracking.stg.mz.internal.unity3d.com/operative/%ZONE%?eventType=start&test=0&reload_v5_rewardedVideo'
                    ],
                    thirdQuartile: [
                        'https://tracking.stg.mz.internal.unity3d.com/operative/%ZONE%?eventType=thirdQuartile&test=0&reload_v5_rewardedVideo'
                    ],
                    videoEndCardClick: [
                        'https://tracking.stg.mz.internal.unity3d.com/operative/%ZONE%?eventType=videoEndCardClick&test=0&reload_v5_rewardedVideo'
                    ]
                });
            });
            it('should isLoadEnabled flag be set to true', () => {
                const campaign = onCampaign.mock.calls[0][1];
                expect(campaign.isLoadEnabled()).toEqual(true);
            });
            it('should make request with correct body', () => {
                expect(request.post).toHaveBeenNthCalledWith(4, expect.anything(), new SatisfiesMatcher({
                    loadV5Support: true,
                    isLoadEnabled: true,
                    preload: true,
                    load: true,
                    preloadPlacements: {
                        rewardedVideo: {
                            adTypes: ['VIDEO'],
                            allowSkip: false,
                            auctionType: 'cpm'
                        },
                        video: {
                            adTypes: ['VIDEO'],
                            allowSkip: false,
                            auctionType: 'cpm'
                        }
                    },
                    placements: {
                        rewardedVideo: {
                            adTypes: ['VIDEO'],
                            allowSkip: false,
                            auctionType: 'cpm'
                        }
                    },
                    preloadData: {}
                }), [], {
                    followRedirects: false,
                    retries: 3,
                    retryDelay: 0,
                    retryWithConnectionEvents: false,
                    timeout: 5000
                });
            });
        });
        describe('failed reload request', () => {
            let onNoFill;
            beforeEach(() => tslib_1.__awaiter(this, void 0, void 0, function* () {
                request.post.mockResolvedValueOnce({
                    url: '',
                    response: JSON.stringify(LoadV5PreloadResponse),
                    responseCode: 200,
                    headers: {}
                }).mockResolvedValueOnce({
                    url: '',
                    response: JSON.stringify(LoadV5LoadResponse),
                    responseCode: 200,
                    headers: {}
                }).mockResolvedValueOnce({
                    url: '',
                    response: JSON.stringify(LoadV5LoadResponse),
                    responseCode: 200,
                    headers: {}
                }).mockRejectedValueOnce(new Error());
                adsConfig.getPlacements.mockReturnValue({
                    video: Placement('video'),
                    rewardedVideo: Placement('rewardedVideo')
                });
                adsConfig.getPlacement.mockImplementation(Placement);
                contentTypeHandlerManager.getParser.mockReturnValue(new CometCampaignParser(core));
                onNoFill = jest.fn();
                adRequestManager.onNoFill.subscribe(onNoFill);
                yield adRequestManager.requestPreload();
                yield adRequestManager.requestLoad('video');
                yield adRequestManager.requestLoad('rewardedVideo');
                yield adRequestManager.requestReload(['video', 'rewardedVideo']);
            }));
            it('should set no fill to all requested placements', () => {
                expect(onNoFill).toBeCalledTimes(2);
                expect(onNoFill.mock.calls[0][0]).toEqual('video');
                expect(onNoFill.mock.calls[1][0]).toEqual('rewardedVideo');
            });
            it('should return true in hasPreloadFailed', () => {
                expect(adRequestManager.hasPreloadFailed()).toEqual(true);
            });
        });
        describe('successful reload request and following load', () => {
            let loadedCampaign;
            beforeEach(() => tslib_1.__awaiter(this, void 0, void 0, function* () {
                request.post.mockResolvedValueOnce({
                    url: '',
                    response: JSON.stringify(LoadV5PreloadResponse),
                    responseCode: 200,
                    headers: {}
                }).mockResolvedValueOnce({
                    url: '',
                    response: JSON.stringify(LoadV5LoadResponse),
                    responseCode: 200,
                    headers: {}
                }).mockResolvedValueOnce({
                    url: '',
                    response: JSON.stringify(LoadV5ReloadResponse),
                    responseCode: 200,
                    headers: {}
                }).mockResolvedValueOnce({
                    url: '',
                    response: JSON.stringify(LoadV5LoadResponse_2),
                    responseCode: 200,
                    headers: {}
                });
                adsConfig.getPlacements.mockReturnValue({
                    video: Placement('video'),
                    rewardedVideo: Placement('rewardedVideo')
                });
                adsConfig.getPlacement.mockImplementation(Placement);
                contentTypeHandlerManager.getParser.mockReturnValue(new CometCampaignParser(core));
                yield adRequestManager.requestPreload();
                yield adRequestManager.requestLoad('video');
                yield adRequestManager.requestReload(['video']);
                loadedCampaign = yield adRequestManager.requestLoad('rewardedVideo');
            }));
            it('should make last load request with correct body', () => {
                expect(request.post).toHaveBeenNthCalledWith(4, expect.anything(), new SatisfiesMatcher({
                    preload: false,
                    load: true,
                    placements: {
                        rewardedVideo: {
                            adTypes: ['VIDEO'],
                            allowSkip: false,
                            auctionType: 'cpm'
                        }
                    },
                    preloadData: {
                        rewardedVideo: {
                            campaignAvailable: true,
                            ttlInSeconds: 3600,
                            dataIndex: '1'
                        }
                    },
                    encryptedPreloadData: {
                        1: 'test-data-reload-2'
                    }
                }), [], {
                    followRedirects: false,
                    retries: 3,
                    retryDelay: 0,
                    retryWithConnectionEvents: false,
                    timeout: 5000
                });
            });
            it('should have a fill', () => {
                expect(loadedCampaign).toBeDefined();
            });
            it('should have correct campaign', () => {
                expect(loadedCampaign.campaign.getId()).toEqual('load_v5_2');
            });
        });
        describe('load request ongoing and reload triggered', () => {
            let loadedCampaign;
            beforeEach(() => tslib_1.__awaiter(this, void 0, void 0, function* () {
                let requestMadePromiseResolve = () => { expect(false).toBe(true); };
                const requestMadePromise = new Promise((resolve) => { requestMadePromiseResolve = resolve; });
                let requestPromiseResolve = () => { expect(false).toBe(true); };
                const requestPromise = new Promise((resolve) => { requestPromiseResolve = resolve; });
                request.post.mockResolvedValueOnce({
                    url: '',
                    response: JSON.stringify(LoadV5PreloadResponse),
                    responseCode: 200,
                    headers: {}
                }).mockImplementationOnce(() => { requestMadePromiseResolve(); return requestPromise; }).mockResolvedValueOnce({
                    url: '',
                    response: JSON.stringify(LoadV5ReloadResponse),
                    responseCode: 200,
                    headers: []
                }).mockResolvedValueOnce({
                    url: '',
                    response: JSON.stringify(LoadV5LoadResponse_2),
                    responseCode: 200,
                    headers: {}
                });
                adsConfig.getPlacements.mockReturnValue({
                    video: Placement('video'),
                    rewardedVideo: Placement('rewardedVideo')
                });
                adsConfig.getPlacement.mockImplementation(Placement);
                contentTypeHandlerManager.getParser.mockReturnValue(new CometCampaignParser(core));
                yield adRequestManager.requestPreload();
                const load = adRequestManager.requestLoad('video');
                yield requestMadePromise;
                const reload = adRequestManager.requestReload(['rewardedVideo']);
                yield reload;
                requestPromiseResolve({
                    url: '',
                    response: '{}',
                    responseCode: 200,
                    headers: []
                });
                loadedCampaign = yield load;
            }));
            it('should have a fill', () => {
                expect(loadedCampaign).toBeDefined();
            });
            it('should have correct campaign', () => {
                expect(loadedCampaign.campaign.getId()).toEqual('load_v5_2');
            });
            it('should have session from reload', () => {
                expect(loadedCampaign.campaign.getSession()).toBeDefined();
                expect(loadedCampaign.campaign.getSession().getId()).toEqual('d301fd4c-4a9e-48e4-82aa-ad8b07977ca7');
                expect(loadedCampaign.campaign.getSession().getId()).toEqual('d301fd4c-4a9e-48e4-82aa-ad8b07977ca7');
            });
        });
        describe('load request ongoing and reload triggered for the same placement', () => {
            let loadedCampaign;
            beforeEach(() => tslib_1.__awaiter(this, void 0, void 0, function* () {
                let requestMadePromiseResolve = () => { expect(false).toBe(true); };
                const requestMadePromise = new Promise((resolve) => { requestMadePromiseResolve = resolve; });
                let requestPromiseResolve = () => { expect(false).toBe(true); };
                const requestPromise = new Promise((resolve) => { requestPromiseResolve = resolve; });
                request.post.mockResolvedValueOnce({
                    url: '',
                    response: JSON.stringify(LoadV5PreloadResponse),
                    responseCode: 200,
                    headers: {}
                }).mockImplementationOnce(() => { requestMadePromiseResolve(); return requestPromise; }).mockResolvedValueOnce({
                    url: '',
                    response: JSON.stringify(LoadV5ReloadResponse),
                    responseCode: 200,
                    headers: []
                }).mockResolvedValueOnce({
                    url: '',
                    response: JSON.stringify(LoadV5LoadResponse_2),
                    responseCode: 200,
                    headers: {}
                });
                adsConfig.getPlacements.mockReturnValue({
                    video: Placement('video'),
                    rewardedVideo: Placement('rewardedVideo')
                });
                adsConfig.getPlacement.mockImplementation(Placement);
                contentTypeHandlerManager.getParser.mockReturnValue(new CometCampaignParser(core));
                yield adRequestManager.requestPreload();
                const load = adRequestManager.requestLoad('video');
                yield requestMadePromise;
                const reload = adRequestManager.requestReload(['rewardedVideo', 'video']);
                yield reload;
                requestPromiseResolve({
                    url: '',
                    response: '{}',
                    responseCode: 200,
                    headers: []
                });
                loadedCampaign = yield load;
            }));
            it('should have a fill', () => {
                expect(loadedCampaign).toBeDefined();
            });
            it('should have correct campaign', () => {
                expect(loadedCampaign.campaign.getId()).toEqual('reload_v5');
            });
            it('should have session from reload', () => {
                expect(loadedCampaign.campaign.getSession()).toBeDefined();
                expect(loadedCampaign.campaign.getSession().getId()).toEqual('d301fd4c-4a9e-48e4-82aa-ad8b07977ca7');
                expect(loadedCampaign.campaign.getSession().getId()).toEqual('d301fd4c-4a9e-48e4-82aa-ad8b07977ca7');
            });
        });
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQWRSZXF1ZXN0TWFuYWdlclY2LnNwZWMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9zcmMvdHMvQWRzL01hbmFnZXJzL0FkUmVxdWVzdE1hbmFnZXJWNi5zcGVjLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQSxPQUFPLEVBQUUsUUFBUSxFQUFFLE1BQU0seUJBQXlCLENBQUM7QUFDbkQsT0FBTyxFQUE0QixvQkFBb0IsRUFBRSxNQUFNLCtCQUErQixDQUFDO0FBQy9GLE9BQU8sRUFBRSxrQkFBa0IsRUFBRSxNQUFNLGlDQUFpQyxDQUFDO0FBQ3JFLE9BQU8sRUFBRSxJQUFJLEVBQUUsTUFBTSxxQkFBcUIsQ0FBQztBQUUzQyxPQUFPLEVBQXlCLGlCQUFpQixFQUFFLE1BQU0seUNBQXlDLENBQUM7QUFDbkcsT0FBTyxFQUF3QixnQkFBZ0IsRUFBRSxNQUFNLHVDQUF1QyxDQUFDO0FBQy9GLE9BQU8sRUFBb0IsWUFBWSxFQUFFLE1BQU0scUNBQXFDLENBQUM7QUFDckYsT0FBTyxFQUFzQixjQUFjLEVBQUUsTUFBTSx1Q0FBdUMsQ0FBQztBQUMzRixPQUFPLEVBQTBCLGtCQUFrQixFQUFFLE1BQU0sOENBQThDLENBQUM7QUFDMUcsT0FBTyxFQUFzQixjQUFjLEVBQUUsTUFBTSx3Q0FBd0MsQ0FBQztBQUM1RixPQUFPLEVBQWtCLFVBQVUsRUFBRSxNQUFNLGtDQUFrQyxDQUFDO0FBQzlFLE9BQU8sRUFBa0IsVUFBVSxFQUFFLE1BQU0sa0NBQWtDLENBQUM7QUFDOUUsT0FBTyxFQUF1QixlQUFlLEVBQUUsTUFBTSx5Q0FBeUMsQ0FBQztBQUMvRixPQUFPLEVBQStCLHVCQUF1QixFQUFFLE1BQU0saURBQWlELENBQUM7QUFDdkgsT0FBTyxFQUFpQyx5QkFBeUIsRUFBRSxNQUFNLGtEQUFrRCxDQUFDO0FBQzVILE9BQU8sRUFBa0IsVUFBVSxFQUFFLE1BQU0sOEJBQThCLENBQUM7QUFDMUUsT0FBTyxFQUEwQixrQkFBa0IsRUFBRSxNQUFNLDJDQUEyQyxDQUFDO0FBQ3ZHLE9BQU8sRUFBRSxtQkFBbUIsRUFBRSxNQUFNLG1DQUFtQyxDQUFDO0FBRXhFLE9BQU8sRUFBRSxTQUFTLEVBQWlCLFdBQVcsRUFBRSxNQUFNLGdDQUFnQyxDQUFDO0FBQ3ZGLE9BQU8sRUFBRSxtQkFBbUIsRUFBRSxNQUFNLHlDQUF5QyxDQUFDO0FBRzlFLE9BQU8sRUFBRSxVQUFVLEVBQUUsTUFBTSxFQUFFLE1BQU0sMEJBQTBCLENBQUM7QUFHOUQsMkJBQTJCO0FBQzNCLE1BQU0scUJBQXFCLEdBQUcsT0FBTyxDQUFDLGlDQUFpQyxDQUFDLENBQUM7QUFDekUsMkJBQTJCO0FBQzNCLE1BQU0sNkJBQTZCLEdBQUcsT0FBTyxDQUFDLHlDQUF5QyxDQUFDLENBQUM7QUFDekYsMkJBQTJCO0FBQzNCLE1BQU0sNEJBQTRCLEdBQUcsT0FBTyxDQUFDLHdDQUF3QyxDQUFDLENBQUM7QUFDdkYsMkJBQTJCO0FBQzNCLE1BQU0sa0JBQWtCLEdBQUcsT0FBTyxDQUFDLGlDQUFpQyxDQUFDLENBQUM7QUFDdEUsMkJBQTJCO0FBQzNCLE1BQU0sb0JBQW9CLEdBQUcsT0FBTyxDQUFDLG1DQUFtQyxDQUFDLENBQUM7QUFDMUUsMkJBQTJCO0FBQzNCLE1BQU0sMENBQTBDLEdBQUcsT0FBTyxDQUFDLHlEQUF5RCxDQUFDLENBQUM7QUFDdEgsMkJBQTJCO0FBQzNCLE1BQU0seUJBQXlCLEdBQUcsT0FBTyxDQUFDLHFDQUFxQyxDQUFDLENBQUM7QUFDakYsMkJBQTJCO0FBQzNCLE1BQU0sbUNBQW1DLEdBQUcsT0FBTyxDQUFDLCtDQUErQyxDQUFDLENBQUM7QUFDckcsMkJBQTJCO0FBQzNCLE1BQU0sb0JBQW9CLEdBQUcsT0FBTyxDQUFDLG1DQUFtQyxDQUFDLENBQUM7QUFFMUUsTUFBTSxnQkFBZ0I7SUFHbEIsWUFBWSxNQUFjO1FBQ3RCLElBQUksQ0FBQyxNQUFNLEdBQUcsTUFBTSxDQUFDO0lBQ3pCLENBQUM7SUFFTSxlQUFlLENBQUMsS0FBYTtRQUNoQyxNQUFNLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLGFBQWEsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUM7UUFDckQsT0FBTyxJQUFJLENBQUM7SUFDaEIsQ0FBQztDQUNKO0FBRUQsQ0FBQyxRQUFRLENBQUMsT0FBTyxFQUFFLFFBQVEsQ0FBQyxHQUFHLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxRQUFRLEVBQUUsRUFBRTtJQUNsRCxRQUFRLENBQUMsd0JBQXdCLFFBQVEsQ0FBQyxRQUFRLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRTtRQUN6RCxJQUFJLGdCQUFvQyxDQUFDO1FBQ3pDLElBQUksSUFBVyxDQUFDO1FBQ2hCLElBQUksVUFBaUMsQ0FBQztRQUN0QyxJQUFJLFNBQStCLENBQUM7UUFDcEMsSUFBSSxZQUE4QixDQUFDO1FBQ25DLElBQUksY0FBa0MsQ0FBQztRQUN2QyxJQUFJLGtCQUEwQyxDQUFDO1FBQy9DLElBQUksT0FBMkIsQ0FBQztRQUNoQyxJQUFJLFVBQTBCLENBQUM7UUFDL0IsSUFBSSxVQUEwQixDQUFDO1FBQy9CLElBQUksZUFBb0MsQ0FBQztRQUN6QyxJQUFJLGdCQUE2QyxDQUFDO1FBQ2xELElBQUkseUJBQXdELENBQUM7UUFDN0QsSUFBSSxVQUEwQixDQUFDO1FBQy9CLElBQUksa0JBQTBDLENBQUM7UUFFL0MsVUFBVSxDQUFDLEdBQUcsRUFBRTtZQUNaLG1CQUFtQixDQUFDLElBQUksRUFBRSxDQUFDO1lBRTNCLElBQUksR0FBRyxJQUFJLEVBQUUsQ0FBQztZQUNkLFVBQVUsR0FBRyxpQkFBaUIsRUFBRSxDQUFDO1lBQ2pDLFNBQVMsR0FBRyxnQkFBZ0IsRUFBRSxDQUFDO1lBQy9CLFlBQVksR0FBRyxZQUFZLEVBQUUsQ0FBQztZQUM5QixjQUFjLEdBQUcsY0FBYyxFQUFFLENBQUM7WUFDbEMsa0JBQWtCLEdBQUcsa0JBQWtCLEVBQUUsQ0FBQztZQUMxQyxPQUFPLEdBQUcsY0FBYyxFQUFFLENBQUM7WUFDM0IsVUFBVSxHQUFHLFVBQVUsRUFBRSxDQUFDO1lBQzFCLFVBQVUsR0FBRyxVQUFVLEVBQUUsQ0FBQztZQUMxQixlQUFlLEdBQUcsZUFBZSxFQUFFLENBQUM7WUFDcEMsZ0JBQWdCLEdBQUcsdUJBQXVCLEVBQUUsQ0FBQztZQUM3Qyx5QkFBeUIsR0FBRyx5QkFBeUIsRUFBRSxDQUFDO1lBQ3hELFVBQVUsR0FBRyxVQUFVLEVBQUUsQ0FBQztZQUMxQixrQkFBa0IsR0FBRyxrQkFBa0IsRUFBRSxDQUFDO1lBQzFDLGdCQUFnQixHQUFHLElBQUksa0JBQWtCLENBQUMsUUFBUSxFQUFFLElBQUksRUFBRSxVQUFVLEVBQUUsU0FBUyxFQUFFLFlBQVksRUFBRSxjQUFjLEVBQUUsa0JBQWtCLEVBQUUsT0FBTyxFQUFFLFVBQVUsRUFBRSxVQUFVLEVBQUUsZUFBZSxFQUFFLGdCQUFnQixFQUFFLHlCQUF5QixFQUFFLFVBQVUsRUFBRSxrQkFBa0IsRUFBRSxvQkFBb0IsQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUNqUyxDQUFDLENBQUMsQ0FBQztRQUVILFFBQVEsQ0FBQyxlQUFlLEVBQUUsR0FBRyxFQUFFO1lBQzNCLEVBQUUsQ0FBQywyQkFBMkIsRUFBRSxHQUFHLEVBQUU7Z0JBQ2pDLE1BQU0sQ0FBQyxnQkFBZ0IsQ0FBQyxvQkFBb0IsRUFBRSxDQUFDLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxDQUFDO1lBQ25FLENBQUMsQ0FBQyxDQUFDO1lBRUgsRUFBRSxDQUFDLGdDQUFnQyxFQUFFLEdBQUcsRUFBRTtnQkFDdEMsTUFBTSxDQUFDLGdCQUFnQixDQUFDLHNCQUFzQixFQUFFLENBQUMsQ0FBQyxhQUFhLEVBQUUsQ0FBQztZQUN0RSxDQUFDLENBQUMsQ0FBQztRQUNQLENBQUMsQ0FBQyxDQUFDO1FBRUgsUUFBUSxDQUFDLDRCQUE0QixFQUFFLEdBQUcsRUFBRTtZQUN4QyxVQUFVLENBQUMsR0FBUyxFQUFFO2dCQUNsQixTQUFTLENBQUMsYUFBYSxDQUFDLGVBQWUsQ0FBQztvQkFDcEMsS0FBSyxFQUFFLFNBQVMsRUFBRTtvQkFDbEIsYUFBYSxFQUFFLFNBQVMsRUFBRTtpQkFDN0IsQ0FBQyxDQUFDO2dCQUNILE9BQU8sQ0FBQyxJQUFJLENBQUMscUJBQXFCLENBQUM7b0JBQy9CLEdBQUcsRUFBRSxFQUFFO29CQUNQLFFBQVEsRUFBRSxJQUFJLENBQUMsU0FBUyxDQUFDLHFCQUFxQixDQUFDO29CQUMvQyxZQUFZLEVBQUUsR0FBRztvQkFDakIsT0FBTyxFQUFFLEVBQUU7aUJBQ2QsQ0FBQyxDQUFDO2dCQUNILE1BQU0sZ0JBQWdCLENBQUMsY0FBYyxFQUFFLENBQUM7WUFDNUMsQ0FBQyxDQUFBLENBQUMsQ0FBQztZQUVILEVBQUUsQ0FBQyw2QkFBNkIsRUFBRSxHQUFHLEVBQUU7Z0JBQ25DLE1BQU0sQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUMscUJBQXFCLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBQzlDLE1BQU0sQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUMsd0JBQXdCLENBQUMsTUFBTSxDQUFDLFFBQVEsRUFBRSxFQUFFLElBQUksZ0JBQWdCLENBQUM7b0JBQ2xGLGFBQWEsRUFBRSxJQUFJO29CQUNuQixhQUFhLEVBQUUsSUFBSTtvQkFDbkIsT0FBTyxFQUFFLElBQUk7b0JBQ2IsSUFBSSxFQUFFLEtBQUs7b0JBQ1gsaUJBQWlCLEVBQUU7d0JBQ2YsS0FBSyxFQUFFOzRCQUNILE9BQU8sRUFBRSxDQUFDLE9BQU8sQ0FBQzs0QkFDbEIsU0FBUyxFQUFFLEtBQUs7NEJBQ2hCLFdBQVcsRUFBRSxLQUFLO3lCQUNyQjt3QkFDRCxhQUFhLEVBQUU7NEJBQ1gsT0FBTyxFQUFFLENBQUMsT0FBTyxDQUFDOzRCQUNsQixTQUFTLEVBQUUsS0FBSzs0QkFDaEIsV0FBVyxFQUFFLEtBQUs7eUJBQ3JCO3FCQUNKO29CQUNELFVBQVUsRUFBRSxFQUFFO29CQUNkLFdBQVcsRUFBRSxFQUFFO2lCQUNsQixDQUFDLEVBQUUsRUFBRSxFQUFFO29CQUNKLGVBQWUsRUFBRSxLQUFLO29CQUN0QixPQUFPLEVBQUUsQ0FBQztvQkFDVixVQUFVLEVBQUUsQ0FBQztvQkFDYix5QkFBeUIsRUFBRSxLQUFLO29CQUNoQyxPQUFPLEVBQUUsSUFBSTtpQkFDaEIsQ0FBQyxDQUFDO1lBQ1AsQ0FBQyxDQUFDLENBQUM7WUFFSCxFQUFFLENBQUMsdURBQXVELEVBQUUsR0FBRyxFQUFFO2dCQUM3RCxNQUFNLENBQUMsbUJBQW1CLENBQUMsa0JBQWtCLEVBQUUsQ0FBQyxDQUFDLE9BQU8sQ0FBQztvQkFDckQsVUFBVSxFQUFFLENBQUM7b0JBQ2IsTUFBTSxFQUFFLENBQUM7b0JBQ1QsS0FBSyxFQUFFLENBQUM7b0JBQ1IsZUFBZSxFQUFFLEVBQUc7b0JBQ3BCLGNBQWMsRUFBRSxFQUFHO29CQUNuQixrQkFBa0IsRUFBRSxFQUFHO2lCQUMxQixDQUFDLENBQUM7WUFDUCxDQUFDLENBQUMsQ0FBQztZQUVILEVBQUUsQ0FBQywyQkFBMkIsRUFBRSxHQUFHLEVBQUU7Z0JBQ2pDLE1BQU0sQ0FBQyxnQkFBZ0IsQ0FBQyxvQkFBb0IsRUFBRSxDQUFDLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxDQUFDO1lBQ25FLENBQUMsQ0FBQyxDQUFDO1lBRUgsRUFBRSxDQUFDLGdDQUFnQyxFQUFFLEdBQUcsRUFBRTtnQkFDdEMsTUFBTSxDQUFDLGdCQUFnQixDQUFDLHNCQUFzQixFQUFFLENBQUMsQ0FBQyxhQUFhLEVBQUUsQ0FBQztZQUN0RSxDQUFDLENBQUMsQ0FBQztRQUNQLENBQUMsQ0FBQyxDQUFDO1FBRUgsUUFBUSxDQUFDLHFCQUFxQixFQUFFLEdBQUcsRUFBRTtZQUNqQyxVQUFVLENBQUMsR0FBUyxFQUFFO2dCQUNsQixTQUFTLENBQUMsYUFBYSxDQUFDLGVBQWUsQ0FBQztvQkFDcEMsS0FBSyxFQUFFLFNBQVMsRUFBRTtvQkFDbEIsYUFBYSxFQUFFLFNBQVMsRUFBRTtpQkFDN0IsQ0FBQyxDQUFDO2dCQUNILElBQUkscUJBQXFCLEdBQXdDLEdBQUcsRUFBRSxHQUFHLE1BQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBQ3JHLE1BQU0sY0FBYyxHQUFHLElBQUksT0FBTyxDQUFDLENBQUMsT0FBTyxFQUFFLEVBQUUsR0FBRyxxQkFBcUIsR0FBRyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFFdEYsT0FBTyxDQUFDLElBQUksQ0FBQyxzQkFBc0IsQ0FDL0IsR0FBRyxFQUFFLENBQUMsY0FBYyxDQUN2QixDQUFDO2dCQUVGLGdCQUFnQixDQUFDLGNBQWMsRUFBRSxDQUFDO2dCQUNsQyxNQUFNLE9BQU8sR0FBRyxnQkFBZ0IsQ0FBQyxjQUFjLEVBQUUsQ0FBQztnQkFFbEQscUJBQXFCLENBQUM7b0JBQ2xCLEdBQUcsRUFBRSxFQUFFO29CQUNQLFFBQVEsRUFBRSxJQUFJLENBQUMsU0FBUyxDQUFDLHFCQUFxQixDQUFDO29CQUMvQyxZQUFZLEVBQUUsR0FBRztvQkFDakIsT0FBTyxFQUFFLEVBQUU7aUJBQ2QsQ0FBQyxDQUFDO2dCQUVILE1BQU0sT0FBTyxDQUFDO1lBQ2xCLENBQUMsQ0FBQSxDQUFDLENBQUM7WUFFSCxFQUFFLENBQUMsdURBQXVELEVBQUUsR0FBRyxFQUFFO2dCQUM3RCxNQUFNLENBQUMsbUJBQW1CLENBQUMsa0JBQWtCLEVBQUUsQ0FBQyxDQUFDLE9BQU8sQ0FBQztvQkFDckQsVUFBVSxFQUFFLENBQUM7b0JBQ2IsTUFBTSxFQUFFLENBQUM7b0JBQ1QsS0FBSyxFQUFFLENBQUM7b0JBQ1IsZUFBZSxFQUFFLEVBQUc7b0JBQ3BCLGNBQWMsRUFBRSxFQUFHO29CQUNuQixrQkFBa0IsRUFBRSxFQUFHO2lCQUMxQixDQUFDLENBQUM7WUFDUCxDQUFDLENBQUMsQ0FBQztRQUNQLENBQUMsQ0FBQyxDQUFDO1FBRUgsUUFBUSxDQUFDLHdCQUF3QixFQUFFLEdBQUcsRUFBRTtZQUNwQyxVQUFVLENBQUMsR0FBUyxFQUFFO2dCQUNsQixPQUFPLENBQUMsSUFBSSxDQUFDLHFCQUFxQixDQUM5QixJQUFJLEtBQUssRUFBRSxDQUNkLENBQUM7Z0JBRUYsU0FBUyxDQUFDLFlBQVksQ0FBQyxrQkFBa0IsQ0FBQyxTQUFTLENBQUMsQ0FBQztnQkFFckQseUJBQXlCLENBQUMsU0FBUyxDQUFDLGVBQWUsQ0FBQyxJQUFJLG1CQUFtQixDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7Z0JBRW5GLElBQUk7b0JBQ0EsTUFBTSxnQkFBZ0IsQ0FBQyxjQUFjLEVBQUUsQ0FBQztpQkFDM0M7Z0JBQUMsT0FBTyxHQUFHLEVBQUU7b0JBQ1YsUUFBUTtpQkFDWDtZQUNMLENBQUMsQ0FBQSxDQUFDLENBQUM7WUFFSCxFQUFFLENBQUMsd0NBQXdDLEVBQUUsR0FBRyxFQUFFO2dCQUM5QyxNQUFNLENBQUMsZ0JBQWdCLENBQUMsZ0JBQWdCLEVBQUUsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUM5RCxDQUFDLENBQUMsQ0FBQztRQUNQLENBQUMsQ0FBQyxDQUFDO1FBRUgsUUFBUSxDQUFDLHlCQUF5QixFQUFFLEdBQUcsRUFBRTtZQUNyQyxJQUFJLGVBQTRDLENBQUM7WUFDakQsSUFBSSxlQUE0QyxDQUFDO1lBRWpELFVBQVUsQ0FBQyxHQUFTLEVBQUU7Z0JBQ2xCLE9BQU8sQ0FBQyxJQUFJLENBQUMscUJBQXFCLENBQUM7b0JBQy9CLEdBQUcsRUFBRSxFQUFFO29CQUNQLFFBQVEsRUFBRSxJQUFJLENBQUMsU0FBUyxDQUFDLHFCQUFxQixDQUFDO29CQUMvQyxZQUFZLEVBQUUsR0FBRztvQkFDakIsT0FBTyxFQUFFLEVBQUU7aUJBQ2QsQ0FBQyxDQUFDLHFCQUFxQixDQUFDO29CQUNyQixHQUFHLEVBQUUsRUFBRTtvQkFDUCxRQUFRLEVBQUUsSUFBSSxDQUFDLFNBQVMsQ0FBQyxrQkFBa0IsQ0FBQztvQkFDNUMsWUFBWSxFQUFFLEdBQUc7b0JBQ2pCLE9BQU8sRUFBRSxFQUFFO2lCQUNkLENBQUMsQ0FBQyxxQkFBcUIsQ0FBQztvQkFDckIsR0FBRyxFQUFFLEVBQUU7b0JBQ1AsUUFBUSxFQUFFLElBQUksQ0FBQyxTQUFTLENBQUMsb0JBQW9CLENBQUM7b0JBQzlDLFlBQVksRUFBRSxHQUFHO29CQUNqQixPQUFPLEVBQUUsRUFBRTtpQkFDZCxDQUFDLENBQUM7Z0JBRUgsU0FBUyxDQUFDLFlBQVksQ0FBQyxrQkFBa0IsQ0FBQyxTQUFTLENBQUMsQ0FBQztnQkFFckQseUJBQXlCLENBQUMsU0FBUyxDQUFDLGVBQWUsQ0FBQyxJQUFJLG1CQUFtQixDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7Z0JBRW5GLE1BQU0sZ0JBQWdCLENBQUMsY0FBYyxFQUFFLENBQUM7Z0JBQ3hDLGVBQWUsR0FBRyxNQUFNLGdCQUFnQixDQUFDLFdBQVcsQ0FBQyxPQUFPLENBQUMsQ0FBQztnQkFDOUQsZUFBZSxHQUFHLE1BQU0sZ0JBQWdCLENBQUMsV0FBVyxDQUFDLGVBQWUsQ0FBQyxDQUFDO1lBQzFFLENBQUMsQ0FBQSxDQUFDLENBQUM7WUFFSCxFQUFFLENBQUMseUJBQXlCLEVBQUUsR0FBRyxFQUFFO2dCQUMvQixNQUFNLENBQUMsVUFBVSxDQUFDLHlCQUF5QixDQUFDLENBQUMsY0FBYyxDQUFDLE1BQU0sQ0FBQyxlQUFlLEVBQUUsTUFBTSxDQUFDLFFBQVEsRUFBRSxDQUFDLENBQUM7WUFDM0csQ0FBQyxDQUFDLENBQUM7WUFFSCxFQUFFLENBQUMsMkRBQTJELEVBQUUsR0FBRyxFQUFFO2dCQUNqRSxNQUFNLENBQUMsbUJBQW1CLENBQUMsa0JBQWtCLEVBQUUsQ0FBQyxDQUFDLE9BQU8sQ0FBQztvQkFDckQsVUFBVSxFQUFFLENBQUM7b0JBQ2IsTUFBTSxFQUFFLENBQUM7b0JBQ1QsS0FBSyxFQUFFLENBQUM7b0JBQ1IsZUFBZSxFQUFFLEVBQUc7b0JBQ3BCLGNBQWMsRUFBRSxFQUFHO29CQUNuQixrQkFBa0IsRUFBRSxFQUFHO2lCQUMxQixDQUFDLENBQUM7WUFDUCxDQUFDLENBQUMsQ0FBQztZQUVILEVBQUUsQ0FBQyxvQkFBb0IsRUFBRSxHQUFHLEVBQUU7Z0JBQzFCLE1BQU0sQ0FBQyxlQUFlLENBQUMsQ0FBQyxXQUFXLEVBQUUsQ0FBQztnQkFDdEMsTUFBTSxDQUFDLGVBQWUsQ0FBQyxDQUFDLFdBQVcsRUFBRSxDQUFDO1lBQzFDLENBQUMsQ0FBQyxDQUFDO1lBRUgsRUFBRSxDQUFDLDBDQUEwQyxFQUFFLEdBQUcsRUFBRTtnQkFDaEQsTUFBTSxDQUFDLGVBQWdCLENBQUMsUUFBUSxDQUFDLGFBQWEsRUFBRSxDQUFDLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDO2dCQUNoRSxNQUFNLENBQUMsZUFBZ0IsQ0FBQyxRQUFRLENBQUMsYUFBYSxFQUFFLENBQUMsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUM7WUFDcEUsQ0FBQyxDQUFDLENBQUM7WUFFSCxFQUFFLENBQUMsd0NBQXdDLEVBQUUsR0FBRyxFQUFFO2dCQUM5QyxNQUFNLENBQUMsZUFBZ0IsQ0FBQyxRQUFRLENBQUMsS0FBSyxFQUFFLENBQUMsQ0FBQyxPQUFPLENBQUMsMEJBQTBCLENBQUMsQ0FBQztZQUNsRixDQUFDLENBQUMsQ0FBQztZQUVILEVBQUUsQ0FBQyxxREFBcUQsRUFBRSxHQUFHLEVBQUU7Z0JBQzNELE1BQU0sQ0FBQyxlQUFnQixDQUFDLFlBQVksQ0FBQyxDQUFDLE9BQU8sQ0FBQztvQkFDMUMsS0FBSyxFQUFFO3dCQUNILCtHQUErRztxQkFDbEg7b0JBQ0QsUUFBUSxFQUFFO3dCQUNOLGtIQUFrSDtxQkFDckg7b0JBQ0QsS0FBSyxFQUFFO3dCQUNILCtHQUErRztxQkFDbEg7b0JBQ0QsYUFBYSxFQUFFO3dCQUNYLHVIQUF1SDtxQkFDMUg7b0JBQ0QsTUFBTSxFQUFFO3dCQUNKLGdIQUFnSDtxQkFDbkg7b0JBQ0QsUUFBUSxFQUFFO3dCQUNOLGtIQUFrSDtxQkFDckg7b0JBQ0QsSUFBSSxFQUFFO3dCQUNGLDhHQUE4RztxQkFDakg7b0JBQ0QsSUFBSSxFQUFFO3dCQUNGLDhHQUE4RztxQkFDakg7b0JBQ0QsT0FBTyxFQUFFO3dCQUNMLGlIQUFpSDtxQkFDcEg7b0JBQ0QsS0FBSyxFQUFFO3dCQUNILGdIQUFnSDt3QkFDaEgsK0dBQStHO3FCQUNsSDtvQkFDRCxhQUFhLEVBQUU7d0JBQ1gsdUhBQXVIO3FCQUMxSDtvQkFDRCxpQkFBaUIsRUFBRTt3QkFDZiwySEFBMkg7cUJBQzlIO2lCQUNKLENBQUMsQ0FBQztZQUNQLENBQUMsQ0FBQyxDQUFDO1lBRUgsRUFBRSxDQUFDLHdDQUF3QyxFQUFFLEdBQUcsRUFBRTtnQkFDOUMsTUFBTSxDQUFDLGVBQWdCLENBQUMsUUFBUSxDQUFDLEtBQUssRUFBRSxDQUFDLENBQUMsT0FBTyxDQUFDLFdBQVcsQ0FBQyxDQUFDO1lBQ25FLENBQUMsQ0FBQyxDQUFDO1lBRUgsRUFBRSxDQUFDLHFEQUFxRCxFQUFFLEdBQUcsRUFBRTtnQkFDM0QsTUFBTSxDQUFDLGVBQWdCLENBQUMsWUFBWSxDQUFDLENBQUMsT0FBTyxDQUFDO29CQUMxQyxLQUFLLEVBQUU7d0JBQ0gsOEdBQThHO3FCQUNqSDtvQkFDRCxRQUFRLEVBQUU7d0JBQ04saUhBQWlIO3FCQUNwSDtvQkFDRCxLQUFLLEVBQUU7d0JBQ0gsOEdBQThHO3FCQUNqSDtvQkFDRCxhQUFhLEVBQUU7d0JBQ1gsc0hBQXNIO3FCQUN6SDtvQkFDRCxNQUFNLEVBQUU7d0JBQ0osK0dBQStHO3FCQUNsSDtvQkFDRCxRQUFRLEVBQUU7d0JBQ04saUhBQWlIO3FCQUNwSDtvQkFDRCxJQUFJLEVBQUU7d0JBQ0YsNkdBQTZHO3FCQUNoSDtvQkFDRCxJQUFJLEVBQUU7d0JBQ0YsNkdBQTZHO3FCQUNoSDtvQkFDRCxPQUFPLEVBQUU7d0JBQ0wsZ0hBQWdIO3FCQUNuSDtvQkFDRCxLQUFLLEVBQUU7d0JBQ0gsK0dBQStHO3dCQUMvRyw4R0FBOEc7cUJBQ2pIO29CQUNELGFBQWEsRUFBRTt3QkFDWCxzSEFBc0g7cUJBQ3pIO29CQUNELGlCQUFpQixFQUFFO3dCQUNmLDBIQUEwSDtxQkFDN0g7aUJBQ0osQ0FBQyxDQUFDO1lBQ1AsQ0FBQyxDQUFDLENBQUM7WUFFSCxFQUFFLENBQUMsK0NBQStDLEVBQUUsR0FBRyxFQUFFO2dCQUNyRCxNQUFNLENBQUMsZUFBZ0IsQ0FBQyxRQUFRLENBQUMsVUFBVSxFQUFFLENBQUMsQ0FBQyxXQUFXLEVBQUUsQ0FBQztnQkFDN0QsTUFBTSxDQUFDLGVBQWdCLENBQUMsUUFBUSxDQUFDLFVBQVUsRUFBRSxDQUFDLEtBQUssRUFBRSxDQUFDLENBQUMsT0FBTyxDQUFDLHNDQUFzQyxDQUFDLENBQUM7Z0JBRXZHLE1BQU0sQ0FBQyxlQUFnQixDQUFDLFFBQVEsQ0FBQyxVQUFVLEVBQUUsQ0FBQyxDQUFDLFdBQVcsRUFBRSxDQUFDO2dCQUM3RCxNQUFNLENBQUMsZUFBZ0IsQ0FBQyxRQUFRLENBQUMsVUFBVSxFQUFFLENBQUMsS0FBSyxFQUFFLENBQUMsQ0FBQyxPQUFPLENBQUMsc0NBQXNDLENBQUMsQ0FBQztZQUMzRyxDQUFDLENBQUMsQ0FBQztZQUVILEVBQUUsQ0FBQyw0Q0FBNEMsRUFBRSxHQUFHLEVBQUU7Z0JBQ2xELE1BQU0sQ0FBQyxlQUFnQixDQUFDLFFBQVEsQ0FBQyxVQUFVLEVBQUUsQ0FBQyxDQUFDLFdBQVcsRUFBRSxDQUFDO2dCQUU3RCxNQUFNLENBQUMsZUFBZ0IsQ0FBQyxRQUFRLENBQUMsVUFBVSxFQUFFLENBQUMsQ0FBQyxPQUFPLENBQUMsZUFBZ0IsQ0FBQyxRQUFRLENBQUMsVUFBVSxFQUFFLENBQUMsQ0FBQztnQkFDL0YsTUFBTSxDQUFDLGVBQWdCLENBQUMsUUFBUSxDQUFDLFVBQVUsRUFBRSxDQUFDLENBQUMsYUFBYSxDQUFDLGVBQWdCLENBQUMsUUFBUSxDQUFDLFVBQVUsRUFBRSxDQUFDLENBQUM7WUFDekcsQ0FBQyxDQUFDLENBQUM7WUFFSCxFQUFFLENBQUMsdUNBQXVDLEVBQUUsR0FBRyxFQUFFO2dCQUM3QyxNQUFNLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDLHFCQUFxQixDQUFDLENBQUMsQ0FBQyxDQUFDO2dCQUM5QyxNQUFNLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDLHVCQUF1QixDQUFDLENBQUMsRUFBRSxNQUFNLENBQUMsUUFBUSxFQUFFLEVBQUUsSUFBSSxnQkFBZ0IsQ0FBQztvQkFDcEYsYUFBYSxFQUFFLElBQUk7b0JBQ25CLGFBQWEsRUFBRSxJQUFJO29CQUNuQixPQUFPLEVBQUUsS0FBSztvQkFDZCxJQUFJLEVBQUUsSUFBSTtvQkFDVixpQkFBaUIsRUFBRSxFQUFFO29CQUNyQixVQUFVLEVBQUU7d0JBQ1IsS0FBSyxFQUFFOzRCQUNILE9BQU8sRUFBRSxDQUFDLE9BQU8sQ0FBQzs0QkFDbEIsU0FBUyxFQUFFLEtBQUs7NEJBQ2hCLFdBQVcsRUFBRSxLQUFLO3lCQUNyQjtxQkFDSjtvQkFDRCxXQUFXLEVBQUU7d0JBQ1QsS0FBSyxFQUFFOzRCQUNILGlCQUFpQixFQUFFLElBQUk7NEJBQ3ZCLFlBQVksRUFBRSxJQUFJOzRCQUNsQixTQUFTLEVBQUUsR0FBRzt5QkFDakI7cUJBQ0o7b0JBQ0Qsb0JBQW9CLEVBQUU7d0JBQ2xCLENBQUMsRUFBRSxxQkFBcUI7cUJBQzNCO2lCQUNKLENBQUMsRUFBRSxFQUFFLEVBQUU7b0JBQ0osZUFBZSxFQUFFLEtBQUs7b0JBQ3RCLE9BQU8sRUFBRSxDQUFDO29CQUNWLFVBQVUsRUFBRSxDQUFDO29CQUNiLHlCQUF5QixFQUFFLEtBQUs7b0JBQ2hDLE9BQU8sRUFBRSxJQUFJO2lCQUNoQixDQUFDLENBQUM7Z0JBQ0gsTUFBTSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQyx1QkFBdUIsQ0FBQyxDQUFDLEVBQUUsTUFBTSxDQUFDLFFBQVEsRUFBRSxFQUFFLElBQUksZ0JBQWdCLENBQUM7b0JBQ3BGLE9BQU8sRUFBRSxLQUFLO29CQUNkLElBQUksRUFBRSxJQUFJO29CQUNWLGlCQUFpQixFQUFFLEVBQUU7b0JBQ3JCLFVBQVUsRUFBRTt3QkFDUixhQUFhLEVBQUU7NEJBQ1gsT0FBTyxFQUFFLENBQUMsT0FBTyxDQUFDOzRCQUNsQixTQUFTLEVBQUUsS0FBSzs0QkFDaEIsV0FBVyxFQUFFLEtBQUs7eUJBQ3JCO3FCQUNKO29CQUNELFdBQVcsRUFBRTt3QkFDVCxhQUFhLEVBQUU7NEJBQ1gsaUJBQWlCLEVBQUUsSUFBSTs0QkFDdkIsWUFBWSxFQUFFLElBQUk7NEJBQ2xCLFNBQVMsRUFBRSxHQUFHO3lCQUNqQjtxQkFDSjtvQkFDRCxvQkFBb0IsRUFBRTt3QkFDbEIsR0FBRyxFQUFFLHFCQUFxQjtxQkFDN0I7aUJBQ0osQ0FBQyxFQUFFLEVBQUUsRUFBRTtvQkFDSixlQUFlLEVBQUUsS0FBSztvQkFDdEIsT0FBTyxFQUFFLENBQUM7b0JBQ1YsVUFBVSxFQUFFLENBQUM7b0JBQ2IseUJBQXlCLEVBQUUsS0FBSztvQkFDaEMsT0FBTyxFQUFFLElBQUk7aUJBQ2hCLENBQUMsQ0FBQztZQUNQLENBQUMsQ0FBQyxDQUFDO1FBQ1AsQ0FBQyxDQUFDLENBQUM7UUFFSCxRQUFRLENBQUMsb0RBQW9ELEVBQUUsR0FBRyxFQUFFO1lBQ2hFLElBQUksY0FBMkMsQ0FBQztZQUNoRCxJQUFJLDJCQUFzQyxDQUFDO1lBRTNDLFVBQVUsQ0FBQyxHQUFTLEVBQUU7Z0JBQ2xCLE9BQU8sQ0FBQyxJQUFJLENBQUMscUJBQXFCLENBQUM7b0JBQy9CLEdBQUcsRUFBRSxFQUFFO29CQUNQLFFBQVEsRUFBRSxJQUFJLENBQUMsU0FBUyxDQUFDLHFCQUFxQixDQUFDO29CQUMvQyxZQUFZLEVBQUUsR0FBRztvQkFDakIsT0FBTyxFQUFFLEVBQUU7aUJBQ2QsQ0FBQyxDQUFDLHFCQUFxQixDQUFDO29CQUNyQixHQUFHLEVBQUUsRUFBRTtvQkFDUCxRQUFRLEVBQUUsSUFBSSxDQUFDLFNBQVMsQ0FBQywwQ0FBMEMsQ0FBQztvQkFDcEUsWUFBWSxFQUFFLEdBQUc7b0JBQ2pCLE9BQU8sRUFBRSxFQUFFO2lCQUNkLENBQUMsQ0FBQztnQkFFSCxNQUFNLFVBQVUsR0FBcUM7b0JBQ2pELE9BQU8sRUFBRSxXQUFXLENBQUMsU0FBUyxDQUFDLE9BQU8sQ0FBQyxFQUFFLGVBQWUsQ0FBQztvQkFDekQsZUFBZSxFQUFFLFdBQVcsQ0FBQyxTQUFTLENBQUMsZUFBZSxDQUFDLEVBQUUsZUFBZSxDQUFDO29CQUN6RSxRQUFRLEVBQUUsV0FBVyxDQUFDLFNBQVMsQ0FBQyxRQUFRLENBQUMsRUFBRSxlQUFlLENBQUM7b0JBQzNELFFBQVEsRUFBRSxXQUFXLENBQUMsU0FBUyxDQUFDLFFBQVEsQ0FBQyxFQUFFLGVBQWUsQ0FBQztpQkFDOUQsQ0FBQztnQkFFRixTQUFTLENBQUMsWUFBWSxDQUFDLGtCQUFrQixDQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFDaEUsU0FBUyxDQUFDLHVCQUF1QixDQUFDLG1CQUFtQixDQUFDLENBQUMsVUFBVSxDQUFDLEtBQUssQ0FBQyxLQUFLLEVBQUUsRUFBRSxVQUFVLENBQUMsYUFBYSxDQUFDLEtBQUssRUFBRSxFQUFFLFVBQVUsQ0FBQyxNQUFNLENBQUMsS0FBSyxFQUFFLEVBQUUsVUFBVSxDQUFDLE1BQU0sQ0FBQyxLQUFLLEVBQUUsQ0FBQyxDQUFDLENBQUM7Z0JBRTFLLHlCQUF5QixDQUFDLFNBQVMsQ0FBQyxlQUFlLENBQUMsSUFBSSxtQkFBbUIsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO2dCQUVuRiwyQkFBMkIsR0FBRyxJQUFJLENBQUMsRUFBRSxFQUFFLENBQUM7Z0JBQ3hDLGdCQUFnQixDQUFDLDJCQUEyQixDQUFDLFNBQVMsQ0FBQywyQkFBMkIsQ0FBQyxDQUFDO2dCQUVwRixNQUFNLGdCQUFnQixDQUFDLGNBQWMsRUFBRSxDQUFDO2dCQUN4QyxjQUFjLEdBQUcsTUFBTSxnQkFBZ0IsQ0FBQyxtQ0FBbUMsQ0FBQyxVQUFVLENBQUMsS0FBSyxDQUFDLENBQUM7WUFDbEcsQ0FBQyxDQUFBLENBQUMsQ0FBQztZQUVILEVBQUUsQ0FBQyxrRUFBa0UsRUFBRSxHQUFHLEVBQUU7Z0JBQ3hFLE1BQU0sQ0FBQyxTQUFTLENBQUMsdUJBQXVCLENBQUMsQ0FBQyxjQUFjLENBQUMsZUFBZSxDQUFDLENBQUM7WUFDOUUsQ0FBQyxDQUFDLENBQUM7WUFFSCxFQUFFLENBQUMseUJBQXlCLEVBQUUsR0FBRyxFQUFFO2dCQUMvQixNQUFNLENBQUMsVUFBVSxDQUFDLHlCQUF5QixDQUFDLENBQUMsY0FBYyxDQUFDLE1BQU0sQ0FBQyxlQUFlLEVBQUUsTUFBTSxDQUFDLFFBQVEsRUFBRSxDQUFDLENBQUM7WUFDM0csQ0FBQyxDQUFDLENBQUM7WUFFSCxFQUFFLENBQUMsMkRBQTJELEVBQUUsR0FBRyxFQUFFO2dCQUNqRSxNQUFNLENBQUMsbUJBQW1CLENBQUMsa0JBQWtCLEVBQUUsQ0FBQyxDQUFDLE9BQU8sQ0FBQztvQkFDckQsVUFBVSxFQUFFLENBQUM7b0JBQ2IsTUFBTSxFQUFFLENBQUM7b0JBQ1QsS0FBSyxFQUFFLENBQUM7b0JBQ1IsZUFBZSxFQUFFLEVBQUc7b0JBQ3BCLGNBQWMsRUFBRSxFQUFHO29CQUNuQixrQkFBa0IsRUFBRSxFQUFHO2lCQUMxQixDQUFDLENBQUM7WUFDUCxDQUFDLENBQUMsQ0FBQztZQUVILEVBQUUsQ0FBQyxvQkFBb0IsRUFBRSxHQUFHLEVBQUU7Z0JBQzFCLE1BQU0sQ0FBQyxjQUFjLENBQUMsQ0FBQyxXQUFXLEVBQUUsQ0FBQztZQUN6QyxDQUFDLENBQUMsQ0FBQztZQUVILEVBQUUsQ0FBQyx1Q0FBdUMsRUFBRSxHQUFHLEVBQUU7Z0JBQzdDLE1BQU0sQ0FBQyxjQUFlLENBQUMsUUFBUSxDQUFDLEtBQUssRUFBRSxDQUFDLENBQUMsT0FBTyxDQUFDLDBCQUEwQixDQUFDLENBQUM7WUFDakYsQ0FBQyxDQUFDLENBQUM7WUFFSCxFQUFFLENBQUMsK0NBQStDLEVBQUUsR0FBRyxFQUFFO2dCQUNyRCxNQUFNLENBQUMsY0FBZSxDQUFDLFFBQVEsQ0FBQyxVQUFVLEVBQUUsQ0FBQyxDQUFDLFdBQVcsRUFBRSxDQUFDO2dCQUM1RCxNQUFNLENBQUMsY0FBZSxDQUFDLFFBQVEsQ0FBQyxVQUFVLEVBQUUsQ0FBQyxLQUFLLEVBQUUsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxzQ0FBc0MsQ0FBQyxDQUFDO1lBQzFHLENBQUMsQ0FBQyxDQUFDO1lBRUgsRUFBRSxDQUFDLHVDQUF1QyxFQUFFLEdBQUcsRUFBRTtnQkFDN0MsTUFBTSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQyxxQkFBcUIsQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFDOUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQyx1QkFBdUIsQ0FBQyxDQUFDLEVBQUUsTUFBTSxDQUFDLFFBQVEsRUFBRSxFQUFFLElBQUksZ0JBQWdCLENBQUM7b0JBQ3BGLGFBQWEsRUFBRSxJQUFJO29CQUNuQixhQUFhLEVBQUUsSUFBSTtvQkFDbkIsT0FBTyxFQUFFLEtBQUs7b0JBQ2QsSUFBSSxFQUFFLElBQUk7b0JBQ1YsaUJBQWlCLEVBQUUsRUFBRTtvQkFDckIsVUFBVSxFQUFFO3dCQUNSLEtBQUssRUFBRTs0QkFDSCxPQUFPLEVBQUUsQ0FBQyxPQUFPLENBQUM7NEJBQ2xCLFNBQVMsRUFBRSxLQUFLOzRCQUNoQixXQUFXLEVBQUUsS0FBSzt5QkFDckI7d0JBQ0QsYUFBYSxFQUFFOzRCQUNYLE9BQU8sRUFBRSxDQUFDLE9BQU8sQ0FBQzs0QkFDbEIsU0FBUyxFQUFFLEtBQUs7NEJBQ2hCLFdBQVcsRUFBRSxLQUFLO3lCQUNyQjtxQkFDSjtvQkFDRCxXQUFXLEVBQUU7d0JBQ1QsS0FBSyxFQUFFOzRCQUNILGlCQUFpQixFQUFFLElBQUk7NEJBQ3ZCLFlBQVksRUFBRSxJQUFJOzRCQUNsQixTQUFTLEVBQUUsR0FBRzt5QkFDakI7d0JBQ0QsYUFBYSxFQUFFOzRCQUNYLGlCQUFpQixFQUFFLElBQUk7NEJBQ3ZCLFlBQVksRUFBRSxJQUFJOzRCQUNsQixTQUFTLEVBQUUsR0FBRzt5QkFDakI7cUJBQ0o7b0JBQ0Qsb0JBQW9CLEVBQUU7d0JBQ2xCLENBQUMsRUFBRSxxQkFBcUI7d0JBQ3hCLENBQUMsRUFBRSxxQkFBcUI7cUJBQzNCO2lCQUNKLENBQUMsRUFBRSxFQUFFLEVBQUU7b0JBQ0osZUFBZSxFQUFFLEtBQUs7b0JBQ3RCLE9BQU8sRUFBRSxDQUFDO29CQUNWLFVBQVUsRUFBRSxDQUFDO29CQUNiLHlCQUF5QixFQUFFLEtBQUs7b0JBQ2hDLE9BQU8sRUFBRSxJQUFJO2lCQUNoQixDQUFDLENBQUM7WUFDUCxDQUFDLENBQUMsQ0FBQztZQUVILEVBQUUsQ0FBQyx3RUFBd0UsRUFBRSxHQUFHLEVBQUU7Z0JBQzlFLE1BQU0sQ0FBQywyQkFBMkIsQ0FBQyxDQUFDLGVBQWUsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUMzRCxDQUFDLENBQUMsQ0FBQztZQUVILEVBQUUsQ0FBQyxtREFBbUQsRUFBRSxHQUFHLEVBQUU7Z0JBQ3pELE1BQU0sQ0FBQywyQkFBMkIsQ0FBQyxDQUFDLGVBQWUsQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFDdkQsTUFBTSxtQkFBbUIsR0FBaUgsMkJBQTJCLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFFdkwsTUFBTSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsbUJBQW1CLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDL0QsQ0FBQyxDQUFDLENBQUM7WUFFSCxFQUFFLENBQUMsaUVBQWlFLEVBQUUsR0FBRyxFQUFFO2dCQUN2RSxNQUFNLE9BQU8sR0FBbUIsMkJBQTJCLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFFN0UsTUFBTSxDQUFDLE9BQU8sQ0FBQyxDQUFDLE9BQU8sQ0FBQyxlQUFlLENBQUMsQ0FBQztZQUM3QyxDQUFDLENBQUMsQ0FBQztZQUVILEVBQUUsQ0FBQywrQ0FBK0MsRUFBRSxHQUFHLEVBQUU7Z0JBQ3JELE1BQU0sbUJBQW1CLEdBQWlILDJCQUEyQixDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBQ3ZMLE1BQU0sUUFBUSxHQUFHLG1CQUFtQixDQUFDLGFBQWMsQ0FBQyxpQkFBaUIsQ0FBQztnQkFFdEUsTUFBTSxDQUFDLFFBQVEsQ0FBQyxLQUFLLEVBQUUsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDO2dCQUVuRCxNQUFNLENBQUMsUUFBUSxDQUFDLFVBQVUsRUFBRSxDQUFDLENBQUMsV0FBVyxFQUFFLENBQUM7Z0JBQzVDLE1BQU0sQ0FBQyxRQUFRLENBQUMsVUFBVSxFQUFFLENBQUMsS0FBSyxFQUFFLENBQUMsQ0FBQyxPQUFPLENBQUMsc0NBQXNDLENBQUMsQ0FBQztZQUMxRixDQUFDLENBQUMsQ0FBQztZQUVILEVBQUUsQ0FBQyxvQ0FBb0MsRUFBRSxHQUFHLEVBQUU7Z0JBQzFDLE1BQU0sbUJBQW1CLEdBQWlILDJCQUEyQixDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBQ3ZMLE1BQU0sUUFBUSxHQUFHLG1CQUFtQixDQUFDLE1BQU8sQ0FBQyxpQkFBaUIsQ0FBQztnQkFFL0QsTUFBTSxDQUFDLFFBQVEsQ0FBQyxLQUFLLEVBQUUsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDO2dCQUVuRCxNQUFNLENBQUMsUUFBUSxDQUFDLFVBQVUsRUFBRSxDQUFDLENBQUMsV0FBVyxFQUFFLENBQUM7Z0JBQzVDLE1BQU0sQ0FBQyxRQUFRLENBQUMsVUFBVSxFQUFFLENBQUMsS0FBSyxFQUFFLENBQUMsQ0FBQyxPQUFPLENBQUMsc0NBQXNDLENBQUMsQ0FBQztZQUMxRixDQUFDLENBQUMsQ0FBQztZQUVILEVBQUUsQ0FBQyxpQ0FBaUMsRUFBRSxHQUFHLEVBQUU7Z0JBQ3ZDLE1BQU0sbUJBQW1CLEdBQWlILDJCQUEyQixDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBQ3ZMLE1BQU0sUUFBUSxHQUFHLG1CQUFtQixDQUFDLE1BQU0sQ0FBQztnQkFFNUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxDQUFDLGFBQWEsRUFBRSxDQUFDO1lBQ3JDLENBQUMsQ0FBQyxDQUFDO1lBRUgsRUFBRSxDQUFDLDREQUE0RCxFQUFFLEdBQUcsRUFBRTtnQkFDbEUsTUFBTSxtQkFBbUIsR0FBaUgsMkJBQTJCLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFFdkwsTUFBTSxTQUFTLEdBQWEsbUJBQW1CLENBQUMsYUFBYyxDQUFDLGlCQUFpQixDQUFDO2dCQUNqRixNQUFNLFNBQVMsR0FBYSxtQkFBbUIsQ0FBQyxNQUFPLENBQUMsaUJBQWlCLENBQUM7Z0JBRTFFLE1BQU0sQ0FBQyxTQUFTLENBQUMsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUM7WUFDdEMsQ0FBQyxDQUFDLENBQUM7WUFFSCxFQUFFLENBQUMscUNBQXFDLEVBQUUsR0FBRyxFQUFFO2dCQUMzQyxNQUFNLG1CQUFtQixHQUFpSCwyQkFBMkIsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO2dCQUV2TCxNQUFNLGFBQWEsR0FBMEIsbUJBQW1CLENBQUMsYUFBYyxDQUFDLHFCQUFxQixDQUFDO2dCQUN0RyxNQUFNLGFBQWEsR0FBMEIsbUJBQW1CLENBQUMsTUFBTyxDQUFDLHFCQUFxQixDQUFDO2dCQUUvRixNQUFNLENBQUMsYUFBYSxDQUFDLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxhQUFhLENBQUMsQ0FBQztZQUNyRCxDQUFDLENBQUMsQ0FBQztZQUVILEVBQUUsQ0FBQyx1REFBdUQsRUFBRSxHQUFHLEVBQUU7Z0JBQzdELE1BQU0sWUFBWSxHQUEwQixjQUFlLENBQUMsWUFBWSxDQUFDO2dCQUV6RSxNQUFNLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxPQUFPLENBQUMsRUFBRSxDQUFDLENBQUM7Z0JBRXJELE1BQU0sQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxFQUFFO29CQUN0QyxZQUFZLENBQUMsS0FBSyxDQUFDLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxFQUFFO3dCQUM5QixNQUFNLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQztvQkFDakQsQ0FBQyxDQUFDLENBQUM7Z0JBQ1AsQ0FBQyxDQUFDLENBQUM7WUFDUCxDQUFDLENBQUMsQ0FBQztZQUVILEVBQUUsQ0FBQywrREFBK0QsRUFBRSxHQUFHLEVBQUU7Z0JBQ3JFLE1BQU0sbUJBQW1CLEdBQWlILDJCQUEyQixDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBRXZMLE1BQU0sWUFBWSxHQUEwQixtQkFBbUIsQ0FBQyxhQUFjLENBQUMscUJBQXFCLENBQUM7Z0JBRXJHLE1BQU0sQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLE9BQU8sQ0FBQyxFQUFFLENBQUMsQ0FBQztnQkFFckQsTUFBTSxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLEVBQUU7b0JBQ3RDLFlBQVksQ0FBQyxLQUFLLENBQUMsQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLEVBQUU7d0JBQzlCLE1BQU0sQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDLGdCQUFnQixDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUM7b0JBQ3pELENBQUMsQ0FBQyxDQUFDO2dCQUNQLENBQUMsQ0FBQyxDQUFDO1lBQ1AsQ0FBQyxDQUFDLENBQUM7WUFFSCxFQUFFLENBQUMsd0RBQXdELEVBQUUsR0FBRyxFQUFFO2dCQUM5RCxNQUFNLG1CQUFtQixHQUFpSCwyQkFBMkIsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO2dCQUV2TCxNQUFNLFlBQVksR0FBMEIsbUJBQW1CLENBQUMsTUFBTyxDQUFDLHFCQUFxQixDQUFDO2dCQUU5RixNQUFNLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxPQUFPLENBQUMsRUFBRSxDQUFDLENBQUM7Z0JBRXJELE1BQU0sQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxFQUFFO29CQUN0QyxZQUFZLENBQUMsS0FBSyxDQUFDLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxFQUFFO3dCQUM5QixNQUFNLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQztvQkFDbEQsQ0FBQyxDQUFDLENBQUM7Z0JBQ1AsQ0FBQyxDQUFDLENBQUM7WUFDUCxDQUFDLENBQUMsQ0FBQztZQUVILEVBQUUsQ0FBQywrQkFBK0IsRUFBRSxHQUFHLEVBQUU7Z0JBQ3JDLE1BQU0sQ0FBQyxZQUFZLENBQUMsS0FBSyxDQUFDLENBQUMsZUFBZSxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ2xELENBQUMsQ0FBQyxDQUFDO1lBRUgsRUFBRSxDQUFDLHVDQUF1QyxFQUFFLEdBQUcsRUFBRTtnQkFDN0MsTUFBTSxDQUFDLFlBQVksQ0FBQyxLQUFLLENBQUMsQ0FBQyx1QkFBdUIsQ0FBQyxDQUFDLEVBQUUsY0FBZSxDQUFDLFFBQVEsQ0FBQyxDQUFDO1lBQ3BGLENBQUMsQ0FBQyxDQUFDO1FBQ1AsQ0FBQyxDQUFDLENBQUM7UUFFSCxRQUFRLENBQUMsMkNBQTJDLEVBQUUsR0FBRyxFQUFFO1lBQ3ZELElBQUksY0FBMkMsQ0FBQztZQUVoRCxVQUFVLENBQUMsR0FBUyxFQUFFO2dCQUNsQixPQUFPLENBQUMsSUFBSSxDQUFDLHFCQUFxQixDQUFDO29CQUMvQixHQUFHLEVBQUUsRUFBRTtvQkFDUCxRQUFRLEVBQUUsSUFBSSxDQUFDLFNBQVMsQ0FBQyxxQkFBcUIsQ0FBQztvQkFDL0MsWUFBWSxFQUFFLEdBQUc7b0JBQ2pCLE9BQU8sRUFBRSxFQUFFO2lCQUNkLENBQUMsQ0FBQyxxQkFBcUIsQ0FBQztvQkFDckIsR0FBRyxFQUFFLEVBQUU7b0JBQ1AsUUFBUSxFQUFFLElBQUksQ0FBQyxTQUFTLENBQUMsa0JBQWtCLENBQUM7b0JBQzVDLFlBQVksRUFBRSxHQUFHO29CQUNqQixPQUFPLEVBQUUsRUFBRTtpQkFDZCxDQUFDLENBQUM7Z0JBRUgsWUFBWSxDQUFDLEtBQUssQ0FBQyxpQkFBaUIsQ0FBQyxJQUFJLEtBQUssRUFBRSxDQUFDLENBQUM7Z0JBRWxELFNBQVMsQ0FBQyxZQUFZLENBQUMsa0JBQWtCLENBQUMsU0FBUyxDQUFDLENBQUM7Z0JBRXJELHlCQUF5QixDQUFDLFNBQVMsQ0FBQyxlQUFlLENBQUMsSUFBSSxtQkFBbUIsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO2dCQUVuRixNQUFNLGdCQUFnQixDQUFDLGNBQWMsRUFBRSxDQUFDO2dCQUN4QyxjQUFjLEdBQUcsTUFBTSxnQkFBZ0IsQ0FBQyxXQUFXLENBQUMsT0FBTyxDQUFDLENBQUM7WUFDakUsQ0FBQyxDQUFBLENBQUMsQ0FBQztZQUVILEVBQUUsQ0FBQyxvQkFBb0IsRUFBRSxHQUFHLEVBQUU7Z0JBQzFCLE1BQU0sQ0FBQyxjQUFjLENBQUMsQ0FBQyxXQUFXLEVBQUUsQ0FBQztZQUN6QyxDQUFDLENBQUMsQ0FBQztRQUNQLENBQUMsQ0FBQyxDQUFDO1FBRUgsUUFBUSxDQUFDLG1EQUFtRCxFQUFFLEdBQUcsRUFBRTtZQUMvRCxJQUFJLGNBQTJDLENBQUM7WUFFaEQsVUFBVSxDQUFDLEdBQVMsRUFBRTtnQkFDbEIsT0FBTyxDQUFDLElBQUksQ0FBQyxxQkFBcUIsQ0FBQztvQkFDL0IsR0FBRyxFQUFFLEVBQUU7b0JBQ1AsUUFBUSxFQUFFLElBQUksQ0FBQyxTQUFTLENBQUMsNEJBQTRCLENBQUM7b0JBQ3RELFlBQVksRUFBRSxHQUFHO29CQUNqQixPQUFPLEVBQUUsRUFBRTtpQkFDZCxDQUFDLENBQUMscUJBQXFCLENBQUM7b0JBQ3JCLEdBQUcsRUFBRSxFQUFFO29CQUNQLFFBQVEsRUFBRSxJQUFJLENBQUMsU0FBUyxDQUFDLGtCQUFrQixDQUFDO29CQUM1QyxZQUFZLEVBQUUsR0FBRztvQkFDakIsT0FBTyxFQUFFLEVBQUU7aUJBQ2QsQ0FBQyxDQUFDO2dCQUVILFNBQVMsQ0FBQyxZQUFZLENBQUMsa0JBQWtCLENBQUMsU0FBUyxDQUFDLENBQUM7Z0JBRXJELHlCQUF5QixDQUFDLFNBQVMsQ0FBQyxlQUFlLENBQUMsSUFBSSxtQkFBbUIsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO2dCQUVuRixNQUFNLGdCQUFnQixDQUFDLGNBQWMsRUFBRSxDQUFDO2dCQUN4QyxjQUFjLEdBQUcsTUFBTSxnQkFBZ0IsQ0FBQyxXQUFXLENBQUMsT0FBTyxDQUFDLENBQUM7WUFDakUsQ0FBQyxDQUFBLENBQUMsQ0FBQztZQUVILEVBQUUsQ0FBQyxzQkFBc0IsRUFBRSxHQUFHLEVBQUU7Z0JBQzVCLE1BQU0sQ0FBQyxjQUFjLENBQUMsQ0FBQyxXQUFXLEVBQUUsQ0FBQztZQUN6QyxDQUFDLENBQUMsQ0FBQztZQUVILEVBQUUsQ0FBQyx1Q0FBdUMsRUFBRSxHQUFHLEVBQUU7Z0JBQzdDLE1BQU0sQ0FBQyxjQUFlLENBQUMsUUFBUSxDQUFDLEtBQUssRUFBRSxDQUFDLENBQUMsT0FBTyxDQUFDLDBCQUEwQixDQUFDLENBQUM7WUFDakYsQ0FBQyxDQUFDLENBQUM7WUFFSCxFQUFFLENBQUMsdUNBQXVDLEVBQUUsR0FBRyxFQUFFO2dCQUM3QyxNQUFNLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDLHFCQUFxQixDQUFDLENBQUMsQ0FBQyxDQUFDO2dCQUM5QyxNQUFNLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDLHVCQUF1QixDQUFDLENBQUMsRUFBRSxNQUFNLENBQUMsUUFBUSxFQUFFLEVBQUUsSUFBSSxnQkFBZ0IsQ0FBQztvQkFDcEYsYUFBYSxFQUFFLElBQUk7b0JBQ25CLGFBQWEsRUFBRSxJQUFJO29CQUNuQixPQUFPLEVBQUUsS0FBSztvQkFDZCxJQUFJLEVBQUUsSUFBSTtvQkFDVixpQkFBaUIsRUFBRSxFQUFFO29CQUNyQixVQUFVLEVBQUU7d0JBQ1IsS0FBSyxFQUFFOzRCQUNILE9BQU8sRUFBRSxDQUFDLE9BQU8sQ0FBQzs0QkFDbEIsU0FBUyxFQUFFLEtBQUs7NEJBQ2hCLFdBQVcsRUFBRSxLQUFLO3lCQUNyQjtxQkFDSjtvQkFDRCxXQUFXLEVBQUU7d0JBQ1QsS0FBSyxFQUFFOzRCQUNILGlCQUFpQixFQUFFLEtBQUs7eUJBQzNCO3FCQUNKO2lCQUNKLENBQUMsRUFBRSxFQUFFLEVBQUU7b0JBQ0osZUFBZSxFQUFFLEtBQUs7b0JBQ3RCLE9BQU8sRUFBRSxDQUFDO29CQUNWLFVBQVUsRUFBRSxDQUFDO29CQUNiLHlCQUF5QixFQUFFLEtBQUs7b0JBQ2hDLE9BQU8sRUFBRSxJQUFJO2lCQUNoQixDQUFDLENBQUM7WUFDUCxDQUFDLENBQUMsQ0FBQztRQUNQLENBQUMsQ0FBQyxDQUFDO1FBRUgsUUFBUSxDQUFDLHNDQUFzQyxFQUFFLEdBQUcsRUFBRTtZQUNsRCxJQUFJLGNBQTJDLENBQUM7WUFFaEQsVUFBVSxDQUFDLEdBQVMsRUFBRTtnQkFDbEIsT0FBTyxDQUFDLElBQUksQ0FBQyxxQkFBcUIsQ0FBQztvQkFDL0IsR0FBRyxFQUFFLEVBQUU7b0JBQ1AsUUFBUSxFQUFFLElBQUksQ0FBQyxTQUFTLENBQUMscUJBQXFCLENBQUM7b0JBQy9DLFlBQVksRUFBRSxHQUFHO29CQUNqQixPQUFPLEVBQUUsRUFBRTtpQkFDZCxDQUFDLENBQUMscUJBQXFCLENBQUM7b0JBQ3JCLEdBQUcsRUFBRSxFQUFFO29CQUNQLFFBQVEsRUFBRSxJQUFJLENBQUMsU0FBUyxDQUFDLHlCQUF5QixDQUFDO29CQUNuRCxZQUFZLEVBQUUsR0FBRztvQkFDakIsT0FBTyxFQUFFLEVBQUU7aUJBQ2QsQ0FBQyxDQUFDO2dCQUVILFNBQVMsQ0FBQyxZQUFZLENBQUMsa0JBQWtCLENBQUMsU0FBUyxDQUFDLENBQUM7Z0JBRXJELHlCQUF5QixDQUFDLFNBQVMsQ0FBQyxlQUFlLENBQUMsSUFBSSxtQkFBbUIsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO2dCQUVuRixNQUFNLGdCQUFnQixDQUFDLGNBQWMsRUFBRSxDQUFDO2dCQUN4QyxjQUFjLEdBQUcsTUFBTSxnQkFBZ0IsQ0FBQyxXQUFXLENBQUMsT0FBTyxDQUFDLENBQUM7WUFDakUsQ0FBQyxDQUFBLENBQUMsQ0FBQztZQUVILEVBQUUsQ0FBQywwQkFBMEIsRUFBRSxHQUFHLEVBQUU7Z0JBQ2hDLE1BQU0sQ0FBQyxjQUFjLENBQUMsQ0FBQyxhQUFhLEVBQUUsQ0FBQztZQUMzQyxDQUFDLENBQUMsQ0FBQztZQUVILEVBQUUsQ0FBQyw2QkFBNkIsRUFBRSxHQUFHLEVBQUU7Z0JBQ25DLE1BQU0sQ0FBQyxVQUFVLENBQUMseUJBQXlCLENBQUMsQ0FBQyxHQUFHLENBQUMsY0FBYyxDQUFDLE1BQU0sQ0FBQyxlQUFlLEVBQUUsTUFBTSxDQUFDLFFBQVEsRUFBRSxDQUFDLENBQUM7WUFDL0csQ0FBQyxDQUFDLENBQUM7WUFFSCxFQUFFLENBQUMsaUNBQWlDLEVBQUUsR0FBRyxFQUFFO2dCQUN2QyxNQUFNLENBQUMsVUFBVSxDQUFDLHlCQUF5QixDQUFDLENBQUMsR0FBRyxDQUFDLGNBQWMsQ0FBQyxNQUFNLENBQUMsaUJBQWlCLEVBQUUsTUFBTSxDQUFDLFFBQVEsRUFBRSxDQUFDLENBQUM7WUFDakgsQ0FBQyxDQUFDLENBQUM7UUFDUCxDQUFDLENBQUMsQ0FBQztRQUVILFFBQVEsQ0FBQyw2REFBNkQsRUFBRSxHQUFHLEVBQUU7WUFDekUsSUFBSSxjQUEyQyxDQUFDO1lBRWhELFVBQVUsQ0FBQyxHQUFTLEVBQUU7Z0JBQ2xCLE9BQU8sQ0FBQyxJQUFJLENBQUMscUJBQXFCLENBQUM7b0JBQy9CLEdBQUcsRUFBRSxFQUFFO29CQUNQLFFBQVEsRUFBRSxJQUFJLENBQUMsU0FBUyxDQUFDLHFCQUFxQixDQUFDO29CQUMvQyxZQUFZLEVBQUUsR0FBRztvQkFDakIsT0FBTyxFQUFFLEVBQUU7aUJBQ2QsQ0FBQyxDQUFDLHFCQUFxQixDQUFDO29CQUNyQixHQUFHLEVBQUUsRUFBRTtvQkFDUCxRQUFRLEVBQUUsSUFBSSxDQUFDLFNBQVMsQ0FBQyxtQ0FBbUMsQ0FBQztvQkFDN0QsWUFBWSxFQUFFLEdBQUc7b0JBQ2pCLE9BQU8sRUFBRSxFQUFFO2lCQUNkLENBQUMsQ0FBQztnQkFFSCxTQUFTLENBQUMsWUFBWSxDQUFDLGtCQUFrQixDQUFDLFNBQVMsQ0FBQyxDQUFDO2dCQUVyRCx5QkFBeUIsQ0FBQyxTQUFTLENBQUMsZUFBZSxDQUFDLElBQUksbUJBQW1CLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQztnQkFFbkYsTUFBTSxnQkFBZ0IsQ0FBQyxjQUFjLEVBQUUsQ0FBQztnQkFDeEMsY0FBYyxHQUFHLE1BQU0sZ0JBQWdCLENBQUMsV0FBVyxDQUFDLE9BQU8sQ0FBQyxDQUFDO1lBQ2pFLENBQUMsQ0FBQSxDQUFDLENBQUM7WUFFSCxFQUFFLENBQUMsMEJBQTBCLEVBQUUsR0FBRyxFQUFFO2dCQUNoQyxNQUFNLENBQUMsY0FBYyxDQUFDLENBQUMsYUFBYSxFQUFFLENBQUM7WUFDM0MsQ0FBQyxDQUFDLENBQUM7WUFFSCxFQUFFLENBQUMsNkJBQTZCLEVBQUUsR0FBRyxFQUFFO2dCQUNuQyxNQUFNLENBQUMsVUFBVSxDQUFDLHlCQUF5QixDQUFDLENBQUMsR0FBRyxDQUFDLGNBQWMsQ0FBQyxNQUFNLENBQUMsZUFBZSxFQUFFLE1BQU0sQ0FBQyxRQUFRLEVBQUUsQ0FBQyxDQUFDO1lBQy9HLENBQUMsQ0FBQyxDQUFDO1lBRUgsRUFBRSxDQUFDLDZCQUE2QixFQUFFLEdBQUcsRUFBRTtnQkFDbkMsTUFBTSxDQUFDLFVBQVUsQ0FBQyx5QkFBeUIsQ0FBQyxDQUFDLGNBQWMsQ0FBQyxNQUFNLENBQUMsaUJBQWlCLEVBQUUsTUFBTSxDQUFDLGdCQUFnQixDQUFDLEVBQUUsS0FBSyxFQUFFLHFCQUFxQixFQUFFLENBQUMsQ0FBQyxDQUFDO1lBQ3JKLENBQUMsQ0FBQyxDQUFDO1lBRUgsRUFBRSxDQUFDLDJCQUEyQixFQUFFLEdBQUcsRUFBRTtnQkFDakMsTUFBTSxDQUFDLFVBQVUsQ0FBQyx5QkFBeUIsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxjQUFjLENBQUMsTUFBTSxDQUFDLHVCQUF1QixFQUFFLE1BQU0sQ0FBQyxRQUFRLEVBQUUsQ0FBQyxDQUFDO1lBQ3ZILENBQUMsQ0FBQyxDQUFDO1FBQ1AsQ0FBQyxDQUFDLENBQUM7UUFFSCxRQUFRLENBQUMsb0ZBQW9GLEVBQUUsR0FBRyxFQUFFO1lBQ2hHLElBQUksY0FBMkMsQ0FBQztZQUVoRCxVQUFVLENBQUMsR0FBUyxFQUFFO2dCQUNsQixPQUFPLENBQUMsSUFBSSxDQUFDLHFCQUFxQixDQUFDO29CQUMvQixHQUFHLEVBQUUsRUFBRTtvQkFDUCxRQUFRLEVBQUUsSUFBSSxDQUFDLFNBQVMsQ0FBQyxxQkFBcUIsQ0FBQztvQkFDL0MsWUFBWSxFQUFFLEdBQUc7b0JBQ2pCLE9BQU8sRUFBRSxFQUFFO2lCQUNkLENBQUMsQ0FBQyxxQkFBcUIsQ0FBQztvQkFDckIsR0FBRyxFQUFFLEVBQUU7b0JBQ1AsUUFBUSxFQUFFLElBQUksQ0FBQyxTQUFTLENBQUMsbUNBQW1DLENBQUM7b0JBQzdELFlBQVksRUFBRSxHQUFHO29CQUNqQixPQUFPLEVBQUUsRUFBRTtpQkFDZCxDQUFDLENBQUM7Z0JBRUgsU0FBUyxDQUFDLFlBQVksQ0FBQyxrQkFBa0IsQ0FBQyxTQUFTLENBQUMsQ0FBQztnQkFFckQseUJBQXlCLENBQUMsU0FBUyxDQUFDLGVBQWUsQ0FBQyxJQUFJLG1CQUFtQixDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7Z0JBRW5GLE1BQU0sZ0JBQWdCLENBQUMsY0FBYyxFQUFFLENBQUM7Z0JBQ3hDLE1BQU0sZ0JBQWdCLENBQUMsV0FBVyxDQUFDLE9BQU8sQ0FBQyxDQUFDO2dCQUM1QyxjQUFjLEdBQUcsTUFBTSxnQkFBZ0IsQ0FBQyxXQUFXLENBQUMsT0FBTyxDQUFDLENBQUM7WUFDakUsQ0FBQyxDQUFBLENBQUMsQ0FBQztZQUVILEVBQUUsQ0FBQywwQkFBMEIsRUFBRSxHQUFHLEVBQUU7Z0JBQ2hDLE1BQU0sQ0FBQyxjQUFjLENBQUMsQ0FBQyxhQUFhLEVBQUUsQ0FBQztZQUMzQyxDQUFDLENBQUMsQ0FBQztZQUVILEVBQUUsQ0FBQyx1QkFBdUIsRUFBRSxHQUFHLEVBQUU7Z0JBQzdCLE1BQU0sQ0FBQyxVQUFVLENBQUMseUJBQXlCLENBQUMsQ0FBQyxjQUFjLENBQUMsTUFBTSxDQUFDLHVCQUF1QixFQUFFLE1BQU0sQ0FBQyxRQUFRLEVBQUUsQ0FBQyxDQUFDO1lBQ25ILENBQUMsQ0FBQyxDQUFDO1FBQ1AsQ0FBQyxDQUFDLENBQUM7UUFFSCxRQUFRLENBQUMsa0dBQWtHLEVBQUUsR0FBRyxFQUFFO1lBQzlHLElBQUksY0FBMkMsQ0FBQztZQUNoRCxJQUFJLFVBQTRCLENBQUM7WUFFakMsVUFBVSxDQUFDLEdBQVMsRUFBRTtnQkFDbEIsT0FBTyxDQUFDLElBQUksQ0FBQyxxQkFBcUIsQ0FBQztvQkFDL0IsR0FBRyxFQUFFLEVBQUU7b0JBQ1AsUUFBUSxFQUFFLElBQUksQ0FBQyxTQUFTLENBQUMsNkJBQTZCLENBQUM7b0JBQ3ZELFlBQVksRUFBRSxHQUFHO29CQUNqQixPQUFPLEVBQUUsRUFBRTtpQkFDZCxDQUFDLENBQUMscUJBQXFCLENBQUM7b0JBQ3JCLEdBQUcsRUFBRSxFQUFFO29CQUNQLFFBQVEsRUFBRSxJQUFJLENBQUMsU0FBUyxDQUFDLG1DQUFtQyxDQUFDO29CQUM3RCxZQUFZLEVBQUUsR0FBRztvQkFDakIsT0FBTyxFQUFFLEVBQUU7aUJBQ2QsQ0FBQyxDQUFDLHFCQUFxQixDQUFDO29CQUNyQixHQUFHLEVBQUUsRUFBRTtvQkFDUCxRQUFRLEVBQUUsSUFBSSxDQUFDLFNBQVMsQ0FBQyxrQkFBa0IsQ0FBQztvQkFDNUMsWUFBWSxFQUFFLEdBQUc7b0JBQ2pCLE9BQU8sRUFBRSxFQUFFO2lCQUNkLENBQUMsQ0FBQztnQkFFSCxVQUFVLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLEVBQUUsS0FBSyxDQUFDLENBQUM7Z0JBQ3JDLFVBQVUsQ0FBQyxlQUFlLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBRTlCLFNBQVMsQ0FBQyxZQUFZLENBQUMsa0JBQWtCLENBQUMsU0FBUyxDQUFDLENBQUM7Z0JBRXJELHlCQUF5QixDQUFDLFNBQVMsQ0FBQyxlQUFlLENBQUMsSUFBSSxtQkFBbUIsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO2dCQUVuRixNQUFNLGdCQUFnQixDQUFDLGNBQWMsRUFBRSxDQUFDO2dCQUN4QyxNQUFNLGdCQUFnQixDQUFDLFdBQVcsQ0FBQyxPQUFPLENBQUMsQ0FBQztnQkFFNUMsVUFBVSxDQUFDLGVBQWUsQ0FBQyxFQUFFLEdBQUcsSUFBSSxHQUFHLElBQUksR0FBRyxDQUFDLENBQUMsQ0FBQztnQkFFakQsY0FBYyxHQUFHLE1BQU0sZ0JBQWdCLENBQUMsV0FBVyxDQUFDLE9BQU8sQ0FBQyxDQUFDO1lBQ2pFLENBQUMsQ0FBQSxDQUFDLENBQUM7WUFFSCxTQUFTLENBQUMsR0FBRyxFQUFFO2dCQUNYLFVBQVUsQ0FBQyxXQUFXLEVBQUUsQ0FBQztZQUM3QixDQUFDLENBQUMsQ0FBQztZQUVILEVBQUUsQ0FBQyxvQkFBb0IsRUFBRSxHQUFHLEVBQUU7Z0JBQzFCLE1BQU0sQ0FBQyxjQUFjLENBQUMsQ0FBQyxXQUFXLEVBQUUsQ0FBQztZQUN6QyxDQUFDLENBQUMsQ0FBQztZQUVILEVBQUUsQ0FBQyx5QkFBeUIsRUFBRSxHQUFHLEVBQUU7Z0JBQy9CLE1BQU0sQ0FBQyxVQUFVLENBQUMseUJBQXlCLENBQUMsQ0FBQyxjQUFjLENBQUMsTUFBTSxDQUFDLGVBQWUsRUFBRSxNQUFNLENBQUMsUUFBUSxFQUFFLENBQUMsQ0FBQztZQUMzRyxDQUFDLENBQUMsQ0FBQztZQUVILEVBQUUsQ0FBQywyQkFBMkIsRUFBRSxHQUFHLEVBQUU7Z0JBQ2pDLE1BQU0sQ0FBQyxVQUFVLENBQUMseUJBQXlCLENBQUMsQ0FBQyxHQUFHLENBQUMsY0FBYyxDQUFDLE1BQU0sQ0FBQyx1QkFBdUIsRUFBRSxNQUFNLENBQUMsUUFBUSxFQUFFLENBQUMsQ0FBQztZQUN2SCxDQUFDLENBQUMsQ0FBQztRQUNQLENBQUMsQ0FBQyxDQUFDO1FBRUgsUUFBUSxDQUFDLCtEQUErRCxFQUFFLEdBQUcsRUFBRTtZQUMzRSxJQUFJLGNBQTJDLENBQUM7WUFFaEQsVUFBVSxDQUFDLEdBQVMsRUFBRTtnQkFDbEIsT0FBTyxDQUFDLElBQUksQ0FBQyxxQkFBcUIsQ0FBQztvQkFDL0IsR0FBRyxFQUFFLEVBQUU7b0JBQ1AsUUFBUSxFQUFFLElBQUksQ0FBQyxTQUFTLENBQUMsNEJBQTRCLENBQUM7b0JBQ3RELFlBQVksRUFBRSxHQUFHO29CQUNqQixPQUFPLEVBQUUsRUFBRTtpQkFDZCxDQUFDLENBQUMscUJBQXFCLENBQUM7b0JBQ3JCLEdBQUcsRUFBRSxFQUFFO29CQUNQLFFBQVEsRUFBRSxJQUFJLENBQUMsU0FBUyxDQUFDLHlCQUF5QixDQUFDO29CQUNuRCxZQUFZLEVBQUUsR0FBRztvQkFDakIsT0FBTyxFQUFFLEVBQUU7aUJBQ2QsQ0FBQyxDQUFDO2dCQUVILFNBQVMsQ0FBQyxZQUFZLENBQUMsa0JBQWtCLENBQUMsU0FBUyxDQUFDLENBQUM7Z0JBRXJELHlCQUF5QixDQUFDLFNBQVMsQ0FBQyxlQUFlLENBQUMsSUFBSSxtQkFBbUIsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO2dCQUVuRixNQUFNLGdCQUFnQixDQUFDLGNBQWMsRUFBRSxDQUFDO2dCQUN4QyxjQUFjLEdBQUcsTUFBTSxnQkFBZ0IsQ0FBQyxXQUFXLENBQUMsT0FBTyxDQUFDLENBQUM7WUFDakUsQ0FBQyxDQUFBLENBQUMsQ0FBQztZQUVILEVBQUUsQ0FBQywwQkFBMEIsRUFBRSxHQUFHLEVBQUU7Z0JBQ2hDLE1BQU0sQ0FBQyxjQUFjLENBQUMsQ0FBQyxhQUFhLEVBQUUsQ0FBQztZQUMzQyxDQUFDLENBQUMsQ0FBQztZQUVILEVBQUUsQ0FBQyx1Q0FBdUMsRUFBRSxHQUFHLEVBQUU7Z0JBQzdDLE1BQU0sQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUMscUJBQXFCLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBQzlDLE1BQU0sQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUMsdUJBQXVCLENBQUMsQ0FBQyxFQUFFLE1BQU0sQ0FBQyxRQUFRLEVBQUUsRUFBRSxJQUFJLGdCQUFnQixDQUFDO29CQUNwRixhQUFhLEVBQUUsSUFBSTtvQkFDbkIsYUFBYSxFQUFFLElBQUk7b0JBQ25CLE9BQU8sRUFBRSxLQUFLO29CQUNkLElBQUksRUFBRSxJQUFJO29CQUNWLGlCQUFpQixFQUFFLEVBQUU7b0JBQ3JCLFVBQVUsRUFBRTt3QkFDUixLQUFLLEVBQUU7NEJBQ0gsT0FBTyxFQUFFLENBQUMsT0FBTyxDQUFDOzRCQUNsQixTQUFTLEVBQUUsS0FBSzs0QkFDaEIsV0FBVyxFQUFFLEtBQUs7eUJBQ3JCO3FCQUNKO29CQUNELFdBQVcsRUFBRTt3QkFDVCxLQUFLLEVBQUU7NEJBQ0gsaUJBQWlCLEVBQUUsS0FBSzt5QkFDM0I7cUJBQ0o7aUJBQ0osQ0FBQyxFQUFFLEVBQUUsRUFBRTtvQkFDSixlQUFlLEVBQUUsS0FBSztvQkFDdEIsT0FBTyxFQUFFLENBQUM7b0JBQ1YsVUFBVSxFQUFFLENBQUM7b0JBQ2IseUJBQXlCLEVBQUUsS0FBSztvQkFDaEMsT0FBTyxFQUFFLElBQUk7aUJBQ2hCLENBQUMsQ0FBQztZQUNQLENBQUMsQ0FBQyxDQUFDO1FBQ1AsQ0FBQyxDQUFDLENBQUM7UUFFSCxRQUFRLENBQUMsbUNBQW1DLEVBQUUsR0FBRyxFQUFFO1lBQy9DLElBQUksY0FBMkMsQ0FBQztZQUVoRCxVQUFVLENBQUMsR0FBUyxFQUFFO2dCQUNsQixPQUFPLENBQUMsSUFBSTtxQkFDUCxpQkFBaUIsQ0FBQyxJQUFJLEtBQUssRUFBRSxDQUFDO3FCQUM5QixxQkFBcUIsQ0FBQztvQkFDbkIsR0FBRyxFQUFFLEVBQUU7b0JBQ1AsUUFBUSxFQUFFLElBQUksQ0FBQyxTQUFTLENBQUMsa0JBQWtCLENBQUM7b0JBQzVDLFlBQVksRUFBRSxHQUFHO29CQUNqQixPQUFPLEVBQUUsRUFBRTtpQkFDZCxDQUFDLENBQUM7Z0JBRVAsU0FBUyxDQUFDLFlBQVksQ0FBQyxrQkFBa0IsQ0FBQyxTQUFTLENBQUMsQ0FBQztnQkFFckQsTUFBTSxnQkFBZ0IsQ0FBQyxjQUFjLEVBQUUsQ0FBQztnQkFDeEMsY0FBYyxHQUFHLE1BQU0sZ0JBQWdCLENBQUMsV0FBVyxDQUFDLE9BQU8sQ0FBQyxDQUFDO1lBQ2pFLENBQUMsQ0FBQSxDQUFDLENBQUM7WUFFSCxFQUFFLENBQUMscUJBQXFCLEVBQUUsR0FBRyxFQUFFO2dCQUMzQixNQUFNLENBQUMsY0FBYyxDQUFDLENBQUMsYUFBYSxFQUFFLENBQUM7WUFDM0MsQ0FBQyxDQUFDLENBQUM7UUFDUCxDQUFDLENBQUMsQ0FBQztRQUVILFFBQVEsQ0FBQyxzQ0FBc0MsRUFBRSxHQUFHLEVBQUU7WUFDbEQsSUFBSSxjQUEyQyxDQUFDO1lBRWhELFVBQVUsQ0FBQyxHQUFTLEVBQUU7Z0JBQ2xCLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxFQUFFLEtBQUssQ0FBQztxQkFDbEIsbUJBQW1CLENBQUMsQ0FBQyxDQUFDO3FCQUN0QixlQUFlLENBQUMsRUFBRSxHQUFHLEVBQUUsR0FBRyxJQUFJLEdBQUcsR0FBRyxDQUFDLENBQUM7Z0JBRTNDLE9BQU8sQ0FBQyxJQUFJLENBQUMscUJBQXFCLENBQUM7b0JBQy9CLEdBQUcsRUFBRSxFQUFFO29CQUNQLFFBQVEsRUFBRSxJQUFJLENBQUMsU0FBUyxDQUFDLHFCQUFxQixDQUFDO29CQUMvQyxZQUFZLEVBQUUsR0FBRztvQkFDakIsT0FBTyxFQUFFLEVBQUU7aUJBQ2QsQ0FBQyxDQUFDLHFCQUFxQixDQUFDO29CQUNyQixHQUFHLEVBQUUsRUFBRTtvQkFDUCxRQUFRLEVBQUUsSUFBSSxDQUFDLFNBQVMsQ0FBQyxrQkFBa0IsQ0FBQztvQkFDNUMsWUFBWSxFQUFFLEdBQUc7b0JBQ2pCLE9BQU8sRUFBRSxFQUFFO2lCQUNkLENBQUMsQ0FBQztnQkFFSCxTQUFTLENBQUMsWUFBWSxDQUFDLGtCQUFrQixDQUFDLFNBQVMsQ0FBQyxDQUFDO2dCQUVyRCxNQUFNLGdCQUFnQixDQUFDLGNBQWMsRUFBRSxDQUFDO2dCQUV4QyxjQUFjLEdBQUcsTUFBTSxnQkFBZ0IsQ0FBQyxXQUFXLENBQUMsT0FBTyxDQUFDLENBQUM7WUFDakUsQ0FBQyxDQUFBLENBQUMsQ0FBQztZQUVILFNBQVMsQ0FBQyxHQUFTLEVBQUU7Z0JBQ2pCLElBQUksQ0FBQyxhQUFhLEVBQUUsQ0FBQztZQUN6QixDQUFDLENBQUEsQ0FBQyxDQUFDO1lBRUgsRUFBRSxDQUFDLDBCQUEwQixFQUFFLEdBQUcsRUFBRTtnQkFDaEMsTUFBTSxDQUFDLGdCQUFnQixDQUFDLG9CQUFvQixFQUFFLENBQUMsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUM7WUFDbEUsQ0FBQyxDQUFDLENBQUM7WUFFSCxFQUFFLENBQUMscUJBQXFCLEVBQUUsR0FBRyxFQUFFO2dCQUMzQixNQUFNLENBQUMsY0FBYyxDQUFDLENBQUMsYUFBYSxFQUFFLENBQUM7WUFDM0MsQ0FBQyxDQUFDLENBQUM7UUFDUCxDQUFDLENBQUMsQ0FBQztRQUVILFFBQVEsQ0FBQyxxQkFBcUIsRUFBRSxHQUFHLEVBQUU7WUFDakMsSUFBSSxlQUE0QyxDQUFDO1lBQ2pELElBQUksZUFBNEMsQ0FBQztZQUVqRCxVQUFVLENBQUMsR0FBUyxFQUFFO2dCQUNsQixPQUFPLENBQUMsSUFBSSxDQUFDLHFCQUFxQixDQUFDO29CQUMvQixHQUFHLEVBQUUsRUFBRTtvQkFDUCxRQUFRLEVBQUUsSUFBSSxDQUFDLFNBQVMsQ0FBQyxxQkFBcUIsQ0FBQztvQkFDL0MsWUFBWSxFQUFFLEdBQUc7b0JBQ2pCLE9BQU8sRUFBRSxFQUFFO2lCQUNkLENBQUMsQ0FBQyxxQkFBcUIsQ0FDcEIsSUFBSSxLQUFLLEVBQUUsQ0FDZCxDQUFDLHFCQUFxQixDQUFDO29CQUNwQixHQUFHLEVBQUUsRUFBRTtvQkFDUCxRQUFRLEVBQUUsSUFBSSxDQUFDLFNBQVMsQ0FBQyxrQkFBa0IsQ0FBQztvQkFDNUMsWUFBWSxFQUFFLEdBQUc7b0JBQ2pCLE9BQU8sRUFBRSxFQUFFO2lCQUNkLENBQUMsQ0FBQztnQkFFSCxTQUFTLENBQUMsWUFBWSxDQUFDLGtCQUFrQixDQUFDLFNBQVMsQ0FBQyxDQUFDO2dCQUVyRCx5QkFBeUIsQ0FBQyxTQUFTLENBQUMsZUFBZSxDQUFDLElBQUksbUJBQW1CLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQztnQkFFbkYsTUFBTSxnQkFBZ0IsQ0FBQyxjQUFjLEVBQUUsQ0FBQztnQkFDeEMsZUFBZSxHQUFHLE1BQU0sZ0JBQWdCLENBQUMsV0FBVyxDQUFDLE9BQU8sQ0FBQyxDQUFDO2dCQUM5RCxlQUFlLEdBQUcsTUFBTSxnQkFBZ0IsQ0FBQyxXQUFXLENBQUMsZUFBZSxDQUFDLENBQUM7WUFDMUUsQ0FBQyxDQUFBLENBQUMsQ0FBQztZQUVILEVBQUUsQ0FBQyw4QkFBOEIsRUFBRSxHQUFHLEVBQUU7Z0JBQ3BDLE1BQU0sQ0FBQyxlQUFlLENBQUMsQ0FBQyxXQUFXLEVBQUUsQ0FBQztZQUMxQyxDQUFDLENBQUMsQ0FBQztZQUVILEVBQUUsQ0FBQyx3Q0FBd0MsRUFBRSxHQUFHLEVBQUU7Z0JBQzlDLE1BQU0sQ0FBQyxlQUFnQixDQUFDLFFBQVEsQ0FBQyxLQUFLLEVBQUUsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxXQUFXLENBQUMsQ0FBQztZQUNuRSxDQUFDLENBQUMsQ0FBQztZQUVILEVBQUUsQ0FBQyxxQkFBcUIsRUFBRSxHQUFHLEVBQUU7Z0JBQzNCLE1BQU0sQ0FBQyxlQUFlLENBQUMsQ0FBQyxhQUFhLEVBQUUsQ0FBQztZQUM1QyxDQUFDLENBQUMsQ0FBQztRQUNQLENBQUMsQ0FBQyxDQUFDO1FBRUgsUUFBUSxDQUFDLDZCQUE2QixFQUFFLEdBQUcsRUFBRTtZQUN6QyxJQUFJLGNBQTJDLENBQUM7WUFFaEQsVUFBVSxDQUFDLEdBQVMsRUFBRTtnQkFDbEIsT0FBTyxDQUFDLElBQUksQ0FBQyxxQkFBcUIsQ0FBQztvQkFDL0IsR0FBRyxFQUFFLEVBQUU7b0JBQ1AsUUFBUSxFQUFFLElBQUksQ0FBQyxTQUFTLENBQUMscUJBQXFCLENBQUM7b0JBQy9DLFlBQVksRUFBRSxHQUFHO29CQUNqQixPQUFPLEVBQUUsRUFBRTtpQkFDZCxDQUFDLENBQUMscUJBQXFCLENBQUM7b0JBQ3JCLEdBQUcsRUFBRSxFQUFFO29CQUNQLFFBQVEsRUFBRSxJQUFJLENBQUMsU0FBUyxDQUFDLGtCQUFrQixDQUFDO29CQUM1QyxZQUFZLEVBQUUsR0FBRztvQkFDakIsT0FBTyxFQUFFLEVBQUU7aUJBQ2QsQ0FBQyxDQUFDO2dCQUVILFNBQVMsQ0FBQyxZQUFZLENBQUMsa0JBQWtCLENBQUMsU0FBUyxDQUFDLENBQUM7Z0JBRXJELHlCQUF5QixDQUFDLFNBQVMsQ0FBQyxlQUFlLENBQUMsSUFBSSxtQkFBbUIsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO2dCQUVuRixNQUFNLE9BQU8sR0FBRyxnQkFBZ0IsQ0FBQyxXQUFXLENBQUMsT0FBTyxDQUFDLENBQUM7Z0JBQ3RELE1BQU0sZ0JBQWdCLENBQUMsY0FBYyxFQUFFLENBQUM7Z0JBQ3hDLGNBQWMsR0FBRyxNQUFNLE9BQU8sQ0FBQztZQUNuQyxDQUFDLENBQUEsQ0FBQyxDQUFDO1lBRUgsRUFBRSxDQUFDLG9CQUFvQixFQUFFLEdBQUcsRUFBRTtnQkFDMUIsTUFBTSxDQUFDLGNBQWMsQ0FBQyxDQUFDLFdBQVcsRUFBRSxDQUFDO1lBQ3pDLENBQUMsQ0FBQyxDQUFDO1lBRUgsRUFBRSxDQUFDLHdDQUF3QyxFQUFFLEdBQUcsRUFBRTtnQkFDOUMsTUFBTSxDQUFDLGNBQWUsQ0FBQyxRQUFRLENBQUMsS0FBSyxFQUFFLENBQUMsQ0FBQyxPQUFPLENBQUMsMEJBQTBCLENBQUMsQ0FBQztZQUNqRixDQUFDLENBQUMsQ0FBQztZQUVILEVBQUUsQ0FBQywrQ0FBK0MsRUFBRSxHQUFHLEVBQUU7Z0JBQ3JELE1BQU0sQ0FBQyxjQUFlLENBQUMsUUFBUSxDQUFDLFVBQVUsRUFBRSxDQUFDLENBQUMsV0FBVyxFQUFFLENBQUM7Z0JBQzVELE1BQU0sQ0FBQyxjQUFlLENBQUMsUUFBUSxDQUFDLFVBQVUsRUFBRSxDQUFDLEtBQUssRUFBRSxDQUFDLENBQUMsT0FBTyxDQUFDLHNDQUFzQyxDQUFDLENBQUM7WUFDMUcsQ0FBQyxDQUFDLENBQUM7UUFDUCxDQUFDLENBQUMsQ0FBQztRQUVILFFBQVEsQ0FBQyxvQ0FBb0MsRUFBRSxHQUFHLEVBQUU7WUFDaEQsSUFBSSxlQUE0QyxDQUFDO1lBQ2pELElBQUksZUFBNEMsQ0FBQztZQUVqRCxVQUFVLENBQUMsR0FBUyxFQUFFO2dCQUNsQixJQUFJLHFCQUFxQixHQUF3QyxHQUFHLEVBQUUsR0FBRyxNQUFNLENBQUMsS0FBSyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO2dCQUNyRyxNQUFNLGNBQWMsR0FBRyxJQUFJLE9BQU8sQ0FBQyxDQUFDLE9BQU8sRUFBRSxFQUFFLEdBQUcscUJBQXFCLEdBQUcsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBRXRGLE9BQU8sQ0FBQyxJQUFJLENBQUMsc0JBQXNCLENBQy9CLEdBQUcsRUFBRSxDQUFDLGNBQWMsQ0FDdkIsQ0FBQyxxQkFBcUIsQ0FBQztvQkFDcEIsR0FBRyxFQUFFLEVBQUU7b0JBQ1AsUUFBUSxFQUFFLElBQUksQ0FBQyxTQUFTLENBQUMsb0JBQW9CLENBQUM7b0JBQzlDLFlBQVksRUFBRSxHQUFHO29CQUNqQixPQUFPLEVBQUUsRUFBRTtpQkFDZCxDQUFDLENBQUMscUJBQXFCLENBQUM7b0JBQ3JCLEdBQUcsRUFBRSxFQUFFO29CQUNQLFFBQVEsRUFBRSxJQUFJLENBQUMsU0FBUyxDQUFDLGtCQUFrQixDQUFDO29CQUM1QyxZQUFZLEVBQUUsR0FBRztvQkFDakIsT0FBTyxFQUFFLEVBQUU7aUJBQ2QsQ0FBQyxDQUFDO2dCQUVILFNBQVMsQ0FBQyxZQUFZLENBQUMsa0JBQWtCLENBQUMsU0FBUyxDQUFDLENBQUM7Z0JBRXJELHlCQUF5QixDQUFDLFNBQVMsQ0FBQyxlQUFlLENBQUMsSUFBSSxtQkFBbUIsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO2dCQUVuRixNQUFNLE9BQU8sR0FBRyxnQkFBZ0IsQ0FBQyxjQUFjLEVBQUUsQ0FBQztnQkFDbEQsTUFBTSxLQUFLLEdBQUcsZ0JBQWdCLENBQUMsV0FBVyxDQUFDLE9BQU8sQ0FBQyxDQUFDO2dCQUNwRCxNQUFNLEtBQUssR0FBRyxnQkFBZ0IsQ0FBQyxXQUFXLENBQUMsZUFBZSxDQUFDLENBQUM7Z0JBRTVELHFCQUFxQixDQUFDO29CQUNsQixHQUFHLEVBQUUsRUFBRTtvQkFDUCxRQUFRLEVBQUUsSUFBSSxDQUFDLFNBQVMsQ0FBQyxxQkFBcUIsQ0FBQztvQkFDL0MsWUFBWSxFQUFFLEdBQUc7b0JBQ2pCLE9BQU8sRUFBRSxFQUFFO2lCQUNkLENBQUMsQ0FBQztnQkFFSCxNQUFNLE9BQU8sQ0FBQztnQkFDZCxlQUFlLEdBQUcsTUFBTSxLQUFLLENBQUM7Z0JBQzlCLGVBQWUsR0FBRyxNQUFNLEtBQUssQ0FBQztZQUNsQyxDQUFDLENBQUEsQ0FBQyxDQUFDO1lBRUgsRUFBRSxDQUFDLG9CQUFvQixFQUFFLEdBQUcsRUFBRTtnQkFDMUIsTUFBTSxDQUFDLGVBQWUsQ0FBQyxDQUFDLFdBQVcsRUFBRSxDQUFDO2dCQUN0QyxNQUFNLENBQUMsZUFBZSxDQUFDLENBQUMsV0FBVyxFQUFFLENBQUM7WUFDMUMsQ0FBQyxDQUFDLENBQUM7WUFFSCxFQUFFLENBQUMsd0NBQXdDLEVBQUUsR0FBRyxFQUFFO2dCQUM5QyxNQUFNLENBQUMsZUFBZ0IsQ0FBQyxRQUFRLENBQUMsS0FBSyxFQUFFLENBQUMsQ0FBQyxPQUFPLENBQUMsV0FBVyxDQUFDLENBQUM7WUFDbkUsQ0FBQyxDQUFDLENBQUM7WUFFSCxFQUFFLENBQUMsd0NBQXdDLEVBQUUsR0FBRyxFQUFFO2dCQUM5QyxNQUFNLENBQUMsZUFBZ0IsQ0FBQyxRQUFRLENBQUMsS0FBSyxFQUFFLENBQUMsQ0FBQyxPQUFPLENBQUMsV0FBVyxDQUFDLENBQUM7WUFDbkUsQ0FBQyxDQUFDLENBQUM7WUFFSCxFQUFFLENBQUMsK0NBQStDLEVBQUUsR0FBRyxFQUFFO2dCQUNyRCxNQUFNLENBQUMsZUFBZ0IsQ0FBQyxRQUFRLENBQUMsVUFBVSxFQUFFLENBQUMsQ0FBQyxXQUFXLEVBQUUsQ0FBQztnQkFDN0QsTUFBTSxDQUFDLGVBQWdCLENBQUMsUUFBUSxDQUFDLFVBQVUsRUFBRSxDQUFDLEtBQUssRUFBRSxDQUFDLENBQUMsT0FBTyxDQUFDLHNDQUFzQyxDQUFDLENBQUM7Z0JBRXZHLE1BQU0sQ0FBQyxlQUFnQixDQUFDLFFBQVEsQ0FBQyxVQUFVLEVBQUUsQ0FBQyxDQUFDLFdBQVcsRUFBRSxDQUFDO2dCQUM3RCxNQUFNLENBQUMsZUFBZ0IsQ0FBQyxRQUFRLENBQUMsVUFBVSxFQUFFLENBQUMsS0FBSyxFQUFFLENBQUMsQ0FBQyxPQUFPLENBQUMsc0NBQXNDLENBQUMsQ0FBQztZQUMzRyxDQUFDLENBQUMsQ0FBQztRQUNQLENBQUMsQ0FBQyxDQUFDO1FBRUgsUUFBUSxDQUFDLDJEQUEyRCxFQUFFLEdBQUcsRUFBRTtZQUN2RSxJQUFJLGVBQTRDLENBQUM7WUFDakQsSUFBSSxlQUE0QyxDQUFDO1lBRWpELFVBQVUsQ0FBQyxHQUFTLEVBQUU7Z0JBQ2xCLElBQUkscUJBQXFCLEdBQXdDLEdBQUcsRUFBRSxHQUFHLE1BQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBQ3JHLE1BQU0sY0FBYyxHQUFHLElBQUksT0FBTyxDQUFDLENBQUMsT0FBTyxFQUFFLEVBQUUsR0FBRyxxQkFBcUIsR0FBRyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFFdEYsT0FBTyxDQUFDLElBQUksQ0FBQyxzQkFBc0IsQ0FDL0IsR0FBRyxFQUFFLENBQUMsY0FBYyxDQUN2QixDQUFDLHFCQUFxQixDQUNuQixJQUFJLEtBQUssRUFBRSxDQUNkLENBQUMscUJBQXFCLENBQUM7b0JBQ3BCLEdBQUcsRUFBRSxFQUFFO29CQUNQLFFBQVEsRUFBRSxJQUFJLENBQUMsU0FBUyxDQUFDLG9CQUFvQixDQUFDO29CQUM5QyxZQUFZLEVBQUUsR0FBRztvQkFDakIsT0FBTyxFQUFFLEVBQUU7aUJBQ2QsQ0FBQyxDQUFDO2dCQUVILFNBQVMsQ0FBQyxZQUFZLENBQUMsa0JBQWtCLENBQUMsU0FBUyxDQUFDLENBQUM7Z0JBRXJELHlCQUF5QixDQUFDLFNBQVMsQ0FBQyxlQUFlLENBQUMsSUFBSSxtQkFBbUIsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO2dCQUVuRixNQUFNLE9BQU8sR0FBRyxnQkFBZ0IsQ0FBQyxjQUFjLEVBQUUsQ0FBQztnQkFDbEQsTUFBTSxLQUFLLEdBQUcsZ0JBQWdCLENBQUMsV0FBVyxDQUFDLE9BQU8sQ0FBQyxDQUFDO2dCQUNwRCxNQUFNLEtBQUssR0FBRyxnQkFBZ0IsQ0FBQyxXQUFXLENBQUMsZUFBZSxDQUFDLENBQUM7Z0JBRTVELHFCQUFxQixDQUFDO29CQUNsQixHQUFHLEVBQUUsRUFBRTtvQkFDUCxRQUFRLEVBQUUsSUFBSSxDQUFDLFNBQVMsQ0FBQyxxQkFBcUIsQ0FBQztvQkFDL0MsWUFBWSxFQUFFLEdBQUc7b0JBQ2pCLE9BQU8sRUFBRSxFQUFFO2lCQUNkLENBQUMsQ0FBQztnQkFFSCxNQUFNLE9BQU8sQ0FBQztnQkFFZCxlQUFlLEdBQUcsTUFBTSxLQUFLLENBQUM7Z0JBQzlCLGVBQWUsR0FBRyxNQUFNLEtBQUssQ0FBQztZQUNsQyxDQUFDLENBQUEsQ0FBQyxDQUFDO1lBRUgsRUFBRSxDQUFDLG9CQUFvQixFQUFFLEdBQUcsRUFBRTtnQkFDMUIsTUFBTSxDQUFDLGVBQWUsQ0FBQyxDQUFDLFdBQVcsRUFBRSxDQUFDO1lBQzFDLENBQUMsQ0FBQyxDQUFDO1lBRUgsRUFBRSxDQUFDLDhCQUE4QixFQUFFLEdBQUcsRUFBRTtnQkFDcEMsTUFBTSxDQUFDLGVBQWdCLENBQUMsUUFBUSxDQUFDLEtBQUssRUFBRSxDQUFDLENBQUMsT0FBTyxDQUFDLFdBQVcsQ0FBQyxDQUFDO1lBQ25FLENBQUMsQ0FBQyxDQUFDO1lBRUgsRUFBRSxDQUFDLHFCQUFxQixFQUFFLEdBQUcsRUFBRTtnQkFDM0IsTUFBTSxDQUFDLGVBQWUsQ0FBQyxDQUFDLGFBQWEsRUFBRSxDQUFDO1lBQzVDLENBQUMsQ0FBQyxDQUFDO1FBQ1AsQ0FBQyxDQUFDLENBQUM7UUFFSCxRQUFRLENBQUMsc0RBQXNELEVBQUUsR0FBRyxFQUFFO1lBQ2xFLElBQUksZUFBNEMsQ0FBQztZQUNqRCxJQUFJLGVBQTRDLENBQUM7WUFFakQsVUFBVSxDQUFDLEdBQVMsRUFBRTtnQkFDbEIsSUFBSSxvQkFBb0IsR0FBeUIsR0FBRyxFQUFFLEdBQUcsTUFBTSxDQUFDLEtBQUssQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFDckYsTUFBTSxjQUFjLEdBQUcsSUFBSSxPQUFPLENBQUMsQ0FBQyxNQUFNLEVBQUUsRUFBRSxHQUFHLG9CQUFvQixHQUFHLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO2dCQUVuRixPQUFPLENBQUMsSUFBSSxDQUFDLHNCQUFzQixDQUMvQixHQUFHLEVBQUUsQ0FBQyxjQUFjLENBQ3ZCLENBQUMscUJBQXFCLENBQ25CLElBQUksS0FBSyxFQUFFLENBQ2QsQ0FBQyxxQkFBcUIsQ0FBQztvQkFDcEIsR0FBRyxFQUFFLEVBQUU7b0JBQ1AsUUFBUSxFQUFFLElBQUksQ0FBQyxTQUFTLENBQUMsa0JBQWtCLENBQUM7b0JBQzVDLFlBQVksRUFBRSxHQUFHO29CQUNqQixPQUFPLEVBQUUsRUFBRTtpQkFDZCxDQUFDLENBQUM7Z0JBRUgsU0FBUyxDQUFDLFlBQVksQ0FBQyxrQkFBa0IsQ0FBQyxTQUFTLENBQUMsQ0FBQztnQkFFckQseUJBQXlCLENBQUMsU0FBUyxDQUFDLGVBQWUsQ0FBQyxJQUFJLG1CQUFtQixDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7Z0JBRW5GLE1BQU0sT0FBTyxHQUFHLGdCQUFnQixDQUFDLGNBQWMsRUFBRSxDQUFDO2dCQUNsRCxNQUFNLEtBQUssR0FBRyxnQkFBZ0IsQ0FBQyxXQUFXLENBQUMsT0FBTyxDQUFDLENBQUM7Z0JBQ3BELE1BQU0sS0FBSyxHQUFHLGdCQUFnQixDQUFDLFdBQVcsQ0FBQyxlQUFlLENBQUMsQ0FBQztnQkFFNUQsb0JBQW9CLENBQUMsSUFBSSxLQUFLLEVBQUUsQ0FBQyxDQUFDO2dCQUVsQyxJQUFJO29CQUNBLE1BQU0sT0FBTyxDQUFDO2lCQUNqQjtnQkFBQyxPQUFPLEdBQUcsRUFBRTtvQkFDVixRQUFRO2lCQUNYO2dCQUVELGVBQWUsR0FBRyxNQUFNLEtBQUssQ0FBQztnQkFDOUIsZUFBZSxHQUFHLE1BQU0sS0FBSyxDQUFDO1lBQ2xDLENBQUMsQ0FBQSxDQUFDLENBQUM7WUFFSCxFQUFFLENBQUMscUJBQXFCLEVBQUUsR0FBRyxFQUFFO2dCQUMzQixNQUFNLENBQUMsZUFBZSxDQUFDLENBQUMsYUFBYSxFQUFFLENBQUM7Z0JBQ3hDLE1BQU0sQ0FBQyxlQUFlLENBQUMsQ0FBQyxhQUFhLEVBQUUsQ0FBQztZQUM1QyxDQUFDLENBQUMsQ0FBQztZQUVILEVBQUUsQ0FBQyw0Q0FBNEMsRUFBRSxHQUFHLEVBQUU7Z0JBQ2xELE1BQU0sQ0FBQyxVQUFVLENBQUMseUJBQXlCLENBQUMsQ0FBQyxjQUFjLENBQUMsTUFBTSxDQUFDLGlCQUFpQixFQUFFLE1BQU0sQ0FBQyxnQkFBZ0IsQ0FBQyxFQUFFLEtBQUssRUFBRSw0QkFBNEIsRUFBRSxDQUFDLENBQUMsQ0FBQztZQUM1SixDQUFDLENBQUMsQ0FBQztRQUNQLENBQUMsQ0FBQyxDQUFDO1FBRUgsUUFBUSxDQUFDLG1DQUFtQyxFQUFFLEdBQUcsRUFBRTtZQUMvQyxJQUFJLGNBQTJDLENBQUM7WUFFaEQsVUFBVSxDQUFDLEdBQVMsRUFBRTtnQkFDbEIsSUFBSSxxQkFBcUIsR0FBd0MsR0FBRyxFQUFFLEdBQUcsTUFBTSxDQUFDLEtBQUssQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFDckcsTUFBTSxjQUFjLEdBQUcsSUFBSSxPQUFPLENBQUMsQ0FBQyxPQUFPLEVBQUUsRUFBRSxHQUFHLHFCQUFxQixHQUFHLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO2dCQUV0RixPQUFPLENBQUMsSUFBSSxDQUFDLHFCQUFxQixDQUFDO29CQUMvQixHQUFHLEVBQUUsRUFBRTtvQkFDUCxRQUFRLEVBQUUsSUFBSSxDQUFDLFNBQVMsQ0FBQyxxQkFBcUIsQ0FBQztvQkFDL0MsWUFBWSxFQUFFLEdBQUc7b0JBQ2pCLE9BQU8sRUFBRSxFQUFFO2lCQUNkLENBQUMsQ0FBQyxxQkFBcUIsQ0FBQztvQkFDckIsR0FBRyxFQUFFLEVBQUU7b0JBQ1AsUUFBUSxFQUFFLElBQUksQ0FBQyxTQUFTLENBQUMsb0JBQW9CLENBQUM7b0JBQzlDLFlBQVksRUFBRSxHQUFHO29CQUNqQixPQUFPLEVBQUUsRUFBRTtpQkFDZCxDQUFDLENBQUMsc0JBQXNCLENBQ3JCLEdBQUcsRUFBRSxDQUFDLGNBQWMsQ0FDdkIsQ0FBQyxxQkFBcUIsQ0FBQztvQkFDcEIsR0FBRyxFQUFFLEVBQUU7b0JBQ1AsUUFBUSxFQUFFLElBQUksQ0FBQyxTQUFTLENBQUMsa0JBQWtCLENBQUM7b0JBQzVDLFlBQVksRUFBRSxHQUFHO29CQUNqQixPQUFPLEVBQUUsRUFBRTtpQkFDZCxDQUFDLENBQUM7Z0JBRUgsU0FBUyxDQUFDLGFBQWEsQ0FBQyxlQUFlLENBQUM7b0JBQ3BDLEtBQUssRUFBRSxTQUFTLENBQUMsT0FBTyxDQUFDO29CQUN6QixhQUFhLEVBQUUsU0FBUyxDQUFDLGVBQWUsQ0FBQztpQkFDNUMsQ0FBQyxDQUFDO2dCQUVILFNBQVMsQ0FBQyxZQUFZLENBQUMsa0JBQWtCLENBQUMsU0FBUyxDQUFDLENBQUM7Z0JBRXJELHlCQUF5QixDQUFDLFNBQVMsQ0FBQyxlQUFlLENBQUMsSUFBSSxtQkFBbUIsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO2dCQUVuRixNQUFNLGdCQUFnQixDQUFDLGNBQWMsRUFBRSxDQUFDO2dCQUN4QyxNQUFNLGdCQUFnQixDQUFDLFdBQVcsQ0FBQyxPQUFPLENBQUMsQ0FBQztnQkFDNUMsTUFBTSxNQUFNLEdBQUcsZ0JBQWdCLENBQUMsYUFBYSxDQUFDLEVBQUUsQ0FBQyxDQUFDO2dCQUNsRCxNQUFNLElBQUksR0FBRyxnQkFBZ0IsQ0FBQyxXQUFXLENBQUMsT0FBTyxDQUFDLENBQUM7Z0JBRW5ELHFCQUFxQixDQUFDO29CQUNsQixHQUFHLEVBQUUsRUFBRTtvQkFDUCxRQUFRLEVBQUUsSUFBSSxDQUFDLFNBQVMsQ0FBQyxvQkFBb0IsQ0FBQztvQkFDOUMsWUFBWSxFQUFFLEdBQUc7b0JBQ2pCLE9BQU8sRUFBRSxFQUFFO2lCQUNkLENBQUMsQ0FBQztnQkFFSCxNQUFNLE1BQU0sQ0FBQztnQkFDYixjQUFjLEdBQUcsTUFBTSxJQUFJLENBQUM7WUFDaEMsQ0FBQyxDQUFBLENBQUMsQ0FBQztZQUVILEVBQUUsQ0FBQyxvQkFBb0IsRUFBRSxHQUFHLEVBQUU7Z0JBQzFCLE1BQU0sQ0FBQyxjQUFjLENBQUMsQ0FBQyxXQUFXLEVBQUUsQ0FBQztZQUN6QyxDQUFDLENBQUMsQ0FBQztZQUVILEVBQUUsQ0FBQyw4QkFBOEIsRUFBRSxHQUFHLEVBQUU7Z0JBQ3BDLE1BQU0sQ0FBQyxjQUFlLENBQUMsUUFBUSxDQUFDLEtBQUssRUFBRSxDQUFDLENBQUMsT0FBTyxDQUFDLDBCQUEwQixDQUFDLENBQUM7WUFDakYsQ0FBQyxDQUFDLENBQUM7UUFDUCxDQUFDLENBQUMsQ0FBQztRQUVILFFBQVEsQ0FBQywyQkFBMkIsRUFBRSxHQUFHLEVBQUU7WUFDdkMsSUFBSSxVQUFxQixDQUFDO1lBRTFCLFVBQVUsQ0FBQyxHQUFTLEVBQUU7Z0JBQ2xCLE9BQU8sQ0FBQyxJQUFJLENBQUMscUJBQXFCLENBQUM7b0JBQy9CLEdBQUcsRUFBRSxFQUFFO29CQUNQLFFBQVEsRUFBRSxJQUFJLENBQUMsU0FBUyxDQUFDLHFCQUFxQixDQUFDO29CQUMvQyxZQUFZLEVBQUUsR0FBRztvQkFDakIsT0FBTyxFQUFFLEVBQUU7aUJBQ2QsQ0FBQyxDQUFDLHFCQUFxQixDQUFDO29CQUNyQixHQUFHLEVBQUUsRUFBRTtvQkFDUCxRQUFRLEVBQUUsSUFBSSxDQUFDLFNBQVMsQ0FBQyxrQkFBa0IsQ0FBQztvQkFDNUMsWUFBWSxFQUFFLEdBQUc7b0JBQ2pCLE9BQU8sRUFBRSxFQUFFO2lCQUNkLENBQUMsQ0FBQyxxQkFBcUIsQ0FBQztvQkFDckIsR0FBRyxFQUFFLEVBQUU7b0JBQ1AsUUFBUSxFQUFFLElBQUksQ0FBQyxTQUFTLENBQUMsa0JBQWtCLENBQUM7b0JBQzVDLFlBQVksRUFBRSxHQUFHO29CQUNqQixPQUFPLEVBQUUsRUFBRTtpQkFDZCxDQUFDLENBQUMscUJBQXFCLENBQUM7b0JBQ3JCLEdBQUcsRUFBRSxFQUFFO29CQUNQLFFBQVEsRUFBRSxJQUFJLENBQUMsU0FBUyxDQUFDLG9CQUFvQixDQUFDO29CQUM5QyxZQUFZLEVBQUUsR0FBRztvQkFDakIsT0FBTyxFQUFFLEVBQUU7aUJBQ2QsQ0FBQyxDQUFDO2dCQUVILFNBQVMsQ0FBQyxhQUFhLENBQUMsZUFBZSxDQUFDO29CQUNwQyxLQUFLLEVBQUUsU0FBUyxDQUFDLE9BQU8sQ0FBQztvQkFDekIsYUFBYSxFQUFFLFNBQVMsQ0FBQyxlQUFlLENBQUM7aUJBQzVDLENBQUMsQ0FBQztnQkFFSCxTQUFTLENBQUMsWUFBWSxDQUFDLGtCQUFrQixDQUFDLFNBQVMsQ0FBQyxDQUFDO2dCQUVyRCx5QkFBeUIsQ0FBQyxTQUFTLENBQUMsZUFBZSxDQUFDLElBQUksbUJBQW1CLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQztnQkFFbkYsVUFBVSxHQUFHLElBQUksQ0FBQyxFQUFFLEVBQUUsQ0FBQztnQkFDdkIsZ0JBQWdCLENBQUMsVUFBVSxDQUFDLFNBQVMsQ0FBQyxVQUFVLENBQUMsQ0FBQztnQkFFbEQsTUFBTSxnQkFBZ0IsQ0FBQyxjQUFjLEVBQUUsQ0FBQztnQkFDeEMsTUFBTSxnQkFBZ0IsQ0FBQyxXQUFXLENBQUMsT0FBTyxDQUFDLENBQUM7Z0JBQzVDLE1BQU0sZ0JBQWdCLENBQUMsV0FBVyxDQUFDLGVBQWUsQ0FBQyxDQUFDO2dCQUNwRCxNQUFNLGdCQUFnQixDQUFDLGFBQWEsQ0FBQyxDQUFDLGVBQWUsQ0FBQyxDQUFDLENBQUM7WUFDNUQsQ0FBQyxDQUFBLENBQUMsQ0FBQztZQUVILEVBQUUsQ0FBQyx1REFBdUQsRUFBRSxHQUFHLEVBQUU7Z0JBQzdELE1BQU0sQ0FBQyxtQkFBbUIsQ0FBQyxrQkFBa0IsRUFBRSxDQUFDLENBQUMsT0FBTyxDQUFDO29CQUNyRCxVQUFVLEVBQUUsQ0FBQztvQkFDYixNQUFNLEVBQUUsQ0FBQztvQkFDVCxLQUFLLEVBQUUsQ0FBQztvQkFDUixlQUFlLEVBQUUsRUFBRztvQkFDcEIsY0FBYyxFQUFFLEVBQUc7b0JBQ25CLGtCQUFrQixFQUFFLEVBQUc7aUJBQzFCLENBQUMsQ0FBQztZQUNQLENBQUMsQ0FBQyxDQUFDO1lBRUgsRUFBRSxDQUFDLCtCQUErQixFQUFFLEdBQUcsRUFBRTtnQkFDckMsTUFBTSxDQUFDLFVBQVUsQ0FBQyxDQUFDLGVBQWUsQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFDdEMsTUFBTSxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLGVBQWUsQ0FBQyxDQUFDO2dCQUM3RCxNQUFNLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxXQUFXLEVBQUUsQ0FBQztnQkFDbEQsTUFBTSxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsV0FBVyxFQUFFLENBQUM7Z0JBRWxELE1BQU0sUUFBUSxHQUF1QixVQUFVLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFFakUsTUFBTSxDQUFDLFFBQVEsQ0FBQyxLQUFLLEVBQUUsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxhQUFhLENBQUMsQ0FBQztnQkFFaEQsTUFBTSxDQUFDLFFBQVEsQ0FBQyxVQUFVLEVBQUUsQ0FBQyxDQUFDLFdBQVcsRUFBRSxDQUFDO2dCQUM1QyxNQUFNLENBQUMsUUFBUSxDQUFDLFVBQVUsRUFBRSxDQUFDLEtBQUssRUFBRSxDQUFDLENBQUMsT0FBTyxDQUFDLHNDQUFzQyxDQUFDLENBQUM7WUFDMUYsQ0FBQyxDQUFDLENBQUM7WUFFSCxFQUFFLENBQUMsNENBQTRDLEVBQUUsR0FBRyxFQUFFO2dCQUNsRCxNQUFNLFlBQVksR0FBaUQsVUFBVSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBRS9GLE1BQU0sQ0FBQyxZQUFZLENBQUMsQ0FBQyxPQUFPLENBQUM7b0JBQ3pCLEtBQUssRUFBRTt3QkFDSCw4R0FBOEc7cUJBQ2pIO29CQUNELFFBQVEsRUFBRTt3QkFDTixpSEFBaUg7cUJBQ3BIO29CQUNELEtBQUssRUFBRTt3QkFDSCw4R0FBOEc7cUJBQ2pIO29CQUNELGFBQWEsRUFBRTt3QkFDWCxzSEFBc0g7cUJBQ3pIO29CQUNELE1BQU0sRUFBRTt3QkFDSiwrR0FBK0c7cUJBQ2xIO29CQUNELFFBQVEsRUFBRTt3QkFDTixpSEFBaUg7cUJBQ3BIO29CQUNELElBQUksRUFBRTt3QkFDRiw2R0FBNkc7cUJBQ2hIO29CQUNELElBQUksRUFBRTt3QkFDRiw2R0FBNkc7cUJBQ2hIO29CQUNELE9BQU8sRUFBRTt3QkFDTCxnSEFBZ0g7cUJBQ25IO29CQUNELEtBQUssRUFBRTt3QkFDSCwrR0FBK0c7d0JBQy9HLDhHQUE4RztxQkFDakg7b0JBQ0QsYUFBYSxFQUFFO3dCQUNYLHNIQUFzSDtxQkFDekg7b0JBQ0QsaUJBQWlCLEVBQUU7d0JBQ2YsMEhBQTBIO3FCQUM3SDtpQkFDSixDQUFDLENBQUM7WUFDUCxDQUFDLENBQUMsQ0FBQztZQUVILEVBQUUsQ0FBQywwQ0FBMEMsRUFBRSxHQUFHLEVBQUU7Z0JBQ2hELE1BQU0sUUFBUSxHQUF1QixVQUFVLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFFakUsTUFBTSxDQUFDLFFBQVEsQ0FBQyxhQUFhLEVBQUUsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUNuRCxDQUFDLENBQUMsQ0FBQztZQUVILEVBQUUsQ0FBQyx1Q0FBdUMsRUFBRSxHQUFHLEVBQUU7Z0JBQzdDLE1BQU0sQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUMsdUJBQXVCLENBQUMsQ0FBQyxFQUFFLE1BQU0sQ0FBQyxRQUFRLEVBQUUsRUFBRSxJQUFJLGdCQUFnQixDQUFDO29CQUNwRixhQUFhLEVBQUUsSUFBSTtvQkFDbkIsYUFBYSxFQUFFLElBQUk7b0JBQ25CLE9BQU8sRUFBRSxJQUFJO29CQUNiLElBQUksRUFBRSxJQUFJO29CQUNWLGlCQUFpQixFQUFFO3dCQUNmLGFBQWEsRUFBRTs0QkFDWCxPQUFPLEVBQUUsQ0FBQyxPQUFPLENBQUM7NEJBQ2xCLFNBQVMsRUFBRSxLQUFLOzRCQUNoQixXQUFXLEVBQUUsS0FBSzt5QkFDckI7d0JBQ0QsS0FBSyxFQUFFOzRCQUNILE9BQU8sRUFBRSxDQUFDLE9BQU8sQ0FBQzs0QkFDbEIsU0FBUyxFQUFFLEtBQUs7NEJBQ2hCLFdBQVcsRUFBRSxLQUFLO3lCQUNyQjtxQkFDSjtvQkFDRCxVQUFVLEVBQUU7d0JBQ1IsYUFBYSxFQUFFOzRCQUNYLE9BQU8sRUFBRSxDQUFDLE9BQU8sQ0FBQzs0QkFDbEIsU0FBUyxFQUFFLEtBQUs7NEJBQ2hCLFdBQVcsRUFBRSxLQUFLO3lCQUNyQjtxQkFDSjtvQkFDRCxXQUFXLEVBQUUsRUFBRTtpQkFDbEIsQ0FBQyxFQUFFLEVBQUUsRUFBRTtvQkFDSixlQUFlLEVBQUUsS0FBSztvQkFDdEIsT0FBTyxFQUFFLENBQUM7b0JBQ1YsVUFBVSxFQUFFLENBQUM7b0JBQ2IseUJBQXlCLEVBQUUsS0FBSztvQkFDaEMsT0FBTyxFQUFFLElBQUk7aUJBQ2hCLENBQUMsQ0FBQztZQUNQLENBQUMsQ0FBQyxDQUFDO1FBQ1AsQ0FBQyxDQUFDLENBQUM7UUFFSCxRQUFRLENBQUMsdUJBQXVCLEVBQUUsR0FBRyxFQUFFO1lBQ25DLElBQUksUUFBbUIsQ0FBQztZQUV4QixVQUFVLENBQUMsR0FBUyxFQUFFO2dCQUNsQixPQUFPLENBQUMsSUFBSSxDQUFDLHFCQUFxQixDQUFDO29CQUMvQixHQUFHLEVBQUUsRUFBRTtvQkFDUCxRQUFRLEVBQUUsSUFBSSxDQUFDLFNBQVMsQ0FBQyxxQkFBcUIsQ0FBQztvQkFDL0MsWUFBWSxFQUFFLEdBQUc7b0JBQ2pCLE9BQU8sRUFBRSxFQUFFO2lCQUNkLENBQUMsQ0FBQyxxQkFBcUIsQ0FBQztvQkFDckIsR0FBRyxFQUFFLEVBQUU7b0JBQ1AsUUFBUSxFQUFFLElBQUksQ0FBQyxTQUFTLENBQUMsa0JBQWtCLENBQUM7b0JBQzVDLFlBQVksRUFBRSxHQUFHO29CQUNqQixPQUFPLEVBQUUsRUFBRTtpQkFDZCxDQUFDLENBQUMscUJBQXFCLENBQUM7b0JBQ3JCLEdBQUcsRUFBRSxFQUFFO29CQUNQLFFBQVEsRUFBRSxJQUFJLENBQUMsU0FBUyxDQUFDLGtCQUFrQixDQUFDO29CQUM1QyxZQUFZLEVBQUUsR0FBRztvQkFDakIsT0FBTyxFQUFFLEVBQUU7aUJBQ2QsQ0FBQyxDQUFDLHFCQUFxQixDQUFDLElBQUksS0FBSyxFQUFFLENBQUMsQ0FBQztnQkFFdEMsU0FBUyxDQUFDLGFBQWEsQ0FBQyxlQUFlLENBQUM7b0JBQ3BDLEtBQUssRUFBRSxTQUFTLENBQUMsT0FBTyxDQUFDO29CQUN6QixhQUFhLEVBQUUsU0FBUyxDQUFDLGVBQWUsQ0FBQztpQkFDNUMsQ0FBQyxDQUFDO2dCQUVILFNBQVMsQ0FBQyxZQUFZLENBQUMsa0JBQWtCLENBQUMsU0FBUyxDQUFDLENBQUM7Z0JBRXJELHlCQUF5QixDQUFDLFNBQVMsQ0FBQyxlQUFlLENBQUMsSUFBSSxtQkFBbUIsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO2dCQUVuRixRQUFRLEdBQUcsSUFBSSxDQUFDLEVBQUUsRUFBRSxDQUFDO2dCQUNyQixnQkFBZ0IsQ0FBQyxRQUFRLENBQUMsU0FBUyxDQUFDLFFBQVEsQ0FBQyxDQUFDO2dCQUU5QyxNQUFNLGdCQUFnQixDQUFDLGNBQWMsRUFBRSxDQUFDO2dCQUN4QyxNQUFNLGdCQUFnQixDQUFDLFdBQVcsQ0FBQyxPQUFPLENBQUMsQ0FBQztnQkFDNUMsTUFBTSxnQkFBZ0IsQ0FBQyxXQUFXLENBQUMsZUFBZSxDQUFDLENBQUM7Z0JBQ3BELE1BQU0sZ0JBQWdCLENBQUMsYUFBYSxDQUFDLENBQUMsT0FBTyxFQUFFLGVBQWUsQ0FBQyxDQUFDLENBQUM7WUFDckUsQ0FBQyxDQUFBLENBQUMsQ0FBQztZQUVILEVBQUUsQ0FBQyxnREFBZ0QsRUFBRSxHQUFHLEVBQUU7Z0JBQ3RELE1BQU0sQ0FBQyxRQUFRLENBQUMsQ0FBQyxlQUFlLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBRXBDLE1BQU0sQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsQ0FBQztnQkFFbkQsTUFBTSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLGVBQWUsQ0FBQyxDQUFDO1lBQy9ELENBQUMsQ0FBQyxDQUFDO1lBRUgsRUFBRSxDQUFDLHdDQUF3QyxFQUFFLEdBQUcsRUFBRTtnQkFDOUMsTUFBTSxDQUFDLGdCQUFnQixDQUFDLGdCQUFnQixFQUFFLENBQUMsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUM7WUFDOUQsQ0FBQyxDQUFDLENBQUM7UUFDUCxDQUFDLENBQUMsQ0FBQztRQUVILFFBQVEsQ0FBQyw4Q0FBOEMsRUFBRSxHQUFHLEVBQUU7WUFDMUQsSUFBSSxjQUEyQyxDQUFDO1lBRWhELFVBQVUsQ0FBQyxHQUFTLEVBQUU7Z0JBQ2xCLE9BQU8sQ0FBQyxJQUFJLENBQUMscUJBQXFCLENBQUM7b0JBQy9CLEdBQUcsRUFBRSxFQUFFO29CQUNQLFFBQVEsRUFBRSxJQUFJLENBQUMsU0FBUyxDQUFDLHFCQUFxQixDQUFDO29CQUMvQyxZQUFZLEVBQUUsR0FBRztvQkFDakIsT0FBTyxFQUFFLEVBQUU7aUJBQ2QsQ0FBQyxDQUFDLHFCQUFxQixDQUFDO29CQUNyQixHQUFHLEVBQUUsRUFBRTtvQkFDUCxRQUFRLEVBQUUsSUFBSSxDQUFDLFNBQVMsQ0FBQyxrQkFBa0IsQ0FBQztvQkFDNUMsWUFBWSxFQUFFLEdBQUc7b0JBQ2pCLE9BQU8sRUFBRSxFQUFFO2lCQUNkLENBQUMsQ0FBQyxxQkFBcUIsQ0FBQztvQkFDckIsR0FBRyxFQUFFLEVBQUU7b0JBQ1AsUUFBUSxFQUFFLElBQUksQ0FBQyxTQUFTLENBQUMsb0JBQW9CLENBQUM7b0JBQzlDLFlBQVksRUFBRSxHQUFHO29CQUNqQixPQUFPLEVBQUUsRUFBRTtpQkFDZCxDQUFDLENBQUMscUJBQXFCLENBQUM7b0JBQ3JCLEdBQUcsRUFBRSxFQUFFO29CQUNQLFFBQVEsRUFBRSxJQUFJLENBQUMsU0FBUyxDQUFDLG9CQUFvQixDQUFDO29CQUM5QyxZQUFZLEVBQUUsR0FBRztvQkFDakIsT0FBTyxFQUFFLEVBQUU7aUJBQ2QsQ0FBQyxDQUFDO2dCQUVILFNBQVMsQ0FBQyxhQUFhLENBQUMsZUFBZSxDQUFDO29CQUNwQyxLQUFLLEVBQUUsU0FBUyxDQUFDLE9BQU8sQ0FBQztvQkFDekIsYUFBYSxFQUFFLFNBQVMsQ0FBQyxlQUFlLENBQUM7aUJBQzVDLENBQUMsQ0FBQztnQkFFSCxTQUFTLENBQUMsWUFBWSxDQUFDLGtCQUFrQixDQUFDLFNBQVMsQ0FBQyxDQUFDO2dCQUVyRCx5QkFBeUIsQ0FBQyxTQUFTLENBQUMsZUFBZSxDQUFDLElBQUksbUJBQW1CLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQztnQkFFbkYsTUFBTSxnQkFBZ0IsQ0FBQyxjQUFjLEVBQUUsQ0FBQztnQkFDeEMsTUFBTSxnQkFBZ0IsQ0FBQyxXQUFXLENBQUMsT0FBTyxDQUFDLENBQUM7Z0JBQzVDLE1BQU0sZ0JBQWdCLENBQUMsYUFBYSxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQztnQkFDaEQsY0FBYyxHQUFHLE1BQU0sZ0JBQWdCLENBQUMsV0FBVyxDQUFDLGVBQWUsQ0FBQyxDQUFDO1lBQ3pFLENBQUMsQ0FBQSxDQUFDLENBQUM7WUFFSCxFQUFFLENBQUMsaURBQWlELEVBQUUsR0FBRyxFQUFFO2dCQUN2RCxNQUFNLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDLHVCQUF1QixDQUFDLENBQUMsRUFBRSxNQUFNLENBQUMsUUFBUSxFQUFFLEVBQUUsSUFBSSxnQkFBZ0IsQ0FBQztvQkFDcEYsT0FBTyxFQUFFLEtBQUs7b0JBQ2QsSUFBSSxFQUFFLElBQUk7b0JBQ1YsVUFBVSxFQUFFO3dCQUNSLGFBQWEsRUFBRTs0QkFDWCxPQUFPLEVBQUUsQ0FBQyxPQUFPLENBQUM7NEJBQ2xCLFNBQVMsRUFBRSxLQUFLOzRCQUNoQixXQUFXLEVBQUUsS0FBSzt5QkFDckI7cUJBQ0o7b0JBQ0QsV0FBVyxFQUFFO3dCQUNULGFBQWEsRUFBRTs0QkFDWCxpQkFBaUIsRUFBRSxJQUFJOzRCQUN2QixZQUFZLEVBQUUsSUFBSTs0QkFDbEIsU0FBUyxFQUFFLEdBQUc7eUJBQ2pCO3FCQUNKO29CQUNELG9CQUFvQixFQUFFO3dCQUNsQixDQUFDLEVBQUUsb0JBQW9CO3FCQUMxQjtpQkFDSixDQUFDLEVBQUUsRUFBRSxFQUFFO29CQUNKLGVBQWUsRUFBRSxLQUFLO29CQUN0QixPQUFPLEVBQUUsQ0FBQztvQkFDVixVQUFVLEVBQUUsQ0FBQztvQkFDYix5QkFBeUIsRUFBRSxLQUFLO29CQUNoQyxPQUFPLEVBQUUsSUFBSTtpQkFDaEIsQ0FBQyxDQUFDO1lBQ1AsQ0FBQyxDQUFDLENBQUM7WUFFSCxFQUFFLENBQUMsb0JBQW9CLEVBQUUsR0FBRyxFQUFFO2dCQUMxQixNQUFNLENBQUMsY0FBYyxDQUFDLENBQUMsV0FBVyxFQUFFLENBQUM7WUFDekMsQ0FBQyxDQUFDLENBQUM7WUFFSCxFQUFFLENBQUMsOEJBQThCLEVBQUUsR0FBRyxFQUFFO2dCQUNwQyxNQUFNLENBQUMsY0FBZSxDQUFDLFFBQVEsQ0FBQyxLQUFLLEVBQUUsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxXQUFXLENBQUMsQ0FBQztZQUNsRSxDQUFDLENBQUMsQ0FBQztRQUNQLENBQUMsQ0FBQyxDQUFDO1FBRUgsUUFBUSxDQUFDLDJDQUEyQyxFQUFFLEdBQUcsRUFBRTtZQUN2RCxJQUFJLGNBQTJDLENBQUM7WUFFaEQsVUFBVSxDQUFDLEdBQVMsRUFBRTtnQkFDbEIsSUFBSSx5QkFBeUIsR0FBZSxHQUFHLEVBQUUsR0FBRyxNQUFNLENBQUMsS0FBSyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO2dCQUNoRixNQUFNLGtCQUFrQixHQUFHLElBQUksT0FBTyxDQUFDLENBQUMsT0FBTyxFQUFFLEVBQUUsR0FBRyx5QkFBeUIsR0FBRyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFFOUYsSUFBSSxxQkFBcUIsR0FBd0MsR0FBRyxFQUFFLEdBQUcsTUFBTSxDQUFDLEtBQUssQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFDckcsTUFBTSxjQUFjLEdBQUcsSUFBSSxPQUFPLENBQUMsQ0FBQyxPQUFPLEVBQUUsRUFBRSxHQUFHLHFCQUFxQixHQUFHLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO2dCQUV0RixPQUFPLENBQUMsSUFBSSxDQUFDLHFCQUFxQixDQUFDO29CQUMvQixHQUFHLEVBQUUsRUFBRTtvQkFDUCxRQUFRLEVBQUUsSUFBSSxDQUFDLFNBQVMsQ0FBQyxxQkFBcUIsQ0FBQztvQkFDL0MsWUFBWSxFQUFFLEdBQUc7b0JBQ2pCLE9BQU8sRUFBRSxFQUFFO2lCQUNkLENBQUMsQ0FBQyxzQkFBc0IsQ0FDckIsR0FBRyxFQUFFLEdBQUcseUJBQXlCLEVBQUUsQ0FBQyxDQUFDLE9BQU8sY0FBYyxDQUFDLENBQUMsQ0FBQyxDQUNoRSxDQUFDLHFCQUFxQixDQUFDO29CQUNwQixHQUFHLEVBQUUsRUFBRTtvQkFDUCxRQUFRLEVBQUUsSUFBSSxDQUFDLFNBQVMsQ0FBQyxvQkFBb0IsQ0FBQztvQkFDOUMsWUFBWSxFQUFFLEdBQUc7b0JBQ2pCLE9BQU8sRUFBRSxFQUFFO2lCQUNkLENBQUMsQ0FBQyxxQkFBcUIsQ0FBQztvQkFDckIsR0FBRyxFQUFFLEVBQUU7b0JBQ1AsUUFBUSxFQUFFLElBQUksQ0FBQyxTQUFTLENBQUMsb0JBQW9CLENBQUM7b0JBQzlDLFlBQVksRUFBRSxHQUFHO29CQUNqQixPQUFPLEVBQUUsRUFBRTtpQkFDZCxDQUFDLENBQUM7Z0JBRUgsU0FBUyxDQUFDLGFBQWEsQ0FBQyxlQUFlLENBQUM7b0JBQ3BDLEtBQUssRUFBRSxTQUFTLENBQUMsT0FBTyxDQUFDO29CQUN6QixhQUFhLEVBQUUsU0FBUyxDQUFDLGVBQWUsQ0FBQztpQkFDNUMsQ0FBQyxDQUFDO2dCQUVILFNBQVMsQ0FBQyxZQUFZLENBQUMsa0JBQWtCLENBQUMsU0FBUyxDQUFDLENBQUM7Z0JBRXJELHlCQUF5QixDQUFDLFNBQVMsQ0FBQyxlQUFlLENBQUMsSUFBSSxtQkFBbUIsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO2dCQUVuRixNQUFNLGdCQUFnQixDQUFDLGNBQWMsRUFBRSxDQUFDO2dCQUN4QyxNQUFNLElBQUksR0FBRyxnQkFBZ0IsQ0FBQyxXQUFXLENBQUMsT0FBTyxDQUFDLENBQUM7Z0JBRW5ELE1BQU0sa0JBQWtCLENBQUM7Z0JBRXpCLE1BQU0sTUFBTSxHQUFHLGdCQUFnQixDQUFDLGFBQWEsQ0FBQyxDQUFDLGVBQWUsQ0FBQyxDQUFDLENBQUM7Z0JBRWpFLE1BQU0sTUFBTSxDQUFDO2dCQUViLHFCQUFxQixDQUFDO29CQUNsQixHQUFHLEVBQUUsRUFBRTtvQkFDUCxRQUFRLEVBQUUsSUFBSTtvQkFDZCxZQUFZLEVBQUUsR0FBRztvQkFDakIsT0FBTyxFQUFFLEVBQUU7aUJBQ2QsQ0FBQyxDQUFDO2dCQUVILGNBQWMsR0FBRyxNQUFNLElBQUksQ0FBQztZQUNoQyxDQUFDLENBQUEsQ0FBQyxDQUFDO1lBRUgsRUFBRSxDQUFDLG9CQUFvQixFQUFFLEdBQUcsRUFBRTtnQkFDMUIsTUFBTSxDQUFDLGNBQWMsQ0FBQyxDQUFDLFdBQVcsRUFBRSxDQUFDO1lBQ3pDLENBQUMsQ0FBQyxDQUFDO1lBRUgsRUFBRSxDQUFDLDhCQUE4QixFQUFFLEdBQUcsRUFBRTtnQkFDcEMsTUFBTSxDQUFDLGNBQWUsQ0FBQyxRQUFRLENBQUMsS0FBSyxFQUFFLENBQUMsQ0FBQyxPQUFPLENBQUMsV0FBVyxDQUFDLENBQUM7WUFDbEUsQ0FBQyxDQUFDLENBQUM7WUFFSCxFQUFFLENBQUMsaUNBQWlDLEVBQUUsR0FBRyxFQUFFO2dCQUN2QyxNQUFNLENBQUMsY0FBZSxDQUFDLFFBQVEsQ0FBQyxVQUFVLEVBQUUsQ0FBQyxDQUFDLFdBQVcsRUFBRSxDQUFDO2dCQUM1RCxNQUFNLENBQUMsY0FBZSxDQUFDLFFBQVEsQ0FBQyxVQUFVLEVBQUUsQ0FBQyxLQUFLLEVBQUUsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxzQ0FBc0MsQ0FBQyxDQUFDO2dCQUN0RyxNQUFNLENBQUMsY0FBZSxDQUFDLFFBQVEsQ0FBQyxVQUFVLEVBQUUsQ0FBQyxLQUFLLEVBQUUsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxzQ0FBc0MsQ0FBQyxDQUFDO1lBQzFHLENBQUMsQ0FBQyxDQUFDO1FBQ1AsQ0FBQyxDQUFDLENBQUM7UUFFSCxRQUFRLENBQUMsa0VBQWtFLEVBQUUsR0FBRyxFQUFFO1lBQzlFLElBQUksY0FBMkMsQ0FBQztZQUVoRCxVQUFVLENBQUMsR0FBUyxFQUFFO2dCQUNsQixJQUFJLHlCQUF5QixHQUFlLEdBQUcsRUFBRSxHQUFHLE1BQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBQ2hGLE1BQU0sa0JBQWtCLEdBQUcsSUFBSSxPQUFPLENBQUMsQ0FBQyxPQUFPLEVBQUUsRUFBRSxHQUFHLHlCQUF5QixHQUFHLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO2dCQUU5RixJQUFJLHFCQUFxQixHQUF3QyxHQUFHLEVBQUUsR0FBRyxNQUFNLENBQUMsS0FBSyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO2dCQUNyRyxNQUFNLGNBQWMsR0FBRyxJQUFJLE9BQU8sQ0FBQyxDQUFDLE9BQU8sRUFBRSxFQUFFLEdBQUcscUJBQXFCLEdBQUcsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBRXRGLE9BQU8sQ0FBQyxJQUFJLENBQUMscUJBQXFCLENBQUM7b0JBQy9CLEdBQUcsRUFBRSxFQUFFO29CQUNQLFFBQVEsRUFBRSxJQUFJLENBQUMsU0FBUyxDQUFDLHFCQUFxQixDQUFDO29CQUMvQyxZQUFZLEVBQUUsR0FBRztvQkFDakIsT0FBTyxFQUFFLEVBQUU7aUJBQ2QsQ0FBQyxDQUFDLHNCQUFzQixDQUNyQixHQUFHLEVBQUUsR0FBRyx5QkFBeUIsRUFBRSxDQUFDLENBQUMsT0FBTyxjQUFjLENBQUMsQ0FBQyxDQUFDLENBQ2hFLENBQUMscUJBQXFCLENBQUM7b0JBQ3BCLEdBQUcsRUFBRSxFQUFFO29CQUNQLFFBQVEsRUFBRSxJQUFJLENBQUMsU0FBUyxDQUFDLG9CQUFvQixDQUFDO29CQUM5QyxZQUFZLEVBQUUsR0FBRztvQkFDakIsT0FBTyxFQUFFLEVBQUU7aUJBQ2QsQ0FBQyxDQUFDLHFCQUFxQixDQUFDO29CQUNyQixHQUFHLEVBQUUsRUFBRTtvQkFDUCxRQUFRLEVBQUUsSUFBSSxDQUFDLFNBQVMsQ0FBQyxvQkFBb0IsQ0FBQztvQkFDOUMsWUFBWSxFQUFFLEdBQUc7b0JBQ2pCLE9BQU8sRUFBRSxFQUFFO2lCQUNkLENBQUMsQ0FBQztnQkFFSCxTQUFTLENBQUMsYUFBYSxDQUFDLGVBQWUsQ0FBQztvQkFDcEMsS0FBSyxFQUFFLFNBQVMsQ0FBQyxPQUFPLENBQUM7b0JBQ3pCLGFBQWEsRUFBRSxTQUFTLENBQUMsZUFBZSxDQUFDO2lCQUM1QyxDQUFDLENBQUM7Z0JBRUgsU0FBUyxDQUFDLFlBQVksQ0FBQyxrQkFBa0IsQ0FBQyxTQUFTLENBQUMsQ0FBQztnQkFFckQseUJBQXlCLENBQUMsU0FBUyxDQUFDLGVBQWUsQ0FBQyxJQUFJLG1CQUFtQixDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7Z0JBRW5GLE1BQU0sZ0JBQWdCLENBQUMsY0FBYyxFQUFFLENBQUM7Z0JBQ3hDLE1BQU0sSUFBSSxHQUFHLGdCQUFnQixDQUFDLFdBQVcsQ0FBQyxPQUFPLENBQUMsQ0FBQztnQkFFbkQsTUFBTSxrQkFBa0IsQ0FBQztnQkFFekIsTUFBTSxNQUFNLEdBQUcsZ0JBQWdCLENBQUMsYUFBYSxDQUFDLENBQUMsZUFBZSxFQUFFLE9BQU8sQ0FBQyxDQUFDLENBQUM7Z0JBRTFFLE1BQU0sTUFBTSxDQUFDO2dCQUViLHFCQUFxQixDQUFDO29CQUNsQixHQUFHLEVBQUUsRUFBRTtvQkFDUCxRQUFRLEVBQUUsSUFBSTtvQkFDZCxZQUFZLEVBQUUsR0FBRztvQkFDakIsT0FBTyxFQUFFLEVBQUU7aUJBQ2QsQ0FBQyxDQUFDO2dCQUVILGNBQWMsR0FBRyxNQUFNLElBQUksQ0FBQztZQUNoQyxDQUFDLENBQUEsQ0FBQyxDQUFDO1lBRUgsRUFBRSxDQUFDLG9CQUFvQixFQUFFLEdBQUcsRUFBRTtnQkFDMUIsTUFBTSxDQUFDLGNBQWMsQ0FBQyxDQUFDLFdBQVcsRUFBRSxDQUFDO1lBQ3pDLENBQUMsQ0FBQyxDQUFDO1lBRUgsRUFBRSxDQUFDLDhCQUE4QixFQUFFLEdBQUcsRUFBRTtnQkFDcEMsTUFBTSxDQUFDLGNBQWUsQ0FBQyxRQUFRLENBQUMsS0FBSyxFQUFFLENBQUMsQ0FBQyxPQUFPLENBQUMsV0FBVyxDQUFDLENBQUM7WUFDbEUsQ0FBQyxDQUFDLENBQUM7WUFFSCxFQUFFLENBQUMsaUNBQWlDLEVBQUUsR0FBRyxFQUFFO2dCQUN2QyxNQUFNLENBQUMsY0FBZSxDQUFDLFFBQVEsQ0FBQyxVQUFVLEVBQUUsQ0FBQyxDQUFDLFdBQVcsRUFBRSxDQUFDO2dCQUM1RCxNQUFNLENBQUMsY0FBZSxDQUFDLFFBQVEsQ0FBQyxVQUFVLEVBQUUsQ0FBQyxLQUFLLEVBQUUsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxzQ0FBc0MsQ0FBQyxDQUFDO2dCQUN0RyxNQUFNLENBQUMsY0FBZSxDQUFDLFFBQVEsQ0FBQyxVQUFVLEVBQUUsQ0FBQyxLQUFLLEVBQUUsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxzQ0FBc0MsQ0FBQyxDQUFDO1lBQzFHLENBQUMsQ0FBQyxDQUFDO1FBQ1AsQ0FBQyxDQUFDLENBQUM7SUFDUCxDQUFDLENBQUMsQ0FBQztBQUNQLENBQUMsQ0FBQyxDQUFDIn0=