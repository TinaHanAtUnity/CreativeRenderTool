import { Campaign } from 'Models/Campaign';
import { PlacementState } from 'Models/Placement';
import { AbstractAdUnit } from 'AdUnits/AbstractAdUnit';
import { INativeResponse } from 'Utilities/Request';
import { JaegerSpan } from 'Jaeger/JaegerSpan';

export interface INoFillRetry {
    auctionId: string;
}
export abstract class RefreshManager {
    public static NoFillDelay = 3600;
    public static ErrorRefillDelay = 3600;
    public static ParsingErrorRefillDelay = 60;

    public abstract getCampaign(placementId: string): Campaign | undefined;
    public abstract setCurrentAdUnit(adUnit: AbstractAdUnit): void;
    public abstract setRefreshAllowed(bool: boolean): void;
    public abstract refresh(nofillRetry?: INoFillRetry): Promise<INativeResponse | void>;
    public abstract refreshFromCache(cachedResponse: INativeResponse, span: JaegerSpan): Promise<INativeResponse | void>;
    public abstract shouldRefill(timestamp: number): boolean;
    public abstract setPlacementState(placementId: string, placementState: PlacementState): void;
    public abstract sendPlacementStateChanges(placementId: string): void;
    public abstract setPlacementStates(placementState: PlacementState, placementIds: string[]): void;
}
