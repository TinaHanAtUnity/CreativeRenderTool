import { IAds } from 'Ads/IAds';
import { AssetManager } from 'Ads/Managers/AssetManager';
import { TestFixtures } from 'TestHelpers/TestFixtures';
import { Backend } from 'Backend/Backend';
import { assert } from 'chai';
import { Platform } from 'Core/Constants/Platform';
import { ICore } from 'Core/ICore';
import { NativeBridge } from 'Core/Native/Bridge/NativeBridge';
import { AutomatedExperimentManager, ContextualFeature } from 'MabExperimentation/AutomatedExperimentManager';
import { AuctionProtocol, INativeResponse, RequestManager } from 'Core/Managers/RequestManager';
import { Campaign, ICampaignTrackingUrls } from 'Ads/Models/Campaign';
import { CacheManager } from 'Core/Managers/CacheManager';
import { ContentTypeHandlerManager } from 'Ads/Managers/ContentTypeHandlerManager';
import { PerformanceAdUnitParametersFactory } from 'Performance/AdUnits/PerformanceAdUnitParametersFactory';
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
    let backend: Backend;
    let nativeBridge: NativeBridge;
    let core: ICore;
    let ads: IAds;
    let platform: Platform;
    let campaign: Campaign;
    let aem: AutomatedExperimentManager;
    let campaignSource: Observable3<string, Campaign, ICampaignTrackingUrls | undefined>;

    beforeEach(() => {
        platform = Platform.ANDROID;
        campaign = TestFixtures.getCampaign(undefined);
        backend = TestFixtures.getBackend(Platform.ANDROID);
        nativeBridge = TestFixtures.getNativeBridge(platform, backend);
        core = TestFixtures.getCoreModule(nativeBridge);
        ads = TestFixtures.getAdsModule(core);
        core.Ads = ads;
        campaignSource = new Observable3<string, Campaign, ICampaignTrackingUrls | undefined>();

        aem = new AutomatedExperimentManager();
    });

    afterEach(() => {
        sandbox.restore();
    });

    // exhaustive list so that if ever something appears, or changes type (to a point), we will catch it in the tests.
    // as that could signify a breaking change for the AutomatedExperimentManager back end (CDP schema).
    const defaultContextualFeatures: { [key: string]: ContextualFeature } = {
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

    function ValidateFeaturesInRequestBody(body: string): boolean {
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

    function genExperimentResponseBody(actions?: any) {
        if (actions === undefined) {
            actions = FooExperimentDefaultActions;
        }
        return JSON.stringify({
            categories:
            {
                TestCategory:
                {
                    experiment_name: experimentID,
                    parts:
                    [
                        {
                            id: testCategory + '-' + experimentID,
                            actions: actions,
                            metadata: 'booh'
                        }
                    ]
                },
                TestCategory2:
                {
                    experiment_name: experimentID,
                    parts:
                    [
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
                .resolves(<INativeResponse>{
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
            .resolves(<INativeResponse>{
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
            .resolves(<INativeResponse>{
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
            postStub.onFirstCall().resolves(<INativeResponse>{
                responseCode: 200,
                response: genExperimentResponseBody()
            });

            const rewardPostUrl = AutomatedExperimentManager.BaseUrl + AutomatedExperimentManager.RewardEndPoint;
            const rewardRequestBody = {
                user_info: { ab_group: 99, auction_id: '12345', gamer_token: 'abcd.1234.5678' },
                reward: rewarded,
                experiments:
                [
                    {
                        experiment: testCategory + '-' + experimentID,
                        actions: FooExperimentDefaultActions,
                        metadata: 'booh'
                    }
                ],
                click_coordinates: [],
                experiment_call_latency_ms: sinon.match.number
            };

            const postStubReward = postStub.onSecondCall().resolves(<INativeResponse>{
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
                    postStubReward.calledWithMatch(rewardPostUrl, (bodyText: string) => {
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
        (<sinon.SinonStub>adMobSignalFactory.getAdRequestSignal).returns(Promise.resolve(new AdMobSignal()));
        (<sinon.SinonStub>adMobSignalFactory.getOptionalSignal).returns(Promise.resolve(new AdMobOptionalSignal()));

        sandbox.stub(MabReverseABTest, 'isValid').returns(true);

        const mockRequest = sinon.mock(requestManager);
        mockRequest.expects('post').returns(Promise.resolve({
            response: JSON.stringify(CometVideoPlcCampaign)
        }));

        const onNewCampaignStub = sandbox.stub(aem, 'onNewCampaign')
            .resolves();

        const assetManager = new AssetManager(platform, core.Api, new CacheManager(core.Api, wakeUpManager, requestManager, cacheBookkeeping), CacheMode.DISABLED, deviceInfo, cacheBookkeeping);
        contentTypeHandlerManager.addHandler(CometCampaignParser.ContentType, { parser: new CometCampaignParser(core), factory: new PerformanceAdUnitFactory(<PerformanceAdUnitParametersFactory>adUnitParametersFactory) });
        const campaignManager = new LegacyCampaignManager(platform, core, coreConfig, adsConfig, assetManager, sessionManager, adMobSignalFactory, requestManager, clientInfo, deviceInfo, metaDataManager, cacheBookkeeping, contentTypeHandlerManager, privacySDK, userPrivacyManager);

        aem.initialize(core, campaignManager.onCampaign);

        let triggeredError: any;
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
        postStub.onFirstCall().resolves(<INativeResponse>{
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

            postStub.resolves(<INativeResponse>{
                responseCode: 200,
                response: genExperimentResponseBody()
            });

            const rewardPostUrl = AutomatedExperimentManager.BaseUrl + AutomatedExperimentManager.RewardEndPoint;
            const rewardRequestBody = {
                user_info: { ab_group: 99, auction_id: '12345', gamer_token: 'abcd.1234.5678' },
                reward: firstReward,
                experiments:
                [
                    {
                        experiment: testCategory + '-' + experimentID,
                        actions: FooExperimentDefaultActions,
                        metadata: 'booh'
                    }
                ],
                click_coordinates: [],
                experiment_call_latency_ms: sinon.match.number
            };

            const postStubReward = postStub.onSecondCall().resolves(<INativeResponse>{
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
                    } else {
                        return aem.endSelectedExperiment(campaign, testCategory);
                    }
                }).then(() => {
                    if (firstReward) {
                        postStubReward.calledWithMatch(rewardPostUrl, (bodyText: string) => {
                            const body = JSON.parse(bodyText);
                            return sinon.assert.match(body, rewardRequestBody);
                        });
                    }
                }).then(() => {
                    if (secondReward) {
                        assert((aem.rewardSelectedExperiment(campaign, testCategory2)));
                    } else {
                        assert((aem.endSelectedExperiment(campaign, testCategory2)));
                    }
                });
        });
    });
});
