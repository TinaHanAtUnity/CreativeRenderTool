import { PerformanceEndScreen } from 'Performance/Views/PerformanceEndScreen';

export class PerformanceEndScreenDoubleShadowClose extends PerformanceEndScreen {
    public render(): void {
        super.render();

        const iconClose = this.container().querySelector('#end-screen .icon-close');
        if (iconClose) {
            iconClose.classList.add('icon-close-double-shadow');
        }
    }
}
