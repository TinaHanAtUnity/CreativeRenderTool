import SplitScreenTemplate from 'html/SplitScreen.html';

import { NativeBridge } from 'Native/NativeBridge';
import { View } from 'Views/View';
import { Template } from 'Utilities/Template';
import { PerformanceCampaign } from 'Models/PerformanceCampaign';
import { EndScreen } from 'Views/EndScreen';
import { Overlay } from 'Views/Overlay';

export class SplitScreen extends View {

    private _endScreen: EndScreen;
    private _overlay: Overlay;
    private _gameName: string;

    private _fullScreenVideo: boolean = false;

    constructor(nativeBridge: NativeBridge, campaign: PerformanceCampaign, endScreen: EndScreen, videoOverlay: Overlay) {
        super(nativeBridge, 'split-screen');
        this._gameName = campaign.getGameName();
        this._endScreen = endScreen;
        this._overlay = videoOverlay;

        this._bindings = [];

        this._template = new Template(SplitScreenTemplate);
    }

    public render() {
        super.render();

        this._overlay.render();
        const overlayContainer = <HTMLElement>this._container.querySelector('.video-overlay');
        overlayContainer.appendChild(this._overlay.container());

        this._endScreen.render();
        const endScreenContainer = <HTMLElement>this._container.querySelector('.split-end-screen');
        endScreenContainer.appendChild(this._endScreen.container());
    }

    public show(): void {
        super.show();
    }

    public hide(): void {
        super.hide();

        if (this._endScreen) {
            this._endScreen.hide();
            this._endScreen.container().parentElement!.removeChild(this._endScreen.container());
            delete this._endScreen;
        }

    }

    public showEndScreen() {
        this._container.classList.remove('full-screen-video');
        this._container.classList.add('full-end-screen');
    }

    public setFullScreenVideo(fullScreen: boolean) {
        if (fullScreen) {
            this._container.classList.add('full-screen-video');
        } else {
            this._container.classList.remove('full-screen-video');
        }
        this._fullScreenVideo = fullScreen;
    }

    public isFullScreenVideo(): boolean {
        return this._fullScreenVideo;
    }

    public getOverlay(): Overlay {
        return this._overlay;
    }
}
