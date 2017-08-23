import { NativeBridge } from 'Native/NativeBridge';
import { Platform } from 'Constants/Platform';
import { VideoMetadata } from 'Constants/Android/VideoMetadata';

export class VideoInfo {
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
                            break;
                    }
                }

                return <[number, number, number]>[width, height, duration];
            });
        }
    }
}
