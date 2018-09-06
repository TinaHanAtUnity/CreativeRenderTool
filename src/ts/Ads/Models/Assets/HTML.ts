import { Asset } from 'Ads/Models/Assets/Asset';
import { Session } from 'Ads/Models/Session';

export class HTML extends Asset {
    constructor(url: string, session: Session, creativeId?: string) {
        super('HTML', session, Asset.Schema);

        this.set('url', url);
        this.set('creativeId', creativeId);
    }

    public getDescription(): string {
        return 'MRAID';
    }
}
