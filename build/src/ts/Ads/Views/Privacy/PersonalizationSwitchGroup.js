import { View } from 'Core/Views/View';
import SwitchGroupTemplate from 'html/consent/personalization-switch-group.html';
import { Template } from 'Core/Utilities/Template';
import { PrivacyLocalization } from 'Privacy/PrivacyLocalization';
export class PersonalizationSwitchGroup extends View {
    constructor(platform, userPrivacyManager, language) {
        super(platform, 'personalization-switch-group');
        this._userPrivacyManager = userPrivacyManager;
        this._template = new Template(SwitchGroupTemplate, new PrivacyLocalization(language, 'consent', userPrivacyManager.getLegalFramework()));
        this._bindings = [
            {
                event: 'change',
                listener: (event) => this.onExpSwitchChange(event),
                selector: '#personalized-experience-switch'
            },
            {
                event: 'change',
                listener: (event) => this.onAdsSwitchChange(event),
                selector: '#personalized-ads-switch'
            },
            {
                event: 'change',
                listener: (event) => this.on3rdPartySwitchChange(event),
                selector: '#personalized-ads-3rd-party-switch'
            }
        ];
    }
    render() {
        super.render();
        this._personalizedExpSwitch = this._container.querySelector('#personalized-experience-switch');
        this._personalizedAdsSwitch = this._container.querySelector('#personalized-ads-switch');
        this._personalized3rdPartySwitch = this._container.querySelector('#personalized-ads-3rd-party-switch');
    }
    show() {
        const permissions = this._userPrivacyManager.getUserPrivacyPermissions();
        this._personalizedExpSwitch.checked = permissions.gameExp;
        this._personalizedAdsSwitch.checked = permissions.ads;
        this._personalized3rdPartySwitch.checked = permissions.external;
        this.setSwitches();
    }
    isPersonalizedExperienceChecked() {
        return this._personalizedExpSwitch ? this._personalizedExpSwitch.checked : false;
    }
    isPersonalizedAdsChecked() {
        return this._personalizedAdsSwitch ? this._personalizedAdsSwitch.checked : false;
    }
    isAds3rdPartyChecked() {
        return this._personalized3rdPartySwitch ? this._personalized3rdPartySwitch.checked : false;
    }
    checkCheckboxes(checked) {
        if (this._personalizedExpSwitch && this._personalizedAdsSwitch && this._personalized3rdPartySwitch) {
            this._personalizedExpSwitch.checked = checked;
            this._personalizedAdsSwitch.checked = checked;
            this._personalized3rdPartySwitch.checked = checked;
            this.setSwitches();
        }
    }
    setSwitches() {
        if (!this._personalizedAdsSwitch.checked) {
            this._personalized3rdPartySwitch.checked = false;
            this._container.querySelector('#third-party-switch').classList.add('disabled');
        }
        else {
            this._container.querySelector('#third-party-switch').classList.remove('disabled');
        }
    }
    onExpSwitchChange(event) {
        event.preventDefault();
        this._handlers.forEach(handler => handler.onSwitchGroupSelectionChange());
    }
    onAdsSwitchChange(event) {
        event.preventDefault();
        this.setSwitches();
        this._handlers.forEach(handler => handler.onSwitchGroupSelectionChange());
    }
    on3rdPartySwitchChange(event) {
        event.preventDefault();
        this._handlers.forEach(handler => handler.onSwitchGroupSelectionChange());
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUGVyc29uYWxpemF0aW9uU3dpdGNoR3JvdXAuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9zcmMvdHMvQWRzL1ZpZXdzL1ByaXZhY3kvUGVyc29uYWxpemF0aW9uU3dpdGNoR3JvdXAudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFFLElBQUksRUFBRSxNQUFNLGlCQUFpQixDQUFDO0FBQ3ZDLE9BQU8sbUJBQW1CLE1BQU0sZ0RBQWdELENBQUM7QUFDakYsT0FBTyxFQUFFLFFBQVEsRUFBRSxNQUFNLHlCQUF5QixDQUFDO0FBSW5ELE9BQU8sRUFBRSxtQkFBbUIsRUFBRSxNQUFNLDZCQUE2QixDQUFDO0FBTWxFLE1BQU0sT0FBTywwQkFBMkIsU0FBUSxJQUF3QztJQVFwRixZQUFZLFFBQWtCLEVBQUUsa0JBQXNDLEVBQUUsUUFBZ0I7UUFDcEYsS0FBSyxDQUFDLFFBQVEsRUFBRSw4QkFBOEIsQ0FBQyxDQUFDO1FBRWhELElBQUksQ0FBQyxtQkFBbUIsR0FBRyxrQkFBa0IsQ0FBQztRQUU5QyxJQUFJLENBQUMsU0FBUyxHQUFHLElBQUksUUFBUSxDQUFDLG1CQUFtQixFQUFFLElBQUksbUJBQW1CLENBQUMsUUFBUSxFQUFFLFNBQVMsRUFBRSxrQkFBa0IsQ0FBQyxpQkFBaUIsRUFBRSxDQUFDLENBQUMsQ0FBQztRQUV6SSxJQUFJLENBQUMsU0FBUyxHQUFHO1lBQ2I7Z0JBQ0ksS0FBSyxFQUFFLFFBQVE7Z0JBQ2YsUUFBUSxFQUFFLENBQUMsS0FBWSxFQUFFLEVBQUUsQ0FBQyxJQUFJLENBQUMsaUJBQWlCLENBQUMsS0FBSyxDQUFDO2dCQUN6RCxRQUFRLEVBQUUsaUNBQWlDO2FBQzlDO1lBQ0Q7Z0JBQ0ksS0FBSyxFQUFFLFFBQVE7Z0JBQ2YsUUFBUSxFQUFFLENBQUMsS0FBWSxFQUFFLEVBQUUsQ0FBQyxJQUFJLENBQUMsaUJBQWlCLENBQUMsS0FBSyxDQUFDO2dCQUN6RCxRQUFRLEVBQUUs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