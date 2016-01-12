import { Campaign } from 'Campaign';

export enum ZoneState {
    READY,
    NOT_AVAILABLE,
    DISABLED,
    WAITING,
    NO_FILL
}

export class Zone {

    private _id: string;
    private _name: string;
    private _enabled: boolean;
    private _default: boolean;
    private _incentivized: boolean;
    private _allowSkipVideoInSeconds: number;
    private _disableBackButtonForSeconds: number;
    private _useDeviceOrientationForVideo: boolean;
    private _muteVideoSounds: boolean;

    private _campaign: Campaign;

    constructor(data: any) {
        this._id = data.id;
        this._name = data.name;
        this._enabled = data.enabled;
        this._default = data.default;
        this._incentivized = data.incentivized;
        this._allowSkipVideoInSeconds = data.allowSkipVideoInSeconds;
        this._disableBackButtonForSeconds = data.disableBackButtonForSeconds;
        this._useDeviceOrientationForVideo = data.useDeviceOrientationForVideo;
        this._muteVideoSounds = data.muteVideoSounds;
    }

    public getId(): string {
        return this._id;
    }

    public getName(): string {
        return this._name;
    }

    public isEnabled(): boolean {
        return this._enabled;
    }

    public isDefault(): boolean {
        return this._default;
    }

    public isIncentivized(): boolean {
        return this._incentivized;
    }

    public allowSkipInSeconds(): number {
        return this._allowSkipVideoInSeconds;
    }

    public disableBackButtonForSeconds(): number {
        return this._disableBackButtonForSeconds;
    }

    public useDeviceOrientationForVideo(): boolean {
        return this._useDeviceOrientationForVideo;
    }

    public muteVideoSounds(): boolean {
        return this._muteVideoSounds;
    }

    public getCampaign(): Campaign {
        return this._campaign;
    }

    public setCampaign(campaign: Campaign): void {
        this._campaign = campaign;
    }
}
