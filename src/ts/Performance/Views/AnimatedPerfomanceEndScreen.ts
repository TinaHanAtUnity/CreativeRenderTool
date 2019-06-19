import { PerformanceEndScreen } from 'Performance/Views/PerformanceEndScreen';

export class AnimatedPerfomanceEndScreen extends PerformanceEndScreen {
    protected onCloseEvent(event: Event): void {
        if (this._container.classList.contains('on-show')) {
            super.onCloseEvent(event);
        } else {
            event.preventDefault();
            return;
        }
    }

    protected onDownloadEvent(event: Event): void {
        if (this._container.classList.contains('on-show')) {
            super.onDownloadEvent(event);
        } else {
            event.preventDefault();
            return;
        }
    }
}
