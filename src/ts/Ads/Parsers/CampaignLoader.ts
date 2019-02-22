import { AdUnitStyle } from 'Ads/Models/AdUnitStyle';
import { HTML } from 'Ads/Models/Assets/HTML';
import { Image } from 'Ads/Models/Assets/Image';
import { Video } from 'Ads/Models/Assets/Video';
import { Campaign } from 'Ads/Models/Campaign';
import { Session } from 'Ads/Models/Session';

export abstract class CampaignLoader {
    public abstract load(data: string): Campaign | undefined;

    public loadSession(data: string): Session | undefined {
        let rawSession;

        try {
            rawSession = JSON.parse(data);
        } catch(e) {
            return undefined;
        }

        if(!rawSession.id) {
            return undefined;
        }

        const session: Session = new Session(rawSession.id);

        if(rawSession.adPlan) {
            session.setAdPlan(rawSession.adPlan);
        }

        // Set all GameSessionCounters to zero, this will make evaluation service ignore these Counters for the model
        session.setGameSessionCounters({
            adRequests: 0,
            starts: 0,
            views: 0,
            startsPerCampaign: {},
            startsPerTarget: {},
            viewsPerCampaign: {},
            viewsPerTarget: {},
            latestCampaignsStarts: {}
        });

        if(rawSession.privacy) {
            session.setPrivacy(rawSession.privacy);
        }

        if(rawSession.deviceFreeSpace) {
            session.setDeviceFreeSpace(rawSession.deviceFreeSpace);
        }

        return session;
    }

    public loadAdUnitStyle(data: string): AdUnitStyle | undefined {
        let rawStyle;

        try {
            rawStyle = JSON.parse(data);
        } catch(e) {
            return undefined;
        }

        if(!rawStyle.ctaButtonColor) {
            return undefined;
        }

        return new AdUnitStyle({
            ctaButtonColor: rawStyle.ctaButtonColor
        });
    }

    public loadImage(data: string, session: Session): Image | undefined {
        let rawImage;
        try {
            rawImage = JSON.parse(data);
        } catch(e) {
            return undefined;
        }

        const image: Image = new Image(rawImage.url, session);

        if(rawImage.fileId) {
            image.setFileId(rawImage.fileId);
        }

        if(rawImage.cachedUrl) {
            image.setCachedUrl(rawImage.cachedUrl);
        }

        return image;
    }

    public loadVideo(data: string, session: Session): Video | undefined {
        let rawVideo;
        try {
            rawVideo = JSON.parse(data);
        } catch(e) {
            return undefined;
        }

        const video: Video = new Video(rawVideo.url, session, rawVideo.size, rawVideo.creativeId);

        if(rawVideo.fileId) {
            video.setFileId(rawVideo.fileId);
        }

        if(rawVideo.cachedUrl) {
            video.setCachedUrl(rawVideo.cachedUrl);
        }

        return video;
    }

    public loadHTML(data: string, session: Session): HTML | undefined {
        let rawHtml;
        try {
            rawHtml = JSON.parse(data);
        } catch(e) {
            return undefined;
        }

        const html: HTML = new HTML(rawHtml.url, session, rawHtml.creativeId);

        if(rawHtml.fileId) {
            html.setFileId(rawHtml.fileId);
        }

        if(rawHtml.cachedUrl) {
            html.setCachedUrl(rawHtml.cachedUrl);
        }

        return html;
    }
}
