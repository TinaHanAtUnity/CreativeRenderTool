import { IObserver } from 'IObserver';

type Observers = { [event: string]: IObserver[] };

export class Observable {

    private _observers: Observers = {};

    public subscribe(event: string, observer: IObserver): IObserver {
        if(!this._observers[event]) {
            this._observers[event] = [];
        }
        this._observers[event].push(observer);
        return observer;
    }

    public unsubscribe(event: string, observer: IObserver): void {
        if(this._observers[event]) {
            this._observers[event] = this._observers[event].filter(storedObserver => storedObserver !== observer);
        }
    }

    protected trigger(event: string, ...parameters: any[]): void {
        if(this._observers[event]) {
            this._observers[event].forEach(observer => {
                try {
                    observer.apply(undefined, parameters);
                } catch(error) {
                    console.log(error);
                }
            });
        }
    }
}
