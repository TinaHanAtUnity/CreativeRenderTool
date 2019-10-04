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

    private _adEventQueue: { [event: string]: IVerificationEvent } = {};
    private _videoEventQueue: { [event: string]: IVerificationEvent } = {};

    constructor(core: ICoreApi, handler: IOMIDEventHandler, iframe: HTMLIFrameElement, openMeasurement: OpenMeasurement) {
        this._core = core;
        this._messageListener = (e: Event) => this.onMessage(<MessageEvent>e);
        this._omidHandlers = {};
        this._handler = handler;
        this._iframe3p = iframe;
        this._openMeasurement = openMeasurement;
        this._omidHandlers[OMID3pEvents.ON_EVENT_PROCESSED] = (msg) => this._handler.onEventProcessed(<string>msg.data.eventType, <string>msg.data.vendorKey);
        this._omidHandlers[EventQueuePostbackEvents.ON_EVENT_REGISTERED] = (msg) => this.onEventRegistered(<string>msg.data.eventName, <string>msg.data.vendor);
    }

    public onEventRegistered(eventName: string, vendorKey: string) {
        if (this._adEventQueue[eventName]) {
            this.sendQueuedAdEvent(eventName);
        }

        if (eventName === 'omidVideo') {
            this.sendAllQueuedEvents(vendorKey);
        }

        if (this._videoEventQueue[eventName]) {
            this.sendQueuedVideoEvent(eventName);
        }
    }

    private sendQueuedVideoEvent(eventName: string) {
        const event: IVerificationEvent = this._videoEventQueue[eventName];
        if (this._iframe3p.contentWindow && this._verificationsInjected) {
            this._iframe3p.contentWindow.postMessage(event, '*');
        }
    }

    private sendQueuedAdEvent(eventName: string) {
        const event: IVerificationEvent = this._adEventQueue[eventName];
        if (this._iframe3p.contentWindow && this._verificationsInjected) {
            this._iframe3p.contentWindow.postMessage(event, '*');
        }
    }

    private sendAllQueuedEvents(vendorkey: string): void {
        if (this._videoEventQueue[OMID3pEvents.OMID_LOADED]) {                          this.sendQueuedVideoEvent(OMID3pEvents.OMID_LOADED); }
        if (this._videoEventQueue[OMID3pEvents.OMID_START] && vendorkey !== 'IAS') {    this.sendQueuedVideoEvent(OMID3pEvents.OMID_START); }               // because IAS registers video and start separately
        if (this._videoEventQueue[OMID3pEvents.OMID_FIRST_QUARTILE]) {                  this.sendQueuedVideoEvent(OMID3pEvents.OMID_FIRST_QUARTILE); }
        if (this._videoEventQueue[OMID3pEvents.OMID_MIDPOINT])      {                   this.sendQueuedVideoEvent(OMID3pEvents.OMID_MIDPOINT); }
        if (this._videoEventQueue[OMID3pEvents.OMID_THIRD_QUARTILE]) {                  this.sendQueuedVideoEvent(OMID3pEvents.OMID_THIRD_QUARTILE); }
        if (this._videoEventQueue[OMID3pEvents.OMID_COMPLETE])      {                   this.sendQueuedVideoEvent(OMID3pEvents.OMID_COMPLETE); }
        if (this._videoEventQueue[OMID3pEvents.OMID_PAUSE])         {                   this.sendQueuedVideoEvent(OMID3pEvents.OMID_PAUSE); }
        if (this._videoEventQueue[OMID3pEvents.OMID_RESUME])        {                   this.sendQueuedVideoEvent(OMID3pEvents.OMID_RESUME); }
        if (this._videoEventQueue[OMID3pEvents.OMID_BUFFER_START])   {                  this.sendQueuedVideoEvent(OMID3pEvents.OMID_BUFFER_START); }
        if (this._videoEventQueue[OMID3pEvents.OMID_BUFFER_FINISH])  {                  this.sendQueuedVideoEvent(OMID3pEvents.OMID_BUFFER_FINISH); }
        if (this._videoEventQueue[OMID3pEvents.OMID_SKIPPED])       {                   this.sendQueuedVideoEvent(OMID3pEvents.OMID_SKIPPED); }
        if (this._videoEventQueue[OMID3pEvents.OMID_VOLUME_CHANGE])  {                  this.sendQueuedVideoEvent(OMID3pEvents.OMID_VOLUME_CHANGE); }
        if (this._videoEventQueue[OMID3pEvents.OMID_PLAYER_STATE_CHANGE]) {             this.sendQueuedVideoEvent(OMID3pEvents.OMID_PLAYER_STATE_CHANGE); }
        if (this._videoEventQueue[OMID3pEvents.OMID_AD_USER_INTERACTION]) {             this.sendQueuedVideoEvent(OMID3pEvents.OMID_AD_USER_INTERACTION); }
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

        if (this._iframe3p.contentWindow && this._verificationsInjected) {
            this._iframe3p.contentWindow.postMessage(event, '*');
        }

        this._adEventQueue[type] = event;
    }

    public triggerVideoEvent(type: string, payload?: unknown) {
        this._core.Sdk.logDebug('Calling OM viewability event "' + type + '" with payload: ' + payload);
        const event: IVerificationEvent = {
            type: type,
            adSessionId: this._openMeasurement.getOMAdSessionId(),
            timestamp: Date.now(),
            payload: payload
        };

        if (this._iframe3p.contentWindow && this._verificationsInjected) {
            this._iframe3p.contentWindow.postMessage(event, '*');
        }

        this._videoEventQueue[type] = event;
    }

    public triggerSessionEvent(event: ISessionEvent) {
        this._core.Sdk.logDebug('Calling OM session event "' + event.type + '" with data: ' + event.data);
        if (this._iframe3p.contentWindow) {
            this._iframe3p.contentWindow.postMessage(event, '*');
        }
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
}
