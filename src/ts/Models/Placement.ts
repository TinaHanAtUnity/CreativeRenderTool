import { Model } from 'Models/Model';
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

    useDeviceOrientationForVideo: boolean;
    muteVideo: boolean;

    state: PlacementState;
}

export class Placement extends Model<IPlacement> {

    constructor(data: any) {
        super({
            id: ['string'],
            name: ['string'],
            default: ['boolean'],
            allowSkip: ['boolean'],
            skipInSeconds: ['number'],
            disableBackButton: ['boolean'],
            useDeviceOrientationForVideo: ['boolean'],
            muteVideo: ['boolean'],
            state: ['number']
        });

        this.set('id', data.id);
        this.set('name', data.name);
        this.set('default', data.default);

        this.set('allowSkip', data.allowSkip);
        this.set('skipInSeconds', data.skipInSeconds);

        this.set('disableBackButton', data.disableBackButton);

        this.set('useDeviceOrientationForVideo', data.useDeviceOrientationForVideo);
        this.set('muteVideo', data.muteVideo);

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

    public useDeviceOrientationForVideo(): boolean {
        return this.get('useDeviceOrientationForVideo');
    }

    public muteVideo(): boolean {
        return this.get('muteVideo');
    }

    public getState(): PlacementState {
        return this.get('state');
    }

    public setState(state: PlacementState): void {
        this.set('state', state);
    }

    public getDTO(): { [key: string]: any } {
        return {
            'id': this.getId(),
            'name': this.getName(),
            'default': this.isDefault(),
            'allowSkip': this.allowSkip(),
            'skipInSeconds': this.allowSkipInSeconds(),
            'disableBackButton': this.disableBackButton(),
            'useDeviceOrientationForVideo': this.useDeviceOrientationForVideo(),
            'muteVideo': this.muteVideo(),
            'state': PlacementState[this.getState()].toLowerCase()
        };
    }
 }
