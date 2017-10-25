import { AbstractAdUnit, IAdUnitParameters } from 'AdUnits/AbstractAdUnit';
import { NativeBridge } from 'Native/NativeBridge';
import { Campaign } from 'Models/Campaign';

export class TestAdUnit extends AbstractAdUnit<Campaign> {

    constructor(nativeBridge: NativeBridge, parameters: IAdUnitParameters<Campaign>) {
        super(nativeBridge, parameters);
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
