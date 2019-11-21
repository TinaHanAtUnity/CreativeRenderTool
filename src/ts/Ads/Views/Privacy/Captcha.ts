import { View } from 'Core/Views/View';
import { Platform } from 'Core/Constants/Platform';
import { CaptchaGridItem, IGridItemClickedListener } from 'Ads/Views/Privacy/CaptchaGridItem';
import { Template } from 'Core/Utilities/Template';

import CaptchaTemplate from 'html/consent/captcha.html';

export class Captcha extends View<{}> implements IGridItemClickedListener {

    private _urls: string[];

    constructor(platform: Platform) {
        super(platform, 'privacy-captcha', false);

        this._template = new Template(CaptchaTemplate);

        this._bindings = [
        ];
    }

    public setElements(urls: string[]): void {
        this._urls = urls;
    }

    public render(): void {
        super.render();

        const gridItemContainer = <HTMLElement>this.container().querySelector('.privacy-captcha-grid');

        for (const item of this.getGridItems()) {
            gridItemContainer.appendChild(item.getElement());
        }
    }

    private getGridItems(): CaptchaGridItem[] {

        const elements: CaptchaGridItem[] = [];

        for (const [index, value] of this._urls.entries()) {
            const gridItem = new CaptchaGridItem(`captcha-grid-item-${index}`, value, this);
            elements.push(gridItem);
        }
        return elements;

    }

    public onGridItemClick(url: string): void {
        console.log(url);

        this.hide();
    }
}
