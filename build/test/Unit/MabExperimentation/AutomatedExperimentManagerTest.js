import { AssetManager } from 'Ads/Managers/AssetManager';
import { TestFixtures } from 'TestHelpers/TestFixtures';
import { assert } from 'chai';
import { Platform } from 'Core/Constants/Platform';
import { AutomatedExperimentManager } from 'MabExperimentation/AutomatedExperimentManager';
import { AuctionProtocol, RequestManager } from 'Core/Managers/RequestManager';
import { CacheManager } from 'Core/Managers/CacheManager';
import { ContentTypeHandlerManager } from 'Ads/Managers/ContentTypeHandlerManager';
import { AbstractAdUnitParametersFactory } from 'Ads/AdUnits/AdUnitParametersFactory';
import { PerformanceAdUnitFactory } from 'Performance/AdUnits/PerformanceAdUnitFactory';
import { CacheMode } from 'Core/Models/CoreConfiguration';
import { CoreConfigurationParser } from 'Core/Parsers/CoreConfigurationParser';
import { AdsConfigurationParser } from 'Ads/Parsers/AdsConfigurationParser';
import { LegacyCampaignManager } from 'Ads/Managers/LegacyCampaignManager';
import { AdMobOptionalSignal } from 'AdMob/Models/AdMobOptionalSignal';
import { AdMobSignal } from 'AdMob/Models/AdMobSignal';
import { AdMobSignalFactory } from 'AdMob/Utilities/AdMobSignalFactory';
import { SessionManager } from 'Ads/Managers/SessionManager';
import { UserPrivacyManager } from 'Ads/Managers/UserPrivacyManager';
import { CometCampaignParser } from 'Performance/Parsers/CometCampaignParser';
import ConfigurationAuctionPlc from 'json/ConfigurationAuctionPlc.json';
import CometVideoPlcCampaign from 'json/OnCometVideoPlcCampaign.json';
import { MabReverseABTest } from 'Core/Models/ABGroup';
import 'mocha';
import * as sinon from 'sinon';
import { SDKMetrics, AUIMetric } from 'Ads/Utilities/SDKMetrics';
import { Observable3 } from 'Core/Utilities/Observable';
const FooExperimentDeclaration = {
    action1: {
        choiceA: 'action1ChoiceA',
        choiceB: 'action1ChoiceB'
    },
    action2: {
        choiceA: 'action2ChoiceA',
        choiceB: 'action2ChoiceB'
    }
};
const FooExperimentDefaultActions = {
    action1: FooExperimentDeclaration.action1.choiceB,
    action2: FooExperimentDeclaration.action2.choiceA
};
describe('AutomatedExperimentManagerTests', () => {
    const testCategory = 'TestCategory';
    const testCategory2 = 'TestCategory2';
    const experimentID = 'test-exp';
    const campaignType = 'PerformanceCampaign'; // must match type of object returned by TestFixtures.getCampaign()
    const sandbox = sinon.createSandbox();
    let backend;
    let nativeBridge;
    let core;
    let ads;
    let platform;
    let campaign;
    let aem;
    let campaignSource;
    beforeEach(() => {
        platform = Platform.ANDROID;
        campaign = TestFixtures.getCampaign(undefined);
        backend = TestFixtures.getBackend(Platform.ANDROID);
        nativeBridge = TestFixtures.getNativeBridge(platform, backend);
        core = TestFixtures.getCoreModule(nativeBridge);
        ads = TestFixtures.getAdsModule(core);
        core.Ads = ads;
        campaignSource = new Observable3();
        aem = new AutomatedExperimentManager();
    });
    afterEach(() => {
        sandbox.restore();
    });
    // exhaustive list so that if ever something appears, or changes type (to a point), we will catch it in the tests.
    // as that could signify a breaking change for the AutomatedExperimentManager back end (CDP schema).
    const defaultContextualFeatures = {
        bundle_id: 'com.unity3d.ads.example',
        game_id: '12345',
        coppa_compliant: false,
        limit_ad_tracking: true,
        gdpr_enabled: false,
        opt_out_recorded: false,
        opt_out_enabled: false,
        country: 'FI',
        language: 'en_US',
        time_zone: '+0200',
        platform: 'ANDROID',
        os_version: '10.1.1',
        device_model: 'iPhone7,2',
        device_make: 'Apple',
        screen_width: 647,
        screen_height: 357,
        screen_density: 480,
        stores: ['google'],
        rooted: false,
        connection_type: 'wifi',
        device_free_space: 10159440,
        headset: false,
        device_volume: 1,
        max_volume: 1,
        total_internal_space: 13162172,
        total_external_space: 13162172,
        free_external_space: 10159440,
        battery_level: 1,
        battery_status: 'BATTERY_STATUS_UNKNOWN',
        usb_connected: false,
        free_memory: 1000000,
        total_memory: 1899508,
        ringer_mode: 'RINGER_MODE_SILENT',
        network_metered: false,
        screen_brightness: 1,
        local_day_time: 10.5,
        campaign_id: '582bb5e352e4c4abd7fab850',
        target_game_id: 1000,
        rating: 4.5,
        rating_count: 0,
        gsc_ad_requests: 0,
        gsc_views: 0,
        gsc_starts: 0,
        video_orientation: 'LANDSCAPE',
        is_video_cached: false,
        gsc_target_games: ['2'],
        gsc_target_game_starts: [0],
        gsc_target_game_views: [0],
        day_of_week: 0,
        is_weekend: true,
        target_store_id: 'com.unity3d.ads.example',
        game_icon_url: 'com.unity3d.ads.example',
        portrait_creative_id: '582bb5e352e4c4abd7fab850',
        landscape_creative_id: '582bb5e352e4c4abd7fab850',
        endcard_portrait_image_url: 'http://cdn-creatives-highwinds-prd.unityads.unity3d.com/assets/6e6f9a65-1862-4051-bda1-dda61ebb2f65/Lucky%20Day%203x4%20FULL%20END%20CARD%20UNITY.png',
        endcard_landscape_image_url: 'http://cdn-creatives-highwinds-prd.unityads.unity3d.com/assets/6e6f9a65-1862-4051-bda1-dda61ebb2f65/Lucky%20Day%203x4%20FULL%20END%20CARD%20UNITY.png',
        target_game_name: 'Example game name'
    };
    function ValidateFeaturesInRequestBody(body) {
        const json = JSON.parse(body);
        if (!json.hasOwnProperty('contextual_features')) {
            return false;
        }
        const features = json.contextual_features;
        const allowedFeatures = Object.getOwnPropertyNames(defaultContextualFeatures);
        const postedFeatures = Object.getOwnPropertyNames(features);
        if (postedFeatures.length === 0) {
            return false;
        }
        return postedFeatures.every((feature) => {
            if (allowedFeatures.findIndex((s) => feature !== s) === -1) {
                return false;
            }
            if (typeof features[feature] !== typeof (defaultContextualFeatures[feature])) {
                return false;
            }
            return true;
        });
    }
    function genExperimentResponseBody(actions) {
        if (actions === undefined) {
            actions = FooExperimentDefaultActions;
        }
        return JSON.stringify({
            categories: {
                TestCategory: {
                    experiment_name: experimentID,
                    parts: [
                        {
                            id: testCategory + '-' + experimentID,
                            actions: actions,
                            metadata: 'booh'
                        }
                    ]
                },
                TestCategory2: {
                    experiment_name: experimentID,
                    parts: [
                        {
                            id: testCategory2 + '-' + experimentID,
                            actions: actions,
                            metadata: 'baah'
                        }
                    ]
                }
            }
        });
    }
    [
        { action1: FooExperimentDeclaration.action1.choiceA, action2: FooExperimentDeclaration.action2.choiceA },
        { action1: FooExperimentDeclaration.action1.choiceA, action2: FooExperimentDeclaration.action2.choiceB },
        { action1: FooExperimentDeclaration.action1.choiceB, action2: FooExperimentDeclaration.action2.choiceA },
        { action1: FooExperimentDeclaration.action1.choiceB, action2: FooExperimentDeclaration.action2.choiceB }
    ].forEach((action) => {
        it(`initialize with request ok, use received action ${JSON.stringify(action)}`, () => {
            const postUrl = AutomatedExperimentManager.BaseUrl + AutomatedExperimentManager.CreateEndPoint;
            sandbox.stub(SDKMetrics, 'reportMetricEvent')
                .returns(true);
            const postStub = sandbox.stub(core.RequestManager, 'post')
                .withArgs(postUrl)
                .resolves({
                responseCode: 200,
                response: genExperimentResponseBody(action)
            });
            aem.initialize(core, campaignSource);
            aem.registerExperimentCategory(testCategory, campaignType);
            return aem.onNewCampaign(campaign)
                .then(() => {
                assert.isTrue(postStub.called);
                assert.isTrue(ValidateFeaturesInRequestBody(postStub.firstCall.args[1]));
                assert.equal(aem.getSelectedExperimentName(campaign, testCategory), experimentID);
                const selectedActions = aem.activateSelectedExperiment(campaign, testCategory);
                assert.equal(JSON.stringify(selectedActions), JSON.stringify(action), 'Wrong variant...');
            });
        });
    });
    it(`Trims the image URL properly`, () => {
        assert.equal(aem.trimImageUrl('http://mycdn.com/unity/monetization/creative-id/uuid.png', false), 'creative-id/uuid');
        assert.equal(aem.trimImageUrl('http://mycdn.com/unity/monetization/creative-id/uuid.png', true), 'uuid');
        assert.equal(aem.trimImageUrl('http://foo.com', false), '');
        assert.equal(aem.trimImageUrl('http://foo.com', true), '');
    });
    it(`send proper request, receive garbage, returns undefined actions`, () => {
        const postUrl = AutomatedExperimentManager.BaseUrl + AutomatedExperimentManager.CreateEndPoint;
        const responseText = 'not json';
        const postStub = sandbox.stub(core.RequestManager, 'post')
            .withArgs(postUrl)
            .resolves({
            responseCode: 200,
            response: responseText
        });
        const metricStub = sandbox.stub(SDKMetrics, 'reportMetricEvent')
            .withArgs(AUIMetric.FailedToParseExperimentResponse)
            .returns(true);
        aem.initialize(core, campaignSource);
        aem.registerExperimentCategory(testCategory, campaignType);
        return aem.onNewCampaign(campaign)
            .then(() => {
            assert.isTrue(postStub.called);
            assert.isTrue(metricStub.calledOnce);
            assert.isTrue(ValidateFeaturesInRequestBody(postStub.firstCall.args[1]));
            assert.equal(aem.getSelectedExperimentName(campaign, testCategory), '');
            assert.equal(aem.activateSelectedExperiment(campaign, testCategory), undefined);
        });
    });
    it('initialize with request failure, returns undefined actions', () => {
        const postUrl = AutomatedExperimentManager.BaseUrl + AutomatedExperimentManager.CreateEndPoint;
        const responseText = JSON.stringify({});
        const metricStub = sandbox.stub(SDKMetrics, 'reportMetricEvent')
            .withArgs(AUIMetric.FailedToFetchAutomatedExperiements)
            .returns(true);
        const postStub = sandbox.stub(core.RequestManager, 'post')
            .withArgs(postUrl)
            .resolves({
            responseCode: 500,
            response: responseText
        });
        aem.initialize(core, campaignSource);
        aem.registerExperimentCategory(testCategory, campaignType);
        return aem.onNewCampaign(campaign)
            .then(() => {
            assert.isTrue(postStub.called);
            assert.isTrue(metricStub.calledOnce);
            assert.isTrue(ValidateFeaturesInRequestBody(postStub.firstCall.args[1]));
            assert.equal(aem.getSelectedExperimentName(campaign, testCategory), '');
            assert.equal(aem.activateSelectedExperiment(campaign, testCategory), undefined);
        });
    });
    [0, 1].forEach((rewarded) => {
        it(`experiment, rewarded(${rewarded})`, () => {
            sandbox.stub(SDKMetrics, 'reportMetricEvent')
                .returns(true);
            const postStub = sandbox.stub(core.RequestManager, 'post');
            postStub.onFirstCall().resolves({
                responseCode: 200,
                response: genExperimentResponseBody()
            });
            const rewardPostUrl = AutomatedExperimentManager.BaseUrl + AutomatedExperimentManager.RewardEndPoint;
            const rewardRequestBody = {
                user_info: { ab_group: 99, auction_id: '12345', gamer_token: 'abcd.1234.5678' },
                reward: rewarded,
                experiments: [
                    {
                        experiment: testCategory + '-' + experimentID,
                        actions: FooExperimentDefaultActions,
                        metadata: 'booh'
                    }
                ],
                click_coordinates: [],
                experiment_call_latency_ms: sinon.match.number
            };
            const postStubReward = postStub.onSecondCall().resolves({
                responseCode: 200,
                response: JSON.stringify({ success: true })
            });
            aem.initialize(core, campaignSource);
            aem.registerExperimentCategory(testCategory, campaignType);
            return aem.onNewCampaign(campaign)
                .then(() => {
                assert.equal(aem.getSelectedExperimentName(campaign, testCategory), experimentID);
                const variant = aem.activateSelectedExperiment(campaign, testCategory);
                assert.equal(JSON.stringify(variant), JSON.stringify(FooExperimentDefaultActions), 'Wrong variant name');
                if (rewarded) {
                    return aem.rewardSelectedExperiment(campaign, testCategory);
                }
            }).then(() => {
                return aem.endSelectedExperiment(campaign, testCategory);
            }).then(() => {
                assert(postStub.calledTwice);
                postStubReward.calledWithMatch(rewardPostUrl, (bodyText) => {
                    const body = JSON.parse(bodyText);
                    return sinon.assert.match(body, rewardRequestBody);
                });
            });
        });
    });
    it('AutomatedExperimentManager notified of performance campaigns', () => {
        sandbox.stub(SDKMetrics, 'reportMetricEventWithTags')
            .returns(true);
        sinon.stub(SDKMetrics, 'reportTimingEventWithTags');
        RequestManager.setTestAuctionProtocol(AuctionProtocol.V4);
        const cacheBookkeeping = core.CacheBookkeeping;
        const wakeUpManager = core.WakeUpManager;
        const deviceInfo = core.DeviceInfo;
        const metaDataManager = core.MetaDataManager;
        const contentTypeHandlerManager = new ContentTypeHandlerManager();
        const storageBridge = core.StorageBridge;
        const coreConfig = CoreConfigurationParser.parse(ConfigurationAuctionPlc);
        const adsConfig = AdsConfigurationParser.parse(ConfigurationAuctionPlc);
        const clientInfo = TestFixtures.getClientInfo();
        const adUnitParametersFactory = sinon.createStubInstance(AbstractAdUnitParametersFactory);
        const privacySDK = TestFixtures.getPrivacySDK(core.Api);
        const requestManager = core.RequestManager;
        const sessionManager = new SessionManager(core.Api, requestManager, storageBridge);
        const userPrivacyManager = new UserPrivacyManager(platform, core.Api, coreConfig, adsConfig, clientInfo, deviceInfo, requestManager, privacySDK);
        const adMobSignalFactory = sinon.createStubInstance(AdMobSignalFactory);
        adMobSignalFactory.getAdRequestSignal.returns(Promise.resolve(new AdMobSignal()));
        adMobSignalFactory.getOptionalSignal.returns(Promise.resolve(new AdMobOptionalSignal()));
        sandbox.stub(MabReverseABTest, 'isValid').returns(true);
        const mockRequest = sinon.mock(requestManager);
        mockRequest.expects('post').returns(Promise.resolve({
            response: JSON.stringify(CometVideoPlcCampaign)
        }));
        const onNewCampaignStub = sandbox.stub(aem, 'onNewCampaign')
            .resolves();
        const assetManager = new AssetManager(platform, core.Api, new CacheManager(core.Api, wakeUpManager, requestManager, cacheBookkeeping), CacheMode.DISABLED, deviceInfo, cacheBookkeeping);
        contentTypeHandlerManager.addHandler(CometCampaignParser.ContentType, { parser: new CometCampaignParser(core), factory: new PerformanceAdUnitFactory(adUnitParametersFactory) });
        const campaignManager = new LegacyCampaignManager(platform, core, coreConfig, adsConfig, assetManager, sessionManager, adMobSignalFactory, requestManager, clientInfo, deviceInfo, metaDataManager, cacheBookkeeping, contentTypeHandlerManager, privacySDK, userPrivacyManager);
        aem.initialize(core, campaignManager.onCampaign);
        let triggeredError;
        campaignManager.onError.subscribe(error => {
            triggeredError = error;
        });
        // when the campaign manager requests the placement
        return campaignManager.request().then(() => {
            if (triggeredError) {
                throw triggeredError;
            }
        })
            .then(() => {
            assert(onNewCampaignStub.calledOnce);
        });
    });
    it('AutomatedExperimentManager ignores non performance campaigns', () => {
        const metricStub = sandbox.stub(SDKMetrics, 'reportMetricEvent')
            .returns(true);
        aem.initialize(core, campaignSource);
        aem.registerExperimentCategory(testCategory, campaignType);
        const otherTypeCampaign = TestFixtures.getXPromoCampaign();
        return aem.onNewCampaign(otherTypeCampaign)
            .then(() => {
            assert.equal(aem.getSelectedExperimentName(otherTypeCampaign, testCategory), '');
        });
    });
    it(`Attempting to activate experiment when nothing has been initialized, generates no errors and returns undefined actions`, () => {
        const metricStub = sandbox.stub(SDKMetrics, 'reportMetricEvent')
            .returns(true);
        aem.registerExperimentCategory(testCategory, campaignType);
        assert.equal(aem.activateSelectedExperiment(campaign, testCategory), undefined);
        assert.isTrue(metricStub.notCalled);
    });
    it(`Attempting to activate experiment for non-registered category, triggers error reporting and returns undefined actions`, () => {
        const metricStub = sandbox.stub(SDKMetrics, 'reportMetricEvent')
            .returns(true);
        const postStub = sandbox.stub(core.RequestManager, 'post');
        postStub.onFirstCall().resolves({
            responseCode: 200,
            response: genExperimentResponseBody()
        });
        aem.initialize(core, campaignSource);
        aem.registerExperimentCategory(testCategory, campaignType);
        return aem.onNewCampaign(campaign)
            .then(() => {
            assert.equal(aem.activateSelectedExperiment(campaign, 'fooBar'), undefined);
            assert.isTrue(metricStub.calledWith(AUIMetric.UnknownCategoryProvided));
        });
    });
    it(`AUI/Optmz endpoint targets Production env`, () => {
        assert.equal(AutomatedExperimentManager.BaseUrl, AutomatedExperimentManager.BaseUrlProduction);
    });
    [[0, 0], [0, 1], [1, 0], [1, 1]].forEach(value => {
        const [firstReward, secondReward] = value;
        it(`Works with multiple experiments in parallel [${firstReward}, ${secondReward}]`, () => {
            sandbox.stub(SDKMetrics, 'reportMetricEvent')
                .returns(true);
            const postStub = sandbox.stub(core.RequestManager, 'post');
            postStub.resolves({
                responseCode: 200,
                response: genExperimentResponseBody()
            });
            const rewardPostUrl = AutomatedExperimentManager.BaseUrl + AutomatedExperimentManager.RewardEndPoint;
            const rewardRequestBody = {
                user_info: { ab_group: 99, auction_id: '12345', gamer_token: 'abcd.1234.5678' },
                reward: firstReward,
                experiments: [
                    {
                        experiment: testCategory + '-' + experimentID,
                        actions: FooExperimentDefaultActions,
                        metadata: 'booh'
                    }
                ],
                click_coordinates: [],
                experiment_call_latency_ms: sinon.match.number
            };
            const postStubReward = postStub.onSecondCall().resolves({
                responseCode: 200,
                response: JSON.stringify({ success: true })
            });
            aem.initialize(core, campaignSource);
            aem.registerExperimentCategory(testCategory, campaignType);
            aem.registerExperimentCategory(testCategory2, campaignType);
            return aem.onNewCampaign(campaign)
                .then(() => {
                const firstVariant = aem.activateSelectedExperiment(campaign, testCategory);
                assert.deepEqual(firstVariant, FooExperimentDefaultActions, 'Wrong variant name');
                const secondVariant = aem.activateSelectedExperiment(campaign, testCategory2);
                assert.deepEqual(secondVariant, FooExperimentDefaultActions, 'Wrong variant name');
            }).then(() => {
                if (firstReward) {
                    return aem.rewardSelectedExperiment(campaign, testCategory);
                }
                else {
                    return aem.endSelectedExperiment(campaign, testCategory);
                }
            }).then(() => {
                if (firstReward) {
                    postStubReward.calledWithMatch(rewardPostUrl, (bodyText) => {
                        const body = JSON.parse(bodyText);
                        return sinon.assert.match(body, rewardRequestBody);
                    });
                }
            }).then(() => {
                if (secondReward) {
                    assert((aem.rewardSelectedExperiment(campaign, testCategory2)));
                }
                else {
                    assert((aem.endSelectedExperiment(campaign, testCategory2)));
                }
            });
        });
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQXV0b21hdGVkRXhwZXJpbWVudE1hbmFnZXJUZXN0LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vdGVzdC9Vbml0L01hYkV4cGVyaW1lbnRhdGlvbi9BdXRvbWF0ZWRFeHBlcmltZW50TWFuYWdlclRlc3QudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQ0EsT0FBTyxFQUFFLFlBQVksRUFBRSxNQUFNLDJCQUEyQixDQUFDO0FBQ3pELE9BQU8sRUFBRSxZQUFZLEVBQUUsTUFBTSwwQkFBMEIsQ0FBQztBQUV4RCxPQUFPLEVBQUUsTUFBTSxFQUFFLE1BQU0sTUFBTSxDQUFDO0FBQzlCLE9BQU8sRUFBRSxRQUFRLEVBQUUsTUFBTSx5QkFBeUIsQ0FBQztBQUduRCxPQUFPLEVBQUUsMEJBQTBCLEVBQXFCLE1BQU0sK0NBQStDLENBQUM7QUFDOUcsT0FBTyxFQUFFLGVBQWUsRUFBbUIsY0FBYyxFQUFFLE1BQU0sOEJBQThCLENBQUM7QUFFaEcsT0FBTyxFQUFFLFlBQVksRUFBRSxNQUFNLDRCQUE0QixDQUFDO0FBQzFELE9BQU8sRUFBRSx5QkFBeUIsRUFBRSxNQUFNLHdDQUF3QyxDQUFDO0FBRW5GLE9BQU8sRUFBRSwrQkFBK0IsRUFBRSxNQUFNLHFDQUFxQyxDQUFDO0FBQ3RGLE9BQU8sRUFBRSx3QkFBd0IsRUFBRSxNQUFNLDhDQUE4QyxDQUFDO0FBQ3hGLE9BQU8sRUFBRSxTQUFTLEVBQUUsTUFBTSwrQkFBK0IsQ0FBQztBQUMxRCxPQUFPLEVBQUUsdUJBQXVCLEVBQUUsTUFBTSxzQ0FBc0MsQ0FBQztBQUMvRSxPQUFPLEVBQUUsc0JBQXNCLEVBQUUsTUFBTSxvQ0FBb0MsQ0FBQztBQUM1RSxPQUFPLEVBQUUscUJBQXFCLEVBQUUsTUFBTSxvQ0FBb0MsQ0FBQztBQUMzRSxPQUFPLEVBQUUsbUJBQW1CLEVBQUUsTUFBTSxrQ0FBa0MsQ0FBQztBQUN2RSxPQUFPLEVBQUUsV0FBVyxFQUFFLE1BQU0sMEJBQTBCLENBQUM7QUFD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