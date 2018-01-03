export class Tap {

    private static _moveTolerance = 10;

    private _element: HTMLElement;
    private _moved: boolean;
    private _startX: number;
    private _startY: number;

    private _onTouchMoveListener: ((event: TouchEvent) => any) | undefined;
    private _onTouchEndListener: ((event: TouchEvent) => any) | undefined;
    private _onTouchCancelListener: ((event: TouchEvent) => any) | undefined;

    constructor(element: HTMLElement) {
        this._element = element;
        this._moved = false;
        this._startX = 0;
        this._startY = 0;
        this._element.addEventListener('touchstart', (event) => this.onTouchStart(event), false);
    }

    private onTouchStart(event: TouchEvent) {
        event.stopPropagation();
        event.preventDefault();

        this._onTouchMoveListener = (touchEvent) => this.onTouchMove(touchEvent);
        this._onTouchEndListener = (touchEvent) => this.onTouchEnd(touchEvent);
        this._onTouchCancelListener = (touchEvent) => this.onTouchCancel(touchEvent);
        this._element.addEventListener('touchmove', this._onTouchMoveListener, false);
        this._element.addEventListener('touchend', this._onTouchEndListener, false);
        this._element.addEventListener('touchcancel', this._onTouchCancelListener, false);
        this._moved = false;
        this._startX = event.touches[0].clientX;
        this._startY = event.touches[0].clientY;
    }

    private onTouchMove(event: TouchEvent) {
        const x = event.touches[0].clientX;
        const y = event.touches[0].clientY;
        if(Math.abs(x - this._startX) > Tap._moveTolerance || Math.abs(y - this._startY) > Tap._moveTolerance) {
            this._moved = true;
        }
    }

    private onTouchEnd(event: TouchEvent) {
        if(this._onTouchMoveListener && this._onTouchEndListener && this._onTouchCancelListener) {
            this._element.removeEventListener('touchmove', this._onTouchMoveListener, false);
            this._element.removeEventListener('touchend', this._onTouchEndListener, false);
            this._element.removeEventListener('touchcancel', this._onTouchCancelListener, false);
        }
        this._onTouchMoveListener = undefined;
        this._onTouchEndListener = undefined;
        this._onTouchCancelListener = undefined;

        if(!this._moved) {
            const fakeEvent = new MouseEvent('click', {
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

    private onTouchCancel(event: TouchEvent) {
        this._moved = false;
        this._startX = 0;
        this._startY = 0;
    }

}
