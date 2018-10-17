import { Model } from 'Core/Models/Model';

export interface ILimitedTimeOffer {
    duration: number;
    firstImpression: Date | undefined;
}

export interface ILimitedTimeOfferData {
    duration: number;
    firstImpression: Date | undefined;
}

export class LimitedTimeOffer extends Model<ILimitedTimeOffer> {
    constructor(data: ILimitedTimeOfferData) {
        super('LimitedTimeOffer', {
            duration: ['number'],
            firstImpression: ['object', 'undefined']
        }, data);
    }

    public isExpired(): boolean {
        const firstImpression = this.getFirstImpression();
        if (firstImpression === undefined) {
            return true;
        }
        const currentDate = new Date();
        const expiryDate = firstImpression;
        expiryDate.setSeconds(firstImpression.getSeconds() + this.getDuration());
        return currentDate >= expiryDate;
    }

    public getDuration(): number {
        return this.get('duration');
    }

    public getFirstImpression(): Date | undefined {
        return this.get('firstImpression');
    }

    public getDTO() {
        return {
            'duration': this.getDuration(),
            'firstImpression': this.getFirstImpression()
        };
    }
}
