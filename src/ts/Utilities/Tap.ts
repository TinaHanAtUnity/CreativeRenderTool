export class Tap {

    private static _moveTolerance = 10;

    private _element: HTMLElement;
    private _moved: boolean;
    private _startX: number;
    private _startY: number;

    private _onTouchMoveListener: (ev: TouchEvent) => any;
    private _onTouchEndListener: (ev: TouchEvent) => any;
    private _onTouchCancelListener: (ev: TouchEvent) => any;

    constructor(element: HTMLElement) {
        this._element = element;
        this._moved = false;
        this._startX = 0;
        this._startY = 0;
        this._element.addEventListener('touchstart', (event) => this.onTouchStart(event), false);
    }

    private onTouchStart(event: TouchEvent) {
        this._onTouchMoveListener = (event) => this.onTouchMove(event);
        this._onTouchEndListener = (event) => this.onTouchEnd(event);
        this._onTouchCancelListener = (event) => this.onTouchCancel(event);
        this._element.addEventListener('touchmove', this._onTouchMoveListener, false);
        this._element.addEventListener('touchend', this._onTouchEndListener, false);
        this._element.addEventListener('touchcancel', this._onTouchCancelListener, false);
        this._moved = false;
        this._startX = event.touches[0].clientX;
        this._startY = event.touches[0].clientY;
    }

    private onTouchMove(event: TouchEvent) {
        let x = event.touches[0].clientX;
        let y = event.touches[0].clientY;
        if(Math.abs(x - this._startX) > Tap._moveTolerance || Math.abs(y - this._startY) > Tap._moveTolerance) {
            this._moved = true;
        }
    }

    private onTouchEnd(event: TouchEvent) {
        this._element.removeEventListener('touchmove', this._onTouchMoveListener, false);
        this._element.removeEventListener('touchend', this._onTouchEndListener, false);
        this._element.removeEventListener('touchcancel', this._onTouchCancelListener, false);
        this._onTouchMoveListener = undefined;
        this._onTouchEndListener = undefined;
        this._onTouchCancelListener = undefined;

        if(!this._moved) {
            let fakeEvent = new MouseEvent('click', {
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
