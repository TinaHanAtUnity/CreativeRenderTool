import { Campaign } from 'Ads/Models/Campaign';
import { PerformanceCampaign } from 'Performance/Models/PerformanceCampaign';
import { PerformanceMRAIDCampaign } from 'Performance/Models/PerformanceMRAIDCampaign';

export interface IGameSessionCounters {
    adRequests: number;
    starts: number;
    views: number;
    startsPerTarget: {[id: string]: number};
    viewsPerTarget: {[id: string]: number};
    latestTargetStarts: {[id: string]: string};
}

export class GameSessionCounters {

    public static init() {
        this._adRequestCount = 0;
        this._totalStartCount = 0;
        this._totalViewCount = 0;
        this._targetStartCounter = {};
        this._targetViewCounter = {};
        this._latestTargetStarts = {};
    }

    public static addStart(campaign: Campaign) {
        this._totalStartCount++;

        const targetGameId = this.getTargetGameId(campaign);
        if (targetGameId) {
            this._latestTargetStarts[targetGameId] = (new Date()).toISOString();

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
            startsPerTarget: { ...this._targetStartCounter },
            viewsPerTarget: { ...this._targetViewCounter },
            latestTargetStarts: { ...this._latestTargetStarts }
        };
    }

    private static getTargetGameId(campaign: Campaign): number | undefined {
        if (campaign instanceof PerformanceCampaign) {
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
    private static _latestTargetStarts: {[id: string]: string} = {};
}
