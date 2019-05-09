import { PerformanceEndScreen } from 'Performance/Views/PerformanceEndScreen';
import SquareEndScreenTemplate from 'html/RedesignedSquareEndScreen.html';
import EndScreenTemplate from 'html/RedesignedEndScreen.html';

const SQUARE_END_SCREEN = 'square-end-screen';

export class RedesignedPerformanceEndscreen extends PerformanceEndScreen {
    protected getTemplate() {
        if (this.getEndscreenAlt() === SQUARE_END_SCREEN) {
            return SquareEndScreenTemplate;
        }

        return EndScreenTemplate;
    }

    public render(): void {
        super.render();
        document.documentElement.classList.add('accessible-close-button');
    }
}
