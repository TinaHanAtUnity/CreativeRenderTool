import { AdMobCampaign, AdMobVideo, IAdMobCampaign } from 'AdMob/Models/AdMobCampaign';
import { Video } from 'Ads/Models/Assets/Video';
import { AuctionResponse } from 'Ads/Models/AuctionResponse';
import { Campaign, ICampaign } from 'Ads/Models/Campaign';
import { Session } from 'Ads/Models/Session';
import { CampaignParser } from 'Ads/Parsers/CampaignParser';
import { Platform } from 'Core/Constants/Platform';
import { NativeBridge } from 'Core/Native/Bridge/NativeBridge';
import { FileId } from 'Core/Utilities/FileId';
import { Request } from 'Core/Utilities/Request';
import { Url } from 'Core/Utilities/Url';
import { Vast } from 'VAST/Models/Vast';
import { VastParser } from 'VAST/Utilities/VastParser';

export class ProgrammaticAdMobParser extends CampaignParser {
    public static ContentType = 'programmatic/admob-video';
    public parse(nativeBridge: NativeBridge, request: Request, response: AuctionResponse, session: Session, osVersion?: string, gameId?: string): Promise<Campaign> {
        const markup = response.getContent();
        const cacheTTL = response.getCacheTTL();
        const platform = nativeBridge.getPlatform();
        const videoPromise = this.getVideoFromMarkup(markup, request, session, platform).catch((e) => {
            nativeBridge.Sdk.logError(`Unable to parse video from markup due to: ${e.message}`);
            return null;
        });

        return videoPromise.then((video: AdMobVideo | null) => {
            if (video) {
                this.updateFileID(video);
            }
            const baseCampaignParams: ICampaign = {
                id: this.getProgrammaticCampaignId(nativeBridge),
                willExpireAt: cacheTTL ? Date.now() + cacheTTL * 1000 : undefined,
                contentType: ProgrammaticAdMobParser.ContentType,
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

    private getVideoFromMarkup(markup: string, request: Request, session: Session, platform: Platform): Promise<AdMobVideo> {
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
                return new Promise<AdMobVideo>((resolve, reject) => {
                    const mimeType = Url.getQueryParameter(realVideoURL, 'mime');
                    let extension: string | null = null;
                    if (mimeType) {
                        extension = mimeType.split('/')[1];
                    }
                    if (platform === Platform.ANDROID) {
                        resolve(new AdMobVideo({
                            mediaFileURL: mediaFileURL,
                            video: new Video(realVideoURL, session),
                            extension: null
                        }));
                    } else if (extension && platform === Platform.IOS) {
                        resolve(new AdMobVideo({
                            mediaFileURL: mediaFileURL,
                            video: new Video(realVideoURL, session),
                            extension: extension
                        }));
                    } else {
                        // do not cache as we are on iOS and do not have a mime type so we should play streamed video
                        reject(new Error('iOS precaching to file not supported for HTML5 video player'));
                    }
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

    private sanitizeXML(xml: string): string {
        return this.replaceHexChars(xml).replace(/\\n/g, '');
    }

    private replaceHexChars(str: string) {
        return str.replace(/\\x([0-9A-Fa-f]{2})/g, (match, code) => String.fromCharCode(parseInt(code, 16)));
    }

    private updateFileID(video: AdMobVideo) {
        const videoID = this.getVideoID(video.getMediaFileURL());
        const url = video.getVideo().getOriginalUrl();
        const extension = video.getExtension();
        if (videoID && url) {
            if (extension) { // should only be enabled for iOS
                FileId.setFileID(url, videoID + '.' + extension);
            } else {
                FileId.setFileID(url, videoID);
            }
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
