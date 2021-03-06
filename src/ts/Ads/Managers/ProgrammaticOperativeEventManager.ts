import {
    IInfoJson,
    IOperativeEventManagerParams,
    IOperativeEventParams,
    OperativeEventManager
} from 'Ads/Managers/OperativeEventManager';
import { Campaign } from 'Ads/Models/Campaign';

export interface IProgrammaticInfoJson extends IInfoJson {
    creativeId?: string;
}

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

    protected getInfoJson(params: IOperativeEventParams, eventId: string, gameSession: number, gamerSid?: string, previousPlacementId?: string): Promise<[string, IProgrammaticInfoJson]> {
        return super.getInfoJson(params, eventId, gameSession, previousPlacementId).then(([id, infoJson]: [string, IProgrammaticInfoJson]) => {
            infoJson.creativeId = this._campaign.getCreativeId();

            return <[string, IProgrammaticInfoJson]>[eventId, infoJson];
        });
    }
}
