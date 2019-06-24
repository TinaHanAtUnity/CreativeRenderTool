import { AdMobCampaign, AdMobVideo, IAdMobCampaign } from 'AdMob/Models/AdMobCampaign';
import { Video } from 'Ads/Models/Assets/Video';
import { AuctionResponse } from 'Ads/Models/AuctionResponse';
import { Campaign, ICampaign } from 'Ads/Models/Campaign';
import { Session } from 'Ads/Models/Session';
import { CampaignParser } from 'Ads/Parsers/CampaignParser';
import { Platform } from 'Core/Constants/Platform';
import { ICoreApi, ICore } from 'Core/ICore';
import { RequestManager } from 'Core/Managers/RequestManager';
import { FileId } from 'Core/Utilities/FileId';
import { Url } from 'Core/Utilities/Url';
import { Vast } from 'VAST/Models/Vast';
import { RequestError } from 'Core/Errors/RequestError';
import { ABGroup } from 'Core/Models/ABGroup';
import { ProgrammaticTrackingService, ProgrammaticTrackingError } from 'Ads/Utilities/ProgrammaticTrackingService';
import { SessionDiagnostics } from 'Ads/Utilities/SessionDiagnostics';
import { SdkStats } from 'Ads/Utilities/SdkStats';
import { VastParserStrict } from 'VAST/Utilities/VastParserStrict';

export enum AdmobUrlQueryParameters {
    TIMESTAMP = 'ts',
    VIDEO_ID = 'video_id'
}

export class ProgrammaticAdMobParser extends CampaignParser {

    public static ContentType = 'programmatic/admob-video';

    private _core: ICoreApi;
    private _requestManager: RequestManager;
    private _abGroup: ABGroup;
    private _pts: ProgrammaticTrackingService;
    private _mediaFileUrl: string;

    constructor(core: ICore) {
        super(core.NativeBridge.getPlatform());
        this._core = core.Api;
        this._requestManager = core.RequestManager;
        this._abGroup = core.Config.getAbGroup();
        this._pts = core.ProgrammaticTrackingService;
    }

    public parse(response: AuctionResponse, session: Session): Promise<Campaign> {
        const markup = response.getContent();
        const cacheTTL = response.getCacheTTL();
        const videoPromise = this.getVideoFromMarkup(markup, session).catch((e) => {
            this._core.Sdk.logError(`Unable to parse video from markup due to: ${e.message}`);

            if (this.isHttpResponseError(e)) {
                this.reportHttpFailure(e, session);
                throw e;
            }

            return null;
        });

        return videoPromise.then((video: AdMobVideo | null) => {
            if (video) {
                this.updateFileID(video);
            }
            const baseCampaignParams: ICampaign = {
                id: this.getProgrammaticCampaignId(),
                willExpireAt: cacheTTL ? Date.now() + cacheTTL * 1000 : undefined,
                contentType: ProgrammaticAdMobParser.ContentType,
                adType: response.getAdType() || undefined,
                correlationId: response.getCorrelationId() || undefined,
                creativeId: response.getCreativeId() || undefined,
                seatId: response.getSeatId() || undefined,
                meta: undefined,
                session: session,
                mediaId: response.getMediaId(),
                trackingUrls: response.getTrackingUrls() || {},
                backupCampaign: false,
                isLoadEnabled: false
            };

            const adMobCampaignParams: IAdMobCampaign = {
                ... baseCampaignParams,
                dynamicMarkup: markup,
                useWebViewUserAgentForTracking: true,
                video: video
            };

            return Promise.resolve(new AdMobCampaign(adMobCampaignParams));
        });

    }

    private getVideoFromMarkup(markup: string, session: Session): Promise<AdMobVideo> {
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
            this._mediaFileUrl = this.getVideoFromScriptSource(scriptSrc!);

            return this.getRealVideoURL(this._mediaFileUrl).then((realVideoURL: string) => {
                return new Promise<AdMobVideo>((resolve, reject) => {
                    const mimeType = Url.getQueryParameter(realVideoURL, 'mime');
                    let extension: string | null = null;
                    if (mimeType) {
                        extension = mimeType.split('/')[1];
                    }
                    if (this._platform === Platform.ANDROID) {
                        resolve(new AdMobVideo({
                            mediaFileURL: this._mediaFileUrl,
                            video: new Video(realVideoURL, session),
                            extension: null
                        }));
                    } else if (extension && this._platform === Platform.IOS) {
                        resolve(new AdMobVideo({
                            mediaFileURL: this._mediaFileUrl,
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

    private getRealVideoURL(videoURL: string): Promise<string> {
        return this._requestManager.followRedirectChain(videoURL);
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
        return new VastParserStrict().parseVast(xml);
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

    private isHttpResponseError(e: unknown): boolean {
        return !!(e instanceof RequestError && e.nativeResponse);
    }

    private reportHttpFailure(e: RequestError, session: Session): void {
        this._pts.reportError(ProgrammaticTrackingError.AdmobTestHttpError, 'AdMob', this.seatID);
        const failureTimestamp = Math.floor(Date.now() / 1000);
        const urlTimestamp = Url.getQueryParameter(this._mediaFileUrl, AdmobUrlQueryParameters.TIMESTAMP);

        if (e.nativeResponse) {
            SessionDiagnostics.trigger('admob_http_parse_error', {
                videoId: Url.getQueryParameter(this._mediaFileUrl, AdmobUrlQueryParameters.VIDEO_ID),
                urlTimestamp: urlTimestamp,
                adRequestTimestamp: Math.floor(SdkStats.getAdRequestTimestamp() / 1000),
                failureTimestamp: failureTimestamp,
                tsDifference: urlTimestamp ? failureTimestamp - +urlTimestamp : undefined,
                initialVideoUrl: this._mediaFileUrl,
                responseCode: e.nativeResponse.responseCode,
                redirectedUrl: e.nativeResponse.url,
                headers: e.nativeResponse.headers,
                response: e.nativeResponse.response
            }, session);
        }
    }
}
