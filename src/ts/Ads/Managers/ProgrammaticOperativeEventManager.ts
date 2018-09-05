import {
    IOperativeEventManagerParams,
    IOperativeEventParams,
    OperativeEventManager
} from 'Ads/Managers/OperativeEventManager';
import { Campaign } from 'Ads/Models/Campaign';

export class ProgrammaticOperativeEventManager extends OperativeEventManager {
    public static setTestBaseUrl(baseUrl: string): void {
        ProgrammaticOperativeEventManager.VideoEventBaseUrl = baseUrl + '/events/v2/brand/video';
    }

    private static VideoEventBaseUrl: string = 'https://adserver.unityads.unity3d.com/events/v2/brand/video';

    constructor(params: IOperativeEventManagerParams<Campaign>) {
        super(params);
    }

    protected createVideoEventUrl(type: string): string | undefined {
        return [
            ProgrammaticOperativeEventManager.VideoEventBaseUrl,
            type,
            this._clientInfo.getGameId(),
            this._campaign.getId()
        ].join('/');
    }

    protected createClickEventUrl(): string | undefined {
        return undefined;
    }

    protected getInfoJson(params: IOperativeEventParams, eventId: string, gameSession: number, gamerSid?: string, previousPlacementId?: string): Promise<[string, any]> {
        return super.getInfoJson(params, eventId, gameSession, gamerSid, previousPlacementId).then(([id, infoJson]) => {
            infoJson.creativeId =  this._campaign.getCreativeId();

            return <[string, any]>[eventId, infoJson];
        });
    }
}
