import { Campaign } from 'Ads/Models/Campaign';
import { Model } from 'Core/Models/Model';

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

    skipEndCardOnClose: boolean | undefined;
    disableVideoControlsFade: boolean | undefined;

    adTypes: string[] | undefined;
    realtimeData: string | undefined;

    state: PlacementState;
    previousState: PlacementState;
    placementStateChanged: boolean;
    currentCampaign: Campaign | undefined;
    refreshDelay: number | undefined;
    position: string | undefined;
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
            skipEndCardOnClose: ['boolean', 'undefined'],
            disableVideoControlsFade: ['boolean', 'undefined'],
            adTypes: ['array', 'undefined'],
            realtimeData: ['string', 'undefined'],
            state: ['number'],
            previousState: ['number'],
            placementStateChanged: ['boolean'],
            currentCampaign: ['object', 'undefined'],
            refreshDelay: ['number', 'undefined'],
            position: ['string', 'undefined']
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

        this.set('skipEndCardOnClose', data.skipEndCardOnClose);

        this.set('disableVideoControlsFade', data.disableVideoControlsFade);

        this.set('adTypes', data.adTypes);

        this.set('state', PlacementState.NOT_AVAILABLE);
        this.set('refreshDelay', data.refreshDelay);
        this.set('position', data.position || 'bottomcenter');
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

    public skipEndCardOnClose(): boolean | undefined {
        return this.get('skipEndCardOnClose');
    }

    public disableVideoControlsFade(): boolean | undefined {
        return this.get('disableVideoControlsFade');
    }

    public getAdTypes(): string[] | undefined {
        return this.get('adTypes');
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

    public getRefreshDelay(): number | undefined {
        return this.get('refreshDelay');
    }

    public getBannerStyle(): string | undefined {
        return this.get('position');
    }

    public isBannerPlacement(): boolean {
        const adTypes = this.getAdTypes();
        if (adTypes) {
            for (const adType of adTypes) {
                if (adType === 'BANNER') {
                    return true;
                }
            }
        }
        return false;
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
            'skipEndCardOnClose': this.skipEndCardOnClose(),
            'disableVideoControlsFade': this.disableVideoControlsFade(),
            'adTypes': this.getAdTypes(),
            'state': PlacementState[this.getState()].toLowerCase()
        };
    }
 }
