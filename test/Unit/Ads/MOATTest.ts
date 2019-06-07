import { MOAT, MoatState } from 'Ads/Views/MOAT';
import { Platform } from 'Core/Constants/Platform';
import { NativeBridge } from 'Core/Native/Bridge/NativeBridge';
import { SdkApi } from 'Core/Native/Sdk';
import { Diagnostics } from 'Core/Utilities/Diagnostics';
import 'mocha';
import * as sinon from 'sinon';
import { assert } from 'chai';

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

            it('should have the correct player volume after player volume set', () => {
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
        })
    );

    describe(`MOAT player public methods`, () => {
        let moat: MOAT;
        let mockedDom: { postMessage: sinon.SinonStub };

        beforeEach(() => {
            mockedDom = MockDom();
            moat = InitMoatWithPlayerVolume(false);
        });

        it('should send message on play', () => {
            moat.render();

            moat.play(0.5);
            moat.pause(0.5);

            mockedDom.postMessage.reset();

            moat.play(0.4);

            assert.equal(moat.getState(), MoatState.PLAYING);

            sinon.assert.calledWith(mockedDom.postMessage,
                {
                    type: 'videoEvent',
                    data: {
                        type: 'AdPlaying',
                        adVolume: 1,
                        volume: 0.4
                    }
                }
            );

            sinon.assert.calledWith(mockedDom.postMessage,
                {
                    payload: true,
                    type: 'exposure'
                }
            );

            sinon.assert.calledTwice(mockedDom.postMessage);
        });

        it('should send message on play from paused state', () => {
            moat.render();
            moat.play(0.5);

            assert.equal(moat.getState(), MoatState.PLAYING);

            sinon.assert.calledWith(mockedDom.postMessage,
                {
                    type: 'videoEvent',
                    data: {
                        type: 'AdPlaying',
                        adVolume: 1,
                        volume: 0.5
                    }
                }
            );

            sinon.assert.calledWith(mockedDom.postMessage,
                {
                    payload: true,
                    type: 'exposure'
                }
            );

            sinon.assert.calledTwice(mockedDom.postMessage);
        });

        it('should not send message on play in play state', () => {
            moat.render();

            moat.play(0.5);

            mockedDom.postMessage.reset();

            moat.play(0.5);

            sinon.assert.notCalled(mockedDom.postMessage);
        });

        it('should not send message on play in completed state', () => {
            moat.render();

            moat.completed(0.5);

            mockedDom.postMessage.reset();

            moat.play(0.5);

            sinon.assert.notCalled(mockedDom.postMessage);
        });

        it('should send message on pause', () => {
            moat.render();

            moat.play(0.5);

            mockedDom.postMessage.reset();

            moat.pause(0.5);

            assert.equal(moat.getState(), MoatState.PAUSED);

            sinon.assert.calledWith(mockedDom.postMessage,
                {
                    type: 'videoEvent',
                    data: {
                        type: 'AdPaused',
                        adVolume: 1,
                        volume: 0.5
                    }
                }
            );

            sinon.assert.calledWith(mockedDom.postMessage,
                {
                    payload: false,
                    type: 'exposure'
                }
            );

            sinon.assert.calledTwice(mockedDom.postMessage);
        });

        it('should not send message on pause in non play state', () => {
            moat.render();

            moat.completed(0.5);

            mockedDom.postMessage.reset();

            moat.pause(0.5);

            sinon.assert.notCalled(mockedDom.postMessage);
        });

        it('should send message on stop when play state', () => {
            moat.render();
            moat.play(0.5);

            mockedDom.postMessage.reset();

            moat.stop(0.7);

            assert.equal(moat.getState(), MoatState.STOPPED);

            sinon.assert.calledWith(mockedDom.postMessage,
                {
                    type: 'videoEvent',
                    data: {
                        type: 'AdStopped',
                        adVolume: 1,
                        volume: 0.7
                    }
                }
            );

            sinon.assert.calledOnce(mockedDom.postMessage);
        });

        it('should send message on stop when paused state', () => {
            moat.render();

            moat.play(0.5);
            moat.pause(0.5);

            mockedDom.postMessage.reset();

            moat.stop(0.7);

            assert.equal(moat.getState(), MoatState.STOPPED);

            sinon.assert.calledWith(mockedDom.postMessage,
                {
                    type: 'videoEvent',
                    data: {
                        type: 'AdStopped',
                        adVolume: 1,
                        volume: 0.7
                    }
                }
            );

            sinon.assert.calledOnce(mockedDom.postMessage);
        });

        it('should not send message on stop in completed state', () => {
            moat.render();

            moat.completed(0.5);

            mockedDom.postMessage.reset();

            moat.stop(0.5);

            sinon.assert.notCalled(mockedDom.postMessage);
        });

        it('should send message on completed', () => {
            moat.render();

            moat.completed(0.6);

            assert.equal(moat.getState(), MoatState.COMPLETED);

            sinon.assert.calledWith(mockedDom.postMessage,
                {
                    type: 'videoEvent',
                    data: {
                        type: 'AdVideoComplete',
                        adVolume: 1,
                        volume: 0.6
                    }
                }
            );

            sinon.assert.calledOnce(mockedDom.postMessage);
        });

        it('should not send message on completed in completed state', () => {
            moat.render();

            moat.completed(0.5);

            mockedDom.postMessage.reset();

            moat.completed(0.5);

            sinon.assert.notCalled(mockedDom.postMessage);
        });

        it('should send message on volumeChange', () => {
            moat.render();
            moat.volumeChange(0.5);

            sinon.assert.calledWith(mockedDom.postMessage,
                {
                    type: 'videoEvent',
                    data: {
                        type: 'AdVolumeChange',
                        adVolume: 1,
                        volume: 0.5
                    }
                }
            );

            sinon.assert.calledWith(mockedDom.postMessage,
                {
                    payload: 50,
                    type: 'volume'
                }
            );

            sinon.assert.calledTwice(mockedDom.postMessage);
        });

        it('should not send message on volumeChange in completed state', () => {
            moat.render();

            moat.completed(0.5);

            mockedDom.postMessage.reset();

            moat.volumeChange(0.5);

            sinon.assert.notCalled(mockedDom.postMessage);
        });
    });
});
