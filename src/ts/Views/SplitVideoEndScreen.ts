import SplitVideoEndScreenTemplate from 'html/SplitVideoEndScreen.html';

import { NativeBridge } from 'Native/NativeBridge';
import { View } from 'Views/View';
import { Template } from 'Utilities/Template';
import { PerformanceCampaign } from 'Models/PerformanceCampaign';
import { EndScreen } from 'Views/EndScreen';
import { Overlay } from 'Views/Overlay';

export class SplitVideoEndScreen extends View {

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
        super(nativeBridge, 'split-video-endscreen');
        this._gameName = campaign.getGameName();
        this._endScreen = endScreen;
        this._overlay = videoOverlay;

        this._bindings = [];

        this._template = new Template(SplitVideoEndScreenTemplate);
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
        this._overlayContainer.style.display = 'none';

        this._gameBackgroundElement.style.display = 'block';
        this._gameBackgroundElement.style.width = '100%';
        this._gameBackgroundElement.style.height = '53%';

        this._endScreenContainer.style.top = "0";
        this._endScreenContainer.style.height = "100%";
        this._endScreenInfoElement.style.height = '47%';
        this._endScreenInfoElement.style.top = '53%';
        this._endScreenContainer.style.display = 'block';

        this._gameBackgroundElement.style.webkitAnimation = 'fade-in';
        this._gameBackgroundElement.style.webkitAnimationDuration = '1s';
        this._closeElement.style.display = 'block';

    }

    public setFullScreenVideo(fullScreen: boolean) {
        if (fullScreen) {
            this._endScreenContainer.style.height = '0';
            this._endScreenContainer.style.display = 'none';

            this._overlayContainer.style.height = '100%';
        } else {
            this._endScreenContainer.style.height = '47%';
            this._endScreenContainer.style.display = 'block';

            this._overlayContainer.style.height = '53%';
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
