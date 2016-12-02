import { Observable0 } from 'Utilities/Observable';

export abstract class AdUnit {
    public onShow: Observable0 = new Observable0(); // ad unit becomes visible
    public onHide: Observable0 = new Observable0(); // ad unit becomes hidden
    public onSystemKill: Observable0 = new Observable0(); // ad unit killed by the system

    public abstract open(videoplayer: boolean, forceLandscape: boolean, disableBackbutton: boolean, options: any): Promise<void>;

    public abstract close(): Promise<void>;
}