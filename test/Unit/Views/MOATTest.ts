import { IMoatData, IMoatIds } from 'Ads/Utilities/MoatViewabilityService';
import { MOAT } from 'Ads/Views/MOAT';
import { assert } from 'chai';
import { NativeBridge } from 'Common/Native/NativeBridge';
import { SdkApi } from 'Core/Native/Sdk';
import { Diagnostics } from 'Core/Utilities/Diagnostics';
import 'mocha';
import * as sinon from 'sinon';
import { TestFixtures } from 'TestHelpers/TestFixtures';

describe('MOAT', () => {
    describe('onMessage', () => {
        let diagnosticsTriggerStub: sinon.SinonStub;
        let logWarningStub: sinon.SinonStub;
        let moat: any;
        beforeEach(() => {
            const nativeBridge = sinon.createStubInstance(NativeBridge);
            const sdk: SdkApi = sinon.createStubInstance(SdkApi);
            nativeBridge.Sdk = sdk;
            logWarningStub = <sinon.SinonStub> sdk.logWarning;
            moat = new MOAT(nativeBridge);
            diagnosticsTriggerStub = sinon.stub(Diagnostics, 'trigger');
        });

        afterEach(() => {
            diagnosticsTriggerStub.restore();
        });

        type IAssertionFunction = () => void;

        const tests: Array<{
            event: any;
            assertions: IAssertionFunction;
        }> = [{
            event: {data: {type: 'MOATVideoError', error: 'test error'}},
            assertions: () => {
                sinon.assert.calledWithExactly(diagnosticsTriggerStub, 'moat_video_error', 'test error');
            }
        }, {
            event: {data: {type: 'loaded'}},
            assertions: () => {
                sinon.assert.notCalled(diagnosticsTriggerStub);
            }
        }, {
            event: {data: {}},
            assertions: () => {
                sinon.assert.notCalled(logWarningStub);
                sinon.assert.notCalled(diagnosticsTriggerStub);
            }
        }, {
            event: {data: {type: 'test'}},
            assertions: () => {
                sinon.assert.calledWithExactly(logWarningStub, 'MOAT Unknown message type test');
                sinon.assert.notCalled(diagnosticsTriggerStub);
            }
        }];

        tests.forEach((test) => {
            it('should pass assertions', () => {
                moat.onMessage(test.event);
                test.assertions();
            });
        });
    });
});

// disable all because failing hybrid tests for android devices that dont support html5
xdescribe('MOAT View', () => {

    let nativeBridge: NativeBridge;
    let moat: MOAT;

    beforeEach(() => {
        nativeBridge = TestFixtures.getNativeBridge();
        moat = new MOAT(nativeBridge);
    });

    // disabled because failing hybrid tests for android devices that dont support html5
    xdescribe('render', () => {

        beforeEach(() => {
            moat.render();
            document.body.appendChild(moat.container());
        });

        it ('should include moat container in the moat iframe', () => {
            const iframe = moat.container().querySelector('iframe')!;
            const srcdoc = iframe.getAttribute('srcdoc');

            assert.isNotNull(srcdoc);
            assert.isNotNull(moat.container().innerHTML);
            assert.isTrue(srcdoc!.indexOf(moat.container().querySelector('iframe')!.innerHTML) !== -1);
        });
    });

    describe('init', () => {
        let iframe: HTMLIFrameElement;
        let fakeMoatIds: IMoatIds;
        let fakeMoatData: IMoatData;
        let messageListener: sinon.SinonSpy;

        beforeEach(() => {
            moat.render();
            messageListener = sinon.spy();
            iframe = <HTMLIFrameElement>moat.container().querySelector('iframe');
            document.body.appendChild(moat.container());
            iframe.contentWindow!.addEventListener('message', messageListener);

            fakeMoatIds = {
                level1: 1,
                level2: 'test',
                level3: 'test',
                level4: 'test',
                slicer1: 'test',
                slicer2: 'test',
                slicer3: 'test'
            };

            fakeMoatData = {
                SDK: 'test',
                Version: 'test',
                SDKVersion: 'test',
                LimitAdTracking: false,
                COPPA: true,
                bundle: 'test'
            };
            moat.init(fakeMoatIds, 1, 'https://test.com', fakeMoatData, 1);
        });

        afterEach(() => {
            document.body.removeChild(moat.container());
            moat.hide();
        });

        it('should send the init message', () => {
            return new Promise((resolve, reject) => {
                setTimeout(() => {
                    try {
                        sinon.assert.called(messageListener);
                        const e = messageListener.getCall(0).args[0];
                        assert.equal(e.data.type, 'init', 'Passed in event was not "init"');
                        resolve();
                    } catch (e) {
                        reject(e);
                    }
                });
            });
        });
    });

    describe('triggering video event', () => {
        let iframe: HTMLIFrameElement;
        let messageListener: sinon.SinonSpy;

        beforeEach(() => {
            moat.render();
            messageListener = sinon.spy();
            iframe = <HTMLIFrameElement>moat.container().querySelector('iframe');
            document.body.appendChild(moat.container());
            iframe.contentWindow!.addEventListener('message', messageListener);
            moat.triggerVideoEvent('test', 1);
        });

        it ('should fire the video message', () => {
            return new Promise((resolve, reject) => {
                setTimeout(() => {
                    try {
                        sinon.assert.called(messageListener);
                        const e = messageListener.getCall(0).args[0];
                        assert.equal(e.data.type, 'videoEvent', 'Passed in event was not "videoEvent"');
                        resolve();
                    } catch (e) {
                        reject(e);
                    }
                });
            });
        });
    });

    describe('triggering viewability event', () => {
        let iframe: HTMLIFrameElement;
        let messageListener: sinon.SinonSpy;

        beforeEach(() => {
            moat.render();
            messageListener = sinon.spy();
            iframe = <HTMLIFrameElement>moat.container().querySelector('iframe');
            document.body.appendChild(moat.container());
            iframe.contentWindow!.addEventListener('message', messageListener);
            moat.triggerViewabilityEvent('testViewabilityEvent', 'test');
        });

        it ('should fire the viewability message of the specified type', () => {
            return new Promise((resolve, reject) => {
                setTimeout(() => {
                    try {
                        sinon.assert.called(messageListener);
                        const e = messageListener.getCall(0).args[0];
                        assert.equal(e.data.type, 'testViewabilityEvent', 'Passed in event was not "testViewabilityEvent"');
                        resolve();
                    } catch (e) {
                        reject(e);
                    }
                });
            });
        });
    });
});
