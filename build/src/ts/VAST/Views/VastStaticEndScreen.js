import { CustomFeatures } from 'Ads/Utilities/CustomFeatures';
import { Template } from 'Core/Utilities/Template';
import VastStaticEndScreenTemplate from 'html/VastStaticEndScreen.html';
import { VastEndScreen } from 'VAST/Views/VastEndScreen';
export class VastStaticEndScreen extends VastEndScreen {
    constructor(parameters, attachTap) {
        super(parameters, attachTap);
        this._privacy = parameters.privacy;
        this._template = new Template(VastStaticEndScreenTemplate);
        this._adUnitContainer = parameters.container;
        const landscape = this._campaign.getStaticLandscape();
        const portrait = this._campaign.getStaticPortrait();
        this._templateData = {
            'endScreenLandscape': (landscape ? landscape.getUrl() : (portrait ? portrait.getUrl() : undefined)),
            'endScreenPortrait': (portrait ? portrait.getUrl() : (landscape ? landscape.getUrl() : undefined))
        };
        this._bindings = [
            {
                event: 'click',
                listener: (event) => this.onClickEvent(event),
                selector: '.game-background'
            },
            {
                event: 'click',
                listener: (event) => this.onCloseEvent(event),
                selector: '.btn-close-region'
            },
            {
                event: 'click',
                listener: (event) => this.onPrivacyEvent(event),
                selector: '.privacy-button'
            }
        ];
        if (CustomFeatures.isTimehopApp(parameters.clientInfo.getGameId())) {
            this._isSwipeToCloseEnabled = true;
            this._bindings.push({
                event: 'swipe',
                listener: (event) => this.onCloseEvent(event),
                selector: '.campaign-container, .game-background'
            });
        }
    }
    show() {
        return this._adUnitContainer.reconfigure(0 /* ENDSCREEN */).then(() => {
            this._adUnitContainer.reorient(false, this._adUnitContainer.getLockedOrientation()).then(() => {
                super.show();
            });
        });
    }
    remove() {
        super.remove();
        if (this._privacy) {
            this._privacy.hide();
            const privacyContainer = this._privacy.container();
            if (privacyContainer && privacyContainer.parentElement) {
                privacyContainer.parentElement.removeChild(privacyContainer);
            }
            delete this._privacy;
        }
    }
    onPrivacyClose() {
        if (this._privacy) {
            this._privacy.hide();
        }
    }
    onCloseEvent(event) {
        event.preventDefault();
        this._handlers.forEach(handler => handler.onVastEndScreenClose());
    }
    onClickEvent(event) {
        if (!this._callButtonEnabled) {
            return;
        }
        event.preventDefault();
        this._handlers.forEach(handler => handler.onVastEndScreenClick());
    }
    onPrivacyEvent(event) {
        event.preventDefault();
        this._privacy.show();
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVmFzdFN0YXRpY0VuZFNjcmVlbi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3NyYy90cy9WQVNUL1ZpZXdzL1Zhc3RTdGF0aWNFbmRTY3JlZW4udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFFLGNBQWMsRUFBRSxNQUFNLDhCQUE4QixDQUFDO0FBRTlELE9BQU8sRUFBRSxRQUFRLEVBQUUsTUFBTSx5QkFBeUIsQ0FBQztBQUNuRCxPQUFPLDJCQUEyQixNQUFNLCtCQUErQixDQUFDO0FBQ3hFLE9BQU8sRUFBRSxhQUFhLEVBQUUsTUFBTSwwQkFBMEIsQ0FBQztBQUt6RCxNQUFNLE9BQU8sbUJBQW9CLFNBQVEsYUFBYTtJQUtsRCxZQUFZLFVBQTJDLEVBQUUsU0FBK0I7UUFDcEYsS0FBSyxDQUFDLFVBQVUsRUFBRSxTQUFTLENBQUMsQ0FBQztRQUU3QixJQUFJLENBQUMsUUFBUSxHQUFHLFVBQVUsQ0FBQyxPQUFPLENBQUM7UUFDbkMsSUFBSSxDQUFDLFNBQVMsR0FBRyxJQUFJLFFBQVEsQ0FBQywyQkFBMkIsQ0FBQyxDQUFDO1FBQzNELElBQUksQ0FBQyxnQkFBZ0IsR0FBRyxVQUFVLENBQUMsU0FBUyxDQUFDO1FBQzdDLE1BQU0sU0FBUyxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsa0JBQWtCLEVBQUUsQ0FBQztRQUN0RCxNQUFNLFFBQVEsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLGlCQUFpQixFQUFFLENBQUM7UUFFcEQsSUFBSSxDQUFDLGFBQWEsR0FBRztZQUNqQixvQkFBb0IsRUFBRSxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDLE1BQU0sRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsUUFBUSxDQUFDLE1BQU0sRUFBRSxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQztZQUNuRyxtQkFBbUIsRUFBRSxDQUFDLFFBQVEsQ0FBQyxD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