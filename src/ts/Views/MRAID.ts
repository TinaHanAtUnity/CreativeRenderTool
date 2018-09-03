import MRAIDTemplate from 'html/MRAID.html';
import MRAIDContainer from 'html/mraid/container.html';
import MRAIDPerfContainer from 'html/mraid/container-perf.html';

import { NativeBridge } from 'Native/NativeBridge';
import { IMRAIDViewHandler, MRAIDView } from 'Views/MRAIDView';
import { Observable0, Observable2 } from 'Utilities/Observable';
import { Placement } from 'Models/Placement';
import { MRAIDCampaign } from 'Models/Campaigns/MRAIDCampaign';
import { Platform } from 'Constants/Platform';
import { Orientation } from 'AdUnits/Containers/AdUnitContainer';
import { Template } from 'Utilities/Template';
import { SdkStats } from 'Utilities/SdkStats';
import { AbstractPrivacy } from 'Views/AbstractPrivacy';
import { CustomFeatures } from 'Utilities/CustomFeatures';
import { Diagnostics } from 'Utilities/Diagnostics';

import { ABGroup, FPSCollectionTest } from 'Models/ABGroup';

export class MRAID extends MRAIDView<IMRAIDViewHandler> {

    private static CloseLength = 30;

    private readonly onLoaded = new Observable0();

    private _closeElement: HTMLElement;
    private _iframe: HTMLIFrameElement;
    private _gdprBanner: HTMLElement;
    private _privacyButton: HTMLElement;
    private _loaded = false;

    private _messageListener: any;

    private _canClose = false;
    private _canSkip = false;
    private _didReward = false;

    private _closeRemaining: number;
    private _showTimestamp: number;
    private _updateInterval: any;

    // analytics data
    private _playableStartTimestamp: number;
    private _backgroundTime: number = 0;
    private _backgroundTimestamp: number;
    private _creativeId: string | undefined;

    constructor(nativeBridge: NativeBridge, placement: Placement, campaign: MRAIDCampaign, privacy: AbstractPrivacy, showGDPRBanner: boolean, abGroup: ABGroup) {
        super(nativeBridge, 'mraid', placement, campaign, privacy, showGDPRBanner, abGroup);

        this._placement = placement;
        this._campaign = campaign;
        this._creativeId = campaign.getCreativeId();

        this._template = new Template(MRAIDTemplate);

        this._bindings = [
            {
                event: 'click',
                listener: (event: Event) => this.onCloseEvent(event),
                selector: '.close-region'
            },
            {
                event: 'click',
                listener: (event: Event) => this.onPrivacyEvent(event),
                selector: '.privacy-button'
            },
            {
                event: 'click',
                listener: (event: Event) => {
                                                this.onGDPRPopupEvent(event);
                                                this._gdprPopupClicked = true;
                                                this.choosePrivacyShown();
                                            },
                selector: '.gdpr-link'
            },
            {
                event: 'click',
                listener: (event: Event) => this.onPrivacyEvent(event),
                selector: '.icon-gdpr'
            }
        ];
    }

    public render(): void {
        super.render();

        this._closeElement = <HTMLElement>this._container.querySelector('.close-region');

        const iframe: any = this._iframe = <HTMLIFrameElement>this._container.querySelector('#mraid-iframe');
        this._gdprBanner = <HTMLElement>this._container.querySelector('.gdpr-pop-up');
        this._privacyButton = <HTMLElement>this._container.querySelector('.privacy-button');

        this.createMRAID(
            FPSCollectionTest.isValid(this._abGroup) ? MRAIDPerfContainer : MRAIDContainer
        ).then(mraid => {
            this._nativeBridge.Sdk.logDebug('setting iframe srcdoc (' + mraid.length + ')');
            SdkStats.setFrameSetStartTimestamp(this._placement.getId());
            this._nativeBridge.Sdk.logDebug('Unity Ads placement ' + this._placement.getId() + ' set iframe.src started ' + SdkStats.getFrameSetStartTimestamp(this._placement.getId()));
            iframe.srcdoc = mraid;

            if (CustomFeatures.isSonicPlayable(this._creativeId)) {
                iframe.sandbox = 'allow-scripts allow-same-origin';
            }
        }).catch(e => {
            this._nativeBridge.Sdk.logError('failed to create mraid: ' + e);

            Diagnostics.trigger('create_mraid_error', {
                message: e.message
            }, this._campaign.getSession());
        });

        this._messageListener = (event: MessageEvent) => this.onMessage(event);
        window.addEventListener('message', this._messageListener, false);
    }

    public show(): void {
        super.show();
        this.choosePrivacyShown();
        this._showTimestamp = Date.now();
        this.sendMraidAnalyticsEvent('playable_show');

        if(this._placement.allowSkip()) {
            const skipLength = this._placement.allowSkipInSeconds();
            this._closeRemaining = MRAID.CloseLength;
            let skipRemaining = skipLength;
            this._updateInterval = setInterval(() => {
                if(this._closeRemaining > 0) {
                    this._closeRemaining--;
                }
                if(skipRemaining > 0) {
                    skipRemaining--;
                    this.updateProgressCircle(this._closeElement, (skipLength - skipRemaining) / skipLength);
                }
                if(skipRemaining <= 0) {
                    this._canSkip = true;
                    this._closeElement.style.opacity = '1';
                    this.updateProgressCircle(this._closeElement, 1);
                }
                if (this._closeRemaining <= 0) {
                    clearInterval(this._updateInterval);
                    this._canClose = true;
                }
            }, 1000);
        } else {
            this._closeRemaining = MRAID.CloseLength;
            this._updateInterval = setInterval(() => {
                const progress = (MRAID.CloseLength - this._closeRemaining) / MRAID.CloseLength;
                if(progress >= 0.75 && !this._didReward) {
                    this._handlers.forEach(handler => handler.onMraidReward());
                    this._didReward = true;
                }
                if(this._closeRemaining > 0) {
                    this._closeRemaining--;
                    this.updateProgressCircle(this._closeElement, progress);
                }
                if (this._closeRemaining <= 0) {
                    clearInterval(this._updateInterval);
                    this._canClose = true;
                    this._closeElement.style.opacity = '1';
                    this.updateProgressCircle(this._closeElement, 1);
                }
            }, 1000);
        }

        if(this._loaded) {
            this.setViewableState(true);
        } else {
            const observer = this.onLoaded.subscribe(() => {
                this.setViewableState(true);
                this.onLoaded.unsubscribe(observer);
            });
        }
    }

    public hide() {
        this.setViewableState(false);
        if(this._messageListener) {
            window.removeEventListener('message', this._messageListener, false);
            this._messageListener = undefined;
        }
        if(this._updateInterval) {
            clearInterval(this._updateInterval);
            this._updateInterval = undefined;
        }
        super.hide();
    }

    public setViewableState(viewable: boolean) {
        if(this._loaded) {
            this._iframe.contentWindow!.postMessage({
                type: 'viewable',
                value: viewable
            }, '*');
        }

        // background time for analytics
        if(!viewable) {
            this._backgroundTimestamp = Date.now();
        } else {
            if (this._backgroundTimestamp) {
                this._backgroundTime += Date.now() - this._backgroundTimestamp;
            }
        }
    }

    protected choosePrivacyShown(): void {
        if (this._showGDPRBanner && !this._gdprPopupClicked) {
            this._gdprBanner.style.visibility = 'visible';
            this._privacyButton.style.pointerEvents = '1';
            this._privacyButton.style.visibility = 'hidden';
        } else {
            this._privacyButton.style.visibility = 'visible';
            this._gdprBanner.style.pointerEvents = '1';
            this._gdprBanner.style.visibility = 'hidden';
        }
    }

    private sendMraidAnalyticsEvent(eventName: string, timeFromPlayableStart: number = 0, eventData?: any) {
        const timeFromShow = this._playableStartTimestamp ? this.checkIsValid((this._playableStartTimestamp - this._showTimestamp) / 1000) : 0;
        const backgroundTime = this.checkIsValid(this._backgroundTime / 1000);
        this._handlers.forEach(handler => handler.onPlayableAnalyticsEvent(timeFromShow, timeFromPlayableStart, backgroundTime, eventName, eventData));
    }

    private updateProgressCircle(container: HTMLElement, value: number) {
        const wrapperElement = <HTMLElement>container.querySelector('.progress-wrapper');

        if(this._nativeBridge.getPlatform() === Platform.ANDROID && this._nativeBridge.getApiLevel() < 15) {
            wrapperElement.style.display = 'none';
            this._container.style.display = 'none';
            /* tslint:disable:no-unused-expression */
            this._container.offsetHeight;
            /* tslint:enable:no-unused-expression */
            this._container.style.display = 'block';
            return;
        }

        const leftCircleElement = <HTMLElement>container.querySelector('.circle-left');
        const rightCircleElement = <HTMLElement>container.querySelector('.circle-right');

        const degrees = value * 360;
        leftCircleElement.style.webkitTransform = 'rotate(' + degrees + 'deg)';

        if(value >= 0.5) {
            wrapperElement.style.webkitAnimationName = 'close-progress-wrapper';
            rightCircleElement.style.webkitAnimationName = 'right-spin';
        }
    }

    private onCloseEvent(event: Event): void {
        event.preventDefault();
        event.stopPropagation();

        if(this._canSkip && !this._canClose) {
            this._handlers.forEach(handler => handler.onMraidSkip());
            this.sendMraidAnalyticsEvent('playable_skip');
        } else if(this._canClose) {
            this._handlers.forEach(handler => handler.onMraidClose());
            this.sendMraidAnalyticsEvent('playable_close');
        }
    }

    private onLoadedEvent(event: Event): void {
        this._loaded = true;
        this.onLoaded.trigger();
        const frameLoadDuration = this.checkIsValid(Date.now() - SdkStats.getFrameSetStartTimestamp(this._placement.getId()) / 1000);
        this._nativeBridge.Sdk.logDebug('Unity Ads placement ' + this._placement.getId() + ' iframe load duration ' + frameLoadDuration + ' s');
        this._handlers.forEach(handler => handler.onPlayableAnalyticsEvent(frameLoadDuration, 0, 0, 'playable_loading_time', {}));

        this._playableStartTimestamp = Date.now();
        this.sendMraidAnalyticsEvent('playable_start');
    }

    private onMessage(event: MessageEvent) {
        switch(event.data.type) {
            case 'loaded':
                this.onLoadedEvent(event);
                break;

            case 'open':
                this.onMessageOpen(event.data.url);
                break;

            case 'sendStats':
                this.updateStats({
                    totalTime: event.data.totalTime,
                    playTime: event.data.playTime,
                    frameCount: event.data.frameCount
                });
                break;

            case 'close':
                this._handlers.forEach(handler => handler.onMraidClose());
                break;

            case 'orientation':
                let forceOrientation = Orientation.NONE;
                switch(event.data.properties.forceOrientation) {
                    case 'portrait':
                        forceOrientation = Orientation.PORTRAIT;
                        break;

                    case 'landscape':
                        forceOrientation = Orientation.LANDSCAPE;
                        break;

                    default:
                }
                this._handlers.forEach(handler => handler.onMraidOrientationProperties({
                    allowOrientationChange: event.data.properties.allowOrientationChange,
                    forceOrientation: forceOrientation
                }));
                break;
            case 'analyticsEvent':
                const timeFromPlayableStart = this.checkIsValid((Date.now() - this._playableStartTimestamp - this._backgroundTime) / 1000);
                this.sendMraidAnalyticsEvent(event.data.event, timeFromPlayableStart, event.data.eventData);
                break;

            case 'customMraidState':
                if(event.data.state === 'completed') {
                    if(!this._placement.allowSkip() && this._closeRemaining > 5) {
                        this._closeRemaining = 5;
                    }
                }
                break;

            default:
        }
    }

    private checkIsValid(timeInSeconds: number): number | undefined {
        if (timeInSeconds < 0 || timeInSeconds > 600) {
            return undefined;
        }
        return timeInSeconds;
    }

    private onMessageOpen(url: string) {
        if (!this._callButtonEnabled) {
            return;
        }
        this._handlers.forEach(handler => handler.onMraidClick(url));
    }
}
