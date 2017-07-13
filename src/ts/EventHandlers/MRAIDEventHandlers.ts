import { MRAIDAdUnit } from 'AdUnits/MRAIDAdUnit';
import { SessionManager } from 'Managers/SessionManager';
import { EventType } from 'Models/Session';
import { NativeBridge } from 'Native/NativeBridge';
import { Platform } from "../Constants/Platform";
import { RequestError } from "../Errors/RequestError";
import { Diagnostics } from "Utilities/Diagnostics";
import { DiagnosticError } from "../Errors/DiagnosticError";
import { MRAIDCampaign } from "../Models/MRAIDCampaign";

export class MRAIDEventHandlers {

    public static onClick(nativeBridge: NativeBridge, adUnit: MRAIDAdUnit, sessionManager: SessionManager, url: string) {
        nativeBridge.Listener.sendClickEvent(adUnit.getPlacement().getId());
        sessionManager.sendThirdQuartile(adUnit);
        sessionManager.sendView(adUnit);
        sessionManager.sendClick(adUnit);
        adUnit.sendClick();

        const campaign = <MRAIDCampaign>adUnit.getCampaign();


        if(campaign.getClickAttributionUrl())
        const currentSession = sessionManager.getSession();
        adUnit.sendClickAttribution();
    }

    public static handleClickAttribution(nativeBridge: NativeBridge, sessionManager: SessionManager, campaign: PerformanceCampaign) {
        const currentSession = sessionManager.getSession();
        if(currentSession) {
            if(currentSession.getEventSent(EventType.CLICK_ATTRIBUTION)) {
                return;
            }
            currentSession.setEventSent(EventType.CLICK_ATTRIBUTION);
        }

        const eventManager = sessionManager.getEventManager();
        const platform = nativeBridge.getPlatform();
        const clickAttributionUrl = campaign.getClickAttributionUrl();

        if(campaign.getClickAttributionUrlFollowsRedirects() && clickAttributionUrl) {
            eventManager.clickAttributionEvent(clickAttributionUrl, true).then(response => {
                const location = Request.getHeader(response.headers, 'location');
                if(location) {
                    if(platform === Platform.ANDROID) {
                        nativeBridge.Intent.launch({
                            'action': 'android.intent.action.VIEW',
                            'uri': location
                        });
                    } else if(platform === Platform.IOS) {
                        nativeBridge.UrlScheme.open(location);
                    }
                } else {
                    Diagnostics.trigger('click_attribution_misconfigured', {
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
                Diagnostics.trigger('click_attribution_failed', error);
            });
        } else {
            if (clickAttributionUrl) {
                eventManager.clickAttributionEvent(clickAttributionUrl, false);
            }
        }
    }
}