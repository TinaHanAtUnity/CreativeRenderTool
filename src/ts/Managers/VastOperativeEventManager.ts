import { IOperativeEventManagerParams, OperativeEventManager } from 'Managers/OperativeEventManager';
import { Session } from 'Models/Session';
import { AdUnitStyle } from 'Models/AdUnitStyle';
import { Placement } from 'Models/Placement';
import { VastCampaign } from 'Models/Vast/VastCampaign';

export class VastOperativeEventManager extends OperativeEventManager {
    private _vastCampaign: VastCampaign;

    constructor(params: IOperativeEventManagerParams<VastCampaign>) {
        super(params);

        this._vastCampaign = params.campaign;
    }

    protected getInfoJson(placement: Placement, eventId: string, gameSession: number, gamerSid?: string, previousPlacementId?: string, videoOrientation?: string, adUnitStyle?: AdUnitStyle): Promise<[string, any]> {
        return super.getInfoJson(placement, eventId, gameSession, gamerSid, previousPlacementId, videoOrientation, adUnitStyle).then(([id, infoJson]) => {
            infoJson.cached = this._vastCampaign.getVideo().isCached();
            return <[string, any]>[id, infoJson];
        });
    }
}
