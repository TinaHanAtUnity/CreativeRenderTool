export class Swipe {

    private static _moveTolerance = 75;

    private _element: HTMLElement;
    private _startX: number;
    private _startY: number;

    private _onTouchEndListener: ((event: TouchEvent) => unknown);
    private _onTouchCancelListener: ((event: TouchEvent) => unknown);
    private _onTouchMoveListener: ((event: TouchEvent) => unknown);

    constructor(element: HTMLElement) {
        this._element = element;
        this._startX = 0;
        this._startY = 0;
        this._element.addEventListener('touchstart', (event) => this.onTouchStart(event), false);
    }

    private onTouchStart(event: TouchEvent) {
        this._onTouchEndListener = (touchEvent) => this.onTouchEnd(touchEvent);
        this._onTouchCancelListener = (touchEvent) => this.onTouchCancel(touchEvent);
        this._onTouchMoveListener = (touchEvent) => this.onTouchMove(touchEvent);
        this._element.addEventListener('touchend', this._onTouchEndListener, false);
        this._element.addEventListener('touchcancel', this._onTouchCancelListener, false);
        this._element.addEventListener('touchmove', this._onTouchMoveListener, false);
        this._startX = event.touches[0].clientX;
        this._startY = event.touches[0].clientY;
    }

    private onTouchEnd(event: TouchEvent) {
        this._element.removeEventListener('touchend', this._onTouchEndListener, false);
        this._element.removeEventListener('touchcancel', this._onTouchCancelListener, false);
        this._element.removeEventListener('touchmove', this._onTouchCancelListener, false);

        const endX = event.changedTouches[0].clientX;
        const endY = event.changedTouches[0].clientY;

        const xDiff = this._startX - endX;
        const yDiff = this._startY - endY;

        if(Math.abs(xDiff) > Math.abs(yDiff)) {
            if (Math.abs(xDiff) > Swipe._moveTolerance) {
                // left or right swipe
                const swipeEvent = document.createEvent('MouseEvent');
                swipeEvent.initMouseEvent('swipe', true, true, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);

                event.stopPropagation();
                if(event.target && !event.target.dispatchEvent(swipeEvent)) {
                    event.preventDefault();
                }
            }
        }

        this._startX = 0;
        this._startY = 0;
    }

    private onTouchCancel(event: TouchEvent) {
        this._startX = 0;
        this._startY = 0;
    }

    private onTouchMove(event: TouchEvent) {
        event.preventDefault();
    }
}
