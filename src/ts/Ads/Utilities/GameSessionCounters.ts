import { Campaign } from 'Ads/Models/Campaign';
import { PerformanceCampaign } from 'Performance/Models/PerformanceCampaign';
import { PerformanceMRAIDCampaign } from 'Performance/Models/PerformanceMRAIDCampaign';
import { XPromoCampaign } from 'XPromo/Models/XPromoCampaign';

export interface IGameSessionCounters {
    adRequests: number;
    starts: number;
    views: number;
    startsPerCampaign: {[id: string]: number};
    startsPerTarget: {[id: string]: number};
    viewsPerCampaign: {[id: string]: number};
    viewsPerTarget: {[id: string]: number};
    latestCampaignsStarts: {[id: string]: string};
}

export class GameSessionCounters {

    public static init() {
        this._adRequestCount = 0;
        this._totalStartCount = 0;
        this._totalViewCount = 0;
        this._targetStartCounter = {};
        this._targetViewCounter = {};
        this._campaignStartCounter = {};
        this._campaignViewCounter = {};
        this._latestCampaignsStarts = {};
    }

    public static addStart(campaign: Campaign) {
        this._totalStartCount++;

        const campaignId = campaign.getId();
        this._latestCampaignsStarts[campaignId] = (new Date()).toISOString();

        if (this._campaignStartCounter[campaignId]) {
            let campaignStartCount = this._campaignStartCounter[campaignId];
            this._campaignStartCounter[campaignId] = ++campaignStartCount;
        } else {
            this._campaignStartCounter[campaignId] = 1;
        }

        const targetGameId = this.getTargetGameId(campaign);
        if (targetGameId) {
            if (this._targetStartCounter[targetGameId]) {
                let targetStartCount = this._targetStartCounter[targetGameId];
                this._targetStartCounter[targetGameId] = ++targetStartCount;
            } else {
                this._targetStartCounter[targetGameId] = 1;
            }
        }
    }

    public static addView(campaign: Campaign) {
        this._totalViewCount++;

        const campaignId = campaign.getId();
        if (this._campaignViewCounter[campaignId]) {
            let campaignViewCount = this._campaignViewCounter[campaignId];
            this._campaignViewCounter[campaignId] = ++campaignViewCount;
        } else {
            this._campaignViewCounter[campaignId] = 1;
        }

        const targetGameId = this.getTargetGameId(campaign);
        if (targetGameId) {
            if (this._targetViewCounter[targetGameId]) {
                let targetViewCount = this._targetViewCounter[targetGameId];
                this._targetViewCounter[targetGameId] = ++targetViewCount;
            } else {
                this._targetViewCounter[targetGameId] = 1;
            }
        }
    }

    public static addAdRequest() {
        this._adRequestCount++;
    }

    public static getCurrentCounters(): IGameSessionCounters {
        return {
            adRequests: this._adRequestCount,
            starts: this._totalStartCount,
            views: this._totalViewCount,
            startsPerCampaign: { ...this._campaignStartCounter },
            startsPerTarget: { ...this._targetStartCounter },
            viewsPerCampaign: { ...this._campaignViewCounter },
            viewsPerTarget: { ...this._targetViewCounter },
            latestCampaignsStarts: { ...this._latestCampaignsStarts }
        };
    }

    private static getTargetGameId(campaign: Campaign): number | undefined {
        if (campaign instanceof PerformanceCampaign || campaign instanceof XPromoCampaign) {
            return campaign.getGameId();
        }
        let targetGameId;
        if (campaign instanceof PerformanceMRAIDCampaign) {
            targetGameId = campaign.getTargetGameId();
        }
        return targetGameId;
    }

    private static _adRequestCount: number = 0;
    private static _totalStartCount: number = 0;
    private static _totalViewCount: number = 0;
    private static _targetStartCounter: {[id: string]: number} = {};
    private static _targetViewCounter: {[id: string]: number} = {};
    private static _campaignStartCounter: {[id: string]: number} = {};
    private static _campaignViewCounter: {[id: string]: number} = {};
    private static _latestCampaignsStarts: {[id: string]: string} = {};
}
