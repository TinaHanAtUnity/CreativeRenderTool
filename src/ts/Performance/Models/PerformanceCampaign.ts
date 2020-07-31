import { AdUnitStyle, IAdUnitStyle } from 'Ads/Models/AdUnitStyle';
import { Image } from 'Ads/Models/Assets/Image';
import { Video } from 'Ads/Models/Assets/Video';
import { Campaign, ICampaign, IRawCampaign } from 'Ads/Models/Campaign';
import { Asset } from 'Ads/Models/Assets/Asset';
import { HTML } from 'Ads/Models/Assets/HTML';

export enum StoreName {
    APPLE,
    GOOGLE,
    XIAOMI,
    // for APK campaigns
    STANDALONE_ANDROID
}

export interface IRawPerformanceCampaign extends IRawCampaign {
    appStoreId: string;
    gameId: number;
    gameName: string;
    gameIcon: string;
    rating: number;
    ratingCount: number;
    endScreenLandscape?: string;
    endScreenPortrait?: string;
    endScreen?: string;
    trailerDownloadable?: string;
    trailerDownloadableSize?: number;
    trailerStreaming?: string;
    trailerPortraitDownloadable?: string;
    trailerPortraitDownloadableSize?: number;
    trailerPortraitStreaming?: string;
    portraitCreativeId?: string;
    clickAttributionUrl?: string;
    clickAttributionUrlFollowsRedirects?: boolean;
    clickUrl: string;
    videoEventUrls: { [eventType: string]: string };
    bypassAppSheet: boolean;
    store: string;
    adUnitStyle: IAdUnitStyle;
    appDownloadUrl?: string;
    mraidUrl?: string;
    dynamicMarkup?: string;
    endScreenType?: string;
    endScreenUrl?: string;
}

export interface IPerformanceCampaign extends ICampaign {
    appStoreId: string;
    gameId: number;
    gameName: string;
    gameIcon: Image;
    rating: number;
    ratingCount: number;
    landscapeImage?: Image;
    portraitImage?: Image;
    squareImage?: Image;
    video?: Video;
    streamingVideo?: Video;
    videoPortrait?: Video;
    streamingPortraitVideo?: Video;
    clickAttributionUrl?: string;
    clickAttributionUrlFollowsRedirects?: boolean;
    clickUrl: string;
    videoEventUrls: { [eventType: string]: string };
    bypassAppSheet: boolean;
    store: StoreName;
    adUnitStyle: AdUnitStyle | undefined;
    appDownloadUrl?: string;
    endScreenType?: string;
    endScreen?: HTML;
}

export class PerformanceCampaign extends Campaign<IPerformanceCampaign> {
    constructor(campaign: IPerformanceCampaign) {
        super('PerformanceCampaign', {
            ... Campaign.Schema,
            appStoreId: ['string'],
            gameId: ['number'],
            gameName: ['string'],
            gameIcon: ['object'],
            rating: ['number'],
            ratingCount: ['number'],
            landscapeImage: ['object', 'undefined'],
            portraitImage: ['object', 'undefined'],
            squareImage: ['object', 'undefined'],
            video: ['object', 'undefined'],
            streamingVideo: ['object', 'undefined'],
            videoPortrait: ['object', 'undefined'],
            streamingPortraitVideo: ['object', 'undefined'],
            clickAttributionUrl: ['string', 'undefined'],
            clickAttributionUrlFollowsRedirects: ['boolean', 'undefined'],
            clickUrl: ['string'],
            videoEventUrls: ['object'],
            bypassAppSheet: ['boolean'],
            store: ['number'],
            adUnitStyle: ['object', 'undefined'],
            appDownloadUrl: ['string', 'undefined'],
            endScreenType: ['string', 'undefined'],
            endScreen: ['object', 'undefined']
        }, campaign);
    }

    public getStore(): StoreName {
        return this.get('store');
    }

    public getAppStoreId(): string {
        return this.get('appStoreId');
    }

    public getGameId(): number {
        return this.get('gameId');
    }

    public getGameName(): string {
        return this.get('gameName');
    }

    public getGameIcon(): Image {
        return this.get('gameIcon');
    }

    public getRating(): number {
        return this.get('rating');
    }

    public getRatingCount(): number {
        return this.get('ratingCount');
    }

    public getPortrait(): Image | undefined {
        return this.get('portraitImage');
    }

    public getLandscape(): Image | undefined {
        return this.get('landscapeImage');
    }

    public getSquare(): Image | undefined {
        return this.get('squareImage');
    }

    public getVideo(): Video | undefined {
        return this.get('video');
    }

    public getStreamingVideo(): Video | undefined {
        return this.get('streamingVideo');
    }

    public getPortraitVideo(): Video | undefined {
        return this.get('videoPortrait');
    }

    public getStreamingPortraitVideo(): Video | undefined {
        return this.get('streamingPortraitVideo');
    }

    public getClickAttributionUrl(): string | undefined {
        return this.get('clickAttributionUrl');
    }

    public getClickAttributionUrlFollowsRedirects(): boolean | undefined {
        return this.get('clickAttributionUrlFollowsRedirects');
    }

    public getClickUrl(): string {
        return this.get('clickUrl');
    }

    public getVideoEventUrls(): { [eventType: string]: string } {
        return this.get('videoEventUrls');
    }

    public getVideoEventUrl(eventType: string): string {
        return this.get('videoEventUrls')[eventType];
    }

    public getBypassAppSheet(): boolean {
        return this.get('bypassAppSheet');
    }

    public getTimeoutInSeconds(): number {
        return 0;
    }

    public getRequiredAssets() {
        return [];
    }

    public getOptionalAssets() {
        const assets: Asset[] = [];

        assets.push(this.getGameIcon());

        const square = this.getSquare();
        if (square) {
            assets.push(square);
        }

        const landscape = this.getLandscape();
        if (landscape) {
            assets.push(landscape);
        }

        const portrait = this.getPortrait();
        if (portrait) {
            assets.push(portrait);
        }

        const endScreen = this.getEndScreen();
        if (endScreen) {
            assets.push(endScreen);
        }

        return assets;
    }

    public getAppDownloadUrl() {
        return this.get('appDownloadUrl');
    }

    public isConnectionNeeded(): boolean {
        return false;
    }

    public getAdUnitStyle(): AdUnitStyle | undefined {
        return this.get('adUnitStyle');
    }

    public getEndScreenType(): string | undefined {
        return this.get('endScreenType');
    }

    public getEndScreen(): HTML | undefined {
        return this.get('endScreen');
    }

    public getDTO(): { [key: string]: unknown } {
        let gameIcon: unknown;
        const gameIconObject = this.getGameIcon();
        if (gameIconObject) {
            gameIcon = gameIconObject.getDTO();
        }

        let squareImage: unknown;
        const squareImageObject = this.getSquare();
        if (squareImageObject) {
            squareImage = squareImageObject.getDTO();
        }

        let landscapeImage: unknown;
        const landscapeImageObject = this.getLandscape();
        if (landscapeImageObject) {
            landscapeImage = landscapeImageObject.getDTO();
        }

        let portraitImage: unknown;
        const portraitImageObject = this.getPortrait();
        if (portraitImageObject) {
            portraitImage = portraitImageObject.getDTO();
        }

        let video: unknown;
        const videoObject = this.getVideo();
        if (videoObject) {
            video = videoObject.getDTO();
        }

        let streamingVideo: unknown;
        const streamingVideoObject = this.getStreamingVideo();
        if (streamingVideoObject) {
            streamingVideo = streamingVideoObject.getDTO();
        }

        return {
            'campaign': super.getDTO(),
            'appStoreId': this.getAppStoreId(),
            'gameId': this.getGameId(),
            'gameName': this.getGameName(),
            'gameIcon': gameIcon,
            'rating': this.getRating(),
            'ratingCount': this.getRatingCount(),
            'squareImage': squareImage,
            'landscapeImage': landscapeImage,
            'portraitImage': portraitImage,
            'video': video,
            'streamingVideo': streamingVideo,
            'clickAttributionUrl': this.getClickAttributionUrl(),
            'clickAttributionUrlFollowsRedirects': this.getClickAttributionUrlFollowsRedirects(),
            'bypassAppSheet': this.getBypassAppSheet(),
            'store': StoreName[this.getStore()].toLowerCase(),
            'appDownloadUrl': this.getAppDownloadUrl(),
            'endScreenType': this.getEndScreenType(),
            'endScreen': this.getEndScreen()
        };
    }
}
