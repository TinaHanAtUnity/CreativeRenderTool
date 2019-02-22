import { AbstractAdUnit } from 'Ads/AdUnits/AbstractAdUnit';
import { BackupCampaignManager } from 'Ads/Managers/BackupCampaignManager';
import { Campaign } from 'Ads/Models/Campaign';
import { PlacementState } from 'Ads/Models/Placement';
import { INativeResponse } from 'Core/Managers/RequestManager';
import { NativePromoEventHandler } from 'Promo/EventHandlers/NativePromoEventHandler';

export abstract class RefreshManager {
    public static NoFillDelayInSeconds = 3600;
    public static ErrorRefillDelayInSeconds = 3600;
    public static ParsingErrorRefillDelayInSeconds = 60;

    public abstract getCampaign(placementId: string): Campaign | undefined;
    public abstract setCurrentAdUnit(adUnit: AbstractAdUnit): void;
    public abstract refresh(nofillRetry?: boolean): Promise<INativeResponse | void>;
    public abstract refreshWithBackupCampaigns(backupCampaignManager: BackupCampaignManager): Promise<(INativeResponse | void)[]>;
    public abstract shouldRefill(timestamp: number): boolean;
    public abstract setPlacementState(placementId: string, placementState: PlacementState): void;
    public abstract sendPlacementStateChanges(placementId: string): void;
    public abstract setPlacementStates(placementState: PlacementState, placementIds: string[]): void;
    public abstract subscribeNativePromoEvents(eventHandler: NativePromoEventHandler): void;
}
