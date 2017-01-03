import { View } from 'Views/View';
import { Observable1 } from 'Utilities/Observable';

export abstract class AbstractVideoOverlay extends View {

    public static setAutoSkip(value: boolean) {
        AbstractVideoOverlay.AutoSkip = value;
    }

    protected static AutoSkip: boolean = false;

    public onSkip: Observable1<number> = new Observable1();
    public onMute: Observable1<boolean> = new Observable1();
    public onCallButton: Observable1<boolean> = new Observable1();

    public abstract setVideoProgress(value: number): void;

    public abstract setSpinnerEnabled(enabled: boolean): void;

    public abstract setSkipEnabled(enabled: boolean): void;

    public abstract setSkipDuration(value: number): void;

    public abstract setVideoDurationEnabled(enabled: boolean): void;

    public abstract setVideoDuration(value: number): void;

    public abstract setCallButtonVisible(value: boolean): void;

    public abstract setDebugMessageVisible(value: boolean): void;

    public abstract setDebugMessage(message: string): void;

    public abstract setMuteEnabled(enabled: boolean): void;

    public abstract isMuted(): boolean;

}
