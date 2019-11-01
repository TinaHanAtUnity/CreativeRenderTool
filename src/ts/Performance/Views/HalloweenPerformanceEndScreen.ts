import { PerformanceEndScreen } from 'Performance/Views/PerformanceEndScreen';

export class HalloweenPerformanceEndScreen extends PerformanceEndScreen {

  public render(): void {
    super.render();

    this.container().classList.add('halloween-end-screen');
  }
}
