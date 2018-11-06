import { Campaign } from 'Ads/Models/Campaign';
import { PerformanceCampaign } from 'Performance/Models/PerformanceCampaign';
import { XPromoCampaign } from 'XPromo/Models/XPromoCampaign';

interface IGameSessionCounters {
    adRequestCount: number;
    totalStartCount: number;
    totalViewCount: number;
    targetStartCounter: {[id: string]: number};
    targetViewCounter: {[id: string]: number};
    campaignStartCounter: {[id: string]: number};
    campaignViewCounter: {[id: string]: number};
    latestCampaignsStarts: {[id: string]: string};
}

export class GameSessionCounters {

    public static init() {
        this._currentCounters = {
            adRequestCount: 0,
            totalStartCount: 0,
            totalViewCount: 0,
            targetStartCounter: {},
            targetViewCounter: {},
            campaignStartCounter: {},
            campaignViewCounter: {},
            latestCampaignsStarts: {}
        };
        this._latestRequestCounters = this.copyCounters(GameSessionCounters._currentCounters);
        this._activeCampaignCounters = this.copyCounters(GameSessionCounters._currentCounters);
    }

    public static addStart(campaign: Campaign) {
        this._currentCounters.totalStartCount++;

        const campaignId = campaign.getId();
        this._currentCounters.latestCampaignsStarts[campaignId] = (new Date()).toISOString();

        if (this._currentCounters.campaignStartCounter[campaignId]) {
            let campaignStartCount = this._currentCounters.campaignStartCounter[campaignId];
            this._currentCounters.campaignStartCounter[campaignId] = ++campaignStartCount;
        } else {
            this._currentCounters.campaignStartCounter[campaignId] = 1;
        }

        if (campaign instanceof PerformanceCampaign || campaign instanceof XPromoCampaign) {
            const targetGameId = campaign.getGameId();
            if (this._currentCounters.targetStartCounter[targetGameId]) {
                let targetStartCount = this._currentCounters.targetStartCounter[targetGameId];
                this._currentCounters.targetStartCounter[targetGameId] = ++targetStartCount;
            } else {
                this._currentCounters.targetStartCounter[targetGameId] = 1;
            }
        }
        this._activeCampaignCounters = this.copyCounters(GameSessionCounters._latestRequestCounters);
    }

    public static addView(campaign: Campaign) {
        this._currentCounters.totalViewCount++;

        const campaignId = campaign.getId();
        if (this._currentCounters.campaignViewCounter[campaignId]) {
            let campaignViewCount = this._currentCounters.campaignViewCounter[campaignId];
            this._currentCounters.campaignViewCounter[campaignId] = ++campaignViewCount;
        } else {
            this._currentCounters.campaignViewCounter[campaignId] = 1;
        }

        if (campaign instanceof PerformanceCampaign || campaign instanceof XPromoCampaign) {
            const targetGameId = campaign.getGameId();
            if (this._currentCounters.targetViewCounter[targetGameId]) {
                let targetViewCount = this._currentCounters.targetViewCounter[targetGameId];
                this._currentCounters.targetViewCounter[targetGameId] = ++targetViewCount;
            } else {
                this._currentCounters.targetViewCounter[targetGameId] = 1;
            }
        }
    }

    public static addAdRequest() {
        this._currentCounters.adRequestCount++;
        this._latestRequestCounters = this.copyCounters(GameSessionCounters._currentCounters);
    }

    public static getDTO(): { [key: string]: any } {
        return this._currentCounters;
    }

    // These should be sent with Operative Events
    public static getCountersForOperativeEvent() {
        return this.getFormattedCounters(this._activeCampaignCounters);
    }

    // These should be sent with adRequests
    public static getCurrentCounters() {
        return this.getFormattedCounters(this._currentCounters);
    }

    private static getFormattedCounters(counters: IGameSessionCounters) {
        return {
            adRequests: counters.adRequestCount,
            starts: counters.totalStartCount,
            views: counters.totalViewCount,
            startsPerCampaign: { ...counters.campaignStartCounter },
            startsPerTarget: { ...counters.targetStartCounter },
            viewsPerCampaign: { ...counters.campaignViewCounter },
            viewsPerTarget: { ...counters.targetViewCounter },
            latestCampaignsStarts: { ...counters.latestCampaignsStarts }
        };
    }

    private static copyCounters(counters: IGameSessionCounters): IGameSessionCounters {
        return {
            adRequestCount: counters.adRequestCount,
            totalStartCount: counters.totalStartCount,
            totalViewCount: counters.totalViewCount,
            targetStartCounter: { ...counters.targetStartCounter },
            targetViewCounter: { ...counters.targetViewCounter },
            campaignStartCounter: { ...counters.campaignStartCounter },
            campaignViewCounter: { ...counters.campaignViewCounter },
            latestCampaignsStarts: { ...counters.latestCampaignsStarts }
        };
    }

    private static _currentCounters: IGameSessionCounters = {
        adRequestCount: 0,
        totalStartCount: 0,
        totalViewCount: 0,
        targetStartCounter: {},
        targetViewCounter: {},
        campaignStartCounter: {},
        campaignViewCounter: {},
        latestCampaignsStarts: {}
    };

    private static _latestRequestCounters: IGameSessionCounters = GameSessionCounters.copyCounters(GameSessionCounters._currentCounters);
    private static _activeCampaignCounters: IGameSessionCounters = GameSessionCounters.copyCounters(GameSessionCounters._currentCounters);
}
