import { VastCreative } from 'VAST/Models/VastCreative';
export class VastCreativeLinear extends VastCreative {
    constructor(duration, skipDelay, mediaFiles, videoClickThroughURLTemplate, videoClickTrackingURLTemplates, videoCustomClickURLTemplates, adParameters) {
        super('VastCreativeLinear', {
            type: ['string'],
            trackingEvents: ['object'],
            duration: ['number'],
            skipDelay: ['number', 'null'],
            mediaFiles: ['array'],
            videoClickThroughURLTemplate: ['string', 'null'],
            videoClickTrackingURLTemplates: ['array'],
            videoCustomClickURLTemplates: ['array'],
            adParameters: ['string', 'null']
        }, 'linear');
        this.set('duration', duration || 0);
        this.set('skipDelay', skipDelay || null);
        this.set('mediaFiles', mediaFiles || []);
        this.set('videoClickThroughURLTemplate', videoClickThroughURLTemplate || null);
        this.set('videoClickTrackingURLTemplates', videoClickTrackingURLTemplates || []);
        this.set('videoCustomClickURLTemplates', videoCustomClickURLTemplates || []);
        this.set('adParameters', adParameters || null);
    }
    setAdParameters(adParameters) {
        this.set('adParameters', adParameters);
    }
    getDuration() {
        return this.get('duration');
    }
    setDuration(duration) {
        this.set('duration', duration);
    }
    getSkipDelay() {
        return this.get('skipDelay');
    }
    setSkipDelay(skipDelay) {
        this.set('skipDelay', skipDelay);
    }
    getMediaFiles() {
        return this.get('mediaFiles');
    }
    addMediaFile(mediaFile) {
        this.get('mediaFiles').push(mediaFile);
    }
    getVideoClickThroughURLTemplate() {
        return this.get('videoClickThroughURLTemplate');
    }
    setVideoClickThroughURLTemplate(videoClickThroughURLTemplate) {
        this.set('videoClickThroughURLTemplate', videoClickThroughURLTemplate || null);
    }
    getVideoClickTrackingURLTemplates() {
        return this.get('videoClickTrackingURLTemplates');
    }
    addVideoClickTrackingURLTemplate(trackingURLTemplate) {
        this.get('videoClickTrackingURLTemplates').push(trackingURLTemplate);
    }
    getVideoCustomClickURLTemplates() {
        return this.get('videoCustomClickURLTemplates');
    }
    getAdParameters() {
        return this.get('adParameters');
    }
    getDTO() {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVmFzdENyZWF0aXZlTGluZWFyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vc3JjL3RzL1ZBU1QvTW9kZWxzL1Zhc3RDcmVhdGl2ZUxpbmVhci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQWlCLFlBQVksRUFBRSxNQUFNLDBCQUEwQixDQUFDO0FBYXZFLE1BQU0sT0FBTyxrQkFBbUIsU0FBUSxZQUFpQztJQUtyRSxZQUFZLFFBQWlCLEVBQUUsU0FBa0IsRUFBRSxVQUFzQixFQUM3RCw0QkFBcUMsRUFBRSw4QkFBeUMsRUFDaEYsNEJBQXVDLEVBQUUsWUFBc0I7UUFDdkUsS0FBSyxDQUFDLG9CQUFvQixFQUFFO1lBQ3hCLElBQUksRUFBRSxDQUFDLFFBQVEsQ0FBQztZQUNoQixjQUFjLEVBQUUsQ0FBQyxRQUFRLENBQUM7WUFDMUIsUUFBUSxFQUFFLENBQUMsUUFBUSxDQUFDO1lBQ3BCLFNBQVMsRUFBRSxDQUFDLFFBQVEsRUFBRSxNQUFNLENBQUM7WUFDN0IsVUFBVSxFQUFFLENBQUMsT0FBTyxDQUFDO1lBQ3JCLDRCQUE0QixFQUFFLENBQUMsUUFBUSxFQUFFLE1BQU0sQ0FBQztZQUNoRCw4QkFBOEIsRUFBRSxDQUFDLE9BQU8sQ0FBQztZQUN6Qyw0QkFBNEIsRUFBRSxDQUFDLE9BQU8sQ0FBQztZQUN2QyxZQUFZLEVBQUUsQ0FBQyxRQUFRLEVBQUUsTUFBTSxDQUFDO1NBQ25DLEVBQUUsUUFBUSxDQUFDLENBQUM7UUFFYixJQUFJLENBQUMsR0FBRyxDQUFDLFVBQVUsRUFBRSxRQUFRLElBQUksQ0FBQyxDQUFDLENBQUM7UUFDcEMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxXQUFXLEVBQUUsU0FBUyxJQUFJLElBQUksQ0FBQyxDQUFDO1FBQ3pDLElBQUksQ0FBQyxHQUFHLENBQUMsWUFBWSxFQUFtQixVQUFVLElBQUksRUFBRSxDQUFDLENBQUM7UUFDMUQsSUFBSSxDQUFDLEdBQUcsQ0FBQyw4QkFB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