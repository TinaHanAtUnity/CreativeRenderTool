import { Swipe } from 'Core/Utilities/Swipe';
export class HorizontalSwipe extends Swipe {
    constructor(element) {
        super(element);
    }
    isSwipeEvent(startX, startY, endX, endY) {
        const xDiff = startX - endX;
        const yDiff = startY - endY;
        if (Math.abs(xDiff) > Swipe._moveTolerance && Math.abs(xDiff) > Math.abs(yDiff)) {
            return true;
        }
        return false;
    }
    getEventType() {
        return 'swipe';
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiSG9yaXpvbnRhbFN3aXBlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vc3JjL3RzL0NvcmUvVXRpbGl0aWVzL0hvcml6b250YWxTd2lwZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUUsS0FBSyxFQUFFLE1BQU0sc0JBQXNCLENBQUM7QUFFN0MsTUFBTSxPQUFPLGVBQWdCLFNBQVEsS0FBSztJQUV0QyxZQUFZLE9BQW9CO1FBQzVCLEtBQUssQ0FBQyxPQUFPLENBQUMsQ0FBQztJQUNuQixDQUFDO0lBRVMsWUFBWSxDQUFDLE1BQWMsRUFBRSxNQUFjLEVBQUUsSUFBWSxFQUFFLElBQVk7UUFDN0UsTUFBTSxLQUFLLEdBQUcsTUFBTSxHQUFHLElBQUksQ0FBQztRQUM1QixNQUFNLEtBQUssR0FBRyxNQUFNLEdBQUcsSUFBSSxDQUFDO1FBRTVCLElBQUksSUFBSSxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsR0FBRyxLQUFLLENBQUMsY0FBYyxJQUFJLElBQUksQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsRUFBRTtZQUM3RSxPQUFPLElBQUksQ0FBQztTQUNmO1FBRUQsT0FBTyxLQUFLLENBQUM7SUFDakIsQ0FBQztJQUVTLFlBQVk7UUFDbEIsT0FBTyxPQUFPLENBQUM7SUFDbkIsQ0FBQztDQUNKIn0=