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
        let diagnosticsTriggerStub;
        let logWarningStub;
        let moat;
        beforeEach(() => {
            const nativeBridge = sinon.createStubInstance(NativeBridge);
            const sdk = sinon.createStubInstance(SdkApi);
            nativeBridge.Sdk = sdk;
            logWarningStub = sdk.logWarning;
            const muteVideo = true;
            moat = new MOAT(Platform.ANDROID, nativeBridge, muteVideo);
            diagnosticsTriggerStub = sinon.stub(Diagnostics, 'trigger');
        });
        afterEach(() => {
            diagnosticsTriggerStub.restore();
        });
        const tests = [{
                event: { data: { type: 'MOATVideoError', error: 'test error' } },
                assertions: () => {
                    sinon.assert.calledWithExactly(diagnosticsTriggerStub, 'moat_video_error', 'test error');
                }
            }, {
                event: { data: { type: 'loaded' } },
                assertions: () => {
                    sinon.assert.notCalled(diagnosticsTriggerStub);
                }
            }, {
                event: { data: {} },
                assertions: () => {
                    sinon.assert.notCalled(logWarningStub);
                    sinon.assert.notCalled(diagnosticsTriggerStub);
                }
            }, {
                event: { data: { type: 'test' } },
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
    const InitMoatWithPlayerVolume = (muteVideo) => {
        const nativeBridge = sinon.createStubInstance(NativeBridge);
        const sdk = sinon.createStubInstance(SdkApi);
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
        const createElement = sinon.stub(document, 'createElement').callsFake((name) => {
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
    [true, false].forEach(muteVideo => describe(`MOAT player volume placement muted, initial mute: ${muteVideo}`, () => {
        let moat;
        let mockedDom;
        const expectedAdVolumeAfterInit = muteVideo ? 0 : 1;
        beforeEach(() => {
            mockedDom = MockDom();
            moat = InitMoatWithPlayerVolume(muteVideo);
        });
        it('should have correct volume after initialization', () => {
            moat.render();
            moat.triggerVideoEvent('test', 0.3);
            sinon.assert.calledWith(mockedDom.postMessage, {
                type: 'videoEvent',
                data: {
                    type: 'test',
                    adVolume: expectedAdVolumeAfterInit,
                    volume: 0.3
                }
            });
        });
        it('should have the correct player volume after player volume set to nonmuted', () => {
            moat.render();
            moat.setPlayerVolume(1);
            moat.triggerVideoEvent('test', 0.3);
            sinon.assert.calledWith(mockedDom.postMessage, {
                type: 'videoEvent',
                data: {
                    type: 'test',
                    adVolume: 1,
                    volume: 0.3
                }
            });
        });
        it('should have the correct player volume after player volume set to muted', () => {
            moat.render();
            moat.setPlayerVolume(0);
            moat.triggerVideoEvent('test', 0.1);
            sinon.assert.calledWith(mockedDom.postMessage, {
                type: 'videoEvent',
                data: {
                    type: 'test',
                    adVolume: 0,
                    volume: 0.1
                }
            });
        });
    }));
    describe(`MOAT player public methods`, () => {
        let moat;
        let mockedDom;
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
            sinon.assert.calledWith(mockedDom.postMessage, {
                type: 'videoEvent',
                data: {
                    type: 'AdPlaying',
                    adVolume: 1,
                    volume: 0.4
                }
            });
            sinon.assert.calledWith(mockedDom.postMessage, {
                payload: true,
                type: 'exposure'
            });
            sinon.assert.calledTwice(mockedDom.postMessage);
        });
        it('should send message on play from paused state', () => {
            moat.render();
            moat.play(0.5);
            assert.equal(moat.getState(), MoatState.PLAYING);
            sinon.assert.calledWith(mockedDom.postMessage, {
                type: 'videoEvent',
                data: {
                    type: 'AdPlaying',
                    adVolume: 1,
                    volume: 0.5
                }
            });
            sinon.assert.calledWith(mockedDom.postMessage, {
                payload: true,
                type: 'exposure'
            });
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
            sinon.assert.calledWith(mockedDom.postMessage, {
                type: 'videoEvent',
                data: {
                    type: 'AdPaused',
                    adVolume: 1,
                    volume: 0.5
                }
            });
            sinon.assert.calledWith(mockedDom.postMessage, {
                payload: false,
                type: 'exposure'
            });
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
            sinon.assert.calledWith(mockedDom.postMessage, {
                type: 'videoEvent',
                data: {
                    type: 'AdStopped',
                    adVolume: 1,
                    volume: 0.7
                }
            });
            sinon.assert.calledOnce(mockedDom.postMessage);
        });
        it('should send message on stop when paused state', () => {
            moat.render();
            moat.play(0.5);
            moat.pause(0.5);
            mockedDom.postMessage.reset();
            moat.stop(0.7);
            assert.equal(moat.getState(), MoatState.STOPPED);
            sinon.assert.calledWith(mockedDom.postMessage, {
                type: 'videoEvent',
                data: {
                    type: 'AdStopped',
                    adVolume: 1,
                    volume: 0.7
                }
            });
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
            sinon.assert.calledWith(mockedDom.postMessage, {
                type: 'videoEvent',
                data: {
                    type: 'AdVideoComplete',
                    adVolume: 1,
                    volume: 0.6
                }
            });
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
            sinon.assert.calledWith(mockedDom.postMessage, {
                type: 'videoEvent',
                data: {
                    type: 'AdVolumeChange',
                    adVolume: 1,
                    volume: 0.5
                }
            });
            sinon.assert.calledWith(mockedDom.postMessage, {
                payload: 50,
                type: 'volume'
            });
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiTU9BVFRlc3QuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi90ZXN0L1VuaXQvQWRzL01PQVRUZXN0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBRSxJQUFJLEVBQUUsU0FBUyxFQUFFLE1BQU0sZ0JBQWdCLENBQUM7QUFDakQsT0FBTyxFQUFFLFFBQVEsRUFBRSxNQUFNLHlCQUF5QixDQUFDO0FBQ25ELE9BQU8sRUFBRSxZQUFZLEVBQUUsTUFBTSxpQ0FBaUMsQ0FBQztBQUMvRCxPQUFPLEVBQUUsTUFBTSxFQUFFLE1BQU0saUJBQWlCLENBQUM7QUFDekMsT0FBTyxFQUFFLFdBQVcsRUFBRSxNQUFNLDRCQUE0QixDQUFDO0FBQ3pELE9BQU8sT0FBTyxDQUFDO0FBQ2YsT0FBTyxLQUFLLEtBQUssTUFBTSxPQUFPLENBQUM7QUFDL0IsT0FBTyxFQUFFLE1BQU0sRUFBRSxNQUFNLE1BQU0sQ0FBQztBQUU5QixRQUFRLENBQUMsTUFBTSxFQUFFLEdBQUcsRUFBRTtJQUNsQixRQUFRLENBQUMsV0FBVyxFQUFFLEdBQUcsRUFBRTtRQUN2QixJQUFJLHNCQUF1QyxDQUFDO1FBQzVDLElBQUksY0FBK0IsQ0FBQztRQUNwQyxJQUFJLElBQVMsQ0FBQztRQUVkLFVBQVUsQ0FBQyxHQUFHLEVBQUU7WUFDWixNQUFNLFlBQVksR0FBRyxLQUFLLENBQUMsa0JBQWtCLENBQUMsWUFBWSxDQUFDLENBQUM7WUFDNUQsTUFBTSxHQUFHLEdBQVcsS0FBSyxDQUFDLGtCQUFrQixDQUFDLE1BQU0sQ0FBQyxDQUFDO1lBQ3JELFlBQVksQ0FBQyxHQUFHLEdBQUcsR0FBRyxDQUFDO1lBQ3ZCLGNBQWMsR0FBcUIsR0FBRyxDQUFDLFVBQVUsQ0FBQztZQUVsRCxNQUFNLFNBQVMsR0FBRyxJQUFJLENBQUM7WUFDdkIsSUFBSSxHQUFHLElBQUksSUFBSSxDQUFDLFFBQVEsQ0FBQyxPQUFPLEVBQUUsWUFBWSxFQUFFLFNBQVMsQ0FBQyxD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