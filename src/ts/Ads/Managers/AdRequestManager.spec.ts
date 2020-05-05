import { Platform } from 'Core/Constants/Platform';
import { AdRequestManager } from 'Ads/Managers/AdRequestManager';
import { Core } from 'Core/__mocks__/Core';
import { ICore } from 'Core/ICore';
import { CoreConfigurationMock, CoreConfiguration } from 'Core/Models/__mocks__/CoreConfiguration';
import { AdsConfigurationMock, AdsConfiguration } from 'Ads/Models/__mocks__/AdsConfiguration';
import { AssetManagerMock, AssetManager } from 'Ads/Managers/__mocks__/AssetManager';
import { SessionManagerMock, SessionManager } from 'Ads/Managers/__mocks__/SessionManager';
import { AdMobSignalFactoryMock, AdMobSignalFactory } from 'AdMob/Utilities/__mocks__/AdMobSignalFactory';
import { RequestManagerMock, RequestManager } from 'Core/Managers/__mocks__/RequestManager';
import { ClientInfoMock, ClientInfo } from 'Core/Models/__mocks__/ClientInfo';
import { DeviceInfoMock, DeviceInfo } from 'Core/Models/__mocks__/DeviceInfo';
import { MetaDataManagerMock, MetaDataManager } from 'Core/Managers/__mocks__/MetaDataManager';
import { CacheBookkeepingManagerMock, CacheBookkeepingManager } from 'Core/Managers/__mocks__/CacheBookkeepingManager';
import { ContentTypeHandlerManagerMock, ContentTypeHandlerManager } from 'Ads/Managers/__mocks__/ContentTypeHandlerManager';
import { PrivacySDKMock, PrivacySDK } from 'Privacy/__mocks__/PrivacySDK';
import { UserPrivacyManagerMock, UserPrivacyManager } from 'Ads/Managers/__mocks__/UserPrivacyManager';
import { GameSessionCounters } from 'Ads/Utilities/GameSessionCounters';
import { ILoadedCampaign } from 'Ads/Managers/CampaignManager';
import { Placement } from 'Ads/Models/__mocks__/Placement';
import { CometCampaignParser } from 'Performance/Parsers/CometCampaignParser';
import { INativeResponse } from 'Core/Managers/RequestManager';
import { Campaign } from 'Ads/Models/Campaign';
import { SDKMetrics, LoadV5 } from 'Ads/Utilities/SDKMetrics';

// eslint-disable-next-line
const LoadV5PreloadResponse = require('json/LoadV5PreloadResponse.json');
// eslint-disable-next-line
const LoadV5PreloadResponse_NoFill = require('json/LoadV5PreloadResponse_NoFill.json');
// eslint-disable-next-line
const LoadV5LoadResponse = require('json/LoadV5LoadResponse.json');
// eslint-disable-next-line
const LoadV5LoadResponse_2 = require('json/LoadV5LoadResponse_2.json');
// eslint-disable-next-line
const LoadV5LoadResponse_NoFill = require('json/LoadV5LoadResponse_NoFill.json');
// eslint-disable-next-line
const LoadV5ReloadResponse = require('json/LoadV5ReloadResponse.json');

class SatisfiesMatcher {
    private object: object;

    constructor(object: object) {
        this.object = object;
    }

    public asymmetricMatch(other: string): boolean {
        expect(JSON.parse(other)).toMatchObject(this.object);
        return true;
    }
}

[Platform.ANDROID, Platform.IOS].forEach((platform) => {
    describe(`AdRequestManagerTest(${Platform[platform]})`, () => {
        let adRequestManager: AdRequestManager;
        let core: ICore;
        let coreConfig: CoreConfigurationMock;
        let adsConfig: AdsConfigurationMock;
        let assetManager: AssetManagerMock;
        let sessionManager: SessionManagerMock;
        let adMobSignalFactory: AdMobSignalFactoryMock;
        let request: RequestManagerMock;
        let clientInfo: ClientInfoMock;
        let deviceInfo: DeviceInfoMock;
        let metaDataManager: MetaDataManagerMock;
        let cacheBookkeeping: CacheBookkeepingManagerMock;
        let contentTypeHandlerManager: ContentTypeHandlerManagerMock;
        let privacySDK: PrivacySDKMock;
        let userPrivacyManager: UserPrivacyManagerMock;

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
            adRequestManager = new AdRequestManager(platform, core, coreConfig, adsConfig, assetManager, sessionManager, adMobSignalFactory, request, clientInfo, deviceInfo, metaDataManager, cacheBookkeeping, contentTypeHandlerManager, privacySDK, userPrivacyManager);
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
            beforeEach(async () => {
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
                await adRequestManager.requestPreload();
            });

            it('should have correct request', () => {
                expect(request.post).toHaveBeenCalledTimes(1);
                expect(request.post).toHaveBeenLastCalledWith(expect.anything(), new SatisfiesMatcher({
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
                    retries: 0,
                    retryDelay: 10000,
                    retryWithConnectionEvents: false
                });
            });

            it('should increase request count in game session counter', () => {
                expect(GameSessionCounters.getCurrentCounters()).toEqual({
                    adRequests: 1,
                    starts: 0,
                    views: 0,
                    startsPerTarget: { },
                    viewsPerTarget: { },
                    latestTargetStarts: { }
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
            beforeEach(async () => {
                adsConfig.getPlacements.mockReturnValue({
                    video: Placement(),
                    rewardedVideo: Placement()
                });
                let requestPromiseResolve: (response: INativeResponse) => void = () => { expect(false).toBe(true); };
                const requestPromise = new Promise((resolve) => { requestPromiseResolve = resolve; });

                request.post.mockImplementationOnce(
                    () => requestPromise
                );

                adRequestManager.requestPreload();
                const promise = adRequestManager.requestPreload();

                requestPromiseResolve({
                    url: '',
                    response: JSON.stringify(LoadV5PreloadResponse),
                    responseCode: 200,
                    headers: []
                });

                await promise;
            });

            it('should increase request count in game session counter', () => {
                expect(GameSessionCounters.getCurrentCounters()).toEqual({
                    adRequests: 1,
                    starts: 0,
                    views: 0,
                    startsPerTarget: { },
                    viewsPerTarget: { },
                    latestTargetStarts: { }
                });
            });
        });

        describe('failed preload request', () => {
            beforeEach(async () => {
                request.post.mockRejectedValueOnce(
                    new Error()
                );

                adsConfig.getPlacement.mockReturnValue(Placement());

                contentTypeHandlerManager.getParser.mockReturnValue(new CometCampaignParser(core));

                try {
                    await adRequestManager.requestPreload();
                } catch (err) {
                    // no-op
                }
            });

            it('should return true in hasPreloadFailed', () => {
                expect(adRequestManager.hasPreloadFailed()).toEqual(true);
            });
        });

        describe('successful load request', () => {
            let loadedCampaign1: ILoadedCampaign | undefined;
            let loadedCampaign2: ILoadedCampaign | undefined;

            beforeEach(async () => {
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

                adsConfig.getPlacement.mockReturnValue(Placement());

                contentTypeHandlerManager.getParser.mockReturnValue(new CometCampaignParser(core));

                await adRequestManager.requestPreload();
                loadedCampaign1 = await adRequestManager.requestLoad('video');
                loadedCampaign2 = await adRequestManager.requestLoad('rewardedVideo');
            });

            it('should send fill metric', () => {
                expect(SDKMetrics.reportMetricEvent).toBeCalledWith(LoadV5.LoadRequestFill);
            });

            it('should not increase request count in game session counter', () => {
                expect(GameSessionCounters.getCurrentCounters()).toEqual({
                    adRequests: 1,
                    starts: 0,
                    views: 0,
                    startsPerTarget: { },
                    viewsPerTarget: { },
                    latestTargetStarts: { }
                });
            });

            it('should have a fill', () => {
                expect(loadedCampaign1).toBeDefined();
                expect(loadedCampaign2).toBeDefined();
            });

            it('should isLoadEnabled flag be set to true', () => {
                expect(loadedCampaign1!.campaign.isLoadEnabled()).toEqual(true);
                expect(loadedCampaign2!.campaign.isLoadEnabled()).toEqual(true);
            });

            it('should have correct in loadedCampaign1', () => {
                expect(loadedCampaign1!.campaign.getId()).toEqual('5be40c5f602f4510ec583881');
            });

            it('should have correct in loadedCampaign2', () => {
                expect(loadedCampaign2!.campaign.getId()).toEqual('load_v5_2');
            });

            it('should sessions have id from preload response', () => {
                expect(loadedCampaign1!.campaign.getSession()).toBeDefined();
                expect(loadedCampaign1!.campaign.getSession().getId()).toEqual('d301fd4c-4a9e-48e4-82aa-ad8b07977ca6');

                expect(loadedCampaign2!.campaign.getSession()).toBeDefined();
                expect(loadedCampaign2!.campaign.getSession().getId()).toEqual('d301fd4c-4a9e-48e4-82aa-ad8b07977ca6');
            });

            it('should set same sessions for all campaigns', () => {
                expect(loadedCampaign1!.campaign.getSession()).toBeDefined();

                expect(loadedCampaign1!.campaign.getSession()).toEqual(loadedCampaign2!.campaign.getSession());
                expect(loadedCampaign1!.campaign.getSession()).toStrictEqual(loadedCampaign2!.campaign.getSession());
            });

            it('should make request with correct body', () => {
                expect(request.post).toHaveBeenCalledTimes(3);
                expect(request.post).toHaveBeenNthCalledWith(2, expect.anything(), new SatisfiesMatcher({
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
                            data: 'test-data-preload-1'
                        }
                    }
                }), [], {
                    followRedirects: false,
                    retries: 0,
                    retryDelay: 10000,
                    retryWithConnectionEvents: false
                });
                expect(request.post).toHaveBeenNthCalledWith(3, expect.anything(), new SatisfiesMatcher({
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
                        rewardedVideo: {
                            campaignAvailable: true,
                            ttlInSeconds: 3600,
                            data: 'test-data-preload-2'
                        }
                    }
                }), [], {
                    followRedirects: false,
                    retries: 0,
                    retryDelay: 10000,
                    retryWithConnectionEvents: false
                });
            });
        });

        describe('successful load request and caching fails', () => {
            let loadedCampaign: ILoadedCampaign | undefined;

            beforeEach(async () => {
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

                adsConfig.getPlacement.mockReturnValue(Placement());

                contentTypeHandlerManager.getParser.mockReturnValue(new CometCampaignParser(core));

                await adRequestManager.requestPreload();
                loadedCampaign = await adRequestManager.requestLoad('video');
            });

            it('should have a fill', () => {
                expect(loadedCampaign).toBeDefined();
            });
        });

        describe('successful load request with no fill from preload', () => {
            let loadedCampaign: ILoadedCampaign | undefined;

            beforeEach(async () => {
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

                adsConfig.getPlacement.mockReturnValue(Placement());

                contentTypeHandlerManager.getParser.mockReturnValue(new CometCampaignParser(core));

                await adRequestManager.requestPreload();
                loadedCampaign = await adRequestManager.requestLoad('video');
            });

            it('should load campaign', () => {
                expect(loadedCampaign).toBeDefined();
            });

            it('should have correct in loadedCampaign', () => {
                expect(loadedCampaign!.campaign.getId()).toEqual('5be40c5f602f4510ec583881');
            });

            it('should make request with correct body', () => {
                expect(request.post).toHaveBeenCalledTimes(2);
                expect(request.post).toHaveBeenNthCalledWith(2, expect.anything(), new SatisfiesMatcher({
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
                            campaignAvailable: false,
                            data: ''
                        }
                    }
                }), [], {
                    followRedirects: false,
                    retries: 0,
                    retryDelay: 10000,
                    retryWithConnectionEvents: false
                });
            });
        });

        describe('successful load request with no fill', () => {
            let loadedCampaign: ILoadedCampaign | undefined;

            beforeEach(async () => {
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

                adsConfig.getPlacement.mockReturnValue(Placement());

                contentTypeHandlerManager.getParser.mockReturnValue(new CometCampaignParser(core));

                await adRequestManager.requestPreload();
                loadedCampaign = await adRequestManager.requestLoad('video');
            });

            it('should not load campaign', () => {
                expect(loadedCampaign).toBeUndefined();
            });

            it('should not send fill metric', () => {
                expect(SDKMetrics.reportMetricEvent).not.toBeCalledWith(LoadV5.LoadRequestFill);
            });

            it('should not trigger error metric', () => {
                expect(SDKMetrics.reportMetricEventWithTags).not.toBeCalledWith(LoadV5.LoadRequestFailed, expect.anything());
            });
        });

        describe('successful load request with no fill and no fill from preload', () => {
            let loadedCampaign: ILoadedCampaign | undefined;

            beforeEach(async () => {
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

                adsConfig.getPlacement.mockReturnValue(Placement());

                contentTypeHandlerManager.getParser.mockReturnValue(new CometCampaignParser(core));

                await adRequestManager.requestPreload();
                loadedCampaign = await adRequestManager.requestLoad('video');
            });

            it('should not load campaign', () => {
                expect(loadedCampaign).toBeUndefined();
            });

            it('should make request with correct body', () => {
                expect(request.post).toHaveBeenCalledTimes(2);
                expect(request.post).toHaveBeenNthCalledWith(2, expect.anything(), new SatisfiesMatcher({
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
                            campaignAvailable: false,
                            data: ''
                        }
                    }
                }), [], {
                    followRedirects: false,
                    retries: 0,
                    retryDelay: 10000,
                    retryWithConnectionEvents: false
                });
            });
        });

        describe('load request when no preload data', () => {
            let loadedCampaign: ILoadedCampaign | undefined;

            beforeEach(async () => {
                request.post
                    .mockRejectedValue(new Error())
                    .mockResolvedValueOnce({
                        url: '',
                        response: JSON.stringify(LoadV5LoadResponse),
                        responseCode: 200,
                        headers: {}
                    });

                adsConfig.getPlacement.mockReturnValue(Placement());

                await adRequestManager.requestPreload();
                loadedCampaign = await adRequestManager.requestLoad('video');
            });

            it('should have no fill', () => {
                expect(loadedCampaign).toBeUndefined();
            });
        });

        describe('load request when no preload expired', () => {
            let loadedCampaign: ILoadedCampaign | undefined;

            beforeEach(async () => {
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

                adsConfig.getPlacement.mockReturnValue(Placement());

                await adRequestManager.requestPreload();

                loadedCampaign = await adRequestManager.requestLoad('video');
            });

            afterEach(async () => {
                jest.useRealTimers();
            });

            it('should have expired data', () => {
                expect(adRequestManager.isPreloadDataExpired()).toEqual(true);
            });

            it('should have no fill', () => {
                expect(loadedCampaign).toBeUndefined();
            });
        });

        describe('failed load request', () => {
            let loadedCampaign1: ILoadedCampaign | undefined;
            let loadedCampaign2: ILoadedCampaign | undefined;

            beforeEach(async () => {
                request.post.mockResolvedValueOnce({
                    url: '',
                    response: JSON.stringify(LoadV5PreloadResponse),
                    responseCode: 200,
                    headers: {}
                }).mockRejectedValueOnce(
                    new Error()
                ).mockResolvedValueOnce({
                    url: '',
                    response: JSON.stringify(LoadV5LoadResponse),
                    responseCode: 200,
                    headers: {}
                });

                adsConfig.getPlacement.mockReturnValue(Placement());

                contentTypeHandlerManager.getParser.mockReturnValue(new CometCampaignParser(core));

                await adRequestManager.requestPreload();
                loadedCampaign1 = await adRequestManager.requestLoad('video');
                loadedCampaign2 = await adRequestManager.requestLoad('rewardedVideo');
            });

            it('should load single campaigns', () => {
                expect(loadedCampaign2).toBeDefined();
            });

            it('should have correct in loadedCampaign2', () => {
                expect(loadedCampaign2!.campaign.getId()).toEqual('5be40c5f602f4510ec583881');
            });

            it('should have no fill', () => {
                expect(loadedCampaign1).toBeUndefined();
            });
        });

        describe('load request before preload', () => {
            let loadedCampaign: ILoadedCampaign | undefined;

            beforeEach(async () => {
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

                adsConfig.getPlacement.mockReturnValue(Placement());

                contentTypeHandlerManager.getParser.mockReturnValue(new CometCampaignParser(core));

                const promise = adRequestManager.requestLoad('video');
                await adRequestManager.requestPreload();
                loadedCampaign = await promise;
            });

            it('should have a fill', () => {
                expect(loadedCampaign).toBeDefined();
            });

            it('should have correct in loadedCampaign2', () => {
                expect(loadedCampaign!.campaign.getId()).toEqual('5be40c5f602f4510ec583881');
            });

            it('should sessions have id from preload response', () => {
                expect(loadedCampaign!.campaign.getSession()).toBeDefined();
                expect(loadedCampaign!.campaign.getSession().getId()).toEqual('d301fd4c-4a9e-48e4-82aa-ad8b07977ca6');
            });
        });

        describe('load request while preload ongoing', () => {
            let loadedCampaign1: ILoadedCampaign | undefined;
            let loadedCampaign2: ILoadedCampaign | undefined;

            beforeEach(async () => {
                let requestPromiseResolve: (response: INativeResponse) => void = () => { expect(false).toBe(true); };
                const requestPromise = new Promise((resolve) => { requestPromiseResolve = resolve; });

                request.post.mockImplementationOnce(
                    () => requestPromise
                ).mockResolvedValueOnce({
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

                adsConfig.getPlacement.mockReturnValue(Placement());

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

                await preload;
                loadedCampaign1 = await load1;
                loadedCampaign2 = await load2;
            });

            it('should have a fill', () => {
                expect(loadedCampaign1).toBeDefined();
                expect(loadedCampaign2).toBeDefined();
            });

            it('should have correct in loadedCampaign1', () => {
                expect(loadedCampaign1!.campaign.getId()).toEqual('load_v5_2');
            });

            it('should have correct in loadedCampaign2', () => {
                expect(loadedCampaign2!.campaign.getId()).toEqual('5be40c5f602f4510ec583881');
            });

            it('should sessions have id from preload response', () => {
                expect(loadedCampaign1!.campaign.getSession()).toBeDefined();
                expect(loadedCampaign1!.campaign.getSession().getId()).toEqual('d301fd4c-4a9e-48e4-82aa-ad8b07977ca6');

                expect(loadedCampaign2!.campaign.getSession()).toBeDefined();
                expect(loadedCampaign2!.campaign.getSession().getId()).toEqual('d301fd4c-4a9e-48e4-82aa-ad8b07977ca6');
            });
        });

        describe('load request while preload ongoing and load request fails', () => {
            let loadedCampaign1: ILoadedCampaign | undefined;
            let loadedCampaign2: ILoadedCampaign | undefined;

            beforeEach(async () => {
                let requestPromiseResolve: (response: INativeResponse) => void = () => { expect(false).toBe(true); };
                const requestPromise = new Promise((resolve) => { requestPromiseResolve = resolve; });

                request.post.mockImplementationOnce(
                    () => requestPromise
                ).mockRejectedValueOnce(
                    new Error()
                ).mockResolvedValueOnce({
                    url: '',
                    response: JSON.stringify(LoadV5LoadResponse_2),
                    responseCode: 200,
                    headers: []
                });

                adsConfig.getPlacement.mockReturnValue(Placement());

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

                await preload;

                loadedCampaign1 = await load1;
                loadedCampaign2 = await load2;
            });

            it('should have a fill', () => {
                expect(loadedCampaign2).toBeDefined();
            });

            it('should have correct campaign', () => {
                expect(loadedCampaign2!.campaign.getId()).toEqual('load_v5_2');
            });

            it('should have no fill', () => {
                expect(loadedCampaign1).toBeUndefined();
            });
        });

        describe('load request while preload ongoing and preload fails', () => {
            let loadedCampaign1: ILoadedCampaign | undefined;
            let loadedCampaign2: ILoadedCampaign | undefined;

            beforeEach(async () => {
                let requestPromiseReject: (err: Error) => void = () => { expect(false).toBe(true); };
                const requestPromise = new Promise((reject) => { requestPromiseReject = reject; });

                request.post.mockImplementationOnce(
                    () => requestPromise
                ).mockRejectedValueOnce(
                    new Error()
                ).mockResolvedValueOnce({
                    url: '',
                    response: JSON.stringify(LoadV5LoadResponse),
                    responseCode: 200,
                    headers: []
                });

                adsConfig.getPlacement.mockReturnValue(Placement());

                contentTypeHandlerManager.getParser.mockReturnValue(new CometCampaignParser(core));

                const preload = adRequestManager.requestPreload();
                const load1 = adRequestManager.requestLoad('video');
                const load2 = adRequestManager.requestLoad('rewardedVideo');

                requestPromiseReject(new Error());

                try {
                    await preload;
                } catch (err) {
                    // no-op
                }

                loadedCampaign1 = await load1;
                loadedCampaign2 = await load2;
            });

            it('should have no fill', () => {
                expect(loadedCampaign1).toBeUndefined();
                expect(loadedCampaign2).toBeUndefined();
            });

            it('should send metric when reload rescheduled', () => {
                expect(SDKMetrics.reportMetricEventWithTags).toBeCalledWith(LoadV5.LoadRequestFailed, expect.objectContaining({ 'rsn': 'rescheduled_failed_preload' }));
            });
        });

        describe('load request while reload ongoing', () => {
            let loadedCampaign: ILoadedCampaign | undefined;

            beforeEach(async () => {
                let requestPromiseResolve: (response: INativeResponse) => void = () => { expect(false).toBe(true); };
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
                }).mockImplementationOnce(
                    () => requestPromise
                ).mockResolvedValueOnce({
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

                await adRequestManager.requestPreload();
                await adRequestManager.requestLoad('video');
                const reload = adRequestManager.requestReload([]);
                const load = adRequestManager.requestLoad('video');

                requestPromiseResolve({
                    url: '',
                    response: JSON.stringify(LoadV5ReloadResponse),
                    responseCode: 200,
                    headers: []
                });

                await reload;
                loadedCampaign = await load;
            });

            it('should have a fill', () => {
                expect(loadedCampaign).toBeDefined();
            });

            it('should have correct campaign', () => {
                expect(loadedCampaign!.campaign.getId()).toEqual('5be40c5f602f4510ec583881');
            });
        });

        describe('successful reload request', () => {
            let onCampaign: jest.Mock;

            beforeEach(async () => {
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

                await adRequestManager.requestPreload();
                await adRequestManager.requestLoad('video');
                await adRequestManager.requestLoad('rewardedVideo');
                await adRequestManager.requestReload(['rewardedVideo']);
            });

            it('should increase request count in game session counter', () => {
                expect(GameSessionCounters.getCurrentCounters()).toEqual({
                    adRequests: 2,
                    starts: 0,
                    views: 0,
                    startsPerTarget: { },
                    viewsPerTarget: { },
                    latestTargetStarts: { }
                });
            });

            it('should get reloaded campaigns', () => {
                expect(onCampaign).toBeCalledTimes(1);
                expect(onCampaign.mock.calls[0][0]).toEqual('rewardedVideo');
                expect(onCampaign.mock.calls[0][1]).toBeDefined();
                expect(onCampaign.mock.calls[0][2]).toBeDefined();

                const campaign: Campaign = <Campaign>onCampaign.mock.calls[0][1];

                expect(campaign.getId()).toEqual('reload_v5');

                expect(campaign.getSession()).toBeDefined();
                expect(campaign.getSession().getId()).toEqual('d301fd4c-4a9e-48e4-82aa-ad8b07977ca7');
            });

            it('should isLoadEnabled flag be set to true', () => {
                const campaign: Campaign = <Campaign>onCampaign.mock.calls[0][1];

                expect(campaign.isLoadEnabled()).toEqual(true);
            });

            it('should make request with correct body', () => {
                expect(request.post).toHaveBeenNthCalledWith(4, expect.anything(), new SatisfiesMatcher({
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
                    retries: 0,
                    retryDelay: 10000,
                    retryWithConnectionEvents: false
                });
            });
        });

        describe('failed reload request', () => {
            let onNoFill: jest.Mock;

            beforeEach(async () => {
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

                await adRequestManager.requestPreload();
                await adRequestManager.requestLoad('video');
                await adRequestManager.requestLoad('rewardedVideo');
                await adRequestManager.requestReload(['video', 'rewardedVideo']);
            });

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
            let loadedCampaign: ILoadedCampaign | undefined;

            beforeEach(async () => {
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

                await adRequestManager.requestPreload();
                await adRequestManager.requestLoad('video');
                await adRequestManager.requestReload(['video']);
                loadedCampaign = await adRequestManager.requestLoad('rewardedVideo');
            });

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
                            data: 'test-data-reload-2'
                        }
                    }
                }), [], {
                    followRedirects: false,
                    retries: 0,
                    retryDelay: 10000,
                    retryWithConnectionEvents: false
                });
            });

            it('should have a fill', () => {
                expect(loadedCampaign).toBeDefined();
            });

            it('should have correct campaign', () => {
                expect(loadedCampaign!.campaign.getId()).toEqual('load_v5_2');
            });
        });

        describe('load request ongoing and reload triggered', () => {
            let loadedCampaign: ILoadedCampaign | undefined;

            beforeEach(async () => {
                let requestMadePromiseResolve: () => void = () => { expect(false).toBe(true); };
                const requestMadePromise = new Promise((resolve) => { requestMadePromiseResolve = resolve; });

                let requestPromiseResolve: (response: INativeResponse) => void = () => { expect(false).toBe(true); };
                const requestPromise = new Promise((resolve) => { requestPromiseResolve = resolve; });

                request.post.mockResolvedValueOnce({
                    url: '',
                    response: JSON.stringify(LoadV5PreloadResponse),
                    responseCode: 200,
                    headers: {}
                }).mockImplementationOnce(
                    () => { requestMadePromiseResolve(); return requestPromise; }
                ).mockResolvedValueOnce({
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

                await adRequestManager.requestPreload();
                const load = adRequestManager.requestLoad('video');

                await requestMadePromise;

                const reload = adRequestManager.requestReload(['rewardedVideo']);

                await reload;

                requestPromiseResolve({
                    url: '',
                    response: '{}',
                    responseCode: 200,
                    headers: []
                });

                loadedCampaign = await load;
            });

            it('should have a fill', () => {
                expect(loadedCampaign).toBeDefined();
            });

            it('should have correct campaign', () => {
                expect(loadedCampaign!.campaign.getId()).toEqual('load_v5_2');
            });

            it('should have session from reload', () => {
                expect(loadedCampaign!.campaign.getSession()).toBeDefined();
                expect(loadedCampaign!.campaign.getSession().getId()).toEqual('d301fd4c-4a9e-48e4-82aa-ad8b07977ca7');
                expect(loadedCampaign!.campaign.getSession().getId()).toEqual('d301fd4c-4a9e-48e4-82aa-ad8b07977ca7');
            });
        });

        describe('load request ongoing and reload triggered for the same placement', () => {
            let loadedCampaign: ILoadedCampaign | undefined;

            beforeEach(async () => {
                let requestMadePromiseResolve: () => void = () => { expect(false).toBe(true); };
                const requestMadePromise = new Promise((resolve) => { requestMadePromiseResolve = resolve; });

                let requestPromiseResolve: (response: INativeResponse) => void = () => { expect(false).toBe(true); };
                const requestPromise = new Promise((resolve) => { requestPromiseResolve = resolve; });

                request.post.mockResolvedValueOnce({
                    url: '',
                    response: JSON.stringify(LoadV5PreloadResponse),
                    responseCode: 200,
                    headers: {}
                }).mockImplementationOnce(
                    () => { requestMadePromiseResolve(); return requestPromise; }
                ).mockResolvedValueOnce({
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

                await adRequestManager.requestPreload();
                const load = adRequestManager.requestLoad('video');

                await requestMadePromise;

                const reload = adRequestManager.requestReload(['rewardedVideo', 'video']);

                await reload;

                requestPromiseResolve({
                    url: '',
                    response: '{}',
                    responseCode: 200,
                    headers: []
                });

                loadedCampaign = await load;
            });

            it('should have a fill', () => {
                expect(loadedCampaign).toBeDefined();
            });

            it('should have correct campaign', () => {
                expect(loadedCampaign!.campaign.getId()).toEqual('reload_v5');
            });

            it('should have session from reload', () => {
                expect(loadedCampaign!.campaign.getSession()).toBeDefined();
                expect(loadedCampaign!.campaign.getSession().getId()).toEqual('d301fd4c-4a9e-48e4-82aa-ad8b07977ca7');
                expect(loadedCampaign!.campaign.getSession().getId()).toEqual('d301fd4c-4a9e-48e4-82aa-ad8b07977ca7');
            });
        });
    });
});
