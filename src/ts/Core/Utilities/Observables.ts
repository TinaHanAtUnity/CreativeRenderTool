import { Observable0, Observable1, Observable2 } from 'Core/Utilities/Observable';
import { IObserver0, IObserver1, IObserver2 } from 'Core/Utilities/IObserver';

export class Observables {
    public static once(observable: Observable0, observer: IObserver0) {
        const wrapped = observable.subscribe(() => {
            observable.unsubscribe(wrapped);
            observer();
        });
        return wrapped;
    }
    public static once1<T1>(observable: Observable1<T1>, observer: IObserver1<T1>) {
        const wrapped = observable.subscribe((p1) => {
            observable.unsubscribe(wrapped);
            observer(p1);
        });
        return wrapped;
    }
    public static once2<T1, T2>(observable: Observable2<T1, T2>, observer: IObserver2<T1, T2>) {
        const wrapped = observable.subscribe((p1, p2) => {
            observable.unsubscribe(wrapped);
            observer(p1, p2);
        });
        return wrapped;
    }
}
