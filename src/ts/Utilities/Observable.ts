import Observer = require('Observer');

class Observable {

    private _observers = {};

    subscribe(category: string, observer: Observer) {
        if(!this._observers[category]) {
            this._observers[category] = [];
        }
        this._observers[category].push(observer);
    }

    unsubscribe(category: string, observer: Observer) {
        let observers = this._observers[category];
        if(observers) {
            let index = observers.indexOf(observer);
            if(index != -1) {
                observers.splice(index, 1);
            }
        }
    }

    trigger(category: string, id: string, ...parameters) {
        let observers = this._observers[category];
        if(observers) {
            parameters.unshift(id);
            observers.forEach((observer: Observer) => {
                observer.trigger.apply(observer, parameters);
            });
        }
    }
}

export = Observable;