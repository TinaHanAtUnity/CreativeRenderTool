import { IOperativeEventManagerParams, OperativeEventManager } from 'Managers/OperativeEventManager';
import { Session } from 'Models/Session';
import { AdUnitStyle } from 'Models/AdUnitStyle';
import { Placement } from 'Models/Placement';
import { PerformanceCampaign } from 'Models/Campaigns/PerformanceCampaign';
import { Url } from 'Utilities/Url';

export class PerformanceOperativeEventManager extends OperativeEventManager {
    private _performanceCampaign: PerformanceCampaign;

    constructor(params: IOperativeEventManagerParams) {
        super(params);

        this._performanceCampaign = <PerformanceCampaign>params.campaign;
    }

    protected getInfoJson(session: Session, placement: Placement, eventId: string, gameSession: number, gamerSid?: string, previousPlacementId?: string, videoOrientation?: string, adUnitStyle?: AdUnitStyle): Promise<[string, any]> {
        return super.getInfoJson(session, placement, eventId, gameSession, gamerSid, previousPlacementId, videoOrientation, adUnitStyle).then(([id, infoJson]) => {
            const landscapeVideo = this._performanceCampaign.getVideo();
            const portraitVideo = this._performanceCampaign.getPortraitVideo();
            if(landscapeVideo && landscapeVideo.isCached()) {
                infoJson.cached = true;
                infoJson.cachedOrientation = 'landscape';
            } else if(portraitVideo && portraitVideo.isCached()) {
                infoJson.cached = true;
                infoJson.cachedOrientation = 'portrait';
            } else {
                infoJson.cached = false;
            }

            return <[string, any]>[id, infoJson];
        });
    }

    protected createVideoEventUrl(type: string): string {
        return this._performanceCampaign.getVideoEventUrl(type);
    }

    protected createClickEventUrl(): string {
        return Url.addParameters(this._performanceCampaign.getClickUrl(), { redirect: false });
    }
}
