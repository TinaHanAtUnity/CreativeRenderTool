import { Campaign } from 'Campaign';

export enum PlacementState {
    READY,
    NOT_AVAILABLE,
    DISABLED,
    WAITING,
    NO_FILL
}

export class Placement {

    private _id: string;
    private _name: string;
    private _default: boolean;

    private _allowSkip: boolean;
    private _skipInSeconds: number;

    private _disableBackButton: boolean;

    private _useDeviceOrientationForVideo: boolean;
    private _muteVideo: boolean;

    private _campaign: Campaign;

    constructor(data: any) {
        this._id = data.id;
        this._name = data.name;
        this._default = data.default;

        this._allowSkip = data.allowSkip;
        this._skipInSeconds = data.skipInSeconds;

        this._disableBackButton = data.disableBackButton;

        this._useDeviceOrientationForVideo = data.useDeviceOrientationForVideo;
        this._muteVideo = data.muteVideo;
    }

    public getId(): string {
        return this._id;
    }

    public getName(): string {
        return this._name;
    }

    public isDefault(): boolean {
        return this._default;
    }

    public allowSkip(): boolean {
        return this._allowSkip;
    }

    public allowSkipInSeconds(): number {
        return this._skipInSeconds;
    }

    public disableBackButton(): boolean {
        return this._disableBackButton;
    }

    public useDeviceOrientationForVideo(): boolean {
        return this._useDeviceOrientationForVideo;
    }

    public muteVideo(): boolean {
        return this._muteVideo;
    }

    public getCampaign(): Campaign {
        return this._campaign;
    }

    public setCampaign(campaign: Campaign): void {
        this._campaign = campaign;
    }

}
