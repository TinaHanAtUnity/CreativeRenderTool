import { Asset, IAsset } from 'Models/Assets/Asset';
import { Session } from 'Models/Session';

export class HTML extends Asset<IAsset> {
    constructor(url: string, session: Session, creativeId?: string) {
        super('HTML', session, Asset.Schema);

        this.set('url', url);
        this.set('creativeId', creativeId);
    }

    public getDescription(): string {
        return 'MRAID';
    }
}
