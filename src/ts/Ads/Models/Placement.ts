import { Campaign, ICampaignTrackingUrls } from 'Ads/Models/Campaign';
import { Model } from 'Core/Models/Model';

export enum PlacementState {
    READY,
    NOT_AVAILABLE,
    DISABLED,
    WAITING,
    NO_FILL
}

export type PlacementAuctionType = 'cpm' | 'ltv';
export const DefaultPlacementAuctionType = 'cpm';

export interface IRawPlacement {
    id: string;
    name: string;
    default: boolean;
    allowSkip: boolean;
    skipEndCardOnClose: boolean;
    disableVideoControlsFade: boolean;
    disableBackButton: boolean;
    muteVideo: boolean;
    skipInSeconds: number;
    useDeviceOrientationForVideo: boolean;
    adTypes: string[];
    refreshDelay: number;
    position?: string;
    auctionType?: string;
}

export interface IPlacement {
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
    currentTrackingUrls: ICampaignTrackingUrls | undefined;
    refreshDelay: number | undefined;
    position: string | undefined;
    auctionType: PlacementAuctionType;
}

export class Placement extends Model<IPlacement> {

    constructor(data: IRawPlacement) {
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
            currentTrackingUrls: ['object', 'undefined'],
            refreshDelay: ['number', 'undefined'],
            position: ['string', 'undefined'],
            auctionType: ['string']
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
        this.set('auctionType', <PlacementAuctionType>data.auctionType || DefaultPlacementAuctionType);
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

    public getAuctionType(): PlacementAuctionType {
        return this.get('auctionType');
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

    public getCurrentTrackingUrls(): ICampaignTrackingUrls | undefined {
        return this.get('currentTrackingUrls');
    }

    public setCurrentTrackingUrls(trackingUrls: ICampaignTrackingUrls | undefined) {
        this.set('currentTrackingUrls', trackingUrls);
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

    public getDTO(): { [key: string]: unknown } {
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
