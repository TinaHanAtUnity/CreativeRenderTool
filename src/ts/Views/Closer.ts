import { View } from 'Views/View';
import { NativeBridge } from 'Native/NativeBridge';
import { Placement } from 'Models/Placement';

import CloserTemplate from 'html/closer.html';
import { Template } from 'Utilities/Template';

export interface ICloseHandler {
    onClose(skipped: boolean): void;
}

export class Closer extends View<ICloseHandler> {

    private _placement: Placement;
    private _allowClose: boolean;
    private _canReward = false;

    private _progressElement: HTMLElement;

    constructor(nativeBridge: NativeBridge, placement: Placement) {
        super(nativeBridge, 'closer');
        this._template = new Template(CloserTemplate);
        this._placement = placement;
        this._bindings = [{
            event: 'click',
            selector: '.close-region',
            listener: () => this.onCloseClick()
        }];
    }

    public update(progress: number, total: number) {
        if (progress >= (total * 0.75)) {
            this._canReward = true;
        }

        total = this._placement.allowSkip() ? this._placement.allowSkipInSeconds() : total;
        const secondsLeft = this.clampLower(Math.floor(total - progress), 0);
        let progressFraction = progress / total;
        if (secondsLeft <= 0) {
            this._allowClose = true;
        }
        progressFraction = this.clampHigher(progressFraction, 1);
        this.updateCircle(progressFraction);
    }

    private updateCircle(fraction: number) {
        const wrapperElement = <HTMLElement>this._container.querySelector('.progress-wrapper');
        const leftCircleElement = <HTMLElement>this._container.querySelector('.circle-left');
        const rightCircleElement = <HTMLElement>this._container.querySelector('.circle-right');

        const degrees = fraction * 360;
        leftCircleElement.style.webkitTransform = 'rotate(' + degrees + 'deg)';

        if(fraction >= 0.5) {
            wrapperElement.style.webkitAnimationName = 'close-progress-wrapper';
            rightCircleElement.style.webkitAnimationName = 'right-spin';
        }
    }

    private onCloseClick() {
        if (this._allowClose) {
            this._handlers.forEach((h) => h.onClose(!this._canReward));
        }
    }

    private clampLower(number: number, floor: number): number {
        return number < floor ? floor : number;
    }

    private clampHigher(number: number, ceil: number): number {
        return number > ceil ? ceil : number;
    }
}
