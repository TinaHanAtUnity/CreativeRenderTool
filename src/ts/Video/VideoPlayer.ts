import { Observable } from 'Utilities/Observable';
import { Double } from 'Utilities/Double';

export abstract class VideoPlayer extends Observable {
    public abstract prepare(url: string, volume: Double): Promise<any[]>;
    public abstract play(): Promise<any[]>;
    public abstract pause(): Promise<any[]>;
    public abstract seekTo(time: number): Promise<any[]>;
    public abstract getVolume(): Promise<any[]>;
    public abstract setVolume(volume: Double): Promise<any[]>;
}
