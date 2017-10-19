import 'mocha';

import * as sinon from 'sinon';
import { assert } from 'chai';
import { NativeVideoPlayerBridge, IPlayerEventData } from 'Utilities/NativeVideoPlayerBridge';
import { VideoPlayerApi } from 'Native/Api/VideoPlayer';
import { NativeBridge } from 'Native/NativeBridge';
import { Observable1, Observable4 } from 'Utilities/Observable';
import { Double } from 'Utilities/Double';

describe('NativeVideoPlayerBridge', () => {
    const src = 'https://wiki.yoctoproject.org/wiki/images/a/a6/Big-buck-bunny_trailer.webm';
    let nativeVideoPlayerBridge: NativeVideoPlayerBridge;
    let nativeBridge: NativeBridge;
    let iframeWindow: WindowMessageRecorder;
    let videoPlayer: VideoPlayerApi;

    beforeEach(() => {
        nativeBridge = sinon.createStubInstance(NativeBridge);

        videoPlayer = sinon.createStubInstance(VideoPlayerApi);
        (<any>videoPlayer).onProgress = new Observable1<number>();
        (<any>videoPlayer).onCompleted = new Observable1<string>();
        (<any>videoPlayer).onPrepared = new Observable4<string, number, number, number>();
        (<any>videoPlayer).onPlay = new Observable1<string>();
        (<any>videoPlayer).onPause = new Observable1<string>();

        nativeBridge.VideoPlayer = videoPlayer;

        const iframe = {};
        iframeWindow = new WindowMessageRecorder();
        (<any>iframe).contentWindow = iframeWindow;

        nativeVideoPlayerBridge = new NativeVideoPlayerBridge(nativeBridge);
        nativeVideoPlayerBridge.connect(<HTMLIFrameElement>iframe);
    });

    const sendMessageToBridge = (event: string, data?: any): Promise<void> => {
        return new Promise((resolve) => {
            window.postMessage(<IPlayerEventData>{
                type: 'player',
                event: event,
                data: data
            }, '*');
            setTimeout(resolve);
        });

    };

    const assertEventSent = (event: string, data?: any) => {
        const message = iframeWindow.messages.find((msg) => msg.event === event);
        if (message) {
            assert.equal('player', message.type);
            assert.deepEqual(data, message.data);
        } else {
            throw new Error(`Event ${event} was not sent at all`);
        }
    };

    describe('preparing the video player', () => {

        beforeEach(() => {
            return sendMessageToBridge('prepare', {
                url: src
            });
        });

        it('should call prepare on the video player', () => {
            (<sinon.SinonSpy>videoPlayer.prepare).calledWith(src, new Double(1.0), 10000);
        });

        it('should send the "loadstart" event', () => {
            assertEventSent('loadstart');
        });
    });

    describe('when the video player is prepared', () => {
        const duration = 30 * 1000;
        let spy: sinon.SinonSpy;

        beforeEach(() => {
            spy = sinon.spy();
            nativeVideoPlayerBridge.onPrepare.subscribe(spy);
            videoPlayer.onPrepared.trigger(src, duration, 500, 300);
        });

        it('should send the "prepared" event', () => {
            assertEventSent('prepared', {
                duration: duration / 1000.0
            });
        });

        it('should send the "canplay" event', () => {
            assertEventSent('canplay');
        });

        it('should trigger the onPrepare observer', () => {
            sinon.assert.calledWith(spy, duration);
        });
    });
});

class WindowMessageRecorder {
    public readonly messages: IPlayerEventData[] = [];

    public postMessage(message: IPlayerEventData) {
        this.messages.push(message);
    }
}
