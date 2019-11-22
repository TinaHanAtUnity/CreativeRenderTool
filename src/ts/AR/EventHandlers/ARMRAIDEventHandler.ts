import { ProgrammaticMRAIDEventHandler } from 'MRAID/EventHandlers/ProgrammaticMRAIDEventHandler';

export class ARMRAIDEventHandler extends ProgrammaticMRAIDEventHandler {

    public onPlayableAnalyticsEvent(timeFromShow: number, timeFromPlayableStart: number, backgroundTime: number, event: string, eventData: unknown): void {
        super.onPlayableAnalyticsEvent(timeFromShow, timeFromPlayableStart, backgroundTime, 'ar_' + event, eventData);
    }
}
