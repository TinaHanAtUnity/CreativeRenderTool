import { Swipe } from 'Core/Utilities/Swipe';

export class HorizontalSwipe extends Swipe {

    constructor(element: HTMLElement) {
        super(element);
    }

    protected isSwipeEvent(startX: number, startY: number, endX: number, endY: number): boolean {
        const xDiff = startX - endX;
        const yDiff = startY - endY;

        if (Math.abs(xDiff) > Swipe._moveTolerance && Math.abs(xDiff) > Math.abs(yDiff)) {
            return true;
        }

        return false;
    }

    protected getEventType(): string {
        return 'swipe';
    }
}
