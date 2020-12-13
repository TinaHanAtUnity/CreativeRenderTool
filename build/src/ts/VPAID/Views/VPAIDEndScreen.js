import { AbstractAdUnit } from 'Ads/AdUnits/AbstractAdUnit';
import { CustomFeatures } from 'Ads/Utilities/CustomFeatures';
import { Template } from 'Core/Utilities/Template';
import { View } from 'Core/Views/View';
import VastStaticEndScreenTemplate from 'html/VastStaticEndScreen.html';
export class VPAIDEndScreen extends View {
    constructor(platform, campaign, gameId) {
        super(platform, 'end-screen');
        this._isSwipeToCloseEnabled = false;
        this._template = new Template(VastStaticEndScreenTemplate);
        if (campaign) {
            const landscape = campaign.getCompanionLandscapeUrl();
            const portrait = campaign.getCompanionPortraitUrl();
            this._templateData = {
                'endScreenLandscape': (landscape ? landscape : (portrait ? portrait : undefined)),
                'endScreenPortrait': (portrait ? portrait : (landscape ? landscape : undefined))
            };
        }
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
            }
        ];
        if (CustomFeatures.isTimehopApp(gameId)) {
            this._isSwipeToCloseEnabled = true;
            this._bindings.push({
                event: 'swipe',
                listener: (event) => this.onCloseEvent(event),
                selector: '.campaign-container, .game-background'
            });
        }
    }
    render() {
        super.render();
        this._container.querySelector('.game-background-portrait').style.backgroundSize = '100%';
        this._container.querySelector('.game-background-landscape').style.backgroundSize = '100%';
        this._container.style.zIndex = '2';
        if (this._isSwipeToCloseEnabled) {
            this._container.querySelector('.btn-close-region').style.display = 'none';
        }
    }
    show() {
        super.show();
        document.body.appendChild(this.container());
        this._handlers.forEach(handler => handler.onVPAIDEndScreenShow());
        if (AbstractAdUnit.getAutoClose()) {
            setTimeout(() => {
                this._handlers.forEach(handler => handler.onVPAIDEndScreenClose());
            }, AbstractAdUnit.getAutoCloseDelay());
        }
    }
    remove() {
        const parentContainer = this.container().parentElement;
        if (parentContainer) {
            parentContainer.removeChild(this.container());
        }
    }
    onCloseEvent(event) {
        event.preventDefault();
        this._handlers.forEach(handler => handler.onVPAIDEndScreenClose());
    }
    onClickEvent(event) {
        event.preventDefault();
        this._handlers.forEach(handler => handler.onVPAIDEndScreenClick());
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVlBBSURFbmRTY3JlZW4uanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9zcmMvdHMvVlBBSUQvVmlld3MvVlBBSURFbmRTY3JlZW4udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFFLGNBQWMsRUFBRSxNQUFNLDRCQUE0QixDQUFDO0FBQzVELE9BQU8sRUFBRSxjQUFjLEVBQUUsTUFBTSw4QkFBOEIsQ0FBQztBQUU5RCxPQUFPLEVBQUUsUUFBUSxFQUFFLE1BQU0seUJBQXlCLENBQUM7QUFFbkQsT0FBTyxFQUFFLElBQUksRUFBRSxNQUFNLGlCQUFpQixDQUFDO0FBQ3ZDLE9BQU8sMkJBQTJCLE1BQU0sK0JBQStCLENBQUM7QUFTeEUsTUFBTSxPQUFPLGNBQWUsU0FBUSxJQUE0QjtJQUc1RCxZQUFZLFFBQWtCLEVBQUUsUUFBdUIsRUFBRSxNQUFjO1FBQ25FLEtBQUssQ0FBQyxRQUFRLEVBQUUsWUFBWSxDQUFDLENBQUM7UUFIMUIsMkJBQXNCLEdBQVksS0FBSyxDQUFDO1FBSzVDLElBQUksQ0FBQyxTQUFTLEdBQUcsSUFBSSxRQUFRLENBQUMsMkJBQTJCLENBQUMsQ0FBQztRQUUzRCxJQUFJLFFBQVEsRUFBRTtZQUNWLE1BQU0sU0FBUyxHQUFHLFFBQVEsQ0FBQyx3QkFBd0IsRUFBRSxDQUFDO1lBQ3RELE1BQU0sUUFBUSxHQUFHLFFBQVEsQ0FBQyx1QkFBdUIsRUFBRSxDQUFDO1lBRXBELElBQUksQ0FBQyxhQUFhLEdBQUc7Z0JBQ2pCLG9CQUFvQixFQUFFLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxDQUFDO2dCQUNqRixtQkFBbUIsRUFBRSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENB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