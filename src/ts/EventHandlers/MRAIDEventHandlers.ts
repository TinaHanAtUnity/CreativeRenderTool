import { MRAIDAdUnit } from 'AdUnits/MRAIDAdUnit';
import { SessionManager } from 'Managers/SessionManager';
import { EventType } from 'Models/Session';
import { NativeBridge } from 'Native/NativeBridge';
import { Platform } from 'Constants/Platform';
import { RequestError } from 'Errors/RequestError';
import { Diagnostics } from 'Utilities/Diagnostics';
import { DiagnosticError } from 'Errors/DiagnosticError';
import { MRAIDCampaign } from 'Models/MRAIDCampaign';
import { Request, INativeResponse } from 'Utilities/Request';
import { HttpKafka } from 'Utilities/HttpKafka';

export class MRAIDEventHandlers {

    public static onClick(nativeBridge: NativeBridge, adUnit: MRAIDAdUnit, sessionManager: SessionManager, request: Request, url: string) {
        nativeBridge.Listener.sendClickEvent(adUnit.getPlacement().getId());
        sessionManager.sendThirdQuartile(adUnit);
        sessionManager.sendView(adUnit);
        sessionManager.sendClick(adUnit);
        adUnit.sendClick();

        const campaign = <MRAIDCampaign>adUnit.getCampaign();

        if(campaign.getClickAttributionUrl()) {
            this.handleClickAttribution(nativeBridge, sessionManager, campaign);
            if(!campaign.getClickAttributionUrlFollowsRedirects()) {
                MRAIDEventHandlers.followUrl(request, url).then((storeUrl) => {
                    MRAIDEventHandlers.openUrl(nativeBridge, storeUrl);
                });
            }
        } else {
            MRAIDEventHandlers.followUrl(request, url).then((storeUrl) => {
                MRAIDEventHandlers.openUrl(nativeBridge, storeUrl);
            });
        }
    }

    public static onAnalyticsEvent(campaign: MRAIDCampaign, event: any, delayFromStart: number) {
        const kafkaObject: any = {};
        kafkaObject.type = event;
        kafkaObject.delayFromStart = delayFromStart;
        const resourceUrl = campaign.getResourceUrl();
        if(resourceUrl) {
             kafkaObject.url = resourceUrl.getOriginalUrl();
        }
        HttpKafka.sendEvent('events.playable.json', kafkaObject);
    }

    private static handleClickAttribution(nativeBridge: NativeBridge, sessionManager: SessionManager, campaign: MRAIDCampaign) {
        const currentSession = sessionManager.getSession();
        if(currentSession) {
            if(currentSession.getEventSent(EventType.CLICK_ATTRIBUTION)) {
                return;
            }
            currentSession.setEventSent(EventType.CLICK_ATTRIBUTION);
        }

        const eventManager = sessionManager.getEventManager();
        const clickAttributionUrl = campaign.getClickAttributionUrl();

        if(campaign.getClickAttributionUrlFollowsRedirects() && clickAttributionUrl) {
            eventManager.clickAttributionEvent(clickAttributionUrl, true).then(response => {
                const location = Request.getHeader(response.headers, 'location');
                if(location) {
                    this.openUrl(nativeBridge, location);
                } else {
                    Diagnostics.trigger('mraid_click_attribution_misconfigured', {
                        url: campaign.getClickAttributionUrl(),
                        followsRedirects: campaign.getClickAttributionUrlFollowsRedirects(),
                        response: response
                    });
                }
            }).catch(error => {
                if(error instanceof RequestError) {
                    error = new DiagnosticError(new Error(error.message), {
                        request: (<RequestError>error).nativeRequest,
                        sessionId: sessionManager.getSession().getId(),
                        url: campaign.getClickAttributionUrl(),
                        response: (<RequestError>error).nativeResponse
                    });
                }
                Diagnostics.trigger('mraid_click_attribution_failed', error);
            });
        } else {
            if (clickAttributionUrl) {
                eventManager.clickAttributionEvent(clickAttributionUrl, false);
            }
        }
    }

    private static openUrl(nativeBridge: NativeBridge, url: string) {
        if(nativeBridge.getPlatform() === Platform.IOS) {
            nativeBridge.UrlScheme.open(url);
        } else if(nativeBridge.getPlatform() === Platform.ANDROID) {
            nativeBridge.Intent.launch({
                'action': 'android.intent.action.VIEW',
                'uri': url // todo: these come from 3rd party sources, should be validated before general MRAID support
            });
        }
    }

    // Follows the redirects of a URL, returning the final location.
    private static followUrl(request: Request, link: string): Promise<string> {
        return new Promise((resolve, reject) => {
            const makeRequest = (url: string) => {
                url = url.trim();
                if (!url.startsWith('http')) {
                    // market:// or itunes:// urls can be opened directly
                    resolve(url);
                } else {
                    request.head(url).then((response: INativeResponse) => {
                        if (response.responseCode === 302) {
                            const location = Request.getHeader(response.headers, 'location');
                            if (location) {
                                makeRequest(location);
                            } else {
                                reject('302 Found did not have a "Location" header');
                            }
                        } else if (Request.is2xxSuccessful(response.responseCode)) {
                            resolve(url);
                        } else {
                            reject(new Error(`Request to ${url} failed with status ${response.responseCode}`));
                        }
                    }).catch(reject);
                }
            };
            makeRequest(link);
        });
    }
}
