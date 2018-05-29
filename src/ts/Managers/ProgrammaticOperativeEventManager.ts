import { IOperativeEventManagerParams, OperativeEventManager } from 'Managers/OperativeEventManager';
import { Campaign } from 'Models/Campaign';
import { Url } from 'Utilities/Url';

export class ProgrammaticOperativeEventManager extends OperativeEventManager {
    public static setTestBaseUrl(baseUrl: string): void {
        ProgrammaticOperativeEventManager.VideoEventBaseUrl = baseUrl + '/mobile/gamers';
        ProgrammaticOperativeEventManager.ClickEventBaseUrl = baseUrl + '/mobile/campaigns';
    }

    private static VideoEventBaseUrl: string = 'https://adserver.unityads.unity3d.com/events/v2/brand/video';
    private static ClickEventBaseUrl: string = 'https://adserver.unityads.unity3d.com/mobile/campaigns';

    constructor(params: IOperativeEventManagerParams<Campaign>) {
        super(params);
    }

    protected createVideoEventUrl(type: string): string {
        return [
            ProgrammaticOperativeEventManager.VideoEventBaseUrl,
            type,
            this._clientInfo.getGameId(),
            this._campaign.getId()
        ].join('/');
    }

    protected createClickEventUrl(): string {
        let url: string | undefined;
        let parameters: any;

        url = [
            ProgrammaticOperativeEventManager.ClickEventBaseUrl,
            this._campaign.getId(),
            'click',
            this._campaign.getGamerId(),
        ].join('/');
        parameters = {
            gameId: this._clientInfo.getGameId(),
            redirect: false
        };

        return Url.addParameters(url, parameters);
    }
}
