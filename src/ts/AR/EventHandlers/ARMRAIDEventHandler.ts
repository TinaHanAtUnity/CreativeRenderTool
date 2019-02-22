import { PerformanceMRAIDEventHandler } from 'MRAID/EventHandlers/PerformanceMRAIDEventHandler';

export class ARMRAIDEventHandler extends PerformanceMRAIDEventHandler {

    public onPlayableAnalyticsEvent(timeFromShow: number, timeFromPlayableStart: number, backgroundTime: number, event: string, eventData: unknown): void {
        super.onPlayableAnalyticsEvent(timeFromShow, timeFromPlayableStart, backgroundTime, 'ar_' + event, eventData);
    }
}
