
/**
 * Levels of errors that can occur in a campaign: parsing, validating, rendering, tracking
 */
export enum CampaignErrorLevel {
    LOW = 'low priority',       // Warning level error, not a blocker
    MEDIUM = 'medium priority',    // Default level, severity depends per error occasion
    HIGH = 'high priority'      // Severe level error that stops proceeding
}
export class CampaignError extends Error {
    public errorLevel: CampaignErrorLevel;
    public contentType: string;
    public errorTrackingUrls: string[];
    public errorCode: number;
    public errorMessage: string;
    public assetUrl: string | undefined;
    public seatId: number | undefined;
    public creativeId: string | undefined;

    constructor(message: string, contentType: string, errorLevel?: CampaignErrorLevel, errorCode?: number, errorTrackingUrls?: string[], assetUrl?: string, seatId?: number, creativeId?: string) {
        super(message);
        this.errorLevel = errorLevel || CampaignErrorLevel.MEDIUM;
        this.contentType = contentType;
        this.errorTrackingUrls = errorTrackingUrls || [];
        this.errorCode = errorCode || 999;   // 999 Undefined general error
        this.errorMessage = message;
        this.assetUrl = assetUrl;
        this.seatId = seatId;
        this.creativeId = creativeId;
    }
}
