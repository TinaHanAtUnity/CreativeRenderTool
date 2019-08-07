import { PerformanceEndScreen } from 'Performance/Views/PerformanceEndScreen';

export class AnimatedDownloadButtonEndScreen extends PerformanceEndScreen {

    public render(): void {
        super.render();
        document.documentElement.classList.add('animated-download-button-end-screen');
    }
}
