import { Video } from 'Ads/Models/Assets/Video';
import { Campaign } from 'Ads/Models/Campaign';
import { SessionDiagnostics } from 'Ads/Utilities/SessionDiagnostics';
import { VideoMetadata } from 'Core/Constants/Android/VideoMetadata';
import { Platform } from 'Core/Constants/Platform';
import { CacheApi } from 'Core/Native/Cache';
import { FileId } from 'Core/Utilities/FileId';

export class VideoFileInfo {

    public static getVideoInfo(platform: Platform, cache: CacheApi, fileId: string): Promise<[number, number, number]> {
        if(platform === Platform.IOS) {
            return cache.iOS!.getVideoInfo(fileId).then(([width, height, duration]) => {
                return <[number, number, number]>[width, height, duration];
            });
        } else {
            const metadataKeys = [VideoMetadata.METADATA_KEY_VIDEO_WIDTH, VideoMetadata.METADATA_KEY_VIDEO_HEIGHT, VideoMetadata.METADATA_KEY_DURATION];
            return cache.Android!.getMetaData(fileId, metadataKeys).then(results => {
                let width: number = 0;
                let height: number = 0;
                let duration: number = 0;

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

                return <[number, number, number]>[width, height, duration];
            });
        }
    }

    public static isVideoValid(platform: Platform, cache: CacheApi, video: Video, campaign: Campaign): Promise<boolean> {
        return FileId.getFileId(video.getOriginalUrl(), cache).then(fileId => {
            return VideoFileInfo.getVideoInfo(platform, cache, fileId).then(([width, height, duration]) => {
                const isValid = (width > 0 && height > 0 && duration > 0 && duration <= this._maxVideoDuration);
                let errorType = 'video_validation_failed';
                if(duration > this._maxVideoDuration) {
                    errorType = 'video_validation_failed_video_too_long';
                }
                if(!isValid) {
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

    private static readonly _maxVideoDuration = 40000;

}
