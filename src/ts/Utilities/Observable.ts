type Observers = { [event: string]: { [observer: string]: [Object, any[]][] } };

export class Observable {

    private _observers: Observers = {};

    public subscribe(event: string, self: Object, observer: string, ...parameters: any[]): void {
        let observers = this._observers[event];
        if(!observers) {
            this._observers[event] = {};
        }
        let objects = this._observers[event][observer];
        if(!objects) {
            this._observers[event][observer] = [];
        }
        this._observers[event][observer].push([self, parameters]);
    }

    public unsubscribe(event: string, self: Object, observer: string): void {
        let observers = this._observers[event];
        if(observers) {
            let objects = this._observers[event][observer];
            if(objects) {
                this._observers[event][observer] = objects.filter(pair => pair[0] !== self);
            }
        }
    }

    protected trigger(event: string, ...parameters: any[]): void {
        let observers = this._observers[event];
        if(observers) {
            Object.keys(observers).forEach(observer => {
                observers[observer].forEach(([self, storedParameters]) => {
                    try {
                        self[observer].apply(self, storedParameters.concat(parameters));
                    } catch(error) {
                        console.log(error);
                    }
                });
            });
        }
    }
}
