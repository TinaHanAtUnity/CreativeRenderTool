import { Swipe } from 'Core/Utilities/Swipe';

export class UpSwipe extends Swipe {
    protected static _moveTolerance = 100;

    constructor(element: HTMLElement) {
        super(element);
    }

    protected isSwipeEvent(startX: number, startY: number, endX: number, endY: number): boolean {
        const xDiff = startX - endX;
        const yDiff = startY - endY;
        const isSwipeUp = Math.abs(yDiff) > Math.abs(xDiff) && yDiff > 0;
        const isAboveTolerance = Math.abs(yDiff) > Swipe._moveTolerance;

        return isSwipeUp && isAboveTolerance;
    }

    protected getEventType(): string {
        return 'swipeup';
    }
}
