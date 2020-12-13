import { Orientation } from 'Ads/AdUnits/Containers/AdUnitContainer';
import { MRAIDCampaign } from 'MRAID/Models/MRAIDCampaign';
import { PerformanceCampaign } from 'Performance/Models/PerformanceCampaign';
import { VastCampaign } from 'VAST/Models/VastCampaign';
import { XPromoCampaign } from 'XPromo/Models/XPromoCampaign';
import { AUIMetric } from 'Ads/Utilities/SDKMetrics';
import { ColorThemeError } from 'Core/Utilities/ColorTheme';
export var VideoType;
(function (VideoType) {
    VideoType[VideoType["CACHE"] = 0] = "CACHE";
    VideoType[VideoType["STREAM"] = 1] = "STREAM";
})(VideoType || (VideoType = {}));
export class CampaignAssetInfo {
    static isCached(campaign) {
        if (campaign instanceof PerformanceCampaign || campaign instanceof XPromoCampaign) {
            const landscapeVideo = campaign.getVideo();
            const portraitVideo = campaign.getPortraitVideo();
            if ((landscapeVideo && landscapeVideo.isCached()) || (portraitVideo && portraitVideo.isCached())) {
                return true;
            }
        }
        else if (campaign instanceof VastCampaign) {
            return campaign.getVideo().isCached();
        }
        else if (campaign instanceof MRAIDCampaign) {
            const resourceUrl = campaign.getResourceUrl();
            if ((resourceUrl && resourceUrl.isCached()) || campaign.getResource()) {
                return true;
            }
        }
        return false;
    }
    static getCachedVideoOrientation(campaign) {
        if (campaign instanceof PerformanceCampaign || campaign instanceof XPromoCampaign) {
            const landscapeVideo = campaign.getVideo();
            const portraitVideo = campaign.getPortraitVideo();
            if ((landscapeVideo && landscapeVideo.isCached())) {
                return 'landscape';
            }
            else if ((portraitVideo && portraitVideo.isCached())) {
                return 'portrait';
            }
        }
        else if (campaign instanceof VastCampaign) {
            const video = campaign.getVideo();
            if (video && video.isCached()) {
                return 'landscape';
            }
        }
        return undefined;
    }
    static getOrientedVideo(campaign, forceOrientation, videoType) {
        if (campaign instanceof PerformanceCampaign || campaign instanceof XPromoCampaign || campaign instanceof VastCampaign) {
            const landscapeVideo = CampaignAssetInfo.getLandscapeVideo(campaign, videoType);
            const portraitVideo = CampaignAssetInfo.getPortraitVideo(campaign, videoType);
            if (forceOrientation === Orientation.LANDSCAPE) {
                if (landscapeVideo) {
                    return landscapeVideo;
                }
                if (portraitVideo) {
                    return portraitVideo;
                }
            }
            if (forceOrientation === Orientation.PORTRAIT) {
                if (portraitVideo) {
                    return portraitVideo;
                }
                if (landscapeVideo) {
                    return landscapeVideo;
                }
            }
        }
        return undefined;
    }
    static getLandscapeVideo(campaign, videoType) {
        if (campaign instanceof PerformanceCampaign || campaign instanceof XPromoCampaign) {
            const video = campaign.getVideo();
            const streaming = campaign.getStreamingVideo();
            if (video && video.isCached() && videoType !== VideoType.STREAM) {
                return video;
            }
            if (streaming && videoType !== VideoType.CACHE) {
                return streaming;
            }
        }
        else if (campaign instanceof VastCampaign) {
            const video = campaign.getVideo();
            if (videoType === VideoType.CACHE && !video.isCached()) {
                return undefined;
            }
            return video;
        }
        return undefined;
    }
    static getPortraitVideo(campaign, videoType) {
        if (campaign instanceof PerformanceCampaign || campaign instanceof XPromoCampaign) {
            const video = campaign.getPortraitVideo();
            const streaming = campaign.getStreamingPortraitVideo();
            if (video && video.isCached() && videoType !== VideoType.STREAM) {
                return video;
            }
            if (streaming && videoType !== VideoType.CACHE) {
                return streaming;
            }
        }
        return undefined;
    }
    static getCachedAsset(campaign) {
        if (campaign instanceof PerformanceCampaign || campaign instanceof XPromoCampaign || campaign instanceof VastCampaign) {
            return CampaignAssetInfo.getOrientedVideo(campaign, Orientation.LANDSCAPE, VideoType.CACHE);
        }
        else if (campaign instanceof MRAIDCampaign) {
            const resource = campaign.getResourceUrl();
            if (resource && resource.isCached()) {
                return resource;
            }
        }
        return undefined;
    }
    static getOrientedImage(campaign, deviceInfo) {
        const portraitImage = campaign.getPortrait();
        const landscapeImage = campaign.getLandscape();
        const squareImage = campaign.getSquare();
        return Promise.all([deviceInfo.getScreenWidth(), deviceInfo.getScreenHeight()]).then(([screenWidth, screenHeight]) => {
            const isLandscape = screenWidth > screenHeight;
            let image;
            if (squareImage) {
                image = squareImage;
            }
            else if (isLandscape && portraitImage) {
                image = portraitImage; // when the device is in landscape mode, we are showing a portrait image
            }
            else if (landscapeImage) {
                image = landscapeImage;
            }
            else {
                image = portraitImage;
            }
            if (!image) {
                throw new ColorThemeError('The image assets provided are invalid', AUIMetric.InvalidImageAssets);
            }
            return image;
        });
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQ2FtcGFpZ25Bc3NldEluZm8uanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9zcmMvdHMvQWRzL1V0aWxpdGllcy9DYW1wYWlnbkFzc2V0SW5mby50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFDQSxPQUFPLEVBQUUsV0FBVyxFQUFFLE1BQU0sd0NBQXdDLENBQUM7QUFJckUsT0FBTyxFQUFFLGFBQWEsRUFBRSxNQUFNLDRCQUE0QixDQUFDO0FBQzNELE9BQU8sRUFBRSxtQkFBbUIsRUFBRSxNQUFNLHdDQUF3QyxDQUFDO0FBQzdFLE9BQU8sRUFBRSxZQUFZLEVBQUUsTUFBTSwwQkFBMEIsQ0FBQztBQUN4RCxPQUFPLEVBQUUsY0FBYyxFQUFFLE1BQU0sOEJBQThCLENBQUM7QUFFOUQsT0FBTyxFQUFFLFNBQVMsRUFBRSxNQUFNLDBCQUEwQixDQUFDO0FBRXJELE9BQU8sRUFBRSxlQUFlLEVBQUUsTUFBTSwyQkFBMkIsQ0FBQztBQUU1RCxNQUFNLENBQU4sSUFBWSxTQUdYO0FBSEQsV0FBWSxTQUFTO0lBQ2pCLDJDQUFLLENBQUE7SUFDTCw2Q0FBTSxDQUFBO0FBQ1YsQ0FBQyxFQUhXLFNBQVMsS0FBVCxTQUFTLFFBR3BCO0FBRUQsTUFBTSxPQUFPLGlCQUFpQjtJQUNuQixNQUFNLENBQUMsUUFBUSxDQUFDLFFBQWtCO1FBQ3JDLElBQUksUUFBUSxZQUFZLG1CQUFtQixJQUFJLFFBQVEsWUFBWSxjQUFjLEVBQUU7WUFDL0UsTUFBTSxjQUFjLEdBQUcsUUFBUSxDQUFDLFFBQVEsRUFBRSxDQUFDO1lBQzNDLE1BQU0sYUFBYSxHQUFHLFFBQVEsQ0FBQyxnQkFBZ0IsRUFBRSxDQUFDO1lBQ2xELElBQUksQ0FBQyxjQUFjLElBQUksY0FBYyxDQUFDLFFBQVEsRUFBRSxDQUFDLElBQUksQ0FBQyxhQUFhLElBQUksYUFBYSxDQUFDLFFBQVEsRUFBRSxDQUFDLEVBQUU7Z0JBQzlGLE9BQU8sSUFBSSxDQUFDO2FBQ2Y7U0FDSjth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