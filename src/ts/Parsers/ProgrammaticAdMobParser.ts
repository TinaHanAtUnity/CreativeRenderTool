import { CampaignParser } from 'Parsers/CampaignParser';
import { Request } from 'Utilities/Request';
import { Campaign, ICampaign } from 'Models/Campaign';
import { NativeBridge } from 'Native/NativeBridge';
import { AdMobCampaign, IAdMobCampaign, AdMobVideo } from 'Models/Campaigns/AdMobCampaign';
import { AuctionResponse } from 'Models/AuctionResponse';
import { Session } from 'Models/Session';
import { Video } from 'Models/Assets/Video';
import { Vast } from 'Models/Vast/Vast';
import { VastParser } from 'Utilities/VastParser';
import { FileId } from 'Utilities/FileId';

export class ProgrammaticAdMobParser extends CampaignParser {
    public static ContentType = 'programmatic/admob-video';
    public parse(nativeBridge: NativeBridge, request: Request, response: AuctionResponse, session: Session, gamerId: string, abGroup: number): Promise<Campaign> {
        const markup = response.getContent();
        const cacheTTL = response.getCacheTTL();
        const videoPromise = this.getVideoFromMarkup(markup, request, session).catch((e) => {
            nativeBridge.Sdk.logError(`Unable to parse video from markup due to: ${e.message}`);
            return null;
        });

        return videoPromise.then((video: AdMobVideo | null) => {
            if (video) {
                this.updateFileID(video);
            }
            const baseCampaignParams: ICampaign = {
                id: this.getProgrammaticCampaignId(nativeBridge),
                gamerId: gamerId,
                abGroup: abGroup,
                willExpireAt: cacheTTL ? Date.now() + cacheTTL * 1000 : undefined,
                adType: response.getAdType() || undefined,
                correlationId: response.getCorrelationId() || undefined,
                creativeId: response.getCreativeId() || undefined,
                seatId: response.getSeatId() || undefined,
                meta: undefined,
                session: session,
                mediaId: response.getMediaId()
            };

            const adMobCampaignParams: IAdMobCampaign = {
                ... baseCampaignParams,
                dynamicMarkup: markup,
                trackingUrls: response.getTrackingUrls(),
                useWebViewUserAgentForTracking: true,
                video: video
            };

            return Promise.resolve(new AdMobCampaign(adMobCampaignParams));
        });

    }

    private getVideoFromMarkup(markup: string, request: Request, session: Session): Promise<AdMobVideo> {
        try {
            const dom = new DOMParser().parseFromString(markup, 'text/html');
            if (!dom) {
                return Promise.reject(new Error('Markup is malformed'));
            }
            const scriptTag = dom.querySelector('body script');
            if (!scriptTag) {
                return Promise.reject(new Error('Could not find script tag within body'));
            }
            const scriptSrc = scriptTag.textContent;
            const mediaFileURL = this.getVideoFromScriptSource(scriptSrc!);
            return this.getRealVideoURL(mediaFileURL, request).then((realVideoURL: string) => {
                return new AdMobVideo({
                    mediaFileURL: mediaFileURL,
                    video: new Video(realVideoURL, session)
                });
            });
        } catch (e) {
            return Promise.reject(e);
        }
    }

    private getRealVideoURL(videoURL: string, request: Request): Promise<string> {
        return request.followRedirectChain(videoURL);
    }

    private getVideoFromScriptSource(src: string): string {
        const regexp = /'vast_xml':[\s]*'([^']*)/;
        const match = regexp.exec(src);
        if (match && match.length === 2) {
            const vastXML = this.sanitizeXML(match[1]);
            const vast = this.parseVAST(vastXML);
            if (vast) {
                return vast.getVideoUrl();
            }
        }
        throw new Error('Unable to match VAST XML');
    }

    private parseVAST(xml: string): Vast | null {
        return new VastParser().parseVast(xml);
    }

    private sanitizeXML(xml: string) {
        xml = this.replaceHexChars(xml);
        return xml.replace(/\\n/g, '');
    }

    private replaceHexChars(str: string) {
        return str.replace(/\\x([0-9A-Fa-f]{2})/g, (match, code) => String.fromCharCode(parseInt(code, 16)));
    }

    private updateFileID(video: AdMobVideo) {
        const videoID = this.getVideoID(video.getMediaFileURL());
        const url = video.getVideo().getOriginalUrl();
        if (videoID && url) {
            FileId.setFileID(url, videoID);
        }
    }

    private getVideoID(url: string): string | null {
        const match = url.match(/video_id=([^&]*)/);
        if (match && match.length === 2) {
            return match[1];
        }
        return null;
    }
}
