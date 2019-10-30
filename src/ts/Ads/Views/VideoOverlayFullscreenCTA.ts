import { AbstractPrivacy } from 'Ads/Views/AbstractPrivacy';
import { VideoOverlay, IVideoOverlayParameters } from 'Ads/Views/VideoOverlay';
import { Campaign } from 'Ads/Models/Campaign';
import VideoOverlayFullscreenCTATemplate from 'html/VideoOverlayFullscreenCTA.html';
import { Template } from 'Core/Utilities/Template';

export class VideoOverlayFullscreenCTA extends VideoOverlay {

    constructor(parameters: IVideoOverlayParameters<Campaign>, privacy: AbstractPrivacy, showGDPRBanner: boolean, showPrivacyDuringVideo: boolean) {
        super(parameters, privacy, showGDPRBanner, showPrivacyDuringVideo);

        this._template = new Template(VideoOverlayFullscreenCTATemplate, this._localization);
        this._fadeEnabled = false;
        this._templateData.showInstallButton = false;

        this._bindings.push({
            event: 'click',
            listener: (event: Event) => this.swallowEvent(event),
            selector: '.button-big'
        });

        this._bindings.push({
            event: 'click',
            listener: (event: Event) => this.onFullscreenCallEvent(event),
            selector: '.fullscreen-cta-container'
        });
    }

    private swallowEvent(event: Event): void {
        event.preventDefault();
        event.stopPropagation();
    }

    private onFullscreenCallEvent(event: Event) {
        this.onCallButtonEvent(event);
    }

    // tslint:disable-next-line: no-empty
    protected onClick(event: Event) {
    }

    // The original CTA button has been removed, we need to override these method to avoid any errors because the base class still expects them to exist
    // tslint:disable-next-line: no-empty
    protected showCallButton() {
    }

    // tslint:disable-next-line: no-empty
    public setCallButtonVisible(value: boolean) {
    }
}
