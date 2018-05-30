import { IOperativeEventManagerParams, OperativeEventManager } from 'Managers/OperativeEventManager';
import { Campaign } from 'Models/Campaign';

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
}
