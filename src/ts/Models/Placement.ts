import { Model } from 'Models/Model';
import { Campaign } from 'Models/Campaign';
import { Session } from 'Models/Session';

export enum PlacementState {
    READY,
    NOT_AVAILABLE,
    DISABLED,
    WAITING,
    NO_FILL
}

interface IPlacement {
    id: string;
    name: string;
    default: boolean;

    allowSkip: boolean;
    skipInSeconds: number;

    disableBackButton: boolean;

    muteVideo: boolean;

    adTypes: string[] | undefined;
    realtime: boolean;
    realtimeData: string | undefined;

    state: PlacementState;
    previousState: PlacementState;
    placementStateChanged: boolean;
    currentCampaign: Campaign | undefined;
}

export class Placement extends Model<IPlacement> {

    constructor(data: any) {
        super('Placement', {
            id: ['string'],
            name: ['string'],
            default: ['boolean'],
            allowSkip: ['boolean'],
            skipInSeconds: ['number'],
            disableBackButton: ['boolean'],
            muteVideo: ['boolean'],
            adTypes: ['array', 'undefined'],
            realtime: ['boolean'],
            realtimeData: ['string', 'undefined'],
            state: ['number'],
            previousState: ['number'],
            placementStateChanged: ['boolean'],
            currentCampaign: ['object', 'undefined']
        });

        this.set('id', data.id);
        this.set('name', data.name);
        this.set('default', data.default);

        const allowSkip: boolean = data.allowSkip;
        this.set('allowSkip', allowSkip);

        if (allowSkip) {
            this.set('skipInSeconds', data.skipInSeconds);
        }

        this.set('disableBackButton', data.disableBackButton);

        this.set('muteVideo', data.muteVideo);

        this.set('adTypes', data.adTypes);

        this.set('realtime', data.realtime ? true : false);

        this.set('state', PlacementState.NOT_AVAILABLE);
    }

    public getId(): string {
        return this.get('id');
    }

    public getName(): string {
        return this.get('name');
    }

    public isDefault(): boolean {
        return this.get('default');
    }

    public allowSkip(): boolean {
        return this.get('allowSkip');
    }

    public allowSkipInSeconds(): number {
        return this.get('skipInSeconds');
    }

    public disableBackButton(): boolean {
        return this.get('disableBackButton');
    }

    public muteVideo(): boolean {
        return this.get('muteVideo');
    }

    public getAdTypes(): string[] | undefined {
        return this.get('adTypes');
    }

    public isRealtime(): boolean {
        return this.get('realtime');
    }

    public setRealtime(state: boolean): void {
        this.set('realtime', state);
    }

    public getState(): PlacementState {
        return this.get('state');
    }

    public setState(state: PlacementState): void {
        if (this.getState() !== state) {
            this.set('previousState', this.getState());
            this.setPlacementStateChanged(true);
        }
        this.set('state', state);
    }

    public getPlacementStateChanged(): boolean {
        return this.get('placementStateChanged');
    }

    public setPlacementStateChanged(changed: boolean) {
        this.set('placementStateChanged', changed);
    }

    public getPreviousState(): number {
        return this.get('previousState');
    }

    public getCurrentCampaign(): Campaign | undefined {
        return this.get('currentCampaign');
    }

    public setCurrentCampaign(campaign: Campaign | undefined): void {
        this.set('currentCampaign', campaign);
    }

    public getRealtimeData(): string | undefined {
        return this.get('realtimeData');
    }

    public setRealtimeData(value: string | undefined) {
        this.set('realtimeData', value);
    }

    public getDTO(): { [key: string]: any } {
        return {
            'id': this.getId(),
            'name': this.getName(),
            'default': this.isDefault(),
            'allowSkip': this.allowSkip(),
            'skipInSeconds': this.allowSkipInSeconds(),
            'disableBackButton': this.disableBackButton(),
            'muteVideo': this.muteVideo(),
            'adTypes': this.getAdTypes(),
            'state': PlacementState[this.getState()].toLowerCase()
        };
    }
 }
