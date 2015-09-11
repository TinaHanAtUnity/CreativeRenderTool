// disable no-empty until we have abstract classes
/* tslint:disable:no-empty */
import Observable from 'Utilities/Observable';

export default class VideoPlayer extends Observable {
    public prepare(url: string): void {}
    public play(): void {}
    public pause(): void {}
    public seekTo(time: number, callback: Function): void {}
}
