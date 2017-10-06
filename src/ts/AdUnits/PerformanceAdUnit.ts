import { NativeBridge } from 'Native/NativeBridge';
import { IVideoAdUnitParameters, VideoAdUnit } from 'AdUnits/VideoAdUnit';
import { EndScreen, IEndScreenHandler } from 'Views/EndScreen';
import { PerformanceCampaign } from 'Models/Campaigns/PerformanceCampaign';
import { AbstractAdUnit, IAdUnitParameters } from 'AdUnits/AbstractAdUnit';
import { IOverlayHandler } from 'Views/Overlay';
import { Platform } from 'Constants/Platform';

export interface IPerformanceAdUnitParameters<T extends IEndScreenHandler, T2 extends IOverlayHandler> extends IVideoAdUnitParameters {
    endScreen: EndScreen;
    endScreenEventHandler: { new(nativeBridge: NativeBridge, adUnit: AbstractAdUnit, parameters: IAdUnitParameters): T; };
    overlayEventHandler: { new(nativeBridge: NativeBridge, adUnit: VideoAdUnit, parameters: IAdUnitParameters): T2; };
    performanceOverlayEventHandler: { new(nativeBridge: NativeBridge, adUnit: VideoAdUnit, parameters: IAdUnitParameters): T2; };
}

export class PerformanceAdUnit extends VideoAdUnit {

    private _endScreen: EndScreen | undefined;
    private _endScreenEventHandler: IEndScreenHandler;
    private _overlayEventHandler: IOverlayHandler;
    private _performanceOverlayEventHandler: IOverlayHandler;
    private _onBackKeyObserver: any;

    constructor(nativeBridge: NativeBridge, parameters: IPerformanceAdUnitParameters<IEndScreenHandler, IOverlayHandler>) {
        parameters.endScreen.render();
        parameters.endScreen.hide();
        document.body.appendChild(parameters.endScreen.container());

        const campaign = <PerformanceCampaign>parameters.campaign;
        const landscapeVideo = campaign.getVideo();
        const landscapeVideoCached = landscapeVideo && landscapeVideo.isCached();
        const portraitVideo = campaign.getPortraitVideo();
        const portraitVideoCached = portraitVideo && portraitVideo.isCached();

        super(nativeBridge, parameters);

        this._endScreen = parameters.endScreen;
        this._endScreenEventHandler = new parameters.endScreenEventHandler(nativeBridge, this, parameters);
        this._endScreen.addHandler(this._endScreenEventHandler);

        this.prepareOverlay();
        parameters.overlay.setSpinnerEnabled(!landscapeVideoCached && !portraitVideoCached);

        if (nativeBridge.getPlatform() === Platform.ANDROID) {
            this._onBackKeyObserver = nativeBridge.AndroidAdUnit.onKeyDown.subscribe((keyCode, eventTime, downTime, repeatCount) => this._endScreenEventHandler.onKeyEvent(keyCode));
        }

        this.onClose.subscribe(() => {
            if(this._onBackKeyObserver) {
                nativeBridge.AndroidAdUnit.onKeyDown.unsubscribe(this._onBackKeyObserver);
            }
            this.hide();
        });

        this._overlayEventHandler = new parameters.overlayEventHandler(nativeBridge, this, parameters);
        parameters.overlay.addHandler(this._overlayEventHandler);
        this._performanceOverlayEventHandler = new parameters.performanceOverlayEventHandler(nativeBridge, this, parameters);
        parameters.overlay.addHandler(this._performanceOverlayEventHandler);
    }

    public hide(): Promise<void> {
        const endScreen = this.getEndScreen();
        if(endScreen) {
            endScreen.removeHandler(this._endScreenEventHandler);
            endScreen.hide();
            endScreen.container().parentElement!.removeChild(endScreen.container());
        }

        const overlay = this.getOverlay();
        if(overlay) {
            overlay.removeHandler(this._overlayEventHandler);
            overlay.removeHandler(this._performanceOverlayEventHandler);
        }

        return super.hide();
    }

    public description(): string {
        return 'performance';
    }

    public getEndScreen(): EndScreen | undefined {
        return this._endScreen;
    }

    protected unsetReferences() {
        super.unsetReferences();
        delete this._endScreen;
    }
}
