import { IOperativeEventManagerParams, OperativeEventManager } from 'Managers/OperativeEventManager';
import { Session } from 'Models/Session';
import { AdUnitStyle } from 'Models/AdUnitStyle';
import { Placement } from 'Models/Placement';
import { DisplayInterstitialCampaign } from 'Models/Campaigns/DisplayInterstitialCampaign';

export class DisplayInterstitialOperativeEventManager extends OperativeEventManager {
    private _displayInterstitialCampaign: DisplayInterstitialCampaign;

    constructor(params: IOperativeEventManagerParams) {
        super(params);

        this._displayInterstitialCampaign = <DisplayInterstitialCampaign>params.campaign;
    }

    protected getInfoJson(session: Session, placement: Placement, eventId: string, gameSession: number, gamerSid?: string, previousPlacementId?: string, videoOrientation?: string, adUnitStyle?: AdUnitStyle): Promise<[string, any]> {
        return super.getInfoJson(session, placement, eventId, gameSession, gamerSid, previousPlacementId, videoOrientation, adUnitStyle).then(([id, infoJson]) => {
            infoJson.cached = false;
            return <[string, any]>[id, infoJson];
        });
    }
}
