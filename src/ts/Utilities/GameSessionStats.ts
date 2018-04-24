import { Campaign } from 'Models/Campaign';
import { Placement } from 'Models/Placement';

export class GameSessionStats {

    private _showCount: number = 0;
    private _viewCount: number = 0;

    constructor() {
        //
    }

    public addNewStart(placement: Placement, campaign: Campaign) {

    }

    public addNewView(placement: Placement, campaign: Campaign) {

    }

    // todo: is it ok to collect click data?
    // public addNewClick()

    public getDTO(): { [key: string]: any } {
        // todo
        return {};
    }

}