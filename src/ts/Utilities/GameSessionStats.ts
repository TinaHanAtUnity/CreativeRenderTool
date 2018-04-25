import { Campaign } from 'Models/Campaign';
import { Placement } from 'Models/Placement';

export class GameSessionStats {

    public static init() {
        this._adRequestCount = 0;
        this._totalShowCount = 0;
        this._totalViewCount = 0;
    }

    public static addNewStart(placement?: Placement, campaign?: Campaign) {
        this._adRequestCount++;
        if (campaign) {

        }
    }

    public static addNewView(placement?: Placement, campaign?: Campaign) {
        this._totalViewCount++;
    }

    public static addNewAdRequest() {
        this._adRequestCount++;
    }

    // todo: is it ok to collect click data?
    // public addNewClick()

    public static getDTO(): { [key: string]: any } {
        return { adRequests: this._adRequestCount,
            shows: this._showCount,
            views: this._viewCount };
    }

    private static _adRequestCount: number;
    private static _totalShowCount: number;
    private static _totalViewCount: number;
    private static _targetShowCount: number;
    private static _targetViewCount: number;

}