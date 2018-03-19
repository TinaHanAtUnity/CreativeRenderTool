import { Campaign } from 'Models/Campaign';
import { PerformanceCampaign } from 'Models/Campaigns/PerformanceCampaign';
import { XPromoCampaign } from 'Models/Campaigns/XPromoCampaign';
import { VastCampaign } from 'Models/Vast/VastCampaign';
import { MRAIDCampaign } from 'Models/Campaigns/MRAIDCampaign';
import { Video } from 'Models/Assets/Video';
import { ForceOrientation } from 'AdUnits/Containers/AdUnitContainer';
import { PromoCampaign } from 'Models/Campaigns/PromoCampaign';
import { Asset } from 'Models/Assets/Asset';

export enum VideoType {
    CACHE,
    STREAM,
}

export class CampaignAssetStatus {
    public static isCached(campaign: Campaign): boolean {
        if(campaign instanceof PerformanceCampaign || campaign instanceof XPromoCampaign) {
            const landscapeVideo = campaign.getVideo();
            const portraitVideo = campaign.getPortraitVideo();
            if((landscapeVideo && landscapeVideo.isCached()) || (portraitVideo && portraitVideo.isCached())) {
                return true;
            }
        } else if(campaign instanceof VastCampaign) {
            return campaign.getVideo().isCached();
        } else if(campaign instanceof MRAIDCampaign) {
            const resouceUrl = campaign.getResourceUrl();
            if((resouceUrl && resouceUrl.isCached()) || campaign.getResource()) {
                return true;
            }
        } else if(campaign instanceof PromoCampaign) {
            return campaign.getCreativeResource().isCached();
        }

        return false;
    }

    public static getCachedVideoOrientation(campaign: Campaign): 'landscape' | 'portrait' | undefined {
        if(campaign instanceof PerformanceCampaign || campaign instanceof XPromoCampaign) {
            const landscapeVideo = campaign.getVideo();
            const portraitVideo = campaign.getPortraitVideo();
            if((landscapeVideo && landscapeVideo.isCached())) {
                return 'landscape';
            } else if((portraitVideo && portraitVideo.isCached())) {
                return 'portrait';
            }
        } else if(campaign instanceof VastCampaign) {
            const video = campaign.getVideo();
            if(video && video.isCached()) {
                return 'landscape';
            }
        }

        return undefined;
    }

    public static getOrientedVideo(campaign: Campaign, forceOrientation: ForceOrientation, videoType?: VideoType): Video | undefined {
        if(campaign instanceof PerformanceCampaign || campaign instanceof XPromoCampaign || campaign instanceof VastCampaign) {
            const landscapeVideo = CampaignAssetStatus.getLandscapeVideo(campaign, videoType);
            const portraitVideo = CampaignAssetStatus.getPortraitVideo(campaign, videoType);

            if(forceOrientation === ForceOrientation.LANDSCAPE) {
                if(landscapeVideo) {
                    return landscapeVideo;
                }
                if(portraitVideo) {
                    return portraitVideo;
                }
            }

            if(forceOrientation === ForceOrientation.PORTRAIT) {
                if(portraitVideo) {
                    return portraitVideo;
                }
                if(landscapeVideo) {
                    return landscapeVideo;
                }
            }
        }

        return undefined;
    }

    public static getLandscapeVideo(campaign: Campaign, videoType?: VideoType): Video | undefined {
        if(campaign instanceof PerformanceCampaign || campaign instanceof XPromoCampaign) {
            const video = campaign.getVideo();
            const streaming = campaign.getStreamingVideo();
            if(video) {
                if(video.isCached() && videoType !== VideoType.STREAM) {
                    return video;
                }
                if(streaming && videoType !== VideoType.CACHE) {
                    return streaming;
                }
            }
        } else if(campaign instanceof VastCampaign) {
            const video = campaign.getVideo();
            if(videoType === VideoType.CACHE && !video.isCached()) {
                return undefined;
            }

            return video;
        }

        return undefined;
    }

    public static getPortraitVideo(campaign: Campaign, videoType?: VideoType): Video | undefined {
        if(campaign instanceof PerformanceCampaign || campaign instanceof XPromoCampaign) {
            const video = campaign.getPortraitVideo();
            const streaming = campaign.getStreamingPortraitVideo();

            if(video) {
                if(video.isCached() && videoType !== VideoType.STREAM) {
                    return video;
                }
                if(streaming && videoType !== VideoType.CACHE) {
                    return streaming;
                }
            }
        }

        return undefined;
    }

    public static getCachedAsset(campaign: Campaign): Asset | undefined {
        if(campaign instanceof PerformanceCampaign || campaign instanceof XPromoCampaign || campaign instanceof VastCampaign) {
            return CampaignAssetStatus.getOrientedVideo(campaign, ForceOrientation.LANDSCAPE, VideoType.CACHE);
        } else if(campaign instanceof MRAIDCampaign) {
            const resource = (<MRAIDCampaign>campaign).getResourceUrl();
            if(resource && resource.isCached()) {
                return resource;
            }
        }

        return undefined;
    }
}
