import { View } from 'Core/Views/View';
import { Platform } from 'Core/Constants/Platform';
import { CaptchaGridItem, IGridItemClickedListener } from 'Ads/Views/Privacy/CaptchaGridItem';
import { Template } from 'Core/Utilities/Template';

import CaptchaTemplate from 'html/consent/captcha.html';
import { Localization } from 'Core/Utilities/Localization';

export interface ICaptchaHandler {
    onItemSelected(url: string): void;
    onCloseEvent(): void;

}
export class Captcha extends View<ICaptchaHandler> implements IGridItemClickedListener {

    private _gridItems: CaptchaGridItem[] = [];

    constructor(platform: Platform, language: string, urls: string[]) {
        super(platform, 'privacy-captcha', false);

        this._template = new Template(CaptchaTemplate, new Localization(language, 'privacy'));

        this._gridItems = this.createGridItems(urls);

        this._bindings = [
            {
                event: 'click',
                listener: (event: Event) => this.onCloseEvent(event)
            },
            {
                event: 'click',
                listener: (event: Event) => event.stopPropagation(),
                selector: '.privacy-captcha-container'
            }
        ];
    }

    public resetElements(urls: string[]): void {
        if (urls.length === this._gridItems.length) {
            for (const [index, value] of urls.entries()) {
                if (this._gridItems[index]) {
                    this._gridItems[index].resetElement(value);
                }
            }
        }

        if (this.container()) {
            const spinner = <HTMLElement> this.container().querySelector('.privacy-captcha-spinner-container');
            spinner.classList.remove('show');
        }
    }

    public render(): void {
        super.render();

        const gridItemContainer = <HTMLElement> this.container().querySelector('.privacy-captcha-grid');

        for (const item of this._gridItems) {
            gridItemContainer.appendChild(item.getElement());
        }
    }

    private createGridItems(urls: string[]): CaptchaGridItem[] {

        this._gridItems = [];

        for (const [index, value] of urls.entries()) {
            const gridItem = new CaptchaGridItem(`captcha-grid-item-${index}`, value, this);
            this._gridItems.push(gridItem);
        }
        return this._gridItems;

    }

    public onGridItemClick(url: string): void {
        const spinner = <HTMLElement> this.container().querySelector('.privacy-captcha-spinner-container');
        spinner.classList.add('show');

        this._handlers.forEach(handler => handler.onItemSelected(url));
    }

    private onCloseEvent(event: Event): void {
        event.preventDefault();

        this.hide();
        this._handlers.forEach(handler => handler.onCloseEvent());

    }
}
