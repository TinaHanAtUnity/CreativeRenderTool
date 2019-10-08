import 'mocha';
import * as sinon from 'sinon';
import { assert } from 'chai';
import { ICore } from 'Core/ICore';
import { TestFixtures } from 'TestHelpers/TestFixtures';
import { Platform } from 'Core/Constants/Platform';
import { Backend } from 'Backend/Backend';
import { NativeBridge } from 'Core/Native/Bridge/NativeBridge';
import { AutomatedExperiment } from 'Ads/Models/AutomatedExperiment';
import { AutomatedExperimentManager } from 'Ads/Managers/AutomatedExperimentManager';
import { StorageType } from 'Core/Native/Storage';
import { INativeResponse } from 'Core/Managers/RequestManager';
import { Diagnostics } from 'Core/Utilities/Diagnostics';

const FooExperiment = new AutomatedExperiment({
    name: 'FooExperiment',
    actions: ['FooAction1', 'FooAction2'],
    defaultAction: 'FooAction2'
});

const FooExperimentNoCache = new AutomatedExperiment({
    name: 'FooExperiment',
    actions: ['FooAction1', 'FooAction2'],
    defaultAction: 'FooAction1',
    cacheDisabled: true
});

describe('AutomatedExperimentManager test', () => {
    const baseUrl = 'https://auiopt.unityads.unity3d.com/v1/';
    const createEndPoint = 'experiment';
    const actionEndPoint = 'action';
    const rewardEndPoint = 'reward';

    const sandbox = sinon.createSandbox();
    let backend: Backend;
    let nativeBridge: NativeBridge;
    let core: ICore;
    let diagnosticTrigger: sinon.SinonStub;

    beforeEach(() => {
        backend = TestFixtures.getBackend(Platform.ANDROID);
        nativeBridge = TestFixtures.getNativeBridge(Platform.ANDROID, backend);
        core = TestFixtures.getCoreModule(nativeBridge);
        diagnosticTrigger = sandbox.stub(Diagnostics, 'trigger');
    });

    afterEach(() => {
        sandbox.restore();
    });

    it(`initialize with request ok, no experiments`, () => {
        const getStub = sandbox.stub(core.Api.Storage, 'get')
            .withArgs(StorageType.PRIVATE, 'AUI_OPT_EXPERIMENT_FooExperiment')
            .rejects();

        const setStub = sandbox.stub(core.Api.Storage, 'set')
            .resolves();

        const writeStub = sandbox.stub(core.Api.Storage, 'write')
            .resolves();

        const postUrl = baseUrl + createEndPoint;

        const postStub = sandbox.stub(core.RequestManager, 'post')
            .resolves(<INativeResponse>{
                responseCode: 200,
                response: ''
            });

        const aem = new AutomatedExperimentManager(core.RequestManager, core.Api.Storage);
        return aem.initialize([]).then(() => {
            assert.isFalse(postStub.called);
            assert.isFalse(getStub.called);
            assert.isFalse(setStub.called);
            assert.isFalse(writeStub.called);
        });
    });

    ['FooAction1', 'FooAction2'].forEach((action) => {
        it(`initialize with request ok, use received action ${action}`, () => {
            const getStub = sandbox.stub(core.Api.Storage, 'get')
                .withArgs(StorageType.PRIVATE, 'AUI_OPT_EXPERIMENT_FooExperiment')
                .rejects();

            const setStub = sandbox.stub(core.Api.Storage, 'set')
                .withArgs(StorageType.PRIVATE, 'AUI_OPT_EXPERIMENT_FooExperiment', action)
                .resolves();

            const writeStub = sandbox.stub(core.Api.Storage, 'write')
                .resolves();

            const postUrl = baseUrl + createEndPoint;
            const requestBodyText = JSON.stringify({experiments: [{name: 'FooExperiment', actions: ['FooAction1', 'FooAction2']}]});
            const responseText = JSON.stringify({experiments: {FooExperiment: action}});

            const postStub = sandbox.stub(core.RequestManager, 'post')
                .withArgs(postUrl, requestBodyText)
                .resolves(<INativeResponse>{
                    responseCode: 200,
                    response: responseText
                });

            const aem = new AutomatedExperimentManager(core.RequestManager, core.Api.Storage);
            return aem.initialize([FooExperiment]).then(() => {
                assert.isTrue(postStub.called);
                assert.isTrue(getStub.called);
                assert.isTrue(setStub.called);
                assert.isTrue(writeStub.called);

                assert.equal(aem.getExperimentAction(FooExperiment), action, 'Wrong variant...');
            });
        });
    });

    ['FooAction1', 'FooAction2'].forEach((action) => {
        it(`initialize with request ok, use received action ${action}, failed to parse`, () => {
            const getStub = sandbox.stub(core.Api.Storage, 'get')
                .withArgs(StorageType.PRIVATE, 'AUI_OPT_EXPERIMENT_FooExperiment')
                .rejects();

            const setStub = sandbox.stub(core.Api.Storage, 'set')
                .withArgs(StorageType.PRIVATE, 'AUI_OPT_EXPERIMENT_FooExperiment', action)
                .resolves();

            const writeStub = sandbox.stub(core.Api.Storage, 'write')
                .resolves();

            const postUrl = baseUrl + createEndPoint;
            const requestBodyText = JSON.stringify({experiments: [{name: 'FooExperiment', actions: ['FooAction1', 'FooAction2']}]});
            const responseText = 'not json';

            const postStub = sandbox.stub(core.RequestManager, 'post')
                .withArgs(postUrl, requestBodyText)
                .resolves(<INativeResponse>{
                    responseCode: 200,
                    response: responseText
                });

            const aem = new AutomatedExperimentManager(core.RequestManager, core.Api.Storage);
            return aem.initialize([FooExperiment]).then(() => {
                assert.isTrue(postStub.called);
                assert.isTrue(getStub.called);
                assert.isFalse(setStub.called);
                assert.isFalse(writeStub.called);

                assert.equal(aem.getExperimentAction(FooExperiment), 'FooAction2', 'Wrong variant...');

                assert.isTrue(diagnosticTrigger.calledOnce);
                assert.equal(diagnosticTrigger.firstCall.args[0], 'failed_to_parse_automated_experiments');
                assert.equal(diagnosticTrigger.firstCall.args[1].message, 'Unexpected token o in JSON at position 1');
            });
        });
    });

    it('initialize with request failure, use default action', () => {
        const getStub = sandbox.stub(core.Api.Storage, 'get')
            .withArgs(StorageType.PRIVATE, 'AUI_OPT_EXPERIMENT_FooExperiment')
            .rejects();

        const setStub = sandbox.stub(core.Api.Storage, 'set')
            .withArgs(StorageType.PRIVATE, 'AUI_OPT_EXPERIMENT_FooExperiment', 'FooAction1')
            .resolves();

        const writeStub = sandbox.stub(core.Api.Storage, 'write')
            .resolves();

        const postUrl = baseUrl + createEndPoint;
        const requestBodyText = JSON.stringify({experiments: [{name: 'FooExperiment', actions: ['FooAction1', 'FooAction2']}]});
        const responseText = JSON.stringify({});

        const postStub = sandbox.stub(core.RequestManager, 'post')
            .withArgs(postUrl, requestBodyText)
            .resolves(<INativeResponse>{
                responseCode: 500,
                response: responseText
            });

        const aem = new AutomatedExperimentManager(core.RequestManager, core.Api.Storage);
        return aem.initialize([FooExperiment]).then(() => {
            assert.isTrue(postStub.called);
            assert.isTrue(getStub.called);
            assert.isFalse(setStub.called);
            assert.isFalse(writeStub.called);

            assert.equal(aem.getExperimentAction(FooExperiment), 'FooAction2', 'Wrong variant...');

            assert.isTrue(diagnosticTrigger.calledOnce);
            assert.equal(diagnosticTrigger.firstCall.args[0], 'failed_to_fetch_automated_experiments');
            assert.equal(diagnosticTrigger.firstCall.args[1].message, 'Failed to fetch response from aui service');
        });
    });

    ['FooAction1', 'FooAction2'].forEach((action) => {
        it(`initialize with cached action ${action}`, () => {
            const getStub = sandbox.stub(core.Api.Storage, 'get')
                .withArgs(StorageType.PRIVATE, 'AUI_OPT_EXPERIMENT_FooExperiment')
                .resolves(action);

            const setStub = sandbox.stub(core.Api.Storage, 'set')
                .withArgs(StorageType.PRIVATE, 'AUI_OPT_EXPERIMENT_FooExperiment', 'FooAction1')
                .rejects();

            const writeStub = sandbox.stub(core.Api.Storage, 'write')
                .rejects();

            const postStub = sandbox.stub(core.RequestManager, 'post');

            const aem = new AutomatedExperimentManager(core.RequestManager, core.Api.Storage);
            return aem.initialize([FooExperiment]).then(() => {
                assert.isFalse(postStub.called);
                assert.isTrue(getStub.called);
                assert.isFalse(setStub.called);
                assert.isFalse(writeStub.called);

                assert.equal(aem.getExperimentAction(FooExperiment), action, 'Wrong variant...');
            });
        });
    });

    [['FooAction1', 'FooAction2'], ['FooAction2', 'FooAction1']].forEach(([action, expected]) => {
        it(`initialize with cached experiment, ignore cached action ${action}`, () => {
            const getStub = sandbox.stub(core.Api.Storage, 'get')
                .withArgs(StorageType.PRIVATE, 'AUI_OPT_EXPERIMENT_FooExperiment')
                .resolves(action);

            const setStub = sandbox.stub(core.Api.Storage, 'set')
                .withArgs(StorageType.PRIVATE, 'AUI_OPT_EXPERIMENT_FooExperiment', expected)
                .resolves();

            const writeStub = sandbox.stub(core.Api.Storage, 'write')
                .resolves();

            const postUrl = baseUrl + createEndPoint;
            const requestBodyText = JSON.stringify({experiments: [{name: 'FooExperiment', actions: ['FooAction1', 'FooAction2']}]});
            const responseText = JSON.stringify({experiments: {FooExperiment: expected}});

            const postStub = sandbox.stub(core.RequestManager, 'post')
                .withArgs(postUrl, requestBodyText)
                .resolves(<INativeResponse>{
                    responseCode: 200,
                    response: responseText
                });

            const aem = new AutomatedExperimentManager(core.RequestManager, core.Api.Storage);
            return aem.initialize([FooExperimentNoCache]).then(() => {
                assert.isTrue(postStub.called);
                assert.isFalse(getStub.called);
                assert.isTrue(setStub.called);
                assert.isTrue(writeStub.called);

                assert.equal(aem.getExperimentAction(FooExperimentNoCache), expected, 'Wrong variant...');
            });
        });
    });

    it('experiment, rewarded', () => {
        let getStub = sandbox.stub(core.Api.Storage, 'get');
        getStub = getStub.withArgs(StorageType.PRIVATE, 'AUI_OPT_EXPERIMENT_FooExperiment').rejects();

        let setStub = sandbox.stub(core.Api.Storage, 'set');
        setStub = setStub.withArgs(StorageType.PRIVATE, 'AUI_OPT_EXPERIMENT_FooExperiment', 'FooAction1');

        sandbox.stub(core.Api.Storage, 'write').resolves();

        const postStub = sandbox.stub(core.RequestManager, 'post');

        const responseText = JSON.stringify({experiments: {FooExperiment: 'FooAction1'}});
        postStub.onCall(0).resolves(<INativeResponse>{
            responseCode: 200,
            response: responseText
        });

        const actionPostUrl = baseUrl + actionEndPoint;
        const actionRequestBodyText = JSON.stringify({experiment: 'FooExperiment', action: 'FooAction1'});
        const actionResponseText = JSON.stringify({success: true});
        const postStubAction = postStub.onCall(1).resolves(<INativeResponse>{
            responseCode: 200,
            response: actionResponseText
        });

        const rewardPostUrl = baseUrl + rewardEndPoint;
        const rewardRequestBodyText = JSON.stringify({experiment: 'FooExperiment', action: 'FooAction1'});
        const rewardResponseText = JSON.stringify({success: true});
        const postStubReward = postStub.onCall(2).resolves(<INativeResponse>{
            responseCode: 200,
            response: rewardResponseText
        });

        const aem = new AutomatedExperimentManager(core.RequestManager, core.Api.Storage);
        return aem.initialize([FooExperiment]).then(() => {
            aem.beginExperiment();
            const variant = aem.getExperimentAction(FooExperiment);

            assert.equal(variant, 'FooAction1', 'Wrong variant name');

            aem.sendAction(FooExperiment);
            aem.sendReward();

        }).then(() => {
            return aem.endExperiment();
        }).then(() => {
            assert(postStub.calledThrice);
            assert(postStubAction.calledWith(actionPostUrl, actionRequestBodyText));
            assert(postStubReward.calledWith(rewardPostUrl, rewardRequestBodyText));
        });
    });

    it('experiment, non-rewarded', () => {
        let getStub = sandbox.stub(core.Api.Storage, 'get');
        getStub = getStub.withArgs(StorageType.PRIVATE, 'AUI_OPT_EXPERIMENT_FooExperiment').rejects();

        let setStub = sandbox.stub(core.Api.Storage, 'set');
        setStub = setStub.withArgs(StorageType.PRIVATE, 'AUI_OPT_EXPERIMENT_FooExperiment', 'FooAction1');

        sandbox.stub(core.Api.Storage, 'write').resolves();

        const postStub = sandbox.stub(core.RequestManager, 'post');

        const responseText = JSON.stringify({experiments: {FooExperiment: 'FooAction1'}});
        postStub.onCall(0).resolves(<INativeResponse>{
            responseCode: 200,
            response: responseText
        });

        const actionPostUrl = baseUrl + actionEndPoint;
        const actionRequestBodyText = JSON.stringify({experiment: 'FooExperiment', action: 'FooAction1'});
        const actionResponseText = JSON.stringify({success: true});
        const postStubAction = postStub.onCall(1).resolves(<INativeResponse>{
            responseCode: 200,
            response: actionResponseText
        });

        const rewardResponseText = JSON.stringify({success: true});
        const postStubReward = postStub.onCall(2).resolves(<INativeResponse>{
            responseCode: 200,
            response: rewardResponseText
        });

        const aem = new AutomatedExperimentManager(core.RequestManager, core.Api.Storage);
        return aem.initialize([FooExperiment]).then(() => {
            aem.beginExperiment();
            const variant = aem.getExperimentAction(FooExperiment);

            assert.equal(variant, 'FooAction1', 'Wrong variant name');

            aem.sendAction(FooExperiment);

        }).then(() => {
            return aem.endExperiment();
        }).then(() => {
            assert(postStub.calledTwice);
            assert(postStubAction.calledWith(actionPostUrl, actionRequestBodyText));
            assert.isFalse(postStubReward.notCalled);
        });
    });

    it('EndExperiment should fail if called before beginExperiment', (done) => {
        const aem = new AutomatedExperimentManager(core.RequestManager, core.Api.Storage);
        aem.initialize([]).then(() => {
            aem.endExperiment().catch(() => { done(); });
        });
    });
});
