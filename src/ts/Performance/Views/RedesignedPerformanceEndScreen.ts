import { PerformanceEndScreen } from 'Performance/Views/PerformanceEndScreen';
import SquareEndScreenTemplate from 'html/RedesignedSquareEndScreen.html';

const SQUARE_END_SCREEN = 'square-end-screen';

export class RedesignedPerformanceEndscreen extends PerformanceEndScreen {
    protected getTemplate() {
        if (this.getEndscreenAlt() === SQUARE_END_SCREEN) {
            return SquareEndScreenTemplate;
        }

        return super.getTemplate();
    }
}
