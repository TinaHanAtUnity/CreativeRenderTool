import { AbstractAdUnit } from 'Ads/AdUnits/AbstractAdUnit';
import { Orientation } from 'Ads/AdUnits/Containers/AdUnitContainer';
import { TrackingEvent } from 'Ads/Managers/ThirdPartyEventManager';
import { EventType } from 'Ads/Models/Session';
import { CustomFeatures } from 'Ads/Utilities/CustomFeatures';
import { ARUtil } from 'AR/Utilities/ARUtil';
import { FinishState } from 'Core/Constants/FinishState';
export class MRAIDAdUnit extends AbstractAdUnit {
    constructor(parameters) {
        super(parameters);
        this._operativeEventManager = parameters.operativeEventManager;
        this._thirdPartyEventManager = parameters.thirdPartyEventManager;
        this._mraid = parameters.mraid;
        this._additionalTrackingEvents = parameters.campaign.getTrackingUrls();
        this._endScreen = parameters.endScreen;
        this._clientInfo = parameters.clientInfo;
        this._placement = parameters.placement;
        this._campaign = parameters.campaign;
        this._privacy = parameters.privacy;
        this._ar = parameters.ar;
        this._mraid.render();
        document.body.appendChild(this._mraid.container());
        if (this._endScreen) {
            this._endScreen.render();
            this._endScreen.hide();
            document.body.appendChild(this._endScreen.container());
        }
        this._orientationProperties = {
            allowOrientationChange: true,
            forceOrientation: Orientation.NONE
        };
        this._options = parameters.options;
        this.setShowing(false);
    }
    show() {
        this.setShowing(true);
        this.setShowingMRAID(true);
        this._mraid.show();
        this._ads.Listener.sendStartEvent(this._placement.getId());
        this._operativeEventManager.sendStart(this.getOperativeEventParams()).then(() => {
            this.onStartProcessed.trigger();
        });
        if (!CustomFeatures.isLoopMeSeat(this._campaign.getSeatId())) {
            this.sendImpression();
        }
        // Temporary for PTS Migration Investigation
        this.sendTrackingEvent(TrackingEvent.START);
        this._container.addEventHandler(this);
        const views = ['webview'];
        const isARCreative = ARUtil.isARCreative(this._campaign);
        const isARSupported = isARCreative ? ARUtil.isARSupported(this._ar) : Promise.resolve(false);
        return isARSupported.then(arSupported => {
            if (arSupported) {
                views.unshift('arview');
            }
            return this._container.open(this, views, this._orientationProperties.allowOrientationChange, this._orientationProperties.forceOrientation, true, false, true, false, this._options).then(() => {
                this.onStart.trigger();
            });
        });
    }
    hide() {
        if (!this.isShowing()) {
            return Promise.resolve();
        }
        this.setShowing(false);
        this.setShowingMRAID(false);
        if (this._mraid) {
            this._mraid.hide();
        }
        this.removeEndScreenContainer();
        this.removePrivacyContainer();
        this.sendFinishOperativeEvents();
        this.onFinish.trigger();
        this.removeMraidContainer();
        this.unsetReferences();
        this._ads.Listener.sendFinishEvent(this._placement.getId(), this.getFinishState());
        this._container.removeEventHandler(this);
        return this._container.close().then(() => {
            this.onClose.trigger();
        });
    }
    setOrientationProperties(properties) {
        this._orientationProperties = properties;
    }
    description() {
        return 'mraid';
    }
    sendClick() {
        this.sendTrackingEvent(TrackingEvent.CLICK);
    }
    sendImpression() {
        this.sendTrackingEvent(TrackingEvent.IMPRESSION);
    }
    getEndScreen() {
        return this._endScreen;
    }
    getMRAIDView() {
        return this._mraid;
    }
    setShowingMRAID(showing) {
        this._showingMRAID = showing;
    }
    isShowingMRAID() {
        return this._showingMRAID;
    }
    onContainerShow() {
        this._mraid.setViewableState(true);
        if (AbstractAdUnit.getAutoClose()) {
            setTimeout(() => {
                this.setFinishState(FinishState.COMPLETED);
                this.hide();
            }, AbstractAdUnit.getAutoCloseDelay());
        }
    }
    onContainerDestroy() {
        if (this.isShowing()) {
            this.setFinishState(FinishState.SKIPPED);
            this.hide();
        }
    }
    onContainerBackground() {
        if (this.isShowing()) {
            this._mraid.setViewableState(false);
            if (CustomFeatures.isSimejiJapaneseKeyboardApp(this._clientInfo.getGameId())) {
                this.setFinishState(FinishState.SKIPPED);
                this.hide();
            }
        }
    }
    onContainerForeground() {
        if (this.isShowing()) {
            this._mraid.setViewableState(true);
        }
    }
    onContainerSystemMessage(message) {
        // EMPTY
    }
    unsetReferences() {
        delete this._mraid;
        delete this._endScreen;
        delete this._privacy;
    }
    sendTrackingEvent(event) {
        this._thirdPartyEventManager.sendTrackingEvents(this._campaign, event, 'mraid', this._campaign.getUseWebViewUserAgentForTracking());
    }
    getOperativeEventParams() {
        return {
            placement: this._placement,
            asset: this._campaign.getResourceUrl()
        };
    }
    removeEndScreenContainer() {
        if (this._endScreen) {
            this._endScreen.hide();
            const endScreenContainer = this._endScreen.container();
            if (endScreenContainer && endScreenContainer.parentElement) {
                endScreenContainer.parentElement.removeChild(this._endScreen.container());
            }
        }
    }
    removePrivacyContainer() {
        if (this._privacy) {
            const privacyContainer = this._privacy.container();
            if (privacyContainer && privacyContainer.parentElement) {
                privacyContainer.parentElement.removeChild(privacyContainer);
            }
        }
    }
    removeMraidContainer() {
        if (this._mraid) {
            const mraidContainer = this._mraid.container();
            if (mraidContainer && mraidContainer.parentElement) {
                mraidContainer.parentElement.removeChild(mraidContainer);
            }
        }
    }
    sendFinishOperativeEvents() {
        const operativeEventParams = this.getOperativeEventParams();
        const finishState = this.getFinishState();
        if (finishState === FinishState.COMPLETED) {
            if (!this._campaign.getSession().getEventSent(EventType.THIRD_QUARTILE)) {
                this._operativeEventManager.sendThirdQuartile(operativeEventParams);
            }
            if (!this._campaign.getSession().getEventSent(EventType.VIEW)) {
                this._operativeEventManager.sendView(operativeEventParams);
                // Temporary for PTS Migration Investigation
                this.sendTrackingEvent(TrackingEvent.COMPLETE);
            }
        }
        else if (finishState === FinishState.SKIPPED) {
            this._operativeEventManager.sendSkip(operativeEventParams);
        }
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiTVJBSURBZFVuaXQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9zcmMvdHMvTVJBSUQvQWRVbml0cy9NUkFJREFkVW5pdC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUUsY0FBYyxFQUFxQixNQUFNLDRCQUE0QixDQUFDO0FBQy9FLE9BQU8sRUFHSCxXQUFXLEVBQ2QsTUFBTSx3Q0FBd0MsQ0FBQztBQUVoRCxPQUFPLEVBQTBCLGFBQWEsRUFBRSxNQUFNLHFDQUFxQyxDQUFDO0FBRTVGLE9BQU8sRUFBRSxTQUFTLEVBQUUsTUFBTSxvQkFBb0IsQ0FBQztBQUMvQyxPQUFPLEVBQUUsY0FBYyxFQUFFLE1BQU0sOEJBQThCLENBQUM7QUFHOUQsT0FBTyxFQUFFLE1BQU0sRUFBRSxNQUFNLHFCQUFxQixDQUFDO0FBQzdDLE9BQU8sRUFBRSxXQUFXLEVBQUUsTUFBTSw0QkFBNEIsQ0FBQztBQWV6RCxNQUFNLE9BQU8sV0FBWSxTQUFRLGNBQWM7SUFnQjNDLFlBQVksVUFBa0M7UUFDMUMsS0FBSyxDQUFDLFVBQVUsQ0FBQyxDQUFDO1FBRWxCLElBQUksQ0FBQyxzQkFBc0IsR0FBRyxVQUFVLENBQUMscUJBQXFCLENBQUM7UUFDL0QsSUFBSSxDQUFDLHVCQUF1QixHQUFHLFVBQVUsQ0FBQyxzQkFBc0IsQ0FBQztRQUNqRSxJQUFJLENBQUMsTUFBTSxHQUFHLFVBQVUsQ0FBQyxLQUFLLENBQUM7UUFDL0IsSUFBSSxDQUFDLHlCQUF5QixHQUFHLFVBQVUsQ0FBQyxRQUFRLENBQUMsZUFBZSxFQUFFLENBQUM7UUFDdkUsSUFBSSxDQUFDLFVBQVUsR0FBRyxVQUFVLENBQUMsU0FBUyxDQUFDO1FBQ3ZDLElBQUksQ0FBQyxXQUFXLEdBQUcsVUFBVSxDQUFDLFVBQVUsQ0FBQztRQUN6QyxJQUFJLENBQUMsVUFBVSxHQUFHLFVBQVUsQ0FBQyxTQUFTLENBQUM7UUFDdkMsSUFBSSxDQUFDLFNBQVMsR0FBRyxVQUFV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