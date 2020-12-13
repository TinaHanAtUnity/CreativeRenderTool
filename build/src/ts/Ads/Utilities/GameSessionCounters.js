import { PerformanceCampaign } from 'Performance/Models/PerformanceCampaign';
import { PerformanceMRAIDCampaign } from 'Performance/Models/PerformanceMRAIDCampaign';
export class GameSessionCounters {
    static init() {
        this._adRequestCount = 0;
        this._totalStartCount = 0;
        this._totalViewCount = 0;
        this._targetStartCounter = {};
        this._targetViewCounter = {};
        this._latestTargetStarts = {};
    }
    static addStart(campaign) {
        this._totalStartCount++;
        const targetGameId = this.getTargetGameId(campaign);
        if (targetGameId) {
            this._latestTargetStarts[targetGameId] = (new Date()).toISOString();
            if (this._targetStartCounter[targetGameId]) {
                let targetStartCount = this._targetStartCounter[targetGameId];
                this._targetStartCounter[targetGameId] = ++targetStartCount;
            }
            else {
                this._targetStartCounter[targetGameId] = 1;
            }
        }
    }
    static addView(campaign) {
        this._totalViewCount++;
        const targetGameId = this.getTargetGameId(campaign);
        if (targetGameId) {
            if (this._targetViewCounter[targetGameId]) {
                let targetViewCount = this._targetViewCounter[targetGameId];
                this._targetViewCounter[targetGameId] = ++targetViewCount;
            }
            else {
                this._targetViewCounter[targetGameId] = 1;
            }
        }
    }
    static addAdRequest() {
        this._adRequestCount++;
    }
    static getCurrentCounters() {
        return {
            adRequests: this._adRequestCount,
            starts: this._totalStartCount,
            views: this._totalViewCount,
            startsPerTarget: Object.assign({}, this._targetStartCounter),
            viewsPerTarget: Object.assign({}, this._targetViewCounter),
            latestTargetStarts: Object.assign({}, this._latestTargetStarts)
        };
    }
    static getTargetGameId(campaign) {
        if (campaign instanceof PerformanceCampaign) {
            return campaign.getGameId();
        }
        let targetGameId;
        if (campaign instanceof PerformanceMRAIDCampaign) {
            targetGameId = campaign.getTargetGameId();
        }
        return targetGameId;
    }
}
GameSessionCounters._adRequestCount = 0;
GameSessionCounters._totalStartCount = 0;
GameSessionCounters._totalViewCount = 0;
GameSessionCounters._targetStartCounter = {};
GameSessionCounters._targetViewCounter = {};
GameSessionCounters._latestTargetStarts = {};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiR2FtZVNlc3Npb25Db3VudGVycy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3NyYy90cy9BZHMvVXRpbGl0aWVzL0dhbWVTZXNzaW9uQ291bnRlcnMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQ0EsT0FBTyxFQUFFLG1CQUFtQixFQUFFLE1BQU0sd0NBQXdDLENBQUM7QUFDN0UsT0FBTyxFQUFFLHdCQUF3QixFQUFFLE1BQU0sNkNBQTZDLENBQUM7QUFXdkYsTUFBTSxPQUFPLG1CQUFtQjtJQUVyQixNQUFNLENBQUMsSUFBSTtRQUNkLElBQUksQ0FBQyxlQUFlLEdBQUcsQ0FBQyxDQUFDO1FBQ3pCLElBQUksQ0FBQyxnQkFBZ0IsR0FBRyxDQUFDLENBQUM7UUFDMUIsSUFBSSxDQUFDLGVBQWUsR0FBRyxDQUFDLENBQUM7UUFDekIsSUFBSSxDQUFDLG1CQUFtQixHQUFHLEVBQUUsQ0FBQztRQUM5QixJQUFJLENBQUMsa0JBQWtCLEdBQUcsRUFBRSxDQUFDO1FBQzdCLElBQUksQ0FBQyxtQkFBbUIsR0FBRyxFQUFFLENBQUM7SUFDbEMsQ0FBQztJQUVNLE1BQU0sQ0FBQyxRQUFRLENBQUMsUUFBa0I7UUFDckMsSUFBSSxDQUFDLGdCQUFnQixFQUFFLENBQUM7UUFFeEIsTUFBTSxZQUFZLEdBQUcsSUFBSSxDQUFDLGVBQWUsQ0FBQyxRQUFRLENBQUMsQ0FBQztRQUNwRCxJQUFJLFlBQVksRUFBRTtZQUNkLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxZQUFZLENBQUMsR0FBRyxDQUFDLElBQUksSUFBSSxFQUFFLENBQUMsQ0FBQyxXQUFXLEVBQUUsQ0FBQztZQUVwRSxJQUFJLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxZQUFZLENBQUMsRUFBRTtnQkFDeEMsSUFBSSxnQkFBZ0IsR0FBRyxJQUFJLENBQUMsbUJBQW1CLENBQUMsWUFBWSxDQUFDLENBQUM7Z0JBQzlELElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxZQUFZLENBQUMsR0FBRyxFQUFFLGdCQUFnQixDQUFDO2FBQy9EO2lCQUFNO2dCQUNILElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxZQUFZLENBQUMsR0FBRyxDQUFDLENBQUM7YUFDOUM7U0FDSjtJQUNMLENBQUM7SUFFTSxNQUFNLENBQUMsT0FBTyxDQUFDLFFBQWtCO1FBQ3BDLElBQUksQ0FBQyxlQUFlLEVBQUUsQ0FBQztRQUV2QixNQUFNLFlBQVksR0FBRyxJQUFJLENBQUMsZUFBZSxDQUFDLFFBQVEsQ0FBQyxDQUFDO1FBQ3BELElBQUksWUFBWSxFQUFFO1lBQ2QsSUFBSSxJQUFJLENBQUMsa0JBQWtCLENBQUMsWUFBWSxDQUFDLEVBQUU7Z0JBQ3ZDLElBQUksZUFBZSxHQUFHLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxZQUFZLENBQUMsQ0FBQztnQkFDNUQsSUFBSSxDQUFDLGtCQUFrQixDQUFDLFlBQVksQ0FBQyxHQUFHLEVBQUUsZUFBZSxDQUFDO2FBQzdEO2lCQUFNO2dCQUNILElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxZQUFZLENBQUMsR0FBRyxDQUFDLENBQUM7YUFDN0M7U0FDSjtJQUNMLENBQUM7SUFFTSxNQUFNLENBQUMsWUFBWTtRQUN0QixJQUFJLENBQUMsZUFBZSxFQUFFLENBQUM7SUFDM0IsQ0FBQztJQUVNLE1BQU0sQ0FBQyxrQkFBa0I7UUFDNUIsT0FBTztZQUNILFVBQVUsRUFBRSxJQUFJLENBQUMsZUFBZTtZQUNoQyxNQUFNLEVBQUUsSUFBSSxDQUFDLGdCQUFnQjtZQUM3QixLQUFLLEVBQUUsSUFBSSxDQUFDLGVBQWU7WUFDM0IsZUFBZSxvQkFBTyxJQUFJLENBQUMsbUJBQW1CLENBQUU7WUFDaEQsY0FBYyxvQkFBTyxJQUFJLENBQUMsa0JBQWtCLENBQUU7WUFDOUMsa0JBQWtCLG9CQUFPLElBQUksQ0FBQyxtQkFBbUIsQ0FBRTtTQUN0RCxDQUFDO0lBQ04sQ0FBQztJQUVPLE1BQU0sQ0FBQyxlQUFlLENBQUMsUUFBa0I7UUFDN0MsSUFBSSxRQUFRLFlBQVksbUJBQW1CLEVBQUU7WUFDekMsT0FBTyxRQUFRLENBQUMsU0FBUyxFQUFFLENBQUM7U0FDL0I7UUFDRCxJQUFJLFlBQVksQ0FBQztRQUNqQixJQUFJLFFBQVEsWUFBWSx3QkFBd0IsRUFBRTtZQUM5QyxZQUFZLEdBQUcsUUFBUSxDQUFDLGVBQWUsRUFBRSxDQUFDO1NBQzdDO1FBQ0QsT0FBTyxZQUFZLENBQUM7SUFDeEIsQ0FBQzs7QUFFYyxtQ0FBZSxHQUFXLENBQUMsQ0FBQztBQUM1QixvQ0FBZ0IsR0FBVyxDQUFDLENBQUM7QUFDN0IsbUNBQWUsR0FBVyxDQUFDLENBQUM7QUFDNUIsdUNBQW1CLEdBQTJCLEVBQUUsQ0FBQztBQUNqRCxzQ0FBa0IsR0FBMkIsRUFBRSxDQUFDO0FBQ2hELHVDQUFtQixHQUEyQixFQUFFLENBQUMifQ==