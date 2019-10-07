import { ICoreApi } from 'Core/ICore';
import { OpenMeasurement } from 'Ads/Views/OpenMeasurement/OpenMeasurement';
import { OMID3pEvents, ISessionEvent } from 'Ads/Views/OpenMeasurement/OpenMeasurementDataTypes';

export interface IOMIDMessage {
    type: string;
    event: string;
    data: { [key: string]: unknown };
}

export interface IVerificationEvent {
    type: string;
    timestamp: number;
    adSessionId: string;
    payload?: unknown;
    uuid?: string;
}

export interface IOMIDEventHandler {
    onEventProcessed(eventType: string, vendorKey?: string): void;
}

enum EventQueuePostbackEvents {
    ON_EVENT_REGISTERED = 'onEventRegistered',
    ON_SESSION_EVENT_REGISTERED = 'onSessionEventRegistered'
}

export class OMIDEventBridge {
    private _core: ICoreApi;
    private _messageListener: (e: Event) => void;
    private _handler: IOMIDEventHandler;
    private _omidHandlers: { [event: string]: (msg: IOMIDMessage) => void };
    private _openMeasurement: OpenMeasurement;

    private _iframe3p: HTMLIFrameElement;
    private _verificationsInjected = false;

    private _videoEventQueue: { [event: string]: IVerificationEvent } = {};
    private _eventHistory: { [event: string]: IVerificationEvent[] } = {};
    private _registeredFuncs: { [eventType: string]: string[] } = {};

    constructor(core: ICoreApi, handler: IOMIDEventHandler, iframe: HTMLIFrameElement, openMeasurement: OpenMeasurement) {
        this._core = core;
        this._messageListener = (e: Event) => this.onMessage(<MessageEvent>e);
        this._omidHandlers = {};
        this._handler = handler;
        this._iframe3p = iframe;
        this._openMeasurement = openMeasurement;
        this._omidHandlers[OMID3pEvents.ON_EVENT_PROCESSED] = (msg) => this._handler.onEventProcessed(<string>msg.data.eventType, <string>msg.data.vendorKey);
        this._omidHandlers[EventQueuePostbackEvents.ON_EVENT_REGISTERED] = (msg) => this.onEventRegistered(<string>msg.data.eventName, <string>msg.data.vendorKey, <string>msg.data.uuid);

        this._registeredFuncs = {
            'omidVideo': []
        };
    }

    public connect() {
        window.addEventListener('message', this._messageListener, false);
    }

    public disconnect() {
        window.removeEventListener('message', this._messageListener);
    }

    public setIframe(iframe: HTMLIFrameElement) {
        this._iframe3p = iframe;
    }

    public setVerificationsInjected(verificationsInjected: boolean) {
        this._verificationsInjected = verificationsInjected;
    }

    public triggerAdEvent(type: string, payload?: unknown) {
        this._core.Sdk.logDebug('Calling OM ad event "' + type + '" with payload: ' + payload);
        const event: IVerificationEvent = {
            type: type,
            adSessionId: this._openMeasurement.getOMAdSessionId(),
            timestamp: Date.now(),
            payload: payload
        };

        if (!this._eventHistory[type]) {
            this._eventHistory[type] = [];
        }
        this._eventHistory[type].push(event);

        if (this._registeredFuncs[type] !== undefined) {
            this._registeredFuncs[type].forEach((uuid) => {
                this.postMessage(event, uuid);
            });
        }
    }

    public triggerVideoEvent(type: string, payload?: unknown) {
        this._core.Sdk.logDebug('Calling OM viewability event "' + type + '" with payload: ' + payload);
        const event: IVerificationEvent = {
            type: type,
            adSessionId: this._openMeasurement.getOMAdSessionId(),
            timestamp: Date.now(),
            payload: payload
        };

        if (!this._eventHistory[type]) {
            this._eventHistory[type] = [];
        }
        this._eventHistory[type].push(event);

        if (this._registeredFuncs[type] !== undefined) {
            this._registeredFuncs[type].forEach((uuid) => {
                this.postMessage(event, uuid);
            });
        }

        if (this._registeredFuncs[OMID3pEvents.OMID_VIDEO].length > 0) {
            const uuid = this._registeredFuncs[OMID3pEvents.OMID_VIDEO][0];
            this.postMessage(event, uuid);
        }

        this._videoEventQueue[type] = event;
    }

    public triggerSessionEvent(event: ISessionEvent) {
        this._core.Sdk.logDebug('Calling OM session event "' + event.type + '" with data: ' + event.data);
        this.postMessage(event);
    }

    private onMessage(e: MessageEvent) {
        const message = <IOMIDMessage>e.data;
        if (message.type === 'omid') {
            this._core.Sdk.logInfo(`omid: event=${message.event}, data=${JSON.stringify(message.data)}`);
            if (message.event in this._omidHandlers) {
                const handler = this._omidHandlers[message.event];
                handler(message);
            }
        }
    }

    private postMessage(event: IVerificationEvent | ISessionEvent, uuid?: string) {
        if (uuid) {
            event.uuid = uuid;
        }

        if (this._iframe3p.contentWindow) {
            this._iframe3p.contentWindow.postMessage(event, '*');
        }
    }

    public onEventRegistered(eventName: string, vendorKey: string, uuid: string) {
        const eventDatas = this._eventHistory[eventName];

        if (!this._registeredFuncs[eventName]) {
            this._registeredFuncs[eventName] = [];
        }
        this._registeredFuncs[eventName].push(uuid);

        if (eventDatas) {
            eventDatas.forEach((eventData) => {
                this.postMessage(eventData, uuid);
            });
        }

        if (eventName === 'omidVideo') {
            this.sendAllQueuedVideoEvents(vendorKey, uuid);
        }
    }

    private sendQueuedVideoEvent(eventName: string, uuid: string) {
        const event: IVerificationEvent = this._videoEventQueue[eventName];
        this.postMessage(event, uuid);
    }

    private sendAllQueuedVideoEvents(vendorkey: string, uuid: string): void {
        Object.keys(this._videoEventQueue).forEach((event) => {
            if (this._videoEventQueue[event]) {
                this.sendQueuedVideoEvent(event, uuid);
            }
        });
    }
}
