import { Vast } from 'Models/Vast';
import { VastParser } from 'Utilities/VastParser';

export class Campaign {

    public static vastParser: VastParser;

    private _id: string;
    private _appStoreId: string;
    private _gameId: number;
    private _gameName: string;
    private _gameIcon: string;
    private _rating: number;
    private _ratingCount: number;
    private _landscapeImage: string;
    private _portraitImage: string;
    private _video: string;
    private _videoSize: number;
    private _streamingVideo: string;
    private _clickAttributionUrl: string;
    private _clickAttributionUrlFollowsRedirects: boolean;
    private _bypassAppSheet: boolean;

    private _gamerId: string;
    private _abGroup: number;

    private _vast: Vast;


    constructor(gamerId: string, abGroup: number, data: any) {
        if (data.campaign) {
            const campaign = data.campaign;
            this._id = campaign.id;
            this._appStoreId = campaign.appStoreId;
            this._gameId = campaign.gameId;
            this._gameName = campaign.gameName;
            this._gameIcon = campaign.gameIcon;
            this._rating = campaign.rating;
            this._ratingCount = campaign.ratingCount;
            this._landscapeImage = campaign.endScreenLandscape;
            this._portraitImage = campaign.endScreenPortrait;
            this._video = campaign.trailerDownloadable;
            this._videoSize = campaign.trailerDownloadableSize;
            this._streamingVideo = campaign.trailerStreaming;
            this._clickAttributionUrl = campaign.clickAttributionUrl;
            this._clickAttributionUrlFollowsRedirects = campaign.clickAttributionUrlFollowsRedirects;
            this._bypassAppSheet = campaign.bypassAppSheet;
        } else if (data.vast) {
            this._vast = (Campaign.vastParser || new VastParser()).parseVast(data.vast);
        }

        this._gamerId = gamerId;
        this._abGroup = abGroup;
    }

    public getId(): string {
        return this._id;
    }

    public getAppStoreId(): string {
        return this._appStoreId;
    }

    public getGameId(): number {
        return this._gameId;
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
        return this._portraitImage;
    }

    public setPortraitUrl(portraitUrl: string): void {
        this._portraitImage = portraitUrl;
    }

    public getLandscapeUrl(): string {
        return this._landscapeImage;
    }

    public setLandscapeUrl(landscapeUrl: string): void {
        this._landscapeImage = landscapeUrl;
    }

    public getVideoUrl(): string {
        if (this._vast && this._vast.getVideoUrl()) {
            return this._vast.getVideoUrl();
        } else {
            return this._video;
        }
    }

    public setVideoUrl(videoUrl: string): void {
        this._video = videoUrl;
    }

    public getClickAttributionUrl(): string {
        return this._clickAttributionUrl;
    }

    public getClickAttributionUrlFollowsRedirects(): boolean {
        return this._clickAttributionUrlFollowsRedirects;
    }

    public getGamerId(): string {
        return this._gamerId;
    }

    public getAbGroup(): number {
        return this._abGroup;
    }

    public getVast(): Vast {
        return this._vast;
    }

}
