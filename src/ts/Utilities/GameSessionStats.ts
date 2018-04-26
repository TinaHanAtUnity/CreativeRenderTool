import { Campaign } from 'Models/Campaign';
import { PerformanceCampaign } from 'Models/Campaigns/PerformanceCampaign';

export class GameSessionStats {

    public static init() {
        this._adRequestCount = 0;
        this._totalStartCount = 0;
        this._totalViewCount = 0;
        this._targetStartCounter = {};
        this._targetViewCounter = {};
        this._campaignStartCounter = {};
        this._campaignViewCounter = {};
    }

    public static addStart(campaign: Campaign) {
        this._totalStartCount++;

        if (this._campaignStartCounter[campaign.getId()]) {
            this._campaignStartCounter[campaign.getId()] = ++this._campaignStartCounter[campaign.getId()];
        } else {
            this._campaignStartCounter[campaign.getId()] = 1;
        }

        if (campaign instanceof PerformanceCampaign) {
            if (this._targetStartCounter[campaign.getGameId()]) {
                this._targetStartCounter[campaign.getGameId()] = ++this._targetStartCounter[campaign.getGameId()];
            } else {
                this._targetStartCounter[campaign.getGameId()] = 1;
            }
        }
    }

    public static addView(campaign: Campaign) {
        this._totalViewCount++;

        if (this._campaignViewCounter[campaign.getId()]) {
            this._campaignViewCounter[campaign.getId()] = ++this._campaignViewCounter[campaign.getId()];
        } else {
            this._campaignViewCounter[campaign.getId()] = 1;
        }

        if (campaign instanceof PerformanceCampaign) {
            if (this._targetViewCounter[campaign.getGameId()]) {
                this._targetViewCounter[campaign.getGameId()] = ++this._targetViewCounter[campaign.getGameId()];
            } else {
                this._targetViewCounter[campaign.getGameId()] = 1;
            }
        }

    }

    public static addAdRequest() {
        this._adRequestCount++;
    }

    // todo: is it ok to collect click data?
    // public addNewClick()

    public static getDTO(): { [key: string]: any } {
        return { adRequests: this._adRequestCount,
            starts: this._totalStartCount,
            views: this._totalViewCount,
            startsPerCampaign: this._campaignStartCounter,
            startsPerTarget: this._targetStartCounter,
            viewsPerCampaign: this._campaignViewCounter,
            viewsPerTarget: this._targetViewCounter };
    }

    private static _adRequestCount: number = 0;
    private static _totalStartCount: number = 0;
    private static _totalViewCount: number = 0;
    private static _targetStartCounter: {[id: string]: number} = {};
    private static _targetViewCounter: {[id: string]: number} = {};
    private static _campaignStartCounter: {[id: string]: number} = {};
    private static _campaignViewCounter: {[id: string]: number} = {};

}