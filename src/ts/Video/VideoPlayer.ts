// disable no-empty until we have abstract classes
/* tslint:disable:no-empty */
import Observable from 'Utilities/Observable';

export abstract class VideoPlayer extends Observable {
    public abstract prepare(url: string): void;
    public abstract play(): void;
    public abstract pause(): void;
    public abstract seekTo(time: number, callback: Function): void;
}
