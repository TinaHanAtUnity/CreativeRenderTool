import { AbstractAdUnit, IAdUnitParameters } from 'Ads/AdUnits/AbstractAdUnit';
import { Campaign } from 'Ads/Models/Campaign';
import { NativeBridge } from 'Core/Native/Bridge/NativeBridge';

export class TestAdUnit extends AbstractAdUnit {

    constructor(nativeBridge: NativeBridge, parameters: IAdUnitParameters<Campaign>) {
        super(nativeBridge, parameters);
    }

    public open(): Promise<void> {
        return Promise.resolve();
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
