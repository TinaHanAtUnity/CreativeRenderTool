export class Swipe {

    private static _moveTolerance = 75;

    private _element: HTMLElement;
    private _startX: number;
    private _startY: number;

    private _onTouchEndListener: ((event: TouchEvent) => any) | undefined;
    private _onTouchCancelListener: ((event: TouchEvent) => any) | undefined;

    constructor(element: HTMLElement) {
        this._element = element;
        this._startX = 0;
        this._startY = 0;
        this._element.addEventListener('touchstart', (event) => this.onTouchStart(event), false);
    }

    private onTouchStart(event: TouchEvent) {
        this._onTouchEndListener = (touchEvent) => this.onTouchEnd(touchEvent);
        this._onTouchCancelListener = (touchEvent) => this.onTouchCancel(touchEvent);
        this._element.addEventListener('touchend', this._onTouchEndListener, false);
        this._element.addEventListener('touchcancel', this._onTouchCancelListener, false);
        this._startX = event.touches[0].clientX;
        this._startY = event.touches[0].clientY;
    }

    private onTouchEnd(event: TouchEvent) {
        this._element.removeEventListener('touchend', this._onTouchEndListener, false);
        this._element.removeEventListener('touchcancel', this._onTouchCancelListener, false);
        this._onTouchEndListener = undefined;
        this._onTouchCancelListener = undefined;

        const endX = event.changedTouches[0].clientX;
        const endY = event.changedTouches[0].clientY;

        const xDiff = this._startX - endX;
        const yDiff = this._startY - endY;

        if(Math.abs( xDiff ) > Math.abs( yDiff ) ) {/*most significant*/
            if (Math.abs(xDiff) > Swipe._moveTolerance) {
                // left or right swipe
                const fakeEvent = new MouseEvent('swipe', {
                    view: window,
                    bubbles: true,
                    cancelable: true
                });

                event.stopPropagation();
                if(!event.target.dispatchEvent(fakeEvent)) {
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
}
