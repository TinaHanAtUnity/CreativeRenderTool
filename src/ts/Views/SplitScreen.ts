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

    private _closeElement: HTMLElement;
    private _overlayContainer: HTMLElement;
    private _endScreenContainer: HTMLElement;
    private _gameBackgroundElement: HTMLElement;
    private _endScreenInfoElement: HTMLElement;

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
        this._overlayContainer = <HTMLElement>this._container.querySelector('.video-overlay');
        this._overlayContainer.appendChild(this._overlay.container());

        this._endScreen.render();
        this._endScreenContainer = <HTMLElement>this._container.querySelector('.split-end-screen');
        this._endScreenContainer.appendChild(this._endScreen.container());

        this._closeElement = <HTMLElement>this._endScreenContainer.querySelector('.btn-close-region');
        this._closeElement.style.display = 'none';
        this._gameBackgroundElement = <HTMLElement>this._endScreenContainer.querySelector('.game-background-portrait');
        this._endScreenInfoElement = <HTMLElement>this._endScreenContainer.querySelector('.end-screen-info-background');
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
        this._overlayContainer.classList.remove('video-overlay-full');
        this._endScreenContainer.classList.remove('split-end-screen-hidden');

        this._overlayContainer.classList.add('video-overlay-hidden');

        this._gameBackgroundElement.classList.add('game-background-full');

        this._endScreenInfoElement.classList.add('end-screen-info-background-full');

        this._endScreenContainer.classList.add('split-end-screen-full');

        this._closeElement.style.display = 'block';

    }

    public setFullScreenVideo(fullScreen: boolean) {
        if (fullScreen) {
            this._endScreenContainer.classList.add('split-end-screen-hidden');
            this._overlayContainer.classList.add('video-overlay-full');
        } else {
            this._endScreenContainer.classList.remove('split-end-screen-hidden');
            this._overlayContainer.classList.remove('video-overlay-full');
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
