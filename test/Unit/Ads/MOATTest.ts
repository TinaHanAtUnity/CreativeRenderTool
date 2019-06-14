import { MOAT } from 'Ads/Views/MOAT';
import { Platform } from 'Core/Constants/Platform';
import { NativeBridge } from 'Core/Native/Bridge/NativeBridge';
import { SdkApi } from 'Core/Native/Sdk';
import { Diagnostics } from 'Core/Utilities/Diagnostics';
import 'mocha';
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

    const InitMoatWithPlayerVolume = (muteVideo: boolean) => {
        const nativeBridge = sinon.createStubInstance(NativeBridge);
        const sdk: SdkApi = sinon.createStubInstance(SdkApi);
        nativeBridge.Sdk = sdk;

        return new MOAT(Platform.ANDROID, nativeBridge, muteVideo);
    };

    const MockDom = () => {
        const postMessage = sinon.stub();

        const iframe = {
            contentWindow: {
                postMessage
            },
            srcdoc: ''
        };

        const container = {
            querySelector: sinon.stub().returns(iframe)
        };

        const createElement = sinon.stub(document, 'createElement').callsFake((name: string) => {
            if (name === 'div') {
                createElement.restore();
                return container;
            }
            throw new Error('Not supported');
        });

        return {
            postMessage
        };
    };

    [true, false].forEach(muteVideo =>
        describe(`MOAT player volume placement muted, initial mute: ${muteVideo}`, () => {
            let moat: MOAT;
            let mockedDom: { postMessage: sinon.SinonStub };
            const expectedAdVolumeAfterInit = muteVideo ? 0 : 1;

             beforeEach(() => {
                mockedDom = MockDom();
                moat = InitMoatWithPlayerVolume(muteVideo);
            });

            it('should have correct volume after initialization', () => {
                moat.render();
                moat.triggerVideoEvent('test', 0.3);

                 sinon.assert.calledWith(mockedDom.postMessage,
                    {
                        type: 'videoEvent',
                        data: {
                            type: 'test',
                            adVolume: expectedAdVolumeAfterInit,
                            volume: 0.3
                        }
                    }
                );
            });

            it('should have the correct player volume after player volume set to nonmuted', () => {
                moat.render();
                moat.setPlayerVolume(1);
                moat.triggerVideoEvent('test', 0.3);

                 sinon.assert.calledWith(mockedDom.postMessage,
                    {
                        type: 'videoEvent',
                        data: {
                            type: 'test',
                            adVolume: 1,
                            volume: 0.3
                        }
                    }
                );
            });

            it('should have the correct player volume after player volume set to muted', () => {
                moat.render();
                moat.setPlayerVolume(0);
                moat.triggerVideoEvent('test', 0.1);

                 sinon.assert.calledWith(mockedDom.postMessage,
                    {
                        type: 'videoEvent',
                        data: {
                            type: 'test',
                            adVolume: 0,
                            volume: 0.1
                        }
                    }
                );
            });
        })
    );
});
