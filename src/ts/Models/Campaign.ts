class Campaign {

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

    getStoreId() {
        return this._storeId;
    }

    getGameName() {
        return this._gameName;
    }

    getGameIcon() {
        return this._gameIcon;
    }

    setGameIcon(gameIcon: string) {
        this._gameIcon = gameIcon;
    }

    getRating() {
        return this._rating;
    }

    getRatingCount() {
        return this._ratingCount;
    }

    getPortraitUrl() {
        return this._portrait;
    }

    setPortraitUrl(portraitUrl: string) {
        this._portrait = portraitUrl;
    }

    getLandscapeUrl() {
        return this._landscape;
    }

    setLandscapeUrl(landscapeUrl: string) {
        this._landscape = landscapeUrl;
    }

    getVideoUrl() {
        return this._video;
    }

    setVideoUrl(videoUrl: string) {
        this._video = videoUrl;
    }

}

export = Campaign;