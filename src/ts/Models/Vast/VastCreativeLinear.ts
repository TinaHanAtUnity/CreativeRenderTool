import { VastCreative } from 'Models/Vast/VastCreative';
import { VastMediaFile } from 'Models/Vast/VastMediaFile';

export class VastCreativeLinear extends VastCreative {

    private _duration: number;
    private _skipDelay: number | null;
    private _mediaFiles: VastMediaFile[];
    private _videoClickThroughURLTemplate: string | null;
    private _videoClickTrackingURLTemplates: string[];
    private _videoCustomClickURLTemplates: string[];
    private _adParameters: any;

    constructor();
    constructor(duration?: number, skipDelay?: number, mediaFiles?: any[],
                videoClickThroughURLTemplate?: string, videoClickTrackingURLTemplates?: string[],
                videoCustomClickURLTemplates?: string[], adParameters?: any) {
        super('linear');
        this._duration = duration || 0;
        this._skipDelay = skipDelay || null;
        this._mediaFiles = mediaFiles || [];
        this._videoClickThroughURLTemplate = videoClickThroughURLTemplate || null;
        this._videoClickTrackingURLTemplates = videoClickTrackingURLTemplates || [];
        this._videoCustomClickURLTemplates = videoCustomClickURLTemplates || [];
        this._adParameters = adParameters || null;
    }

    public getDuration(): number {
        return this._duration;
    }

    public setDuration(duration: number) {
        this._duration = duration;
    }

    public getSkipDelay(): number | null {
        return this._skipDelay;
    }

    public setSkipDelay(skipDelay: number | null) {
        this._skipDelay = skipDelay;
    }

    public getMediaFiles(): VastMediaFile[] {
        return this._mediaFiles;
    }

    public addMediaFile(mediaFile: VastMediaFile) {
        this._mediaFiles.push(mediaFile);
    }

    public getVideoClickThroughURLTemplate(): string | null {
        return this._videoClickThroughURLTemplate;
    }

    public setVideoClickThroughURLTemplate(videoClickThroughURLTemplate: string) {
        this._videoClickThroughURLTemplate = videoClickThroughURLTemplate;
    }

    public getVideoClickTrackingURLTemplates(): string[] {
        return this._videoClickTrackingURLTemplates;
    }

    public addVideoClickTrackingURLTemplate(trackingURLTemplate: string) {
        this._videoClickTrackingURLTemplates.push(trackingURLTemplate);
    }

    public getVideoCustomClickURLTemplates(): string[] {
        return this._videoCustomClickURLTemplates;
    }

    public getAdParameters(): any {
        return this._adParameters;
    }

}
