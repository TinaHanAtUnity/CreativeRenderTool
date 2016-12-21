import { Observable0 } from 'Utilities/Observable';

export abstract class AdUnit {
    public onShow: Observable0 = new Observable0(); // ad unit becomes visible
    public onSystemKill: Observable0 = new Observable0(); // ad unit killed by the system (Android only)
    public onSystemInterrupt: Observable0 = new Observable0(); // ad unit has been interrupted and video has been paused (iOS only)

    public abstract open(videoplayer: boolean, forceLandscape: boolean, disableBackbutton: boolean, options: any): Promise<void>;

    public abstract close(): Promise<void>;

    // currently open ad unit is only reconfigured to move from video playback to endscreen with unlocked orientation
    // in the future, when we add more options, this method should be updated to handle future use cases
    public abstract reconfigure(): Promise<any[]>;
}
