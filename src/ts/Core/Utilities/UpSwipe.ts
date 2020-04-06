import { Swipe } from 'Core/Utilities/Swipe';

export class UpSwipe extends Swipe {

    constructor(element: HTMLElement) {
        super(element);
    }

    protected isSwipeEvent(startX: number, startY: number, endX: number, endY: number): boolean {
        const xDiff = startX - endX;
        const yDiff = startY - endY;

        if (Math.abs(yDiff) > Swipe._moveTolerance) {
            if ((Math.abs(yDiff) > Math.abs(xDiff)) && (yDiff > 0)) {
                return true;
            }
        }

        return false;
    }

    protected getEventType(): string {
        return 'swipeup';
    }
}
