export default class Campaign {

    private _id: string;
    private _storeId: string;
    private _gameName: string;
    private _gameIcon: string;
    private _rating: number;
    private _ratingCount: number;
    private _portrait: string;
    private _landscape: string;
    private _video: string;

    constructor(data: any) {
        this._id = data._id;
        this._storeId = data.iTunesId;
        this._gameName = data.gameName;
        this._gameIcon = data.gameIcon;
        this._rating = data.rating;
        this._ratingCount = data.ratingCount;
        this._portrait = data.endScreenPortrait;
        this._landscape = data.endScreen;
        this._video = data.trailerDownloadable;
    }

    public getStoreId(): string {
        return this._storeId;
    }

    public getGameName(): string {
        return this._gameName;
    }

    public getGameIcon(): string {
        return this._gameIcon;
    }

    public setGameIcon(gameIcon: string): void {
        this._gameIcon = gameIcon;
    }

    public getRating(): number {
        return this._rating;
    }

    public getRatingCount(): number {
        return this._ratingCount;
    }

    public getPortraitUrl(): string {
        return this._portrait;
    }

    public setPortraitUrl(portraitUrl: string): void {
        this._portrait = portraitUrl;
    }

    public getLandscapeUrl(): string {
        return this._landscape;
    }

    public setLandscapeUrl(landscapeUrl: string): void {
        this._landscape = landscapeUrl;
    }

    public getVideoUrl(): string {
        return this._video;
    }

    public setVideoUrl(videoUrl: string): void {
        this._video = videoUrl;
    }

}
