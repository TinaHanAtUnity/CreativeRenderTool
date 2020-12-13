import { OMID3pEvents } from 'Ads/Views/OpenMeasurement/OpenMeasurementDataTypes';
export var EventQueuePostbackEvents;
(function (EventQueuePostbackEvents) {
    EventQueuePostbackEvents["ON_EVENT_REGISTERED"] = "onEventRegistered";
})(EventQueuePostbackEvents || (EventQueuePostbackEvents = {}));
export class OMIDEventBridge {
    constructor(core, handler, iframe, openMeasurement, campaign) {
        this._verificationsInjected = false;
        this._videoEventQueue = {};
        this._eventHistory = {};
        this._registeredFuncs = {};
        this._core = core;
        this._messageListener = (e) => this.onMessage(e);
        this._omidHandlers = {};
        this._handler = handler;
        this._iframe3p = iframe;
        this._openMeasurement = openMeasurement;
        this._campaign = campaign;
        this._omidHandlers[OMID3pEvents.ON_EVENT_PROCESSED] = (msg) => this._handler.onEventProcessed(msg.data.eventType, msg.data.vendorKey);
        this._omidHandlers[EventQueuePostbackEvents.ON_EVENT_REGISTERED] = (msg) => this.onEventRegistered(msg.data.eventName, msg.data.vendorKey, msg.data.uuid, msg.data.iframeId);
        this._registeredFuncs = {
            'omidVideo': []
        };
    }
    connect() {
        window.addEventListener('message', this._messageListener, false);
    }
    disconnect() {
        window.removeEventListener('message', this._messageListener);
    }
    setIframe(iframe) {
        this._iframe3p = iframe;
    }
    setVerificationsInjected(verificationsInjected) {
        this._verificationsInjected = verificationsInjected;
    }
    triggerAdEvent(type, payload) {
        this._core.Sdk.logDebug('Calling OM ad event "' + type + '" with payload: ' + payload);
        const event = {
            type: type,
            adSessionId: this._openMeasurement.getOMAdSessionId(),
            timestamp: Date.now(),
            payload: payload
        };
        if (!this._eventHistory[type]) {
            this._eventHistory[type] = [];
        }
        this._eventHistory[type].push(event);
        if (this._registeredFuncs[type]) {
            this._registeredFuncs[type].forEach((uuid) => {
                this.postVideoAdEventMessage(event, uuid);
            });
        }
    }
    triggerVideoEvent(type, payload) {
        this._core.Sdk.logDebug('Calling OM viewability event "' + type + '" with payload: ' + payload);
        const event = {
            type: type,
            adSessionId: this._openMeasurement.getOMAdSessionId(),
            timestamp: Date.now(),
            payload: payload
        };
        if (!this._eventHistory[type]) {
            this._eventHistory[type] = [];
        }
        this._eventHistory[type].push(event);
        if (this._registeredFuncs[type]) {
            this._registeredFuncs[type].forEach((uuid) => {
                this.postVideoAdEventMessage(event, uuid);
            });
        }
        if (this._registeredFuncs[OMID3pEvents.OMID_VIDEO].length > 0) {
            const uuid = this._registeredFuncs[OMID3pEvents.OMID_VIDEO][0];
            this.postVideoAdEventMessage(event, uuid);
        }
        this._videoEventQueue[type] = event;
    }
    triggerSessionEvent(event) {
        this._core.Sdk.logDebug('Calling OM session event "' + event.type + '" with data: ' + event.data);
        this.postMessage(event);
    }
    postVideoAdEventMessage(event, uuid) {
        const jsEvent = Object.assign({}, event, { uuid: uuid });
        this.postMessage(jsEvent);
    }
    postMessage(event) {
        if (this._iframe3p.contentWindow) {
            this._iframe3p.contentWindow.postMessage(event, '*');
        }
    }
    onEventRegistered(eventName, vendorKey, uuid, iframeId) {
        //Prevents uuids from other iframe multi-registered on the event bridge
        if (iframeId !== this._iframe3p.id) {
            return;
        }
        const eventDatas = this._eventHistory[eventName];
        if (!this._registeredFuncs[eventName]) {
            this._registeredFuncs[eventName] = [];
        }
        this._registeredFuncs[eventName].push(uuid);
        if (eventDatas) {
            eventDatas.forEach((eventData) => {
                this.postVideoAdEventMessage(eventData, uuid);
            });
        }
        if (eventName === 'omidVideo') {
            this.sendAllQueuedVideoEvents(vendorKey, uuid);
        }
    }
    onMessage(e) {
        const message = e.data;
        if (message.type === 'omid') {
            this._core.Sdk.logInfo(`omid: event=${message.event}, data=${JSON.stringify(message.data)}`);
            if (message.event in this._omidHandlers) {
                const handler = this._omidHandlers[message.event];
                handler(message);
            }
        }
    }
    sendAllQueuedVideoEvents(vendorkey, uuid) {
        Object.keys(this._videoEventQueue).forEach((event) => {
            if (this._videoEventQueue[event]) {
                this.sendQueuedVideoEvent(event, uuid);
            }
        });
    }
    sendQueuedVideoEvent(eventName, uuid) {
        const event = this._videoEventQueue[eventName];
        this.postVideoAdEventMessage(event, uuid);
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiT01JREV2ZW50QnJpZGdlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vc3JjL3RzL0Fkcy9WaWV3cy9PcGVuTWVhc3VyZW1lbnQvT01JREV2ZW50QnJpZGdlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUVBLE9BQU8sRUFBRSxZQUFZLEVBQWlCLE1BQU0sb0RBQW9ELENBQUM7QUF3QmpHLE1BQU0sQ0FBTixJQUFZLHdCQUVYO0FBRkQsV0FBWSx3QkFBd0I7SUFDaEMscUVBQXlDLENBQUE7QUFDN0MsQ0FBQyxFQUZXLHdCQUF3QixLQUF4Qix3QkFBd0IsUUFFbkM7QUFFRCxNQUFNLE9BQU8sZUFBZTtJQWV4QixZQUFZLElBQWMsRUFBRSxPQUEwQixFQUFFLE1BQXlCLEVBQUUsZUFBMEMsRUFBRSxRQUFrQjtRQVR6SSwyQkFBc0IsR0FBRyxLQUFLLENBQUM7UUFLL0IscUJBQWdCLEdBQTRDLEVBQUUsQ0FBQztRQUMvRCxrQkFBYSxHQUE4QyxFQUFFLENBQUM7UUFDOUQscUJBQWdCLEdBQXNDLEVBQUUsQ0FBQztRQUc3RCxJQUFJLENBQUMsS0FBSyxHQUFHLElBQUksQ0FBQztRQUNsQixJQUFJLENBQUMsZ0JBQWdCLEdBQUcsQ0FBQyxDQUFRLEVBQUUsRUFBRSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQWUsQ0FBQyxDQUFDLENBQUM7UUFDdEUsSUFBSSxDQUFDLGFBQWEsR0FBRyxFQUFFLENBQUM7UUFDeEIsSUFBSSxDQUFDLFFBQVEsR0FBRyxPQUFPLENBQUM7UUFDeEIsSUFBSSxDQUFDLFNBQVMsR0FBRyxNQUFNLENBQUM7UUFDeEIsSUFBSSxDQUFDLGdCQUFnQixHQUFHLGVBQWUsQ0FBQztRQUN4QyxJQUFJLENBQUMsU0FBUyxHQUFHLFFBQVEsQ0FBQztRQUUxQixJQUFJLENBQUMsYUFBYSxDQUFDLFlBQVksQ0FBQyxrQkFBa0IsQ0FBQyxHQUFHLENBQUMsR0FBRyxFQUFFLEVBQUUsQ0FBQyxJQUFJLENBQUMs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