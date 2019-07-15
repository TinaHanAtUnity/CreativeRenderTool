import { MRAIDEventHandler } from 'MRAID/EventHandlers/MRAIDEventHandler';

export class ARMRAIDEventHandler extends MRAIDEventHandler {

    public onPlayableAnalyticsEvent(timeFromShow: number, timeFromPlayableStart: number, backgroundTime: number, event: string, eventData: unknown): void {
        super.onPlayableAnalyticsEvent(timeFromShow, timeFromPlayableStart, backgroundTime, 'ar_' + event, eventData);
    }
}
