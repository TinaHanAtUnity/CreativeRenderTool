import { VastCreative } from 'Models/Vast/VastCreative';
import { VastMediaFile } from 'Models/Vast/VastMediaFile';

export class VastCreativeLinear extends VastCreative {

    private _duration: number;
    private _skipDelay: number;
    private _mediaFiles: VastMediaFile[];
    private _videoClickThroughURLTemplate: string;
    private _videoClickTrackingURLTemplate: string;
    private _videoCustomClickURLTemplates: string[];
    private _adParameters: any;

    constructor();
    constructor(duration?: number, skipDelay?: number, mediaFiles?: any[],
                videoClickThroughURLTemplate?: string, videoClickTrackingURLTemplate?: string,
                videoCustomClickURLTemplates?: string[], adParameters?: any) {
        super('linear');
        this._duration = duration || 0;
        this._skipDelay = skipDelay || null;
        this._mediaFiles = mediaFiles || [];
        this._videoClickThroughURLTemplate = videoClickThroughURLTemplate || null;
        this._videoClickTrackingURLTemplate = videoClickTrackingURLTemplate || null;
        this._videoCustomClickURLTemplates = videoCustomClickURLTemplates || [];
        this._adParameters = adParameters || null;
    }

    public getDuration(): number {
        return this._duration;
    }

    public setDuration(duration: number) {
        this._duration = duration;
    }

    public getSkipDelay(): number {
        return this._skipDelay;
    }

    public setSkipDelay(skipDelay: number) {
        this._skipDelay = skipDelay;
    }

    public getMediaFiles(): VastMediaFile[] {
        return this._mediaFiles;
    }

    public addMediaFile(mediaFile: VastMediaFile) {
        this._mediaFiles.push(mediaFile);
    }

    public getVideoClickThroughURLTemplate(): string {
        return this._videoClickThroughURLTemplate;
    }

    public setVideoClickThroughURLTemplate(videoClickThroughURLTemplate: string) {
        this._videoClickThroughURLTemplate = videoClickThroughURLTemplate;
    }

    public getVideoClickTrackingURLTemplate(): string {
        return this._videoClickTrackingURLTemplate;
    }

    public setVideoClickTrackingURLTemplate(videoClickTrackingURLTemplate: string) {
        this._videoClickTrackingURLTemplate = videoClickTrackingURLTemplate;
    }

    public getVideoCustomClickURLTemplates(): string[] {
        return this._videoCustomClickURLTemplates;
    }

    public getAdParameters(): any {
        return this._adParameters;
    }

}
