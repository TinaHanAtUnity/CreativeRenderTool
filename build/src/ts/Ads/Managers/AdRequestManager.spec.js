import * as tslib_1 from "tslib";
import { Platform } from 'Core/Constants/Platform';
import { AdRequestManager, LoadV5ExperimentType } from 'Ads/Managers/AdRequestManager';
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
const LoadV5LoadResponse = require('json/LoadV5LoadResponse.json');
// eslint-disable-next-line
const LoadV5LoadResponse_2 = require('json/LoadV5LoadResponse_2.json');
// eslint-disable-next-line
const LoadV5LoadResponseWithAdditionalPlacements = require('json/LoadV5LoadResponseWithAdditionalPlacements.json');
// eslint-disable-next-line
const LoadV5LoadResponse_NoFill = require('json/LoadV5LoadResponse_NoFill.json');
// eslint-disable-next-line
const LoadV5LoadResponse_FrequencyCapping = require('json/LoadV5LoadResponse_FrequencyCapping.json');
// eslint-disable-next-line
const LoadV5ReloadResponse = require('json/LoadV5ReloadResponse.json');
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
            adRequestManager = new AdRequestManager(platform, core, coreConfig, adsConfig, assetManager, sessionManager, adMobSignalFactory, request, clientInfo, deviceInfo, metaDataManager, cacheBookkeeping, contentTypeHandlerManager, privacySDK, userPrivacyManager, LoadV5ExperimentType.None);
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
                        'https://tracking.stg.mz.internal.unity3d.com/operative/%ZONE%?eventType=skip&test=0&5be40c5f602f4510ec583881'
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
                        'https://tracking.stg.mz.internal.unity3d.com/operative/%ZONE%?eventType=skip&test=0&load_v5_2_rewardedVideo'
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
                        'https://tracking.stg.mz.internal.unity3d.com/operative/%ZONE%?eventType=skip&test=0&reload_v5_rewardedVideo'
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQWRSZXF1ZXN0TWFuYWdlci5zcGVjLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vc3JjL3RzL0Fkcy9NYW5hZ2Vycy9BZFJlcXVlc3RNYW5hZ2VyLnNwZWMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBLE9BQU8sRUFBRSxRQUFRLEVBQUUsTUFBTSx5QkFBeUIsQ0FBQztBQUNuRCxPQUFPLEVBQUUsZ0JBQWdCLEVBQTRCLG9CQUFvQixFQUFFLE1BQU0sK0JBQStCLENBQUM7QUFDakgsT0FBTyxFQUFFLElBQUksRUFBRSxNQUFNLHFCQUFxQixDQUFDO0FBRTNDLE9BQU8sRUFBeUIsaUJBQWlCLEVBQUUsTUFBTSx5Q0FBeUMsQ0FBQztBQUNuRyxPQUFPLEVBQXdCLGdCQUFnQixFQUFFLE1BQU0sdUNBQXVDLENBQUM7QUFDL0YsT0FBTyxFQUFvQixZQUFZLEVBQUUsTUFBTSxxQ0FBcUMsQ0FBQztBQUNyRixPQUFPLEVBQXNCLGNBQWMsRUFBRSxNQUFNLHVDQUF1QyxDQUFDO0FBQzNGLE9BQU8sRUFBMEIsa0JBQWtCLEVBQUUsTUFBTSw4Q0FBOEMsQ0FBQztBQUMxRyxPQUFPLEVBQXNCLGNBQWMsRUFBRSxNQUFNLHdDQUF3QyxDQUFDO0FBQzVGLE9BQU8sRUFBa0IsVUFBVSxFQUFFLE1BQU0sa0NBQWtDLENBQUM7QUFDOUUsT0FBTyxFQUFrQixVQUFVLEVBQUUsTUFBTSxrQ0FBa0MsQ0FBQztBQUM5RSxPQUFPLEVBQXVCLGVBQWUsRUFBRSxNQUFNLHlDQUF5QyxDQUFDO0FBQy9GLE9BQU8sRUFBK0IsdUJBQXVCLEVBQUUsTUFBTSxpREFBaUQsQ0FBQztBQUN2SCxPQUFPLEVBQWlDLHlCQUF5QixFQUFFLE1BQU0sa0RBQWtELENBQUM7QUFDNUgsT0FBTyxFQUFrQixVQUFVLEVBQUUsTUFBTSw4QkFBOEIsQ0FBQztBQUMxRSxPQUFPLEVBQTBCLGtCQUFrQixFQUFFLE1BQU0sMkNBQTJDLENBQUM7QUFDdkcsT0FBTyxFQUFFLG1CQUFtQixFQUFFLE1BQU0sbUNBQW1DLENBQUM7QUFFeEUsT0FBTyxFQUFFLFNBQVMsRUFBaUIsV0FBVyxFQUFFLE1BQU0sZ0NBQWdDLENBQUM7QUFDdkYsT0FBTyxFQUFFLG1CQUFtQixFQUFFLE1BQU0seUNBQXlDLENBQUM7QUFHOUUsT0FBTyxFQUFFLFVBQVUsRUFBRSxNQUFNLEVBQUUsTUFBTSwwQkFBMEIsQ0FBQztBQUc5RCwyQkFBMkI7QUFDM0IsTUFBTSxxQkFBcUIsR0FBRyxPQUFPLENBQUMsaUNBQWlDLENBQUMsQ0FBQztBQUN6RSwyQkFBMkI7QUFDM0IsTUFBTSw2QkFBNkIsR0FBRyxPQUFPLENBQUMseUNBQXlDLENBQUMsQ0FBQztBQUN6RiwyQkFBMkI7QUFDM0IsTUFBTSw0QkFBNEIsR0FBRyxPQUFPLENBQUMsd0NBQXdDLENBQUMsQ0FBQztBQUN2RiwyQkFBMkI7QUFDM0IsTUFBTSxrQkFBa0IsR0FBRyxPQUFPLENBQUMsOEJBQThCLENBQUMsQ0FBQztBQUNuRSwyQkFBMkI7QUFDM0IsTUFBTSxvQkFBb0IsR0FBRyxPQUFPLENBQUMsZ0NBQWdDLENBQUMsQ0FBQztBQUN2RSwyQkFBMkI7QUFDM0IsTUFBTSwwQ0FBMEMsR0FBRyxPQUFPLENBQUMsc0RBQXNELENBQUMsQ0FBQztBQUNuSCwyQkFBMkI7QUFDM0IsTUFBTSx5QkFBeUIsR0FBRyxPQUFPLENBQUMscUNBQXFDLENBQUMsQ0FBQztBQUNqRiwyQkFBMkI7QUFDM0IsTUFBTSxtQ0FBbUMsR0FBRyxPQUFPLENBQUMsK0NBQStDLENBQUMsQ0FBQztBQUNyRywyQkFBMkI7QUFDM0IsTUFBTSxvQkFBb0IsR0FBRyxPQUFPLENBQUMsZ0NBQWdDLENBQUMsQ0FBQztBQUV2RSxNQUFNLGdCQUFnQjtJQUdsQixZQUFZLE1BQWM7UUFDdEIsSUFBSSxDQUFDLE1BQU0sR0FBRyxNQUFNLENBQUM7SUFDekIsQ0FBQztJQUVNLGVBQWUsQ0FBQyxLQUFhO1FBQ2hDLE1BQU0sQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsYUFBYSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQztRQUNyRCxPQUFPLElBQUksQ0FBQztJQUNoQixDQUFDO0NBQ0o7QUFFRCxDQUFDLFFBQVEsQ0FBQyxPQUFPLEVBQUUsUUFBUSxDQUFDLEdBQUcsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDLFFBQVEsRUFBRSxFQUFFO0lBQ2xELFFBQVEsQ0FBQyx3QkFBd0IsUUFBUSxDQUFDLFFBQVEsQ0FBQyxHQUFHLEVBQUUsR0FBRyxFQUFFO1FBQ3pELElBQUksZ0JBQWtDLENBQUM7UUFDdkMsSUFBSSxJQUFXLENBQUM7UUFDaEIsSUFBSSxVQUFpQyxDQUFDO1FBQ3RDLElBQUksU0FBK0IsQ0FBQztRQUNwQyxJQUFJLFlBQThCLENBQUM7UUFDbkMsSUFBSSxjQUFrQyxDQUFDO1FBQ3ZDLElBQUksa0JBQTBDLENBQUM7UUFDL0MsSUFBSSxPQUEyQixDQUFDO1FBQ2hDLElBQUksVUFBMEIsQ0FBQztRQUMvQixJQUFJLFVBQTBCLENBQUM7UUFDL0IsSUFBSSxlQUFvQyxDQUFDO1FBQ3pDLElBQUksZ0JBQTZDLENBQUM7UUFDbEQsSUFBSSx5QkFBd0QsQ0FBQztRQUM3RCxJQUFJLFVBQTBCLENBQUM7UUFDL0IsSUFBSSxrQkFBMEMsQ0FBQztRQUUvQyxVQUFVLENBQUMsR0FBRyxFQUFFO1lBQ1osbUJBQW1CLENBQUMsSUFBSSxFQUFFLENBQUM7WUFFM0IsSUFBSSxHQUFHLElBQUksRUFBRSxDQUFDO1lBQ2QsVUFBVSxHQUFHLGlCQUFpQixFQUFFLENBQUM7WUFDakMsU0FBUyxHQUFHLGdCQUFnQixFQUFFLENBQUM7WUFDL0IsWUFBWSxHQUFHLFlBQVksRUFBRSxDQUFDO1lBQzlCLGNBQWMsR0FBRyxjQUFjLEVBQUUsQ0FBQztZQUNsQyxrQkFBa0IsR0FBRyxrQkFBa0IsRUFBRSxDQUFDO1lBQzFDLE9BQU8sR0FBRyxjQUFjLEVBQUUsQ0FBQztZQUMzQixVQUFVLEdBQUcsVUFBVSxFQUFFLENBQUM7WUFDMUIsVUFBVSxHQUFHLFVBQVUsRUFBRSxDQUFDO1lBQzFCLGVBQWUsR0FBRyxlQUFlLEVBQUUsQ0FBQztZQUNwQyxnQkFBZ0IsR0FBRyx1QkFBdUIsRUFBRSxDQUFDO1lBQzdDLHlCQUF5QixHQUFHLHlCQUF5QixFQUFFLENBQUM7WUFDeEQsVUFBVSxHQUFHLFVBQVUsRUFBRSxDQUFDO1lBQzFCLGtCQUFrQixHQUFHLGtCQUFrQixFQUFFLENBQUM7WUFDMUMsZ0JBQWdCLEdBQUcsSUFBSSxnQkFBZ0IsQ0FBQyxRQUFRLEVBQUUsSUFBSSxFQUFFLFVBQVUsRUFBRSxTQUFTLEVBQUUsWUFBWSxFQUFFLGNBQWMsRUFBRSxrQkFBa0IsRUFBRSxPQUFPLEVBQUUsVUFBVSxFQUFFLFVBQVUsRUFBRSxlQUFlLEVBQUUsZ0JBQWdCLEVBQUUseUJBQXlCLEVBQUUsVUFBVSxFQUFFLGtCQUFrQixFQUFFLG9CQUFvQixDQUFDLElBQUksQ0FBQyxDQUFDO1FBQy9SLENBQUMsQ0FBQyxDQUFDO1FBRUgsUUFBUSxDQUFDLGVBQWUsRUFBRSxHQUFHLEVBQUU7WUFDM0IsRUFBRSxDQUFDLDJCQUEyQixFQUFFLEdBQUcsRUFBRTtnQkFDakMsTUFBTSxDQUFDLGdCQUFnQixDQUFDLG9CQUFvQixFQUFFLENBQUMsQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLENBQUM7WUFDbkUsQ0FBQyxDQUFDLENBQUM7WUFFSCxFQUFFLENBQUMsZ0NBQWdDLEVBQUUsR0FBRyxFQUFFO2dCQUN0QyxNQUFNLENBQUMsZ0JBQWdCLENBQUMsc0JBQXNCLEVBQUUsQ0FBQyxDQUFDLGFBQWEsRUFBRSxDQUFDO1lBQ3RFLENBQUMsQ0FBQyxDQUFDO1FBQ1AsQ0FBQyxDQUFDLENBQUM7UUFFSCxRQUFRLENBQUMsNEJBQTRCLEVBQUUsR0FBRyxFQUFFO1lBQ3hDLFVBQVUsQ0FBQyxHQUFTLEVBQUU7Z0JBQ2xCLFNBQVMsQ0FBQyxhQUFhLENBQUMsZUFBZSxDQUFDO29CQUNwQyxLQUFLLEVBQUUsU0FBUyxFQUFFO29CQUNsQixhQUFhLEVBQUUsU0FBUyxFQUFFO2lCQUM3QixDQUFDLENBQUM7Z0JBQ0gsT0FBTyxDQUFDLElBQUksQ0FBQyxxQkFBcUIsQ0FBQztvQkFDL0IsR0FBRyxFQUFFLEVBQUU7b0JBQ1AsUUFBUSxFQUFFLElBQUksQ0FBQyxTQUFTLENBQUMscUJBQXFCLENBQUM7b0JBQy9DLFlBQVksRUFBRSxHQUFHO29CQUNqQixPQUFPLEVBQUUsRUFBRTtpQkFDZCxDQUFDLENBQUM7Z0JBQ0gsTUFBTSxnQkFBZ0IsQ0FBQyxjQUFjLEVBQUUsQ0FBQztZQUM1QyxDQUFDLENBQUEsQ0FBQyxDQUFDO1lBRUgsRUFBRSxDQUFDLDZCQUE2QixFQUFFLEdBQUcsRUFBRTtnQkFDbkMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQyxxQkFBcUIsQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFDOUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQyx3QkFBd0IsQ0FBQyxNQUFNLENBQUMsUUFBUSxFQUFFLEVBQUUsSUFBSSxnQkFBZ0IsQ0FBQztvQkFDbEYsYUFBYSxFQUFFLElBQUk7b0JBQ25CLGFBQWEsRUFBRSxJQUFJO29CQUNuQixPQUFPLEVBQUUsSUFBSTtvQkFDYixJQUFJLEVBQUUsS0FBSztvQkFDWCxpQkFBaUIsRUFBRTt3QkFDZixLQUFLLEVBQUU7NEJBQ0gsT0FBTyxFQUFFLENBQUMsT0FBTyxDQUFDOzRCQUNsQixTQUFTLEVBQUUsS0FBSzs0QkFDaEIsV0FBVyxFQUFFLEtBQUs7eUJBQ3JCO3dCQUNELGFBQWEsRUFBRTs0QkFDWCxPQUFPLEVBQUUsQ0FBQyxPQUFPLENBQUM7NEJBQ2xCLFNBQVMsRUFBRSxLQUFLOzRCQUNoQixXQUFXLEVBQUUsS0FBSzt5QkFDckI7cUJBQ0o7b0JBQ0QsVUFBVSxFQUFFLEVBQUU7b0JBQ2QsV0FBVyxFQUFFLEVBQUU7aUJBQ2xCLENBQUMsRUFBRSxFQUFFLEVBQUU7b0JBQ0osZUFBZSxFQUFFLEtBQUs7b0JBQ3RCLE9BQU8sRUFBRSxDQUFDO29CQUNWLFVBQVUsRUFBRSxDQUFDO29CQUNiLHlCQUF5QixFQUFFLEtBQUs7b0JBQ2hDLE9BQU8sRUFBRSxJQUFJO2lCQUNoQixDQUFDLENBQUM7WUFDUCxDQUFDLENBQUMsQ0FBQztZQUVILEVBQUUsQ0FBQyx1REFBdUQsRUFBRSxHQUFHLEVBQUU7Z0JBQzdELE1BQU0sQ0FBQyxtQkFBbUIsQ0FBQyxrQkFBa0IsRUFBRSxDQUFDLENBQUMsT0FBTyxDQUFDO29CQUNyRCxVQUFVLEVBQUUsQ0FBQztvQkFDYixNQUFNLEVBQUUsQ0FBQztvQkFDVCxLQUFLLEVBQUUsQ0FBQztvQkFDUixlQUFlLEVBQUUsRUFBRztvQkFDcEIsY0FBYyxFQUFFLEVBQUc7b0JBQ25CLGtCQUFrQixFQUFFLEVBQUc7aUJBQzFCLENBQUMsQ0FBQztZQUNQLENBQUMsQ0FBQyxDQUFDO1lBRUgsRUFBRSxDQUFDLDJCQUEyQixFQUFFLEdBQUcsRUFBRTtnQkFDakMsTUFBTSxDQUFDLGdCQUFnQixDQUFDLG9CQUFvQixFQUFFLENBQUMsQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLENBQUM7WUFDbkUsQ0FBQyxDQUFDLENBQUM7WUFFSCxFQUFFLENBQUMsZ0NBQWdDLEVBQUUsR0FBRyxFQUFFO2dCQUN0QyxNQUFNLENBQUMsZ0JBQWdCLENBQUMsc0JBQXNCLEVBQUUsQ0FBQyxDQUFDLGFBQWEsRUFBRSxDQUFDO1lBQ3RFLENBQUMsQ0FBQyxDQUFDO1FBQ1AsQ0FBQyxDQUFDLENBQUM7UUFFSCxRQUFRLENBQUMscUJBQXFCLEVBQUUsR0FBRyxFQUFFO1lBQ2pDLFVBQVUsQ0FBQyxHQUFTLEVBQUU7Z0JBQ2xCLFNBQVMsQ0FBQyxhQUFhLENBQUMsZUFBZSxDQUFDO29CQUNwQyxLQUFLLEVBQUUsU0FBUyxFQUFFO29CQUNsQixhQUFhLEVBQUUsU0FBUyxFQUFFO2lCQUM3QixDQUFDLENBQUM7Z0JBQ0gsSUFBSSxxQkFBcUIsR0FBd0MsR0FBRyxFQUFFLEdBQUcsTUFBTSxDQUFDLEtBQUssQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFDckcsTUFBTSxjQUFjLEdBQUcsSUFBSSxPQUFPLENBQUMsQ0FBQyxPQUFPLEVBQUUsRUFBRSxHQUFHLHFCQUFxQixHQUFHLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO2dCQUV0RixPQUFPLENBQUMsSUFBSSxDQUFDLHNCQUFzQixDQUMvQixHQUFHLEVBQUUsQ0FBQyxjQUFjLENBQ3ZCLENBQUM7Z0JBRUYsZ0JBQWdCLENBQUMsY0FBYyxFQUFFLENBQUM7Z0JBQ2xDLE1BQU0sT0FBTyxHQUFHLGdCQUFnQixDQUFDLGNBQWMsRUFBRSxDQUFDO2dCQUVsRCxxQkFBcUIsQ0FBQztvQkFDbEIsR0FBRyxFQUFFLEVBQUU7b0JBQ1AsUUFBUSxFQUFFLElBQUksQ0FBQyxTQUFTLENBQUMscUJBQXFCLENBQUM7b0JBQy9DLFlBQVksRUFBRSxHQUFHO29CQUNqQixPQUFPLEVBQUUsRUFBRTtpQkFDZCxDQUFDLENBQUM7Z0JBRUgsTUFBTSxPQUFPLENBQUM7WUFDbEIsQ0FBQyxDQUFBLENBQUMsQ0FBQztZQUVILEVBQUUsQ0FBQyx1REFBdUQsRUFBRSxHQUFHLEVBQUU7Z0JBQzdELE1BQU0sQ0FBQyxtQkFBbUIsQ0FBQyxrQkFBa0IsRUFBRSxDQUFDLENBQUMsT0FBTyxDQUFDO29CQUNyRCxVQUFVLEVBQUUsQ0FBQztvQkFDYixNQUFNLEVBQUUsQ0FBQztvQkFDVCxLQUFLLEVBQUUsQ0FBQztvQkFDUixlQUFlLEVBQUUsRUFBRztvQkFDcEIsY0FBYyxFQUFFLEVBQUc7b0JBQ25CLGtCQUFrQixFQUFFLEVBQUc7aUJBQzFCLENBQUMsQ0FBQztZQUNQLENBQUMsQ0FBQyxDQUFDO1FBQ1AsQ0FBQyxDQUFDLENBQUM7UUFFSCxRQUFRLENBQUMsd0JBQXdCLEVBQUUsR0FBRyxFQUFFO1lBQ3BDLFVBQVUsQ0FBQyxHQUFTLEVBQUU7Z0JBQ2xCLE9BQU8sQ0FBQyxJQUFJLENBQUMscUJBQXFCLENBQzlCLElBQUksS0FBSyxFQUFFLENBQ2QsQ0FBQztnQkFFRixTQUFTLENBQUMsWUFBWSxDQUFDLGtCQUFrQixDQUFDLFNBQVMsQ0FBQyxDQUFDO2dCQUVyRCx5QkFBeUIsQ0FBQyxTQUFTLENBQUMsZUFBZSxDQUFDLElBQUksbUJBQW1CLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQztnQkFFbkYsSUFBSTtvQkFDQSxNQUFNLGdCQUFnQixDQUFDLGNBQWMsRUFBRSxDQUFDO2lCQUMzQztnQkFBQyxPQUFPLEdBQUcsRUFBRTtvQkFDVixRQUFRO2lCQUNYO1lBQ0wsQ0FBQyxDQUFBLENBQUMsQ0FBQztZQUVILEVBQUUsQ0FBQyx3Q0FBd0MsRUFBRSxHQUFHLEVBQUU7Z0JBQzlDLE1BQU0sQ0FBQyxnQkFBZ0IsQ0FBQyxnQkFBZ0IsRUFBRSxDQUFDLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDO1lBQzlELENBQUMsQ0FBQyxDQUFDO1FBQ1AsQ0FBQyxDQUFDLENBQUM7UUFFSCxRQUFRLENBQUMseUJBQXlCLEVBQUUsR0FBRyxFQUFFO1lBQ3JDLElBQUksZUFBNEMsQ0FBQztZQUNqRCxJQUFJLGVBQTRDLENBQUM7WUFFakQsVUFBVSxDQUFDLEdBQVMsRUFBRTtnQkFDbEIsT0FBTyxDQUFDLElBQUksQ0FBQyxxQkFBcUIsQ0FBQztvQkFDL0IsR0FBRyxFQUFFLEVBQUU7b0JBQ1AsUUFBUSxFQUFFLElBQUksQ0FBQyxTQUFTLENBQUMscUJBQXFCLENBQUM7b0JBQy9DLFlBQVksRUFBRSxHQUFHO29CQUNqQixPQUFPLEVBQUUsRUFBRTtpQkFDZCxDQUFDLENBQUMscUJBQXFCLENBQUM7b0JBQ3JCLEdBQUcsRUFBRSxFQUFFO29CQUNQLFFBQVEsRUFBRSxJQUFJLENBQUMsU0FBUyxDQUFDLGtCQUFrQixDQUFDO29CQUM1QyxZQUFZLEVBQUUsR0FBRztvQkFDakIsT0FBTyxFQUFFLEVBQUU7aUJBQ2QsQ0FBQyxDQUFDLHFCQUFxQixDQUFDO29CQUNyQixHQUFHLEVBQUUsRUFBRTtvQkFDUCxRQUFRLEVBQUUsSUFBSSxDQUFDLFNBQVMsQ0FBQyxvQkFBb0IsQ0FBQztvQkFDOUMsWUFBWSxFQUFFLEdBQUc7b0JBQ2pCLE9BQU8sRUFBRSxFQUFFO2lCQUNkLENBQUMsQ0FBQztnQkFFSCxTQUFTLENBQUMsWUFBWSxDQUFDLGtCQUFrQixDQUFDLFNBQVMsQ0FBQyxDQUFDO2dCQUVyRCx5QkFBeUIsQ0FBQyxTQUFTLENBQUMsZUFBZSxDQUFDLElBQUksbUJBQW1CLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQztnQkFFbkYsTUFBTSxnQkFBZ0IsQ0FBQyxjQUFjLEVBQUUsQ0FBQztnQkFDeEMsZUFBZSxHQUFHLE1BQU0sZ0JBQWdCLENBQUMsV0FBVyxDQUFDLE9BQU8sQ0FBQyxDQUFDO2dCQUM5RCxlQUFlLEdBQUcsTUFBTSxnQkFBZ0IsQ0FBQyxXQUFXLENBQUMsZUFBZSxDQUFDLENBQUM7WUFDMUUsQ0FBQyxDQUFBLENBQUMsQ0FBQztZQUVILEVBQUUsQ0FBQyx5QkFBeUIsRUFBRSxHQUFHLEVBQUU7Z0JBQy9CLE1BQU0sQ0FBQyxVQUFVLENBQUMseUJBQXlCLENBQUMsQ0FBQyxjQUFjLENBQUMsTUFBTSxDQUFDLGVBQWUsRUFBRSxNQUFNLENBQUMsUUFBUSxFQUFFLENBQUMsQ0FBQztZQUMzRyxDQUFDLENBQUMsQ0FBQztZQUVILEVBQUUsQ0FBQywyREFBMkQsRUFBRSxHQUFHLEVBQUU7Z0JBQ2pFLE1BQU0sQ0FBQyxtQkFBbUIsQ0FBQyxrQkFBa0IsRUFBRSxDQUFDLENBQUMsT0FBTyxDQUFDO29CQUNyRCxVQUFVLEVBQUUsQ0FBQztvQkFDYixNQUFNLEVBQUUsQ0FBQztvQkFDVCxLQUFLLEVBQUUsQ0FBQztvQkFDUixlQUFlLEVBQUUsRUFBRztvQkFDcEIsY0FBYyxFQUFFLEVBQUc7b0JBQ25CLGtCQUFrQixFQUFFLEVBQUc7aUJBQzFCLENBQUMsQ0FBQztZQUNQLENBQUMsQ0FBQyxDQUFDO1lBRUgsRUFBRSxDQUFDLG9CQUFvQixFQUFFLEdBQUcsRUFBRTtnQkFDMUIsTUFBTSxDQUFDLGVBQWUsQ0FBQyxDQUFDLFdBQVcsRUFBRSxDQUFDO2dCQUN0QyxNQUFNLENBQUMsZUFBZSxDQUFDLENBQUMsV0FBVyxFQUFFLENBQUM7WUFDMUMsQ0FBQyxDQUFDLENBQUM7WUFFSCxFQUFFLENBQUMsMENBQTBDLEVBQUUsR0FBRyxFQUFFO2dCQUNoRCxNQUFNLENBQUMsZUFBZ0IsQ0FBQyxRQUFRLENBQUMsYUFBYSxFQUFFLENBQUMsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUM7Z0JBQ2hFLE1BQU0sQ0FBQyxlQUFnQixDQUFDLFFBQVEsQ0FBQyxhQUFhLEVBQUUsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUNwRSxDQUFDLENBQUMsQ0FBQztZQUVILEVBQUUsQ0FBQyx3Q0FBd0MsRUFBRSxHQUFHLEVBQUU7Z0JBQzlDLE1BQU0sQ0FBQyxlQUFnQixDQUFDLFFBQVEsQ0FBQyxLQUFLLEVBQUUsQ0FBQyxDQUFDLE9BQU8sQ0FBQywwQkFBMEIsQ0FBQyxDQUFDO1lBQ2xGLENBQUMsQ0FBQyxDQUFDO1lBRUgsRUFBRSxDQUFDLHFEQUFxRCxFQUFFLEdBQUcsRUFBRTtnQkFDM0QsTUFBTSxDQUFDLGVBQWdCLENBQUMsWUFBWSxDQUFDLENBQUMsT0FBTyxDQUFDO29CQUMxQyxLQUFLLEVBQUU7d0JBQ0gsK0dBQStHO3FCQUNsSDtvQkFDRCxRQUFRLEVBQUU7d0JBQ04sa0hBQWtIO3FCQUNySDtvQkFDRCxLQUFLLEVBQUU7d0JBQ0gsK0dBQStHO3FCQUNsSDtvQkFDRCxhQUFhLEVBQUU7d0JBQ1gsdUhBQXVIO3FCQUMxSDtvQkFDRCxNQUFNLEVBQUU7d0JBQ0osZ0hBQWdIO3FCQUNuSDtvQkFDRCxRQUFRLEVBQUU7d0JBQ04sa0hBQWtIO3FCQUNySDtvQkFDRCxJQUFJLEVBQUU7d0JBQ0YsOEdBQThHO3FCQUNqSDtvQkFDRCxJQUFJLEVBQUU7d0JBQ0YsOEdBQThHO3FCQUNqSDtvQkFDRCxPQUFPLEVBQUU7d0JBQ0wsaUhBQWlIO3FCQUNwSDtvQkFDRCxLQUFLLEVBQUU7d0JBQ0gsZ0hBQWdIO3dCQUNoSCwrR0FBK0c7cUJBQ2xIO29CQUNELGFBQWEsRUFBRTt3QkFDWCx1SEFBdUg7cUJBQzFIO29CQUNELGlCQUFpQixFQUFFO3dCQUNmLDJIQUEySDtxQkFDOUg7aUJBQ0osQ0FBQyxDQUFDO1lBQ1AsQ0FBQyxDQUFDLENBQUM7WUFFSCxFQUFFLENBQUMsd0NBQXdDLEVBQUUsR0FBRyxFQUFFO2dCQUM5QyxNQUFNLENBQUMsZUFBZ0IsQ0FBQyxRQUFRLENBQUMsS0FBSyxFQUFFLENBQUMsQ0FBQyxPQUFPLENBQUMsV0FBVyxDQUFDLENBQUM7WUFDbkUsQ0FBQyxDQUFDLENBQUM7WUFFSCxFQUFFLENBQUMscURBQXFELEVBQUUsR0FBRyxFQUFFO2dCQUMzRCxNQUFNLENBQUMsZUFBZ0IsQ0FBQyxZQUFZLENBQUMsQ0FBQyxPQUFPLENBQUM7b0JBQzFDLEtBQUssRUFBRTt3QkFDSCw4R0FBOEc7cUJBQ2pIO29CQUNELFFBQVEsRUFBRTt3QkFDTixpSEFBaUg7cUJBQ3BIO29CQUNELEtBQUssRUFBRTt3QkFDSCw4R0FBOEc7cUJBQ2pIO29CQUNELGFBQWEsRUFBRTt3QkFDWCxzSEFBc0g7cUJBQ3pIO29CQUNELE1BQU0sRUFBRTt3QkFDSiwrR0FBK0c7cUJBQ2xIO29CQUNELFFBQVEsRUFBRTt3QkFDTixpSEFBaUg7cUJBQ3BIO29CQUNELElBQUksRUFBRTt3QkFDRiw2R0FBNkc7cUJBQ2hIO29CQUNELElBQUksRUFBRTt3QkFDRiw2R0FBNkc7cUJBQ2hIO29CQUNELE9BQU8sRUFBRTt3QkFDTCxnSEFBZ0g7cUJBQ25IO29CQUNELEtBQUssRUFBRTt3QkFDSCwrR0FBK0c7d0JBQy9HLDhHQUE4RztxQkFDakg7b0JBQ0QsYUFBYSxFQUFFO3dCQUNYLHNIQUFzSDtxQkFDekg7b0JBQ0QsaUJBQWlCLEVBQUU7d0JBQ2YsMEhBQTBIO3FCQUM3SDtpQkFDSixDQUFDLENBQUM7WUFDUCxDQUFDLENBQUMsQ0FBQztZQUVILEVBQUUsQ0FBQywrQ0FBK0MsRUFBRSxHQUFHLEVBQUU7Z0JBQ3JELE1BQU0sQ0FBQyxlQUFnQixDQUFDLFFBQVEsQ0FBQyxVQUFVLEVBQUUsQ0FBQyxDQUFDLFdBQVcsRUFBRSxDQUFDO2dCQUM3RCxNQUFNLENBQUMsZUFBZ0IsQ0FBQyxRQUFRLENBQUMsVUFBVSxFQUFFLENBQUMsS0FBSyxFQUFFLENBQUMsQ0FBQyxPQUFPLENBQUMsc0NBQXNDLENBQUMsQ0FBQztnQkFFdkcsTUFBTSxDQUFDLGVBQWdCLENBQUMsUUFBUSxDQUFDLFVBQVUsRUFBRSxDQUFDLENBQUMsV0FBVyxFQUFFLENBQUM7Z0JBQzdELE1BQU0sQ0FBQyxlQUFnQixDQUFDLFFBQVEsQ0FBQyxVQUFVLEVBQUUsQ0FBQyxLQUFLLEVBQUUsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxzQ0FBc0MsQ0FBQyxDQUFDO1lBQzNHLENBQUMsQ0FBQyxDQUFDO1lBRUgsRUFBRSxDQUFDLDRDQUE0QyxFQUFFLEdBQUcsRUFBRTtnQkFDbEQsTUFBTSxDQUFDLGVBQWdCLENBQUMsUUFBUSxDQUFDLFVBQVUsRUFBRSxDQUFDLENBQUMsV0FBVyxFQUFFLENBQUM7Z0JBRTdELE1BQU0sQ0FBQyxlQUFnQixDQUFDLFFBQVEsQ0FBQyxVQUFVLEVBQUUsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxlQUFnQixDQUFDLFFBQVEsQ0FBQyxVQUFVLEVBQUUsQ0FBQyxDQUFDO2dCQUMvRixNQUFNLENBQUMsZUFBZ0IsQ0FBQyxRQUFRLENBQUMsVUFBVSxFQUFFLENBQUMsQ0FBQyxhQUFhLENBQUMsZUFBZ0IsQ0FBQyxRQUFRLENBQUMsVUFBVSxFQUFFLENBQUMsQ0FBQztZQUN6RyxDQUFDLENBQUMsQ0FBQztZQUVILEVBQUUsQ0FBQyx1Q0FBdUMsRUFBRSxHQUFHLEVBQUU7Z0JBQzdDLE1BQU0sQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUMscUJBQXFCLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBQzlDLE1BQU0sQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUMsdUJBQXVCLENBQUMsQ0FBQyxFQUFFLE1BQU0sQ0FBQyxRQUFRLEVBQUUsRUFBRSxJQUFJLGdCQUFnQixDQUFDO29CQUNwRixhQUFhLEVBQUUsSUFBSTtvQkFDbkIsYUFBYSxFQUFFLElBQUk7b0JBQ25CLE9BQU8sRUFBRSxLQUFLO29CQUNkLElBQUksRUFBRSxJQUFJO29CQUNWLGlCQUFpQixFQUFFLEVBQUU7b0JBQ3JCLFVBQVUsRUFBRTt3QkFDUixLQUFLLEVBQUU7NEJBQ0gsT0FBTyxFQUFFLENBQUMsT0FBTyxDQUFDOzRCQUNsQixTQUFTLEVBQUUsS0FBSzs0QkFDaEIsV0FBVyxFQUFFLEtBQUs7eUJBQ3JCO3FCQUNKO29CQUNELFdBQVcsRUFBRTt3QkFDVCxLQUFLLEVBQUU7NEJBQ0gsaUJBQWlCLEVBQUUsSUFBSTs0QkFDdkIsWUFBWSxFQUFFLElBQUk7NEJBQ2xCLFNBQVMsRUFBRSxHQUFHO3lCQUNqQjtxQkFDSjtvQkFDRCxvQkFBb0IsRUFBRTt3QkFDbEIsQ0FBQyxFQUFFLHFCQUFxQjtxQkFDM0I7aUJBQ0osQ0FBQyxFQUFFLEVBQUUsRUFBRTtvQkFDSixlQUFlLEVBQUUsS0FBSztvQkFDdEIsT0FBTyxFQUFFLENBQUM7b0JBQ1YsVUFBVSxFQUFFLENBQUM7b0JBQ2IseUJBQXlCLEVBQUUsS0FBSztvQkFDaEMsT0FBTyxFQUFFLElBQUk7aUJBQ2hCLENBQUMsQ0FBQztnQkFDSCxNQUFNLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDLHVCQUF1QixDQUFDLENBQUMsRUFBRSxNQUFNLENBQUMsUUFBUSxFQUFFLEVBQUUsSUFBSSxnQkFBZ0IsQ0FBQztvQkFDcEYsT0FBTyxFQUFFLEtBQUs7b0JBQ2QsSUFBSSxFQUFFLElBQUk7b0JBQ1YsaUJBQWlCLEVBQUUsRUFBRTtvQkFDckIsVUFBVSxFQUFFO3dCQUNSLGFBQWEsRUFBRTs0QkFDWCxPQUFPLEVBQUUsQ0FBQyxPQUFPLENBQUM7NEJBQ2xCLFNBQVMsRUFBRSxLQUFLOzRCQUNoQixXQUFXLEVBQUUsS0FBSzt5QkFDckI7cUJBQ0o7b0JBQ0QsV0FBVyxFQUFFO3dCQUNULGFBQWEsRUFBRTs0QkFDWCxpQkFBaUIsRUFBRSxJQUFJOzRCQUN2QixZQUFZLEVBQUUsSUFBSTs0QkFDbEIsU0FBUyxFQUFFLEdBQUc7eUJBQ2pCO3FCQUNKO29CQUNELG9CQUFvQixFQUFFO3dCQUNsQixHQUFHLEVBQUUscUJBQXFCO3FCQUM3QjtpQkFDSixDQUFDLEVBQUUsRUFBRSxFQUFFO29CQUNKLGVBQWUsRUFBRSxLQUFLO29CQUN0QixPQUFPLEVBQUUsQ0FBQztvQkFDVixVQUFVLEVBQUUsQ0FBQztvQkFDYix5QkFBeUIsRUFBRSxLQUFLO29CQUNoQyxPQUFPLEVBQUUsSUFBSTtpQkFDaEIsQ0FBQyxDQUFDO1lBQ1AsQ0FBQyxDQUFDLENBQUM7UUFDUCxDQUFDLENBQUMsQ0FBQztRQUVILFFBQVEsQ0FBQyxvREFBb0QsRUFBRSxHQUFHLEVBQUU7WUFDaEUsSUFBSSxjQUEyQyxDQUFDO1lBQ2hELElBQUksMkJBQXNDLENBQUM7WUFFM0MsVUFBVSxDQUFDLEdBQVMsRUFBRTtnQkFDbEIsT0FBTyxDQUFDLElBQUksQ0FBQyxxQkFBcUIsQ0FBQztvQkFDL0IsR0FBRyxFQUFFLEVBQUU7b0JBQ1AsUUFBUSxFQUFFLElBQUksQ0FBQyxTQUFTLENBQUMscUJBQXFCLENBQUM7b0JBQy9DLFlBQVksRUFBRSxHQUFHO29CQUNqQixPQUFPLEVBQUUsRUFBRTtpQkFDZCxDQUFDLENBQUMscUJBQXFCLENBQUM7b0JBQ3JCLEdBQUcsRUFBRSxFQUFFO29CQUNQLFFBQVEsRUFBRSxJQUFJLENBQUMsU0FBUyxDQUFDLDBDQUEwQyxDQUFDO29CQUNwRSxZQUFZLEVBQUUsR0FBRztvQkFDakIsT0FBTyxFQUFFLEVBQUU7aUJBQ2QsQ0FBQyxDQUFDO2dCQUVILE1BQU0sVUFBVSxHQUFxQztvQkFDakQsT0FBTyxFQUFFLFdBQVcsQ0FBQyxTQUFTLENBQUMsT0FBTyxDQUFDLEVBQUUsZUFBZSxDQUFDO29CQUN6RCxlQUFlLEVBQUUsV0FBVyxDQUFDLFNBQVMsQ0FBQyxlQUFlLENBQUMsRUFBRSxlQUFlLENBQUM7b0JBQ3pFLFFBQVEsRUFBRSxXQUFXLENBQUMsU0FBUyxDQUFDLFFBQVEsQ0FBQyxFQUFFLGVBQWUsQ0FBQztvQkFDM0QsUUFBUSxFQUFFLFdBQVcsQ0FBQyxTQUFTLENBQUMsUUFBUSxDQUFDLEVBQUUsZUFBZSxDQUFDO2lCQUM5RCxDQUFDO2dCQUVGLFNBQVMsQ0FBQyxZQUFZLENBQUMsa0JBQWtCLENBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO2dCQUNoRSxTQUFTLENBQUMsdUJBQXVCLENBQUMsbUJBQW1CLENBQUMsQ0FBQyxVQUFVLENBQUMsS0FBSyxDQUFDLEtBQUssRUFBRSxFQUFFLFVBQVUsQ0FBQyxhQUFhLENBQUMsS0FBSyxFQUFFLEVBQUUsVUFBVSxDQUFDLE1BQU0sQ0FBQyxLQUFLLEVBQUUsRUFBRSxVQUFVLENBQUMsTUFBTSxDQUFDLEtBQUssRUFBRSxDQUFDLENBQUMsQ0FBQztnQkFFMUsseUJBQXlCLENBQUMsU0FBUyxDQUFDLGVBQWUsQ0FBQyxJQUFJLG1CQUFtQixDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7Z0JBRW5GLDJCQUEyQixHQUFHLElBQUksQ0FBQyxFQUFFLEVBQUUsQ0FBQztnQkFDeEMsZ0JBQWdCLENBQUMsMkJBQTJCLENBQUMsU0FBUyxDQUFDLDJCQUEyQixDQUFDLENBQUM7Z0JBRXBGLE1BQU0sZ0JBQWdCLENBQUMsY0FBYyxFQUFFLENBQUM7Z0JBQ3hDLGNBQWMsR0FBRyxNQUFNLGdCQUFnQixDQUFDLG1DQUFtQyxDQUFDLFVBQVUsQ0FBQyxLQUFLLENBQUMsQ0FBQztZQUNsRyxDQUFDLENBQUEsQ0FBQyxDQUFDO1lBRUgsRUFBRSxDQUFDLGtFQUFrRSxFQUFFLEdBQUcsRUFBRTtnQkFDeEUsTUFBTSxDQUFDLFNBQVMsQ0FBQyx1QkFBdUIsQ0FBQyxDQUFDLGNBQWMsQ0FBQyxlQUFlLENBQUMsQ0FBQztZQUM5RSxDQUFDLENBQUMsQ0FBQztZQUVILEVBQUUsQ0FBQyx5QkFBeUIsRUFBRSxHQUFHLEVBQUU7Z0JBQy9CLE1BQU0sQ0FBQyxVQUFVLENBQUMseUJBQXlCLENBQUMsQ0FBQyxjQUFjLENBQUMsTUFBTSxDQUFDLGVBQWUsRUFBRSxNQUFNLENBQUMsUUFBUSxFQUFFLENBQUMsQ0FBQztZQUMzRyxDQUFDLENBQUMsQ0FBQztZQUVILEVBQUUsQ0FBQywyREFBMkQsRUFBRSxHQUFHLEVBQUU7Z0JBQ2pFLE1BQU0sQ0FBQyxtQkFBbUIsQ0FBQyxrQkFBa0IsRUFBRSxDQUFDLENBQUMsT0FBTyxDQUFDO29CQUNyRCxVQUFVLEVBQUUsQ0FBQztvQkFDYixNQUFNLEVBQUUsQ0FBQztvQkFDVCxLQUFLLEVBQUUsQ0FBQztvQkFDUixlQUFlLEVBQUUsRUFBRztvQkFDcEIsY0FBYyxFQUFFLEVBQUc7b0JBQ25CLGtCQUFrQixFQUFFLEVBQUc7aUJBQzFCLENBQUMsQ0FBQztZQUNQLENBQUMsQ0FBQyxDQUFDO1lBRUgsRUFBRSxDQUFDLG9CQUFvQixFQUFFLEdBQUcsRUFBRTtnQkFDMUIsTUFBTSxDQUFDLGNBQWMsQ0FBQyxDQUFDLFdBQVcsRUFBRSxDQUFDO1lBQ3pDLENBQUMsQ0FBQyxDQUFDO1lBRUgsRUFBRSxDQUFDLHVDQUF1QyxFQUFFLEdBQUcsRUFBRTtnQkFDN0MsTUFBTSxDQUFDLGNBQWUsQ0FBQyxRQUFRLENBQUMsS0FBSyxFQUFFLENBQUMsQ0FBQyxPQUFPLENBQUMsMEJBQTBCLENBQUMsQ0FBQztZQUNqRixDQUFDLENBQUMsQ0FBQztZQUVILEVBQUUsQ0FBQywrQ0FBK0MsRUFBRSxHQUFHLEVBQUU7Z0JBQ3JELE1BQU0sQ0FBQyxjQUFlLENBQUMsUUFBUSxDQUFDLFVBQVUsRUFBRSxDQUFDLENBQUMsV0FBVyxFQUFFLENBQUM7Z0JBQzVELE1BQU0sQ0FBQyxjQUFlLENBQUMsUUFBUSxDQUFDLFVBQVUsRUFBRSxDQUFDLEtBQUssRUFBRSxDQUFDLENBQUMsT0FBTyxDQUFDLHNDQUFzQyxDQUFDLENBQUM7WUFDMUcsQ0FBQyxDQUFDLENBQUM7WUFFSCxFQUFFLENBQUMsdUNBQXVDLEVBQUUsR0FBRyxFQUFFO2dCQUM3QyxNQUFNLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDLHFCQUFxQixDQUFDLENBQUMsQ0FBQyxDQUFDO2dCQUM5QyxNQUFNLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDLHVCQUF1QixDQUFDLENBQUMsRUFBRSxNQUFNLENBQUMsUUFBUSxFQUFFLEVBQUUsSUFBSSxnQkFBZ0IsQ0FBQztvQkFDcEYsYUFBYSxFQUFFLElBQUk7b0JBQ25CLGFBQWEsRUFBRSxJQUFJO29CQUNuQixPQUFPLEVBQUUsS0FBSztvQkFDZCxJQUFJLEVBQUUsSUFBSTtvQkFDVixpQkFBaUIsRUFBRSxFQUFFO29CQUNyQixVQUFVLEVBQUU7d0JBQ1IsS0FBSyxFQUFFOzRCQUNILE9BQU8sRUFBRSxDQUFDLE9BQU8sQ0FBQzs0QkFDbEIsU0FBUyxFQUFFLEtBQUs7NEJBQ2hCLFdBQVcsRUFBRSxLQUFLO3lCQUNyQjt3QkFDRCxhQUFhLEVBQUU7NEJBQ1gsT0FBTyxFQUFFLENBQUMsT0FBTyxDQUFDOzRCQUNsQixTQUFTLEVBQUUsS0FBSzs0QkFDaEIsV0FBVyxFQUFFLEtBQUs7eUJBQ3JCO3FCQUNKO29CQUNELFdBQVcsRUFBRTt3QkFDVCxLQUFLLEVBQUU7NEJBQ0gsaUJBQWlCLEVBQUUsSUFBSTs0QkFDdkIsWUFBWSxFQUFFLElBQUk7NEJBQ2xCLFNBQVMsRUFBRSxHQUFHO3lCQUNqQjt3QkFDRCxhQUFhLEVBQUU7NEJBQ1gsaUJBQWlCLEVBQUUsSUFBSTs0QkFDdkIsWUFBWSxFQUFFLElBQUk7NEJBQ2xCLFNBQVMsRUFBRSxHQUFHO3lCQUNqQjtxQkFDSjtvQkFDRCxvQkFBb0IsRUFBRTt3QkFDbEIsQ0FBQyxFQUFFLHFCQUFxQjt3QkFDeEIsQ0FBQyxFQUFFLHFCQUFxQjtxQkFDM0I7aUJBQ0osQ0FBQyxFQUFFLEVBQUUsRUFBRTtvQkFDSixlQUFlLEVBQUUsS0FBSztvQkFDdEIsT0FBTyxFQUFFLENBQUM7b0JBQ1YsVUFBVSxFQUFFLENBQUM7b0JBQ2IseUJBQXlCLEVBQUUsS0FBSztvQkFDaEMsT0FBTyxFQUFFLElBQUk7aUJBQ2hCLENBQUMsQ0FBQztZQUNQLENBQUMsQ0FBQyxDQUFDO1lBRUgsRUFBRSxDQUFDLHdFQUF3RSxFQUFFLEdBQUcsRUFBRTtnQkFDOUUsTUFBTSxDQUFDLDJCQUEyQixDQUFDLENBQUMsZUFBZSxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQzNELENBQUMsQ0FBQyxDQUFDO1lBRUgsRUFBRSxDQUFDLG1EQUFtRCxFQUFFLEdBQUcsRUFBRTtnQkFDekQsTUFBTSxDQUFDLDJCQUEyQixDQUFDLENBQUMsZUFBZSxDQUFDLENBQUMsQ0FBQyxDQUFDO2dCQUN2RCxNQUFNLG1CQUFtQixHQUFpSCwyQkFBMkIsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO2dCQUV2TCxNQUFNLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUMvRCxDQUFDLENBQUMsQ0FBQztZQUVILEVBQUUsQ0FBQyxpRUFBaUUsRUFBRSxHQUFHLEVBQUU7Z0JBQ3ZFLE1BQU0sT0FBTyxHQUFtQiwyQkFBMkIsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO2dCQUU3RSxNQUFNLENBQUMsT0FBTyxDQUFDLENBQUMsT0FBTyxDQUFDLGVBQWUsQ0FBQyxDQUFDO1lBQzdDLENBQUMsQ0FBQyxDQUFDO1lBRUgsRUFBRSxDQUFDLCtDQUErQyxFQUFFLEdBQUcsRUFBRTtnQkFDckQsTUFBTSxtQkFBbUIsR0FBaUgsMkJBQTJCLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFDdkwsTUFBTSxRQUFRLEdBQUcsbUJBQW1CLENBQUMsYUFBYyxDQUFDLGlCQUFpQixDQUFDO2dCQUV0RSxNQUFNLENBQUMsUUFBUSxDQUFDLEtBQUssRUFBRSxDQUFDLENBQUMsT0FBTyxDQUFDLGdCQUFnQixDQUFDLENBQUM7Z0JBRW5ELE1BQU0sQ0FBQyxRQUFRLENBQUMsVUFBVSxFQUFFLENBQUMsQ0FBQyxXQUFXLEVBQUUsQ0FBQztnQkFDNUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxVQUFVLEVBQUUsQ0FBQyxLQUFLLEVBQUUsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxzQ0FBc0MsQ0FBQyxDQUFDO1lBQzFGLENBQUMsQ0FBQyxDQUFDO1lBRUgsRUFBRSxDQUFDLG9DQUFvQyxFQUFFLEdBQUcsRUFBRTtnQkFDMUMsTUFBTSxtQkFBbUIsR0FBaUgsMkJBQTJCLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFDdkwsTUFBTSxRQUFRLEdBQUcsbUJBQW1CLENBQUMsTUFBTyxDQUFDLGlCQUFpQixDQUFDO2dCQUUvRCxNQUFNLENBQUMsUUFBUSxDQUFDLEtBQUssRUFBRSxDQUFDLENBQUMsT0FBTyxDQUFDLGdCQUFnQixDQUFDLENBQUM7Z0JBRW5ELE1BQU0sQ0FBQyxRQUFRLENBQUMsVUFBVSxFQUFFLENBQUMsQ0FBQyxXQUFXLEVBQUUsQ0FBQztnQkFDNUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxVQUFVLEVBQUUsQ0FBQyxLQUFLLEVBQUUsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxzQ0FBc0MsQ0FBQyxDQUFDO1lBQzFGLENBQUMsQ0FBQyxDQUFDO1lBRUgsRUFBRSxDQUFDLGlDQUFpQyxFQUFFLEdBQUcsRUFBRTtnQkFDdkMsTUFBTSxtQkFBbUIsR0FBaUgsMkJBQTJCLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFDdkwsTUFBTSxRQUFRLEdBQUcsbUJBQW1CLENBQUMsTUFBTSxDQUFDO2dCQUU1QyxNQUFNLENBQUMsUUFBUSxDQUFDLENBQUMsYUFBYSxFQUFFLENBQUM7WUFDckMsQ0FBQyxDQUFDLENBQUM7WUFFSCxFQUFFLENBQUMsNERBQTRELEVBQUUsR0FBRyxFQUFFO2dCQUNsRSxNQUFNLG1CQUFtQixHQUFpSCwyQkFBMkIsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO2dCQUV2TCxNQUFNLFNBQVMsR0FBYSxtQkFBbUIsQ0FBQyxhQUFjLENBQUMsaUJBQWlCLENBQUM7Z0JBQ2pGLE1BQU0sU0FBUyxHQUFhLG1CQUFtQixDQUFDLE1BQU8sQ0FBQyxpQkFBaUIsQ0FBQztnQkFFMUUsTUFBTSxDQUFDLFNBQVMsQ0FBQyxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQztZQUN0QyxDQUFDLENBQUMsQ0FBQztZQUVILEVBQUUsQ0FBQyxxQ0FBcUMsRUFBRSxHQUFHLEVBQUU7Z0JBQzNDLE1BQU0sbUJBQW1CLEdBQWlILDJCQUEyQixDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBRXZMLE1BQU0sYUFBYSxHQUEwQixtQkFBbUIsQ0FBQyxhQUFjLENBQUMscUJBQXFCLENBQUM7Z0JBQ3RHLE1BQU0sYUFBYSxHQUEwQixtQkFBbUIsQ0FBQyxNQUFPLENBQUMscUJBQXFCLENBQUM7Z0JBRS9GLE1BQU0sQ0FBQyxhQUFhLENBQUMsQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLGFBQWEsQ0FBQyxDQUFDO1lBQ3JELENBQUMsQ0FBQyxDQUFDO1lBRUgsRUFBRSxDQUFDLHVEQUF1RCxFQUFFLEdBQUcsRUFBRTtnQkFDN0QsTUFBTSxZQUFZLEdBQTBCLGNBQWUsQ0FBQyxZQUFZLENBQUM7Z0JBRXpFLE1BQU0sQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLE9BQU8sQ0FBQyxFQUFFLENBQUMsQ0FBQztnQkFFckQsTUFBTSxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLEVBQUU7b0JBQ3RDLFlBQVksQ0FBQyxLQUFLLENBQUMsQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLEVBQUU7d0JBQzlCLE1BQU0sQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDO29CQUNqRCxDQUFDLENBQUMsQ0FBQztnQkFDUCxDQUFDLENBQUMsQ0FBQztZQUNQLENBQUMsQ0FBQyxDQUFDO1lBRUgsRUFBRSxDQUFDLCtEQUErRCxFQUFFLEdBQUcsRUFBRTtnQkFDckUsTUFBTSxtQkFBbUIsR0FBaUgsMkJBQTJCLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFFdkwsTUFBTSxZQUFZLEdBQTBCLG1CQUFtQixDQUFDLGFBQWMsQ0FBQyxxQkFBcUIsQ0FBQztnQkFFckcsTUFBTSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQyxDQUFDO2dCQUVyRCxNQUFNLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsRUFBRTtvQkFDdEMsWUFBWSxDQUFDLEtBQUssQ0FBQyxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsRUFBRTt3QkFDOUIsTUFBTSxDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUMsZ0JBQWdCLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQztvQkFDekQsQ0FBQyxDQUFDLENBQUM7Z0JBQ1AsQ0FBQyxDQUFDLENBQUM7WUFDUCxDQUFDLENBQUMsQ0FBQztZQUVILEVBQUUsQ0FBQyx3REFBd0QsRUFBRSxHQUFHLEVBQUU7Z0JBQzlELE1BQU0sbUJBQW1CLEdBQWlILDJCQUEyQixDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBRXZMLE1BQU0sWUFBWSxHQUEwQixtQkFBbUIsQ0FBQyxNQUFPLENBQUMscUJBQXFCLENBQUM7Z0JBRTlGLE1BQU0sQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLE9BQU8sQ0FBQyxFQUFFLENBQUMsQ0FBQztnQkFFckQsTUFBTSxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLEVBQUU7b0JBQ3RDLFlBQVksQ0FBQyxLQUFLLENBQUMsQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLEVBQUU7d0JBQzlCLE1BQU0sQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDO29CQUNsRCxDQUFDLENBQUMsQ0FBQztnQkFDUCxDQUFDLENBQUMsQ0FBQztZQUNQLENBQUMsQ0FBQyxDQUFDO1lBRUgsRUFBRSxDQUFDLCtCQUErQixFQUFFLEdBQUcsRUFBRTtnQkFDckMsTUFBTSxDQUFDLFlBQVksQ0FBQyxLQUFLLENBQUMsQ0FBQyxlQUFlLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDbEQsQ0FBQyxDQUFDLENBQUM7WUFFSCxFQUFFLENBQUMsdUNBQXVDLEVBQUUsR0FBRyxFQUFFO2dCQUM3QyxNQUFNLENBQUMsWUFBWSxDQUFDLEtBQUssQ0FBQyxDQUFDLHVCQUF1QixDQUFDLENBQUMsRUFBRSxjQUFlLENBQUMsUUFBUSxDQUFDLENBQUM7WUFDcEYsQ0FBQyxDQUFDLENBQUM7UUFDUCxDQUFDLENBQUMsQ0FBQztRQUVILFFBQVEsQ0FBQywyQ0FBMkMsRUFBRSxHQUFHLEVBQUU7WUFDdkQsSUFBSSxjQUEyQyxDQUFDO1lBRWhELFVBQVUsQ0FBQyxHQUFTLEVBQUU7Z0JBQ2xCLE9BQU8sQ0FBQyxJQUFJLENBQUMscUJBQXFCLENBQUM7b0JBQy9CLEdBQUcsRUFBRSxFQUFFO29CQUNQLFFBQVEsRUFBRSxJQUFJLENBQUMsU0FBUyxDQUFDLHFCQUFxQixDQUFDO29CQUMvQyxZQUFZLEVBQUUsR0FBRztvQkFDakIsT0FBTyxFQUFFLEVBQUU7aUJBQ2QsQ0FBQyxDQUFDLHFCQUFxQixDQUFDO29CQUNyQixHQUFHLEVBQUUsRUFBRTtvQkFDUCxRQUFRLEVBQUUsSUFBSSxDQUFDLFNBQVMsQ0FBQyxrQkFBa0IsQ0FBQztvQkFDNUMsWUFBWSxFQUFFLEdBQUc7b0JBQ2pCLE9BQU8sRUFBRSxFQUFFO2lCQUNkLENBQUMsQ0FBQztnQkFFSCxZQUFZLENBQUMsS0FBSyxDQUFDLGlCQUFpQixDQUFDLElBQUksS0FBSyxFQUFFLENBQUMsQ0FBQztnQkFFbEQsU0FBUyxDQUFDLFlBQVksQ0FBQyxrQkFBa0IsQ0FBQyxTQUFTLENBQUMsQ0FBQztnQkFFckQseUJBQXlCLENBQUMsU0FBUyxDQUFDLGVBQWUsQ0FBQyxJQUFJLG1CQUFtQixDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7Z0JBRW5GLE1BQU0sZ0JBQWdCLENBQUMsY0FBYyxFQUFFLENBQUM7Z0JBQ3hDLGNBQWMsR0FBRyxNQUFNLGdCQUFnQixDQUFDLFdBQVcsQ0FBQyxPQUFPLENBQUMsQ0FBQztZQUNqRSxDQUFDLENBQUEsQ0FBQyxDQUFDO1lBRUgsRUFBRSxDQUFDLG9CQUFvQixFQUFFLEdBQUcsRUFBRTtnQkFDMUIsTUFBTSxDQUFDLGNBQWMsQ0FBQyxDQUFDLFdBQVcsRUFBRSxDQUFDO1lBQ3pDLENBQUMsQ0FBQyxDQUFDO1FBQ1AsQ0FBQyxDQUFDLENBQUM7UUFFSCxRQUFRLENBQUMsbURBQW1ELEVBQUUsR0FBRyxFQUFFO1lBQy9ELElBQUksY0FBMkMsQ0FBQztZQUVoRCxVQUFVLENBQUMsR0FBUyxFQUFFO2dCQUNsQixPQUFPLENBQUMsSUFBSSxDQUFDLHFCQUFxQixDQUFDO29CQUMvQixHQUFHLEVBQUUsRUFBRTtvQkFDUCxRQUFRLEVBQUUsSUFBSSxDQUFDLFNBQVMsQ0FBQyw0QkFBNEIsQ0FBQztvQkFDdEQsWUFBWSxFQUFFLEdBQUc7b0JBQ2pCLE9BQU8sRUFBRSxFQUFFO2lCQUNkLENBQUMsQ0FBQyxxQkFBcUIsQ0FBQztvQkFDckIsR0FBRyxFQUFFLEVBQUU7b0JBQ1AsUUFBUSxFQUFFLElBQUksQ0FBQyxTQUFTLENBQUMsa0JBQWtCLENBQUM7b0JBQzVDLFlBQVksRUFBRSxHQUFHO29CQUNqQixPQUFPLEVBQUUsRUFBRTtpQkFDZCxDQUFDLENBQUM7Z0JBRUgsU0FBUyxDQUFDLFlBQVksQ0FBQyxrQkFBa0IsQ0FBQyxTQUFTLENBQUMsQ0FBQztnQkFFckQseUJBQXlCLENBQUMsU0FBUyxDQUFDLGVBQWUsQ0FBQyxJQUFJLG1CQUFtQixDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7Z0JBRW5GLE1BQU0sZ0JBQWdCLENBQUMsY0FBYyxFQUFFLENBQUM7Z0JBQ3hDLGNBQWMsR0FBRyxNQUFNLGdCQUFnQixDQUFDLFdBQVcsQ0FBQyxPQUFPLENBQUMsQ0FBQztZQUNqRSxDQUFDLENBQUEsQ0FBQyxDQUFDO1lBRUgsRUFBRSxDQUFDLHNCQUFzQixFQUFFLEdBQUcsRUFBRTtnQkFDNUIsTUFBTSxDQUFDLGNBQWMsQ0FBQyxDQUFDLFdBQVcsRUFBRSxDQUFDO1lBQ3pDLENBQUMsQ0FBQyxDQUFDO1lBRUgsRUFBRSxDQUFDLHVDQUF1QyxFQUFFLEdBQUcsRUFBRTtnQkFDN0MsTUFBTSxDQUFDLGNBQWUsQ0FBQyxRQUFRLENBQUMsS0FBSyxFQUFFLENBQUMsQ0FBQyxPQUFPLENBQUMsMEJBQTBCLENBQUMsQ0FBQztZQUNqRixDQUFDLENBQUMsQ0FBQztZQUVILEVBQUUsQ0FBQyx1Q0FBdUMsRUFBRSxHQUFHLEVBQUU7Z0JBQzdDLE1BQU0sQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUMscUJBQXFCLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBQzlDLE1BQU0sQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUMsdUJBQXVCLENBQUMsQ0FBQyxFQUFFLE1BQU0sQ0FBQyxRQUFRLEVBQUUsRUFBRSxJQUFJLGdCQUFnQixDQUFDO29CQUNwRixhQUFhLEVBQUUsSUFBSTtvQkFDbkIsYUFBYSxFQUFFLElBQUk7b0JBQ25CLE9BQU8sRUFBRSxLQUFLO29CQUNkLElBQUksRUFBRSxJQUFJO29CQUNWLGlCQUFpQixFQUFFLEVBQUU7b0JBQ3JCLFVBQVUsRUFBRTt3QkFDUixLQUFLLEVBQUU7NEJBQ0gsT0FBTyxFQUFFLENBQUMsT0FBTyxDQUFDOzRCQUNsQixTQUFTLEVBQUUsS0FBSzs0QkFDaEIsV0FBVyxFQUFFLEtBQUs7eUJBQ3JCO3FCQUNKO29CQUNELFdBQVcsRUFBRTt3QkFDVCxLQUFLLEVBQUU7NEJBQ0gsaUJBQWlCLEVBQUUsS0FBSzt5QkFDM0I7cUJBQ0o7aUJBQ0osQ0FBQyxFQUFFLEVBQUUsRUFBRTtvQkFDSixlQUFlLEVBQUUsS0FBSztvQkFDdEIsT0FBTyxFQUFFLENBQUM7b0JBQ1YsVUFBVSxFQUFFLENBQUM7b0JBQ2IseUJBQXlCLEVBQUUsS0FBSztvQkFDaEMsT0FBTyxFQUFFLElBQUk7aUJBQ2hCLENBQUMsQ0FBQztZQUNQLENBQUMsQ0FBQyxDQUFDO1FBQ1AsQ0FBQyxDQUFDLENBQUM7UUFFSCxRQUFRLENBQUMsc0NBQXNDLEVBQUUsR0FBRyxFQUFFO1lBQ2xELElBQUksY0FBMkMsQ0FBQztZQUVoRCxVQUFVLENBQUMsR0FBUyxFQUFFO2dCQUNsQixPQUFPLENBQUMsSUFBSSxDQUFDLHFCQUFxQixDQUFDO29CQUMvQixHQUFHLEVBQUUsRUFBRTtvQkFDUCxRQUFRLEVBQUUsSUFBSSxDQUFDLFNBQVMsQ0FBQyxxQkFBcUIsQ0FBQztvQkFDL0MsWUFBWSxFQUFFLEdBQUc7b0JBQ2pCLE9BQU8sRUFBRSxFQUFFO2lCQUNkLENBQUMsQ0FBQyxxQkFBcUIsQ0FBQztvQkFDckIsR0FBRyxFQUFFLEVBQUU7b0JBQ1AsUUFBUSxFQUFFLElBQUksQ0FBQyxTQUFTLENBQUMseUJBQXlCLENBQUM7b0JBQ25ELFlBQVksRUFBRSxHQUFHO29CQUNqQixPQUFPLEVBQUUsRUFBRTtpQkFDZCxDQUFDLENBQUM7Z0JBRUgsU0FBUyxDQUFDLFlBQVksQ0FBQyxrQkFBa0IsQ0FBQyxTQUFTLENBQUMsQ0FBQztnQkFFckQseUJBQXlCLENBQUMsU0FBUyxDQUFDLGVBQWUsQ0FBQyxJQUFJLG1CQUFtQixDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7Z0JBRW5GLE1BQU0sZ0JBQWdCLENBQUMsY0FBYyxFQUFFLENBQUM7Z0JBQ3hDLGNBQWMsR0FBRyxNQUFNLGdCQUFnQixDQUFDLFdBQVcsQ0FBQyxPQUFPLENBQUMsQ0FBQztZQUNqRSxDQUFDLENBQUEsQ0FBQyxDQUFDO1lBRUgsRUFBRSxDQUFDLDBCQUEwQixFQUFFLEdBQUcsRUFBRTtnQkFDaEMsTUFBTSxDQUFDLGNBQWMsQ0FBQyxDQUFDLGFBQWEsRUFBRSxDQUFDO1lBQzNDLENBQUMsQ0FBQyxDQUFDO1lBRUgsRUFBRSxDQUFDLDZCQUE2QixFQUFFLEdBQUcsRUFBRTtnQkFDbkMsTUFBTSxDQUFDLFVBQVUsQ0FBQyx5QkFBeUIsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxjQUFjLENBQUMsTUFBTSxDQUFDLGVBQWUsRUFBRSxNQUFNLENBQUMsUUFBUSxFQUFFLENBQUMsQ0FBQztZQUMvRyxDQUFDLENBQUMsQ0FBQztZQUVILEVBQUUsQ0FBQyxpQ0FBaUMsRUFBRSxHQUFHLEVBQUU7Z0JBQ3ZDLE1BQU0sQ0FBQyxVQUFVLENBQUMseUJBQXlCLENBQUMsQ0FBQyxHQUFHLENBQUMsY0FBYyxDQUFDLE1BQU0sQ0FBQyxpQkFBaUIsRUFBRSxNQUFNLENBQUMsUUFBUSxFQUFFLENBQUMsQ0FBQztZQUNqSCxDQUFDLENBQUMsQ0FBQztRQUNQLENBQUMsQ0FBQyxDQUFDO1FBRUgsUUFBUSxDQUFDLDZEQUE2RCxFQUFFLEdBQUcsRUFBRTtZQUN6RSxJQUFJLGNBQTJDLENBQUM7WUFFaEQsVUFBVSxDQUFDLEdBQVMsRUFBRTtnQkFDbEIsT0FBTyxDQUFDLElBQUksQ0FBQyxxQkFBcUIsQ0FBQztvQkFDL0IsR0FBRyxFQUFFLEVBQUU7b0JBQ1AsUUFBUSxFQUFFLElBQUksQ0FBQyxTQUFTLENBQUMscUJBQXFCLENBQUM7b0JBQy9DLFlBQVksRUFBRSxHQUFHO29CQUNqQixPQUFPLEVBQUUsRUFBRTtpQkFDZCxDQUFDLENBQUMscUJBQXFCLENBQUM7b0JBQ3JCLEdBQUcsRUFBRSxFQUFFO29CQUNQLFFBQVEsRUFBRSxJQUFJLENBQUMsU0FBUyxDQUFDLG1DQUFtQyxDQUFDO29CQUM3RCxZQUFZLEVBQUUsR0FBRztvQkFDakIsT0FBTyxFQUFFLEVBQUU7aUJBQ2QsQ0FBQyxDQUFDO2dCQUVILFNBQVMsQ0FBQyxZQUFZLENBQUMsa0JBQWtCLENBQUMsU0FBUyxDQUFDLENBQUM7Z0JBRXJELHlCQUF5QixDQUFDLFNBQVMsQ0FBQyxlQUFlLENBQUMsSUFBSSxtQkFBbUIsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO2dCQUVuRixNQUFNLGdCQUFnQixDQUFDLGNBQWMsRUFBRSxDQUFDO2dCQUN4QyxjQUFjLEdBQUcsTUFBTSxnQkFBZ0IsQ0FBQyxXQUFXLENBQUMsT0FBTyxDQUFDLENBQUM7WUFDakUsQ0FBQyxDQUFBLENBQUMsQ0FBQztZQUVILEVBQUUsQ0FBQywwQkFBMEIsRUFBRSxHQUFHLEVBQUU7Z0JBQ2hDLE1BQU0sQ0FBQyxjQUFjLENBQUMsQ0FBQyxhQUFhLEVBQUUsQ0FBQztZQUMzQyxDQUFDLENBQUMsQ0FBQztZQUVILEVBQUUsQ0FBQyw2QkFBNkIsRUFBRSxHQUFHLEVBQUU7Z0JBQ25DLE1BQU0sQ0FBQyxVQUFVLENBQUMseUJBQXlCLENBQUMsQ0FBQyxHQUFHLENBQUMsY0FBYyxDQUFDLE1BQU0sQ0FBQyxlQUFlLEVBQUUsTUFBTSxDQUFDLFFBQVEsRUFBRSxDQUFDLENBQUM7WUFDL0csQ0FBQyxDQUFDLENBQUM7WUFFSCxFQUFFLENBQUMsNkJBQTZCLEVBQUUsR0FBRyxFQUFFO2dCQUNuQyxNQUFNLENBQUMsVUFBVSxDQUFDLHlCQUF5QixDQUFDLENBQUMsY0FBYyxDQUFDLE1BQU0sQ0FBQyxpQkFBaUIsRUFBRSxNQUFNLENBQUMsZ0JBQWdCLENBQUMsRUFBRSxLQUFLLEVBQUUscUJBQXFCLEVBQUUsQ0FBQyxDQUFDLENBQUM7WUFDckosQ0FBQyxDQUFDLENBQUM7WUFFSCxFQUFFLENBQUMsMkJBQTJCLEVBQUUsR0FBRyxFQUFFO2dCQUNqQyxNQUFNLENBQUMsVUFBVSxDQUFDLHlCQUF5QixDQUFDLENBQUMsR0FBRyxDQUFDLGNBQWMsQ0FBQyxNQUFNLENBQUMsdUJBQXVCLEVBQUUsTUFBTSxDQUFDLFFBQVEsRUFBRSxDQUFDLENBQUM7WUFDdkgsQ0FBQyxDQUFDLENBQUM7UUFDUCxDQUFDLENBQUMsQ0FBQztRQUVILFFBQVEsQ0FBQyxvRkFBb0YsRUFBRSxHQUFHLEVBQUU7WUFDaEcsSUFBSSxjQUEyQyxDQUFDO1lBRWhELFVBQVUsQ0FBQyxHQUFTLEVBQUU7Z0JBQ2xCLE9BQU8sQ0FBQyxJQUFJLENBQUMscUJBQXFCLENBQUM7b0JBQy9CLEdBQUcsRUFBRSxFQUFFO29CQUNQLFFBQVEsRUFBRSxJQUFJLENBQUMsU0FBUyxDQUFDLHFCQUFxQixDQUFDO29CQUMvQyxZQUFZLEVBQUUsR0FBRztvQkFDakIsT0FBTyxFQUFFLEVBQUU7aUJBQ2QsQ0FBQyxDQUFDLHFCQUFxQixDQUFDO29CQUNyQixHQUFHLEVBQUUsRUFBRTtvQkFDUCxRQUFRLEVBQUUsSUFBSSxDQUFDLFNBQVMsQ0FBQyxtQ0FBbUMsQ0FBQztvQkFDN0QsWUFBWSxFQUFFLEdBQUc7b0JBQ2pCLE9BQU8sRUFBRSxFQUFFO2lCQUNkLENBQUMsQ0FBQztnQkFFSCxTQUFTLENBQUMsWUFBWSxDQUFDLGtCQUFrQixDQUFDLFNBQVMsQ0FBQyxDQUFDO2dCQUVyRCx5QkFBeUIsQ0FBQyxTQUFTLENBQUMsZUFBZSxDQUFDLElBQUksbUJBQW1CLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQztnQkFFbkYsTUFBTSxnQkFBZ0IsQ0FBQyxjQUFjLEVBQUUsQ0FBQztnQkFDeEMsTUFBTSxnQkFBZ0IsQ0FBQyxXQUFXLENBQUMsT0FBTyxDQUFDLENBQUM7Z0JBQzVDLGNBQWMsR0FBRyxNQUFNLGdCQUFnQixDQUFDLFdBQVcsQ0FBQyxPQUFPLENBQUMsQ0FBQztZQUNqRSxDQUFDLENBQUEsQ0FBQyxDQUFDO1lBRUgsRUFBRSxDQUFDLDBCQUEwQixFQUFFLEdBQUcsRUFBRTtnQkFDaEMsTUFBTSxDQUFDLGNBQWMsQ0FBQyxDQUFDLGFBQWEsRUFBRSxDQUFDO1lBQzNDLENBQUMsQ0FBQyxDQUFDO1lBRUgsRUFBRSxDQUFDLHVCQUF1QixFQUFFLEdBQUcsRUFBRTtnQkFDN0IsTUFBTSxDQUFDLFVBQVUsQ0FBQyx5QkFBeUIsQ0FBQyxDQUFDLGNBQWMsQ0FBQyxNQUFNLENBQUMsdUJBQXVCLEVBQUUsTUFBTSxDQUFDLFFBQVEsRUFBRSxDQUFDLENBQUM7WUFDbkgsQ0FBQyxDQUFDLENBQUM7UUFDUCxDQUFDLENBQUMsQ0FBQztRQUVILFFBQVEsQ0FBQyxrR0FBa0csRUFBRSxHQUFHLEVBQUU7WUFDOUcsSUFBSSxjQUEyQyxDQUFDO1lBQ2hELElBQUksVUFBNEIsQ0FBQztZQUVqQyxVQUFVLENBQUMsR0FBUyxFQUFFO2dCQUNsQixPQUFPLENBQUMsSUFBSSxDQUFDLHFCQUFxQixDQUFDO29CQUMvQixHQUFHLEVBQUUsRUFBRTtvQkFDUCxRQUFRLEVBQUUsSUFBSSxDQUFDLFNBQVMsQ0FBQyw2QkFBNkIsQ0FBQztvQkFDdkQsWUFBWSxFQUFFLEdBQUc7b0JBQ2pCLE9BQU8sRUFBRSxFQUFFO2lCQUNkLENBQUMsQ0FBQyxxQkFBcUIsQ0FBQztvQkFDckIsR0FBRyxFQUFFLEVBQUU7b0JBQ1AsUUFBUSxFQUFFLElBQUksQ0FBQyxTQUFTLENBQUMsbUNBQW1DLENBQUM7b0JBQzdELFlBQVksRUFBRSxHQUFHO29CQUNqQixPQUFPLEVBQUUsRUFBRTtpQkFDZCxDQUFDLENBQUMscUJBQXFCLENBQUM7b0JBQ3JCLEdBQUcsRUFBRSxFQUFFO29CQUNQLFFBQVEsRUFBRSxJQUFJLENBQUMsU0FBUyxDQUFDLGtCQUFrQixDQUFDO29CQUM1QyxZQUFZLEVBQUUsR0FBRztvQkFDakIsT0FBTyxFQUFFLEVBQUU7aUJBQ2QsQ0FBQyxDQUFDO2dCQUVILFVBQVUsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksRUFBRSxLQUFLLENBQUMsQ0FBQztnQkFDckMsVUFBVSxDQUFDLGVBQWUsQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFFOUIsU0FBUyxDQUFDLFlBQVksQ0FBQyxrQkFBa0IsQ0FBQyxTQUFTLENBQUMsQ0FBQztnQkFFckQseUJBQXlCLENBQUMsU0FBUyxDQUFDLGVBQWUsQ0FBQyxJQUFJLG1CQUFtQixDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7Z0JBRW5GLE1BQU0sZ0JBQWdCLENBQUMsY0FBYyxFQUFFLENBQUM7Z0JBQ3hDLE1BQU0sZ0JBQWdCLENBQUMsV0FBVyxDQUFDLE9BQU8sQ0FBQyxDQUFDO2dCQUU1QyxVQUFVLENBQUMsZUFBZSxDQUFDLEVBQUUsR0FBRyxJQUFJLEdBQUcsSUFBSSxHQUFHLENBQUMsQ0FBQyxDQUFDO2dCQUVqRCxjQUFjLEdBQUcsTUFBTSxnQkFBZ0IsQ0FBQyxXQUFXLENBQUMsT0FBTyxDQUFDLENBQUM7WUFDakUsQ0FBQyxDQUFBLENBQUMsQ0FBQztZQUVILFNBQVMsQ0FBQyxHQUFHLEVBQUU7Z0JBQ1gsVUFBVSxDQUFDLFdBQVcsRUFBRSxDQUFDO1lBQzdCLENBQUMsQ0FBQyxDQUFDO1lBRUgsRUFBRSxDQUFDLG9CQUFvQixFQUFFLEdBQUcsRUFBRTtnQkFDMUIsTUFBTSxDQUFDLGNBQWMsQ0FBQyxDQUFDLFdBQVcsRUFBRSxDQUFDO1lBQ3pDLENBQUMsQ0FBQyxDQUFDO1lBRUgsRUFBRSxDQUFDLHlCQUF5QixFQUFFLEdBQUcsRUFBRTtnQkFDL0IsTUFBTSxDQUFDLFVBQVUsQ0FBQyx5QkFBeUIsQ0FBQyxDQUFDLGNBQWMsQ0FBQyxNQUFNLENBQUMsZUFBZSxFQUFFLE1BQU0sQ0FBQyxRQUFRLEVBQUUsQ0FBQyxDQUFDO1lBQzNHLENBQUMsQ0FBQyxDQUFDO1lBRUgsRUFBRSxDQUFDLDJCQUEyQixFQUFFLEdBQUcsRUFBRTtnQkFDakMsTUFBTSxDQUFDLFVBQVUsQ0FBQyx5QkFBeUIsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxjQUFjLENBQUMsTUFBTSxDQUFDLHVCQUF1QixFQUFFLE1BQU0sQ0FBQyxRQUFRLEVBQUUsQ0FBQyxDQUFDO1lBQ3ZILENBQUMsQ0FBQyxDQUFDO1FBQ1AsQ0FBQyxDQUFDLENBQUM7UUFFSCxRQUFRLENBQUMsK0RBQStELEVBQUUsR0FBRyxFQUFFO1lBQzNFLElBQUksY0FBMkMsQ0FBQztZQUVoRCxVQUFVLENBQUMsR0FBUyxFQUFFO2dCQUNsQixPQUFPLENBQUMsSUFBSSxDQUFDLHFCQUFxQixDQUFDO29CQUMvQixHQUFHLEVBQUUsRUFBRTtvQkFDUCxRQUFRLEVBQUUsSUFBSSxDQUFDLFNBQVMsQ0FBQyw0QkFBNEIsQ0FBQztvQkFDdEQsWUFBWSxFQUFFLEdBQUc7b0JBQ2pCLE9BQU8sRUFBRSxFQUFFO2lCQUNkLENBQUMsQ0FBQyxxQkFBcUIsQ0FBQztvQkFDckIsR0FBRyxFQUFFLEVBQUU7b0JBQ1AsUUFBUSxFQUFFLElBQUksQ0FBQyxTQUFTLENBQUMseUJBQXlCLENBQUM7b0JBQ25ELFlBQVksRUFBRSxHQUFHO29CQUNqQixPQUFPLEVBQUUsRUFBRTtpQkFDZCxDQUFDLENBQUM7Z0JBRUgsU0FBUyxDQUFDLFlBQVksQ0FBQyxrQkFBa0IsQ0FBQyxTQUFTLENBQUMsQ0FBQztnQkFFckQseUJBQXlCLENBQUMsU0FBUyxDQUFDLGVBQWUsQ0FBQyxJQUFJLG1CQUFtQixDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7Z0JBRW5GLE1BQU0sZ0JBQWdCLENBQUMsY0FBYyxFQUFFLENBQUM7Z0JBQ3hDLGNBQWMsR0FBRyxNQUFNLGdCQUFnQixDQUFDLFdBQVcsQ0FBQyxPQUFPLENBQUMsQ0FBQztZQUNqRSxDQUFDLENBQUEsQ0FBQyxDQUFDO1lBRUgsRUFBRSxDQUFDLDBCQUEwQixFQUFFLEdBQUcsRUFBRTtnQkFDaEMsTUFBTSxDQUFDLGNBQWMsQ0FBQyxDQUFDLGFBQWEsRUFBRSxDQUFDO1lBQzNDLENBQUMsQ0FBQyxDQUFDO1lBRUgsRUFBRSxDQUFDLHVDQUF1QyxFQUFFLEdBQUcsRUFBRTtnQkFDN0MsTUFBTSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQyxxQkFBcUIsQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFDOUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQyx1QkFBdUIsQ0FBQyxDQUFDLEVBQUUsTUFBTSxDQUFDLFFBQVEsRUFBRSxFQUFFLElBQUksZ0JBQWdCLENBQUM7b0JBQ3BGLGFBQWEsRUFBRSxJQUFJO29CQUNuQixhQUFhLEVBQUUsSUFBSTtvQkFDbkIsT0FBTyxFQUFFLEtBQUs7b0JBQ2QsSUFBSSxFQUFFLElBQUk7b0JBQ1YsaUJBQWlCLEVBQUUsRUFBRTtvQkFDckIsVUFBVSxFQUFFO3dCQUNSLEtBQUssRUFBRTs0QkFDSCxPQUFPLEVBQUUsQ0FBQyxPQUFPLENBQUM7NEJBQ2xCLFNBQVMsRUFBRSxLQUFLOzRCQUNoQixXQUFXLEVBQUUsS0FBSzt5QkFDckI7cUJBQ0o7b0JBQ0QsV0FBVyxFQUFFO3dCQUNULEtBQUssRUFBRTs0QkFDSCxpQkFBaUIsRUFBRSxLQUFLO3lCQUMzQjtxQkFDSjtpQkFDSixDQUFDLEVBQUUsRUFBRSxFQUFFO29CQUNKLGVBQWUsRUFBRSxLQUFLO29CQUN0QixPQUFPLEVBQUUsQ0FBQztvQkFDVixVQUFVLEVBQUUsQ0FBQztvQkFDYix5QkFBeUIsRUFBRSxLQUFLO29CQUNoQyxPQUFPLEVBQUUsSUFBSTtpQkFDaEIsQ0FBQyxDQUFDO1lBQ1AsQ0FBQyxDQUFDLENBQUM7UUFDUCxDQUFDLENBQUMsQ0FBQztRQUVILFFBQVEsQ0FBQyxtQ0FBbUMsRUFBRSxHQUFHLEVBQUU7WUFDL0MsSUFBSSxjQUEyQyxDQUFDO1lBRWhELFVBQVUsQ0FBQyxHQUFTLEVBQUU7Z0JBQ2xCLE9BQU8sQ0FBQyxJQUFJO3FCQUNQLGlCQUFpQixDQUFDLElBQUksS0FBSyxFQUFFLENBQUM7cUJBQzlCLHFCQUFxQixDQUFDO29CQUNuQixHQUFHLEVBQUUsRUFBRTtvQkFDUCxRQUFRLEVBQUUsSUFBSSxDQUFDLFNBQVMsQ0FBQyxrQkFBa0IsQ0FBQztvQkFDNUMsWUFBWSxFQUFFLEdBQUc7b0JBQ2pCLE9BQU8sRUFBRSxFQUFFO2lCQUNkLENBQUMsQ0FBQztnQkFFUCxTQUFTLENBQUMsWUFBWSxDQUFDLGtCQUFrQixDQUFDLFNBQVMsQ0FBQyxDQUFDO2dCQUVyRCxNQUFNLGdCQUFnQixDQUFDLGNBQWMsRUFBRSxDQUFDO2dCQUN4QyxjQUFjLEdBQUcsTUFBTSxnQkFBZ0IsQ0FBQyxXQUFXLENBQUMsT0FBTyxDQUFDLENBQUM7WUFDakUsQ0FBQyxDQUFBLENBQUMsQ0FBQztZQUVILEVBQUUsQ0FBQyxxQkFBcUIsRUFBRSxHQUFHLEVBQUU7Z0JBQzNCLE1BQU0sQ0FBQyxjQUFjLENBQUMsQ0FBQyxhQUFhLEVBQUUsQ0FBQztZQUMzQyxDQUFDLENBQUMsQ0FBQztRQUNQLENBQUMsQ0FBQyxDQUFDO1FBRUgsUUFBUSxDQUFDLHNDQUFzQyxFQUFFLEdBQUcsRUFBRTtZQUNsRCxJQUFJLGNBQTJDLENBQUM7WUFFaEQsVUFBVSxDQUFDLEdBQVMsRUFBRTtnQkFDbEIsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLEVBQUUsS0FBSyxDQUFDO3FCQUNsQixtQkFBbUIsQ0FBQyxDQUFDLENBQUM7cUJBQ3RCLGVBQWUsQ0FBQyxFQUFFLEdBQUcsRUFBRSxHQUFHLElBQUksR0FBRyxHQUFHLENBQUMsQ0FBQztnQkFFM0MsT0FBTyxDQUFDLElBQUksQ0FBQyxxQkFBcUIsQ0FBQztvQkFDL0IsR0FBRyxFQUFFLEVBQUU7b0JBQ1AsUUFBUSxFQUFFLElBQUksQ0FBQyxTQUFTLENBQUMscUJBQXFCLENBQUM7b0JBQy9DLFlBQVksRUFBRSxHQUFHO29CQUNqQixPQUFPLEVBQUUsRUFBRTtpQkFDZCxDQUFDLENBQUMscUJBQXFCLENBQUM7b0JBQ3JCLEdBQUcsRUFBRSxFQUFFO29CQUNQLFFBQVEsRUFBRSxJQUFJLENBQUMsU0FBUyxDQUFDLGtCQUFrQixDQUFDO29CQUM1QyxZQUFZLEVBQUUsR0FBRztvQkFDakIsT0FBTyxFQUFFLEVBQUU7aUJBQ2QsQ0FBQyxDQUFDO2dCQUVILFNBQVMsQ0FBQyxZQUFZLENBQUMsa0JBQWtCLENBQUMsU0FBUyxDQUFDLENBQUM7Z0JBRXJELE1BQU0sZ0JBQWdCLENBQUMsY0FBYyxFQUFFLENBQUM7Z0JBRXhDLGNBQWMsR0FBRyxNQUFNLGdCQUFnQixDQUFDLFdBQVcsQ0FBQyxPQUFPLENBQUMsQ0FBQztZQUNqRSxDQUFDLENBQUEsQ0FBQyxDQUFDO1lBRUgsU0FBUyxDQUFDLEdBQVMsRUFBRTtnQkFDakIsSUFBSSxDQUFDLGFBQWEsRUFBRSxDQUFDO1lBQ3pCLENBQUMsQ0FBQSxDQUFDLENBQUM7WUFFSCxFQUFFLENBQUMsMEJBQTBCLEVBQUUsR0FBRyxFQUFFO2dCQUNoQyxNQUFNLENBQUMsZ0JBQWdCLENBQUMsb0JBQW9CLEVBQUUsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUNsRSxDQUFDLENBQUMsQ0FBQztZQUVILEVBQUUsQ0FBQyxxQkFBcUIsRUFBRSxHQUFHLEVBQUU7Z0JBQzNCLE1BQU0sQ0FBQyxjQUFjLENBQUMsQ0FBQyxhQUFhLEVBQUUsQ0FBQztZQUMzQyxDQUFDLENBQUMsQ0FBQztRQUNQLENBQUMsQ0FBQyxDQUFDO1FBRUgsUUFBUSxDQUFDLHFCQUFxQixFQUFFLEdBQUcsRUFBRTtZQUNqQyxJQUFJLGVBQTRDLENBQUM7WUFDakQsSUFBSSxlQUE0QyxDQUFDO1lBRWpELFVBQVUsQ0FBQyxHQUFTLEVBQUU7Z0JBQ2xCLE9BQU8sQ0FBQyxJQUFJLENBQUMscUJBQXFCLENBQUM7b0JBQy9CLEdBQUcsRUFBRSxFQUFFO29CQUNQLFFBQVEsRUFBRSxJQUFJLENBQUMsU0FBUyxDQUFDLHFCQUFxQixDQUFDO29CQUMvQyxZQUFZLEVBQUUsR0FBRztvQkFDakIsT0FBTyxFQUFFLEVBQUU7aUJBQ2QsQ0FBQyxDQUFDLHFCQUFxQixDQUNwQixJQUFJLEtBQUssRUFBRSxDQUNkLENBQUMscUJBQXFCLENBQUM7b0JBQ3BCLEdBQUcsRUFBRSxFQUFFO29CQUNQLFFBQVEsRUFBRSxJQUFJLENBQUMsU0FBUyxDQUFDLGtCQUFrQixDQUFDO29CQUM1QyxZQUFZLEVBQUUsR0FBRztvQkFDakIsT0FBTyxFQUFFLEVBQUU7aUJBQ2QsQ0FBQyxDQUFDO2dCQUVILFNBQVMsQ0FBQyxZQUFZLENBQUMsa0JBQWtCLENBQUMsU0FBUyxDQUFDLENBQUM7Z0JBRXJELHlCQUF5QixDQUFDLFNBQVMsQ0FBQyxlQUFlLENBQUMsSUFBSSxtQkFBbUIsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO2dCQUVuRixNQUFNLGdCQUFnQixDQUFDLGNBQWMsRUFBRSxDQUFDO2dCQUN4QyxlQUFlLEdBQUcsTUFBTSxnQkFBZ0IsQ0FBQyxXQUFXLENBQUMsT0FBTyxDQUFDLENBQUM7Z0JBQzlELGVBQWUsR0FBRyxNQUFNLGdCQUFnQixDQUFDLFdBQVcsQ0FBQyxlQUFlLENBQUMsQ0FBQztZQUMxRSxDQUFDLENBQUEsQ0FBQyxDQUFDO1lBRUgsRUFBRSxDQUFDLDhCQUE4QixFQUFFLEdBQUcsRUFBRTtnQkFDcEMsTUFBTSxDQUFDLGVBQWUsQ0FBQyxDQUFDLFdBQVcsRUFBRSxDQUFDO1lBQzFDLENBQUMsQ0FBQyxDQUFDO1lBRUgsRUFBRSxDQUFDLHdDQUF3QyxFQUFFLEdBQUcsRUFBRTtnQkFDOUMsTUFBTSxDQUFDLGVBQWdCLENBQUMsUUFBUSxDQUFDLEtBQUssRUFBRSxDQUFDLENBQUMsT0FBTyxDQUFDLFdBQVcsQ0FBQyxDQUFDO1lBQ25FLENBQUMsQ0FBQyxDQUFDO1lBRUgsRUFBRSxDQUFDLHFCQUFxQixFQUFFLEdBQUcsRUFBRTtnQkFDM0IsTUFBTSxDQUFDLGVBQWUsQ0FBQyxDQUFDLGFBQWEsRUFBRSxDQUFDO1lBQzVDLENBQUMsQ0FBQyxDQUFDO1FBQ1AsQ0FBQyxDQUFDLENBQUM7UUFFSCxRQUFRLENBQUMsNkJBQTZCLEVBQUUsR0FBRyxFQUFFO1lBQ3pDLElBQUksY0FBMkMsQ0FBQztZQUVoRCxVQUFVLENBQUMsR0FBUyxFQUFFO2dCQUNsQixPQUFPLENBQUMsSUFBSSxDQUFDLHFCQUFxQixDQUFDO29CQUMvQixHQUFHLEVBQUUsRUFBRTtvQkFDUCxRQUFRLEVBQUUsSUFBSSxDQUFDLFNBQVMsQ0FBQyxxQkFBcUIsQ0FBQztvQkFDL0MsWUFBWSxFQUFFLEdBQUc7b0JBQ2pCLE9BQU8sRUFBRSxFQUFFO2lCQUNkLENBQUMsQ0FBQyxxQkFBcUIsQ0FBQztvQkFDckIsR0FBRyxFQUFFLEVBQUU7b0JBQ1AsUUFBUSxFQUFFLElBQUksQ0FBQyxTQUFTLENBQUMsa0JBQWtCLENBQUM7b0JBQzVDLFlBQVksRUFBRSxHQUFHO29CQUNqQixPQUFPLEVBQUUsRUFBRTtpQkFDZCxDQUFDLENBQUM7Z0JBRUgsU0FBUyxDQUFDLFlBQVksQ0FBQyxrQkFBa0IsQ0FBQyxTQUFTLENBQUMsQ0FBQztnQkFFckQseUJBQXlCLENBQUMsU0FBUyxDQUFDLGVBQWUsQ0FBQyxJQUFJLG1CQUFtQixDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7Z0JBRW5GLE1BQU0sT0FBTyxHQUFHLGdCQUFnQixDQUFDLFdBQVcsQ0FBQyxPQUFPLENBQUMsQ0FBQztnQkFDdEQsTUFBTSxnQkFBZ0IsQ0FBQyxjQUFjLEVBQUUsQ0FBQztnQkFDeEMsY0FBYyxHQUFHLE1BQU0sT0FBTyxDQUFDO1lBQ25DLENBQUMsQ0FBQSxDQUFDLENBQUM7WUFFSCxFQUFFLENBQUMsb0JBQW9CLEVBQUUsR0FBRyxFQUFFO2dCQUMxQixNQUFNLENBQUMsY0FBYyxDQUFDLENBQUMsV0FBVyxFQUFFLENBQUM7WUFDekMsQ0FBQyxDQUFDLENBQUM7WUFFSCxFQUFFLENBQUMsd0NBQXdDLEVBQUUsR0FBRyxFQUFFO2dCQUM5QyxNQUFNLENBQUMsY0FBZSxDQUFDLFFBQVEsQ0FBQyxLQUFLLEVBQUUsQ0FBQyxDQUFDLE9BQU8sQ0FBQywwQkFBMEIsQ0FBQyxDQUFDO1lBQ2pGLENBQUMsQ0FBQyxDQUFDO1lBRUgsRUFBRSxDQUFDLCtDQUErQyxFQUFFLEdBQUcsRUFBRTtnQkFDckQsTUFBTSxDQUFDLGNBQWUsQ0FBQyxRQUFRLENBQUMsVUFBVSxFQUFFLENBQUMsQ0FBQyxXQUFXLEVBQUUsQ0FBQztnQkFDNUQsTUFBTSxDQUFDLGNBQWUsQ0FBQyxRQUFRLENBQUMsVUFBVSxFQUFFLENBQUMsS0FBSyxFQUFFLENBQUMsQ0FBQyxPQUFPLENBQUMsc0NBQXNDLENBQUMsQ0FBQztZQUMxRyxDQUFDLENBQUMsQ0FBQztRQUNQLENBQUMsQ0FBQyxDQUFDO1FBRUgsUUFBUSxDQUFDLG9DQUFvQyxFQUFFLEdBQUcsRUFBRTtZQUNoRCxJQUFJLGVBQTRDLENBQUM7WUFDakQsSUFBSSxlQUE0QyxDQUFDO1lBRWpELFVBQVUsQ0FBQyxHQUFTLEVBQUU7Z0JBQ2xCLElBQUkscUJBQXFCLEdBQXdDLEdBQUcsRUFBRSxHQUFHLE1BQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBQ3JHLE1BQU0sY0FBYyxHQUFHLElBQUksT0FBTyxDQUFDLENBQUMsT0FBTyxFQUFFLEVBQUUsR0FBRyxxQkFBcUIsR0FBRyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFFdEYsT0FBTyxDQUFDLElBQUksQ0FBQyxzQkFBc0IsQ0FDL0IsR0FBRyxFQUFFLENBQUMsY0FBYyxDQUN2QixDQUFDLHFCQUFxQixDQUFDO29CQUNwQixHQUFHLEVBQUUsRUFBRTtvQkFDUCxRQUFRLEVBQUUsSUFBSSxDQUFDLFNBQVMsQ0FBQyxvQkFBb0IsQ0FBQztvQkFDOUMsWUFBWSxFQUFFLEdBQUc7b0JBQ2pCLE9BQU8sRUFBRSxFQUFFO2lCQUNkLENBQUMsQ0FBQyxxQkFBcUIsQ0FBQztvQkFDckIsR0FBRyxFQUFFLEVBQUU7b0JBQ1AsUUFBUSxFQUFFLElBQUksQ0FBQyxTQUFTLENBQUMsa0JBQWtCLENBQUM7b0JBQzVDLFlBQVksRUFBRSxHQUFHO29CQUNqQixPQUFPLEVBQUUsRUFBRTtpQkFDZCxDQUFDLENBQUM7Z0JBRUgsU0FBUyxDQUFDLFlBQVksQ0FBQyxrQkFBa0IsQ0FBQyxTQUFTLENBQUMsQ0FBQztnQkFFckQseUJBQXlCLENBQUMsU0FBUyxDQUFDLGVBQWUsQ0FBQyxJQUFJLG1CQUFtQixDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7Z0JBRW5GLE1BQU0sT0FBTyxHQUFHLGdCQUFnQixDQUFDLGNBQWMsRUFBRSxDQUFDO2dCQUNsRCxNQUFNLEtBQUssR0FBRyxnQkFBZ0IsQ0FBQyxXQUFXLENBQUMsT0FBTyxDQUFDLENBQUM7Z0JBQ3BELE1BQU0sS0FBSyxHQUFHLGdCQUFnQixDQUFDLFdBQVcsQ0FBQyxlQUFlLENBQUMsQ0FBQztnQkFFNUQscUJBQXFCLENBQUM7b0JBQ2xCLEdBQUcsRUFBRSxFQUFFO29CQUNQLFFBQVEsRUFBRSxJQUFJLENBQUMsU0FBUyxDQUFDLHFCQUFxQixDQUFDO29CQUMvQyxZQUFZLEVBQUUsR0FBRztvQkFDakIsT0FBTyxFQUFFLEVBQUU7aUJBQ2QsQ0FBQyxDQUFDO2dCQUVILE1BQU0sT0FBTyxDQUFDO2dCQUNkLGVBQWUsR0FBRyxNQUFNLEtBQUssQ0FBQztnQkFDOUIsZUFBZSxHQUFHLE1BQU0sS0FBSyxDQUFDO1lBQ2xDLENBQUMsQ0FBQSxDQUFDLENBQUM7WUFFSCxFQUFFLENBQUMsb0JBQW9CLEVBQUUsR0FBRyxFQUFFO2dCQUMxQixNQUFNLENBQUMsZUFBZSxDQUFDLENBQUMsV0FBVyxFQUFFLENBQUM7Z0JBQ3RDLE1BQU0sQ0FBQyxlQUFlLENBQUMsQ0FBQyxXQUFXLEVBQUUsQ0FBQztZQUMxQyxDQUFDLENBQUMsQ0FBQztZQUVILEVBQUUsQ0FBQyx3Q0FBd0MsRUFBRSxHQUFHLEVBQUU7Z0JBQzlDLE1BQU0sQ0FBQyxlQUFnQixDQUFDLFFBQVEsQ0FBQyxLQUFLLEVBQUUsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxXQUFXLENBQUMsQ0FBQztZQUNuRSxDQUFDLENBQUMsQ0FBQztZQUVILEVBQUUsQ0FBQyx3Q0FBd0MsRUFBRSxHQUFHLEVBQUU7Z0JBQzlDLE1BQU0sQ0FBQyxlQUFnQixDQUFDLFFBQVEsQ0FBQyxLQUFLLEVBQUUsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxXQUFXLENBQUMsQ0FBQztZQUNuRSxDQUFDLENBQUMsQ0FBQztZQUVILEVBQUUsQ0FBQywrQ0FBK0MsRUFBRSxHQUFHLEVBQUU7Z0JBQ3JELE1BQU0sQ0FBQyxlQUFnQixDQUFDLFFBQVEsQ0FBQyxVQUFVLEVBQUUsQ0FBQyxDQUFDLFdBQVcsRUFBRSxDQUFDO2dCQUM3RCxNQUFNLENBQUMsZUFBZ0IsQ0FBQyxRQUFRLENBQUMsVUFBVSxFQUFFLENBQUMsS0FBSyxFQUFFLENBQUMsQ0FBQyxPQUFPLENBQUMsc0NBQXNDLENBQUMsQ0FBQztnQkFFdkcsTUFBTSxDQUFDLGVBQWdCLENBQUMsUUFBUSxDQUFDLFVBQVUsRUFBRSxDQUFDLENBQUMsV0FBVyxFQUFFLENBQUM7Z0JBQzdELE1BQU0sQ0FBQyxlQUFnQixDQUFDLFFBQVEsQ0FBQyxVQUFVLEVBQUUsQ0FBQyxLQUFLLEVBQUUsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxzQ0FBc0MsQ0FBQyxDQUFDO1lBQzNHLENBQUMsQ0FBQyxDQUFDO1FBQ1AsQ0FBQyxDQUFDLENBQUM7UUFFSCxRQUFRLENBQUMsMkRBQTJELEVBQUUsR0FBRyxFQUFFO1lBQ3ZFLElBQUksZUFBNEMsQ0FBQztZQUNqRCxJQUFJLGVBQTRDLENBQUM7WUFFakQsVUFBVSxDQUFDLEdBQVMsRUFBRTtnQkFDbEIsSUFBSSxxQkFBcUIsR0FBd0MsR0FBRyxFQUFFLEdBQUcsTUFBTSxDQUFDLEtBQUssQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFDckcsTUFBTSxjQUFjLEdBQUcsSUFBSSxPQUFPLENBQUMsQ0FBQyxPQUFPLEVBQUUsRUFBRSxHQUFHLHFCQUFxQixHQUFHLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO2dCQUV0RixPQUFPLENBQUMsSUFBSSxDQUFDLHNCQUFzQixDQUMvQixHQUFHLEVBQUUsQ0FBQyxjQUFjLENBQ3ZCLENBQUMscUJBQXFCLENBQ25CLElBQUksS0FBSyxFQUFFLENBQ2QsQ0FBQyxxQkFBcUIsQ0FBQztvQkFDcEIsR0FBRyxFQUFFLEVBQUU7b0JBQ1AsUUFBUSxFQUFFLElBQUksQ0FBQyxTQUFTLENBQUMsb0JBQW9CLENBQUM7b0JBQzlDLFlBQVksRUFBRSxHQUFHO29CQUNqQixPQUFPLEVBQUUsRUFBRTtpQkFDZCxDQUFDLENBQUM7Z0JBRUgsU0FBUyxDQUFDLFlBQVksQ0FBQyxrQkFBa0IsQ0FBQyxTQUFTLENBQUMsQ0FBQztnQkFFckQseUJBQXlCLENBQUMsU0FBUyxDQUFDLGVBQWUsQ0FBQyxJQUFJLG1CQUFtQixDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7Z0JBRW5GLE1BQU0sT0FBTyxHQUFHLGdCQUFnQixDQUFDLGNBQWMsRUFBRSxDQUFDO2dCQUNsRCxNQUFNLEtBQUssR0FBRyxnQkFBZ0IsQ0FBQyxXQUFXLENBQUMsT0FBTyxDQUFDLENBQUM7Z0JBQ3BELE1BQU0sS0FBSyxHQUFHLGdCQUFnQixDQUFDLFdBQVcsQ0FBQyxlQUFlLENBQUMsQ0FBQztnQkFFNUQscUJBQXFCLENBQUM7b0JBQ2xCLEdBQUcsRUFBRSxFQUFFO29CQUNQLFFBQVEsRUFBRSxJQUFJLENBQUMsU0FBUyxDQUFDLHFCQUFxQixDQUFDO29CQUMvQyxZQUFZLEVBQUUsR0FBRztvQkFDakIsT0FBTyxFQUFFLEVBQUU7aUJBQ2QsQ0FBQyxDQUFDO2dCQUVILE1BQU0sT0FBTyxDQUFDO2dCQUVkLGVBQWUsR0FBRyxNQUFNLEtBQUssQ0FBQztnQkFDOUIsZUFBZSxHQUFHLE1BQU0sS0FBSyxDQUFDO1lBQ2xDLENBQUMsQ0FBQSxDQUFDLENBQUM7WUFFSCxFQUFFLENBQUMsb0JBQW9CLEVBQUUsR0FBRyxFQUFFO2dCQUMxQixNQUFNLENBQUMsZUFBZSxDQUFDLENBQUMsV0FBVyxFQUFFLENBQUM7WUFDMUMsQ0FBQyxDQUFDLENBQUM7WUFFSCxFQUFFLENBQUMsOEJBQThCLEVBQUUsR0FBRyxFQUFFO2dCQUNwQyxNQUFNLENBQUMsZUFBZ0IsQ0FBQyxRQUFRLENBQUMsS0FBSyxFQUFFLENBQUMsQ0FBQyxPQUFPLENBQUMsV0FBVyxDQUFDLENBQUM7WUFDbkUsQ0FBQyxDQUFDLENBQUM7WUFFSCxFQUFFLENBQUMscUJBQXFCLEVBQUUsR0FBRyxFQUFFO2dCQUMzQixNQUFNLENBQUMsZUFBZSxDQUFDLENBQUMsYUFBYSxFQUFFLENBQUM7WUFDNUMsQ0FBQyxDQUFDLENBQUM7UUFDUCxDQUFDLENBQUMsQ0FBQztRQUVILFFBQVEsQ0FBQyxzREFBc0QsRUFBRSxHQUFHLEVBQUU7WUFDbEUsSUFBSSxlQUE0QyxDQUFDO1lBQ2pELElBQUksZUFBNEMsQ0FBQztZQUVqRCxVQUFVLENBQUMsR0FBUyxFQUFFO2dCQUNsQixJQUFJLG9CQUFvQixHQUF5QixHQUFHLEVBQUUsR0FBRyxNQUFNLENBQUMsS0FBSyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO2dCQUNyRixNQUFNLGNBQWMsR0FBRyxJQUFJLE9BQU8sQ0FBQyxDQUFDLE1BQU0sRUFBRSxFQUFFLEdBQUcsb0JBQW9CLEdBQUcsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBRW5GLE9BQU8sQ0FBQyxJQUFJLENBQUMsc0JBQXNCLENBQy9CLEdBQUcsRUFBRSxDQUFDLGNBQWMsQ0FDdkIsQ0FBQyxxQkFBcUIsQ0FDbkIsSUFBSSxLQUFLLEVBQUUsQ0FDZCxDQUFDLHFCQUFxQixDQUFDO29CQUNwQixHQUFHLEVBQUUsRUFBRTtvQkFDUCxRQUFRLEVBQUUsSUFBSSxDQUFDLFNBQVMsQ0FBQyxrQkFBa0IsQ0FBQztvQkFDNUMsWUFBWSxFQUFFLEdBQUc7b0JBQ2pCLE9BQU8sRUFBRSxFQUFFO2lCQUNkLENBQUMsQ0FBQztnQkFFSCxTQUFTLENBQUMsWUFBWSxDQUFDLGtCQUFrQixDQUFDLFNBQVMsQ0FBQyxDQUFDO2dCQUVyRCx5QkFBeUIsQ0FBQyxTQUFTLENBQUMsZUFBZSxDQUFDLElBQUksbUJBQW1CLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQztnQkFFbkYsTUFBTSxPQUFPLEdBQUcsZ0JBQWdCLENBQUMsY0FBYyxFQUFFLENBQUM7Z0JBQ2xELE1BQU0sS0FBSyxHQUFHLGdCQUFnQixDQUFDLFdBQVcsQ0FBQyxPQUFPLENBQUMsQ0FBQztnQkFDcEQsTUFBTSxLQUFLLEdBQUcsZ0JBQWdCLENBQUMsV0FBVyxDQUFDLGVBQWUsQ0FBQyxDQUFDO2dCQUU1RCxvQkFBb0IsQ0FBQyxJQUFJLEtBQUssRUFBRSxDQUFDLENBQUM7Z0JBRWxDLElBQUk7b0JBQ0EsTUFBTSxPQUFPLENBQUM7aUJBQ2pCO2dCQUFDLE9BQU8sR0FBRyxFQUFFO29CQUNWLFFBQVE7aUJBQ1g7Z0JBRUQsZUFBZSxHQUFHLE1BQU0sS0FBSyxDQUFDO2dCQUM5QixlQUFlLEdBQUcsTUFBTSxLQUFLLENBQUM7WUFDbEMsQ0FBQyxDQUFBLENBQUMsQ0FBQztZQUVILEVBQUUsQ0FBQyxxQkFBcUIsRUFBRSxHQUFHLEVBQUU7Z0JBQzNCLE1BQU0sQ0FBQyxlQUFlLENBQUMsQ0FBQyxhQUFhLEVBQUUsQ0FBQztnQkFDeEMsTUFBTSxDQUFDLGVBQWUsQ0FBQyxDQUFDLGFBQWEsRUFBRSxDQUFDO1lBQzVDLENBQUMsQ0FBQyxDQUFDO1lBRUgsRUFBRSxDQUFDLDRDQUE0QyxFQUFFLEdBQUcsRUFBRTtnQkFDbEQsTUFBTSxDQUFDLFVBQVUsQ0FBQyx5QkFBeUIsQ0FBQyxDQUFDLGNBQWMsQ0FBQyxNQUFNLENBQUMsaUJBQWlCLEVBQUUsTUFBTSxDQUFDLGdCQUFnQixDQUFDLEVBQUUsS0FBSyxFQUFFLDRCQUE0QixFQUFFLENBQUMsQ0FBQyxDQUFDO1lBQzVKLENBQUMsQ0FBQyxDQUFDO1FBQ1AsQ0FBQyxDQUFDLENBQUM7UUFFSCxRQUFRLENBQUMsbUNBQW1DLEVBQUUsR0FBRyxFQUFFO1lBQy9DLElBQUksY0FBMkMsQ0FBQztZQUVoRCxVQUFVLENBQUMsR0FBUyxFQUFFO2dCQUNsQixJQUFJLHFCQUFxQixHQUF3QyxHQUFHLEVBQUUsR0FBRyxNQUFNLENBQUMsS0FBSyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO2dCQUNyRyxNQUFNLGNBQWMsR0FBRyxJQUFJLE9BQU8sQ0FBQyxDQUFDLE9BQU8sRUFBRSxFQUFFLEdBQUcscUJBQXFCLEdBQUcsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBRXRGLE9BQU8sQ0FBQyxJQUFJLENBQUMscUJBQXFCLENBQUM7b0JBQy9CLEdBQUcsRUFBRSxFQUFFO29CQUNQLFFBQVEsRUFBRSxJQUFJLENBQUMsU0FBUyxDQUFDLHFCQUFxQixDQUFDO29CQUMvQyxZQUFZLEVBQUUsR0FBRztvQkFDakIsT0FBTyxFQUFFLEVBQUU7aUJBQ2QsQ0FBQyxDQUFDLHFCQUFxQixDQUFDO29CQUNyQixHQUFHLEVBQUUsRUFBRTtvQkFDUCxRQUFRLEVBQUUsSUFBSSxDQUFDLFNBQVMsQ0FBQyxvQkFBb0IsQ0FBQztvQkFDOUMsWUFBWSxFQUFFLEdBQUc7b0JBQ2pCLE9BQU8sRUFBRSxFQUFFO2lCQUNkLENBQUMsQ0FBQyxzQkFBc0IsQ0FDckIsR0FBRyxFQUFFLENBQUMsY0FBYyxDQUN2QixDQUFDLHFCQUFxQixDQUFDO29CQUNwQixHQUFHLEVBQUUsRUFBRTtvQkFDUCxRQUFRLEVBQUUsSUFBSSxDQUFDLFNBQVMsQ0FBQyxrQkFBa0IsQ0FBQztvQkFDNUMsWUFBWSxFQUFFLEdBQUc7b0JBQ2pCLE9BQU8sRUFBRSxFQUFFO2lCQUNkLENBQUMsQ0FBQztnQkFFSCxTQUFTLENBQUMsYUFBYSxDQUFDLGVBQWUsQ0FBQztvQkFDcEMsS0FBSyxFQUFFLFNBQVMsQ0FBQyxPQUFPLENBQUM7b0JBQ3pCLGFBQWEsRUFBRSxTQUFTLENBQUMsZUFBZSxDQUFDO2lCQUM1QyxDQUFDLENBQUM7Z0JBRUgsU0FBUyxDQUFDLFlBQVksQ0FBQyxrQkFBa0IsQ0FBQyxTQUFTLENBQUMsQ0FBQztnQkFFckQseUJBQXlCLENBQUMsU0FBUyxDQUFDLGVBQWUsQ0FBQyxJQUFJLG1CQUFtQixDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7Z0JBRW5GLE1BQU0sZ0JBQWdCLENBQUMsY0FBYyxFQUFFLENBQUM7Z0JBQ3hDLE1BQU0sZ0JBQWdCLENBQUMsV0FBVyxDQUFDLE9BQU8sQ0FBQyxDQUFDO2dCQUM1QyxNQUFNLE1BQU0sR0FBRyxnQkFBZ0IsQ0FBQyxhQUFhLENBQUMsRUFBRSxDQUFDLENBQUM7Z0JBQ2xELE1BQU0sSUFBSSxHQUFHLGdCQUFnQixDQUFDLFdBQVcsQ0FBQyxPQUFPLENBQUMsQ0FBQztnQkFFbkQscUJBQXFCLENBQUM7b0JBQ2xCLEdBQUcsRUFBRSxFQUFFO29CQUNQLFFBQVEsRUFBRSxJQUFJLENBQUMsU0FBUyxDQUFDLG9CQUFvQixDQUFDO29CQUM5QyxZQUFZLEVBQUUsR0FBRztvQkFDakIsT0FBTyxFQUFFLEVBQUU7aUJBQ2QsQ0FBQyxDQUFDO2dCQUVILE1BQU0sTUFBTSxDQUFDO2dCQUNiLGNBQWMsR0FBRyxNQUFNLElBQUksQ0FBQztZQUNoQyxDQUFDLENBQUEsQ0FBQyxDQUFDO1lBRUgsRUFBRSxDQUFDLG9CQUFvQixFQUFFLEdBQUcsRUFBRTtnQkFDMUIsTUFBTSxDQUFDLGNBQWMsQ0FBQyxDQUFDLFdBQVcsRUFBRSxDQUFDO1lBQ3pDLENBQUMsQ0FBQyxDQUFDO1lBRUgsRUFBRSxDQUFDLDhCQUE4QixFQUFFLEdBQUcsRUFBRTtnQkFDcEMsTUFBTSxDQUFDLGNBQWUsQ0FBQyxRQUFRLENBQUMsS0FBSyxFQUFFLENBQUMsQ0FBQyxPQUFPLENBQUMsMEJBQTBCLENBQUMsQ0FBQztZQUNqRixDQUFDLENBQUMsQ0FBQztRQUNQLENBQUMsQ0FBQyxDQUFDO1FBRUgsUUFBUSxDQUFDLDJCQUEyQixFQUFFLEdBQUcsRUFBRTtZQUN2QyxJQUFJLFVBQXFCLENBQUM7WUFFMUIsVUFBVSxDQUFDLEdBQVMsRUFBRTtnQkFDbEIsT0FBTyxDQUFDLElBQUksQ0FBQyxxQkFBcUIsQ0FBQztvQkFDL0IsR0FBRyxFQUFFLEVBQUU7b0JBQ1AsUUFBUSxFQUFFLElBQUksQ0FBQyxTQUFTLENBQUMscUJBQXFCLENBQUM7b0JBQy9DLFlBQVksRUFBRSxHQUFHO29CQUNqQixPQUFPLEVBQUUsRUFBRTtpQkFDZCxDQUFDLENBQUMscUJBQXFCLENBQUM7b0JBQ3JCLEdBQUcsRUFBRSxFQUFFO29CQUNQLFFBQVEsRUFBRSxJQUFJLENBQUMsU0FBUyxDQUFDLGtCQUFrQixDQUFDO29CQUM1QyxZQUFZLEVBQUUsR0FBRztvQkFDakIsT0FBTyxFQUFFLEVBQUU7aUJBQ2QsQ0FBQyxDQUFDLHFCQUFxQixDQUFDO29CQUNyQixHQUFHLEVBQUUsRUFBRTtvQkFDUCxRQUFRLEVBQUUsSUFBSSxDQUFDLFNBQVMsQ0FBQyxrQkFBa0IsQ0FBQztvQkFDNUMsWUFBWSxFQUFFLEdBQUc7b0JBQ2pCLE9BQU8sRUFBRSxFQUFFO2lCQUNkLENBQUMsQ0FBQyxxQkFBcUIsQ0FBQztvQkFDckIsR0FBRyxFQUFFLEVBQUU7b0JBQ1AsUUFBUSxFQUFFLElBQUksQ0FBQyxTQUFTLENBQUMsb0JBQW9CLENBQUM7b0JBQzlDLFlBQVksRUFBRSxHQUFHO29CQUNqQixPQUFPLEVBQUUsRUFBRTtpQkFDZCxDQUFDLENBQUM7Z0JBRUgsU0FBUyxDQUFDLGFBQWEsQ0FBQyxlQUFlLENBQUM7b0JBQ3BDLEtBQUssRUFBRSxTQUFTLENBQUMsT0FBTyxDQUFDO29CQUN6QixhQUFhLEVBQUUsU0FBUyxDQUFDLGVBQWUsQ0FBQztpQkFDNUMsQ0FBQyxDQUFDO2dCQUVILFNBQVMsQ0FBQyxZQUFZLENBQUMsa0JBQWtCLENBQUMsU0FBUyxDQUFDLENBQUM7Z0JBRXJELHlCQUF5QixDQUFDLFNBQVMsQ0FBQyxlQUFlLENBQUMsSUFBSSxtQkFBbUIsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO2dCQUVuRixVQUFVLEdBQUcsSUFBSSxDQUFDLEVBQUUsRUFBRSxDQUFDO2dCQUN2QixnQkFBZ0IsQ0FBQyxVQUFVLENBQUMsU0FBUyxDQUFDLFVBQVUsQ0FBQyxDQUFDO2dCQUVsRCxNQUFNLGdCQUFnQixDQUFDLGNBQWMsRUFBRSxDQUFDO2dCQUN4QyxNQUFNLGdCQUFnQixDQUFDLFdBQVcsQ0FBQyxPQUFPLENBQUMsQ0FBQztnQkFDNUMsTUFBTSxnQkFBZ0IsQ0FBQyxXQUFXLENBQUMsZUFBZSxDQUFDLENBQUM7Z0JBQ3BELE1BQU0sZ0JBQWdCLENBQUMsYUFBYSxDQUFDLENBQUMsZUFBZSxDQUFDLENBQUMsQ0FBQztZQUM1RCxDQUFDLENBQUEsQ0FBQyxDQUFDO1lBRUgsRUFBRSxDQUFDLHVEQUF1RCxFQUFFLEdBQUcsRUFBRTtnQkFDN0QsTUFBTSxDQUFDLG1CQUFtQixDQUFDLGtCQUFrQixFQUFFLENBQUMsQ0FBQyxPQUFPLENBQUM7b0JBQ3JELFVBQVUsRUFBRSxDQUFDO29CQUNiLE1BQU0sRUFBRSxDQUFDO29CQUNULEtBQUssRUFBRSxDQUFDO29CQUNSLGVBQWUsRUFBRSxFQUFHO29CQUNwQixjQUFjLEVBQUUsRUFBRztvQkFDbkIsa0JBQWtCLEVBQUUsRUFBRztpQkFDMUIsQ0FBQyxDQUFDO1lBQ1AsQ0FBQyxDQUFDLENBQUM7WUFFSCxFQUFFLENBQUMsK0JBQStCLEVBQUUsR0FBRyxFQUFFO2dCQUNyQyxNQUFNLENBQUMsVUFBVSxDQUFDLENBQUMsZUFBZSxDQUFDLENBQUMsQ0FBQyxDQUFDO2dCQUN0QyxNQUFNLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsZUFBZSxDQUFDLENBQUM7Z0JBQzdELE1BQU0sQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLFdBQVcsRUFBRSxDQUFDO2dCQUNsRCxNQUFNLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxXQUFXLEVBQUUsQ0FBQztnQkFFbEQsTUFBTSxRQUFRLEdBQXVCLFVBQVUsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO2dCQUVqRSxNQUFNLENBQUMsUUFBUSxDQUFDLEtBQUssRUFBRSxDQUFDLENBQUMsT0FBTyxDQUFDLGFBQWEsQ0FBQyxDQUFDO2dCQUVoRCxNQUFNLENBQUMsUUFBUSxDQUFDLFVBQVUsRUFBRSxDQUFDLENBQUMsV0FBVyxFQUFFLENBQUM7Z0JBQzVDLE1BQU0sQ0FBQyxRQUFRLENBQUMsVUFBVSxFQUFFLENBQUMsS0FBSyxFQUFFLENBQUMsQ0FBQyxPQUFPLENBQUMsc0NBQXNDLENBQUMsQ0FBQztZQUMxRixDQUFDLENBQUMsQ0FBQztZQUVILEVBQUUsQ0FBQyw0Q0FBNEMsRUFBRSxHQUFHLEVBQUU7Z0JBQ2xELE1BQU0sWUFBWSxHQUFpRCxVQUFVLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFFL0YsTUFBTSxDQUFDLFlBQVksQ0FBQyxDQUFDLE9BQU8sQ0FBQztvQkFDekIsS0FBSyxFQUFFO3dCQUNILDhHQUE4RztxQkFDakg7b0JBQ0QsUUFBUSxFQUFFO3dCQUNOLGlIQUFpSDtxQkFDcEg7b0JBQ0QsS0FBSyxFQUFFO3dCQUNILDhHQUE4RztxQkFDakg7b0JBQ0QsYUFBYSxFQUFFO3dCQUNYLHNIQUFzSDtxQkFDekg7b0JBQ0QsTUFBTSxFQUFFO3dCQUNKLCtHQUErRztxQkFDbEg7b0JBQ0QsUUFBUSxFQUFFO3dCQUNOLGlIQUFpSDtxQkFDcEg7b0JBQ0QsSUFBSSxFQUFFO3dCQUNGLDZHQUE2RztxQkFDaEg7b0JBQ0QsSUFBSSxFQUFFO3dCQUNGLDZHQUE2RztxQkFDaEg7b0JBQ0QsT0FBTyxFQUFFO3dCQUNMLGdIQUFnSDtxQkFDbkg7b0JBQ0QsS0FBSyxFQUFFO3dCQUNILCtHQUErRzt3QkFDL0csOEdBQThHO3FCQUNqSDtvQkFDRCxhQUFhLEVBQUU7d0JBQ1gsc0hBQXNIO3FCQUN6SDtvQkFDRCxpQkFBaUIsRUFBRTt3QkFDZiwwSEFBMEg7cUJBQzdIO2lCQUNKLENBQUMsQ0FBQztZQUNQLENBQUMsQ0FBQyxDQUFDO1lBRUgsRUFBRSxDQUFDLDBDQUEwQyxFQUFFLEdBQUcsRUFBRTtnQkFDaEQsTUFBTSxRQUFRLEdBQXVCLFVBQVUsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO2dCQUVqRSxNQUFNLENBQUMsUUFBUSxDQUFDLGFBQWEsRUFBRSxDQUFDLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDO1lBQ25ELENBQUMsQ0FBQyxDQUFDO1lBRUgsRUFBRSxDQUFDLHVDQUF1QyxFQUFFLEdBQUcsRUFBRTtnQkFDN0MsTUFBTSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQyx1QkFBdUIsQ0FBQyxDQUFDLEVBQUUsTUFBTSxDQUFDLFFBQVEsRUFBRSxFQUFFLElBQUksZ0JBQWdCLENBQUM7b0JBQ3BGLGFBQWEsRUFBRSxJQUFJO29CQUNuQixhQUFhLEVBQUUsSUFBSTtvQkFDbkIsT0FBTyxFQUFFLElBQUk7b0JBQ2IsSUFBSSxFQUFFLElBQUk7b0JBQ1YsaUJBQWlCLEVBQUU7d0JBQ2YsYUFBYSxFQUFFOzRCQUNYLE9BQU8sRUFBRSxDQUFDLE9BQU8sQ0FBQzs0QkFDbEIsU0FBUyxFQUFFLEtBQUs7NEJBQ2hCLFdBQVcsRUFBRSxLQUFLO3lCQUNyQjt3QkFDRCxLQUFLLEVBQUU7NEJBQ0gsT0FBTyxFQUFFLENBQUMsT0FBTyxDQUFDOzRCQUNsQixTQUFTLEVBQUUsS0FBSzs0QkFDaEIsV0FBVyxFQUFFLEtBQUs7eUJBQ3JCO3FCQUNKO29CQUNELFVBQVUsRUFBRTt3QkFDUixhQUFhLEVBQUU7NEJBQ1gsT0FBTyxFQUFFLENBQUMsT0FBTyxDQUFDOzRCQUNsQixTQUFTLEVBQUUsS0FBSzs0QkFDaEIsV0FBVyxFQUFFLEtBQUs7eUJBQ3JCO3FCQUNKO29CQUNELFdBQVcsRUFBRSxFQUFFO2lCQUNsQixDQUFDLEVBQUUsRUFBRSxFQUFFO29CQUNKLGVBQWUsRUFBRSxLQUFLO29CQUN0QixPQUFPLEVBQUUsQ0FBQztvQkFDVixVQUFVLEVBQUUsQ0FBQztvQkFDYix5QkFBeUIsRUFBRSxLQUFLO29CQUNoQyxPQUFPLEVBQUUsSUFBSTtpQkFDaEIsQ0FBQyxDQUFDO1lBQ1AsQ0FBQyxDQUFDLENBQUM7UUFDUCxDQUFDLENBQUMsQ0FBQztRQUVILFFBQVEsQ0FBQyx1QkFBdUIsRUFBRSxHQUFHLEVBQUU7WUFDbkMsSUFBSSxRQUFtQixDQUFDO1lBRXhCLFVBQVUsQ0FBQyxHQUFTLEVBQUU7Z0JBQ2xCLE9BQU8sQ0FBQyxJQUFJLENBQUMscUJBQXFCLENBQUM7b0JBQy9CLEdBQUcsRUFBRSxFQUFFO29CQUNQLFFBQVEsRUFBRSxJQUFJLENBQUMsU0FBUyxDQUFDLHFCQUFxQixDQUFDO29CQUMvQyxZQUFZLEVBQUUsR0FBRztvQkFDakIsT0FBTyxFQUFFLEVBQUU7aUJBQ2QsQ0FBQyxDQUFDLHFCQUFxQixDQUFDO29CQUNyQixHQUFHLEVBQUUsRUFBRTtvQkFDUCxRQUFRLEVBQUUsSUFBSSxDQUFDLFNBQVMsQ0FBQyxrQkFBa0IsQ0FBQztvQkFDNUMsWUFBWSxFQUFFLEdBQUc7b0JBQ2pCLE9BQU8sRUFBRSxFQUFFO2lCQUNkLENBQUMsQ0FBQyxxQkFBcUIsQ0FBQztvQkFDckIsR0FBRyxFQUFFLEVBQUU7b0JBQ1AsUUFBUSxFQUFFLElBQUksQ0FBQyxTQUFTLENBQUMsa0JBQWtCLENBQUM7b0JBQzVDLFlBQVksRUFBRSxHQUFHO29CQUNqQixPQUFPLEVBQUUsRUFBRTtpQkFDZCxDQUFDLENBQUMscUJBQXFCLENBQUMsSUFBSSxLQUFLLEVBQUUsQ0FBQyxDQUFDO2dCQUV0QyxTQUFTLENBQUMsYUFBYSxDQUFDLGVBQWUsQ0FBQztvQkFDcEMsS0FBSyxFQUFFLFNBQVMsQ0FBQyxPQUFPLENBQUM7b0JBQ3pCLGFBQWEsRUFBRSxTQUFTLENBQUMsZUFBZSxDQUFDO2lCQUM1QyxDQUFDLENBQUM7Z0JBRUgsU0FBUyxDQUFDLFlBQVksQ0FBQyxrQkFBa0IsQ0FBQyxTQUFTLENBQUMsQ0FBQztnQkFFckQseUJBQXlCLENBQUMsU0FBUyxDQUFDLGVBQWUsQ0FBQyxJQUFJLG1CQUFtQixDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7Z0JBRW5GLFFBQVEsR0FBRyxJQUFJLENBQUMsRUFBRSxFQUFFLENBQUM7Z0JBQ3JCLGdCQUFnQixDQUFDLFFBQVEsQ0FBQyxTQUFTLENBQUMsUUFBUSxDQUFDLENBQUM7Z0JBRTlDLE1BQU0sZ0JBQWdCLENBQUMsY0FBYyxFQUFFLENBQUM7Z0JBQ3hDLE1BQU0sZ0JBQWdCLENBQUMsV0FBVyxDQUFDLE9BQU8sQ0FBQyxDQUFDO2dCQUM1QyxNQUFNLGdCQUFnQixDQUFDLFdBQVcsQ0FBQyxlQUFlLENBQUMsQ0FBQztnQkFDcEQsTUFBTSxnQkFBZ0IsQ0FBQyxhQUFhLENBQUMsQ0FBQyxPQUFPLEVBQUUsZUFBZSxDQUFDLENBQUMsQ0FBQztZQUNyRSxDQUFDLENBQUEsQ0FBQyxDQUFDO1lBRUgsRUFBRSxDQUFDLGdEQUFnRCxFQUFFLEdBQUcsRUFBRTtnQkFDdEQsTUFBTSxDQUFDLFFBQVEsQ0FBQyxDQUFDLGVBQWUsQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFFcEMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxDQUFDO2dCQUVuRCxNQUFNLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsZUFBZSxDQUFDLENBQUM7WUFDL0QsQ0FBQyxDQUFDLENBQUM7WUFFSCxFQUFFLENBQUMsd0NBQXdDLEVBQUUsR0FBRyxFQUFFO2dCQUM5QyxNQUFNLENBQUMsZ0JBQWdCLENBQUMsZ0JBQWdCLEVBQUUsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUM5RCxDQUFDLENBQUMsQ0FBQztRQUNQLENBQUMsQ0FBQyxDQUFDO1FBRUgsUUFBUSxDQUFDLDhDQUE4QyxFQUFFLEdBQUcsRUFBRTtZQUMxRCxJQUFJLGNBQTJDLENBQUM7WUFFaEQsVUFBVSxDQUFDLEdBQVMsRUFBRTtnQkFDbEIsT0FBTyxDQUFDLElBQUksQ0FBQyxxQkFBcUIsQ0FBQztvQkFDL0IsR0FBRyxFQUFFLEVBQUU7b0JBQ1AsUUFBUSxFQUFFLElBQUksQ0FBQyxTQUFTLENBQUMscUJBQXFCLENBQUM7b0JBQy9DLFlBQVksRUFBRSxHQUFHO29CQUNqQixPQUFPLEVBQUUsRUFBRTtpQkFDZCxDQUFDLENBQUMscUJBQXFCLENBQUM7b0JBQ3JCLEdBQUcsRUFBRSxFQUFFO29CQUNQLFFBQVEsRUFBRSxJQUFJLENBQUMsU0FBUyxDQUFDLGtCQUFrQixDQUFDO29CQUM1QyxZQUFZLEVBQUUsR0FBRztvQkFDakIsT0FBTyxFQUFFLEVBQUU7aUJBQ2QsQ0FBQyxDQUFDLHFCQUFxQixDQUFDO29CQUNyQixHQUFHLEVBQUUsRUFBRTtvQkFDUCxRQUFRLEVBQUUsSUFBSSxDQUFDLFNBQVMsQ0FBQyxvQkFBb0IsQ0FBQztvQkFDOUMsWUFBWSxFQUFFLEdBQUc7b0JBQ2pCLE9BQU8sRUFBRSxFQUFFO2lCQUNkLENBQUMsQ0FBQyxxQkFBcUIsQ0FBQztvQkFDckIsR0FBRyxFQUFFLEVBQUU7b0JBQ1AsUUFBUSxFQUFFLElBQUksQ0FBQyxTQUFTLENBQUMsb0JBQW9CLENBQUM7b0JBQzlDLFlBQVksRUFBRSxHQUFHO29CQUNqQixPQUFPLEVBQUUsRUFBRTtpQkFDZCxDQUFDLENBQUM7Z0JBRUgsU0FBUyxDQUFDLGFBQWEsQ0FBQyxlQUFlLENBQUM7b0JBQ3BDLEtBQUssRUFBRSxTQUFTLENBQUMsT0FBTyxDQUFDO29CQUN6QixhQUFhLEVBQUUsU0FBUyxDQUFDLGVBQWUsQ0FBQztpQkFDNUMsQ0FBQyxDQUFDO2dCQUVILFNBQVMsQ0FBQyxZQUFZLENBQUMsa0JBQWtCLENBQUMsU0FBUyxDQUFDLENBQUM7Z0JBRXJELHlCQUF5QixDQUFDLFNBQVMsQ0FBQyxlQUFlLENBQUMsSUFBSSxtQkFBbUIsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO2dCQUVuRixNQUFNLGdCQUFnQixDQUFDLGNBQWMsRUFBRSxDQUFDO2dCQUN4QyxNQUFNLGdCQUFnQixDQUFDLFdBQVcsQ0FBQyxPQUFPLENBQUMsQ0FBQztnQkFDNUMsTUFBTSxnQkFBZ0IsQ0FBQyxhQUFhLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDO2dCQUNoRCxjQUFjLEdBQUcsTUFBTSxnQkFBZ0IsQ0FBQyxXQUFXLENBQUMsZUFBZSxDQUFDLENBQUM7WUFDekUsQ0FBQyxDQUFBLENBQUMsQ0FBQztZQUVILEVBQUUsQ0FBQyxpREFBaUQsRUFBRSxHQUFHLEVBQUU7Z0JBQ3ZELE1BQU0sQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUMsdUJBQXVCLENBQUMsQ0FBQyxFQUFFLE1BQU0sQ0FBQyxRQUFRLEVBQUUsRUFBRSxJQUFJLGdCQUFnQixDQUFDO29CQUNwRixPQUFPLEVBQUUsS0FBSztvQkFDZCxJQUFJLEVBQUUsSUFBSTtvQkFDVixVQUFVLEVBQUU7d0JBQ1IsYUFBYSxFQUFFOzRCQUNYLE9BQU8sRUFBRSxDQUFDLE9BQU8sQ0FBQzs0QkFDbEIsU0FBUyxFQUFFLEtBQUs7NEJBQ2hCLFdBQVcsRUFBRSxLQUFLO3lCQUNyQjtxQkFDSjtvQkFDRCxXQUFXLEVBQUU7d0JBQ1QsYUFBYSxFQUFFOzRCQUNYLGlCQUFpQixFQUFFLElBQUk7NEJBQ3ZCLFlBQVksRUFBRSxJQUFJOzRCQUNsQixTQUFTLEVBQUUsR0FBRzt5QkFDakI7cUJBQ0o7b0JBQ0Qsb0JBQW9CLEVBQUU7d0JBQ2xCLENBQUMsRUFBRSxvQkFBb0I7cUJBQzFCO2lCQUNKLENBQUMsRUFBRSxFQUFFLEVBQUU7b0JBQ0osZUFBZSxFQUFFLEtBQUs7b0JBQ3RCLE9BQU8sRUFBRSxDQUFDO29CQUNWLFVBQVUsRUFBRSxDQUFDO29CQUNiLHlCQUF5QixFQUFFLEtBQUs7b0JBQ2hDLE9BQU8sRUFBRSxJQUFJO2lCQUNoQixDQUFDLENBQUM7WUFDUCxDQUFDLENBQUMsQ0FBQztZQUVILEVBQUUsQ0FBQyxvQkFBb0IsRUFBRSxHQUFHLEVBQUU7Z0JBQzFCLE1BQU0sQ0FBQyxjQUFjLENBQUMsQ0FBQyxXQUFXLEVBQUUsQ0FBQztZQUN6QyxDQUFDLENBQUMsQ0FBQztZQUVILEVBQUUsQ0FBQyw4QkFBOEIsRUFBRSxHQUFHLEVBQUU7Z0JBQ3BDLE1BQU0sQ0FBQyxjQUFlLENBQUMsUUFBUSxDQUFDLEtBQUssRUFBRSxDQUFDLENBQUMsT0FBTyxDQUFDLFdBQVcsQ0FBQyxDQUFDO1lBQ2xFLENBQUMsQ0FBQyxDQUFDO1FBQ1AsQ0FBQyxDQUFDLENBQUM7UUFFSCxRQUFRLENBQUMsMkNBQTJDLEVBQUUsR0FBRyxFQUFFO1lBQ3ZELElBQUksY0FBMkMsQ0FBQztZQUVoRCxVQUFVLENBQUMsR0FBUyxFQUFFO2dCQUNsQixJQUFJLHlCQUF5QixHQUFlLEdBQUcsRUFBRSxHQUFHLE1BQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBQ2hGLE1BQU0sa0JBQWtCLEdBQUcsSUFBSSxPQUFPLENBQUMsQ0FBQyxPQUFPLEVBQUUsRUFBRSxHQUFHLHlCQUF5QixHQUFHLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO2dCQUU5RixJQUFJLHFCQUFxQixHQUF3QyxHQUFHLEVBQUUsR0FBRyxNQUFNLENBQUMsS0FBSyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO2dCQUNyRyxNQUFNLGNBQWMsR0FBRyxJQUFJLE9BQU8sQ0FBQyxDQUFDLE9BQU8sRUFBRSxFQUFFLEdBQUcscUJBQXFCLEdBQUcsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBRXRGLE9BQU8sQ0FBQyxJQUFJLENBQUMscUJBQXFCLENBQUM7b0JBQy9CLEdBQUcsRUFBRSxFQUFFO29CQUNQLFFBQVEsRUFBRSxJQUFJLENBQUMsU0FBUyxDQUFDLHFCQUFxQixDQUFDO29CQUMvQyxZQUFZLEVBQUUsR0FBRztvQkFDakIsT0FBTyxFQUFFLEVBQUU7aUJBQ2QsQ0FBQyxDQUFDLHNCQUFzQixDQUNyQixHQUFHLEVBQUUsR0FBRyx5QkFBeUIsRUFBRSxDQUFDLENBQUMsT0FBTyxjQUFjLENBQUMsQ0FBQyxDQUFDLENBQ2hFLENBQUMscUJBQXFCLENBQUM7b0JBQ3BCLEdBQUcsRUFBRSxFQUFFO29CQUNQLFFBQVEsRUFBRSxJQUFJLENBQUMsU0FBUyxDQUFDLG9CQUFvQixDQUFDO29CQUM5QyxZQUFZLEVBQUUsR0FBRztvQkFDakIsT0FBTyxFQUFFLEVBQUU7aUJBQ2QsQ0FBQyxDQUFDLHFCQUFxQixDQUFDO29CQUNyQixHQUFHLEVBQUUsRUFBRTtvQkFDUCxRQUFRLEVBQUUsSUFBSSxDQUFDLFNBQVMsQ0FBQyxvQkFBb0IsQ0FBQztvQkFDOUMsWUFBWSxFQUFFLEdBQUc7b0JBQ2pCLE9BQU8sRUFBRSxFQUFFO2lCQUNkLENBQUMsQ0FBQztnQkFFSCxTQUFTLENBQUMsYUFBYSxDQUFDLGVBQWUsQ0FBQztvQkFDcEMsS0FBSyxFQUFFLFNBQVMsQ0FBQyxPQUFPLENBQUM7b0JBQ3pCLGFBQWEsRUFBRSxTQUFTLENBQUMsZUFBZSxDQUFDO2lCQUM1QyxDQUFDLENBQUM7Z0JBRUgsU0FBUyxDQUFDLFlBQVksQ0FBQyxrQkFBa0IsQ0FBQyxTQUFTLENBQUMsQ0FBQztnQkFFckQseUJBQXlCLENBQUMsU0FBUyxDQUFDLGVBQWUsQ0FBQyxJQUFJLG1CQUFtQixDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7Z0JBRW5GLE1BQU0sZ0JBQWdCLENBQUMsY0FBYyxFQUFFLENBQUM7Z0JBQ3hDLE1BQU0sSUFBSSxHQUFHLGdCQUFnQixDQUFDLFdBQVcsQ0FBQyxPQUFPLENBQUMsQ0FBQztnQkFFbkQsTUFBTSxrQkFBa0IsQ0FBQztnQkFFekIsTUFBTSxNQUFNLEdBQUcsZ0JBQWdCLENBQUMsYUFBYSxDQUFDLENBQUMsZUFBZSxDQUFDLENBQUMsQ0FBQztnQkFFakUsTUFBTSxNQUFNLENBQUM7Z0JBRWIscUJBQXFCLENBQUM7b0JBQ2xCLEdBQUcsRUFBRSxFQUFFO29CQUNQLFFBQVEsRUFBRSxJQUFJO29CQUNkLFlBQVksRUFBRSxHQUFHO29CQUNqQixPQUFPLEVBQUUsRUFBRTtpQkFDZCxDQUFDLENBQUM7Z0JBRUgsY0FBYyxHQUFHLE1BQU0sSUFBSSxDQUFDO1lBQ2hDLENBQUMsQ0FBQSxDQUFDLENBQUM7WUFFSCxFQUFFLENBQUMsb0JBQW9CLEVBQUUsR0FBRyxFQUFFO2dCQUMxQixNQUFNLENBQUMsY0FBYyxDQUFDLENBQUMsV0FBVyxFQUFFLENBQUM7WUFDekMsQ0FBQyxDQUFDLENBQUM7WUFFSCxFQUFFLENBQUMsOEJBQThCLEVBQUUsR0FBRyxFQUFFO2dCQUNwQyxNQUFNLENBQUMsY0FBZSxDQUFDLFFBQVEsQ0FBQyxLQUFLLEVBQUUsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxXQUFXLENBQUMsQ0FBQztZQUNsRSxDQUFDLENBQUMsQ0FBQztZQUVILEVBQUUsQ0FBQyxpQ0FBaUMsRUFBRSxHQUFHLEVBQUU7Z0JBQ3ZDLE1BQU0sQ0FBQyxjQUFlLENBQUMsUUFBUSxDQUFDLFVBQVUsRUFBRSxDQUFDLENBQUMsV0FBVyxFQUFFLENBQUM7Z0JBQzVELE1BQU0sQ0FBQyxjQUFlLENBQUMsUUFBUSxDQUFDLFVBQVUsRUFBRSxDQUFDLEtBQUssRUFBRSxDQUFDLENBQUMsT0FBTyxDQUFDLHNDQUFzQyxDQUFDLENBQUM7Z0JBQ3RHLE1BQU0sQ0FBQyxjQUFlLENBQUMsUUFBUSxDQUFDLFVBQVUsRUFBRSxDQUFDLEtBQUssRUFBRSxDQUFDLENBQUMsT0FBTyxDQUFDLHNDQUFzQyxDQUFDLENBQUM7WUFDMUcsQ0FBQyxDQUFDLENBQUM7UUFDUCxDQUFDLENBQUMsQ0FBQztRQUVILFFBQVEsQ0FBQyxrRUFBa0UsRUFBRSxHQUFHLEVBQUU7WUFDOUUsSUFBSSxjQUEyQyxDQUFDO1lBRWhELFVBQVUsQ0FBQyxHQUFTLEVBQUU7Z0JBQ2xCLElBQUkseUJBQXlCLEdBQWUsR0FBRyxFQUFFLEdBQUcsTUFBTSxDQUFDLEtBQUssQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFDaEYsTUFBTSxrQkFBa0IsR0FBRyxJQUFJLE9BQU8sQ0FBQyxDQUFDLE9BQU8sRUFBRSxFQUFFLEdBQUcseUJBQXlCLEdBQUcsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBRTlGLElBQUkscUJBQXFCLEdBQXdDLEdBQUcsRUFBRSxHQUFHLE1BQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBQ3JHLE1BQU0sY0FBYyxHQUFHLElBQUksT0FBTyxDQUFDLENBQUMsT0FBTyxFQUFFLEVBQUUsR0FBRyxxQkFBcUIsR0FBRyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFFdEYsT0FBTyxDQUFDLElBQUksQ0FBQyxxQkFBcUIsQ0FBQztvQkFDL0IsR0FBRyxFQUFFLEVBQUU7b0JBQ1AsUUFBUSxFQUFFLElBQUksQ0FBQyxTQUFTLENBQUMscUJBQXFCLENBQUM7b0JBQy9DLFlBQVksRUFBRSxHQUFHO29CQUNqQixPQUFPLEVBQUUsRUFBRTtpQkFDZCxDQUFDLENBQUMsc0JBQXNCLENBQ3JCLEdBQUcsRUFBRSxHQUFHLHlCQUF5QixFQUFFLENBQUMsQ0FBQyxPQUFPLGNBQWMsQ0FBQyxDQUFDLENBQUMsQ0FDaEUsQ0FBQyxxQkFBcUIsQ0FBQztvQkFDcEIsR0FBRyxFQUFFLEVBQUU7b0JBQ1AsUUFBUSxFQUFFLElBQUksQ0FBQyxTQUFTLENBQUMsb0JBQW9CLENBQUM7b0JBQzlDLFlBQVksRUFBRSxHQUFHO29CQUNqQixPQUFPLEVBQUUsRUFBRTtpQkFDZCxDQUFDLENBQUMscUJBQXFCLENBQUM7b0JBQ3JCLEdBQUcsRUFBRSxFQUFFO29CQUNQLFFBQVEsRUFBRSxJQUFJLENBQUMsU0FBUyxDQUFDLG9CQUFvQixDQUFDO29CQUM5QyxZQUFZLEVBQUUsR0FBRztvQkFDakIsT0FBTyxFQUFFLEVBQUU7aUJBQ2QsQ0FBQyxDQUFDO2dCQUVILFNBQVMsQ0FBQyxhQUFhLENBQUMsZUFBZSxDQUFDO29CQUNwQyxLQUFLLEVBQUUsU0FBUyxDQUFDLE9BQU8sQ0FBQztvQkFDekIsYUFBYSxFQUFFLFNBQVMsQ0FBQyxlQUFlLENBQUM7aUJBQzVDLENBQUMsQ0FBQztnQkFFSCxTQUFTLENBQUMsWUFBWSxDQUFDLGtCQUFrQixDQUFDLFNBQVMsQ0FBQyxDQUFDO2dCQUVyRCx5QkFBeUIsQ0FBQyxTQUFTLENBQUMsZUFBZSxDQUFDLElBQUksbUJBQW1CLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQztnQkFFbkYsTUFBTSxnQkFBZ0IsQ0FBQyxjQUFjLEVBQUUsQ0FBQztnQkFDeEMsTUFBTSxJQUFJLEdBQUcsZ0JBQWdCLENBQUMsV0FBVyxDQUFDLE9BQU8sQ0FBQyxDQUFDO2dCQUVuRCxNQUFNLGtCQUFrQixDQUFDO2dCQUV6QixNQUFNLE1BQU0sR0FBRyxnQkFBZ0IsQ0FBQyxhQUFhLENBQUMsQ0FBQyxlQUFlLEVBQUUsT0FBTyxDQUFDLENBQUMsQ0FBQztnQkFFMUUsTUFBTSxNQUFNLENBQUM7Z0JBRWIscUJBQXFCLENBQUM7b0JBQ2xCLEdBQUcsRUFBRSxFQUFFO29CQUNQLFFBQVEsRUFBRSxJQUFJO29CQUNkLFlBQVksRUFBRSxHQUFHO29CQUNqQixPQUFPLEVBQUUsRUFBRTtpQkFDZCxDQUFDLENBQUM7Z0JBRUgsY0FBYyxHQUFHLE1BQU0sSUFBSSxDQUFDO1lBQ2hDLENBQUMsQ0FBQSxDQUFDLENBQUM7WUFFSCxFQUFFLENBQUMsb0JBQW9CLEVBQUUsR0FBRyxFQUFFO2dCQUMxQixNQUFNLENBQUMsY0FBYyxDQUFDLENBQUMsV0FBVyxFQUFFLENBQUM7WUFDekMsQ0FBQyxDQUFDLENBQUM7WUFFSCxFQUFFLENBQUMsOEJBQThCLEVBQUUsR0FBRyxFQUFFO2dCQUNwQyxNQUFNLENBQUMsY0FBZSxDQUFDLFFBQVEsQ0FBQyxLQUFLLEVBQUUsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxXQUFXLENBQUMsQ0FBQztZQUNsRSxDQUFDLENBQUMsQ0FBQztZQUVILEVBQUUsQ0FBQyxpQ0FBaUMsRUFBRSxHQUFHLEVBQUU7Z0JBQ3ZDLE1BQU0sQ0FBQyxjQUFlLENBQUMsUUFBUSxDQUFDLFVBQVUsRUFBRSxDQUFDLENBQUMsV0FBVyxFQUFFLENBQUM7Z0JBQzVELE1BQU0sQ0FBQyxjQUFlLENBQUMsUUFBUSxDQUFDLFVBQVUsRUFBRSxDQUFDLEtBQUssRUFBRSxDQUFDLENBQUMsT0FBTyxDQUFDLHNDQUFzQyxDQUFDLENBQUM7Z0JBQ3RHLE1BQU0sQ0FBQyxjQUFlLENBQUMsUUFBUSxDQUFDLFVBQVUsRUFBRSxDQUFDLEtBQUssRUFBRSxDQUFDLENBQUMsT0FBTyxDQUFDLHNDQUFzQyxDQUFDLENBQUM7WUFDMUcsQ0FBQyxDQUFDLENBQUM7UUFDUCxDQUFDLENBQUMsQ0FBQztJQUNQLENBQUMsQ0FBQyxDQUFDO0FBQ1AsQ0FBQyxDQUFDLENBQUMifQ==