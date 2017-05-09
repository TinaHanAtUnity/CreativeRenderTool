import { Asset, IAsset } from 'Models/Assets/Asset';

export class Image extends Asset<IAsset> {
    constructor(url: string) {
        super(Asset.Schema);

        this.set('url', url);
    }
}
