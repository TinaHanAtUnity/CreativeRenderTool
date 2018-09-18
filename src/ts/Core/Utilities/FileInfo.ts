import { Video } from 'Ads/Models/Assets/Video';
import { Campaign } from 'Ads/Models/Campaign';
import { VideoMetadata } from 'Core/Constants/Android/VideoMetadata';
import { Platform } from 'Core/Constants/Platform';
import { NativeBridge } from 'Core/Native/Bridge/NativeBridge';
import { IFileInfo } from 'Core/Native/Cache';
import { CacheBookkeeping } from 'Core/Utilities/CacheBookkeeping';
import { Diagnostics } from 'Core/Utilities/Diagnostics';
import { FileId } from 'Core/Utilities/FileId';

export class FileInfo {
    public static getVideoInfo(nativeBridge: NativeBridge, fileId: string): Promise<[number, number, number]> {
        if(nativeBridge.getPlatform() === Platform.IOS) {
            return nativeBridge.Cache.Ios.getVideoInfo(fileId).then(([width, height, duration]) => {
                return <[number, number, number]>[width, height, duration];
            });
        } else {
            const metadataKeys = [VideoMetadata.METADATA_KEY_VIDEO_WIDTH, VideoMetadata.METADATA_KEY_VIDEO_HEIGHT, VideoMetadata.METADATA_KEY_DURATION];
            return nativeBridge.Cache.Android.getMetaData(fileId, metadataKeys).then(results => {
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

    public static isVideoValid(nativeBridge: NativeBridge, video: Video, campaign: Campaign): Promise<boolean> {
        return FileId.getFileId(video.getOriginalUrl(), nativeBridge).then(fileId => {
            return FileInfo.getVideoInfo(nativeBridge, fileId).then(([width, height, duration]) => {
                const isValid = (width > 0 && height > 0 && duration > 0 && duration <= this._maxVideoDuration);
                let errorType = 'video_validation_failed';
                if(duration > this._maxVideoDuration) {
                    errorType = 'video_validation_failed_video_too_long';
                }
                if(!isValid) {
                    Diagnostics.trigger(errorType, {
                        url: video.getOriginalUrl(),
                        width: width,
                        height: height,
                        duration: duration
                    }, campaign.getSession());
                }
                return isValid;
            }).catch(error => {
                Diagnostics.trigger('video_validation_failed', {
                    url: video.getOriginalUrl(),
                    error: error
                }, campaign.getSession());
                return false;
            });
        });
    }

    public static getFileInfo(nativeBridge: NativeBridge, fileId: string): Promise<IFileInfo | undefined> {
        return nativeBridge.Cache.getFileInfo(fileId).catch(() => {
            return Promise.resolve(undefined);
        });
    }

    public static isCached(nativeBridge: NativeBridge, cacheBookkeeping: CacheBookkeeping, url: string): Promise<boolean> {
        return FileId.getFileId(url, nativeBridge).then(fileId => {
            return this.getFileInfo(nativeBridge, fileId).then(fileInfo => {
                if(fileInfo && fileInfo.found && fileInfo.size > 0) {
                    return cacheBookkeeping.getFileInfo(fileId).then(cacheResponse => {
                        return cacheResponse.fullyDownloaded;
                    }).catch(() => {
                        return false;
                    });
                }
                return false;
            });
        });
    }

    private static readonly _maxVideoDuration = 40000;
}
