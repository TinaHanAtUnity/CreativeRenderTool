export abstract class Swipe {

    protected static _moveTolerance = 75;

    private _element: HTMLElement;

    private _startX: number;
    private _startY: number;

    private _onTouchEndListener?: ((event: TouchEvent) => unknown);
    private _onTouchCancelListener?: ((event: TouchEvent) => unknown);
    private _onTouchMoveListener?: ((event: TouchEvent) => unknown);

    constructor(element: HTMLElement) {
        this._element = element;
        this._startX = 0;
        this._startY = 0;
        this._element.addEventListener('touchstart', (event) => this.onTouchStart(event), false);
    }

    protected abstract isSwipeEvent(startX: number, startY: number, endX: number, endY: number): boolean;

    protected abstract getEventType(): string;

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
        this._element.removeEventListener('touchend', this._onTouchEndListener!, false);
        this._element.removeEventListener('touchcancel', this._onTouchCancelListener!, false);
        this._element.removeEventListener('touchmove', this._onTouchMoveListener!, false);

        const endX = event.changedTouches[0].clientX;
        const endY = event.changedTouches[0].clientY;

        if (this.isSwipeEvent(this._startX, this._startY, endX, endY)) {
            const swipeEvent = document.createEvent('MouseEvent');
            swipeEvent.initMouseEvent(this.getEventType(), true, true, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);

            event.stopPropagation();
            if (event.target && !event.target.dispatchEvent(swipeEvent)) {
                event.preventDefault();
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
