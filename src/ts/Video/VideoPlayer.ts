import { Observable } from 'Utilities/Observable';
import { Double } from 'Utilities/Double';

export abstract class VideoPlayer extends Observable {
    public abstract prepare(url: string, volume: Double, callback?: Function): void;
    public abstract play(callback?: Function): void;
    public abstract pause(callback?: Function): void;
    public abstract seekTo(time: number, callback?: Function): void;
    public abstract getVolume(callback: Function): void;
    public abstract setVolume(volume: Double, callback?: Function): void;
}
