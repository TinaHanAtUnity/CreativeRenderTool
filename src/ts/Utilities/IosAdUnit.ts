import { AdUnit } from 'Utilities/AdUnit';

export class IosAdUnit extends AdUnit {
    public open(videoplayer: boolean, forceLandscape: boolean, disableBackbutton: boolean, options: any): Promise<void> {
        return Promise.resolve();
    }

    public close(): Promise<void> {
        return Promise.resolve();
    }
}