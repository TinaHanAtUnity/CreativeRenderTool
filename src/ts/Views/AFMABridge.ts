export enum AFMAEvents {
    OPEN_URL = 'openUrl'
}

export class AFMABridge {
    private _handler: IAFMAHandler;
    private _messageListener: (e: Event) => void;

    constructor(handler: IAFMAHandler) {
        this._handler = handler;
        this._messageListener = (e: Event) => this.onMessage(<MessageEvent>e);
    }

    public connect(iframe: HTMLIFrameElement) {
        window.addEventListener('message', this._messageListener);
    }

    public disconnect() {
        window.removeEventListener('message', this._messageListener);
    }

    private onMessage(e: MessageEvent) {
        const message = <IAFMAMessage>e.data;
        if (message.type === 'afma') {
            this.handleAFMAMessage(message.event, message.data);
        }
    }

    private handleAFMAMessage(event: string, data?: any) {
        switch (event) {
            case AFMAEvents.OPEN_URL:
                this._handler.onAFMAOpen(data.url);
                break;
        }
    }
}

export interface IAFMAMessage {
    type: string;
    event: string;
    data?: any;
}

export interface IAFMAHandler {
    onAFMAOpen(url: string): void;
}
