
export enum CampaignErrorLevel {
    LOW = 'low priority',
    MID = 'medium priority',
    HIGH = 'high priority'
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
        this.errorLevel = errorLevel || CampaignErrorLevel.MID;
        this.contentType = contentType;
        this.errorTrackingUrls = errorTrackingUrls || [];
        this.errorCode = errorCode || 999;   // 999 Undefined general error
        this.errorMessage = message;
        this.assetUrl = assetUrl;
        this.seatId = seatId;
        this.creativeId = creativeId;
    }
}
