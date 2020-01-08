import { IAds } from 'Ads/IAds';
import { AutomatedExperimentManager, CachableAutomatedExperimentData, ContextualFeature } from 'Ads/Managers/AutomatedExperimentManager';
import { AutomatedExperiment } from 'Ads/Models/AutomatedExperiment';
import { Backend } from 'Backend/Backend';
import { assert } from 'chai';
import { Platform } from 'Core/Constants/Platform';
import { ICore } from 'Core/ICore';
import { INativeResponse } from 'Core/Managers/RequestManager';
import { NativeBridge } from 'Core/Native/Bridge/NativeBridge';
import { StorageType } from 'Core/Native/Storage';
import { TestFixtures } from 'TestHelpers/TestFixtures';

import 'mocha';
import * as sinon from 'sinon';

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

const FooExperimentNoCache = new AutomatedExperiment({
    name: 'FooExperiment',
    actions: FooExperimentDeclaration,
    defaultActions: FooExperimentDefaultActions,
    cacheDisabled: true
});

describe('AutomatedExperimentManagerTest', () => {
    const baseUrl = 'https://auiopt.unityads.unity3d.com/v2/';
    const createEndPoint = 'experiment';
    const rewardEndPoint = 'reward';

    const sandbox = sinon.createSandbox();
    let backend: Backend;
    let nativeBridge: NativeBridge;
    let core: ICore;
    let ads: IAds;

    beforeEach(() => {
        backend = TestFixtures.getBackend(Platform.ANDROID);
        nativeBridge = TestFixtures.getNativeBridge(Platform.ANDROID, backend);
        core = TestFixtures.getCoreModule(nativeBridge);
        ads = TestFixtures.getAdsModule(core);
        core.Ads = ads;
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
        free_external_space: 10159440,
        battery_level: 1,
        battery_status: 'BATTERY_STATUS_UNKNOWN',
        usb_connected: false,
        free_memory: 1000000,
        total_memory: 1899508,
        ringer_mode: 'RINGER_MODE_SILENT',
        network_metered: false,
        screen_brightness: 1,
        local_day_time: 10.5
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
        const getStub = sandbox.stub(core.Api.Storage, 'get')
            .withArgs(StorageType.PRIVATE, 'AUI_OPT_EXPERIMENT_FooExperiment')
            .rejects();

        const setStub = sandbox.stub(core.Api.Storage, 'set')
            .resolves();

        const writeStub = sandbox.stub(core.Api.Storage, 'write')
            .resolves();

        const postStub = sandbox.stub(core.RequestManager, 'post')
            .resolves(<INativeResponse>{
                responseCode: 200,
                response: ''
            });

        const aem = new AutomatedExperimentManager(core);
        return aem.initialize([]).then(() => {
            assert.isFalse(postStub.called);
            assert.isFalse(getStub.called);
            assert.isFalse(setStub.called);
            assert.isFalse(writeStub.called);
        });
    });

    [
        {action1: FooExperimentDeclaration.action1.choiceA, action2: FooExperimentDeclaration.action2.choiceA},
        {action1: FooExperimentDeclaration.action1.choiceA, action2: FooExperimentDeclaration.action2.choiceB},
        {action1: FooExperimentDeclaration.action1.choiceB, action2: FooExperimentDeclaration.action2.choiceA},
        {action1: FooExperimentDeclaration.action1.choiceB, action2: FooExperimentDeclaration.action2.choiceB}
    ].forEach((action) => {
        it(`initialize with request ok, use received action ${JSON.stringify(action)}`, () => {
            const getStub = sandbox.stub(core.Api.Storage, 'get')
                .withArgs(StorageType.PRIVATE, 'AUI_OPT_EXPERIMENT_FooExperiment')
                .rejects();

            const setStub = sandbox.stub(core.Api.Storage, 'set')
                .withArgs(StorageType.PRIVATE, 'AUI_OPT_EXPERIMENT_FooExperiment', new CachableAutomatedExperimentData(action, ''))
                .resolves();

            const writeStub = sandbox.stub(core.Api.Storage, 'write')
                .resolves();

            const postUrl = baseUrl + createEndPoint;
            const responseText = JSON.stringify({experiments: {FooExperiment: action}});

            const postStub = sandbox.stub(core.RequestManager, 'post')
                .withArgs(postUrl)
                .resolves(<INativeResponse>{
                    responseCode: 200,
                    response: responseText
                });

            const aem = new AutomatedExperimentManager(core);
            return aem.initialize([FooExperiment]).then(() => {
                assert.isTrue(postStub.called);
                assert.isTrue(ValidateFeaturesInRequestBody(postStub.firstCall.args[1]));
                assert.isTrue(getStub.called);
                assert.isTrue(setStub.called);
                assert.isTrue(writeStub.called);

                assert.equal(JSON.stringify(aem.getExperimentAction(FooExperiment)), JSON.stringify(action), 'Wrong variant...');
            });
        });
    });

    [
        {action1: FooExperimentDeclaration.action1.choiceB, action2: 'badAction'},
        {action1: 'badAction', action2: FooExperimentDeclaration.action2.choiceA}
    ].forEach((action) => {
        it(`initialize with request ok, use received action ${JSON.stringify(action)}, failed to parse`, () => {
            const getStub = sandbox.stub(core.Api.Storage, 'get')
                .withArgs(StorageType.PRIVATE, 'AUI_OPT_EXPERIMENT_FooExperiment')
                .rejects();

            const setStub = sandbox.stub(core.Api.Storage, 'set')
                .withArgs(StorageType.PRIVATE, 'AUI_OPT_EXPERIMENT_FooExperiment', new CachableAutomatedExperimentData(action, ''))
                .resolves();

            const writeStub = sandbox.stub(core.Api.Storage, 'write')
                .resolves();

            const postUrl = baseUrl + createEndPoint;
            const responseText = 'not json';

            const postStub = sandbox.stub(core.RequestManager, 'post')
                .withArgs(postUrl)
                .resolves(<INativeResponse>{
                    responseCode: 200,
                    response: responseText
                });

            const aem = new AutomatedExperimentManager(core);
            return aem.initialize([FooExperiment]).then(() => {
                assert.isTrue(postStub.called);
                assert.isTrue(getStub.called);
                assert.isFalse(setStub.called);
                assert.isFalse(writeStub.called);

                assert.isTrue(ValidateFeaturesInRequestBody(postStub.firstCall.args[1]));

                assert.equal(JSON.stringify(aem.getExperimentAction(FooExperiment)), JSON.stringify(FooExperimentDefaultActions), 'Wrong variant...');
            });
        });
    });

    it('initialize with request failure, use default action', () => {
        const getStub = sandbox.stub(core.Api.Storage, 'get')
            .withArgs(StorageType.PRIVATE, 'AUI_OPT_EXPERIMENT_FooExperiment')
            .rejects();

        const setStub = sandbox.stub(core.Api.Storage, 'set')
            .withArgs(StorageType.PRIVATE, 'AUI_OPT_EXPERIMENT_FooExperiment', new CachableAutomatedExperimentData(FooExperimentDefaultActions, ''))
            .resolves();

        const writeStub = sandbox.stub(core.Api.Storage, 'write')
            .resolves();

        const postUrl = baseUrl + createEndPoint;
        const responseText = JSON.stringify({});

        const postStub = sandbox.stub(core.RequestManager, 'post')
            .withArgs(postUrl)
            .resolves(<INativeResponse>{
                responseCode: 500,
                response: responseText
            });

        const aem = new AutomatedExperimentManager(core);
        return aem.initialize([FooExperiment]).then(() => {
            assert.isTrue(postStub.called);
            assert.isTrue(getStub.called);
            assert.isFalse(setStub.called);
            assert.isFalse(writeStub.called);

            assert.isTrue(ValidateFeaturesInRequestBody(postStub.firstCall.args[1]));

            assert.equal(JSON.stringify(aem.getExperimentAction(FooExperiment)), JSON.stringify(FooExperimentDefaultActions), 'Wrong variant...');
        });
    });

    [
        {action1: FooExperimentDeclaration.action1.choiceA, action2: FooExperimentDeclaration.action2.choiceA},
        {action1: FooExperimentDeclaration.action1.choiceA, action2: FooExperimentDeclaration.action2.choiceB},
        {action1: FooExperimentDeclaration.action1.choiceB, action2: FooExperimentDeclaration.action2.choiceA},
        {action1: FooExperimentDeclaration.action1.choiceB, action2: FooExperimentDeclaration.action2.choiceB}
    ].forEach((action) => {
        it(`initialize with cached action ${JSON.stringify(action)}`, () => {
            const storedData = new CachableAutomatedExperimentData(action, '');

            const getStub = sandbox.stub(core.Api.Storage, 'get')
                .withArgs(StorageType.PRIVATE, 'AUI_OPT_EXPERIMENT_FooExperiment')
                .resolves(storedData);

            const setStub = sandbox.stub(core.Api.Storage, 'set')
                .withArgs(StorageType.PRIVATE, 'AUI_OPT_EXPERIMENT_FooExperiment', storedData)
                .rejects();

            const writeStub = sandbox.stub(core.Api.Storage, 'write')
                .rejects();

            const postStub = sandbox.stub(core.RequestManager, 'post');

            const aem = new AutomatedExperimentManager(core);
            return aem.initialize([FooExperiment]).then(() => {
                assert.isFalse(postStub.called);
                assert.isTrue(getStub.called);
                assert.isFalse(setStub.called);
                assert.isFalse(writeStub.called);

                assert.equal(aem.getExperimentAction(FooExperiment), action, 'Wrong variant...');
            });
        });
    });

    [
        [
            {action1: FooExperimentDeclaration.action1.choiceA, action2: FooExperimentDeclaration.action2.choiceA},
            {action1: FooExperimentDeclaration.action1.choiceB, action2: FooExperimentDeclaration.action2.choiceB}
        ],
        [
            {action1: FooExperimentDeclaration.action1.choiceB, action2: FooExperimentDeclaration.action2.choiceB},
            {action1: FooExperimentDeclaration.action1.choiceA, action2: FooExperimentDeclaration.action2.choiceA}
        ]
    ].forEach(([action, expected]) => {
        it(`initialize with cached experiment, ignore cached action ${JSON.stringify(action)}`, () => {
            const storableData = new CachableAutomatedExperimentData(expected, '');

            const getStub = sandbox.stub(core.Api.Storage, 'get')
                .withArgs(StorageType.PRIVATE, 'AUI_OPT_EXPERIMENT_FooExperiment')
                .resolves(storableData);

            const setStub = sandbox.stub(core.Api.Storage, 'set')
                .withArgs(StorageType.PRIVATE, 'AUI_OPT_EXPERIMENT_FooExperiment', storableData)
                .resolves();

            const writeStub = sandbox.stub(core.Api.Storage, 'write')
                .resolves();

            const postUrl = baseUrl + createEndPoint;
            const responseText = JSON.stringify({experiments: {FooExperiment: expected}});

            const postStub = sandbox.stub(core.RequestManager, 'post')
                .withArgs(postUrl)
                .resolves(<INativeResponse>{
                    responseCode: 200,
                    response: responseText
                });

            const aem = new AutomatedExperimentManager(core);
            return aem.initialize([FooExperimentNoCache]).then(() => {
                assert.isTrue(postStub.called);
                assert.isFalse(getStub.called);
                assert.isTrue(setStub.called);
                assert.isTrue(writeStub.called);
                assert.isTrue(ValidateFeaturesInRequestBody(postStub.firstCall.args[1]));
                assert.equal(JSON.stringify(aem.getExperimentAction(FooExperimentNoCache)), JSON.stringify(expected), 'Wrong variant...');
            });
        });
    });

    [0, 1].forEach((rewarded) => {
        it(`experiment, rewarded(${rewarded})`, () => {
            let getStub = sandbox.stub(core.Api.Storage, 'get');
            getStub = getStub.withArgs(StorageType.PRIVATE, 'AUI_OPT_EXPERIMENT_FooExperiment').rejects();

            let setStub = sandbox.stub(core.Api.Storage, 'set');
            setStub = setStub.withArgs(StorageType.PRIVATE, 'AUI_OPT_EXPERIMENT_FooExperiment', new CachableAutomatedExperimentData(FooExperimentDefaultActions, ''));

            sandbox.stub(core.Api.Storage, 'write').resolves();

            const postStub = sandbox.stub(core.RequestManager, 'post');

            const responseText = JSON.stringify({experiments: {FooExperiment: FooExperimentDefaultActions}});
            postStub.onCall(0).resolves(<INativeResponse>{
                responseCode: 200,
                response: responseText
            });

            const rewardPostUrl = baseUrl + rewardEndPoint;
            const rewardRequestBodyText = JSON.stringify({
                user_info: {ab_group: 99}, experiment: 'FooExperiment', actions: FooExperimentDefaultActions, reward: rewarded, metadata: ''
            });
            const rewardResponseText = JSON.stringify({success: true});
            const postStubReward = postStub.onCall(2).resolves(<INativeResponse>{
                responseCode: 200,
                response: rewardResponseText
            });

            const aem = new AutomatedExperimentManager(core);
            return aem.initialize([FooExperiment]).then(() => {
                aem.beginExperiment();
                const variant = aem.getExperimentAction(FooExperiment);

                assert.equal(JSON.stringify(variant), JSON.stringify(FooExperimentDefaultActions), 'Wrong variant name');

                aem.sendAction(FooExperiment, undefined);
                if (rewarded) {
                    aem.sendReward();
                }
            }).then(() => {
                return aem.endExperiment();
            }).then(() => {
                assert(postStub.calledTwice);
                assert(postStubReward.calledWith(rewardPostUrl, rewardRequestBodyText));
            });
        });
    });

    it('EndExperiment should fail if called before beginExperiment', (done) => {
        const aem = new AutomatedExperimentManager(core);
        aem.initialize([]).then(() => {
            aem.endExperiment().catch(() => { done(); });
        });
    });
});
