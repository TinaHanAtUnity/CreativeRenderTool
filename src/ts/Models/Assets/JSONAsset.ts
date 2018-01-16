import { Asset, IAsset } from 'Models/Assets/Asset';
import { Session } from 'Models/Session';

export class JSONAsset extends Asset<IAsset> {
    constructor(url: string, session: Session) {
        super('JSONAsset', session, Asset.Schema);

        this.set('url', url);
    }

    public getDescription(): string {
        return 'JSONAsset';
    }
}
