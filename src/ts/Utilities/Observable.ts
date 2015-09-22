import { IObserver } from 'IObserver';

export default class Observable {

    private _observers: Object = {};

    public subscribe(category: string, observer: IObserver): void {
        if(!this._observers[category]) {
            this._observers[category] = [];
        }
        this._observers[category].push(observer);
    }

    public unsubscribe(category: string, observer: IObserver): void {
        let observers: IObserver[] = this._observers[category];
        if(observers) {
            let index: number = observers.indexOf(observer);
            if(index !== -1) {
                observers.splice(index, 1);
            }
        }
    }

    protected trigger(category: string, id: string, ...parameters: any[]): void {
        let observers: IObserver[] = this._observers[category];
        if(observers) {
            parameters.unshift(id);
            observers.forEach((observer: IObserver) => {
                observer.apply(observer, parameters);
            });
        }
    }
}
