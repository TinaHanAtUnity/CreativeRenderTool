export class Tap {
    constructor(element) {
        this._supportsPassive = false; // indicate if the browser supports passive event listener
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
        }
        catch (e) {
            this._supportsPassive = false;
        }
        // Use the above detect's results. passive applied if supported, capture will be false either way.
        // The passive property should always be false here,
        // since we send an extra fake click event inside touchEnd listener
        // so the touch event should be cancellable using preventDefault, otherwise duplicate click events will be fired.
        this._element.addEventListener('touchstart', (event) => this.onTouchStart(event), this._supportsPassive ? { passive: false } : false);
    }
    getTouchStartPosition() {
        return { startX: this._startX, startY: this._startY };
    }
    onTouchStart(event) {
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
    onTouchMove(event) {
        const x = event.touches[0].clientX;
        const y = event.touches[0].clientY;
        if (Math.abs(x - this._startX) > Tap._moveTolerance || Math.abs(y - this._startY) > Tap._moveTolerance) {
            this._moved = true;
        }
    }
    onTouchEnd(event) {
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
    onTouchCancel(event) {
        this._moved = false;
        this._startX = 0;
        this._startY = 0;
    }
}
Tap._moveTolerance = 10;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVGFwLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vc3JjL3RzL0NvcmUvVXRpbGl0aWVzL1RhcC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxNQUFNLE9BQU8sR0FBRztJQWNaLFlBQVksT0FBb0I7UUFGeEIscUJBQWdCLEdBQUcsS0FBSyxDQUFDLENBQUMsMERBQTBEO1FBR3hGLElBQUksQ0FBQyxRQUFRLEdBQUcsT0FBTyxDQUFDO1FBQ3hCLElBQUksQ0FBQyxNQUFNLEdBQUcsS0FBSyxDQUFDO1FBQ3BCLElBQUksQ0FBQyxPQUFPLEdBQUcsQ0FBQyxDQUFDO1FBQ2pCLElBQUksQ0FBQyxPQUFPLEdBQUcsQ0FBQyxDQUFDO1FBRWpCLHFGQUFxRjtRQUNyRixxR0FBcUc7UUFDckcsSUFBSTtZQUNBLE1BQU0sSUFBSSxHQUFHLE1BQU0sQ0FBQyxjQUFjLENBQUMsRUFBRSxFQUFFLFNBQVMsRUFBRTtnQkFDOUMsR0FBRyxFQUFFLEdBQUcsRUFBRTtvQkFDTixJQUFJLENBQUMsZ0JBQWdCLEdBQUcsSUFBSSxDQUFDO2dCQUNqQyxDQUFDO2FBQ0osQ0FBQyxDQUFDO1lBQ0gsUUFBUSxDQUFDLGdCQUFnQixDQUFDLGFBQWEsRUFBRSxDQUFDLEtBQUssRUFBRSxFQUFFLEdBQUcsSUFBSSxDQUFDLGdCQUFnQixHQUFHLEtBQUssQ0FBQyxDQUFDLENBQUMsRUFBRSxJQUFJLENBQUMsQ0FBQztZQUM5RixRQUFRLENBQUMsbUJBQW1CLENBQUMsYUFBYSxFQUFFLENBQUMsS0FBSyxFQUFFLEVBQUUsR0FBRyxJQUFJLENBQUMsZ0JBQWdCLEdBQUcsS0FBSyxDQUFDLENBQUMsQ0FBQyxFQUFFLElBQUksQ0FBQyxDQUFDO1NBQ3BHO1FBQUMsT0FBTyxDQUFDLEVBQUU7WUFDUixJQUFJLENBQUMsZ0JBQWdCLEdBQUcsS0FBSyxDQUFDO1NBQ2pDO1FBRUQsa0dBQWtHO1FBQ2xHLG9EQUFvRDtRQUNwRCxtRUFBbUU7UUFDbkUsaUhB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