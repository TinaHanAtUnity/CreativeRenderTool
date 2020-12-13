import { SessionDiagnostics } from 'Ads/Utilities/SessionDiagnostics';
import { VideoMetadata } from 'Core/Constants/Android/VideoMetadata';
import { Platform } from 'Core/Constants/Platform';
import { FileId } from 'Core/Utilities/FileId';
export class VideoFileInfo {
    static getVideoInfo(platform, cache, fileId) {
        if (platform === Platform.IOS) {
            return cache.iOS.getVideoInfo(fileId).then(([width, height, duration]) => {
                return [width, height, duration];
            });
        }
        else {
            const metadataKeys = [VideoMetadata.METADATA_KEY_VIDEO_WIDTH, VideoMetadata.METADATA_KEY_VIDEO_HEIGHT, VideoMetadata.METADATA_KEY_DURATION];
            return cache.Android.getMetaData(fileId, metadataKeys).then(results => {
                let width = 0;
                let height = 0;
                let duration = 0;
                for (const entry of results) {
                    const key = entry[0];
                    const value = entry[1];
                    switch (key) {
                        case VideoMetadata.METADATA_KEY_VIDEO_WIDTH:
                            width = value;
                            break;
                        case VideoMetadata.METADATA_KEY_VIDEO_HEIGHT:
                            height = value;
                            break;
                        case VideoMetadata.METADATA_KEY_DURATION:
                            duration = value;
                            break;
                        default:
                        // unknown key, ignore
                    }
                }
                return [width, height, duration];
            });
        }
    }
    static isVideoValid(platform, cache, video, campaign) {
        return FileId.getFileId(video.getOriginalUrl(), cache).then(fileId => {
            return VideoFileInfo.getVideoInfo(platform, cache, fileId).then(([width, height, duration]) => {
                const isValid = (width > 0 && height > 0 && duration > 0 && duration <= this._maxVideoDuration);
                let errorType = 'video_validation_failed';
                if (duration > this._maxVideoDuration) {
                    errorType = 'video_validation_failed_video_too_long';
                }
                if (!isValid) {
                    SessionDiagnostics.trigger(errorType, {
                        url: video.getOriginalUrl(),
                        width: width,
                        height: height,
                        duration: duration
                    }, campaign.getSession());
                }
                return isValid;
            }).catch(error => {
                SessionDiagnostics.trigger('video_validation_failed', {
                    url: video.getOriginalUrl(),
                    error: error
                }, campaign.getSession());
                return false;
            });
        });
    }
}
// Longest video shown should be no more than 40 seconds
VideoFileInfo._maxVideoDuration = 40000;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVmlkZW9GaWxlSW5mby5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3NyYy90cy9BZHMvVXRpbGl0aWVzL1ZpZGVvRmlsZUluZm8udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBRUEsT0FBTyxFQUFFLGtCQUFrQixFQUFFLE1BQU0sa0NBQWtDLENBQUM7QUFDdEUsT0FBTyxFQUFFLGFBQWEsRUFBRSxNQUFNLHNDQUFzQyxDQUFDO0FBQ3JFLE9BQU8sRUFBRSxRQUFRLEVBQUUsTUFBTSx5QkFBeUIsQ0FBQztBQUVuRCxPQUFPLEVBQUUsTUFBTSxFQUFFLE1BQU0sdUJBQXVCLENBQUM7QUFFL0MsTUFBTSxPQUFPLGFBQWE7SUFFZixNQUFNLENBQUMsWUFBWSxDQUFDLFFBQWtCLEVBQUUsS0FBZSxFQUFFLE1BQWM7UUFDMUUsSUFBSSxRQUFRLEtBQUssUUFBUSxDQUFDLEdBQUcsRUFBRTtZQUMzQixPQUFPLEtBQUssQ0FBQyxHQUFJLENBQUMsWUFBWSxDQUFDLE1BQU0sQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsS0FBSyxFQUFFLE1BQU0sRUFBRSxRQUFRLENBQUMsRUFBRSxFQUFFO2dCQUN0RSxPQUFpQyxDQUFDLEtBQUssRUFBRSxNQUFNLEVBQUUsUUFBUSxDQUFDLENBQUM7WUFDL0QsQ0FBQyxDQUFDLENBQUM7U0FDTjthQUFNO1lBQ0gsTUFBTSxZQUFZLEdBQUcsQ0FBQyxhQUFhLENBQUMsd0JBQXdCLEVBQUUsYUFBYSxDQUFDLHlCQUF5QixFQUFFLGFBQWEsQ0FBQyxxQkFBcUIsQ0FBQyxDQUFDO1lBQzVJLE9BQU8sS0FBSyxDQUFDLE9BQVEsQ0FBQyxXQUFXLENBQUMsTUFBTSxFQUFFLFlBQVksQ0FBQyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsRUFBRTtnQkFDbkUsSUFBSSxLQUFLLEdBQUcsQ0FBQyxDQUFDO2dCQUNkLElBQUksTUFBTSxHQUFHLENBQUMsQ0FBQztnQkFDZixJQUFJLFFBQVEsR0FB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