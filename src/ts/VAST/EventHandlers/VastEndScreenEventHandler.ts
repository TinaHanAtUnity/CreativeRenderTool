import { IAdUnitParameters } from 'Ads/AdUnits/AbstractAdUnit';
import { KeyCode } from 'Core/Constants/Android/KeyCode';
import { Platform } from 'Core/Constants/Platform';
import { ICoreApi } from 'Core/ICore';
import { RequestManager } from 'Core/Managers/RequestManager';
import { VastAdUnit } from 'VAST/AdUnits/VastAdUnit';
import { VastCampaign } from 'VAST/Models/VastCampaign';
import { IVastEndScreenHandler, VastEndScreen } from 'VAST/Views/VastEndScreen';
import { CustomFeatures } from 'Ads/Utilities/CustomFeatures';
import { SessionDiagnostics } from 'Ads/Utilities/SessionDiagnostics';
import { ABGroup, ByteDanceCTATest } from 'Core/Models/ABGroup';

export class VastEndScreenEventHandler implements IVastEndScreenHandler {
    private _vastAdUnit: VastAdUnit;
    private _request: RequestManager;
    private _vastCampaign: VastCampaign;
    private _vastEndScreen: VastEndScreen | null;
    private _platform: Platform;
    private _core: ICoreApi;
    private _gameSessionId?: number;
    private _abGroup: ABGroup;

    constructor(adUnit: VastAdUnit, parameters: IAdUnitParameters<VastCampaign>) {
        this._platform = parameters.platform;
        this._core = parameters.core;
        this._vastAdUnit = adUnit;
        this._request = parameters.request;
        this._vastCampaign = parameters.campaign;
        this._vastEndScreen = this._vastAdUnit.getEndScreen();
        this._gameSessionId = parameters.gameSessionId;
        this._abGroup = parameters.coreConfig.getAbGroup();
    }

    public onVastEndScreenClick(): Promise<void> {
        this.setCallButtonEnabled(false);

        let clickThroughURL = this._vastAdUnit.getCompanionClickThroughUrl() || this._vastAdUnit.getVideoClickThroughURL();
        if (CustomFeatures.isByteDanceSeat(this._vastCampaign.getSeatId())) {
            clickThroughURL = this._vastAdUnit.getVideoClickThroughURL();
        }
        if (clickThroughURL) {
            const useWebViewUserAgentForTracking = this._vastCampaign.getUseWebViewUserAgentForTracking();
            const ctaClickedTime = Date.now();
            if (ByteDanceCTATest.isValid(this._abGroup)) {
                return this.openUrlOnCallButton(clickThroughURL, Date.now() - ctaClickedTime);
            } else {
                return this._request.followRedirectChain(clickThroughURL, useWebViewUserAgentForTracking).then((url: string) => {
                    return this.openUrlOnCallButton(url, Date.now() - ctaClickedTime);
                }).catch(() => {
                    return this.openUrlOnCallButton(clickThroughURL!, Date.now() - ctaClickedTime);
                });
            }
        }
        return Promise.reject(new Error('There is no clickthrough URL for video or companion'));
    }

    public onVastEndScreenClose(): void {
        this._vastAdUnit.hide();
    }

    public onKeyEvent(keyCode: number): void {
        if (keyCode === KeyCode.BACK && this._vastAdUnit.isShowing() && !this._vastAdUnit.canShowVideo()) {
            this._vastAdUnit.hide();
        }
    }

    public onVastEndScreenShow(): void {
        this._vastAdUnit.sendCompanionTrackingEvent(this._vastCampaign.getSession().getId());
    }

    private openUrlOnCallButton(url: string, clickDuration: number): Promise<void> {
        return this.onOpenUrl(url).then(() => {
            this.setCallButtonEnabled(true);
            if (CustomFeatures.isByteDanceSeat(this._vastCampaign.getSeatId())) {
                this._vastAdUnit.sendVideoClickTrackingEvent(this._vastCampaign.getSession().getId());
            }
            this._vastAdUnit.sendTrackingEvent('videoEndCardClick', this._vastCampaign.getSession().getId());
            this.recordClickLog(url, clickDuration);
        }).catch(() => {
            this.setCallButtonEnabled(true);
        });
    }

    private onOpenUrl(url: string): Promise<void> {
        if (this._platform === Platform.IOS) {
            return this._core.iOS!.UrlScheme.open(url);
        } else {
            return this._core.Android!.Intent.launch({
                'action': 'android.intent.action.VIEW',
                'uri': url
            });
        }
    }

    private setCallButtonEnabled(enabled: boolean): void {
        if (this._vastEndScreen) {
            this._vastEndScreen.setCallButtonEnabled(enabled);
        }
    }

    private recordClickLog(clickUrl: string, clickDuration: number) {
        if (this.shouldRecordClickLog()) {
            SessionDiagnostics.trigger('click_delay', {
                duration: clickDuration,
                delayedUrl: clickUrl,
                location: 'vast_endscreen',
                seatId: this._vastCampaign.getSeatId(),
                creativeId: this._vastCampaign.getCreativeId()
            }, this._vastCampaign.getSession());
        }
    }

    private shouldRecordClickLog(): boolean {
        if (CustomFeatures.isByteDanceSeat(this._vastCampaign.getSeatId())) {
            return true;
        } else if (this._gameSessionId && this._gameSessionId % 10 === 1) {
            return true;
        } else {
            return false;
        }
    }
}
