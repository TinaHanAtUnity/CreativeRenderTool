import { MRAIDAdUnit } from 'AdUnits/MRAIDAdUnit';
import { SessionManager } from 'Managers/SessionManager';
import { EventType } from 'Models/Session';
import { NativeBridge } from 'Native/NativeBridge';
import { Platform } from 'Constants/Platform';
import { RequestError } from 'Errors/RequestError';
import { Diagnostics } from 'Utilities/Diagnostics';
import { DiagnosticError } from 'Errors/DiagnosticError';
import { MRAIDCampaign } from 'Models/MRAIDCampaign';
import { Request } from 'Utilities/Request';
import { HttpKafka } from 'Utilities/HttpKafka';

export class MRAIDEventHandlers {

    public static onClick(nativeBridge: NativeBridge, adUnit: MRAIDAdUnit, sessionManager: SessionManager, url: string) {
        nativeBridge.Listener.sendClickEvent(adUnit.getPlacement().getId());
        sessionManager.sendThirdQuartile(adUnit);
        sessionManager.sendView(adUnit);
        sessionManager.sendClick(adUnit);
        adUnit.sendClick();

        const campaign = <MRAIDCampaign>adUnit.getCampaign();

        if(campaign.getClickAttributionUrl()) {
            this.handleClickAttribution(nativeBridge, sessionManager, campaign);
            if(!campaign.getClickAttributionUrlFollowsRedirects()) {
                MRAIDEventHandlers.openUrl(nativeBridge, url);
            }
        } else {
            MRAIDEventHandlers.openUrl(nativeBridge, url);
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

    public static onShowEndScreen(mraidAdUnit: MRAIDAdUnit) {
        const endScreen = mraidAdUnit.getEndScreen();
        if(endScreen) {
            mraidAdUnit.getMRAIDView().hide();
            console.log('onshowEndscreen')
            endScreen.show();
        }
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
}
