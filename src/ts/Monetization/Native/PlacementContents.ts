import { EventCategory } from 'Core/Constants/EventCategory';
import { FinishState } from 'Core/Constants/FinishState';
import { ApiPackage, NativeApi } from 'Core/Native/Bridge/NativeApi';
import { NativeBridge } from 'Core/Native/Bridge/NativeBridge';
import { Observable2 } from 'Core/Utilities/Observable';
import { PlacementContentState } from 'Monetization/Constants/PlacementContentState';

export enum IPlacementContentType {
    SHOW_AD,
    PROMO_AD,
    CUSTOM,
    NO_FILL
}

export enum PlacementContentEvent {
    CUSTOM
}

export interface IPlacementContentParams {
    [key: string]: any;
    type: IPlacementContentType;
}

export class PlacementContentsApi extends NativeApi {
    public readonly onPlacementContentCustomEvent = new Observable2<string, any>();

    constructor(nativeBridge: NativeBridge) {
        super(nativeBridge, 'PlacementContents', ApiPackage.MONETIZATION_CORE, EventCategory.PLACEMENT_CONTENT);
    }

    public createPlacementContent(placementId: string, params: IPlacementContentParams): Promise<void> {
        return this._nativeBridge.invoke(this._fullApiClassName, 'createPlacementContent', [placementId, {
            ... params,
            // necessary to coerce to string
            type: IPlacementContentType[params.type]
        }]);
    }

    public setPlacementContentState(placementId: string, state: PlacementContentState): Promise<void> {
        return this._nativeBridge.invoke(this._fullApiClassName, 'setPlacementContentState', [placementId, PlacementContentState[state]]);
    }

    public sendAdFinished(placementId: string, finishState: FinishState) {
        return this._nativeBridge.invoke(this._fullApiClassName, 'sendAdFinished', [placementId, FinishState[finishState]]);
    }
    public sendAdStarted(placementId: string) {
        return this._nativeBridge.invoke(this._fullApiClassName, 'sendAdStarted', [placementId]);
    }

    public handleEvent(event: string, parameters: any[]) {
        switch (event) {
        case PlacementContentEvent[PlacementContentEvent.CUSTOM]:
            this.onPlacementContentCustomEvent.trigger(parameters[0], parameters[1]);
            break;
        default:
            super.handleEvent(event, parameters);
        }
    }
}
