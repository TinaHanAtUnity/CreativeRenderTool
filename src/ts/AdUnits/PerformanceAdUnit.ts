import { NativeBridge } from 'Native/NativeBridge';
import { VideoAdUnit } from 'AdUnits/VideoAdUnit';
import { EndScreen } from 'Views/EndScreen';
import { AdUnitContainer } from 'AdUnits/Containers/AdUnitContainer';
import { PerformanceCampaign } from 'Models/PerformanceCampaign';
import { Placement } from 'Models/Placement';
import { Overlay } from 'Views/Overlay';
import { DeviceInfo } from 'Models/DeviceInfo';
import { Video } from 'Models/Assets/Video';

export class PerformanceAdUnit extends VideoAdUnit {

    private _endScreen: EndScreen | undefined;

    constructor(nativeBridge: NativeBridge, container: AdUnitContainer, placement: Placement, campaign: PerformanceCampaign, video: Video, overlay: Overlay, deviceInfo: DeviceInfo, options: any, endScreen: EndScreen) {
        super(nativeBridge, container, placement, campaign, video, overlay, deviceInfo, options);
        this._endScreen = endScreen;
    }

    public hide(): Promise<void> {
        const endScreen = this.getEndScreen();
        if (endScreen) {
            endScreen.hide();
            endScreen.container().parentElement!.removeChild(endScreen.container());
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
