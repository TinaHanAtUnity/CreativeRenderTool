import { IAds } from 'Ads/IAds';
import { AssetManager } from 'Ads/Managers/AssetManager';
import { ICore } from 'Core/ICore';
import { TestFixtures } from 'TestHelpers/TestFixtures';
import { Platform } from 'Core/Constants/Platform';
import { Backend } from 'Backend/Backend';
import { assert } from 'chai';
import { Platform } from 'Core/Constants/Platform';
import { ICore } from 'Core/ICore';
import { INativeResponse } from 'Core/Managers/RequestManager';
import { NativeBridge } from 'Core/Native/Bridge/NativeBridge';
import { AutomatedExperiment } from 'Ads/Models/AutomatedExperiment';
import { AutomatedExperimentManager } from 'Ads/Managers/AutomatedExperimentManager';
import { AuctionProtocol, INativeResponse, RequestManager } from 'Core/Managers/RequestManager';
import { Diagnostics } from 'Core/Utilities/Diagnostics';
import { Campaign } from 'Ads/Models/Campaign';
import { CacheManager } from 'Core/Managers/CacheManager';
import { ProgrammaticTrackingService } from 'Ads/Utilities/ProgrammaticTrackingService';
import { ContentTypeHandlerManager } from 'Ads/Managers/ContentTypeHandlerManager';
import { PerformanceAdUnitParametersFactory } from 'Performance/AdUnits/PerformanceAdUnitParametersFactory';
import { AbstractAdUnitParametersFactory } from 'Ads/AdUnits/AdUnitParametersFactory';
import { PerformanceAdUnitFactory} from 'Performance/AdUnits/PerformanceAdUnitFactory';
import { CacheMode } from 'Core/Models/CoreConfiguration';
import { CoreConfigurationParser } from 'Core/Parsers/CoreConfigurationParser';
import { AdsConfigurationParser } from 'Ads/Parsers/AdsConfigurationParser';
import { CampaignManager, implementsIOnCampaignListener } from 'Ads/Managers/CampaignManager';
import { AdMobOptionalSignal } from 'AdMob/Models/AdMobOptionalSignal';
import { AdMobSignal } from 'AdMob/Models/AdMobSignal';
import { AdMobSignalFactory } from 'AdMob/Utilities/AdMobSignalFactory';
import { SessionManager } from 'Ads/Managers/SessionManager';
import { UserPrivacyManager } from 'Ads/Managers/UserPrivacyManager';
import { CometCampaignParser } from 'Performance/Parsers/CometCampaignParser';
import ConfigurationAuctionPlc from 'json/ConfigurationAuctionPlc.json';
import CometVideoPlcCampaign from 'json/OnCometVideoPlcCampaign.json';
import { Performance } from 'Performance/Performance';
import { China } from 'China/China';
import { MabDecisionButtonTest } from 'Core/Models/ABGroup';

const FooExperiment = new AutomatedExperiment({
    name: 'FooExperiment',
    actions: ['FooAction1', 'FooAction2'],
    defaultAction: 'FooAction2'
});

describe('AutomatedExperimentManagerTests', () => {
    const baseUrl = 'https://auiopt.unityads.unity3d.com/v1/';
    const createEndPoint = 'experiment';
    const rewardEndPoint = 'reward';

    const sandbox = sinon.createSandbox();
    let backend: Backend;
    let nativeBridge: NativeBridge;
    let core: ICore;
    let ads: IAds;
    let diagnosticTrigger: sinon.SinonStub;
    let platform: Platform;
    let campaign: Campaign;

    beforeEach(() => {
        platform = Platform.ANDROID;
        campaign = TestFixtures.getCampaign(undefined);
        backend = TestFixtures.getBackend(Platform.ANDROID);
        nativeBridge = TestFixtures.getNativeBridge(platform, backend);
        core = TestFixtures.getCoreModule(nativeBridge);
        ads = TestFixtures.getAdsModule(core);
        core.Ads = ads;
        diagnosticTrigger = sandbox.stub(Diagnostics, 'trigger');
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
        opt_out_Recorded: false,
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
        ratingCount: 0,
        gsc_ad_requests: 0,
        gsc_views: 0,
        gsc_starts: 0,
        video_orientation: 'LANDSCAPE',
        is_video_cached: false
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
            .resolves(<INativeResponse>{
                responseCode: 200,
                response: ''
            });

        const aem = new AutomatedExperimentManager(core);
        return aem.initialize([]).then(() => {
            assert.isFalse(postStub.called);
        });
    });

    ['FooAction1', 'FooAction2'].forEach((action) => {
        it(`initialize with request ok, use received action ${action}`, () => {
            const postUrl = baseUrl + createEndPoint;
            const responseText = JSON.stringify({experiments: {FooExperiment: action}});

            const postStub = sandbox.stub(core.RequestManager, 'post')
                .withArgs(postUrl)
                .resolves(<INativeResponse>{
                    responseCode: 200,
                    response: responseText
                });

            const aem = new AutomatedExperimentManager(core);
            return aem.initialize([FooExperiment])
                .then(() => AutomatedExperimentManager.onNewCampaign(aem, campaign))
                .then(() => aem.startCampaign(campaign))
                .then(() => {
                    assert.isTrue(postStub.called);
                    assert.isTrue(ValidateFeaturesInRequestBody(postStub.firstCall.args[1]));
                    assert.equal(aem.activateExperiment(campaign, FooExperiment), action, 'Wrong variant...');
            });
        });
    });

    ['FooAction1', 'FooAction2'].forEach((action) => {
        it(`initialize with request ok, use received action ${action}, failed to parse`, () => {
            const postUrl = baseUrl + createEndPoint;
            const responseText = 'not json';

            const postStub = sandbox.stub(core.RequestManager, 'post')
                .withArgs(postUrl)
                .resolves(<INativeResponse>{
                    responseCode: 200,
                    response: responseText
                });

            const aem = new AutomatedExperimentManager(core);
            return aem.initialize([FooExperiment])
            .then(() => AutomatedExperimentManager.onNewCampaign(aem, campaign))
            .then(() => aem.startCampaign(campaign))
            .then(() => {
                assert.isTrue(postStub.called);

                assert.isTrue(ValidateFeaturesInRequestBody(postStub.firstCall.args[1]));

                assert.equal(aem.activateExperiment(campaign, FooExperiment), 'FooAction2', 'Wrong variant...');

                assert.equal(diagnosticTrigger.callCount, 3, 'missing an error...');
                assert.equal(diagnosticTrigger.firstCall.args[0], 'set_model_value_failed'); // related to DeviceInfo.fetch not finding isMadeWithUnity. dont know how to get rid of it
                assert.equal(diagnosticTrigger.secondCall.args[0], 'set_model_value_failed'); // related to DeviceInfo.fetch not finding isMadeWithUnity. dont know how to get rid of it

                assert.equal(diagnosticTrigger.thirdCall.args[0], 'failed_to_parse_automated_experiments');
                // The error message is browser dependant, thus different between safari(iOS) and chrome(Android)
                assert.oneOf(diagnosticTrigger.thirdCall.args[1].message, ['JSON Parse error: Unexpected identifier "not"', 'Unexpected token o in JSON at position 1']);
            });
        });
    });

    it('initialize with request failure, use default action', () => {
        const postUrl = baseUrl + createEndPoint;
        const responseText = JSON.stringify({});

        const postStub = sandbox.stub(core.RequestManager, 'post')
            .withArgs(postUrl)
            .resolves(<INativeResponse>{
                responseCode: 500,
                response: responseText
            });

        const aem = new AutomatedExperimentManager(core);
        return aem.initialize([FooExperiment])
        .then(() => AutomatedExperimentManager.onNewCampaign(aem, campaign))
        .then(() => aem.startCampaign(campaign))
        .then(() => {
            assert.isTrue(postStub.called);

            assert.isTrue(ValidateFeaturesInRequestBody(postStub.firstCall.args[1]));

            assert.equal(aem.activateExperiment(campaign, FooExperiment), 'FooAction2', 'Wrong variant...');

            assert.equal(diagnosticTrigger.callCount, 3, 'missing an error...');
            assert.equal(diagnosticTrigger.firstCall.args[0], 'set_model_value_failed'); // related to DeviceInfo.fetch not finding isMadeWithUnity. dont know how to get rid of it
            assert.equal(diagnosticTrigger.secondCall.args[0], 'set_model_value_failed'); // related to DeviceInfo.fetch not finding isMadeWithUnity. dont know how to get rid of it

            assert.equal(diagnosticTrigger.thirdCall.args[0], 'failed_to_fetch_automated_experiments');
            assert.equal(diagnosticTrigger.thirdCall.args[1].message, 'Failed to fetch response from aui service');
        });
    });

    [0, 1].forEach((rewarded) => {
        it(`experiment, rewarded(${rewarded})`, () => {
            const postStub = sandbox.stub(core.RequestManager, 'post');

            const responseText = JSON.stringify({experiments: {FooExperiment: 'FooAction1'}});

            postStub.onCall(0).resolves(<INativeResponse>{
                responseCode: 200,
                response: responseText
            });

            const rewardPostUrl = baseUrl + rewardEndPoint;
            const rewardRequestBodyText = JSON.stringify({
                user_info: {ab_group: 99, auction_id: '12345'}, experiment: 'FooExperiment', action: 'FooAction1', reward: rewarded, metadata: ''
            });
            const rewardResponseText = JSON.stringify({success: true});

            const postStubReward = postStub.onCall(2).resolves(<INativeResponse>{
                responseCode: 200,
                response: rewardResponseText
            });

            const aem = new AutomatedExperimentManager(core);
            return aem.initialize([FooExperiment])
            .then(() => AutomatedExperimentManager.onNewCampaign(aem, campaign))
            .then(() => aem.startCampaign(campaign))
            .then(() => {
                const variant = aem.activateExperiment(campaign, FooExperiment);
                assert.equal(variant, 'FooAction1', 'Wrong variant name');

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

    it('EndExperiment should fail if called before beginExperiment', (done) => {
        const aem = new AutomatedExperimentManager(core);
        aem.initialize([]).then(() => {
            aem.endCampaign(campaign).catch(() => { done(); });
        });
    });

    it('AutomatedExperimentManager notified of performance campaigns', () => {
        RequestManager.setTestAuctionProtocol(AuctionProtocol.V4);

        const china = new China(core);
        const arApi = TestFixtures.getARApi(nativeBridge);
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
        const programmaticTrackingService = sinon.createStubInstance(ProgrammaticTrackingService);
        const userPrivacyManager = new UserPrivacyManager(platform, core.Api, coreConfig, adsConfig, clientInfo, deviceInfo, requestManager, privacySDK);
        const adMobSignalFactory = sinon.createStubInstance(AdMobSignalFactory);
        (<sinon.SinonStub>adMobSignalFactory.getAdRequestSignal).returns(Promise.resolve(new AdMobSignal()));
        (<sinon.SinonStub>adMobSignalFactory.getOptionalSignal).returns(Promise.resolve(new AdMobOptionalSignal()));

        sandbox.stub(MabDecisionButtonTest, 'isValid').returns(true);
        const performance: Performance =  new Performance(arApi, core, ads, china);

        const mockRequest = sinon.mock(requestManager);
        mockRequest.expects('post').returns(Promise.resolve({
            response: JSON.stringify(CometVideoPlcCampaign)
        }));

        const onNewCampaignStub = sandbox.stub(AutomatedExperimentManager, 'onNewCampaign')
            .resolves();

        const assetManager = new AssetManager(platform, core.Api, new CacheManager(core.Api, wakeUpManager, requestManager, cacheBookkeeping), CacheMode.DISABLED, deviceInfo, cacheBookkeeping, programmaticTrackingService);
        contentTypeHandlerManager.addHandler(CometCampaignParser.ContentType, { parser: new CometCampaignParser(core), factory: new PerformanceAdUnitFactory(<PerformanceAdUnitParametersFactory>adUnitParametersFactory) });
        const campaignManager = new CampaignManager(platform, core, coreConfig, adsConfig, assetManager, sessionManager, adMobSignalFactory, requestManager, clientInfo, deviceInfo, metaDataManager, cacheBookkeeping, contentTypeHandlerManager, privacySDK, userPrivacyManager);

        if (implementsIOnCampaignListener(performance)) {
            performance.listenOnCampaigns(campaignManager.onCampaign);
        }

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
});
