import { AbstractAdUnit } from 'Ads/AdUnits/AbstractAdUnit';
import { Campaign } from 'Ads/Models/Campaign';
import { PlacementState } from 'Ads/Models/Placement';
import { JaegerSpan } from 'Core/Jaeger/JaegerSpan';
import { INativeResponse } from 'Core/Managers/Request';
import { BackupCampaignManager } from 'Ads/Managers/BackupCampaignManager';

export abstract class RefreshManager {
    public static NoFillDelay = 3600;
    public static ErrorRefillDelay = 3600;
    public static ParsingErrorRefillDelay = 60;

    public abstract getCampaign(placementId: string): Campaign | undefined;
    public abstract setCurrentAdUnit(adUnit: AbstractAdUnit): void;
    public abstract refresh(nofillRetry?: boolean): Promise<INativeResponse | void>;
    public abstract refreshFromCache(cachedResponse: INativeResponse, span: JaegerSpan): Promise<INativeResponse | void>;
    public abstract refreshWithBackupCampaigns(backupCampaignManager: BackupCampaignManager): Promise<INativeResponse | void>;
    public abstract shouldRefill(timestamp: number): boolean;
    public abstract setPlacementState(placementId: string, placementState: PlacementState): void;
    public abstract sendPlacementStateChanges(placementId: string): void;
    public abstract setPlacementStates(placementState: PlacementState, placementIds: string[]): void;
}
