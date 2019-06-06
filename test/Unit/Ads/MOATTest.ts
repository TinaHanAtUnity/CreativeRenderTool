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

    const InitMoatWithPlayerVolume = (muteVideo: boolean, iframe: HTMLIFrameElement, container: HTMLElement) => {
        const nativeBridge = sinon.createStubInstance(NativeBridge);
        const sdk: SdkApi = sinon.createStubInstance(SdkApi);
        nativeBridge.Sdk = sdk;

        return new MOAT(Platform.ANDROID, nativeBridge, muteVideo);
    };

    describe('MOAT player volume placement muted', () => {
        let moat: MOAT;
        let iframe: HTMLIFrameElement;
        let container: HTMLElement;

        beforeEach(() => {
            const muteVideo = true;
            moat = InitMoatWithPlayerVolume(muteVideo, iframe, container);

            container = document.createElement('div');
            iframe = document.createElement('iframe');

            container.appendChild(iframe);
            document.body.appendChild(container);

            sinon.stub(iframe.contentWindow!, 'postMessage');
            sinon.stub(container, 'querySelector').returns(iframe);
            sinon.stub(moat, 'container').returns(container);
        });

        afterEach(() => {
            document.body.removeChild(container);
        });

        it('should have correct volume after initialization: 0', () => {
            moat.render();
            moat.triggerVideoEvent('test', 0.3);

            sinon.assert.calledWith(<sinon.SinonSpy>iframe.contentWindow!.postMessage,
                {
                    type: 'videoEvent',
                    data: {
                        type: 'test',
                        adVolume: 0,
                        volume: 0.3
                    }
                }
            );
        });

        it('should have the correct player volume after player volume set', () => {
            moat.render();
            moat.setPlayerVolume(1);
            moat.triggerVideoEvent('test', 0.3);

            sinon.assert.calledWith(<sinon.SinonSpy>iframe.contentWindow!.postMessage,
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
   });

   describe('MOAT player volume placement nonmuted', () => {
        let moat: MOAT;
        let iframe: HTMLIFrameElement;
        let container: HTMLElement;

        beforeEach(() => {
            const muteVideo = false;
            moat = InitMoatWithPlayerVolume(muteVideo, iframe, container);

            container = document.createElement('div');
            iframe = document.createElement('iframe');

            container.appendChild(iframe);
            document.body.appendChild(container);

            sinon.stub(iframe.contentWindow!, 'postMessage');
            sinon.stub(container, 'querySelector').returns(iframe);
            sinon.stub(moat, 'container').returns(container);
        });

        afterEach(() => {
            document.body.removeChild(container);
        });

        it('should have correct volume after initialization: 1', () => {
            moat.render();
            moat.triggerVideoEvent('test', 0.3);

            sinon.assert.calledWith(<sinon.SinonSpy>iframe.contentWindow!.postMessage,
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

        it('should have the correct player volume after player volume set', () => {
            moat.render();
            moat.setPlayerVolume(0);
            moat.triggerVideoEvent('test', 0.3);

            sinon.assert.calledWith(<sinon.SinonSpy>iframe.contentWindow!.postMessage,
                {
                    type: 'videoEvent',
                    data: {
                        type: 'test',
                        adVolume: 0,
                        volume: 0.3
                    }
                }
            );
        });
    });
});
