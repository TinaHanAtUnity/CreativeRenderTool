import { Campaign } from 'Models/Campaign';
import { Asset } from 'Models/Asset';
import { Video } from 'Models/Video';
import { AbTest } from 'Utilities/AbTest';

export enum StoreName {
    APPLE,
    GOOGLE,
    XIAOMI
}

export class PerformanceCampaign extends Campaign {

    private _appStoreId: string;
    private _appStoreCountry: string;

    private _gameId: number;
    private _gameName: string;
    private _gameIcon: Asset;

    private _rating: number;
    private _ratingCount: number;

    private _landscapeImage: Asset;
    private _portraitImage: Asset;

    private _video: Video;
    private _streamingVideo: Video;

    private _clickAttributionUrl: string;
    private _clickAttributionUrlFollowsRedirects: boolean;

    private _bypassAppSheet: boolean;

    private _store: StoreName;

    private _backgroundImage: Asset;
    private _backgroundLayerImage: Asset;
    private _backgroundLogoImage: Asset;

    constructor(campaign: any, gamerId: string, abGroup: number) {
        super(campaign.id, gamerId, abGroup);

        this._appStoreId = campaign.appStoreId;
        this._appStoreCountry = campaign.appStoreCountry;

        this._gameId = campaign.gameId;
        this._gameName = campaign.gameName;
        this._gameIcon = new Asset(campaign.gameIcon);

        this._rating = campaign.rating;
        this._ratingCount = campaign.ratingCount;

        this._landscapeImage = new Asset(campaign.endScreenLandscape);
        this._portraitImage = new Asset(campaign.endScreenPortrait);

        this._video = new Video(campaign.trailerDownloadable, campaign.trailerDownloadableSize);
        this._streamingVideo = new Video(campaign.trailerStreaming);

        this._clickAttributionUrl = campaign.clickAttributionUrl;
        this._clickAttributionUrlFollowsRedirects = campaign.clickAttributionUrlFollowsRedirects;

        this._bypassAppSheet = campaign.bypassAppSheet;

        const campaignStore = typeof campaign.store !== 'undefined' ? campaign.store : '';
        switch(campaignStore) {
            case 'apple':
                this._store = StoreName.APPLE;
                break;
            case 'google':
                this._store = StoreName.GOOGLE;
                break;
            case 'xiaomi':
                this._store = StoreName.XIAOMI;
                break;
            default:
                throw new Error('Unknown store value "' + campaign.store + '"');
        }

        if(AbTest.isCoCAnimatedTest(this)) {
            this._backgroundImage = new Asset('https://cdn.unityads.unity3d.com/abtests/20170302coc/coc_back2.gif');
            this._backgroundLayerImage = new Asset('https://cdn.unityads.unity3d.com/abtests/20170302coc/coc_char2.gif');
            this._backgroundLogoImage = new Asset('https://cdn.unityads.unity3d.com/abtests/20170302coc/coc_logo.gif');
        }
        if(AbTest.isCoCAnimatedTest2(this)) {
            this._backgroundImage = new Asset('https://cdn.unityads.unity3d.com/abtests/20170302coc/coc_back.jpg');
            this._backgroundLayerImage = new Asset('https://cdn.unityads.unity3d.com/abtests/20170302coc/coc_char2.gif');
            this._backgroundLogoImage = new Asset('https://cdn.unityads.unity3d.com/abtests/20170302coc/coc_logo.gif');
        }
    }

    public getStore(): StoreName {
        return this._store;
    }

    public getAppStoreId(): string {
        return this._appStoreId;
    }

    public getAppStoreCountry(): string {
        return this._appStoreCountry;
    }

    public getGameId(): number {
        return this._gameId;
    }

    public getGameName(): string {
        return this._gameName;
    }

    public getGameIcon(): Asset {
        return this._gameIcon;
    }

    public getRating() {
        return this._rating;
    }

    public getRatingCount() {
        return this._ratingCount;
    }

    public getPortrait(): Asset {
        return this._portraitImage;
    }

    public getLandscape(): Asset {
        return this._landscapeImage;
    }

    public getVideo(): Video {
        return this._video;
    }

    public getStreamingVideo(): Video {
        return this._streamingVideo;
    }

    public getClickAttributionUrl(): string {
        return this._clickAttributionUrl;
    }

    public getClickAttributionUrlFollowsRedirects(): boolean {
        return this._clickAttributionUrlFollowsRedirects;
    }

    public getBypassAppSheet(): boolean {
        return this._bypassAppSheet;
    }

    public getTimeoutInSeconds(): number {
        return 0;
    }

    public getRequiredAssets() {
        return [
            this.getVideo()
        ];
    }

    public getOptionalAssets() {
        if(AbTest.isCoCAnimatedTest(this) || AbTest.isCoCAnimatedTest2(this)) {
            return [
                this.getGameIcon(),
                this.getPortrait(),
                this.getLandscape(),
                this.getBackgroundImage(),
                this.getBackgroundLayerImage(),
                this.getBackgroundLogoImage()
            ];
        } else {
            return [
                this.getGameIcon(),
                this.getPortrait(),
                this.getLandscape()
            ];
        }
    }

    public getBackgroundImage(): Asset {
        return this._backgroundImage;

    }

    public getBackgroundLayerImage(): Asset {
        return this._backgroundLayerImage;

    }

    public getBackgroundLogoImage(): Asset {
        return this._backgroundLogoImage;

    }

}
