
export class CampaignError extends Error {
    public contentType: string;
    public errorTrackingUrl: string | undefined;
    public errorCode: number;
    public errorMessage: string;
    public assetUrl: string | undefined;
    public seatId: number | undefined;

    constructor(message: string, contentType: string, errorTrackingUrl?: string, errorCode?: number, assetUrl?: string, seatId?: number) {
        super(message);
        this.contentType = contentType;
        this.errorTrackingUrl = errorTrackingUrl;
        this.errorCode = errorCode ? errorCode : 999;   // 999 Undefined general error
        this.errorMessage = message;
        this.assetUrl = assetUrl;
        this.seatId = seatId;
    }
}
