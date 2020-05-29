export class Tap {

    private static _moveTolerance = 10;

    private _element: HTMLElement;
    private _moved: boolean;
    private _startX: number;
    private _startY: number;

    private _onTouchMoveListener: ((event: TouchEvent) => unknown) | undefined;
    private _onTouchEndListener: ((event: TouchEvent) => unknown) | undefined;
    private _onTouchCancelListener: ((event: TouchEvent) => unknown) | undefined;
    private _supportsPassive = false; // indicate if the browser supports passive event listener

    constructor(element: HTMLElement) {
        this._element = element;
        this._moved = false;
        this._startX = 0;
        this._startY = 0;

        // Test via a getter in the options object to see if the passive property is accessed
        // Details can be found here: https://github.com/WICG/EventListenerOptions/blob/gh-pages/explainer.md
        try {
            const opts = Object.defineProperty({}, 'passive', {
                get: () => {
                    this._supportsPassive = true;
                }
            });
            document.addEventListener('testPassive', (event) => { this._supportsPassive = false; }, opts);
            document.removeEventListener('testPassive', (event) => { this._supportsPassive = false; }, opts);
        } catch (e) {
            this._supportsPassive = false;
        }

        // Use the above detect's results. passive applied if supported, capture will be false either way.
        this._element.addEventListener('touchstart', (event) => this.onTouchStart(event), this._supportsPassive ? { passive: false } : false);
    }

    public getTouchStartPosition() {
        return { startX: this._startX, startY: this._startY };
    }

    private onTouchStart(event: TouchEvent) {
        event.stopPropagation();
        event.preventDefault();

        this._onTouchMoveListener = (touchEvent) => this.onTouchMove(touchEvent);
        this._onTouchEndListener = (touchEvent) => this.onTouchEnd(touchEvent);
        this._onTouchCancelListener = (touchEvent) => this.onTouchCancel(touchEvent);
        this._element.addEventListener('touchmove', this._onTouchMoveListener, this._supportsPassive ? { passive: true } : false);
        this._element.addEventListener('touchend', this._onTouchEndListener, false);
        this._element.addEventListener('touchcancel', this._onTouchCancelListener, false);
        this._moved = false;
        this._startX = event.touches[0].clientX;
        this._startY = event.touches[0].clientY;
    }

    private onTouchMove(event: TouchEvent) {
        const x = event.touches[0].clientX;
        const y = event.touches[0].clientY;
        if (Math.abs(x - this._startX) > Tap._moveTolerance || Math.abs(y - this._startY) > Tap._moveTolerance) {
            this._moved = true;
        }
    }

    private onTouchEnd(event: TouchEvent) {
        if (this._onTouchMoveListener && this._onTouchEndListener && this._onTouchCancelListener) {
            this._element.removeEventListener('touchmove', this._onTouchMoveListener, false);
            this._element.removeEventListener('touchend', this._onTouchEndListener, false);
            this._element.removeEventListener('touchcancel', this._onTouchCancelListener, false);
        }
        this._onTouchMoveListener = undefined;
        this._onTouchEndListener = undefined;
        this._onTouchCancelListener = undefined;

        if (!this._moved) {
            const fakeEvent = new MouseEvent('click', {
                view: window,
                bubbles: true,
                cancelable: true
            });

            event.stopPropagation();
            if (event.target && !event.target.dispatchEvent(fakeEvent)) {
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
