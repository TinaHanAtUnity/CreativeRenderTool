import { IOperativeEventManagerParams, OperativeEventManager } from 'Managers/OperativeEventManager';
import { Session } from 'Models/Session';
import { AdUnitStyle } from 'Models/AdUnitStyle';
import { Placement } from 'Models/Placement';
import { XPromoCampaign } from 'Models/Campaigns/XPromoCampaign';

export class XPromoOperativeEventManager extends OperativeEventManager {
    private _xPromoCampaign: XPromoCampaign;

    constructor(params: IOperativeEventManagerParams) {
        super(params);

        this._xPromoCampaign = <XPromoCampaign>params.campaign;
    }

    protected getInfoJson(session: Session, placement: Placement, eventId: string, gameSession: number, gamerSid?: string, previousPlacementId?: string, videoOrientation?: string, adUnitStyle?: AdUnitStyle): Promise<[string, any]> {
        return super.getInfoJson(session, placement, eventId, gameSession, gamerSid, previousPlacementId, videoOrientation, adUnitStyle).then(([id, infoJson]) => {
            const landscapeVideo = this._xPromoCampaign.getVideo();
            const portraitVideo = this._xPromoCampaign.getPortraitVideo();
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
}
