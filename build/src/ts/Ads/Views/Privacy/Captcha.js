import { View } from 'Core/Views/View';
import { CaptchaGridItem } from 'Ads/Views/Privacy/CaptchaGridItem';
import { Template } from 'Core/Utilities/Template';
import CaptchaTemplate from 'html/consent/captcha.html';
import { Localization } from 'Core/Utilities/Localization';
import { CaptchaEvent, PrivacyMetrics } from 'Privacy/PrivacyMetrics';
export class Captcha extends View {
    constructor(platform, language, urls) {
        super(platform, 'privacy-captcha', false);
        this._gridItems = [];
        this._template = new Template(CaptchaTemplate, new Localization(language, 'privacy'));
        this._gridItems = this.createGridItems(urls);
        this._bindings = [
            {
                event: 'click',
                listener: (event) => this.onCloseEvent(event)
            },
            {
                event: 'click',
                listener: (event) => event.stopPropagation(),
                selector: '.privacy-captcha-container'
            }
        ];
    }
    resetElements(urls) {
        if (urls.length === this._gridItems.length) {
            for (const [index, value] of urls.entries()) {
                if (this._gridItems[index]) {
                    this._gridItems[index].resetElement(value);
                }
            }
        }
        if (this.container()) {
            const spinner = this.container().querySelector('.privacy-captcha-spinner-container');
            spinner.classList.remove('show');
        }
    }
    showTryAgainMessage() {
        if (this.container()) {
            this.container().classList.add('show-retry-message');
        }
    }
    render() {
        super.render();
        const gridItemContainer = this.container().querySelector('.privacy-captcha-grid');
        for (const item of this._gridItems) {
            gridItemContainer.appendChild(item.getElement());
        }
    }
    show() {
        super.show();
        if (this.container()) {
            this.container().classList.remove('show-retry-message');
        }
    }
    createGridItems(urls) {
        this._gridItems = [];
        for (const [index, value] of urls.entries()) {
            const gridItem = new CaptchaGridItem(`captcha-grid-item-${index}`, value, this);
            this._gridItems.push(gridItem);
        }
        return this._gridItems;
    }
    onGridItemClick(url) {
        this.container().classList.remove('show-retry-message');
        const spinner = this.container().querySelector('.privacy-captcha-spinner-container');
        spinner.classList.add('show');
        this._handlers.forEach(handler => handler.onItemSelected(url));
    }
    onCloseEvent(event) {
        event.preventDefault();
        PrivacyMetrics.trigger(CaptchaEvent.REQUEST_SCREEN_CLOSE);
        this.hide();
        this._handlers.forEach(handler => handler.onCloseEvent());
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQ2FwdGNoYS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3NyYy90cy9BZHMvVmlld3MvUHJpdmFjeS9DYXB0Y2hhLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBRSxJQUFJLEVBQUUsTUFBTSxpQkFBaUIsQ0FBQztBQUV2QyxPQUFPLEVBQUUsZUFBZSxFQUE0QixNQUFNLG1DQUFtQyxDQUFDO0FBQzlGLE9BQU8sRUFBRSxRQUFRLEVBQUUsTUFBTSx5QkFBeUIsQ0FBQztBQUVuRCxPQUFPLGVBQWUsTUFBTSwyQkFBMkIsQ0FBQztBQUN4RCxPQUFPLEVBQUUsWUFBWSxFQUFFLE1BQU0sNkJBQTZCLENBQUM7QUFDM0QsT0FBTyxFQUFFLFlBQVksRUFBRSxjQUFjLEVBQUUsTUFBTSx3QkFBd0IsQ0FBQztBQU90RSxNQUFNLE9BQU8sT0FBUSxTQUFRLElBQXFCO0lBSTlDLFlBQVksUUFBa0IsRUFBRSxRQUFnQixFQUFFLElBQWM7UUFDNUQsS0FBSyxDQUFDLFFBQVEsRUFBRSxpQkFBaUIsRUFBRSxLQUFLLENBQUMsQ0FBQztRQUh0QyxlQUFVLEdBQXNCLEVBQUUsQ0FBQztRQUt2QyxJQUFJLENBQUMsU0FBUyxHQUFHLElBQUksUUFBUSxDQUFDLGVBQWUsRUFBRSxJQUFJLFlBQVksQ0FBQyxRQUFRLEVBQUUsU0FBUyxDQUFDLENBQUMsQ0FBQztRQUV0RixJQUFJLENBQUMsVUFBVSxHQUFHLElBQUksQ0FBQyxlQUFlLENBQUMsSUFBSSxDQUFDLENBQUM7UUFFN0MsSUFBSSxDQUFDLFNBQVMsR0FBRztZQUNiO2dCQUNJLEtBQUssRUFBRSxPQUFPO2dCQUNkLFFBQVEsRUFBRSxDQUFDLEtBQVksRUFBRSxFQUFFLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxLQUFLLENBQUM7YUFDdkQ7WUFDRDtnQkFDSSxLQUFLLEVBQUUsT0FBTztnQkFDZCxRQUFRLEVBQUUsQ0FBQyxLQUFZLEVBQUUsRUFBRSxDQUFDLEtBQUssQ0FBQyxlQUFlLEVBQUU7Z0JBQ25ELFFBQVEsRUFBRSw0QkFBNEI7YUFDekM7U0FDSixDQUFDO0lBQ04sQ0FBQztJQUVNLGFBQWEsQ0FBQyxJQUFjO1FBQy9CLElBQUksSUFBSSxDQUFDLE1BQU0sS0FBSyxJQUFJLENBQUMsVUFBVSxDQUFDLE1BQU0sRUFBRTtZQUN4QyxLQUFLLE1BQU0sQ0FBQyxLQUFLLEVBQUUsS0FBSyxDQUFDLElBQUksSUFBSSxDQUFDLE9BQU8sRUFBRSxFQUFFO2dCQUN6QyxJQUFJLElBQUksQ0FBQyxVQUFVLENBQUMsS0FBSyxDQUFDLEVBQUU7b0JBQ3hCLElBQUksQ0FBQyxVQUFVLENBQUMsS0FBSyxDQUFDLENBQUMsWUFBWSxDQUFDLEtBQUssQ0FBQyxDQUFDO2lCQUM5QzthQUNKO1NBQ0o7UUFFRCxJQUFJLElBQUksQ0FBQyxTQUFTLEVBQUUsRUFBRTtZQUNsQixNQUFNLE9BQU8sR0FBaUIsSUFBSSxDQUFDLFNBQVMsRUFBRSxDQUFDLGFBQWEsQ0FBQyxvQ0FBb0MsQ0FBQyxDQUFDO1lBQ25HLE9BQU8sQ0FBQyxTQUFTLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxDQUFDO1NBQ3BDO0lBQ0wsQ0FBQztJQUVNLG1CQUFtQjtRQUN0QixJQUFJLElBQUksQ0FBQyxTQUFTLEVBQUUsRUFBRTtZQUNsQixJQUFJLENBQUMsU0FBUyxFQUFFLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxvQkFBb0IsQ0FBQyxDQUFDO1NBQ3hEO0lBQ0wsQ0FBQztJQUVNLE1BQU07UUFDVCxLQUFLLENBQUMsTUFBTSxFQUFFLENBQUM7UUFFZixNQUFNLGlCQUFpQixHQUFpQixJQUFJLENBQUMsU0FBUyxFQUFFLENBQUMsYUFBYSxDQUFDLHVCQUF1QixDQUFDLENBQUM7UUFFaEcsS0FBSyxNQUFNLElBQUksSUFBSSxJQUFJLENBQUMsVUFBVSxFQUFFO1lBQ2hDLGlCQUFpQixDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsVUFBVSxFQUFFLENBQUMsQ0FBQztTQUNwRDtJQUNMLENBQUM7SUFFTSxJQUFJO1FBQ1AsS0FBSyxDQUFDLElBQUksRUFBRSxDQUFDO1FBRWIsSUFBSSxJQUFJLENBQUMsU0FBUyxFQUFFLEVBQUU7WUFDbEIsSUFBSSxDQUFDLFNBQVMsRUFBRSxDQUFDLFNBQVMsQ0FBQyxNQUFNLENBQUMsb0JBQW9CLENBQUMsQ0FBQztTQUMzRDtJQUNMLENBQUM7SUFFTyxlQUFlLENBQUMsSUFBYztRQUVsQyxJQUFJLENBQUMsVUFBVSxHQUFHLEVBQUUsQ0FBQztRQUVyQixLQUFLLE1BQU0sQ0FBQyxLQUFLLEVBQUUsS0FBSyxDQUFDLElBQUksSUFBSSxDQUFDLE9BQU8sRUFBRSxFQUFFO1lBQ3pDLE1BQU0sUUFBUSxHQUFHLElBQUksZUFBZSxDQUFDLHFCQUFxQixLQUFLLEVBQUUsRUFBRSxLQUFLLEVBQUUsSUFBSSxDQUFDLENBQUM7WUFDaEYsSUFBSSxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUM7U0FDbEM7UUFDRCxPQUFPLElBQUksQ0FBQyxVQUFVLENBQUM7SUFFM0IsQ0FBQztJQUVNLGVBQWUsQ0FBQyxHQUFXO1FBQzlCLElBQUksQ0FBQyxTQUFTLEVBQUUsQ0FBQyxTQUFTLENBQUMsTUFBTSxDQUFDLG9CQUFvQixDQUFDLENBQUM7UUFFeEQsTUFBTSxPQUFPLEdBQWlCLElBQUksQ0FBQyxTQUFTLEVBQUUsQ0FBQyxhQUFhLENBQUMsb0NBQW9DLENBQUMsQ0FBQztRQUNuRyxPQUFPLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsQ0FBQztRQUU5QixJQUFJLENBQUMsU0FBUyxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsRUFBRSxDQUFDLE9BQU8sQ0FBQyxjQUFjLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztJQUNuRSxDQUFDO0lBRU8sWUFBWSxDQUFDLEtBQVk7UUFDN0IsS0FBSyxDQUFDLGNBQWMsRUFBRSxDQUFDO1FBRXZCLGNBQWMsQ0FBQyxPQUFPLENBQUMsWUFBWSxDQUFDLG9CQUFvQixDQUFDLENBQUM7UUFDMUQsSUFBSSxDQUFDLElBQUksRUFBRSxDQUFDO1FBQ1osSUFBSSxDQUFDLFNBQVMsQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQyxPQUFPLENBQUMsWUFBWSxFQUFFLENBQUMsQ0FBQztJQUU5RCxDQUFDO0NBQ0oifQ==