import { IAds } from 'Ads/IAds';
import { AssetManager } from 'Ads/Managers/AssetManager';
import { TestFixtures } from 'TestHelpers/TestFixtures';
import { Backend } from 'Backend/Backend';
import { assert } from 'chai';
import { Platform } from 'Core/Constants/Platform';
import { ICore } from 'Core/ICore';
import { NativeBridge } from 'Core/Native/Bridge/NativeBridge';
import { AutomatedExperiment } from 'Ads/Models/AutomatedExperiment';
import { AutomatedExperimentManager, ContextualFeature } from 'Ads/Managers/AutomatedExperimentManager';
import { AuctionProtocol, INativeResponse, RequestManager } from 'Core/Managers/RequestManager';
import { Campaign, ICampaignTrackingUrls } from 'Ads/Models/Campaign';
import { CacheManager } from 'Core/Managers/CacheManager';
import { ContentTypeHandlerManager } from 'Ads/Managers/ContentTypeHandlerManager';
import { PerformanceAdUnitParametersFactory } from 'Performance/AdUnits/PerformanceAdUnitParametersFactory';
import { AbstractAdUnitParametersFactory } from 'Ads/AdUnits/AdUnitParametersFactory';
import { PerformanceAdUnitFactory} from 'Performance/AdUnits/PerformanceAdUnitFactory';
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
import { MabDisabledABTest } from 'Core/Models/ABGroup';

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

const FooExperiment = new AutomatedExperiment({
    name: 'FooExperiment',
    actions: FooExperimentDeclaration,
    defaultActions: FooExperimentDefaultActions
});

describe('AutomatedExperimentManagerTests', () => {
    const baseUrl = 'https://auiopt.unityads.unity3d.com/v2/';
    const createEndPoint = 'experiment';
    const rewardEndPoint = 'reward';

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
        gsc_campaigns: ['1'],
        gsc_campaign_starts: [1],
        gsc_campaign_views: [1],
        gsc_campaign_last_start_ts: ['sdfsfs'],
        gsc_target_games: ['2'],
        gsc_target_game_starts: [0],
        gsc_target_game_views: [0],
        day_of_week: 0,
        is_weekend: true
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

    it(`initialize with request ok, no experiments`, () => {
        const postUrl = baseUrl + createEndPoint;

        const postStub = sandbox.stub(core.RequestManager, 'post')
            .withArgs(postUrl)
            .resolves(<INativeResponse>{
                responseCode: 200,
                response: ''
            });

        return aem.onNewCampaign(campaign)
        .then(() => aem.startCampaign(campaign))
        .then(() => {
            assert.isFalse(postStub.called);
        });
    });

    [
        {action1: FooExperimentDeclaration.action1.choiceA, action2: FooExperimentDeclaration.action2.choiceA},
        {action1: FooExperimentDeclaration.action1.choiceA, action2: FooExperimentDeclaration.action2.choiceB},
        {action1: FooExperimentDeclaration.action1.choiceB, action2: FooExperimentDeclaration.action2.choiceA},
        {action1: FooExperimentDeclaration.action1.choiceB, action2: FooExperimentDeclaration.action2.choiceB}
    ].forEach((action) => {
        it(`initialize with request ok, use received action ${JSON.stringify(action)}`, () => {
            sandbox.stub(SDKMetrics, 'reportMetricEvent')
            .returns(true);

            const postUrl = baseUrl + createEndPoint;
            const responseText = JSON.stringify({experiments: {FooExperiment: action}});

            const postStub = sandbox.stub(core.RequestManager, 'post')
                .withArgs(postUrl)
                .resolves(<INativeResponse>{
                    responseCode: 200,
                    response: responseText
                });

            aem.initialize(core, campaignSource);
            aem.registerExperiments([FooExperiment]);

            return aem.onNewCampaign(campaign)
                .then(() => aem.startCampaign(campaign))
                .then(() => {
                    assert.isTrue(postStub.called);
                    assert.isTrue(ValidateFeaturesInRequestBody(postStub.firstCall.args[1]));
                    assert.equal(JSON.stringify(aem.activateExperiment(campaign, FooExperiment)), JSON.stringify(action), 'Wrong variant...');
            });
        });
    });

    it(`send proper request, receive garbage, use default action`, () => {
        const postUrl = baseUrl + createEndPoint;
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
        aem.registerExperiments([FooExperiment]);
        return aem.onNewCampaign(campaign)
        .then(() => aem.startCampaign(campaign))
        .then(() => {
            assert.isTrue(postStub.called);
            assert.isTrue(metricStub.calledOnce);
            assert.isTrue(ValidateFeaturesInRequestBody(postStub.firstCall.args[1]));

            assert.equal(JSON.stringify(aem.activateExperiment(campaign, FooExperiment)), JSON.stringify(FooExperimentDefaultActions), 'Wrong variant...');
        });
    });

    it('initialize with request failure, use default action', () => {
        const postUrl = baseUrl + createEndPoint;
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
        aem.registerExperiments([FooExperiment]);
        return aem.onNewCampaign(campaign)
        .then(() => aem.startCampaign(campaign))
        .then(() => {
            assert.isTrue(postStub.called);
            assert.isTrue(metricStub.calledOnce);
            assert.isTrue(ValidateFeaturesInRequestBody(postStub.firstCall.args[1]));

            assert.equal(JSON.stringify(aem.activateExperiment(campaign, FooExperiment)), JSON.stringify(FooExperimentDefaultActions), 'Wrong variant...');
        });
    });

    [0, 1].forEach((rewarded) => {
        it(`experiment, rewarded(${rewarded})`, () => {
            const postStub = sandbox.stub(core.RequestManager, 'post');

            sandbox.stub(SDKMetrics, 'reportMetricEvent')
            .returns(true);

            const responseText = JSON.stringify({experiments: {FooExperiment: FooExperimentDefaultActions}});

            postStub.onCall(0).resolves(<INativeResponse>{
                responseCode: 200,
                response: responseText
            });

            const rewardPostUrl = baseUrl + rewardEndPoint;
            const rewardRequestBodyText = JSON.stringify({
                user_info: {ab_group: 99, auction_id: '12345'}, experiment: 'FooExperiment', actions: FooExperimentDefaultActions, reward: rewarded, metadata: ''
            });
            const rewardResponseText = JSON.stringify({success: true});

            const postStubReward = postStub.onCall(2).resolves(<INativeResponse>{
                responseCode: 200,
                response: rewardResponseText
            });

            aem.initialize(core, campaignSource);
            aem.registerExperiments([FooExperiment]);
            return aem.onNewCampaign(campaign)
            .then(() => aem.startCampaign(campaign))
            .then(() => {
                const variant = aem.activateExperiment(campaign, FooExperiment);
                assert.equal(JSON.stringify(variant), JSON.stringify(FooExperimentDefaultActions), 'Wrong variant name');

                if (rewarded) {
                    aem.rewardExperiments(campaign);
                }

            }).then(() => {
                return aem.endCampaign(campaign);
            }).then(() => {
                assert(postStub.calledTwice);
                assert(postStubReward.calledWith(rewardPostUrl, rewardRequestBodyText));
            });
        });
    });

    it('AutomatedExperimentManager notified of performance campaigns', () => {
        sandbox.stub(SDKMetrics, 'reportMetricEventWithTags')
            .returns(true);

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

        sandbox.stub(MabDisabledABTest, 'isValid').returns(true);

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
        aem.registerExperiments([FooExperiment]);
        return aem.onNewCampaign(TestFixtures.getXPromoCampaign())
            .then(() => {
                assert.isTrue(metricStub.calledOnceWith(AUIMetric.IgnoringNonPerformanceCampaign));
        });
    });

    it(`Experiment defaults cleanly if initialize is not called`, () => {
        const metricStub = sandbox.stub(SDKMetrics, 'reportMetricEvent')
            .withArgs(AUIMetric.FailedToFetchAutomatedExperiements)
            .returns(true);

        aem.registerExperiments([FooExperiment]);
        aem.startCampaign(campaign);
        const variant = aem.activateExperiment(campaign, FooExperiment);
        assert.equal(JSON.stringify(variant), JSON.stringify(FooExperimentDefaultActions), 'Wrong variant name');
        assert.isTrue(metricStub.notCalled);

        return aem.endCampaign(campaign);
    });
});
