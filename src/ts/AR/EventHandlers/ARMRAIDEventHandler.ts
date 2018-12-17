import { PlayableEventHandler } from 'MRAID/EventHandlers/PlayableEventHandler';

export class ARMRAIDEventHandler extends PlayableEventHandler {

    public onPlayableAnalyticsEvent(timeFromShow: number, timeFromPlayableStart: number, backgroundTime: number, event: string, eventData: unknown): void {
        super.onPlayableAnalyticsEvent(timeFromShow, timeFromPlayableStart, backgroundTime, 'ar_' + event, eventData);
    }
}
