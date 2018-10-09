import { AbstractAdUnit, IAdUnitParameters } from 'Ads/AdUnits/AbstractAdUnit';
import { Campaign } from 'Ads/Models/Campaign';

export class TestAdUnit extends AbstractAdUnit {

    constructor(parameters: IAdUnitParameters<Campaign>) {
        super(parameters);
    }

    public show(): Promise<void> {
        return Promise.resolve();
    }

    public hide(): Promise<void> {
        return Promise.resolve();
    }

    public isShowing(): boolean {
        return false;
    }

    public description(): string {
        return 'test';
    }

    public isCached(): boolean {
        return false;
    }
}
