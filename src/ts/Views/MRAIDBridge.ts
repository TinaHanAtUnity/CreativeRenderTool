import { Orientation } from 'AdUnits/Containers/AdUnitContainer';
import { NativeBridge } from 'Native/NativeBridge';

export enum MRAIDEvents {
    ORIENTATION         = 'orientation'
    // OPEN                = 'open',
    // LOADED              = 'loaded',
    // ANALYTICS_EVENT     = 'analyticsEvent',
    // CLOSE               = 'close',
    // STATE_CHANGE        = 'customMraidState'
}

export interface IMRAIDHandler {
    onSetOrientationProperties(allowOrientation: boolean, orientation: Orientation): void;
}

export interface IMRAIDMessage {
    type: string;
    event: string;
    data?: any;
}

export interface IMRAIDOrientationProperties {
    allowOrientation: boolean;
    forceOrientation: string;
}

export class MRAIDBridge {
    private _nativeBridge: NativeBridge;
    private _handler: IMRAIDHandler;
    private _iframe: HTMLIFrameElement;
    private _messageListener: (e: Event) => void;
    private _mraidHandlers: { [event: string]: (msg: IMRAIDMessage) => void };

    constructor(nativeBridge: NativeBridge, handler: IMRAIDHandler) {
        this._nativeBridge = nativeBridge;
        this._handler = handler;
        this._messageListener = (e: Event) => this.onMessage(<MessageEvent>e);
        this._mraidHandlers = {};
        this._mraidHandlers[MRAIDEvents.ORIENTATION] = (msg: IMRAIDMessage) => this.handleSetOrientationProperties(<IMRAIDOrientationProperties>msg.data);
    }

    public connect(iframe: HTMLIFrameElement) {
        window.addEventListener('message', this._messageListener, false);
    }

    public disconnect() {
        window.removeEventListener('message', this._messageListener);
    }

    private onMessage(e: MessageEvent) {
        const message = <IMRAIDMessage>e.data;
        if (message.type === 'mraid') {
            this._nativeBridge.Sdk.logDebug(`mraid: event=${message.event}, data=${message.data}`);
            if (message.event in this._mraidHandlers) {
                const handler = this._mraidHandlers[message.event];
                handler(message);
            }
        }
    }

    private handleSetOrientationProperties(properties: IMRAIDOrientationProperties) {
        let forceOrientation = Orientation.NONE;
        if (properties.forceOrientation) {
            switch (properties.forceOrientation) {
            case 'landscape':
                forceOrientation = Orientation.LANDSCAPE;
                break;
            case 'portrait':
                forceOrientation = Orientation.PORTRAIT;
                break;
            case 'none':
                forceOrientation = Orientation.NONE;
                break;
            default:
                break;
            }
        }
        this._handler.onSetOrientationProperties(properties.allowOrientation, forceOrientation);
    }
}
