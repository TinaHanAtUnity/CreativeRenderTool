import { Observable0, Observable1 } from 'Utilities/Observable';

export class NativeVideoPlayerBridge {
    public readonly onPlay = new Observable0();
    public readonly onPrepare = new Observable1<string>();

    private _iframe: HTMLIFrameElement;
    private _messageListener: any;

    constructor() {
        this._messageListener = (e: MessageEvent) => this.onMessage(e);
    }

    public connect(iframe: HTMLIFrameElement) {
        this._iframe = iframe;
        window.addEventListener('message', this._messageListener);
    }

    public disconnect() {
        window.removeEventListener('message', this._messageListener);
    }

    public notifyCanPlay() {
        this.sendMessage('canplay');
    }

    public notifyPrepared(duration: number) {
        this.sendMessage('prepared', {
            duration: duration
        });
    }

    public notifyProgress(progress: number) {
        this.sendMessage('progress', {
            progress: progress
        });
    }

    public notifyPlay() {
        this.sendMessage('play');
    }

    public notifyPlaying() {
        this.sendMessage('playing');
    }

    public notifyPause() {
        this.sendMessage('pause');
    }

    public notifyEnd() {
        this.sendMessage('ended');
    }

    private sendMessage(event: string, data?: any) {
        const eventData = <IPlayerEventData>{
            type: 'player',
            event: event
        };
        if (data) {
            eventData.data = data;
        }
        this._iframe.contentWindow.postMessage(eventData, '*');
    }

    private onMessage(e: MessageEvent) {
        const data = <IPlayerEventData>e.data;
        if (data.type && data.type === 'player') {
            this.handleEvent(data.event, data.data);
        }
    }

    private handleEvent(event: string, data: any) {
        switch (event) {
            case 'prepare':
                this.handlePrepareEvent(<IPrepareEventData>data);
                break;
            case 'play':
                this.handlePlayEvent();
                break;
        }
    }

    private handlePrepareEvent(data: IPrepareEventData) {
        this.onPrepare.trigger(data.url);
    }

    private handlePlayEvent() {
        this.onPlay.trigger();
    }
}

interface IPlayerEventData {
    type?: string;
    event: string;
    data: any;
}

interface IPrepareEventData {
    url: string;
}
