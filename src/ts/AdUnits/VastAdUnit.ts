import { NativeBridge } from 'Native/NativeBridge';
import { Vast } from 'Models/Vast/Vast';
import { VastCampaign } from 'Models/Vast/VastCampaign';
import { EventManager } from 'Managers/EventManager';
import { VideoAdUnit } from 'AdUnits/VideoAdUnit';
import { VastEndScreen } from 'Views/VastEndScreen';
import { AdUnitContainer, ForceOrientation } from 'AdUnits/Containers/AdUnitContainer';
import { Placement } from 'Models/Placement';
import { Overlay } from 'Views/Overlay';
import { DeviceInfo } from 'Models/DeviceInfo';
import { MOAT } from 'Views/MOAT';
import { StreamType } from 'Constants/Android/StreamType';

export class VastAdUnit extends VideoAdUnit {

    private _endScreen: VastEndScreen | null;
    private _moat?: MOAT;
    private _volume: number;
    private _events: Array<[number, string]> = [[0.0, 'AdVideoStart'], [0.25, 'AdVideoFirstQuartile'], [0.5, 'AdVideoMidpoint'], [0.75, 'AdVideoThirdQuartile']];
    private _realDuration: number;

    constructor(nativeBridge: NativeBridge, container: AdUnitContainer, placement: Placement, campaign: VastCampaign, overlay: Overlay, deviceInfo: DeviceInfo, options: any, endScreen?: VastEndScreen) {
        super(nativeBridge, ForceOrientation.NONE, container, placement, campaign, campaign.getVideo(), overlay, deviceInfo, options);
        this._endScreen = endScreen || null;
        deviceInfo.getDeviceVolume(StreamType.STREAM_MUSIC).then(volume => {
            this._volume = volume;
        });
    }

    public hide(): Promise<void> {
        const endScreen = this.getEndScreen();
        if (endScreen) {
            endScreen.hide();
            endScreen.remove();
        }

        if(this._moat) {
            this._moat.container().parentElement!.removeChild(this._moat.container());
        }

        return super.hide();
    }

    public description(): string {
        return 'VAST';
    }

    public getVast(): Vast {
        return (<VastCampaign> this.getCampaign()).getVast();
    }

    public getMoat(): MOAT | undefined {
        return this._moat;
    }

    public getEvents() {
        return this._events;
    }

    public setEvents(events: Array<[number, string]>) {
        this._events = events;
    }

    public getRealDuration() {
        return this._realDuration;
    }

    public setRealDuration(duration: number) {
        this._realDuration = duration;
    }

    public getVolume() {
        return this._volume;
    }

    public setVolume(volume: number) {
        this._volume = volume;
    }

    public getDuration(): number | null {
        return this.getVast().getDuration();
    }

    public sendImpressionEvent(eventManager: EventManager, sessionId: string, sdkVersion: number): void {
        const impressionUrls = this.getVast().getImpressionUrls();
        if (impressionUrls) {
            for (const impressionUrl of impressionUrls) {
                this.sendThirdPartyEvent(eventManager, 'vast impression', sessionId, sdkVersion, impressionUrl);
            }
        }
    }

    public sendTrackingEvent(eventManager: EventManager, eventName: string, sessionId: string, sdkVersion: number): void {
        const trackingEventUrls = this.getVast().getTrackingEventUrls(eventName);
        if (trackingEventUrls) {
            for (const url of trackingEventUrls) {
                this.sendThirdPartyEvent(eventManager, `vast ${eventName}`, sessionId, sdkVersion, url);
            }
        }
    }

    public sendProgressEvents(eventManager: EventManager, sessionId: string, sdkVersion: number, position: number, oldPosition: number) {
        this.sendQuartileEvent(eventManager, sessionId, sdkVersion, position, oldPosition, 1, 'firstQuartile');
        this.sendQuartileEvent(eventManager, sessionId, sdkVersion, position, oldPosition, 2, 'midpoint');
        this.sendQuartileEvent(eventManager, sessionId, sdkVersion, position, oldPosition, 3, 'thirdQuartile');
    }

    public getVideoClickThroughURL(): string | null {
        const url = this.getVast().getVideoClickThroughURL();
        if (this.isValidURL(url)) {
            return url;
        } else {
            return null;
        }
    }

    public getCompanionClickThroughUrl(): string | null {
        const url = this.getVast().getCompanionClickThroughUrl();
        if (this.isValidURL(url)) {
            return url;
        } else {
            return null;
        }
    }

    public initMoat() {
        this._moat = new MOAT(this._nativeBridge);
        this._moat.render();
        document.body.appendChild(this._moat.container());
    }

    public sendVideoClickTrackingEvent(eventManager: EventManager, sessionId: string, sdkVersion: number): void {
        const clickTrackingEventUrls = this.getVast().getVideoClickTrackingURLs();

        if (clickTrackingEventUrls) {
            for (const clickTrackingEventUrl of clickTrackingEventUrls) {
                this.sendThirdPartyEvent(eventManager, 'vast video click', sessionId, sdkVersion, clickTrackingEventUrl);
            }
        }
    }

    public getEndScreen(): VastEndScreen | null {
        return this._endScreen;
    }

    private sendQuartileEvent(eventManager: EventManager, sessionId: string, sdkVersion: number, position: number, oldPosition: number, quartile: number, quartileEventName: string) {
        if (this.getTrackingEventUrls(quartileEventName)) {
            const duration = this.getDuration();
            if (duration && duration > 0 && position / 1000 > duration * 0.25 * quartile && oldPosition / 1000 < duration * 0.25 * quartile) {
                this.sendTrackingEvent(eventManager, quartileEventName, sessionId, sdkVersion);
            }
        }
    }

    private sendThirdPartyEvent(eventManager: EventManager, event: string, sessionId: string, sdkVersion: number, url: string): void {
        url = url.replace(/%ZONE%/, this.getPlacement().getId());
        url = url.replace(/%SDK_VERSION%/, sdkVersion.toString());
        eventManager.thirdPartyEvent(event, sessionId, url);
    }

    private getTrackingEventUrls(eventName: string): string[] | null {
        return this.getVast().getTrackingEventUrls(eventName);
    }

    private isValidURL(url: string | null): boolean {
        const reg = new RegExp('^(https?)://.+$');
        return !!url && reg.test(url);
    }

}
