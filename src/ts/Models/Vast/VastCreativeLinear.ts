import { IVastCreative, VastCreative } from 'Models/Vast/VastCreative';
import { VastMediaFile } from 'Models/Vast/VastMediaFile';

interface IVastCreativeLinear extends IVastCreative {
    duration: number;
    skipDelay: number | null;
    mediaFiles: VastMediaFile[];
    videoClickThroughURLTemplate: string | null;
    videoClickTrackingURLTemplates: string[];
    videoCustomClickURLTemplates: string[];
    adParameters: object | null;
}

export class VastCreativeLinear extends VastCreative<IVastCreativeLinear> {
    constructor();
    constructor(duration?: number, skipDelay?: number, mediaFiles?: any[],
                videoClickThroughURLTemplate?: string, videoClickTrackingURLTemplates?: string[],
                videoCustomClickURLTemplates?: string[], adParameters?: any) {
        super({
            type: ['string'],
            trackingEvents: ['object'],
            duration: ['number'],
            skipDelay: ['number', 'null'],
            mediaFiles: ['array'],
            videoClickThroughURLTemplate: ['string', 'null'],
            videoClickTrackingURLTemplates: ['array'],
            videoCustomClickURLTemplates: ['array'],
            adParameters: ['object']
        }, 'linear');

        this.set('duration', duration || 0);
        this.set('skipDelay', skipDelay || null);
        this.set('mediaFiles', mediaFiles || []);
        this.set('videoClickThroughURLTemplate', videoClickThroughURLTemplate || null);
        this.set('videoClickTrackingURLTemplates', videoClickTrackingURLTemplates || []);
        this.set('videoCustomClickURLTemplates', videoCustomClickURLTemplates || []);
        this.set('adParameters', adParameters || null);
    }

    public getDuration(): number {
        return this.get('duration');
    }

    public setDuration(duration: number) {
        this.set('duration', duration);
    }

    public getSkipDelay(): number | null {
        return this.get('skipDelay');
    }

    public setSkipDelay(skipDelay: number | null) {
        this.set('skipDelay', skipDelay);
    }

    public getMediaFiles(): VastMediaFile[] {
        return this.get('mediaFiles');
    }

    public addMediaFile(mediaFile: VastMediaFile) {
        this.get('mediaFiles').push(mediaFile);
    }

    public getVideoClickThroughURLTemplate(): string | null {
        return this.get('videoClickThroughURLTemplate');
    }

    public setVideoClickThroughURLTemplate(videoClickThroughURLTemplate: string) {
        this.set('videoClickThroughURLTemplate', videoClickThroughURLTemplate || null);
    }

    public getVideoClickTrackingURLTemplates(): string[] {
        return this.get('videoClickTrackingURLTemplates');
    }

    public addVideoClickTrackingURLTemplate(trackingURLTemplate: string) {
        this.get('videoClickTrackingURLTemplates').push(trackingURLTemplate);
    }

    public getVideoCustomClickURLTemplates(): string[] {
        return this.get('videoCustomClickURLTemplates');
    }

    public getAdParameters(): {} | null {
        return this.get('adParameters');
    }

    public getDTO(): { [key: string]: any } {
        const mediaFiles = [];
        for (const mediaFile of this.getMediaFiles()) {
            mediaFiles.push(mediaFile.getDTO());
        }

        return {
            'vastCreative': super.getDTO(),
            'duration': this.getDuration(),
            'skipDelay': this.getSkipDelay(),
            'mediaFiles': mediaFiles,
            'videoClickThroughURLTemplate': this.getVideoClickThroughURLTemplate(),
            'videoClickTrackingURLTemplates': this.getVideoClickTrackingURLTemplates(),
            'videoCustomClickURLTemplates': this.getVideoCustomClickURLTemplates(),
            'adParameters': this.getAdParameters()
        };
    }
}
