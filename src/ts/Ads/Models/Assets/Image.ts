import { Asset } from 'Ads/Models/Assets/Asset';
import { Session } from 'Ads/Models/Session';

export class Image extends Asset {
    constructor(url: string, session: Session) {
        super('Image', session, Asset.Schema);

        this.set('url', url);
    }

    public getDescription(): string {
        return 'IMAGE';
    }
}
