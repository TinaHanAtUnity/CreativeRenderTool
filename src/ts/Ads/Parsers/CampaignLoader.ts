import { Campaign } from 'Ads/Models/Campaign';
import { Session } from 'Ads/Models/Session';
import { AdUnitStyle } from 'Ads/Models/AdUnitStyle';
import { Image } from 'Ads/Models/Assets/Image';
import { Video } from 'Ads/Models/Assets/Video';
import { HTML } from 'Ads/Models/Assets/HTML';

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

        return new Session(rawSession.id);
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
