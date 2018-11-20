import { View } from 'Core/Views/View';
import PrivacyRowItemContainerTemplate from 'html/consent/privacy-row-item-container.html';
import { Template } from 'Core/Utilities/Template';
import { Platform } from 'Core/Constants/Platform';

interface IPrivacyInfoContainerHandler {
}

export class PrivacyRowItemContainer extends View<IPrivacyInfoContainerHandler> {

    constructor(platform: Platform) {
        super(platform, 'privacy-row-item-container');

        this._template = new Template(PrivacyRowItemContainerTemplate);

        this._bindings = [
            {
                event: 'click',
                listener: (event: Event) => this.onWhatWeCollectEvent(event),
                selector: '.what-we-collect'
            },
            {
                event: 'click',
                listener: (event: Event) => this.onDataProtectionEvent(event),
                selector: '.data-protection'
            },
            {
                event: 'click',
                listener: (event: Event) => this.onThirdPartyEvent(event),
                selector: '.third-party'
            },
            {
                event: 'click',
                listener: (event: Event) => this.onPrivacyPolicyEvent(event),
                selector: '.privacy-policy'
            }
        ];
    }

    private onWhatWeCollectEvent(event: Event): void {
        event.preventDefault();
        // if (event.srcElement!.parentElement) {
        //     event.srcElement!.parentElement!.classList.add('show-description');
        // }
        const element = this._container.querySelector('.what-we-collect');
        this.toggleDescription(element);
    }

    private onDataProtectionEvent(event: Event): void {
        event.preventDefault();

        const element = this._container.querySelector('.data-protection');
        this.toggleDescription(element);
    }

    private onThirdPartyEvent(event: Event): void {
        event.preventDefault();

        const element = this._container.querySelector('.third-party');
        this.toggleDescription(element);
    }

    private onPrivacyPolicyEvent(event: Event): void {
        event.preventDefault();

        const element = this._container.querySelector('.privacy-policy');
        this.toggleDescription(element);
    }

    private toggleDescription(element: Element | null) {
        if (element && element.parentElement) {
            if (element.parentElement.classList.contains('show-description')) {
                element.parentElement.classList.remove('show-description');
            } else {
                element.parentElement.classList.add('show-description');
            }
        }
    }
}
