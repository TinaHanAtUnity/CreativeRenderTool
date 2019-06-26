import { NativeBridge } from 'Core/Native/Bridge/NativeBridge';
import { ApiPackage, NativeApi } from 'Core/Native/Bridge/NativeApi';
import { EventCategory } from 'Core/Constants/EventCategory';
import { Observable1 } from 'Core/Utilities/Observable';

export enum LoadEvent {
    LOAD_PLACEMENTS
}

export class LoadApi extends NativeApi {

    public readonly onLoad = new Observable1<string>();

    constructor(nativeBridge: NativeBridge) {
        super(nativeBridge, 'Load', ApiPackage.ADS, EventCategory.LOAD_API);
    }

    public handleEvent(event: string, parameters: unknown[]): void {
        switch(event) {
            case LoadEvent[LoadEvent.LOAD_PLACEMENTS]:
                this.handleLoadPlacements(<string[]>parameters);
                break;

            default:
                super.handleEvent(event, parameters);
        }
    }

    public handleLoadPlacements(placements: string[]) {
        for (const placement of placements) {
            const placementId: string = placement;
            if (placementId) {
                this.onLoad.trigger(placementId);
            }
        }
    }
}
