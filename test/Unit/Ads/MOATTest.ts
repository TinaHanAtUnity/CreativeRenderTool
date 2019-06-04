import { MOAT } from 'Ads/Views/MOAT';
import { Platform } from 'Core/Constants/Platform';
import { NativeBridge } from 'Core/Native/Bridge/NativeBridge';
import { SdkApi } from 'Core/Native/Sdk';
import { Diagnostics } from 'Core/Utilities/Diagnostics';
import 'mocha';
import { assert } from 'chai';
import * as sinon from 'sinon';

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

            const muteVideo = true;
            moat = new MOAT(Platform.ANDROID, nativeBridge, muteVideo);
            diagnosticsTriggerStub = sinon.stub(Diagnostics, 'trigger');
        });

        afterEach(() => {
            diagnosticsTriggerStub.restore();
        });

        type IAssertionFunction = () => void;

        const tests: {
            event: any;
            assertions: IAssertionFunction;
        }[] = [{
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

    describe('MOAT player volume', () => {
        let moat: any;
        beforeEach(() => {
            const nativeBridge = sinon.createStubInstance(NativeBridge);
            const sdk: SdkApi = sinon.createStubInstance(SdkApi);
            nativeBridge.Sdk = sdk;
            const muteVideo = true;
            moat = new MOAT(Platform.ANDROID, nativeBridge, muteVideo);
        });

        it('should have correct volume value from boolean pass', () => {
            moat.render();
            assert.equal(moat.getPlayerVolume(), 0);
        });

        it('should have correct volume value from setVolume pass', () => {
            moat.setPlayerVolume(1);
            assert.equal(moat.getPlayerVolume(), 1);
        });
    });
});
