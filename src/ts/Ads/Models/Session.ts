import { Model } from 'Core/Models/Model';
import { IGameSessionCounters } from 'Ads/Utilities/GameSessionCounters';
import { IRequestPrivacy } from 'Ads/Models/RequestPrivacy';

export enum EventType {
    START,
    FIRST_QUARTILE,
    MIDPOINT,
    THIRD_QUARTILE,
    VIEW,
    SKIP,
    CLICK,
    IMPRESSION,
    VAST_COMPLETE
}

export interface ISession {
    id: string;
    adPlan: string | undefined;
    eventSent: { [key: number]: boolean };
    gameSessionCounters: IGameSessionCounters;
    privacy: IRequestPrivacy;
    deviceFreeSpace: number;
}

export class Session extends Model<ISession> {

    constructor(id: string) {
        super('Session', {
            id: ['string'],
            adPlan: ['string', 'undefined'],
            eventSent: ['object'],
            gameSessionCounters: ['object'],
            privacy: ['object'],
            deviceFreeSpace: ['number']
        });

        this.set('id', id);
        this.set('eventSent', {});
    }

    public getId(): string {
        return this.get('id');
    }

    public getAdPlan(): string | undefined {
        return this.get('adPlan');
    }

    public setAdPlan(adPlan: string) {
        this.set('adPlan', adPlan);
    }

    public getEventSent(eventType: EventType) {
        const eventSent = this.get('eventSent');
        if(!(eventType in eventSent)) {
            return false;
        }
        return eventSent[eventType];
    }

    public setEventSent(eventType: EventType) {
        const eventSent = this.get('eventSent');
        if(!(eventType in eventSent)) {
            eventSent[eventType] = true;
        }
        this.set('eventSent', eventSent);
    }

    public setGameSessionCounters(gameSessionCounters: IGameSessionCounters) {
        this.set('gameSessionCounters', gameSessionCounters);
    }

    public getGameSessionCounters(): IGameSessionCounters {
        return this.get('gameSessionCounters');
    }

    public setPrivacy(privacy: IRequestPrivacy) {
        this.set('privacy', privacy);
    }

    public getPrivacy(): IRequestPrivacy {
        return this.get('privacy');
    }

    public setDeviceFreeSpace(freeSpace: number) {
        this.set('deviceFreeSpace', freeSpace);
    }

    public getDeviceFreeSpace(): number {
        return this.get('deviceFreeSpace');
    }

    public getDTO(): { [key: string]: unknown } {
        return {
            'id': this.getId(),
            'eventSent': this.get('eventSent')
        };
    }
}
