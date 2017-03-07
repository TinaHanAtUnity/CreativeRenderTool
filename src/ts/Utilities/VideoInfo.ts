import { NativeBridge } from 'Native/NativeBridge';
import { Platform } from 'Constants/Platform';
import { DiagnosticError } from 'Errors/DiagnosticError';
import { Video } from 'Models/Video';
import { VideoMetadata } from 'Constants/Android/VideoMetadata';
import { Diagnostics } from "./Diagnostics";

export class VideoInfo {
    public static isValid(nativeBridge: NativeBridge, fileId: string, video: Video, reportErrors: boolean): Promise<boolean> {
        if(nativeBridge.getPlatform() === Platform.IOS) {
            return nativeBridge.Cache.Ios.getVideoInfo(fileId).then(([width, height, duration]) => {
                if(width > 0 && height > 0 && duration > 0) {
                    return true;
                } else {
                    VideoInfo.reportValidationErrors(reportErrors, video);
                    return false;
                }
            }).catch(error => {
                VideoInfo.reportValidationErrors(reportErrors, video, error);
                return false;
            });
        } else {
            const metadataKeys = [VideoMetadata.METADATA_KEY_VIDEO_WIDTH, VideoMetadata.METADATA_KEY_VIDEO_HEIGHT, VideoMetadata.METADATA_KEY_DURATION];
            return nativeBridge.Cache.Android.getMetaData(fileId, metadataKeys).then(results => {
                const width: number = results[0][1];
                const height: number = results[1][1];
                const duration: number = results[2][1];

                if(width > 0 && height > 0 && duration > 0) {
                    return true;
                } else {
                    VideoInfo.reportValidationErrors(reportErrors, video);
                    return false;
                }
            }).catch(error => {
                VideoInfo.reportValidationErrors(reportErrors, video, error);
            });
        }
    }

    private static reportValidationErrors(reportErrors: boolean, video: Video, error?: Error) {
        if(reportErrors) {
            let nativeError: Error;

            if(typeof error !== 'undefined') {
                nativeError = error;
            } else {
                nativeError = new Error('Video validation failed');
            }

            Diagnostics.trigger('video_validation_failed', new DiagnosticError(nativeError, {
                url: video.getOriginalUrl()
            }));
        }
    }
}
