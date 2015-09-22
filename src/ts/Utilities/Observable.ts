import { IObserver } from 'IObserver';

type StoredObservers = { [event: string]: IObserver[] };
type Observers = { [event: string]: IObserver };

export default class Observable {

    private _observers: StoredObservers = {};

    public subscribe(observers: Observers): void {
        for(let event in observers) {
            if(observers.hasOwnProperty(event)) {
                let observer: IObserver = observers[event];
                if(!this._observers[event]) {
                    this._observers[event] = [];
                }
                this._observers[event].push(observer);
            }
        }
    }

    protected trigger(event: string, ...parameters: any[]): void {
        let observers: IObserver[] = this._observers[event];
        if(observers) {
            observers.forEach((observer: IObserver) => {
                observer.apply(observer, parameters);
            });
        }
    }
}
